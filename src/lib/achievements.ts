/**
 * Achievement system -- server-side engine.
 *
 * Types and definitions live in achievements-data.ts (client-safe).
 * This file contains only server-side functions.
 */

import { createClient } from "@/lib/supabase/server";
import type { AchievementRow, UserAchievementRow } from "@/types/database";
import { awardXP } from "./xp-server";
import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDef,
  type AchievementCategory,
} from "./achievements-data";

// Re-export for callers that only import from this module
export type { AchievementDef, AchievementCategory };
export { ACHIEVEMENT_DEFINITIONS };

// ── Trigger context shape ────────────────────────────────────────────────────
export interface AchievementTrigger {
  type:
    | "chapter_read"
    | "streak"
    | "journal_answer"
    | "memory_verse_mastered"
    | "trail_followed"
    | "book_completed";
  streak?: number;
  book?: string;
  chapter?: number;
  extra?: Record<string, unknown>;
}

// ── Check and award achievements for a user ──────────────────────────────────
export async function checkAndAwardAchievements(
  userId: string,
  trigger: AchievementTrigger
): Promise<string[]> {
  const supabase = await createClient();

  // Fetch all achievement defs from DB (populated by seed)
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order");
  const achievements = (allAchievements ?? []) as unknown as AchievementRow[];

  // Fetch already-earned achievements
  const { data: earnedData } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);
  const earnedIds = new Set(
    ((earnedData ?? []) as unknown as UserAchievementRow[]).map((r) => r.achievement_id)
  );

  // Determine which achievements the trigger could unlock
  const newlyEarned: string[] = [];

  for (const ach of achievements) {
    if (earnedIds.has(ach.id)) continue; // already earned

    const shouldAward = evaluateTrigger(ach.key, trigger);
    if (!shouldAward) continue;

    // Insert user_achievement record
    await supabase.from("user_achievements").insert({
      user_id: userId,
      achievement_id: ach.id,
    });

    // Award the XP bonus for this achievement
    await awardXP(userId, `achievement_${ach.key}`, ach.xp_value, { achievement: ach.key });

    newlyEarned.push(ach.key);
  }

  return newlyEarned;
}

// ── Evaluate if a trigger satisfies an achievement's unlock condition ─────────
function evaluateTrigger(key: string, trigger: AchievementTrigger): boolean {
  switch (key) {
    case "first_chapter":
      return trigger.type === "chapter_read";
    case "week_in_the_word":
      return trigger.type === "streak" && (trigger.streak ?? 0) >= 7;
    case "month_of_faithfulness":
      return trigger.type === "streak" && (trigger.streak ?? 0) >= 30;
    case "tsk_traveler":
      return trigger.type === "trail_followed";
    case "memory_keeper":
      return trigger.type === "memory_verse_mastered";
    case "first_answer":
      return trigger.type === "journal_answer";
    case "gospel_reader":
      return (
        trigger.type === "book_completed" &&
        ["Matthew", "Mark", "Luke", "John"].includes(trigger.book ?? "")
      );
    case "psalm_singer":
      return trigger.type === "book_completed" && trigger.book === "Psalms";
    default:
      return false;
  }
}

// ── Seed helper (call once from a migration or admin route) ──────────────────
export async function seedAchievements(): Promise<void> {
  const supabase = await createClient();
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await supabase.from("achievements").upsert(def, { onConflict: "key" });
  }
}
