import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { StrongsLexiconRow } from "@/types/database";

// GET /api/library/word-study?strongs=H0001
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const strongs = (searchParams.get("strongs") ?? "").trim().toUpperCase();
  if (!strongs) return NextResponse.json({ error: "Missing strongs" }, { status: 400 });

  const { data: rawEntry, error } = await supabase
    .from("strongs_lexicon")
    .select("*")
    .eq("strongs_number", strongs)
    .single();
  const entry = rawEntry as unknown as StrongsLexiconRow | null;

  if (error || !entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get verse list (top 30 occurrences)
  const { data: verses } = await supabase
    .from("word_occurrences")
    .select("book, chapter, verse, count")
    .eq("strongs_number", strongs)
    .order("book")
    .order("chapter")
    .order("verse")
    .limit(50);

  // Track in user_library_history
  await supabase.from("user_library_history").upsert({
    user_id: user.id,
    entry_type: "word_study",
    entry_id: entry.id,
    entry_slug: strongs,
    entry_label: `${entry.transliteration ?? entry.original_word} (${strongs})`,
    last_visited_at: new Date().toISOString(),
    visit_count: 1,
  }, { onConflict: "user_id,entry_type,entry_id", ignoreDuplicates: false });

  return NextResponse.json({ entry, verses: verses ?? [] });
}
