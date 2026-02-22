import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TskVerseStatRow } from "@/types/database";

// GET /api/tsk/chapter?book=John&chapter=3
// Returns TSK verse stats for all verses in a chapter (for density dot rendering)
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book") ?? "";
  const chapter = Number(searchParams.get("chapter") ?? "0");

  if (!book || !chapter) {
    return NextResponse.json({ error: "Missing book/chapter" }, { status: 400 });
  }

  const { data: rawStats } = await supabase
    .from("tsk_verse_stats")
    .select("verse, reference_count, density_tier")
    .eq("book", book)
    .eq("chapter", chapter)
    .order("verse");

  const stats = (rawStats ?? []) as unknown as Pick<TskVerseStatRow, "verse" | "reference_count" | "density_tier">[];

  // Return as verse -> stat map
  const byVerse: Record<number, { count: number; tier: string }> = {};
  for (const s of stats) {
    byVerse[s.verse] = { count: s.reference_count, tier: s.density_tier };
  }

  return NextResponse.json({ byVerse });
}
