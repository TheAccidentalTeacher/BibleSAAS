/**
 * ESV API client for Bible Study App.
 *
 * Fetches from api.esv.org/v3/passage/text/ and caches results in the
 * Supabase `chapters` table with a 24-hour TTL.
 *
 * ESV attribution is required on every page — it's included in the
 * returned ReadingChapter object and the reading UI enforces it.
 */

import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible";
import { type ReadingChapter, type ReadingVerse, ESV_ATTRIBUTION } from "./types";
import type { ChapterRow } from "@/types/database";

const ESV_API_BASE = "https://api.esv.org/v3/passage/text/";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Converts a USFM book code + chapter number to the ESV API query string.
 * e.g. "GEN", 1 → "Genesis 1"
 */
function toEsvQuery(bookCode: string, chapter: number): string {
  const book = getBook(bookCode.toUpperCase() as Parameters<typeof getBook>[0]);
  if (!book) throw new Error(`Unknown book code: ${bookCode}`);
  return `${book.name} ${chapter}`;
}

/**
 * Parse ESV plain-text passage response into ReadingVerse array.
 *
 * ESV API returns text like:
 *   "  [1] In the beginning God created the heavens and the earth. [2] ..."
 * with paragraph breaks marked by a blank line.
 *
 * We split on double-newlines to detect paragraph starts, then extract
 * verse numbers from [N] markers.
 */
function parseEsvText(rawText: string): ReadingVerse[] {
  const verses: ReadingVerse[] = [];
  // Normalise CRLF, trim leading/trailing whitespace
  const normalised = rawText.replace(/\r\n/g, "\n").trim();

  // Split by blank lines to get paragraphs
  const paragraphs = normalised.split(/\n{2,}/);

  for (const para of paragraphs) {
    // Each paragraph may contain multiple verse markers [N]
    const versePattern = /\[(\d+)\]\s*([\s\S]*?)(?=\[\d+\]|$)/g;
    let match: RegExpExecArray | null;
    let firstInParagraph = true;

    while ((match = versePattern.exec(para)) !== null) {
      const verseNum = parseInt(match[1], 10);
      const text = match[2].replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      if (!text) continue;

      verses.push({
        verse: verseNum,
        text,
        paragraph_start: firstInParagraph,
      });
      firstInParagraph = false;
    }
  }

  // Sort by verse number in case paragraphs were out of order
  verses.sort((a, b) => a.verse - b.verse);
  return verses;
}

/**
 * Fetch a chapter from the ESV API and cache it, or return the cached copy.
 *
 * Returns null if:
 * - ESV_API_KEY is not configured, OR
 * - The API request fails
 *
 * In either case the caller should gracefully degrade (try WEB fallback, etc.)
 */
export async function getEsvChapter(
  bookCode: string,
  chapter: number
): Promise<ReadingChapter | null> {
  const apiKey = process.env.ESV_API_KEY;

  const supabase = await createClient();
  const book = getBook(bookCode.toUpperCase() as Parameters<typeof getBook>[0]);
  if (!book) return null;

  // ----- Check cache -----
  let cached = null;
  try {
    const { data } = await supabase
      .from("chapters")
      .select("*")
      .eq("book", book.name)
      .eq("chapter", chapter)
      .eq("translation", "ESV")
      .maybeSingle();
    cached = data;
  } catch (err) {
    console.warn("[ESV] Cache read failed, proceeding to API fetch:", err);
  }

  if (cached) {
    const row = cached as unknown as ChapterRow;
    // Check TTL
    const notExpired = !row.expires_at || new Date(row.expires_at) > new Date();
    if (notExpired) {
      const verses = (row.text_json as ReadingVerse[]) ?? [];
      return {
        book_code: bookCode.toUpperCase(),
        book_name: book.name,
        chapter,
        translation: "ESV",
        verses,
        attribution: ESV_ATTRIBUTION,
        cached_at: row.fetched_at,
        expires_at: row.expires_at,
      };
    }
  }

  // ----- Fetch from ESV API -----
  if (!apiKey) {
    // No API key — return null; UI will handle graceful degradation
    console.warn("[ESV] ESV_API_KEY not configured, cannot fetch ESV text.");
    return null;
  }

  const query = toEsvQuery(bookCode, chapter);
  const url = new URL(ESV_API_BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("include-verse-numbers", "true");
  url.searchParams.set("include-footnotes", "false");
  url.searchParams.set("include-footnote-body", "false");
  url.searchParams.set("include-headings", "false");
  url.searchParams.set("include-short-copyright", "false");
  url.searchParams.set("include-copyright", "false");
  url.searchParams.set("include-passage-references", "false");
  url.searchParams.set("indent-paragraphs", "0");
  url.searchParams.set("indent-poetry", "false");

  let rawText: string;
  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Token ${apiKey}`,
        "Accept": "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[ESV] API error ${res.status} for ${query}: ${body.slice(0, 200)}`);
      return null;
    }
    const json = (await res.json()) as { passages?: string[] };
    rawText = json.passages?.[0] ?? "";
    if (!rawText) {
      console.error(`[ESV] Empty passages array for ${query}`);
      return null;
    }
  } catch (err) {
    console.error("[ESV] Fetch failed:", err);
    return null;
  }

  const verses = parseEsvText(rawText);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS).toISOString();

  // ----- Write to cache -----
  const upsertPayload = {
    book: book.name,
    chapter,
    translation: "ESV",
    text_json: verses,
    fetched_at: now.toISOString(),
    expires_at: expiresAt,
  };

  const { error: upsertError } = await supabase
    .from("chapters")
    .upsert(upsertPayload, {
      onConflict: "book,chapter,translation",
    });

  if (upsertError) {
    console.error("[ESV] Cache write failed:", upsertError.message);
    // Not fatal — return the freshly fetched data anyway
  }

  return {
    book_code: bookCode.toUpperCase(),
    book_name: book.name,
    chapter,
    translation: "ESV",
    verses,
    attribution: ESV_ATTRIBUTION,
    cached_at: now.toISOString(),
    expires_at: expiresAt,
  } satisfies ReadingChapter;
}
