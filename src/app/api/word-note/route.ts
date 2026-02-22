import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/word-note?book=&chapter=&verse=&word_pos=
// Returns morphology data + strongs entry for the word at position
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book");
  const chapter = Number(searchParams.get("chapter") ?? "0");
  const verse = Number(searchParams.get("verse") ?? "0");
  const wordPos = Number(searchParams.get("word_pos") ?? "1");

  if (!book || !chapter || !verse) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Get morphology data for this word position
  const { data: morph } = await supabase
    .from("morphology_data")
    .select("original_word, normalized_form, strongs_number, language, morphology_desc, part_of_speech")
    .eq("book", book)
    .eq("chapter", chapter)
    .eq("verse", verse)
    .eq("word_position", wordPos)
    .single();

  if (!morph?.strongs_number) {
    return NextResponse.json({ found: false });
  }

  // Get strongs entry
  const { data: strongs } = await supabase
    .from("strongs_lexicon")
    .select("strongs_number, language, original_word, transliteration, short_def, charles_study, total_occurrences")
    .eq("strongs_number", morph.strongs_number)
    .single();

  if (!strongs) return NextResponse.json({ found: false });

  // Track word study history
  await supabase.from("user_word_study_history").upsert(
    {
      user_id: user.id,
      strongs_number: strongs.strongs_number,
      last_studied_at: new Date().toISOString(),
      study_count: 1,
      source_book: book,
      source_chapter: chapter,
    },
    { onConflict: "user_id,strongs_number", ignoreDuplicates: false }
  );

  const charlesStudy = strongs.charles_study as Record<string, unknown> | null;
  const synthesis = charlesStudy?.charles_synthesis as string | null
    ?? charlesStudy?.intro as string | null
    ?? strongs.short_def;

  return NextResponse.json({
    found: true,
    word: {
      original: morph.original_word ?? strongs.original_word,
      transliteration: strongs.transliteration,
      strongs_number: strongs.strongs_number,
      language: strongs.language,
      short_def: strongs.short_def,
      synthesis,
      total_occurrences: strongs.total_occurrences,
    },
  });
}
