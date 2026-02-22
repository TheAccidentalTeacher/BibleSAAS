/**
 * Subscription tiers and feature access control.
 * All tier checks should flow through canAccess() — never hardcode tier comparisons inline.
 */

export const SUBSCRIPTION_TIERS = ['free', 'standard', 'premium', 'your_edition'] as const
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]

/** Numeric rank for tier comparison. Higher = more access. */
const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  standard: 1,
  premium: 2,
  your_edition: 3,
}

/**
 * Feature → minimum tier required.
 * Keep this in sync with feature_toggles.tier_required in the DB.
 */
const FEATURE_TIERS: Record<string, SubscriptionTier> = {
  // Free tier
  web_kjv_reading: 'free',
  vault_commentary: 'free',
  basic_streaks: 'free',
  offline_reading: 'free', // WEB/KJV only

  // Standard tier
  esv_reading: 'standard',
  api_bible_translations: 'standard',
  ai_questions: 'standard',
  journal: 'standard',
  highlights: 'standard',
  prayer_journal: 'standard',
  reading_plans: 'standard',
  memory_verses: 'standard',

  // Premium tier
  full_personalization: 'premium',
  spurgeon_layer: 'premium',
  tsk_cross_refs: 'premium',
  word_study: 'premium',
  trails: 'premium',
  audio: 'premium',
  xp_gamification: 'premium',
  character_cards: 'premium',
  geography_map: 'premium',
  community_groups: 'premium',

  // Your Edition tier
  companion_selection: 'your_edition',
  sermon_outlines: 'your_edition',
  data_export: 'your_edition',
  year_in_review: 'your_edition',
  weekly_charles_letters: 'your_edition',
  catechism_layer: 'your_edition',
}

/**
 * Returns true if a user on `userTier` can access `feature`.
 * Unknown features return true (allow by default — use the DB feature_toggles table for finer control).
 */
export function canAccess(feature: string, userTier: SubscriptionTier): boolean {
  const requiredTier = FEATURE_TIERS[feature]
  if (!requiredTier) return true
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier]
}

/** Returns the minimum tier required for a feature, or null if not gated. */
export function getRequiredTier(feature: string): SubscriptionTier | null {
  return FEATURE_TIERS[feature] ?? null
}

/** Returns true if userTier meets or exceeds the required tier. */
export function meetsMinimumTier(
  userTier: SubscriptionTier,
  minimumTier: SubscriptionTier
): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[minimumTier]
}

/** Human-readable tier display names */
export const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: "Reader",
  standard: "Disciple",
  premium: "Scholar",
  your_edition: "Living Bible",
};

export type BillingInterval = "monthly" | "annual";

/** Marketing tier data for the /profile/upgrade page */
export const TIER_MARKETING = [
  {
    tier: "free" as SubscriptionTier,
    name: "Reader",
    price: { monthly: 0, annual: 0 },
    tagline: "Start your journey — free forever",
    features: [
      "Bible reading (WEB, KJV, ASV, YLT)",
      "Chapter-by-chapter progress",
      "Bookmarks & highlights",
      "Streak tracking",
      "Vault commentary (classic Spurgeon)",
    ],
    cta: null, // current plan indicator, no action
  },
  {
    tier: "standard" as SubscriptionTier,
    name: "Disciple",
    price: { monthly: 9, annual: 79 },
    tagline: "Your personal study companion",
    features: [
      "Everything in Reader",
      "Charles AI commentary (personalized)",
      "OIA Study Questions",
      "Chat with Charles",
      "All translations (ESV, NASB, NIV, CSB…)",
      "Memory verse system",
      "Prayer journal",
      "Weekly letter from Charles",
    ],
    highlight: true,
    cta: "Start 7-day free trial",
  },
  {
    tier: "premium" as SubscriptionTier,
    name: "Scholar",
    price: { monthly: 19, annual: 159 },
    tagline: "Deep study, multiple perspectives",
    features: [
      "Everything in Disciple",
      "Audio player",
      "Compare up to 4 translations",
      "TSK cross-references (detailed)",
      "PDF export",
      "Word study tools",
      "Trail system (cross-reference chains)",
    ],
    cta: "Start 7-day free trial",
  },
  {
    tier: "your_edition" as SubscriptionTier,
    name: "Living Bible",
    price: { monthly: 39, annual: 299 },
    tagline: "A Bible that knows you deeply",
    features: [
      "Everything in Scholar",
      "Persona Builder (custom companion)",
      "Your Edition branding",
      "Birthday letters & verse vault",
      "Year in Review",
      "Family sharing (up to 6)",
    ],
    cta: "Start 7-day free trial",
  },
] as const;

