/**
 * PATCH /api/prayer/[id]  — update status, mark answered, edit prayer
 * DELETE /api/prayer/[id] — soft delete
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface PatchBody {
  status?: "ongoing" | "answered" | "archived";
  answered_note?: string;
  title?: string;
  body?: string;
  tags?: string[];
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Build update object — only include provided fields
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.status !== undefined) {
    update.status = body.status;
    if (body.status === "answered") {
      update.answered_at = new Date().toISOString();
    }
  }
  if (body.answered_note !== undefined) update.answered_note = body.answered_note;
  if (body.title !== undefined) update.title = body.title || null;
  if (body.body !== undefined) update.body = body.body;
  if (body.tags !== undefined) update.tags = body.tags;

  const { data, error } = await supabase
    .from("prayer_journal")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id) // RLS + ownership check
    .select("*")
    .single();

  if (error) {
    console.error("[prayer PATCH]", error.message);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ prayer: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from("prayer_journal")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[prayer DELETE]", error.message);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
