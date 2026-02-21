/**
 * Achievement system
 *
 * Defines all achievement seeds and the function that checks / awards them.
 * Called after user activity events (streak milestones, completions, etc.).
 */

import { createClient } from "@/lib/supabase/server";
import type { AchievementRow, UserAchievementRow } from "@/types/database";
import { awardXP } from "./xp";

// ── Achievement definitions ──────────────────────────────────────────────────
export type AchievementCategory = "prayer" | "reading" | "streaks" | "engagement" | "memory" | "word_study" | "special";

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  xp_value: number;
  icon: string;
  category: AchievementCategory;
  /** Minimum subscription tier required to earn this achievement, e.g. "free" */
  tier_required: string;
  is_hidden: boolean;
  sort_order: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  {
    key: "first_chapter",
    name: "First Chapter",
    description: "Read your first Bible chapter.",
    xp_value: 20,
    icon: "book-open",
    category: "reading",
    tier_required: "free",
    is_hidden: false,
    sort_order: 10,
  },
  {
    key: "week_in_the_word",
    name: "Week in the Word",
    description: "Read every day for 7 days in a row.",
    xp_value: 75,
    icon: "flame",
    category: "streaks",
    tier_required: "free",
    is_hidden: false,
    sort_order: 20,
  },
  {
    key: "month_of_faithfulness",
    name: "Month of Faithfulness",
    description: "Maintain a 30-day reading streak.",
    xp_value: 250,
    icon: "medal",
    category: "streaks",
    tier_required: "free",
    is_hidden: false,
    sort_order: 30,
  },
  {
    key: "tsk_traveler",
    name: "TSK Traveler",
    description: "Follow a cross-reference trail.",
    xp_value: 30,
    icon: "git-fork",
    category: "engagement",
    tier_required: "free",
    is_hidden: false,
    sort_order: 40,
  },
  {
    key: "memory_keeper",
    name: "Memory Keeper",
    description: "Master your first memory verse.",
    xp_value: 60,
    icon: "star",
    category: "memory",
    tier_required: "free",
    is_hidden: false,
    sort_order: 50,
  },
  {
    key: "first_answer",
    name: "First Answer",
    description: "Submit your first OIA journal answer.",
    xp_value: 15,
    icon: "pencil",
    category: "engagement",
    tier_required: "free",
    is_hidden: false,
    sort_order: 60,
  },
  {
    key: "gospel_reader",
    name: "Gospel Reader",
    description: "Complete all four Gospels.",
    xp_value: 300,
    icon: "cross",
    category: "reading",
    tier_required: "free",
    is_hidden: false,
    sort_order: 70,
  },
  {
    key: "psalm_singer",
    name: "Psalm Singer",
    description: "Read all 150 Psalms.",
    xp_value: 400,
    icon: "music-notes",
    category: "reading",
    tier_required: "free",
    is_hidden: false,
    sort_order: 80,
  },
];

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
