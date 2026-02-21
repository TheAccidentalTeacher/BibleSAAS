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
  bible_reading_font: BibleFont;
  font_size: number;
  default_reading_mode: ReadingMode;
  default_translation: string;
  gamification_enabled: boolean;
  spurgeon_layer: boolean;
  catechism_layer_enabled: boolean;
  tsk_layer_enabled: boolean;
  created_at: string;
  updated_at: string;
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
  role: "admin" | "member";
  color_hex: string;
  joined_at: string;
}

export interface ChapterRow {
  [key: string]: unknown;
  id: string;
  book_code: string;
  chapter_number: number;
  translation_code: string;
  verses: unknown; // JSON array from database
  full_text: string | null;
  expires_at: string | null;
  cached_at: string;
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
  book_code: string | null;
  chapter_number: number | null;
  entry_type: "oia" | "free" | "prayer" | "gratitude";
  content: unknown; // JSON
  created_at: string;
  updated_at: string;
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

export interface UserStreakRow {
  [key: string]: unknown;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  updated_at: string;
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
          bible_reading_font?: BibleFont;
          font_size?: number;
          default_reading_mode?: ReadingMode;
          default_translation?: string;
          gamification_enabled?: boolean;
          spurgeon_layer?: boolean;
          catechism_layer_enabled?: boolean;
          tsk_layer_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
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
        Insert: { family_unit_id: string; user_id: string; role?: "admin" | "member"; color_hex: string; id?: string; joined_at?: string };
        Update: Partial<Omit<FamilyMemberRow, "id">>;
        Relationships: [];
      };
      chapters: {
        Row: ChapterRow;
        Insert: { book_code: string; chapter_number: number; translation_code: string; verses: unknown; full_text?: string | null; expires_at?: string | null; id?: string; cached_at?: string };
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
        Insert: { user_id: string; book_code?: string | null; chapter_number?: number | null; entry_type: "oia" | "free" | "prayer" | "gratitude"; content: unknown; id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<JournalEntryRow, "id">>;
        Relationships: [];
      };
      reading_progress: {
        Row: ReadingProgressRow;
        Insert: { user_id: string; book_code: string; chapter_number: number; reading_plan_id?: string | null; id?: string; completed_at?: string };
        Update: Partial<Omit<ReadingProgressRow, "id">>;
        Relationships: [];
      };
      user_streaks: {
        Row: UserStreakRow;
        Insert: { user_id: string; current_streak?: number; longest_streak?: number; last_activity_date?: string | null; updated_at?: string };
        Update: Partial<Omit<UserStreakRow, "user_id">>;
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
      spurgeon_index: {
        Row: SpurgeonRow;
        Insert: { source: string; body: string; date_key?: string | null; book?: string | null; chapter?: number | null; verse?: number | null; title?: string | null; id?: string; meta?: unknown };
        Update: Partial<Omit<SpurgeonRow, "id">>;
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

