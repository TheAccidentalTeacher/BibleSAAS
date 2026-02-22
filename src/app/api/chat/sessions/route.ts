import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChatSessionRow } from "@/types/database";

/**
 * GET /api/chat/sessions
 * Returns the user's chat session list (most recent first, soft-deletes excluded).
 *
 * Query params:
 *   ?limit=20  (default 20, max 50)
 *   ?book=GEN&chapter=1  (filter to anchor)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limitParam = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const book = searchParams.get("book");
  const chapter = searchParams.get("chapter");

  let query = supabase
    .from("chat_sessions")
    .select("id, title, anchor_book, anchor_chapter, message_count, last_message_at, started_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("last_message_at", { ascending: false })
    .limit(limitParam);

  if (book) query = query.eq("anchor_book", book);
  if (chapter) query = query.eq("anchor_chapter", parseInt(chapter, 10));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ sessions: data ?? [] });
}

/**
 * POST /api/chat/sessions
 * Creates a new chat session. Returns the session row.
 *
 * Body: { anchorBook?, anchorChapter?, anchorVerse? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { anchorBook?: string; anchorChapter?: number; anchorVerse?: number } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      anchor_book: body.anchorBook ?? null,
      anchor_chapter: body.anchorChapter ?? null,
      anchor_verse: body.anchorVerse ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ session: data as ChatSessionRow }, { status: 201 });
}
