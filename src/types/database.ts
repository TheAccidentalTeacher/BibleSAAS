/**
 * database.ts — Supabase database type definitions
 *
 * ⚠️  HAND-WRITTEN STUBS — replace with generated output once connected:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 *
 * These stubs match the schema defined in sql/01-13 and are kept
 * type-safe until a real Supabase project is connected.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type SubscriptionTier = "free" | "standard" | "premium" | "your_edition";
export type ReadingMode = "read" | "study";
export type BibleFont = "eb_garamond" | "lora" | "merriweather" | "literata" | "system_serif";
export type VisualTheme = "default" | "runner" | "home" | "library" | "garden" | "puzzle";

// ─── Table row types ──────────────────────────────────────────────────────────

export interface ProfileRow {
  [key: string]: unknown;
  id: string;
  email: string;
  display_name: string | null;
  nickname: string | null;
  age_range: string | null;
  life_stage: string | null;
  faith_stage: string | null;
  church_background: string | null;
  theological_depth: string | null;
  primary_goal: string | null;
  time_budget_min: number | null;
  reading_cadence: string | null;
  tone_preference: string | null;
  living_portrait: string | null;
  living_portrait_json: unknown | null;
  portrait_updated_at: string | null;
  subscription_tier: SubscriptionTier;
  onboarding_complete: boolean;
  onboarding_completed_at: string | null;
  active_companion_id: string | null;
  gifted_by: string | null;
  gifted_message: string | null;
  gifted_message_visible: boolean;
  gifted_reveal_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_expires_at: string | null;
  profile_hash: string | null;
  birthday: string | null;
  theological_fingerprint: unknown;
  study_dna: unknown;
  fingerprint_updated_at: string | null;
  deletion_requested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDisplaySettingsRow {
  [key: string]: unknown;
  user_id: string;
  visual_theme: VisualTheme;
  theme: "dark" | "light" | "sepia";
  bible_reading_font: BibleFont;
  font_size: "small" | "medium" | "large" | "xlarge";
  default_study_mode: "study" | "pray" | "listen";
  translation: string;
  gamification_enabled: boolean;
  catechism_layer_enabled: boolean;
  show_verse_numbers: boolean;
  show_red_letter: boolean;
  show_cross_refs: boolean;
  show_on_this_day: boolean;
  just_read_default: boolean;
  meta: Record<string, unknown>;
}

export interface NotificationSettingsRow {
  [key: string]: unknown;
  user_id: string;
  email_digest: boolean;
  email_verse_thread: boolean;
  email_system: boolean;
  push_enabled: boolean;
  morning_trail_time: string | null;
  evening_trail_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInterestRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  interest: string;
  created_at: string;
}

export interface FamilyUnitRow {
  [key: string]: unknown;
  id: string;
  name: string;
  created_by: string;
  accent_color: string | null;
  created_at: string;
}

export interface FamilyMemberRow {
  [key: string]: unknown;
  id: string;
  family_unit_id: string;
  user_id: string;
  role: string;
  share_progress: boolean;
  share_highlights: boolean;
  read_receipts_visible: boolean;
  joined_at: string;
}

export interface ChapterRow {
  [key: string]: unknown;
  id: string;
  book: string;
  chapter: number;
  translation: string;
  text_json: unknown; // JSON array of {verse, text} objects
  fetched_at: string;
  expires_at: string | null;
  chapter_themes: unknown | null;
  meta: unknown | null;
}

export interface StrongsLexiconRow {
  [key: string]: unknown;
  id: string;
  strongs_number: string;
  language: "hebrew" | "greek";
  original_word: string;
  transliteration: string | null;
  pronunciation: string | null;
  part_of_speech: string | null;
  short_def: string | null;
  long_def: string | null;
  usage_notes: string | null;
  kjv_usage: string | null;
  source: string | null;
  hebrew_root: string | null;
  root_strongs: string | null;
  semantic_domain: string | null;
  occurrence_heatmap: Record<string, unknown>;
  total_occurrences: number;
  charles_study: Record<string, unknown>;
  charles_study_at: string | null;
  meta: Record<string, unknown>;
}

export interface MorphologyDataRow {
  [key: string]: unknown;
  id: string;
  book: string;
  chapter: number;
  verse: number;
  word_position: number;
  original_word: string;
  normalized_form: string | null;
  strongs_number: string | null;
  language: "hebrew" | "greek" | null;
  morphology_code: string | null;
  morphology_desc: string | null;
  meta: Record<string, unknown>;
}

export interface UserWordStudyHistoryRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  strongs_number: string;
  first_studied_at: string;
  last_studied_at: string;
  study_count: number;
  source_book: string | null;
  source_chapter: number | null;
  meta: Record<string, unknown>;
}

export interface BibleDictionaryEntryRow {
  [key: string]: unknown;
  id: string;
  source: string;
  term: string;
  slug: string;
  body: string;
  passage_refs: string[];
  charles_note: string | null;
  is_primary_source: boolean;
  meta: Record<string, unknown>;
}

export interface UserLibraryHistoryRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  entry_type: string;
  entry_id: string;
  entry_slug: string | null;
  entry_label: string | null;
  first_visited_at: string;
  last_visited_at: string;
  visit_count: number;
  meta: Record<string, unknown>;
}

export interface HymnIndexRow {
  [key: string]: unknown;
  id: string;
  title: string;
  first_line: string | null;
  author: string | null;
  year_written: number | null;
  tune_name: string | null;
  meter: string | null;
  lyrics: string;
  explicit_refs: string[];
  thematic_tags: string[];
  meta: Record<string, unknown>;
}

export interface CommentaryEntryRow {
  [key: string]: unknown;
  id: string;
  source: string;
  book: string;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  section_title: string | null;
  body: string;
  is_vault_featured: boolean;
  meta: Record<string, unknown>;
}

export interface BibleCharacterRow {
  [key: string]: unknown;
  id: string;
  name: string;
  alternate_names: string[] | null;
  primary_role: string | null;
  era: string | null;
  tribe_nation: string | null;
  first_mention_book: string | null;
  first_mention_chapter: number | null;
  first_mention_verse: number | null;
  description: string | null;
  is_athlete_of_faith: boolean;
  is_in_hebrews_11: boolean;
  rarity: "faithful" | "renowned" | "mighty" | "eternal" | "the_word";
  meta: Record<string, unknown>;
}

export interface CatechismEntryRow {
  [key: string]: unknown;
  id: string;
  catechism: "WSC" | "WLC" | "HC";
  question_number: number;
  lord_day: number | null;
  section: string | null;
  question_text: string;
  answer_text: string;
  scripture_refs: string[] | null;
  proof_texts: Array<{ ref: string; book?: string; chapter?: number; verse?: number; note?: string }>;
  keywords: string[] | null;
  charles_note: string | null;
  meta: Record<string, unknown>;
}

export interface WordOccurrenceRow {
  [key: string]: unknown;
  id: string;
  strongs_number: string;
  book: string;
  chapter: number;
  verse: number;
  count: number;
  meta: Record<string, unknown>;
}

export interface HighlightRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number | null;
  color: string;
  note: string | null;
  created_at: string;
  deleted_at: string | null;
  meta: Record<string, unknown>;
}

export interface BookmarkRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  verse: number | null;
  label: string | null;
  created_at: string;
  meta: Record<string, unknown>;
}

export interface JournalEntryRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  studied_at: string;
  just_read_mode: boolean;
  note: string | null;
  voice_note_url: string | null;
  voice_note_duration_seconds: number | null;
  voice_note_transcript: string | null;
  voice_note_transcribed_at: string | null;
  is_lament_session: boolean;
  follow_up_at: string | null;
  deleted_at: string | null;
  response_note: string | null;
  responded_at: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export type PrayerCategory =
  | "praise"
  | "thanksgiving"
  | "petition"
  | "intercession"
  | "confession"
  | "lament";

export interface PrayerJournalRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  category: PrayerCategory;
  status: "ongoing" | "answered" | "archived";
  answered_at: string | null;
  answered_note: string | null;
  passage_ref: string | null;
  linked_verse_text: string | null;
  tags: string[] | null;
  reminder_enabled: boolean;
  reminder_time: string | null;
  reminder_days: string[] | null;
  reminder_last_sent: string | null;
  charles_note: Record<string, unknown> | null;
  shared_with: string[] | null;
  hymn_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  meta: Record<string, unknown>;
}

export interface ReadingProgressRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  book_code: string;
  chapter_number: number;
  completed_at: string;
  reading_plan_id: string | null;
}

export interface StreakRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null; // date string YYYY-MM-DD
  total_days: number;
  total_xp: number;
  current_level: number;
  streak_grace_used: boolean;
  streak_grace_last_used: string | null;
  prayer_days_streaked: number;
  prayer_longest_streak: number;
  prayer_last_active: string | null;
  meta: Record<string, unknown>;
}

/** @deprecated Use StreakRow + 'streaks' table. Kept for backwards compat. */
export type UserStreakRow = StreakRow;

export interface AchievementRow {
  [key: string]: unknown;
  id: string;
  key: string;
  name: string;
  description: string | null;
  xp_value: number;
  icon: string | null;
  category: "reading" | "streaks" | "engagement" | "memory" | "prayer" | "word_study" | "special";
  tier_required: string;
  is_hidden: boolean;
  sort_order: number;
  meta: Record<string, unknown>;
}

export interface UserAchievementRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  meta: Record<string, unknown>;
}

export interface XpEventRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  event_type: string;
  xp_earned: number;
  context: Record<string, unknown>;
  created_at: string;
}

export interface OnboardingConversationRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  messages: unknown; // JSON array of {role, content} objects
  profile_extracted: boolean;
  extracted_json: unknown | null; // JSON profile extraction result
  created_at: string;
  completed_at: string | null;
}

export interface ReadingPlanRow {
  [key: string]: unknown;
  id: string;
  name: string;
  type: string; // 'sequential' | 'chronological' | 'topical' | 'single_book' | 'custom'
  description: string | null;
  book_filter: string | null; // null = all books
  is_default: boolean;
  is_system: boolean;
  meta: Record<string, unknown>;
  created_at: string;
  // virtual: total_days (count of plan_chapters)
  total_days?: number;
}

export interface PlanChapterRow {
  [key: string]: unknown;
  id: string;
  plan_id: string;
  day_number: number;
  book: string;
  chapter: number;
  section_label: string | null;
}

export interface UserReadingPlanRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  current_day: number;
  active: boolean;
  completed_at: string | null;
  meta: Record<string, unknown>;
}

export interface PersonalizedContentRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  intro_text: string | null;
  connections: unknown | null; // [{type:'life', text:'...'}]
  question_ids: string[] | null;
  questions: unknown | null; // [{oia_type, text, answer_prompt}]
  word_note: unknown | null; // {strongs_number, original_word, ...}
  closing_text: string | null;
  profile_hash: string;
  generated_at: string;
  is_stale: boolean;
  meta: unknown;
}

export interface JournalAnswerRow {
  [key: string]: unknown;
  id: string;
  entry_id: string;
  user_id: string;
  question_id: string | null;
  oia_type: "observe" | "interpret" | "apply" | null;
  question_text: string | null;
  answer_text: string | null;
  charles_response: string | null;
  deleted_at: string | null;
  meta: unknown;
  created_at: string;
}

export interface SpurgeonRow {
  [key: string]: unknown;
  id: string;
  source: string; // 'morning_evening' | 'treasury_of_david' | 'sermon'
  date_key: string | null;
  book: string | null;
  chapter: number | null;
  verse: number | null;
  title: string | null;
  body: string;
  meta: unknown;
}

export interface TskReferenceRow {
  [key: string]: unknown;
  id: string;
  from_book: string;
  from_chapter: number;
  from_verse: number;
  to_book: string;
  to_chapter: number;
  to_verse: number;
  meta: Record<string, unknown>;
}

export interface TskVerseStatRow {
  [key: string]: unknown;
  id: string;
  book: string;
  chapter: number;
  verse: number;
  reference_count: number;
  density_tier: string; // generated: 'rare'|'low'|'medium'|'high'|'very_high'
}

export interface DailyTrailRow {
  [key: string]: unknown;
  id: string;
  trail_date: string;
  slot: "morning" | "evening";
  origin_book: string;
  origin_chapter: number;
  origin_verse: number;
  ai_rationale: string | null;
  community_stats: Record<string, unknown>;
  created_at: string;
  meta: Record<string, unknown>;
}

export interface CrossReferenceTrailRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  name: string | null;
  trail_type: "free" | "daily_morning" | "daily_evening" | "thread_needle";
  daily_trail_id: string | null;
  origin_book: string;
  origin_chapter: number;
  origin_verse: number;
  step_count: number;
  share_token: string;
  is_public: boolean;
  svg_cache: string | null;
  svg_generated_at: string | null;
  created_at: string;
  completed_at: string | null;
  meta: Record<string, unknown>;
}

export interface TrailStepRow {
  [key: string]: unknown;
  id: string;
  trail_id: string;
  step_order: number;
  book: string;
  chapter: number;
  verse: number;
  note: string | null;
  meta: Record<string, unknown>;
}

export interface ThreadDefinitionRow {
  [key: string]: unknown;
  id: string;
  book: string;
  thread_key: string;
  thread_name: string;
  description: string | null;
  target_refs: string[] | null;
  sort_order: number | null;
  meta: Record<string, unknown>;
}

export interface UserTrailThreadRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  thread_id: string;
  completing_trail_id: string | null;
  pulled_at: string;
  meta: Record<string, unknown>;
}

export type MemoryReviewMode = "flashcard" | "fill_blank" | "word_order" | "all";

export interface MemoryVerseRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  verse: number;
  verse_text: string;
  translation: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string; // date string YYYY-MM-DD
  last_reviewed: string | null;
  mastered: boolean;
  practice_count: number;
  review_mode: MemoryReviewMode;
  added_from: "reading" | "journal" | "search" | "suggestion" | "family_share";
  memory_type: "verse" | "catechism_qa";
  catechism_entry_id: string | null;
  meta: Record<string, unknown>;
}

export interface MemoryVerseReviewRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  memory_verse_id: string;
  reviewed_at: string;
  review_mode: "flashcard" | "fill_blank" | "word_order";
  quality: number; // 0–5
  ease_factor_after: number | null;
  interval_after: number | null;
  repetitions_after: number | null;
  time_taken_seconds: number | null;
  meta: Record<string, unknown>;
}

export interface AudioProgressRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  position_seconds: number;
  completed: boolean;
  listened_at: string;
  playback_speed: number;
  auto_advance: boolean;
  readalong_on: boolean;
  meta: Record<string, unknown>;
}

export interface VerseThreadMessageRow {
  [key: string]: unknown;
  id: string;
  family_unit_id: string;
  sender_id: string;
  book: string;
  chapter: number;
  verse: number;
  body: string;
  parent_id: string | null;
  delivery_date: string | null;
  read_by: Record<string, string>;
  created_at: string;
  deleted_at: string | null;
  meta: Record<string, unknown>;
}

export interface SharedContentRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  content_type: "verse" | "highlight" | "journal_answer" | "trail" | "streak";
  source_id: string | null;
  payload: Record<string, unknown>;
  share_token: string;
  is_active: boolean;
  view_count: number;
  created_at: string;
  expires_at: string | null;
  meta: Record<string, unknown>;
}

export interface ChatSessionRow {
  [key: string]: unknown;
  id: string;
  user_id: string;
  companion_id: string | null;
  anchor_book: string | null;
  anchor_chapter: number | null;
  anchor_verse: number | null;
  title: string | null;
  message_count: number;
  token_count: number;
  model_used: string | null;
  started_at: string;
  last_message_at: string;
  closed_at: string | null;
  deleted_at: string | null;
  meta: Record<string, unknown>;
}

export interface ChatMessageRow {
  [key: string]: unknown;
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  input_tokens: number;
  output_tokens: number;
  content_source: "live" | "vault" | "cached";
  suggested_questions: Array<{ text: string }>;
  thumbs_up: boolean | null;
  flagged: boolean;
  created_at: string;
  meta: Record<string, unknown>;
}

// ─── Database type (Supabase-compatible shape) ────────────────────────────────
// NOTE: `Relationships: []` is required by postgrest-js GenericTable —
// it will NOT resolve table types without it.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          nickname?: string | null;
          age_range?: string | null;
          life_stage?: string | null;
          faith_stage?: string | null;
          church_background?: string | null;
          theological_depth?: string | null;
          primary_goal?: string | null;
          time_budget_min?: number | null;
          reading_cadence?: string | null;
          tone_preference?: string | null;
          living_portrait?: string | null;
          living_portrait_json?: unknown | null;
          portrait_updated_at?: string | null;
          subscription_tier?: SubscriptionTier;
          onboarding_complete?: boolean;
          onboarding_completed_at?: string | null;
          active_companion_id?: string | null;
          gifted_by?: string | null;
          gifted_message?: string | null;
          gifted_message_visible?: boolean;
          gifted_reveal_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_expires_at?: string | null;
          profile_hash?: string | null;
          birthday?: string | null;
          deletion_requested_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfileRow, "id" | "created_at">>;
        Relationships: [];
      };
      user_display_settings: {
        Row: UserDisplaySettingsRow;
        Insert: {
          user_id: string;
          visual_theme?: VisualTheme;
          theme?: "dark" | "light" | "sepia";
          bible_reading_font?: BibleFont;
          font_size?: "small" | "medium" | "large" | "xlarge";
          default_study_mode?: "study" | "pray" | "listen";
          translation?: string;
          gamification_enabled?: boolean;
          catechism_layer_enabled?: boolean;
          show_verse_numbers?: boolean;
          show_red_letter?: boolean;
          show_cross_refs?: boolean;
          show_on_this_day?: boolean;
          just_read_default?: boolean;
          meta?: Record<string, unknown>;
        };
        Update: Partial<Omit<UserDisplaySettingsRow, "user_id">>;
        Relationships: [];
      };
      notification_settings: {
        Row: NotificationSettingsRow;
        Insert: {
          user_id: string;
          email_digest?: boolean;
          email_verse_thread?: boolean;
          email_system?: boolean;
          push_enabled?: boolean;
          morning_trail_time?: string | null;
          evening_trail_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<NotificationSettingsRow, "user_id">>;
        Relationships: [];
      };
      profile_interests: {
        Row: ProfileInterestRow;
        Insert: { user_id: string; interest: string; id?: string; created_at?: string };
        Update: Partial<Omit<ProfileInterestRow, "id">>;
        Relationships: [];
      };
      family_units: {
        Row: FamilyUnitRow;
        Insert: { name: string; created_by: string; accent_color?: string | null; id?: string; created_at?: string };
        Update: Partial<Omit<FamilyUnitRow, "id">>;
        Relationships: [];
      };
      family_members: {
        Row: FamilyMemberRow;
        Insert: { family_unit_id: string; user_id: string; role?: string; share_progress?: boolean; share_highlights?: boolean; read_receipts_visible?: boolean; id?: string; joined_at?: string };
        Update: Partial<Omit<FamilyMemberRow, "id">>;
        Relationships: [];
      };
      chapters: {
        Row: ChapterRow;
        Insert: { book: string; chapter: number; translation: string; text_json: unknown; expires_at?: string | null; fetched_at?: string; chapter_themes?: unknown | null; meta?: unknown | null; id?: string };
        Update: Partial<Omit<ChapterRow, "id">>;
        Relationships: [];
      };
      highlights: {
        Row: HighlightRow;
        Insert: { user_id: string; book: string; chapter: number; verse_start: number; verse_end?: number | null; color: string; note?: string | null; id?: string; created_at?: string; deleted_at?: string | null; meta?: Record<string, unknown> };
        Update: Partial<Omit<HighlightRow, "id">>;
        Relationships: [];
      };
      bookmarks: {
        Row: BookmarkRow;
        Insert: { user_id: string; book: string; chapter: number; verse?: number | null; label?: string | null; id?: string; created_at?: string; meta?: Record<string, unknown> };
        Update: Partial<Omit<BookmarkRow, "id">>;
        Relationships: [];
      };
      journal_entries: {
        Row: JournalEntryRow;
        Insert: {
          user_id: string;
          book: string;
          chapter: number;
          studied_at?: string;
          just_read_mode?: boolean;
          note?: string | null;
          voice_note_url?: string | null;
          is_lament_session?: boolean;
          follow_up_at?: string | null;
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<JournalEntryRow, "id">>;
        Relationships: [];
      };
      prayer_journal: {
        Row: PrayerJournalRow;
        Insert: {
          user_id: string;
          body: string;
          category: PrayerCategory;
          title?: string | null;
          status?: "ongoing" | "answered" | "archived";
          answered_at?: string | null;
          answered_note?: string | null;
          passage_ref?: string | null;
          linked_verse_text?: string | null;
          tags?: string[] | null;
          reminder_enabled?: boolean;
          charles_note?: Record<string, unknown> | null;
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PrayerJournalRow, "id">>;
        Relationships: [];
      };
      reading_progress: {
        Row: ReadingProgressRow;
        Insert: { user_id: string; book_code: string; chapter_number: number; reading_plan_id?: string | null; id?: string; completed_at?: string };
        Update: Partial<Omit<ReadingProgressRow, "id">>;
        Relationships: [];
      };
      streaks: {
        Row: StreakRow;
        Insert: { user_id: string; current_streak?: number; longest_streak?: number; last_active_date?: string | null; total_days?: number; total_xp?: number; current_level?: number; streak_grace_used?: boolean; streak_grace_last_used?: string | null; prayer_days_streaked?: number; prayer_longest_streak?: number; prayer_last_active?: string | null; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<StreakRow, "id">>;
        Relationships: [];
      };
      achievements: {
        Row: AchievementRow;
        Insert: { key: string; name: string; description?: string | null; xp_value?: number; icon?: string | null; category?: AchievementRow["category"]; tier_required?: string; is_hidden?: boolean; sort_order?: number; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<AchievementRow, "id">>;
        Relationships: [];
      };
      user_achievements: {
        Row: UserAchievementRow;
        Insert: { user_id: string; achievement_id: string; earned_at?: string; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<UserAchievementRow, "id">>;
        Relationships: [];
      };
      xp_events: {
        Row: XpEventRow;
        Insert: { user_id: string; event_type: string; xp_earned: number; context?: Record<string, unknown>; id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
      onboarding_conversations: {
        Row: OnboardingConversationRow;
        Insert: { user_id: string; messages: unknown; profile_extracted?: boolean; extracted_json?: unknown | null; id?: string; created_at?: string; completed_at?: string | null };
        Update: Partial<Omit<OnboardingConversationRow, "id">>;
        Relationships: [];
      };
      personalized_content: {
        Row: PersonalizedContentRow;
        Insert: { user_id: string; book: string; chapter: number; profile_hash: string; intro_text?: string | null; connections?: unknown | null; question_ids?: string[] | null; questions?: unknown | null; word_note?: unknown | null; closing_text?: string | null; id?: string; generated_at?: string; is_stale?: boolean; meta?: unknown };
        Update: Partial<Omit<PersonalizedContentRow, "id">>;
        Relationships: [];
      };
      journal_answers: {
        Row: JournalAnswerRow;
        Insert: { entry_id: string; user_id: string; oia_type: "observe" | "interpret" | "apply"; question_text?: string | null; answer_text?: string | null; charles_response?: string | null; question_id?: string | null; id?: string; created_at?: string; deleted_at?: string | null; meta?: unknown };
        Update: Partial<Omit<JournalAnswerRow, "id">>;
        Relationships: [];
      };
      memory_verses: {
        Row: MemoryVerseRow;
        Insert: {
          user_id: string;
          book: string;
          chapter: number;
          verse: number;
          verse_text: string;
          translation?: string;
          ease_factor?: number;
          interval_days?: number;
          repetitions?: number;
          next_review?: string;
          mastered?: boolean;
          practice_count?: number;
          review_mode?: MemoryReviewMode;
          added_from?: "reading" | "journal" | "search" | "suggestion" | "family_share";
          memory_type?: "verse" | "catechism_qa";
          catechism_entry_id?: string | null;
          meta?: Record<string, unknown>;
          id?: string;
          last_reviewed?: string | null;
        };
        Update: Partial<Omit<MemoryVerseRow, "id">>;
        Relationships: [];
      };
      memory_verse_reviews: {
        Row: MemoryVerseReviewRow;
        Insert: {
          user_id: string;
          memory_verse_id: string;
          review_mode: "flashcard" | "fill_blank" | "word_order";
          quality: number;
          ease_factor_after?: number | null;
          interval_after?: number | null;
          repetitions_after?: number | null;
          time_taken_seconds?: number | null;
          meta?: Record<string, unknown>;
          id?: string;
          reviewed_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      audio_progress: {
        Row: AudioProgressRow;
        Insert: {
          user_id: string;
          book: string;
          chapter: number;
          position_seconds?: number;
          completed?: boolean;
          playback_speed?: number;
          auto_advance?: boolean;
          readalong_on?: boolean;
          meta?: Record<string, unknown>;
          id?: string;
          listened_at?: string;
        };
        Update: Partial<Omit<AudioProgressRow, "id">>;
        Relationships: [];
      };
      verse_thread_messages: {
        Row: VerseThreadMessageRow;
        Insert: {
          family_unit_id: string;
          sender_id: string;
          book: string;
          chapter: number;
          verse: number;
          body: string;
          parent_id?: string | null;
          delivery_date?: string | null;
          read_by?: Record<string, string>;
          deleted_at?: string | null;
          meta?: Record<string, unknown>;
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<VerseThreadMessageRow, "id">>;
        Relationships: [];
      };
      shared_content: {
        Row: SharedContentRow;
        Insert: {
          user_id: string;
          content_type: SharedContentRow["content_type"];
          payload: Record<string, unknown>;
          source_id?: string | null;
          share_token?: string;
          is_active?: boolean;
          view_count?: number;
          expires_at?: string | null;
          meta?: Record<string, unknown>;
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<SharedContentRow, "id">>;
        Relationships: [];
      };
      strongs_lexicon: {
        Row: StrongsLexiconRow;
        Insert: {
          strongs_number: string;
          language: "hebrew" | "greek";
          original_word: string;
          transliteration?: string | null;
          short_def?: string | null;
          long_def?: string | null;
          total_occurrences?: number;
          occurrence_heatmap?: Record<string, unknown>;
          charles_study?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<StrongsLexiconRow, "id">>;
        Relationships: [];
      };
      morphology_data: {
        Row: MorphologyDataRow;
        Insert: {
          book: string;
          chapter: number;
          verse: number;
          word_position: number;
          original_word: string;
          normalized_form?: string | null;
          strongs_number?: string | null;
          language?: "hebrew" | "greek" | null;
          morphology_code?: string | null;
          morphology_desc?: string | null;
          meta?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<MorphologyDataRow, "id">>;
        Relationships: [];
      };
      user_word_study_history: {
        Row: UserWordStudyHistoryRow;
        Insert: {
          user_id: string;
          strongs_number: string;
          first_studied_at?: string;
          last_studied_at?: string;
          study_count?: number;
          source_book?: string | null;
          source_chapter?: number | null;
          meta?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<UserWordStudyHistoryRow, "id">>;
        Relationships: [];
      };
      bible_dictionary_entries: {
        Row: BibleDictionaryEntryRow;
        Insert: {
          source: string;
          term: string;
          slug: string;
          body: string;
          passage_refs?: string[];
          charles_note?: string | null;
          is_primary_source?: boolean;
          meta?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<BibleDictionaryEntryRow, "id">>;
        Relationships: [];
      };
      user_library_history: {
        Row: UserLibraryHistoryRow;
        Insert: {
          user_id: string;
          entry_type: string;
          entry_id: string;
          entry_slug?: string | null;
          entry_label?: string | null;
          first_visited_at?: string;
          last_visited_at?: string;
          visit_count?: number;
          meta?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<UserLibraryHistoryRow, "id">>;
        Relationships: [];
      };
      hymn_index: {
        Row: HymnIndexRow;
        Insert: {
          title: string;
          first_line?: string | null;
          author?: string | null;
          year_written?: number | null;
          tune_name?: string | null;
          meter?: string | null;
          lyrics: string;
          explicit_refs?: string[];
          thematic_tags?: string[];
          meta?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<HymnIndexRow, "id">>;
        Relationships: [];
      };
      commentary_entries: {
        Row: CommentaryEntryRow;
        Insert: {
          source: string;
          book: string;
          chapter: number;
          verse_start?: number | null;
          verse_end?: number | null;
          section_title?: string | null;
          body: string;
          is_vault_featured?: boolean;
          meta?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<CommentaryEntryRow, "id">>;
        Relationships: [];
      };
      bible_characters: {
        Row: BibleCharacterRow;
        Insert: {
          name: string;
          alternate_names?: string[] | null;
          primary_role?: string | null;
          era?: string | null;
          tribe_nation?: string | null;
          first_mention_book?: string | null;
          first_mention_chapter?: number | null;
          first_mention_verse?: number | null;
          description?: string | null;
          is_athlete_of_faith?: boolean;
          is_in_hebrews_11?: boolean;
          rarity?: "faithful" | "renowned" | "mighty" | "eternal" | "the_word";
          meta?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<BibleCharacterRow, "id">>;
        Relationships: [];
      };
      catechism_entries: {
        Row: CatechismEntryRow;
        Insert: {
          catechism: "WSC" | "WLC" | "HC";
          question_number: number;
          lord_day?: number | null;
          section?: string | null;
          question_text: string;
          answer_text: string;
          scripture_refs?: string[] | null;
          proof_texts?: Array<{ ref: string; book?: string; chapter?: number; verse?: number; note?: string }>;
          keywords?: string[] | null;
          charles_note?: string | null;
          meta?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<CatechismEntryRow, "id">>;
        Relationships: [];
      };
      word_occurrences: {
        Row: WordOccurrenceRow;
        Insert: {
          strongs_number: string;
          book: string;
          chapter: number;
          verse: number;
          count?: number;
          meta?: Record<string, unknown>;
          id?: string;
        };
        Update: Partial<Omit<WordOccurrenceRow, "id">>;
        Relationships: [];
      };
      spurgeon_index: {
        Row: SpurgeonRow;
        Insert: { source: string; body: string; date_key?: string | null; book?: string | null; chapter?: number | null; verse?: number | null; title?: string | null; id?: string; meta?: unknown };
        Update: Partial<Omit<SpurgeonRow, "id">>;
        Relationships: [];
      };
      tsk_references: {
        Row: TskReferenceRow;
        Insert: { from_book: string; from_chapter: number; from_verse: number; to_book: string; to_chapter: number; to_verse: number; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<TskReferenceRow, "id">>;
        Relationships: [];
      };
      tsk_verse_stats: {
        Row: TskVerseStatRow;
        Insert: { book: string; chapter: number; verse: number; reference_count: number; id?: string };
        Update: Partial<Omit<TskVerseStatRow, "id">>;
        Relationships: [];
      };
      daily_trails: {
        Row: DailyTrailRow;
        Insert: { trail_date: string; slot: "morning" | "evening"; origin_book: string; origin_chapter: number; origin_verse: number; ai_rationale?: string | null; community_stats?: Record<string, unknown>; meta?: Record<string, unknown>; id?: string; created_at?: string };
        Update: Partial<Omit<DailyTrailRow, "id">>;
        Relationships: [];
      };
      cross_reference_trails: {
        Row: CrossReferenceTrailRow;
        Insert: { user_id: string; origin_book: string; origin_chapter: number; origin_verse: number; name?: string | null; trail_type?: "free" | "daily_morning" | "daily_evening" | "thread_needle"; daily_trail_id?: string | null; share_token?: string; is_public?: boolean; meta?: Record<string, unknown>; id?: string; created_at?: string };
        Update: Partial<Omit<CrossReferenceTrailRow, "id">>;
        Relationships: [];
      };
      trail_steps: {
        Row: TrailStepRow;
        Insert: { trail_id: string; step_order: number; book: string; chapter: number; verse: number; note?: string | null; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<TrailStepRow, "id">>;
        Relationships: [];
      };
      thread_definitions: {
        Row: ThreadDefinitionRow;
        Insert: { book: string; thread_key: string; thread_name: string; description?: string | null; target_refs?: string[] | null; sort_order?: number | null; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<ThreadDefinitionRow, "id">>;
        Relationships: [];
      };
      user_trail_threads: {
        Row: UserTrailThreadRow;
        Insert: { user_id: string; thread_id: string; completing_trail_id?: string | null; pulled_at?: string; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<UserTrailThreadRow, "id">>;
        Relationships: [];
      };
      reading_plans: {
        Row: ReadingPlanRow;
        Insert: { name: string; type: string; description?: string | null; book_filter?: string | null; is_default?: boolean; is_system?: boolean; meta?: Record<string, unknown>; id?: string; created_at?: string };
        Update: Partial<Omit<ReadingPlanRow, "id">>;
        Relationships: [];
      };
      plan_chapters: {
        Row: PlanChapterRow;
        Insert: { plan_id: string; day_number: number; book: string; chapter: number; section_label?: string | null; id?: string };
        Update: Partial<Omit<PlanChapterRow, "id">>;
        Relationships: [];
      };
      user_reading_plans: {
        Row: UserReadingPlanRow;
        Insert: { user_id: string; plan_id: string; started_at?: string; current_day?: number; active?: boolean; completed_at?: string | null; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<UserReadingPlanRow, "id">>;
        Relationships: [];
      };
      chat_sessions: {
        Row: ChatSessionRow;
        Insert: { user_id: string; companion_id?: string | null; anchor_book?: string | null; anchor_chapter?: number | null; anchor_verse?: number | null; title?: string | null; model_used?: string | null; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<ChatSessionRow, "id" | "user_id" | "started_at">>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessageRow;
        Insert: { session_id: string; user_id: string; role: "user" | "assistant" | "system"; content: string; input_tokens?: number; output_tokens?: number; content_source?: "live" | "vault" | "cached"; suggested_questions?: Array<{ text: string }>; meta?: Record<string, unknown>; id?: string };
        Update: Partial<Omit<ChatMessageRow, "id" | "session_id" | "user_id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      subscription_tier: SubscriptionTier;
    };
  };
};

// ─── Convenience helpers ──────────────────────────────────────────────────────

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

