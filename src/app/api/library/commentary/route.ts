import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/library/commentary?book=John&chapter=3&source=matthew_henry
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const book = (searchParams.get("book") ?? "").trim();
  const chapter = Number(searchParams.get("chapter") ?? "0");
  const source = searchParams.get("source"); // optional filter

  if (!book || !chapter) return NextResponse.json({ error: "Missing book/chapter" }, { status: 400 });

  let query = supabase
    .from("commentary_entries")
    .select("id, source, book, chapter, verse_start, verse_end, section_title, body, is_vault_featured")
    .eq("book", book)
    .eq("chapter", chapter)
    .order("source")
    .order("verse_start");

  if (source) query = query.eq("source", source);

  const { data: entries, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by source
  const grouped: Record<string, typeof entries> = {};
  for (const e of entries ?? []) {
    if (!grouped[e.source]) grouped[e.source] = [];
    grouped[e.source]!.push(e);
  }

  return NextResponse.json({ grouped, sources: Object.keys(grouped) });
}
