/**
 * API.Bible client for Standard-tier translations: NIV / NASB / NLT / CSB.
 *
 * Uses scripture.api.bible v1.  Results are cached in the `chapters` table
 * with a 1-hour TTL (API.Bible rate limits are lower than ESV).
 *
 * Requires:
 *   API_BIBLE_KEY  — from api.scripture.api.bible
 *
 * Bible IDs reference https://scripture.api.bible/livedocs
 * (search for "bibles" endpoint to find IDs for each translation)
 */

import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible";
import { type ReadingChapter, type ReadingVerse } from "./types";
import type { ChapterRow } from "@/types/database";

const API_BIBLE_BASE = "https://api.scripture.api.bible/v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Official API.Bible identifiers for each supported translation.
 * These are stable across the API.
 */
export const API_BIBLE_IDS: Record<string, string> = {
  NIV: "78a9f6124f344018-01", // New International Version
  NASB: "f72b840c855f362c-04", // New American Standard Bible 1995
  NLT: "65eec8e0b60e656b-01", // New Living Translation
  CSB: "a556c5305ee15c3e-01", // Christian Standard Bible
};

const SUPPORTED = Object.keys(API_BIBLE_IDS);

export function isApiTranslation(code: string): boolean {
  return SUPPORTED.includes(code.toUpperCase());
}

/**
 * Convert USFM book code + chapter number to API.Bible chapter ID.
 * API.Bible uses IDs like "GEN.1", "1CO.3", etc.
 */
function toApiBibleChapterId(bookCode: string, chapter: number): string {
  // API.Bible uses 3-letter uppercase USFM codes unchanged for most books,
  // but NT books use standard USFM codes too.  GEN.1, JHN.3, REV.22, etc.
  return `${bookCode.toUpperCase()}.${chapter}`;
}

interface ApiBibleContentItem {
  type: string;
  number?: string;
  content?: string | ApiBibleContentItem[];
  items?: ApiBibleContentItem[];
  attrs?: Record<string, string>;
}

/**
 * Recursively extract verses from the API.Bible "content" tree structure.
 *
 * The API returns a deeply nested JSON structure where verses are nodes
 * with type="verse" and number=string.  Text content is in nested items.
 */
function extractVerses(content: ApiBibleContentItem[]): ReadingVerse[] {
  const verses: ReadingVerse[] = [];
  let currentParagraphStart = true;

  function extractText(items: ApiBibleContentItem[]): string {
    return items
      .map((item) => {
        if (typeof item === "string") return item;
        if (item.type === "text" && typeof item.content === "string")
          return item.content;
        if (Array.isArray(item.items)) return extractText(item.items);
        return "";
      })
      .join("")
      .replace(/\s+/g, " ")
      .trim();
  }

  function walk(items: ApiBibleContentItem[], newPara: boolean) {
    for (const item of items) {
      if (item.type === "para") {
        // A new paragraph block — all verses within it may be paragraph starts
        if (Array.isArray(item.items)) walk(item.items, true);
        currentParagraphStart = false;
        newPara = false;
      } else if (item.type === "verse") {
        const verseNum = parseInt(item.number ?? "0", 10);
        if (verseNum === 0) continue;
        const text = Array.isArray(item.items) ? extractText(item.items) : "";
        if (!text) continue;
        verses.push({
          verse: verseNum,
          text,
          paragraph_start: newPara || currentParagraphStart,
        });
        currentParagraphStart = false;
        newPara = false;
      } else if (Array.isArray(item.items)) {
        walk(item.items, newPara);
      }
    }
  }

  walk(content, true);
  verses.sort((a, b) => a.verse - b.verse);
  return verses;
}

/**
 * Fetch a chapter from API.Bible with caching.
 * Returns null for unsupported translations, missing API key, or API errors.
 */
export async function getApiBibleChapter(
  bookCode: string,
  chapter: number,
  translationCode: string
): Promise<ReadingChapter | null> {
  const code = translationCode.toUpperCase();
  const bibleId = API_BIBLE_IDS[code];
  if (!bibleId) return null;

  const book = getBook(bookCode.toUpperCase() as Parameters<typeof getBook>[0]);
  if (!book) return null;

  const apiKey = process.env.API_BIBLE_KEY;

  const supabase = await createClient();

  // ----- Check cache -----
  const { data: cached } = await supabase
    .from("chapters")
    .select("*")
    .eq("book", book.name)
    .eq("chapter", chapter)
    .eq("translation", code)
    .maybeSingle();

  if (cached) {
    const row = cached as unknown as ChapterRow;
    const notExpired = !row.expires_at || new Date(row.expires_at) > new Date();
    if (notExpired) {
      const verses = (row.text_json as ReadingVerse[]) ?? [];
      return {
        book_code: bookCode.toUpperCase(),
        book_name: book.name,
        chapter,
        translation: code,
        verses,
        attribution: null,
        cached_at: row.fetched_at,
        expires_at: row.expires_at,
      };
    }
  }

  // ----- Fetch from API.Bible -----
  if (!apiKey) {
    console.warn("[api-bible] API_BIBLE_KEY not configured.");
    return null;
  }

  const chapterId = toApiBibleChapterId(bookCode, chapter);
  const url = `${API_BIBLE_BASE}/bibles/${bibleId}/chapters/${chapterId}?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=true`;

  let verses: ReadingVerse[] = [];
  try {
    const res = await fetch(url, {
      headers: { "api-key": apiKey },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.error(
        `[api-bible] API error ${res.status} for ${chapterId} (${code})`
      );
      return null;
    }
    const json = (await res.json()) as {
      data?: { content?: ApiBibleContentItem[] };
    };
    const content = json.data?.content ?? [];
    verses = extractVerses(content);
  } catch (err) {
    console.error("[api-bible] Fetch failed:", err);
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS).toISOString();

  // ----- Write to cache -----
  const { error: upsertError } = await supabase
    .from("chapters")
    .upsert(
      {
        book: book.name,
        chapter,
        translation: code,
        text_json: verses,
        fetched_at: now.toISOString(),
        expires_at: expiresAt,
      },
      { onConflict: "book,chapter,translation" }
    );

  if (upsertError) {
    console.error("[api-bible] Cache write failed:", upsertError.message);
  }

  return {
    book_code: bookCode.toUpperCase(),
    book_name: book.name,
    chapter,
    translation: code,
    verses,
    attribution: null,
    cached_at: now.toISOString(),
    expires_at: expiresAt,
  } satisfies ReadingChapter;
}
