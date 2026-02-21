/**
 * /api/reading-progress — Mark a chapter as read
 *
 * POST { book, chapter, plan_id? } → upsert into reading_progress,
 *   advance user_reading_plans.current_day if this matches today's plan chapter
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserReadingPlanRow, PlanChapterRow } from "@/types/database";

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

  // Update user_streaks
  const today = new Date().toISOString().slice(0, 10);
  const { data: streakData } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!streakData) {
    await supabase.from("user_streaks").insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
    });
  } else {
    const last = (streakData as { last_activity_date?: string | null }).last_activity_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let current = (streakData as { current_streak?: number }).current_streak ?? 0;
    if (last === today) {
      // already recorded today
    } else if (last === yesterday) {
      current += 1;
    } else {
      current = 1; // streak broken
    }
    const longest = Math.max(current, (streakData as { longest_streak?: number }).longest_streak ?? 0);
    await supabase
      .from("user_streaks")
      .update({ current_streak: current, longest_streak: longest, last_activity_date: today })
      .eq("user_id", user.id);
  }

  return NextResponse.json({ ok: true });
}
