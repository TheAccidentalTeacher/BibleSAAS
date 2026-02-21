/**
 * Achievement definitions — client-safe (no server imports).
 *
 * This file is imported by both the server-side achievement engine
 * (achievements.ts) and client components (achievement-toast.tsx).
 */

export type AchievementCategory =
  | "prayer"
  | "reading"
  | "streaks"
  | "engagement"
  | "memory"
  | "word_study"
  | "special";

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  xp_value: number;
  icon: string;
  category: AchievementCategory;
  /** Minimum subscription tier required, e.g. "free" */
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
