/**
 * Local (Supabase) Bible fetch for public-domain translations.
 *
 * WEB / KJV / ASV / YLT are stored in the `chapters` table as part of
 * the seed data (Phase 0.5).  They have no expiry and are served directly
 * from the database.
 *
 * Returns null if the seed data has not been loaded yet — the caller
 * should surface a "Bible content not yet available" message in the UI.
 */

import { createClient } from "@/lib/supabase/server";
import { findBook } from "@/lib/bible";
import { type ReadingChapter, type ReadingVerse } from "./types";
import type { ChapterRow } from "@/types/database";

const PUBLIC_DOMAIN_TRANSLATIONS = ["WEB", "KJV", "ASV", "YLT"] as const;
type PublicDomainSlug = (typeof PUBLIC_DOMAIN_TRANSLATIONS)[number];

export function isPublicDomain(code: string): code is PublicDomainSlug {
  return PUBLIC_DOMAIN_TRANSLATIONS.includes(
    code.toUpperCase() as PublicDomainSlug
  );
}

/**
 * Look up a chapter from the local `chapters` table.
 * Translation must be one of WEB | KJV | ASV | YLT.
 */
export async function getLocalChapter(
  bookCode: string,
  chapter: number,
  translation: "WEB" | "KJV" | "ASV" | "YLT"
): Promise<ReadingChapter | null> {
  const book = findBook(bookCode);
  if (!book) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("book_code", bookCode.toUpperCase())
    .eq("chapter_number", chapter)
    .eq("translation_code", translation.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error(
      `[local] Query error for ${bookCode} ${chapter} ${translation}:`,
      error.message
    );
    return null;
  }

  if (!data) {
    // Seed data not loaded yet — caller handles gracefully
    return null;
  }

  const row = data as unknown as ChapterRow;
  const verses = (row.verses as ReadingVerse[]) ?? [];

  return {
    book_code: bookCode.toUpperCase(),
    book_name: book.name,
    chapter,
    translation: translation.toUpperCase(),
    verses,
    attribution: null, // Public domain — no attribution required
    cached_at: row.cached_at,
    expires_at: null, // Public domain — never expires
  };
}
