/**
 * bible.ts — Core Bible reference utilities
 * USFM 3.0 book codes, chapter counts, canonical ordering, and display helpers.
 * This is shared reference data used across the entire application.
 */

/** USFM 3.0 book code used throughout the database. */
export type BookCode = string

export interface BibleBook {
  /** USFM 3.0 code (e.g. 'GEN', 'MAT', 'REV') */
  code: BookCode
  /** Full display name */
  name: string
  /** Common abbreviated name */
  abbrev: string
  /** Number of chapters */
  chapters: number
  /** Testament */
  testament: 'OT' | 'NT'
  /** Canonical order (1-based) */
  order: number
}

/** All 66 canonical books in canonical order. */
export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { code: 'GEN', name: 'Genesis',         abbrev: 'Gen',  chapters: 50,  testament: 'OT', order: 1  },
  { code: 'EXO', name: 'Exodus',          abbrev: 'Exo',  chapters: 40,  testament: 'OT', order: 2  },
  { code: 'LEV', name: 'Leviticus',       abbrev: 'Lev',  chapters: 27,  testament: 'OT', order: 3  },
  { code: 'NUM', name: 'Numbers',         abbrev: 'Num',  chapters: 36,  testament: 'OT', order: 4  },
  { code: 'DEU', name: 'Deuteronomy',     abbrev: 'Deu',  chapters: 34,  testament: 'OT', order: 5  },
  { code: 'JOS', name: 'Joshua',          abbrev: 'Jos',  chapters: 24,  testament: 'OT', order: 6  },
  { code: 'JDG', name: 'Judges',          abbrev: 'Jdg',  chapters: 21,  testament: 'OT', order: 7  },
  { code: 'RUT', name: 'Ruth',            abbrev: 'Rut',  chapters: 4,   testament: 'OT', order: 8  },
  { code: '1SA', name: '1 Samuel',        abbrev: '1Sa',  chapters: 31,  testament: 'OT', order: 9  },
  { code: '2SA', name: '2 Samuel',        abbrev: '2Sa',  chapters: 24,  testament: 'OT', order: 10 },
  { code: '1KI', name: '1 Kings',         abbrev: '1Ki',  chapters: 22,  testament: 'OT', order: 11 },
  { code: '2KI', name: '2 Kings',         abbrev: '2Ki',  chapters: 25,  testament: 'OT', order: 12 },
  { code: '1CH', name: '1 Chronicles',    abbrev: '1Ch',  chapters: 29,  testament: 'OT', order: 13 },
  { code: '2CH', name: '2 Chronicles',    abbrev: '2Ch',  chapters: 36,  testament: 'OT', order: 14 },
  { code: 'EZR', name: 'Ezra',           abbrev: 'Ezr',  chapters: 10,  testament: 'OT', order: 15 },
  { code: 'NEH', name: 'Nehemiah',        abbrev: 'Neh',  chapters: 13,  testament: 'OT', order: 16 },
  { code: 'EST', name: 'Esther',          abbrev: 'Est',  chapters: 10,  testament: 'OT', order: 17 },
  { code: 'JOB', name: 'Job',             abbrev: 'Job',  chapters: 42,  testament: 'OT', order: 18 },
  { code: 'PSA', name: 'Psalms',          abbrev: 'Psa',  chapters: 150, testament: 'OT', order: 19 },
  { code: 'PRO', name: 'Proverbs',        abbrev: 'Pro',  chapters: 31,  testament: 'OT', order: 20 },
  { code: 'ECC', name: 'Ecclesiastes',    abbrev: 'Ecc',  chapters: 12,  testament: 'OT', order: 21 },
  { code: 'SNG', name: 'Song of Solomon', abbrev: 'Sng',  chapters: 8,   testament: 'OT', order: 22 },
  { code: 'ISA', name: 'Isaiah',          abbrev: 'Isa',  chapters: 66,  testament: 'OT', order: 23 },
  { code: 'JER', name: 'Jeremiah',        abbrev: 'Jer',  chapters: 52,  testament: 'OT', order: 24 },
  { code: 'LAM', name: 'Lamentations',    abbrev: 'Lam',  chapters: 5,   testament: 'OT', order: 25 },
  { code: 'EZK', name: 'Ezekiel',         abbrev: 'Ezk',  chapters: 48,  testament: 'OT', order: 26 },
  { code: 'DAN', name: 'Daniel',          abbrev: 'Dan',  chapters: 12,  testament: 'OT', order: 27 },
  { code: 'HOS', name: 'Hosea',           abbrev: 'Hos',  chapters: 14,  testament: 'OT', order: 28 },
  { code: 'JOL', name: 'Joel',            abbrev: 'Jol',  chapters: 3,   testament: 'OT', order: 29 },
  { code: 'AMO', name: 'Amos',            abbrev: 'Amo',  chapters: 9,   testament: 'OT', order: 30 },
  { code: 'OBA', name: 'Obadiah',         abbrev: 'Oba',  chapters: 1,   testament: 'OT', order: 31 },
  { code: 'JON', name: 'Jonah',           abbrev: 'Jon',  chapters: 4,   testament: 'OT', order: 32 },
  { code: 'MIC', name: 'Micah',           abbrev: 'Mic',  chapters: 7,   testament: 'OT', order: 33 },
  { code: 'NAM', name: 'Nahum',           abbrev: 'Nam',  chapters: 3,   testament: 'OT', order: 34 },
  { code: 'HAB', name: 'Habakkuk',        abbrev: 'Hab',  chapters: 3,   testament: 'OT', order: 35 },
  { code: 'ZEP', name: 'Zephaniah',       abbrev: 'Zep',  chapters: 3,   testament: 'OT', order: 36 },
  { code: 'HAG', name: 'Haggai',          abbrev: 'Hag',  chapters: 2,   testament: 'OT', order: 37 },
  { code: 'ZEC', name: 'Zechariah',       abbrev: 'Zec',  chapters: 14,  testament: 'OT', order: 38 },
  { code: 'MAL', name: 'Malachi',         abbrev: 'Mal',  chapters: 4,   testament: 'OT', order: 39 },

  // New Testament
  { code: 'MAT', name: 'Matthew',         abbrev: 'Mat',  chapters: 28,  testament: 'NT', order: 40 },
  { code: 'MRK', name: 'Mark',            abbrev: 'Mrk',  chapters: 16,  testament: 'NT', order: 41 },
  { code: 'LUK', name: 'Luke',            abbrev: 'Luk',  chapters: 24,  testament: 'NT', order: 42 },
  { code: 'JHN', name: 'John',            abbrev: 'Jhn',  chapters: 21,  testament: 'NT', order: 43 },
  { code: 'ACT', name: 'Acts',            abbrev: 'Act',  chapters: 28,  testament: 'NT', order: 44 },
  { code: 'ROM', name: 'Romans',          abbrev: 'Rom',  chapters: 16,  testament: 'NT', order: 45 },
  { code: '1CO', name: '1 Corinthians',   abbrev: '1Co',  chapters: 16,  testament: 'NT', order: 46 },
  { code: '2CO', name: '2 Corinthians',   abbrev: '2Co',  chapters: 13,  testament: 'NT', order: 47 },
  { code: 'GAL', name: 'Galatians',       abbrev: 'Gal',  chapters: 6,   testament: 'NT', order: 48 },
  { code: 'EPH', name: 'Ephesians',       abbrev: 'Eph',  chapters: 6,   testament: 'NT', order: 49 },
  { code: 'PHP', name: 'Philippians',     abbrev: 'Php',  chapters: 4,   testament: 'NT', order: 50 },
  { code: 'COL', name: 'Colossians',      abbrev: 'Col',  chapters: 4,   testament: 'NT', order: 51 },
  { code: '1TH', name: '1 Thessalonians', abbrev: '1Th',  chapters: 5,   testament: 'NT', order: 52 },
  { code: '2TH', name: '2 Thessalonians', abbrev: '2Th',  chapters: 3,   testament: 'NT', order: 53 },
  { code: '1TI', name: '1 Timothy',       abbrev: '1Ti',  chapters: 6,   testament: 'NT', order: 54 },
  { code: '2TI', name: '2 Timothy',       abbrev: '2Ti',  chapters: 4,   testament: 'NT', order: 55 },
  { code: 'TIT', name: 'Titus',           abbrev: 'Tit',  chapters: 3,   testament: 'NT', order: 56 },
  { code: 'PHM', name: 'Philemon',        abbrev: 'Phm',  chapters: 1,   testament: 'NT', order: 57 },
  { code: 'HEB', name: 'Hebrews',         abbrev: 'Heb',  chapters: 13,  testament: 'NT', order: 58 },
  { code: 'JAS', name: 'James',           abbrev: 'Jas',  chapters: 5,   testament: 'NT', order: 59 },
  { code: '1PE', name: '1 Peter',         abbrev: '1Pe',  chapters: 5,   testament: 'NT', order: 60 },
  { code: '2PE', name: '2 Peter',         abbrev: '2Pe',  chapters: 3,   testament: 'NT', order: 61 },
  { code: '1JN', name: '1 John',          abbrev: '1Jn',  chapters: 5,   testament: 'NT', order: 62 },
  { code: '2JN', name: '2 John',          abbrev: '2Jn',  chapters: 1,   testament: 'NT', order: 63 },
  { code: '3JN', name: '3 John',          abbrev: '3Jn',  chapters: 1,   testament: 'NT', order: 64 },
  { code: 'JUD', name: 'Jude',            abbrev: 'Jud',  chapters: 1,   testament: 'NT', order: 65 },
  { code: 'REV', name: 'Revelation',      abbrev: 'Rev',  chapters: 22,  testament: 'NT', order: 66 },
]

// ─── Lookup maps (built once) ────────────────────────────────────────────────

const BY_CODE = new Map<string, BibleBook>(BIBLE_BOOKS.map((b) => [b.code, b]))
const BY_NAME = new Map<string, BibleBook>(BIBLE_BOOKS.map((b) => [b.name.toLowerCase(), b]))
const BY_ABBREV = new Map<string, BibleBook>(BIBLE_BOOKS.map((b) => [b.abbrev.toLowerCase(), b]))

/** Get a book by USFM code. Returns undefined for invalid codes. */
export function getBook(code: BookCode): BibleBook | undefined {
  return BY_CODE.get(code.toUpperCase())
}

/** Get a book by display name or abbreviation (case-insensitive). */
export function findBook(query: string): BibleBook | undefined {
  const q = query.toLowerCase().trim()
  return BY_NAME.get(q) ?? BY_ABBREV.get(q) ?? undefined
}

/** Returns the number of chapters in a book. Returns 0 for unknown book codes. */
export function chapterCount(code: BookCode): number {
  return BY_CODE.get(code.toUpperCase())?.chapters ?? 0
}

/** Returns all book codes in canonical order. */
export function allBookCodes(): BookCode[] {
  return BIBLE_BOOKS.map((b) => b.code)
}

/** Returns all Old Testament books in canonical order. */
export function otBooks(): BibleBook[] {
  return BIBLE_BOOKS.filter((b) => b.testament === 'OT')
}

/** Returns all New Testament books in canonical order. */
export function ntBooks(): BibleBook[] {
  return BIBLE_BOOKS.filter((b) => b.testament === 'NT')
}

/** Total chapters in the entire Bible. */
export const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0) // 1,189

/**
 * Returns the next chapter as {book, chapter}, handling book boundaries.
 * Returns null when at the final chapter of Revelation.
 */
export function nextChapter(
  book: BookCode,
  chapter: number
): { book: BookCode; chapter: number } | null {
  const current = getBook(book)
  if (!current) return null

  if (chapter < current.chapters) {
    return { book, chapter: chapter + 1 }
  }

  // Move to next book
  const nextBook = BIBLE_BOOKS.find((b) => b.order === current.order + 1)
  if (!nextBook) return null // End of Revelation
  return { book: nextBook.code, chapter: 1 }
}

/**
 * Returns the previous chapter, handling book boundaries.
 * Returns null when at Genesis 1.
 */
export function prevChapter(
  book: BookCode,
  chapter: number
): { book: BookCode; chapter: number } | null {
  const current = getBook(book)
  if (!current) return null

  if (chapter > 1) {
    return { book, chapter: chapter - 1 }
  }

  // Move to previous book
  const prevBook = BIBLE_BOOKS.find((b) => b.order === current.order - 1)
  if (!prevBook) return null // Start of Genesis
  return { book: prevBook.code, chapter: prevBook.chapters }
}

/** Formats a reference for display. e.g. 'Genesis 1', 'Psalm 119', 'Revelation 22' */
export function formatRef(book: BookCode, chapter: number, verse?: number): string {
  const b = getBook(book)
  if (!b) return `${book} ${chapter}${verse ? `:${verse}` : ''}`
  return `${b.name} ${chapter}${verse ? `:${verse}` : ''}`
}
