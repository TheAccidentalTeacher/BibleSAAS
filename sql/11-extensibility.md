# 11 — Extensibility

Future-facing tables: cross-reference trails, audio progress, external integrations, and onboarding conversations. These exist now so foreign keys and features can hook in without schema migrations.

---

```sql
-- ============================================================
-- DAILY TRAILS (system-generated morning + evening starting verses)
-- Two per day, AI-selected based on community reading plan position.
-- Mirrors Spurgeon's Morning & Evening rhythm.
-- ============================================================
CREATE TABLE daily_trails (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_date      date NOT NULL,
  slot            text NOT NULL CHECK (slot IN ('morning', 'evening')),
  origin_book     text NOT NULL,
  origin_chapter  integer NOT NULL,
  origin_verse    integer NOT NULL,
  ai_rationale    text,                     -- why Claude chose this verse today
  community_stats jsonb DEFAULT '{}',       -- updated throughout the day: {participants, longest_trail, etc.}
  created_at      timestamptz DEFAULT now(),
  meta            jsonb DEFAULT '{}',
  UNIQUE(trail_date, slot)
);

CREATE INDEX idx_daily_trails_date ON daily_trails(trail_date);


-- ============================================================
-- CROSS-REFERENCE TRAILS
-- User builds a personal trail through cross-references.
-- Supports all four modes: free, daily (morning/evening), thread_needle.
-- ============================================================
CREATE TABLE cross_reference_trails (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text,                     -- user-named trail
  trail_type      text DEFAULT 'free'
                    CHECK (trail_type IN ('free', 'daily_morning', 'daily_evening', 'thread_needle')),
  daily_trail_id  uuid REFERENCES daily_trails(id),   -- set when responding to a daily challenge
  origin_book     text NOT NULL,
  origin_chapter  integer NOT NULL,
  origin_verse    integer NOT NULL,
  step_count      integer DEFAULT 0,        -- denormalized for fast display in trail pill
  -- Sharing
  share_token     text UNIQUE DEFAULT gen_random_uuid()::text,  -- public read-only link token
  is_public       boolean DEFAULT false,    -- must be true for share_token to work
  -- Visualization
  svg_cache       text,                     -- cached SVG string of D3 constellation render
  svg_generated_at timestamptz,
  created_at      timestamptz DEFAULT now(),
  completed_at    timestamptz,
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_trails_user ON cross_reference_trails(user_id, created_at DESC);
CREATE INDEX idx_trails_share ON cross_reference_trails(share_token) WHERE is_public = true;
CREATE INDEX idx_trails_daily ON cross_reference_trails(daily_trail_id) WHERE daily_trail_id IS NOT NULL;


CREATE TABLE trail_steps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id        uuid NOT NULL REFERENCES cross_reference_trails(id) ON DELETE CASCADE,
  step_order      integer NOT NULL,
  book            text NOT NULL,
  chapter         integer NOT NULL,
  verse           integer NOT NULL,
  note            text,                     -- what the user noticed here
  meta            jsonb DEFAULT '{}',
  UNIQUE(trail_id, step_order)
);


ALTER TABLE cross_reference_trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trails" ON cross_reference_trails
  USING (auth.uid() = user_id OR is_public = true);

ALTER TABLE trail_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trail steps" ON trail_steps
  USING (auth.uid() = (SELECT user_id FROM cross_reference_trails WHERE id = trail_id)
      OR (SELECT is_public FROM cross_reference_trails WHERE id = trail_id) = true);


-- ============================================================
-- THREAD DEFINITIONS (12 canonical threads per book)
-- The structured hunt that gives long-term purpose to TSK exploration.
-- These are authored/curated — not AI-generated.
-- ============================================================
CREATE TABLE thread_definitions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book            text NOT NULL,
  thread_key      text NOT NULL,            -- slug: 'atonement', 'covenant', 'rest', 'exile'
  thread_name     text NOT NULL,            -- display: 'The Thread of Rest'
  description     text,
  target_refs     text[],                   -- ['Gen 2:2', 'Ex 20:8', 'Heb 4:9'] — all verses in this thread
  sort_order      integer,
  meta            jsonb DEFAULT '{}',
  UNIQUE(book, thread_key)
);

CREATE INDEX idx_thread_book ON thread_definitions(book);


-- ============================================================
-- USER TRAIL THREADS (which threads each user has pulled)
-- ============================================================
CREATE TABLE user_trail_threads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id       uuid NOT NULL REFERENCES thread_definitions(id),
  completing_trail_id uuid REFERENCES cross_reference_trails(id),
  pulled_at       timestamptz DEFAULT now(),
  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, thread_id)
);

CREATE INDEX idx_user_threads ON user_trail_threads(user_id);

ALTER TABLE user_trail_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own threads" ON user_trail_threads USING (auth.uid() = user_id);




-- ============================================================
-- AUDIO PROGRESS
-- Track ESV Audio listen position per chapter
-- ============================================================
CREATE TABLE audio_progress (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book             text NOT NULL,
  chapter          integer NOT NULL,
  position_seconds numeric DEFAULT 0,      -- last known playback position
  completed        boolean DEFAULT false,
  listened_at      timestamptz DEFAULT now(),
  -- User audio preferences (stored here until volume warrants a proper settings field)
  playback_speed   numeric DEFAULT 1.0,    -- 0.75, 1.0, 1.25, 1.5, 2.0
  auto_advance     boolean DEFAULT false,  -- opt-in: auto-queue next chapter on completion
  readalong_on     boolean DEFAULT true,   -- read-along highlight enabled for this user
  meta             jsonb DEFAULT '{}',
  UNIQUE(user_id, book, chapter)
);

ALTER TABLE audio_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own audio progress" ON audio_progress USING (auth.uid() = user_id);


-- ============================================================
-- CHAPTER AUDIO TIMESTAMPS (verse-level sync data for read-along)
-- Generated once at import time via forced alignment (aeneas/gentle).
-- Shared across all users -- not per-user.
-- ============================================================
CREATE TABLE chapter_audio_timestamps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book            text NOT NULL,
  chapter         integer NOT NULL,
  translation     text NOT NULL DEFAULT 'ESV',
  -- Array of {verse: integer, start_seconds: numeric} objects, ordered
  -- e.g. [{"verse":1,"start_seconds":0.0},{"verse":2,"start_seconds":8.4},...]
  timestamps      jsonb NOT NULL DEFAULT '[]',
  -- Total chapter duration in seconds (from the audio file)
  duration_seconds numeric,
  aligner_version text,               -- 'aeneas-1.7', 'gentle-0.10' etc. for reprocessing
  generated_at    timestamptz DEFAULT now(),
  meta            jsonb DEFAULT '{}',
  UNIQUE(book, chapter, translation)
);

CREATE INDEX idx_audio_timestamps ON chapter_audio_timestamps(book, chapter, translation);
-- No RLS -- shared static data, public read.


-- ============================================================
-- INTEGRATIONS
-- External service connections: Spotify, Apple Music, etc.
-- Stores tokens, metadata, and sync state per user per service.
-- ============================================================
CREATE TABLE integrations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service         text NOT NULL,              -- 'spotify', 'apple_music', 'notion', etc.
  access_token    text,                       -- encrypted at rest via Supabase Vault
  refresh_token   text,
  token_expires_at timestamptz,
  account_display text,                       -- e.g. username shown to user
  scope           text,                       -- OAuth scopes granted
  is_active       boolean DEFAULT true,
  last_synced_at  timestamptz,
  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, service)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own integrations" ON integrations USING (auth.uid() = user_id);


-- ============================================================
-- ONBOARDING CONVERSATIONS
-- Stores the full conversational onboarding thread.
-- Referenced when building the initial profile seed.
-- ============================================================
CREATE TABLE onboarding_conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  messages        jsonb NOT NULL DEFAULT '[]',  -- [{role:'user',content:'...'},{role:'assistant',...}]
  extracted_profile jsonb,                      -- the silently extracted JSON profile blob
  completed       boolean DEFAULT false,
  completed_at    timestamptz,
  version         integer DEFAULT 1,            -- if onboarding script changes
  meta            jsonb DEFAULT '{}'
);

ALTER TABLE onboarding_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own onboarding" ON onboarding_conversations USING (auth.uid() = user_id);


-- ============================================================
-- COMPANION DEFINITIONS
-- Pre-built and custom AI theologian companions.
-- Charles (slug: 'charles') is seeded as default (is_default = true).
-- Additional companions are purchasable à la carte.
-- Custom companions are user-built via the Persona Builder (Your Edition).
-- ============================================================
CREATE TABLE companion_definitions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text UNIQUE NOT NULL,           -- 'charles', 'augustine', 'wesley', 'luther', 'calvin', 'tozer'
  display_name      text NOT NULL,                  -- 'Charles', 'Augustine of Hippo', 'John Wesley'
  tagline           text,                           -- one-line description for the store card
  theological_dna   text[] DEFAULT '{}',            -- source theologians e.g. ['spurgeon','macarthur','ladd']
  tradition         text,                           -- 'reformed', 'wesleyan', 'lutheran', 'patristic', 'custom'
  style_notes       text,                           -- communication style guidance injected into prompt
  is_default        boolean DEFAULT false,          -- Charles only; given to every user at signup
  is_custom         boolean DEFAULT false,          -- true = user-built via Persona Builder
  price_usd         numeric DEFAULT 0,              -- 0 = included, 2.99 = purchasable à la carte
  stripe_product_id text,                           -- Stripe Product ID for this companion
  icon_svg          text,                           -- heraldic SVG icon displayed on store card
  sort_order        integer DEFAULT 0,
  is_active         boolean DEFAULT true,
  meta              jsonb DEFAULT '{}'
);

-- FK from profiles.active_companion_id — added here after companion_definitions exists
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_active_companion
  FOREIGN KEY (active_companion_id) REFERENCES companion_definitions(id);


-- ============================================================
-- USER COMPANIONS (purchased or unlocked companions per user)
-- ============================================================
CREATE TABLE user_companions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  companion_id      uuid NOT NULL REFERENCES companion_definitions(id),
  purchased_at      timestamptz DEFAULT now(),
  stripe_payment_id text,                           -- Stripe PaymentIntent or Charge ID
  is_custom_build   boolean DEFAULT false,          -- true = Persona Builder output
  custom_config     jsonb DEFAULT '{}',             -- {tradition, style, source_theologians, name, ...}
  meta              jsonb DEFAULT '{}',
  UNIQUE(user_id, companion_id)
);

ALTER TABLE user_companions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own companions" ON user_companions USING (auth.uid() = user_id);


-- ============================================================
-- CHARLES VAULT ENTRIES ("From the Vault" — pre-written, not AI-generated)
-- Populated from Spurgeon public domain data + hand-authored entries.
-- Free users: vault is their only Charles experience.
-- Paid users: vault gems surface alongside live generation (curator picks).
-- Visual treatment: warm parchment background, "FROM THE VAULT" badge, serif quote style.
-- ============================================================
CREATE TABLE charles_vault_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_slug  text NOT NULL DEFAULT 'charles',
  book            text,
  chapter         integer,
  verse_start     integer,
  verse_end       integer,
  body            text NOT NULL,                    -- the pre-written content
  source          text,                             -- 'spurgeon_morning_evening', 'spurgeon_sermon', 'pre_written'
  source_ref      text,                             -- e.g. sermon title, devotional date
  attribution     text,                             -- display attribution line shown to user
  content_type    text DEFAULT 'devotional'
                    CHECK (content_type IN ('devotional', 'commentary', 'quote', 'observation', 'wildcard')),
  quality_tier    text DEFAULT 'standard'
                    CHECK (quality_tier IN ('featured', 'standard')), -- featured = surfaced as gems to paid users
  is_active       boolean DEFAULT true,
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_vault_book_chapter ON charles_vault_entries(book, chapter);
CREATE INDEX idx_vault_companion ON charles_vault_entries(companion_slug, quality_tier);
-- No RLS — read-only reference data, no user rows.


-- ============================================================
-- YEAR IN REVIEW (Your Edition — annual personalized document)
-- Generated each January by background job, emailed as PDF.
-- Stored here for in-app re-access any time.
-- ============================================================
CREATE TABLE year_in_review (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year                 integer NOT NULL,
  generated_at         timestamptz DEFAULT now(),
  content_json         jsonb NOT NULL DEFAULT '{}',    -- {opening, chapters_read, themes, top_insights,
                                                       --  blind_spots, streak_story, charles_letter, ...}
  -- Session 24: standalone AI reflection text for rendering/re-generation
  charles_reflection   text,                           -- Charles' narrative paragraph about the year
  charles_reflection_at timestamptz,
  pdf_url              text,                           -- Supabase Storage URL (generated PDF)
  email_sent_at        timestamptz,
  meta                 jsonb DEFAULT '{}',
  UNIQUE(user_id, year)
);

ALTER TABLE year_in_review ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own reviews" ON year_in_review FOR SELECT USING (auth.uid() = user_id);


-- ============================================================
-- WEEKLY CHARLES LETTERS (Your Edition — personalized weekly email)
-- Charles writes a letter to the user about their study that week.
-- Opt-in. Delivered Monday morning. Stored for in-app inbox re-read.
-- Uses active companion — if user owns Wesley, Wesley writes the letter.
-- ============================================================
CREATE TABLE weekly_charles_letters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  companion_id    uuid REFERENCES companion_definitions(id),  -- which companion authored this letter
  week_start      date NOT NULL,                    -- Monday of that week
  subject_line    text NOT NULL,
  body_html       text NOT NULL,
  email_sent_at   timestamptz,
  opened_at       timestamptz,
  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, week_start)
);

ALTER TABLE weekly_charles_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own letters" ON weekly_charles_letters FOR SELECT USING (auth.uid() = user_id);


-- ============================================================
-- CHAT SESSIONS (Ask Charles — freeform AI conversation)
-- One session = one focused conversation.
-- Sessions are passage-anchored (optional) or open-ended.
-- Companion awareness: uses profiles.active_companion_id to determine voice.
-- ============================================================
CREATE TABLE chat_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  companion_id    uuid REFERENCES companion_definitions(id), -- snapshot at session start
  -- Optional passage anchor (context injected into system prompt)
  anchor_book     text,
  anchor_chapter  integer,
  anchor_verse    integer,                        -- NULL = whole chapter context
  -- Session metadata
  title           text,                           -- auto-generated after 2nd message
  message_count   integer DEFAULT 0,              -- denormalized
  token_count     integer DEFAULT 0,              -- total tokens consumed (for tier enforcement)
  model_used      text,                           -- 'claude-haiku-4', 'claude-sonnet-4-6', etc.
  -- Lifecycle
  started_at      timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  closed_at       timestamptz,                    -- NULL = still open
  deleted_at      timestamptz,                    -- soft delete
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id, last_message_at DESC);
CREATE INDEX idx_chat_sessions_anchor ON chat_sessions(user_id, anchor_book, anchor_chapter);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat sessions" ON chat_sessions USING (auth.uid() = user_id);


-- ============================================================
-- CHAT MESSAGES (individual turns within a chat session)
-- ============================================================
CREATE TABLE chat_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         text NOT NULL,
  -- Token tracking
  input_tokens    integer DEFAULT 0,
  output_tokens   integer DEFAULT 0,
  -- Source classification for assistant messages
  content_source  text DEFAULT 'live'
                    CHECK (content_source IN ('live', 'vault', 'cached')),
  -- Suggested follow-up questions (assistant turn only)
  suggested_questions jsonb DEFAULT '[]',         -- [{text:'...'}, ...]  up to 3
  -- User feedback on assistant response
  thumbs_up       boolean,                        -- NULL = no feedback, true/false = rated
  flagged         boolean DEFAULT false,          -- user flagged as inappropriate
  created_at      timestamptz DEFAULT now(),
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at ASC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat messages" ON chat_messages USING (auth.uid() = user_id);
```


---

## export_jobs (Session 18  Export, Backup & "Your Bible" PDF)

```sql
CREATE TYPE export_job_type AS ENUM ('your_bible_pdf', 'data_json', 'data_csv');
CREATE TYPE export_job_status AS ENUM ('queued', 'processing', 'complete', 'failed');

CREATE TABLE export_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_type        export_job_type NOT NULL,
  scope_config    jsonb NOT NULL DEFAULT '{}',
  -- scope_config examples:
  --   { "scope": "full" }
  --   { "scope": "book", "book": "JHN" }
  --   { "scope": "date_range", "from": "2024-01-01", "to": "2024-12-31" }
  --   { "scope": "chapters", "chapter_ids": ["uuid-1", "uuid-2"] }
  status          export_job_status NOT NULL DEFAULT 'queued',
  error_message   text,
  page_count      integer,
  storage_path    text,
  download_url    text,
  expires_at      timestamptz,          -- signed URL expiry (7 days from generation)
  email_sent_at   timestamptz,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_export_jobs_user ON export_jobs(user_id, created_at DESC);
CREATE INDEX idx_export_jobs_status ON export_jobs(status) WHERE status IN ('queued','processing');

ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own export jobs" ON export_jobs USING (auth.uid() = user_id);
```


---

## user_stats_cache (Session 24  Reading Statistics & Analytics)

```sql
-- Nightly pre-aggregated stats snapshot to avoid expensive re-computation
-- on every dashboard open. Keyed by (user_id, year, month).
-- month = 0 means the full-year aggregate.
CREATE TABLE user_stats_cache (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year            integer NOT NULL,
  month           integer NOT NULL DEFAULT 0,   -- 0 = annual, 1-12 = monthly
  stats_json      jsonb NOT NULL DEFAULT '{}',
  -- stats_json keys (examples):
  --   chapters_read, books_completed, words_read_estimate,
  --   journal_entries, journal_word_count, highlights_total,
  --   most_highlighted_book, memory_verses_mastered,
  --   prayers_prayed, prayers_answered, reading_days,
  --   heatmap_data (array of 365 booleans), top_verses jsonb[]
  computed_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month)
);

CREATE INDEX idx_stats_cache_user ON user_stats_cache(user_id, year DESC);

ALTER TABLE user_stats_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stats cache" ON user_stats_cache FOR SELECT USING (auth.uid() = user_id);
```


---

## verse_interactions (Session 24  Reading Statistics & Analytics)

```sql
-- Lightweight verse-level engagement events for "verses that keep finding you."
-- NOT tracked on every scroll  only on explicit user action.
-- interaction_type: 'highlight' | 'bookmark' | 'word_study' | 'memory_add' | 'share'
CREATE TABLE verse_interactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book              text NOT NULL,
  chapter           integer NOT NULL,
  verse             integer NOT NULL,
  interaction_type  text NOT NULL
                      CHECK (interaction_type IN ('highlight','bookmark','word_study','memory_add','share')),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_verse_interactions_user ON verse_interactions(user_id, book, chapter, verse);
CREATE INDEX idx_verse_interactions_count ON verse_interactions(user_id, created_at DESC);

ALTER TABLE verse_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own verse interactions" ON verse_interactions USING (auth.uid() = user_id);
```


---

## user_covenant_progress (Session 27  Canonical Shape and Typology)

```sql
CREATE TABLE user_covenant_progress (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  covenant_key    text NOT NULL,
  -- 'adamic' | 'noahic' | 'abrahamic' | 'mosaic' | 'davidic' | 'new'
  unlocked_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, covenant_key)
);

CREATE INDEX idx_covenant_progress_user ON user_covenant_progress(user_id);

ALTER TABLE user_covenant_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own covenant progress" ON user_covenant_progress USING (auth.uid() = user_id);
```


---

## sermon_outlines (Session 28  Sermon Notes and Teaching Outlines)

```sql
CREATE TYPE outline_mode AS ENUM ('sermon', 'small_group', 'family_devotions');

CREATE TABLE sermon_outlines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  passage_ref     text NOT NULL,           -- human-readable, e.g. 'Romans 8:1-17'
  book            text NOT NULL,           -- USFM book code
  chapter_start   integer NOT NULL,
  chapter_end     integer,                 -- NULL if single chapter
  verse_start     integer,
  verse_end       integer,
  outline_mode    outline_mode NOT NULL DEFAULT 'sermon',
  generated_json  jsonb NOT NULL DEFAULT '{}',
  -- Structure:
  --   { text, context, main_idea, movements:[{heading,verses,exegesis,bridge,cross_refs}],
  --     application_directions, exegetical_footnotes, illustrative_threads }
  user_notes      text,                    -- pastor's own inline additions/edits
  companion_id    uuid REFERENCES companion_definitions(id) ON DELETE SET NULL,
  -- which companion generated this outline (snapshot)
  exported_at     timestamptz,
  archived        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sermon_outlines_user ON sermon_outlines(user_id, created_at DESC);
CREATE INDEX idx_sermon_outlines_passage ON sermon_outlines(user_id, book, chapter_start);

ALTER TABLE sermon_outlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sermon outlines" ON sermon_outlines USING (auth.uid() = user_id);
```
