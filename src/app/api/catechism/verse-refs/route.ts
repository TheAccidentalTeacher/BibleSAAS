/**
 * GET /api/catechism/verse-refs?book=ROM&chapter=3
 *
 * Returns catechism entries that reference the given book + chapter.
 * Used by the reading screen to show "C" margin dots on verses.
 *
 * Response: {
 *   byVerse: Record<number, Array<{ catechism, questionNumber, questionText, answerText }>>
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBook } from "@/lib/bible";

interface CatechismEntryRow {
  id: string;
  catechism: string;
  question_number: number;
  question_text: string;
  answer_text: string;
  scripture_refs: string[] | null;
}

export interface CatechismVerseRef {
  entryId: string;
  catechism: string;
  questionNumber: number;
  questionText: string;
  answerText: string;
}

export type CatechismVerseMap = Record<number, CatechismVerseRef[]>;

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bookCode = searchParams.get("book");
  const chapterParam = searchParams.get("chapter");

  if (!bookCode || !chapterParam) {
    return NextResponse.json({ error: "book and chapter are required" }, { status: 400 });
  }

  const chapter = parseInt(chapterParam, 10);
  if (isNaN(chapter)) {
    return NextResponse.json({ error: "chapter must be a number" }, { status: 400 });
  }

  // Resolve book name (e.g. "ROM" → "Romans")
  const bookMeta = getBook(bookCode);
  const bookName = bookMeta?.name ?? bookCode;

  // Pattern match: find entries where scripture_refs::text contains "BookName chapter:"
  // This is a pragmatic approach — casts the array to text and does ILIKE
  const pattern = `%${bookName} ${chapter}:%`;
  const patternNoVerse = `%${bookName} ${chapter}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("catechism_entries")
    .select("id, catechism, question_number, question_text, answer_text, scripture_refs")
    .or(
      `scripture_refs.cs.{"${bookName} ${chapter}"},scripture_refs::text.ilike.${pattern}`
    );

  if (error) {
    // Fallback: broader fetch and filter in app code
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allData } = await (supabase as any)
      .from("catechism_entries")
      .select("id, catechism, question_number, question_text, answer_text, scripture_refs")
      .limit(800);

    if (!allData) {
      return NextResponse.json({ byVerse: {} });
    }

    return NextResponse.json({
      byVerse: buildVerseMap(allData as CatechismEntryRow[], bookName, chapter),
    });
  }

  // Also do a second query to catch refs like "BookName chapter" (no verse suffix)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: data2 } = await (supabase as any)
    .from("catechism_entries")
    .select("id, catechism, question_number, question_text, answer_text, scripture_refs")
    .ilike("scripture_refs::text", patternNoVerse);

  const combined = deduplicateById([
    ...((data ?? []) as CatechismEntryRow[]),
    ...((data2 ?? []) as CatechismEntryRow[]),
  ]);

  return NextResponse.json({
    byVerse: buildVerseMap(combined, bookName, chapter),
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deduplicateById(rows: CatechismEntryRow[]): CatechismEntryRow[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

/**
 * Parse scripture_refs to extract verse numbers for the target chapter.
 * Handles formats:
 *   "Romans 3:23"          → verse 23
 *   "Romans 3:23-25"       → verses 23, 24, 25
 *   "Romans 3"             → verse 0 (whole chapter — assign to verse 1)
 *   "Romans 3:23, 25"      → not currently split (treated as single ref)
 */
function buildVerseMap(
  entries: CatechismEntryRow[],
  bookName: string,
  chapter: number
): CatechismVerseMap {
  const map: CatechismVerseMap = {};

  const chapterPrefix = `${bookName} ${chapter}`;

  for (const entry of entries) {
    if (!entry.scripture_refs?.length) continue;

    for (const ref of entry.scripture_refs) {
      if (!ref.toLowerCase().startsWith(chapterPrefix.toLowerCase())) continue;

      // Extract verse portion after "BookName chapter:"
      const colonIdx = ref.indexOf(":");
      if (colonIdx === -1) {
        // Whole-chapter reference → assign to verse 1
        addToMap(map, 1, entry);
        continue;
      }

      const verseStr = ref.slice(colonIdx + 1).trim();
      // Handle ranges like "23-25"
      const dashIdx = verseStr.indexOf("-");
      if (dashIdx !== -1) {
        const start = parseInt(verseStr.slice(0, dashIdx), 10);
        const end = parseInt(verseStr.slice(dashIdx + 1), 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let v = start; v <= end; v++) {
            addToMap(map, v, entry);
          }
        }
      } else {
        const v = parseInt(verseStr, 10);
        if (!isNaN(v)) {
          addToMap(map, v, entry);
        }
      }
    }
  }

  return map;
}

function addToMap(map: CatechismVerseMap, verse: number, entry: CatechismEntryRow) {
  if (!map[verse]) map[verse] = [];
  // Avoid duplicates for same question
  if (!map[verse]!.some((e) => e.entryId === entry.id)) {
    map[verse]!.push({
      entryId: entry.id,
      catechism: entry.catechism,
      questionNumber: entry.question_number,
      questionText: entry.question_text,
      answerText: entry.answer_text,
    });
  }
}
