/**
 * app.ts — Shared application TypeScript interfaces
 * These are the runtime shapes used throughout the frontend.
 * DB-layer types (generated) live in src/types/database.ts
 */

import type { SubscriptionTier } from '@/lib/tier'

// ─── User & Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  display_name: string | null
  full_name: string | null
  nickname: string | null
  email: string | null
  age_range: string | null
  life_stage: string | null
  faith_stage: string | null
  church_background: string | null
  theological_depth: string | null
  primary_goal: string | null
  time_budget_min: number | null
  reading_cadence: string | null
  tone_preference: string | null
  // AI portrait
  living_portrait: string | null
  living_portrait_json: LivingPortraitJson | null
  portrait_updated_at: string | null
  profile_hash: string | null
  // Lifecycle
  onboarding_complete: boolean
  birthday: string | null
  deletion_requested_at: string | null
  // Subscription
  subscription_tier: SubscriptionTier
  subscription_expires_at: string | null
  stripe_customer_id: string | null
  // Companion
  active_companion_id: string | null
  // AI intelligence
  theological_fingerprint: Record<string, unknown>
  study_dna: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface LivingPortraitJson {
  who: string
  identity_lenses: string[]
  faith_journey: string
  study_patterns: string
  life_season: string
  tone_notes: string
  family_context: string
  notable_insights: string[]
  generated_at: string
  journal_entries_at_generation: number
}

// ─── Bible Reading ─────────────────────────────────────────────────────────────

export interface ChapterVerse {
  verse: number
  text: string
}

export interface Chapter {
  book: string
  chapter: number
  translation: string
  verses: ChapterVerse[]
  fetched_at: string
  expires_at: string | null
}

export type StudyMode = 'study' | 'pray' | 'listen'
export type TranslationSlug = 'ESV' | 'KJV' | 'WEB' | 'ASV' | 'YLT' | 'NIV' | 'NASB' | 'NLT' | 'CSB'

// ─── Personalized Content ─────────────────────────────────────────────────────

export interface PersonalizedContent {
  id: string
  user_id: string
  book: string
  chapter: number
  intro_text: string | null
  connections: ContentConnection[]
  question_ids: string[]
  questions: OIAQuestion[]
  word_note: WordNote | null
  closing_text: string | null
  profile_hash: string
  generated_at: string
  is_stale: boolean
}

export interface ContentConnection {
  type: 'life' | 'vocation' | 'athletic' | 'current_season' | 'faith_question'
  text: string
}

export interface OIAQuestion {
  oia_type: 'observe' | 'interpret' | 'apply'
  text: string
  answer_prompt: string | null
}

export interface WordNote {
  strongs_number: string
  original_word: string
  transliteration: string
  morphology: string
  short_def: string
  clarke_note: string | null
  charles_synthesis: string
}

// ─── Journal ───────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string
  user_id: string
  book: string
  chapter: number
  note: string | null
  studied_at: string
  is_lament_session: boolean
  answers?: JournalAnswer[]
}

export interface JournalAnswer {
  id: string
  journal_entry_id: string
  question_text: string
  oia_type: 'observe' | 'interpret' | 'apply'
  answer_text: string
  charles_response: string | null
}

// ─── Streaks & Gamification ────────────────────────────────────────────────────

export interface UserStreaks {
  current_streak: number
  longest_streak: number
  total_xp: number
  current_level: number
  streak_grace_used: boolean
  prayer_days_streaked: number
  prayer_longest_streak: number
}

export type XpEventType =
  | 'chapter_read'
  | 'journal_answer'
  | 'streak_day'
  | 'streak_7'
  | 'streak_30'
  | 'highlight_added'
  | 'memory_verse_reviewed'
  | 'memory_verse_mastered'
  | 'prayer_entry'
  | 'chapter_audio_complete'

// ─── Highlights ────────────────────────────────────────────────────────────────

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple'

export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#F5C842',
  green:  '#5DBB63',
  blue:   '#5B9BD5',
  pink:   '#E86B8A',
  orange: '#F0954A',
  purple: '#9B72CF',
}

export interface Highlight {
  id: string
  user_id: string
  book: string
  chapter: number
  verse_start: number
  verse_end: number
  color: HighlightColor
  annotation: string | null
  deleted_at: string | null
  created_at: string
}

// ─── Reading Plans ─────────────────────────────────────────────────────────────

export interface ReadingPlan {
  id: string
  name: string
  description: string | null
  total_days: number
  plan_type: string
}

export interface UserReadingPlan {
  id: string
  user_id: string
  plan_id: string
  start_date: string
  current_day: number
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  plan?: ReadingPlan
}

// ─── Companions ────────────────────────────────────────────────────────────────

export interface CompanionDefinition {
  id: string
  slug: string
  display_name: string
  tradition: string
  is_default: boolean
  is_custom: boolean
  price_usd: number | null
  icon_svg: string | null
}
