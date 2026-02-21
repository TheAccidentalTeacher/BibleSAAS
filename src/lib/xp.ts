/**
 * XP & leveling system
 *
 * XP amounts and level thresholds live here so they can be referenced
 * from multiple places (API routes, lib functions, client UI).
 */

import { createClient } from "@/lib/supabase/server";

// ── XP amounts ──────────────────────────────────────────────────────────────
export const XP_AMOUNTS: Record<string, number> = {
  chapter_read: 10,
  journal_answer: 5, // capped at 25/session by caller
  streak_day: 5,
  streak_7: 50,
  streak_30: 200,
  highlight_added: 2,
  memory_verse_reviewed: 5,
  memory_verse_mastered: 50,
  prayer_entry: 10,
  chapter_audio_complete: 8,
};

// ── Level thresholds ─────────────────────────────────────────────────────────
export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextLevelXp: number | null; // null = max level
}

const LEVEL_TABLE: Array<{ level: number; title: string; minXp: number }> = [
  { level: 1, minXp: 0,    title: "Seeker"   },
  { level: 2, minXp: 100,  title: "Reader"   },
  { level: 3, minXp: 300,  title: "Student"  },
  { level: 4, minXp: 600,  title: "Disciple" },
  { level: 5, minXp: 1000, title: "Faithful" },
  { level: 6, minXp: 2000, title: "Scholar"  },
  { level: 7, minXp: 4000, title: "Sage"     },
  { level: 8, minXp: 8000, title: "Witness"  },
];

export function getLevelForXp(xp: number): LevelInfo {
  let found = LEVEL_TABLE[0];
  for (const l of LEVEL_TABLE) {
    if (xp >= l.minXp) found = l;
  }
  const idx = LEVEL_TABLE.indexOf(found);
  const next = LEVEL_TABLE[idx + 1] ?? null;
  return {
    level: found.level,
    title: found.title,
    minXp: found.minXp,
    nextLevelXp: next?.minXp ?? null,
  };
}

// ── Award XP ─────────────────────────────────────────────────────────────────
export interface AwardXpResult {
  xpEarned: number;
  totalXp: number;
  level: LevelInfo;
  leveledUp: boolean;
}

export async function awardXP(
  userId: string,
  eventType: string,
  xpOverride?: number,
  context: Record<string, unknown> = {}
): Promise<AwardXpResult> {
  const supabase = await createClient();
  const xpEarned = xpOverride ?? XP_AMOUNTS[eventType] ?? 0;

  if (xpEarned <= 0) {
    // Still need to return current state
    const { data: s } = await supabase
      .from("streaks")
      .select("total_xp, current_level")
      .eq("user_id", userId)
      .maybeSingle();
    const totalXp = (s as { total_xp?: number } | null)?.total_xp ?? 0;
    const prevLevel = (s as { current_level?: number } | null)?.current_level ?? 1;
    return { xpEarned: 0, totalXp, level: getLevelForXp(totalXp), leveledUp: false };
  }

  // Insert XP event
  await supabase.from("xp_events").insert({
    user_id: userId,
    event_type: eventType,
    xp_earned: xpEarned,
    context,
  });

  // Fetch current streak row to get total_xp
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
    // First XP for this user — upsert streaks row
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
