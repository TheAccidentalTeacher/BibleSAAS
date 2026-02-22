import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CrossReferenceTrailRow } from "@/types/database";

// POST /api/trails/create
// Body: { book, chapter, verse, trail_type?, daily_trail_id? }
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { book, chapter, verse, trail_type = "free", daily_trail_id = null } = body;

  if (!book || !chapter || !verse) {
    return NextResponse.json({ error: "Missing book/chapter/verse" }, { status: 400 });
  }

  // Create trail
  const { data: rawTrail, error: trailError } = await supabase
    .from("cross_reference_trails")
    .insert({
      user_id: user.id,
      origin_book: book,
      origin_chapter: chapter,
      origin_verse: verse,
      trail_type,
      daily_trail_id,
      step_count: 1,
    })
    .select()
    .single();

  if (trailError || !rawTrail) {
    return NextResponse.json({ error: trailError?.message ?? "Failed to create trail" }, { status: 500 });
  }

  const trail = rawTrail as unknown as CrossReferenceTrailRow;

  // Create first step
  const { error: stepError } = await supabase
    .from("trail_steps")
    .insert({
      trail_id: trail.id,
      step_order: 1,
      book,
      chapter,
      verse,
    });

  if (stepError) {
    return NextResponse.json({ error: stepError.message }, { status: 500 });
  }

  return NextResponse.json({ trail_id: trail.id, share_token: trail.share_token });
}
