/**
 * POST /api/cron/daily-trail
 *
 * Generates today's daily trail pair (morning + evening reading).
 * Called by Vercel Cron at midnight UTC.
 *
 * Table: daily_trails (trail_date, slot, origin_book, origin_chapter, origin_verse)
 * Security: validates Authorization header against CRON_SECRET env var.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // misconfigured — deny
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Check if today's trails already exist
  const { data: existing } = await supabase
    .from("daily_trails")
    .select("id, slot")
    .eq("trail_date", today);

  if (existing && existing.length >= 2) {
    return NextResponse.json({ ok: true, message: "Trails already exist for today" });
  }

  const existingSlots = new Set((existing ?? []).map((r) => (r as { slot: string }).slot));

  // Pick passages using a simple deterministic rotation by day-of-year
  const { BIBLE_BOOKS } = await import("@/lib/bible");
  const oldTestament = BIBLE_BOOKS.filter((b) => b.testament === "OT");
  const newTestament = BIBLE_BOOKS.filter((b) => b.testament === "NT");

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const morningBook = oldTestament[dayOfYear % oldTestament.length];
  const eveningBook = newTestament[dayOfYear % newTestament.length];
  const morningChapter = (dayOfYear % morningBook.chapters) + 1;
  const eveningChapter = (dayOfYear % eveningBook.chapters) + 1;

  const inserts: Array<{ trail_date: string; slot: "morning" | "evening"; origin_book: string; origin_chapter: number; origin_verse: number }> = [];

  if (!existingSlots.has("morning")) {
    inserts.push({
      trail_date: today,
      slot: "morning",
      origin_book: morningBook.code,
      origin_chapter: morningChapter,
      origin_verse: 1,
    });
  }

  if (!existingSlots.has("evening")) {
    inserts.push({
      trail_date: today,
      slot: "evening",
      origin_book: eveningBook.code,
      origin_chapter: eveningChapter,
      origin_verse: 1,
    });
  }

  if (!inserts.length) {
    return NextResponse.json({ ok: true, message: "Both slots already filled" });
  }

  const { error } = await supabase.from("daily_trails").insert(inserts);

  if (error) {
    console.error("[cron/daily-trail] insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    morning: `${morningBook.code} ${morningChapter}`,
    evening: `${eveningBook.code} ${eveningChapter}`,
  });
}
