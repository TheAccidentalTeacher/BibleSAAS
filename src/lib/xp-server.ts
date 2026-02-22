/**
 * xp-server.ts — Server-only XP award logic.
 *
 * Separated from xp.ts so that the pure constants/helpers in xp.ts
 * can be safely imported by client components without pulling in next/headers.
 */

import { createClient } from "@/lib/supabase/server";
import { XP_AMOUNTS, getLevelForXp } from "./xp";
import type { AwardXpResult } from "./xp";

export type { AwardXpResult };

export async function awardXP(
  userId: string,
  eventType: string,
  xpOverride?: number,
  context: Record<string, unknown> = {}
): Promise<AwardXpResult> {
  const supabase = await createClient();
  const xpEarned = xpOverride ?? XP_AMOUNTS[eventType] ?? 0;

  if (xpEarned <= 0) {
    const { data: s } = await supabase
      .from("streaks")
      .select("total_xp, current_level")
      .eq("user_id", userId)
      .maybeSingle();
    const totalXp = (s as { total_xp?: number } | null)?.total_xp ?? 0;
    return { xpEarned: 0, totalXp, level: getLevelForXp(totalXp), leveledUp: false };
  }

  await supabase.from("xp_events").insert({
    user_id: userId,
    event_type: eventType,
    xp_earned: xpEarned,
    context,
  });

  const { data: streakData } = await supabase
    .from("streaks")
    .select("total_xp, current_level")
    .eq("user_id", userId)
    .maybeSingle();

  const prevTotalXp = (streakData as { total_xp?: number } | null)?.total_xp ?? 0;
  const prevLevel = (streakData as { current_level?: number } | null)?.current_level ?? 1;
  const newTotalXp = prevTotalXp + xpEarned;
  const newLevelInfo = getLevelForXp(newTotalXp);
  const leveledUp = newLevelInfo.level > prevLevel;

  if (streakData) {
    await supabase
      .from("streaks")
      .update({ total_xp: newTotalXp, current_level: newLevelInfo.level })
      .eq("user_id", userId);
  } else {
    await supabase.from("streaks").upsert({
      user_id: userId,
      total_xp: newTotalXp,
      current_level: newLevelInfo.level,
      current_streak: 0,
      longest_streak: 0,
      total_days: 0,
    });
  }

  return { xpEarned, totalXp: newTotalXp, level: newLevelInfo, leveledUp };
}
