/**
 * /api/bookmarks — CRUD for verse bookmarks
 *
 * GET  ?book=GEN&chapter=1   → all bookmarks for (user, book, chapter)
 * GET  (no params)            → all bookmarks for user (for profile page)
 * POST { book, chapter, verse?, label? }  → create (upsert)
 * DELETE { id }               → remove
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BookmarkRow } from "@/types/database";

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const book = url.searchParams.get("book");
  const chapter = url.searchParams.get("chapter");

  let query = supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (book) query = query.eq("book", book);
  if (chapter) query = query.eq("chapter", parseInt(chapter, 10));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const bookmarks = (data as unknown as BookmarkRow[]) ?? [];
  return NextResponse.json({ bookmarks });
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    book: string;
    chapter: number;
    verse?: number;
    label?: string;
  };

  const { data, error } = await supabase
    .from("bookmarks")
    .upsert(
      {
        user_id: user.id,
        book: body.book,
        chapter: body.chapter,
        verse: body.verse ?? null,
        label: body.label ?? null,
      },
      { onConflict: "user_id,book,chapter,verse" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookmark: data as unknown as BookmarkRow });
}

// ── DELETE ──────────────────────────────────────────────────────────────────
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: string };

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", body.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
