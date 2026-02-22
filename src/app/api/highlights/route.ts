/**
 * /api/highlights — CRUD for verse highlights
 *
 * GET  ?book=GEN&chapter=1          → all highlights for (user, book, chapter)
 * POST { book, chapter, verse_start, verse_end?, color, note? }  → create
 * PATCH { id, color?, note? }        → update color or note
 * DELETE { id }                      → soft-delete
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { HighlightRow } from "@/types/database";
import { awardXP } from "@/lib/xp-server";

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const book = url.searchParams.get("book");
  const chapter = url.searchParams.get("chapter");

  if (!book || !chapter) {
    return NextResponse.json({ error: "book and chapter required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("user_id", user.id)
    .eq("book", book)
    .eq("chapter", parseInt(chapter, 10))
    .is("deleted_at", null)
    .order("verse_start");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const highlights = (data as unknown as HighlightRow[]) ?? [];
  return NextResponse.json({ highlights });
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    book: string;
    chapter: number;
    verse_start: number;
    verse_end?: number;
    color: string;
    note?: string;
  };

  const VALID_COLORS = ["yellow", "green", "blue", "pink", "orange", "purple"];
  if (!VALID_COLORS.includes(body.color)) {
    return NextResponse.json({ error: "Invalid color" }, { status: 400 });
  }

  // Upsert: if same (user, book, chapter, verse_start, verse_end), update color/note
  const { data, error } = await supabase
    .from("highlights")
    .upsert(
      {
        user_id: user.id,
        book: body.book,
        chapter: body.chapter,
        verse_start: body.verse_start,
        verse_end: body.verse_end ?? null,
        color: body.color,
        note: body.note ?? null,
        deleted_at: null,
      },
      { onConflict: "user_id,book,chapter,verse_start" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Award XP for adding a highlight (fire-and-forget)
  void awardXP(user.id, "highlight_added");
  return NextResponse.json({ highlight: data as unknown as HighlightRow });
}

// ── PATCH ───────────────────────────────────────────────────────────────────
export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: string; color?: string; note?: string | null };

  const updates: Record<string, unknown> = {};
  if (body.color !== undefined) updates.color = body.color;
  if (body.note !== undefined) updates.note = body.note;

  const { data, error } = await supabase
    .from("highlights")
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ highlight: data as unknown as HighlightRow });
}

// ── DELETE ──────────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: string };

  const { error } = await supabase
    .from("highlights")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", body.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
