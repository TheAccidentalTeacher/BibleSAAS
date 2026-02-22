import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/library/search?q=&limit=20
// Searches across dictionary, strongs, commentary, and hymns
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  if (!q) return NextResponse.json({ results: [] });

  // Search dict entries
  const { data: dictResults } = await supabase
    .from("bible_dictionary_entries")
    .select("id, slug, term, source, body")
    .ilike("term", `%${q}%`)
    .limit(limit / 2);

  // Search strongs
  const { data: strongsResults } = await supabase
    .from("strongs_lexicon")
    .select("strongs_number, original_word, transliteration, short_def, language")
    .or(`transliteration.ilike.%${q}%,short_def.ilike.%${q}%,strongs_number.ilike.%${q}%`)
    .limit(10);

  const results = [
    ...(dictResults ?? []).map((d) => ({
      type: "dictionary" as const,
      id: d.id,
      label: d.term,
      subtitle: d.source,
      snippet: d.body.slice(0, 100),
      href: `/library/dictionary/${d.slug}`,
    })),
    ...(strongsResults ?? []).map((s) => ({
      type: "word_study" as const,
      id: s.strongs_number,
      label: s.transliteration ?? s.original_word,
      subtitle: `${s.strongs_number} · ${s.language}`,
      snippet: s.short_def ?? "",
      href: `/library/word-study/${s.strongs_number}`,
    })),
  ];

  return NextResponse.json({ results });
}
