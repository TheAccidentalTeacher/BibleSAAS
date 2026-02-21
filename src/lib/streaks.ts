/**
 * Streak engine
 *
 * Tracks daily reading/prayer streaks with a one-day grace mechanism.
 * After every activity call, awards streak-day XP and fires bonus awards
 * for milestone streaks (7, 30).
 */

import { createClient } from "@/lib/supabase/server";
import type { StreakRow } from "@/types/database";
import { awardXP } from "./xp";
import { checkAndAwardAchievements } from "./achievements";

export type ActivityType =
  | "chapter_read"
  | "journal_answer"
  | "prayer_entry"
  | "highlight_added"
  | "memory_verse_reviewed"
  | "memory_verse_mastered";

const MS_PER_DAY = 86_400_000;

function dateStr(offset = 0): string {
  return new Date(Date.now() - offset * MS_PER_DAY).toISOString().slice(0, 10);
}

// ── Record a study/prayer activity and update the streak ───────────────────
export async function recordStudyActivity(
  userId: string,
  activityType: ActivityType
): Promise<StreakRow> {
  const supabase = await createClient();
  const today = dateStr(0);
  const yesterday = dateStr(1);

  const { data: existing } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const row = existing as unknown as StreakRow | null;

  if (!row) {
    // Brand-new user — create streak row
    await supabase.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
      total_days: 1,
      total_xp: 0,
      current_level: 1,
      streak_grace_used: false,
    });
    await awardXP(userId, "streak_day");
    await checkAndAwardAchievements(userId, { type: "streak", streak: 1 });
    const { data: created } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return created as unknown as StreakRow;
  }

  // Already recorded activity today — nothing to do
  if (row.last_active_date === today) return row;

  // Handle prayer-specific tracking separately
  if (activityType === "prayer_entry") {
    await _updatePrayerStreak(supabase, userId, row, today, yesterday);
  }

  // ── Compute new calendar streak ──────────────────────────────────────────
  let current = row.current_streak;
  let graceUsed = row.streak_grace_used;
  let graceLast = row.streak_grace_last_used;

  if (row.last_active_date === yesterday) {
    // Consecutive day — keep going
    current += 1;
    // Reset grace eligibility after 7 consecutive days post-grace
    if (graceUsed && graceLast) {
      const daysSinceGrace = Math.floor(
        (new Date(today).getTime() - new Date(graceLast).getTime()) / MS_PER_DAY
      );
      if (daysSinceGrace >= 7) {
        graceUsed = false;
        graceLast = null;
      }
    }
  } else {
    // Gap detected
    const daysSinceLast = row.last_active_date
      ? Math.floor(
          (new Date(today).getTime() - new Date(row.last_active_date).getTime()) / MS_PER_DAY
        )
      : 999;

    if (daysSinceLast === 2 && !graceUsed) {
      // Exactly 1 missed day — apply grace
      current += 1;
      graceUsed = true;
      graceLast = today;
    } else {
      current = 1; // streak broken
    }
  }

  const longest = Math.max(current, row.longest_streak);
  const totalDays = row.total_days + 1;

  const updates: Partial<StreakRow> = {
    current_streak: current,
    longest_streak: longest,
    last_active_date: today,
    total_days: totalDays,
    streak_grace_used: graceUsed,
    streak_grace_last_used: graceLast,
  };

  await supabase.from("streaks").update(updates).eq("user_id", userId);

  // ── XP awards ──────────────────────────────────────────────────────────
  await awardXP(userId, "streak_day");
  if (current === 7)  await awardXP(userId, "streak_7",  50,  { streak: 7  });
  if (current === 30) await awardXP(userId, "streak_30", 200, { streak: 30 });

  // ── Achievement checks ──────────────────────────────────────────────────
  await checkAndAwardAchievements(userId, { type: "streak", streak: current });

  const { data: updated } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return updated as unknown as StreakRow;
}

// ── Prayer-streak sub-update ─────────────────────────────────────────────────
async function _updatePrayerStreak(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  row: StreakRow,
  today: string,
  yesterday: string
) {
  if (row.prayer_last_active === today) return;

  let prayerStreak = row.prayer_days_streaked;
  if (row.prayer_last_active === yesterday) {
    prayerStreak += 1;
  } else {
    prayerStreak = 1;
  }
  const prayerLongest = Math.max(prayerStreak, row.prayer_longest_streak);

  await supabase
    .from("streaks")
    .update({
      prayer_days_streaked: prayerStreak,
      prayer_longest_streak: prayerLongest,
      prayer_last_active: today,
    })
    .eq("user_id", userId);

  await awardXP(userId, "prayer_entry");
}
