/**
 * /api/reading-progress — Mark a chapter as read
 *
 * POST { book, chapter, plan_id? } → upsert into reading_progress,
 *   advance user_reading_plans.current_day if this matches today's plan chapter
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserReadingPlanRow, PlanChapterRow } from "@/types/database";
import { recordStudyActivity } from "@/lib/streaks";
import { awardXP } from "@/lib/xp-server";
import { checkAndAwardAchievements } from "@/lib/achievements";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { book: string; chapter: number; plan_id?: string };

  // Upsert into reading_progress
  await supabase.from("reading_progress").upsert(
    {
      user_id: user.id,
      book_code: body.book,
      chapter_number: body.chapter,
      reading_plan_id: body.plan_id ?? null,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,book_code,chapter_number" }
  );

  // If user has an active plan, check if this chapter is today's and advance current_day
  const { data: activePlanData } = await supabase
    .from("user_reading_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  const activePlan = activePlanData as unknown as UserReadingPlanRow | null;
  if (activePlan) {
    // Find today's plan chapter
    const { data: todayData } = await supabase
      .from("plan_chapters")
      .select("*")
      .eq("plan_id", activePlan.plan_id)
      .eq("day_number", activePlan.current_day)
      .maybeSingle();

    const today = todayData as unknown as PlanChapterRow | null;
    if (today && today.book === body.book && today.chapter === body.chapter) {
      await supabase
        .from("user_reading_plans")
        .update({ current_day: activePlan.current_day + 1 })
        .eq("id", activePlan.id);
    }
  }

  // Update streak + award reading XP + check achievements
  const streak = await recordStudyActivity(user.id, "chapter_read");
  const xpResult = await awardXP(user.id, "chapter_read");
  const earned = await checkAndAwardAchievements(user.id, {
    type: "chapter_read",
    book: body.book,
    chapter: body.chapter,
  });

  // ── Geographic discovery side-effect ────────────────────────────────────────
  // Look up which locations are mentioned in this book+chapter
  const { data: passageLocs } = await supabase
    .from("passage_locations")
    .select("location_id")
    .eq("book", body.book)
    .eq("chapter", body.chapter);

  let newlyDiscovered: string[] = [];
  if (passageLocs && passageLocs.length > 0) {
    const locationIds = passageLocs.map((p: { location_id: string }) => p.location_id);

    // Check which are already discovered by this user
    const { data: existing } = await supabase
      .from("user_map_discoveries")
      .select("location_id")
      .eq("user_id", user.id)
      .in("location_id", locationIds);

    const alreadyFound = new Set((existing ?? []).map((e: { location_id: string }) => e.location_id));
    newlyDiscovered = locationIds.filter((id) => !alreadyFound.has(id));

    if (locationIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("user_map_discoveries") as any).upsert(
        locationIds.map((locationId: string) => ({
          user_id: user.id,
          location_id: locationId,
          discovered_via_book: body.book,
          discovered_via_chapter: body.chapter,
        })),
        { onConflict: "user_id,location_id" }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    streak: streak.current_streak,
    xp: xpResult,
    achievements: earned,
    newlyDiscovered,
  });
}
