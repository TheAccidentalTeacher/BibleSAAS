/**
 * GET /api/memory
 *   ?mode=queue     → verses due today (next_review <= today), sorted overdue-first
 *   ?mode=all       → all verses for current user
 *   ?book=GEN&chapter=1  → just chapter markers (which verses are memorized)
 *
 * POST /api/memory
 *   Body: { book, chapter, verse, verse_text, translation, review_mode }
 *   → saves new memory_verses row (upsert on book+chapter+verse)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { MemoryVerseRow } from "@/types/database";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") ?? "queue";
  const book = searchParams.get("book");
  const chapter = searchParams.get("chapter");

  // Chapter markers — lightweight query for reading screen gold stars
  if (book && chapter) {
    const today = new Date().toISOString().split("T")[0]!;
    const { data, error } = await supabase
      .from("memory_verses")
      .select("id, verse, mastered, next_review")
      .eq("user_id", user.id)
      .eq("book", book.toUpperCase())
      .eq("chapter", parseInt(chapter, 10))
      .is("deleted_at", null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const markers = (data as unknown as Pick<MemoryVerseRow, "id" | "verse" | "mastered" | "next_review">[]) ?? [];
    return NextResponse.json({
      markers: markers.map((m) => ({
        id: m.id,
        verse: m.verse,
        mastered: m.mastered,
        due: m.next_review <= today,
      })),
    });
  }

  if (mode === "queue") {
    const today = new Date().toISOString().split("T")[0]!;
    const { data, error } = await supabase
      .from("memory_verses")
      .select("*")
      .eq("user_id", user.id)
      .lte("next_review", today)
      .eq("mastered", false)
      .order("next_review", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ verses: (data as unknown as MemoryVerseRow[]) ?? [] });
  }

  // mode=all — full list
  const { data, error } = await supabase
    .from("memory_verses")
    .select("*")
    .eq("user_id", user.id)
    .order("mastered", { ascending: true })
    .order("next_review", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ verses: (data as unknown as MemoryVerseRow[]) ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    book: string;
    chapter: number;
    verse: number;
    verse_text: string;
    translation?: string;
    review_mode?: "flashcard" | "fill_blank" | "word_order" | "all";
  };

  const { book, chapter, verse, verse_text, translation = "WEB", review_mode = "all" } = body;

  if (!book || !chapter || !verse || !verse_text) {
    return NextResponse.json({ error: "book, chapter, verse, verse_text required" }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0]!;

  // Upsert — if already memorized, just update review_mode
  const { data, error } = await supabase
    .from("memory_verses")
    .upsert(
      {
        user_id: user.id,
        book: book.toUpperCase(),
        chapter,
        verse,
        verse_text,
        translation,
        review_mode,
        next_review: today,
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0,
        mastered: false,
        added_from: "reading",
        memory_type: "verse",
      },
      { onConflict: "user_id,book,chapter,verse", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ verse: data as unknown as MemoryVerseRow }, { status: 201 });
}
