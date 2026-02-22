import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TskReferenceRow, TskVerseStatRow } from "@/types/database";

// GET /api/tsk?book=John&chapter=3&verse=16
// Returns TSK cross-references for a verse + verse stats
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book") ?? "";
  const chapter = Number(searchParams.get("chapter") ?? "0");
  const verse = Number(searchParams.get("verse") ?? "0");

  if (!book || !chapter || !verse) {
    return NextResponse.json({ error: "Missing book/chapter/verse" }, { status: 400 });
  }

  // Fetch TSK references for this verse
  const { data: rawRefs } = await supabase
    .from("tsk_references")
    .select("id, to_book, to_chapter, to_verse")
    .eq("from_book", book)
    .eq("from_chapter", chapter)
    .eq("from_verse", verse)
    .limit(50);

  const refs = (rawRefs ?? []) as unknown as Pick<TskReferenceRow, "id" | "to_book" | "to_chapter" | "to_verse">[];

  // Fetch verse stat for density
  const { data: rawStat } = await supabase
    .from("tsk_verse_stats")
    .select("reference_count, density_tier")
    .eq("book", book)
    .eq("chapter", chapter)
    .eq("verse", verse)
    .single();

  const stat = rawStat as unknown as Pick<TskVerseStatRow, "reference_count" | "density_tier"> | null;

  return NextResponse.json({
    refs: refs.map((r) => ({
      id: r.id,
      book: r.to_book,
      chapter: r.to_chapter,
      verse: r.to_verse,
      ref: `${r.to_book} ${r.to_chapter}:${r.to_verse}`,
    })),
    stat: stat ?? { reference_count: 0, density_tier: "rare" },
  });
}
