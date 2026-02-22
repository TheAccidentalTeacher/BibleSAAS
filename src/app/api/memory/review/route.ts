/**
 * POST /api/memory/review
 * Body: { memory_verse_id, review_mode, quality, time_taken_seconds? }
 *
 * Recalculates SM-2 values, updates memory_verses, inserts memory_verse_reviews.
 * Awards XP: 5 per review, 50 more if just mastered.
 * Returns: { verse (updated), justMastered, xp }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calcSM2 } from "@/lib/sm2";
import { awardXP } from "@/lib/xp-server";
import type { MemoryVerseRow } from "@/types/database";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    memory_verse_id: string;
    review_mode: "flashcard" | "fill_blank" | "word_order";
    quality: number;   // 0–5
    time_taken_seconds?: number;
  };

  const { memory_verse_id, review_mode, quality, time_taken_seconds } = body;

  if (!memory_verse_id || review_mode == null || quality == null) {
    return NextResponse.json({ error: "memory_verse_id, review_mode, quality required" }, { status: 400 });
  }

  // Fetch the current verse — ownership check
  const { data: verseRaw, error: fetchErr } = await supabase
    .from("memory_verses")
    .select("*")
    .eq("id", memory_verse_id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !verseRaw) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const mv = verseRaw as unknown as MemoryVerseRow;
  const wasMastered = mv.mastered;

  // Calculate new SM-2 values
  const sm2 = calcSM2(mv.ease_factor, mv.interval_days, mv.repetitions, quality);

  // Update memory_verses
  const { data: updated, error: updateErr } = await supabase
    .from("memory_verses")
    .update({
      ease_factor: sm2.ease,
      interval_days: sm2.interval,
      repetitions: sm2.reps,
      next_review: sm2.nextReview,
      mastered: sm2.mastered,
      last_reviewed: new Date().toISOString(),
      practice_count: mv.practice_count + 1,
    })
    .eq("id", memory_verse_id)
    .select()
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Insert review record
  await supabase.from("memory_verse_reviews").insert({
    user_id: user.id,
    memory_verse_id,
    review_mode,
    quality,
    ease_factor_after: sm2.ease,
    interval_after: sm2.interval,
    repetitions_after: sm2.reps,
    time_taken_seconds: time_taken_seconds ?? null,
  });

  // Award XP
  void awardXP(user.id, "memory_verse_reviewed");
  const justMastered = !wasMastered && sm2.mastered;
  if (justMastered) {
    void awardXP(user.id, "memory_verse_mastered", 50, { verse_id: memory_verse_id });
  }

  return NextResponse.json({
    verse: updated as unknown as MemoryVerseRow,
    justMastered,
    xp: justMastered ? 55 : 5,
  });
}
