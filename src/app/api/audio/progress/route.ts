/**
 * Audio progress API
 *
 * GET  /api/audio/progress?book=GEN&chapter=1  → { position_seconds, completed, playback_speed }
 * POST /api/audio/progress  body: { book, chapter, position_seconds, completed?, playback_speed? }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book");
  const chapter = searchParams.get("chapter");
  if (!book || !chapter) return NextResponse.json({ error: "book and chapter required" }, { status: 400 });

  const { data } = await supabase
    .from("audio_progress")
    .select("position_seconds, completed, playback_speed, readalong_on")
    .eq("user_id", user.id)
    .eq("book", book.toUpperCase())
    .eq("chapter", parseInt(chapter, 10))
    .maybeSingle();

  return NextResponse.json(data ?? { position_seconds: 0, completed: false, playback_speed: 1.0, readalong_on: true });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    book: string;
    chapter: number;
    position_seconds: number;
    completed?: boolean;
    playback_speed?: number;
    readalong_on?: boolean;
  };

  const { book, chapter, position_seconds, completed = false, playback_speed = 1.0, readalong_on = true } = body;

  const { error } = await supabase
    .from("audio_progress")
    .upsert(
      {
        user_id: user.id,
        book: book.toUpperCase(),
        chapter,
        position_seconds,
        completed,
        playback_speed,
        readalong_on,
        listened_at: new Date().toISOString(),
      },
      { onConflict: "user_id,book,chapter" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
