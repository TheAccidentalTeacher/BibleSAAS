/**
 * Bible-specific types for the reading layer.
 *
 * These supplement the core types in src/types/app.ts with
 * the additional formatting data needed for rendering.
 */

export interface ReadingVerse {
  /** 1-based verse number */
  verse: number;
  /** Text content, cleaned */
  text: string;
  /** True if this verse starts a new paragraph */
  paragraph_start: boolean;
}

export interface ReadingChapter {
  book_code: string;
  /**
   * Human-readable book name (e.g. "Genesis", "1 Corinthians")
   * Resolved from BIBLE_BOOKS in lib/bible.ts
   */
  book_name: string;
  chapter: number;
  translation: string;
  verses: ReadingVerse[];
  /**
   * ESV and some API.Bible translations require attribution text
   * to be displayed on every page that shows their text.
   */
  attribution: string | null;
  /** ISO timestamp — null means no expiry (public domain) */
  cached_at: string;
  expires_at: string | null;
}

export type TranslationTier = "free" | "standard" | "premium";

export interface TranslationMeta {
  code: string;
  name: string;
  abbreviation: string;
  tier: TranslationTier;
  source: "local" | "esv_api" | "api_bible";
  language: string;
}

/**
 * All translations supported by the app.
 * Order is intentional: public domain first, then ESV, then Standard tier.
 */
export const TRANSLATIONS: TranslationMeta[] = [
  {
    code: "WEB",
    name: "World English Bible",
    abbreviation: "WEB",
    tier: "free",
    source: "local",
    language: "en",
  },
  {
    code: "KJV",
    name: "King James Version",
    abbreviation: "KJV",
    tier: "free",
    source: "local",
    language: "en",
  },
  {
    code: "ASV",
    name: "American Standard Version",
    abbreviation: "ASV",
    tier: "free",
    source: "local",
    language: "en",
  },
  {
    code: "YLT",
    name: "Young's Literal Translation",
    abbreviation: "YLT",
    tier: "free",
    source: "local",
    language: "en",
  },
  {
    code: "ESV",
    name: "English Standard Version",
    abbreviation: "ESV",
    tier: "standard",
    source: "esv_api",
    language: "en",
  },
  {
    code: "NIV",
    name: "New International Version",
    abbreviation: "NIV",
    tier: "standard",
    source: "api_bible",
    language: "en",
  },
  {
    code: "NASB",
    name: "New American Standard Bible",
    abbreviation: "NASB",
    tier: "standard",
    source: "api_bible",
    language: "en",
  },
  {
    code: "NLT",
    name: "New Living Translation",
    abbreviation: "NLT",
    tier: "standard",
    source: "api_bible",
    language: "en",
  },
  {
    code: "CSB",
    name: "Christian Standard Bible",
    abbreviation: "CSB",
    tier: "standard",
    source: "api_bible",
    language: "en",
  },
];

export function getTranslation(code: string): TranslationMeta | undefined {
  return TRANSLATIONS.find((t) => t.code.toUpperCase() === code.toUpperCase());
}

/**
 * ESV attribution text — required on every page that displays ESV content.
 * Per api.esv.org terms of service.
 */
export const ESV_ATTRIBUTION =
  'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.';
