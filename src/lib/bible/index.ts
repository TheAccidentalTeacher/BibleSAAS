/**
 * Unified Bible chapter fetcher.
 *
 * Routes each translation to its appropriate data source:
 *   WEB / KJV / ASV / YLT  → local Supabase table (seed data)
 *   ESV                     → api.esv.org (24h cache)
 *   NIV / NASB / NLT / CSB → scripture.api.bible (1h cache)
 *
 * All functions return ReadingChapter | null.
 * Null means the content is unavailable right now — see `getUnavailableReason`.
 */

export type { ReadingChapter, ReadingVerse, TranslationMeta } from "./types";
export { TRANSLATIONS, getTranslation, ESV_ATTRIBUTION } from "./types";

import { isPublicDomain, getLocalChapter } from "./local";
import { getEsvChapter } from "./esv";
import { isApiTranslation, getApiBibleChapter } from "./api-bible";
import { type ReadingChapter } from "./types";

/**
 * Fetch a Bible chapter in the requested translation.
 *
 * @param bookCode   USFM book code, e.g. "GEN", "JHN", "REV"
 * @param chapter    1-based chapter number
 * @param translation  Translation code, e.g. "ESV", "KJV"
 *
 * @returns ReadingChapter on success, null if unavailable
 */
export async function getChapter(
  bookCode: string,
  chapter: number,
  translation: string
): Promise<ReadingChapter | null> {
  const code = translation.toUpperCase();

  if (isPublicDomain(code)) {
    return getLocalChapter(
      bookCode,
      chapter,
      code as "WEB" | "KJV" | "ASV" | "YLT"
    );
  }

  if (code === "ESV") {
    return getEsvChapter(bookCode, chapter);
  }

  if (isApiTranslation(code)) {
    return getApiBibleChapter(bookCode, chapter, code);
  }

  console.warn(`[bible] Unknown translation code: ${code}`);
  return null;
}

/**
 * Returns a human-readable explanation for why a chapter returned null.
 * Used to show contextual error messages in the reading UI.
 */
export function getUnavailableReason(translation: string): string {
  const code = translation.toUpperCase();

  if (isPublicDomain(code)) {
    return "Bible content hasn't been loaded yet. The administrator needs to run the seed scripts to populate the database with Bible text.";
  }

  if (code === "ESV") {
    if (!process.env.ESV_API_KEY) {
      return "The English Standard Version requires an API key that hasn't been configured. Please contact support or choose a free translation.";
    }
    return "The English Standard Version is temporarily unavailable. Please try again in a moment or choose a different translation.";
  }

  if (isApiTranslation(code)) {
    return "This translation is temporarily unavailable. Please try again or choose a different translation.";
  }

  return "Translation not supported.";
}
