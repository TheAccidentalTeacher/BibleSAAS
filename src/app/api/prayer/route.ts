/**
 * GET  /api/prayer  — list user's prayer journal entries (non-deleted)
 * POST /api/prayer  — create a new prayer + generate Charles note
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { PrayerJournalRow, ProfileRow } from "@/types/database";
import { buildContentSystemPrompt } from "@/lib/charles/content";
import { ANTHROPIC_MODEL } from "@/lib/charles/prompts";

// ── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // 'ongoing' | 'answered' | 'archived' | null = all
  const category = searchParams.get("category"); // filter by category

  let query = supabase
    .from("prayer_journal")
    .select(
      "id, title, body, category, status, answered_at, answered_note, passage_ref, linked_verse_text, tags, charles_note, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status as "ongoing" | "answered" | "archived");
  if (category) query = query.eq("category", category as PrayerJournalRow["category"]);

  const { data, error } = await query;

  if (error) {
    console.error("[prayer GET]", error.message);
    return NextResponse.json({ error: "Failed to load prayers" }, { status: 500 });
  }

  return NextResponse.json({ prayers: (data ?? []) as unknown as PrayerJournalRow[] });
}

// ── POST ─────────────────────────────────────────────────────────────────────
interface CreatePrayerBody {
  title?: string;
  body: string;
  category: PrayerJournalRow["category"];
  passage_ref?: string;
  linked_verse_text?: string;
  tags?: string[];
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: CreatePrayerBody;
  try {
    body = (await req.json()) as CreatePrayerBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.body?.trim()) {
    return NextResponse.json({ error: "Prayer body is required" }, { status: 400 });
  }

  const validCategories = ["praise", "thanksgiving", "petition", "intercession", "confession", "lament"];
  if (!validCategories.includes(body.category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Insert prayer entry
  const { data: prayer, error: insertError } = await supabase
    .from("prayer_journal")
    .insert({
      user_id: user.id,
      title: body.title?.trim() || null,
      body: body.body.trim(),
      category: body.category,
      passage_ref: body.passage_ref?.trim() || null,
      linked_verse_text: body.linked_verse_text?.trim() || null,
      tags: body.tags ?? [],
      status: "ongoing",
      reminder_enabled: false,
    })
    .select("*")
    .single();

  if (insertError || !prayer) {
    console.error("[prayer POST] insert failed:", insertError?.message);
    return NextResponse.json({ error: "Failed to create prayer" }, { status: 500 });
  }

  const prayerRow = prayer as unknown as PrayerJournalRow;

  // Generate Charles note (non-blocking for lament; try for all categories)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const profile = profileData as unknown as ProfileRow | null;
      const isLament = body.category === "lament";

      const systemPrompt = profile
        ? buildContentSystemPrompt({
            id: user.id,
            display_name: profile.display_name,
            age_range: profile.age_range,
            faith_stage: profile.faith_stage,
            tone_preference: profile.tone_preference,
            living_portrait: profile.living_portrait,
            subscription_tier: profile.subscription_tier,
          })
        : "You are Charles, a Reformed, gospel-centered Bible study companion.";

      const userMsg = isLament
        ? `A person has written a lament prayer:\n\n"${body.body}"\n\nRespond as Charles. Be pastoral, quiet, present. Don't fix or explain. 1-3 sentences only.`
        : `A person has written a ${body.category} prayer${body.linked_verse_text ? ` (inspired by: "${body.linked_verse_text}")` : ""}:\n\n"${body.body}"\n\nRespond as Charles — a brief, warm, encouraging word. 1-3 sentences only. Don't be sycophantic.`;

      const anthropic = new Anthropic({ apiKey });
      const msg = await anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 150,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      });

      const noteText =
        msg.content[0]?.type === "text" ? msg.content[0].text : null;

      if (noteText) {
        await supabase
          .from("prayer_journal")
          .update({ charles_note: { text: noteText, generated_at: new Date().toISOString() } })
          .eq("id", prayerRow.id);

        prayerRow.charles_note = { text: noteText, generated_at: new Date().toISOString() };
      }
    } catch (err) {
      // Charles note failure is non-fatal
      console.error("[prayer POST] Charles note failed:", err);
    }
  }

  return NextResponse.json({ prayer: prayerRow }, { status: 201 });
}
