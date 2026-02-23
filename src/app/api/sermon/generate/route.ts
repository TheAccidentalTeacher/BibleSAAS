/**
 * POST /api/sermon/generate
 *
 * Generates a sermon outline (sermon / small_group / family_devotions)
 * for a given Bible chapter using Charles AI, saves to sermon_outlines table,
 * and returns the generated JSON.
 *
 * Body: { book, bookName, chapter, mode, chapterText }
 * Response: { outlineId, outline: SermonOutlineJSON }
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  ANTHROPIC_MODEL,
  buildSermonOutlineSystem,
  buildSermonOutlinePrompt,
  type SermonOutlineMode,
  type SermonOutlineJSON,
} from "@/lib/charles/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    book?: string;
    bookName?: string;
    chapter?: number;
    mode?: string;
    chapterText?: string;
  };
  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { book, bookName, chapter, mode = "sermon", chapterText = "" } = body;

  if (!book || !bookName || !chapter) {
    return NextResponse.json(
      { error: "book, bookName, and chapter are required" },
      { status: 400 }
    );
  }

  const validModes: SermonOutlineMode[] = ["sermon", "small_group", "family_devotions"];
  if (!validModes.includes(mode as SermonOutlineMode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const outlineMode = mode as SermonOutlineMode;
  const passageRef = `${bookName} ${chapter}`;

  // ── Check for existing recent outline (within 48 hours for same mode) ──────
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingData } = await (supabase as any)
    .from("sermon_outlines")
    .select("id, generated_json")
    .eq("user_id", user.id)
    .eq("book", book)
    .eq("chapter_start", chapter)
    .eq("outline_mode", outlineMode)
    .gte("created_at", fortyEightHoursAgo)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingData) {
    return NextResponse.json({
      outlineId: existingData.id as string,
      outline: existingData.generated_json as SermonOutlineJSON,
      cached: true,
    });
  }

  // ── Generate via Anthropic ─────────────────────────────────────────────────
  const systemPrompt = buildSermonOutlineSystem(outlineMode);
  const userPrompt = buildSermonOutlinePrompt(bookName, chapter, chapterText, outlineMode);

  let rawContent: string;
  try {
    const message = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const block = message.content[0];
    rawContent = block?.type === "text" ? block.text : "";
  } catch (err) {
    console.error("[sermon/generate] Anthropic error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }

  // ── Parse JSON response ───────────────────────────────────────────────────
  let outline: SermonOutlineJSON;
  try {
    // Strip markdown code fences if present
    const cleaned = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    outline = JSON.parse(cleaned) as SermonOutlineJSON;
  } catch (err) {
    console.error("[sermon/generate] JSON parse error:", err, "\nRaw:", rawContent);
    return NextResponse.json({ error: "Failed to parse outline JSON" }, { status: 500 });
  }

  // ── Save to DB ────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: savedRow, error: saveError } = await (supabase as any)
    .from("sermon_outlines")
    .insert({
      user_id: user.id,
      passage_ref: passageRef,
      book,
      chapter_start: chapter,
      outline_mode: outlineMode,
      generated_json: outline,
      is_saved: false,
    })
    .select("id")
    .single();

  if (saveError) {
    console.error("[sermon/generate] DB save error:", saveError);
    // Still return the outline even if save fails
    return NextResponse.json({ outlineId: null, outline });
  }

  return NextResponse.json({
    outlineId: (savedRow as { id: string }).id,
    outline,
    cached: false,
  });
}

// ── GET — fetch saved outlines for a chapter ──────────────────────────────────
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book");
  const chapter = searchParams.get("chapter");

  if (!book || !chapter) {
    return NextResponse.json({ error: "book and chapter are required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("sermon_outlines")
    .select("id, outline_mode, passage_ref, created_at, is_saved, user_notes")
    .eq("user_id", user.id)
    .eq("book", book)
    .eq("chapter_start", parseInt(chapter, 10))
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ outlines: data ?? [] });
}

// ── PATCH — save/unsave or add user notes ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { outlineId?: string; isSaved?: boolean; userNotes?: string };
  const { outlineId, isSaved, userNotes } = body;

  if (!outlineId) {
    return NextResponse.json({ error: "outlineId required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (isSaved !== undefined) updates.is_saved = isSaved;
  if (userNotes !== undefined) updates.user_notes = userNotes;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("sermon_outlines")
    .update(updates)
    .eq("id", outlineId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
