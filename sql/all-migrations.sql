-- =============================================================================
-- BibleSaaS — Combined Schema Migration
-- Run this entire file in Supabase SQL Editor (one paste, one click Run).
-- Files are applied in dependency order: 01,02,03,04,05,07,06,08,09,10,11,12,13
-- (07 must precede 06 because 06 references catechism_entries, hymn_index,
--  and bible_characters which are defined in 07.)
-- =============================================================================


-- =============================================================================
-- 01 — Core Auth & Profiles
-- =============================================================================

CREATE TABLE profiles (
  id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name            text,
  full_name               text,
  nickname                text,
  email                   text,
  age_range               text,
  life_stage              text,
  faith_stage             text,
  church_background       text,
  theological_depth       text,
  primary_goal            text,
  time_budget_min         integer,
  reading_cadence         text,
  tone_preference         text,
  living_portrait         text,
  living_portrait_json    jsonb,
  portrait_updated_at     timestamptz,
  gifted_by               uuid REFERENCES profiles(id),
  gifted_message          text,
  gifted_message_visible  boolean DEFAULT false,
  gifted_reveal_at        date,
  subscription_tier       text DEFAULT 'free',
  subscription_expires_at timestamptz,
  stripe_customer_id      text UNIQUE,
  stripe_subscription_id  text,
  active_companion_id     uuid,
  theological_fingerprint jsonb DEFAULT '{}',
  study_dna               jsonb DEFAULT '{}',
  fingerprint_updated_at  timestamptz,
  onboarding_complete     boolean DEFAULT false,
  profile_hash            text,
  birthday                date,
  deletion_requested_at   timestamptz,
  meta                    jsonb DEFAULT '{}',
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);


CREATE TABLE profile_interests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest    text NOT NULL,
  freeform    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interests" ON profile_interests USING (auth.uid() = user_id);


CREATE TABLE user_life_updates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE user_life_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own updates" ON user_life_updates USING (auth.uid() = user_id);


CREATE TABLE family_units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_by  uuid NOT NULL REFERENCES profiles(id),
  accent_color text NOT NULL DEFAULT '#7C6B5A',
  created_at  timestamptz DEFAULT now()
);


CREATE TABLE family_members (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_unit_id        uuid NOT NULL REFERENCES family_units(id) ON DELETE CASCADE,
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role                  text DEFAULT 'member',
  share_progress        boolean DEFAULT false,
  share_highlights      boolean DEFAULT false,
  read_receipts_visible boolean DEFAULT true,
  joined_at             timestamptz DEFAULT now(),
  UNIQUE(family_unit_id, user_id)
);


-- =============================================================================
-- 02 — Reading Plans
-- =============================================================================

CREATE TABLE reading_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  type        text NOT NULL,
  description text,
  book_filter text,
  is_default  boolean DEFAULT false,
  is_system   boolean DEFAULT true,
  meta        jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);


CREATE TABLE plan_chapters (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       uuid NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_number    integer NOT NULL,
  book          text NOT NULL,
  chapter       integer NOT NULL,
  section_label text,
  UNIQUE(plan_id, day_number)
);

CREATE INDEX idx_plan_chapters_plan ON plan_chapters(plan_id, day_number);


CREATE TABLE user_reading_plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id      uuid NOT NULL REFERENCES reading_plans(id),
  started_at   timestamptz DEFAULT now(),
  current_day  integer DEFAULT 1,
  active       boolean DEFAULT true,
  completed_at timestamptz,
  meta         jsonb DEFAULT '{}',
  UNIQUE(user_id, plan_id)
);

ALTER TABLE user_reading_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plans" ON user_reading_plans USING (auth.uid() = user_id);


-- =============================================================================
-- 03 — Bible Content & Personalized Content
-- =============================================================================

CREATE TABLE chapters (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book          text NOT NULL,
  chapter       integer NOT NULL,
  translation   text NOT NULL DEFAULT 'ESV',
  text_json     jsonb NOT NULL,
  fetched_at    timestamptz DEFAULT now(),
  expires_at    timestamptz,
  chapter_themes text[] DEFAULT '{}',
  meta          jsonb DEFAULT '{}',
  UNIQUE(book, chapter, translation)
);

CREATE INDEX idx_chapters_translation ON chapters(translation, book, chapter);
CREATE INDEX idx_chapters_expiry ON chapters(expires_at) WHERE expires_at IS NOT NULL;


CREATE TABLE supported_translations (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   text NOT NULL UNIQUE,
  display_name           text NOT NULL,
  abbreviation           text NOT NULL,
  language               text NOT NULL DEFAULT 'en',
  source                 text NOT NULL CHECK (source IN ('esv_api', 'api_bible', 'local', 'supabase')),
  api_bible_id           text,
  license_type           text NOT NULL DEFAULT 'public_domain'
                           CHECK (license_type IN ('public_domain', 'commercial_licensed', 'api_only')),
  tier_required          text DEFAULT 'free'
                           CHECK (tier_required IN ('free', 'standard', 'premium', 'your_edition')),
  is_comparison_eligible boolean DEFAULT true,
  is_active              boolean DEFAULT true,
  sort_order             integer DEFAULT 0,
  launch_phase           text DEFAULT 'day1'
                           CHECK (launch_phase IN ('day1', 'v2', 'future')),
  notes                  text,
  meta                   jsonb DEFAULT '{}'
);


CREATE TABLE questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book          text NOT NULL,
  chapter       integer NOT NULL,
  oia_type      text NOT NULL CHECK (oia_type IN ('observe', 'interpret', 'apply')),
  question_text text NOT NULL,
  answer_prompt text,
  difficulty    text DEFAULT 'standard' CHECK (difficulty IN ('surface', 'standard', 'deep')),
  source        text DEFAULT 'system',
  is_active     boolean DEFAULT true,
  meta          jsonb DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_questions_book_chapter ON questions(book, chapter, oia_type);


CREATE TABLE personalized_content (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book         text NOT NULL,
  chapter      integer NOT NULL,
  intro_text   text,
  connections  jsonb,
  question_ids uuid[],
  questions    jsonb,
  word_note    jsonb,
  closing_text text,
  profile_hash text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  is_stale     boolean DEFAULT false,
  meta         jsonb DEFAULT '{}',
  UNIQUE(user_id, book, chapter)
);

ALTER TABLE personalized_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own content" ON personalized_content USING (auth.uid() = user_id);


-- =============================================================================
-- 04 — Journal
-- =============================================================================

CREATE TABLE journal_entries (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book                        text NOT NULL,
  chapter                     integer NOT NULL,
  studied_at                  timestamptz DEFAULT now(),
  just_read_mode              boolean DEFAULT false,
  note                        text,
  voice_note_url              text,
  voice_note_duration_seconds integer,
  voice_note_transcript       text,
  voice_note_transcribed_at   timestamptz,
  is_lament_session           boolean NOT NULL DEFAULT false,
  follow_up_at                timestamptz,
  deleted_at                  timestamptz,
  response_note               text,
  responded_at                timestamptz,
  meta                        jsonb DEFAULT '{}',
  created_at                  timestamptz DEFAULT now()
);

CREATE INDEX idx_journal_user ON journal_entries(user_id, studied_at DESC);
CREATE INDEX idx_journal_chapter ON journal_entries(user_id, book, chapter);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journal" ON journal_entries USING (auth.uid() = user_id);


CREATE TABLE journal_answers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id         uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id      uuid REFERENCES questions(id),
  oia_type         text CHECK (oia_type IN ('observe', 'interpret', 'apply')),
  question_text    text,
  answer_text      text,
  charles_response text,
  deleted_at       timestamptz,
  meta             jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX idx_answers_entry ON journal_answers(entry_id);
CREATE INDEX idx_answers_user ON journal_answers(user_id, created_at DESC);

ALTER TABLE journal_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own answers" ON journal_answers USING (auth.uid() = user_id);


-- =============================================================================
-- 05 — Highlights, Bookmarks & Messages
-- =============================================================================

CREATE TABLE highlights (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book        text NOT NULL,
  chapter     integer NOT NULL,
  verse_start integer NOT NULL,
  verse_end   integer,
  color       text NOT NULL DEFAULT 'yellow'
                CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'orange', 'purple')),
  note        text,
  created_at  timestamptz DEFAULT now(),
  deleted_at  timestamptz,
  meta        jsonb DEFAULT '{}'
);

CREATE INDEX idx_highlights_user_chapter ON highlights(user_id, book, chapter);

ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own highlights" ON highlights USING (auth.uid() = user_id);


CREATE TABLE bookmarks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book       text NOT NULL,
  chapter    integer NOT NULL,
  verse      integer,
  label      text,
  created_at timestamptz DEFAULT now(),
  meta       jsonb DEFAULT '{}',
  UNIQUE(user_id, book, chapter, verse)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON bookmarks USING (auth.uid() = user_id);


CREATE TABLE messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book        text NOT NULL,
  chapter     integer NOT NULL,
  role        text NOT NULL CHECK (role IN ('user', 'assistant')),
  content     text NOT NULL,
  tokens_used integer,
  created_at  timestamptz DEFAULT now(),
  meta        jsonb DEFAULT '{}'
);

CREATE INDEX idx_messages_thread ON messages(user_id, book, chapter, created_at ASC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON messages USING (auth.uid() = user_id);


CREATE TABLE verse_thread_messages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_unit_id uuid NOT NULL REFERENCES family_units(id) ON DELETE CASCADE,
  sender_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book           text NOT NULL,
  chapter        integer NOT NULL,
  verse          integer NOT NULL,
  body           text NOT NULL CHECK (char_length(body) <= 1000),
  parent_id      uuid REFERENCES verse_thread_messages(id),
  delivery_date  date,
  read_by        jsonb DEFAULT '{}',
  created_at     timestamptz DEFAULT now(),
  deleted_at     timestamptz,
  meta           jsonb DEFAULT '{}'
);

CREATE INDEX idx_verse_thread_anchor ON verse_thread_messages(family_unit_id, book, chapter, verse, created_at ASC);
CREATE INDEX idx_verse_thread_sender ON verse_thread_messages(sender_id);

ALTER TABLE verse_thread_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Family members see thread messages" ON verse_thread_messages
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_unit_id = verse_thread_messages.family_unit_id
        AND fm.user_id = auth.uid()
    )
  );


CREATE TABLE shared_content (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL
                 CHECK (content_type IN ('verse', 'highlight', 'journal_answer', 'trail', 'streak')),
  source_id    uuid,
  payload      jsonb NOT NULL,
  share_token  text UNIQUE DEFAULT gen_random_uuid()::text,
  is_active    boolean DEFAULT true,
  view_count   integer DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  expires_at   timestamptz,
  meta         jsonb DEFAULT '{}'
);

CREATE INDEX idx_shared_content_token ON shared_content(share_token) WHERE is_active = true;
CREATE INDEX idx_shared_content_user ON shared_content(user_id, created_at DESC);

ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own shares" ON shared_content USING (auth.uid() = user_id);


-- =============================================================================
-- 07 — Source Data (must run before 06 — 06 references these tables)
-- =============================================================================

CREATE TABLE tsk_references (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_book    text NOT NULL,
  from_chapter integer NOT NULL,
  from_verse   integer NOT NULL,
  to_book      text NOT NULL,
  to_chapter   integer NOT NULL,
  to_verse     integer NOT NULL,
  meta         jsonb DEFAULT '{}'
);

CREATE INDEX idx_tsk_from ON tsk_references(from_book, from_chapter, from_verse);
CREATE INDEX idx_tsk_to ON tsk_references(to_book, to_chapter, to_verse);


CREATE TABLE tsk_verse_stats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book            text NOT NULL,
  chapter         integer NOT NULL,
  verse           integer NOT NULL,
  reference_count integer NOT NULL DEFAULT 0,
  density_tier    text GENERATED ALWAYS AS (
    CASE
      WHEN reference_count = 0 THEN 'none'
      WHEN reference_count BETWEEN 1 AND 5 THEN 'low'
      WHEN reference_count BETWEEN 6 AND 15 THEN 'medium'
      ELSE 'high'
    END
  ) STORED,
  UNIQUE(book, chapter, verse)
);

CREATE INDEX idx_tsk_stats_passage ON tsk_verse_stats(book, chapter);
CREATE INDEX idx_tsk_stats_tier ON tsk_verse_stats(density_tier);


CREATE TABLE spurgeon_index (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source   text NOT NULL,
  date_key text,
  book     text,
  chapter  integer,
  verse    integer,
  title    text,
  body     text NOT NULL,
  meta     jsonb DEFAULT '{}'
);

CREATE INDEX idx_spurgeon_passage ON spurgeon_index(book, chapter, verse);
CREATE INDEX idx_spurgeon_source ON spurgeon_index(source, date_key);


CREATE TABLE catechism_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catechism       text NOT NULL,
  question_number integer NOT NULL,
  lord_day        integer,
  section         text,
  question_text   text NOT NULL,
  answer_text     text NOT NULL,
  scripture_refs  text[],
  proof_texts     jsonb DEFAULT '[]',
  keywords        text[],
  charles_note    text,
  meta            jsonb DEFAULT '{}',
  UNIQUE(catechism, question_number)
);

CREATE INDEX idx_catechism ON catechism_entries(catechism, question_number);
CREATE INDEX idx_catechism_lord_day ON catechism_entries(catechism, lord_day);
CREATE INDEX idx_catechism_proof_texts ON catechism_entries USING GIN (proof_texts);
CREATE INDEX idx_catechism_keywords ON catechism_entries USING GIN (keywords);


CREATE TABLE typology_connections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ot_book         text NOT NULL,
  ot_chapter      integer,
  ot_verse        integer,
  ot_label        text NOT NULL,
  nt_book         text NOT NULL,
  nt_chapter      integer,
  nt_verse        integer,
  nt_label        text NOT NULL,
  explanation     text,
  charles_note    text,
  direction       text NOT NULL DEFAULT 'ot_to_nt'
                    CHECK (direction IN ('ot_to_nt','nt_looks_back','within_ot','within_nt')),
  prominence      integer NOT NULL DEFAULT 3 CHECK (prominence BETWEEN 1 AND 5),
  connection_type text DEFAULT 'typology'
                    CHECK (connection_type IN ('typology', 'prophecy', 'canonical_shape', 'theme')),
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_typology_ot ON typology_connections(ot_book, ot_chapter);
CREATE INDEX idx_typology_nt ON typology_connections(nt_book, nt_chapter);


CREATE TABLE bible_dictionary_entries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source            text NOT NULL,
  term              text NOT NULL,
  slug              text NOT NULL,
  body              text NOT NULL,
  passage_refs      text[] DEFAULT '{}',
  charles_note      text,
  is_primary_source boolean DEFAULT false,
  meta              jsonb DEFAULT '{}'
);

CREATE INDEX idx_dict_slug ON bible_dictionary_entries(slug);
CREATE INDEX idx_dict_term ON bible_dictionary_entries(lower(term));
CREATE INDEX idx_dict_source ON bible_dictionary_entries(source, slug);
CREATE UNIQUE INDEX idx_dict_source_slug ON bible_dictionary_entries(source, slug);


CREATE TABLE commentary_entries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source           text NOT NULL,
  book             text NOT NULL,
  chapter          integer NOT NULL,
  verse_start      integer,
  verse_end        integer,
  section_title    text,
  body             text NOT NULL,
  is_vault_featured boolean DEFAULT false,
  meta             jsonb DEFAULT '{}'
);

CREATE INDEX idx_commentary_passage ON commentary_entries(book, chapter, verse_start);
CREATE INDEX idx_commentary_source ON commentary_entries(source, book, chapter);


CREATE TABLE hymn_index (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  first_line   text,
  author       text,
  year_written integer,
  tune_name    text,
  meter        text,
  lyrics       text NOT NULL,
  explicit_refs text[],
  thematic_tags text[],
  meta         jsonb DEFAULT '{}'
);

CREATE INDEX idx_hymn_refs ON hymn_index USING gin(explicit_refs);
CREATE INDEX idx_hymn_themes ON hymn_index USING gin(thematic_tags);


CREATE TABLE bible_characters (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  alternate_names       text[],
  primary_role          text,
  tribe_nation          text,
  era                   text,
  first_mention_book    text NOT NULL,
  first_mention_chapter integer NOT NULL,
  first_mention_verse   integer,
  key_verse             text,
  key_verse_text        text,
  description           text,
  rarity                text DEFAULT 'faithful'
                          CHECK (rarity IN ('faithful', 'renowned', 'mighty', 'eternal', 'the_word')),
  is_athlete_of_faith   boolean DEFAULT false,
  is_in_hebrews_11      boolean DEFAULT false,
  meta                  jsonb DEFAULT '{}'
);

CREATE INDEX idx_characters_first_mention ON bible_characters(first_mention_book, first_mention_chapter);
CREATE INDEX idx_characters_role ON bible_characters(primary_role);
CREATE INDEX idx_characters_rarity ON bible_characters(rarity);


CREATE TABLE user_library_history (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_type       text NOT NULL
                     CHECK (entry_type IN ('dictionary', 'commentary', 'word_study',
                                           'catechism', 'hymn', 'character_card', 'typology')),
  entry_id         uuid NOT NULL,
  entry_slug       text,
  entry_label      text,
  first_visited_at timestamptz DEFAULT now(),
  last_visited_at  timestamptz DEFAULT now(),
  visit_count      integer DEFAULT 1,
  meta             jsonb DEFAULT '{}',
  UNIQUE(user_id, entry_type, entry_id)
);

CREATE INDEX idx_library_history_user ON user_library_history(user_id, last_visited_at DESC);
CREATE INDEX idx_library_history_type ON user_library_history(user_id, entry_type);

ALTER TABLE user_library_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own library history" ON user_library_history USING (auth.uid() = user_id);


CREATE TABLE psalm_classifications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psalm_number   integer NOT NULL UNIQUE CHECK (psalm_number BETWEEN 1 AND 150),
  psalm_types    text[] NOT NULL DEFAULT '{}',
  psalter_book   integer NOT NULL CHECK (psalter_book BETWEEN 1 AND 5),
  ascent_number  integer,
  superscription text,
  notes          text
);

CREATE INDEX idx_psalm_class_types ON psalm_classifications USING gin(psalm_types);


CREATE TABLE book_genre_notes (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_code                 text NOT NULL UNIQUE,
  book_name                 text NOT NULL,
  genre_flags               text[] NOT NULL DEFAULT '{}',
  lament_mode_default       boolean NOT NULL DEFAULT false,
  charles_register_override text,
  lament_passage_refs       text[],
  notes                     text
);


CREATE TABLE five_act_map (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_code  text NOT NULL,
  chapter    integer NOT NULL,
  act_number integer NOT NULL CHECK (act_number BETWEEN 1 AND 5),
  act_name   text NOT NULL,
  act_theme  text,
  color_key  text,
  UNIQUE(book_code, chapter)
);


CREATE TABLE covenant_map (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  covenant_key       text NOT NULL UNIQUE,
  name               text NOT NULL,
  anchor_chapters    text[] NOT NULL,
  promise_text       text NOT NULL,
  sign_text          text,
  parties_text       text,
  forward_connection text,
  charles_note       text,
  sort_order         integer NOT NULL DEFAULT 0
);


-- =============================================================================
-- 06 — Progress & Gamification
-- (runs after 07 because memory_verses → catechism_entries,
--  prayer_journal → hymn_index, user_character_cards → bible_characters)
-- =============================================================================

CREATE TABLE streaks (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak        integer DEFAULT 0,
  longest_streak        integer DEFAULT 0,
  last_active_date      date,
  total_days            integer DEFAULT 0,
  total_xp              integer DEFAULT 0,
  current_level         integer NOT NULL DEFAULT 1,
  streak_grace_used     boolean NOT NULL DEFAULT false,
  streak_grace_last_used date,
  prayer_days_streaked  integer NOT NULL DEFAULT 0,
  prayer_longest_streak integer NOT NULL DEFAULT 0,
  prayer_last_active    date,
  meta                  jsonb DEFAULT '{}'
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own streaks" ON streaks USING (auth.uid() = user_id);


CREATE TABLE achievements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key           text NOT NULL UNIQUE,
  name          text NOT NULL,
  description   text,
  xp_value      integer DEFAULT 0,
  icon          text,
  category      text NOT NULL DEFAULT 'reading'
                  CHECK (category IN ('reading','streaks','engagement','memory','prayer','word_study','special')),
  tier_required text NOT NULL DEFAULT 'free'
                  CHECK (tier_required IN ('free','standard','premium','your_edition')),
  is_hidden     boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0,
  meta          jsonb DEFAULT '{}'
);

CREATE TABLE user_achievements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id),
  earned_at      timestamptz DEFAULT now(),
  meta           jsonb DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own achievements" ON user_achievements USING (auth.uid() = user_id);


CREATE TABLE xp_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  xp_earned  integer NOT NULL,
  context    jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_events_user ON xp_events(user_id, created_at DESC);
CREATE INDEX idx_xp_events_type ON xp_events(user_id, event_type);

ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own XP events" ON xp_events USING (auth.uid() = user_id);


CREATE TABLE memory_verses (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book               text NOT NULL,
  chapter            integer NOT NULL,
  verse              integer NOT NULL,
  verse_text         text NOT NULL,
  translation        text DEFAULT 'ESV',
  ease_factor        numeric DEFAULT 2.5,
  interval_days      integer DEFAULT 1,
  repetitions        integer DEFAULT 0,
  next_review        date DEFAULT now()::date,
  last_reviewed      timestamptz,
  mastered           boolean DEFAULT false,
  practice_count     integer DEFAULT 0,
  review_mode        text DEFAULT 'all'
                       CHECK (review_mode IN ('flashcard', 'fill_blank', 'word_order', 'all')),
  added_from         text DEFAULT 'reading'
                       CHECK (added_from IN ('reading', 'journal', 'search', 'suggestion', 'family_share')),
  memory_type        text NOT NULL DEFAULT 'verse'
                       CHECK (memory_type IN ('verse', 'catechism_qa')),
  catechism_entry_id uuid REFERENCES catechism_entries(id) ON DELETE CASCADE,
  meta               jsonb DEFAULT '{}'
);

CREATE INDEX idx_memory_verses_review ON memory_verses(user_id, next_review);
CREATE INDEX idx_memory_verses_mastered ON memory_verses(user_id, mastered);

ALTER TABLE memory_verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory verses" ON memory_verses USING (auth.uid() = user_id);


CREATE TABLE memory_verse_reviews (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memory_verse_id     uuid NOT NULL REFERENCES memory_verses(id) ON DELETE CASCADE,
  reviewed_at         timestamptz DEFAULT now(),
  review_mode         text NOT NULL CHECK (review_mode IN ('flashcard', 'fill_blank', 'word_order')),
  quality             integer NOT NULL CHECK (quality BETWEEN 0 AND 5),
  ease_factor_after   numeric,
  interval_after      integer,
  repetitions_after   integer,
  time_taken_seconds  integer,
  meta                jsonb DEFAULT '{}'
);

CREATE INDEX idx_mv_reviews_user ON memory_verse_reviews(user_id, reviewed_at DESC);
CREATE INDEX idx_mv_reviews_verse ON memory_verse_reviews(memory_verse_id, reviewed_at DESC);

ALTER TABLE memory_verse_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews" ON memory_verse_reviews USING (auth.uid() = user_id);


CREATE TYPE prayer_category AS ENUM (
  'praise', 'thanksgiving', 'petition', 'intercession', 'confession', 'lament'
);

CREATE TABLE prayer_journal (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title               text,
  body                text NOT NULL,
  category            prayer_category NOT NULL DEFAULT 'petition',
  status              text NOT NULL DEFAULT 'ongoing'
                        CHECK (status IN ('ongoing', 'answered', 'archived')),
  answered_at         timestamptz,
  answered_note       text,
  passage_ref         text,
  linked_verse_text   text,
  tags                text[],
  reminder_enabled    boolean NOT NULL DEFAULT false,
  reminder_time       time,
  reminder_days       text[],
  reminder_last_sent  timestamptz,
  charles_note        jsonb,
  shared_with         uuid[],
  hymn_id             uuid REFERENCES hymn_index(id) ON DELETE SET NULL,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  deleted_at          timestamptz,
  meta                jsonb DEFAULT '{}'
);

CREATE INDEX idx_prayer_user ON prayer_journal(user_id, created_at DESC);
CREATE INDEX idx_prayer_status ON prayer_journal(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_prayer_reminder ON prayer_journal(reminder_enabled, reminder_last_sent)
  WHERE reminder_enabled = true AND deleted_at IS NULL;

ALTER TABLE prayer_journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prayers" ON prayer_journal USING (auth.uid() = user_id);


CREATE TABLE prayer_updates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id  uuid NOT NULL REFERENCES prayer_journal(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prayer_updates_prayer ON prayer_updates(prayer_id, created_at);

ALTER TABLE prayer_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prayer updates" ON prayer_updates USING (auth.uid() = user_id);


CREATE TABLE user_character_cards (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  character_id       uuid NOT NULL REFERENCES bible_characters(id),
  discovered_at      timestamptz DEFAULT now(),
  discovered_book    text,
  discovered_chapter integer,
  discovered_verse   integer,
  meta               jsonb DEFAULT '{}',
  UNIQUE(user_id, character_id)
);

CREATE INDEX idx_character_cards_user ON user_character_cards(user_id, discovered_at DESC);

ALTER TABLE user_character_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own cards" ON user_character_cards USING (auth.uid() = user_id);


CREATE TABLE skill_tree_nodes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key                 text NOT NULL UNIQUE,
  label               text NOT NULL,
  description         text,
  node_type           text NOT NULL
                        CHECK (node_type IN ('book', 'theology', 'cross_reference', 'hard_passage')),
  color_code          text DEFAULT 'blue'
                        CHECK (color_code IN ('blue', 'gold', 'green', 'red')),
  unlock_book         text,
  unlock_chapter_min  integer,
  parent_node_id      uuid REFERENCES skill_tree_nodes(id),
  sort_order          integer,
  meta                jsonb DEFAULT '{}'
);

CREATE INDEX idx_skill_tree_parent ON skill_tree_nodes(parent_node_id);


CREATE TABLE user_skill_tree (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  node_id     uuid NOT NULL REFERENCES skill_tree_nodes(id),
  unlocked_at timestamptz DEFAULT now(),
  meta        jsonb DEFAULT '{}',
  UNIQUE(user_id, node_id)
);

CREATE INDEX idx_user_skill_tree ON user_skill_tree(user_id);

ALTER TABLE user_skill_tree ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own skill tree" ON user_skill_tree USING (auth.uid() = user_id);


-- =============================================================================
-- 08 — Word Study
-- =============================================================================

CREATE TABLE strongs_lexicon (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strongs_number     text NOT NULL UNIQUE,
  language           text NOT NULL CHECK (language IN ('hebrew', 'greek')),
  original_word      text NOT NULL,
  transliteration    text,
  pronunciation      text,
  part_of_speech     text,
  short_def          text,
  long_def           text,
  usage_notes        text,
  kjv_usage          text,
  source             text DEFAULT 'strongs',
  hebrew_root        text,
  root_strongs       text,
  semantic_domain    text,
  occurrence_heatmap jsonb DEFAULT '{}',
  total_occurrences  integer DEFAULT 0,
  charles_study      jsonb DEFAULT '{}',
  charles_study_at   timestamptz,
  meta               jsonb DEFAULT '{}'
);

CREATE INDEX idx_strongs_number ON strongs_lexicon(strongs_number);
CREATE INDEX idx_strongs_language ON strongs_lexicon(language);
CREATE INDEX idx_strongs_root ON strongs_lexicon(hebrew_root) WHERE hebrew_root IS NOT NULL;


CREATE TABLE morphology_data (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book            text NOT NULL,
  chapter         integer NOT NULL,
  verse           integer NOT NULL,
  word_position   integer NOT NULL,
  original_word   text NOT NULL,
  normalized_form text,
  strongs_number  text REFERENCES strongs_lexicon(strongs_number),
  language        text CHECK (language IN ('hebrew', 'greek')),
  morphology_code text,
  morphology_desc text,
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_morph_passage ON morphology_data(book, chapter, verse, word_position);
CREATE INDEX idx_morph_strongs ON morphology_data(strongs_number);
CREATE INDEX idx_morph_lemma ON morphology_data(normalized_form);


CREATE TABLE word_occurrences (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strongs_number text NOT NULL REFERENCES strongs_lexicon(strongs_number),
  book           text NOT NULL,
  chapter        integer NOT NULL,
  verse          integer NOT NULL,
  count          integer DEFAULT 1,
  meta           jsonb DEFAULT '{}'
);

CREATE INDEX idx_word_occurrences_strongs ON word_occurrences(strongs_number);
CREATE INDEX idx_word_occurrences_passage ON word_occurrences(book, chapter, verse);


CREATE TABLE user_word_study_history (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  strongs_number   text NOT NULL REFERENCES strongs_lexicon(strongs_number),
  first_studied_at timestamptz DEFAULT now(),
  last_studied_at  timestamptz DEFAULT now(),
  study_count      integer DEFAULT 1,
  source_book      text,
  source_chapter   integer,
  meta             jsonb DEFAULT '{}',
  UNIQUE(user_id, strongs_number)
);

CREATE INDEX idx_word_history_user ON user_word_study_history(user_id, last_studied_at DESC);

ALTER TABLE user_word_study_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own word history" ON user_word_study_history USING (auth.uid() = user_id);


-- =============================================================================
-- 09 — Geography & Archaeology
-- =============================================================================

CREATE TABLE geographic_locations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  alternate_names text[],
  modern_name     text,
  lat             numeric,
  lng             numeric,
  location_type   text,
  description     text,
  significance    text,
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_geo_name ON geographic_locations(lower(name));
CREATE INDEX idx_geo_type ON geographic_locations(location_type);
CREATE INDEX idx_geo_names ON geographic_locations USING gin(alternate_names);


CREATE TABLE passage_locations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id  uuid NOT NULL REFERENCES geographic_locations(id) ON DELETE CASCADE,
  book         text NOT NULL,
  chapter      integer NOT NULL,
  verse_start  integer,
  verse_end    integer,
  context_note text,
  meta         jsonb DEFAULT '{}'
);

CREATE INDEX idx_passage_locations_passage ON passage_locations(book, chapter);
CREATE INDEX idx_passage_locations_loc ON passage_locations(location_id);


CREATE TABLE archaeological_sites (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  location_id   uuid REFERENCES geographic_locations(id),
  discovery_year integer,
  excavated_by  text,
  description   text,
  biblical_link text,
  scripture_refs text[],
  image_url     text,
  meta          jsonb DEFAULT '{}'
);

CREATE INDEX idx_arch_refs ON archaeological_sites USING gin(scripture_refs);


CREATE TABLE user_map_discoveries (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id            uuid NOT NULL REFERENCES geographic_locations(id),
  discovered_via_book    text,
  discovered_via_chapter integer,
  discovered_at          timestamptz DEFAULT now(),
  meta                   jsonb DEFAULT '{}',
  UNIQUE(user_id, location_id)
);

CREATE INDEX idx_map_discoveries_user ON user_map_discoveries(user_id);

ALTER TABLE user_map_discoveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own map" ON user_map_discoveries USING (auth.uid() = user_id);


-- =============================================================================
-- 10 — Notifications & Settings
-- =============================================================================

CREATE TABLE notification_settings (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_daily_reading       boolean DEFAULT true,
  email_streak_reminders    boolean DEFAULT true,
  email_memory_verse_review boolean DEFAULT true,
  email_prayer_followup     boolean DEFAULT false,
  push_enabled              boolean DEFAULT false,
  daily_time                time DEFAULT '07:00',
  timezone                  text DEFAULT 'America/Chicago',
  frequency                 text DEFAULT 'daily'
                              CHECK (frequency IN ('daily', 'weekdays', 'custom')),
  custom_days               integer[],
  charles_nudge_enabled     boolean DEFAULT false,
  meta                      jsonb DEFAULT '{}'
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification settings" ON notification_settings USING (auth.uid() = user_id);


CREATE TABLE user_display_settings (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  theme                    text DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'sepia')),
  font_size                text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),
  bible_reading_font       text DEFAULT 'eb_garamond'
                             CHECK (bible_reading_font IN ('eb_garamond', 'lora', 'merriweather', 'literata', 'system_serif')),
  just_read_default        boolean DEFAULT false,
  default_study_mode       text DEFAULT 'study'
                             CHECK (default_study_mode IN ('study', 'pray', 'listen')),
  show_verse_numbers       boolean DEFAULT true,
  show_red_letter          boolean DEFAULT true,
  show_cross_refs          boolean DEFAULT true,
  translation              text DEFAULT 'ESV',
  compare_mode_enabled     boolean DEFAULT false,
  comparison_translations  text[] DEFAULT '{}',
  visual_theme             text DEFAULT 'default',
  progress_view_default    text DEFAULT 'phases',
  gamification_enabled     boolean NOT NULL DEFAULT true,
  show_five_act_widget     boolean NOT NULL DEFAULT true,
  catechism_layer_enabled  boolean NOT NULL DEFAULT false,
  show_on_this_day         boolean NOT NULL DEFAULT true,
  meta                     jsonb DEFAULT '{}'
);

ALTER TABLE user_display_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own display settings" ON user_display_settings USING (auth.uid() = user_id);


CREATE TABLE feature_toggles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key  text NOT NULL,
  enabled      boolean DEFAULT true,
  tier_required text DEFAULT 'free'
                 CHECK (tier_required IN ('free', 'standard', 'premium', 'your_edition')),
  meta         jsonb DEFAULT '{}',
  UNIQUE(user_id, feature_key)
);

ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own toggles" ON feature_toggles USING (auth.uid() = user_id);


-- =============================================================================
-- 11 — Extensibility
-- =============================================================================

CREATE TABLE daily_trails (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_date      date NOT NULL,
  slot            text NOT NULL CHECK (slot IN ('morning', 'evening')),
  origin_book     text NOT NULL,
  origin_chapter  integer NOT NULL,
  origin_verse    integer NOT NULL,
  ai_rationale    text,
  community_stats jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  meta            jsonb DEFAULT '{}',
  UNIQUE(trail_date, slot)
);

CREATE INDEX idx_daily_trails_date ON daily_trails(trail_date);


CREATE TABLE cross_reference_trails (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name           text,
  trail_type     text DEFAULT 'free'
                   CHECK (trail_type IN ('free', 'daily_morning', 'daily_evening', 'thread_needle')),
  daily_trail_id uuid REFERENCES daily_trails(id),
  origin_book    text NOT NULL,
  origin_chapter integer NOT NULL,
  origin_verse   integer NOT NULL,
  step_count     integer DEFAULT 0,
  share_token    text UNIQUE DEFAULT gen_random_uuid()::text,
  is_public      boolean DEFAULT false,
  svg_cache      text,
  svg_generated_at timestamptz,
  created_at     timestamptz DEFAULT now(),
  completed_at   timestamptz,
  meta           jsonb DEFAULT '{}'
);

CREATE INDEX idx_trails_user ON cross_reference_trails(user_id, created_at DESC);
CREATE INDEX idx_trails_share ON cross_reference_trails(share_token) WHERE is_public = true;
CREATE INDEX idx_trails_daily ON cross_reference_trails(daily_trail_id) WHERE daily_trail_id IS NOT NULL;


CREATE TABLE trail_steps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id    uuid NOT NULL REFERENCES cross_reference_trails(id) ON DELETE CASCADE,
  step_order  integer NOT NULL,
  book        text NOT NULL,
  chapter     integer NOT NULL,
  verse       integer NOT NULL,
  note        text,
  meta        jsonb DEFAULT '{}',
  UNIQUE(trail_id, step_order)
);

ALTER TABLE cross_reference_trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trails" ON cross_reference_trails
  USING (auth.uid() = user_id OR is_public = true);

ALTER TABLE trail_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trail steps" ON trail_steps
  USING (auth.uid() = (SELECT user_id FROM cross_reference_trails WHERE id = trail_id)
      OR (SELECT is_public FROM cross_reference_trails WHERE id = trail_id) = true);


CREATE TABLE thread_definitions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book        text NOT NULL,
  thread_key  text NOT NULL,
  thread_name text NOT NULL,
  description text,
  target_refs text[],
  sort_order  integer,
  meta        jsonb DEFAULT '{}',
  UNIQUE(book, thread_key)
);

CREATE INDEX idx_thread_book ON thread_definitions(book);


CREATE TABLE user_trail_threads (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id           uuid NOT NULL REFERENCES thread_definitions(id),
  completing_trail_id uuid REFERENCES cross_reference_trails(id),
  pulled_at           timestamptz DEFAULT now(),
  meta                jsonb DEFAULT '{}',
  UNIQUE(user_id, thread_id)
);

CREATE INDEX idx_user_threads ON user_trail_threads(user_id);

ALTER TABLE user_trail_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own threads" ON user_trail_threads USING (auth.uid() = user_id);


CREATE TABLE audio_progress (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book             text NOT NULL,
  chapter          integer NOT NULL,
  position_seconds numeric DEFAULT 0,
  completed        boolean DEFAULT false,
  listened_at      timestamptz DEFAULT now(),
  playback_speed   numeric DEFAULT 1.0,
  auto_advance     boolean DEFAULT false,
  readalong_on     boolean DEFAULT true,
  meta             jsonb DEFAULT '{}',
  UNIQUE(user_id, book, chapter)
);

ALTER TABLE audio_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own audio progress" ON audio_progress USING (auth.uid() = user_id);


CREATE TABLE chapter_audio_timestamps (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book             text NOT NULL,
  chapter          integer NOT NULL,
  translation      text NOT NULL DEFAULT 'ESV',
  timestamps       jsonb NOT NULL DEFAULT '[]',
  duration_seconds numeric,
  aligner_version  text,
  generated_at     timestamptz DEFAULT now(),
  meta             jsonb DEFAULT '{}',
  UNIQUE(book, chapter, translation)
);

CREATE INDEX idx_audio_timestamps ON chapter_audio_timestamps(book, chapter, translation);


CREATE TABLE integrations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service          text NOT NULL,
  access_token     text,
  refresh_token    text,
  token_expires_at timestamptz,
  account_display  text,
  scope            text,
  is_active        boolean DEFAULT true,
  last_synced_at   timestamptz,
  meta             jsonb DEFAULT '{}',
  UNIQUE(user_id, service)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own integrations" ON integrations USING (auth.uid() = user_id);


CREATE TABLE onboarding_conversations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  messages          jsonb NOT NULL DEFAULT '[]',
  extracted_profile jsonb,
  completed         boolean DEFAULT false,
  completed_at      timestamptz,
  version           integer DEFAULT 1,
  meta              jsonb DEFAULT '{}'
);

ALTER TABLE onboarding_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own onboarding" ON onboarding_conversations USING (auth.uid() = user_id);


CREATE TABLE companion_definitions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  display_name     text NOT NULL,
  tagline          text,
  theological_dna  text[] DEFAULT '{}',
  tradition        text,
  style_notes      text,
  is_default       boolean DEFAULT false,
  is_custom        boolean DEFAULT false,
  price_usd        numeric DEFAULT 0,
  stripe_product_id text,
  icon_svg         text,
  sort_order       integer DEFAULT 0,
  is_active        boolean DEFAULT true,
  meta             jsonb DEFAULT '{}'
);

-- Add FK from profiles to companion_definitions now that companion_definitions exists
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_active_companion
  FOREIGN KEY (active_companion_id) REFERENCES companion_definitions(id);


CREATE TABLE user_companions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  companion_id     uuid NOT NULL REFERENCES companion_definitions(id),
  purchased_at     timestamptz DEFAULT now(),
  stripe_payment_id text,
  is_custom_build  boolean DEFAULT false,
  custom_config    jsonb DEFAULT '{}',
  meta             jsonb DEFAULT '{}',
  UNIQUE(user_id, companion_id)
);

ALTER TABLE user_companions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own companions" ON user_companions USING (auth.uid() = user_id);


CREATE TABLE charles_vault_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  companion_slug text NOT NULL DEFAULT 'charles',
  book          text,
  chapter       integer,
  verse_start   integer,
  verse_end     integer,
  body          text NOT NULL,
  source        text,
  source_ref    text,
  attribution   text,
  content_type  text DEFAULT 'devotional'
                  CHECK (content_type IN ('devotional', 'commentary', 'quote', 'observation', 'wildcard')),
  quality_tier  text DEFAULT 'standard'
                  CHECK (quality_tier IN ('featured', 'standard')),
  is_active     boolean DEFAULT true,
  meta          jsonb DEFAULT '{}'
);

CREATE INDEX idx_vault_book_chapter ON charles_vault_entries(book, chapter);
CREATE INDEX idx_vault_companion ON charles_vault_entries(companion_slug, quality_tier);


CREATE TABLE year_in_review (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year                  integer NOT NULL,
  generated_at          timestamptz DEFAULT now(),
  content_json          jsonb NOT NULL DEFAULT '{}',
  charles_reflection    text,
  charles_reflection_at timestamptz,
  pdf_url               text,
  email_sent_at         timestamptz,
  meta                  jsonb DEFAULT '{}',
  UNIQUE(user_id, year)
);

ALTER TABLE year_in_review ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own reviews" ON year_in_review FOR SELECT USING (auth.uid() = user_id);


CREATE TABLE weekly_charles_letters (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  companion_id uuid REFERENCES companion_definitions(id),
  week_start   date NOT NULL,
  subject_line text NOT NULL,
  body_html    text NOT NULL,
  email_sent_at timestamptz,
  opened_at    timestamptz,
  meta         jsonb DEFAULT '{}',
  UNIQUE(user_id, week_start)
);

ALTER TABLE weekly_charles_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own letters" ON weekly_charles_letters FOR SELECT USING (auth.uid() = user_id);


CREATE TABLE chat_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  companion_id    uuid REFERENCES companion_definitions(id),
  anchor_book     text,
  anchor_chapter  integer,
  anchor_verse    integer,
  title           text,
  message_count   integer DEFAULT 0,
  token_count     integer DEFAULT 0,
  model_used      text,
  started_at      timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  closed_at       timestamptz,
  deleted_at      timestamptz,
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id, last_message_at DESC);
CREATE INDEX idx_chat_sessions_anchor ON chat_sessions(user_id, anchor_book, anchor_chapter);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat sessions" ON chat_sessions USING (auth.uid() = user_id);


CREATE TABLE chat_messages (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id              uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role                 text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content              text NOT NULL,
  input_tokens         integer DEFAULT 0,
  output_tokens        integer DEFAULT 0,
  content_source       text DEFAULT 'live'
                         CHECK (content_source IN ('live', 'vault', 'cached')),
  suggested_questions  jsonb DEFAULT '[]',
  thumbs_up            boolean,
  flagged              boolean DEFAULT false,
  created_at           timestamptz DEFAULT now(),
  meta                 jsonb DEFAULT '{}'
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, created_at ASC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat messages" ON chat_messages USING (auth.uid() = user_id);


CREATE TYPE export_job_type AS ENUM ('your_bible_pdf', 'data_json', 'data_csv');
CREATE TYPE export_job_status AS ENUM ('queued', 'processing', 'complete', 'failed');

CREATE TABLE export_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_type      export_job_type NOT NULL,
  scope_config  jsonb NOT NULL DEFAULT '{}',
  status        export_job_status NOT NULL DEFAULT 'queued',
  error_message text,
  page_count    integer,
  storage_path  text,
  download_url  text,
  expires_at    timestamptz,
  email_sent_at timestamptz,
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_export_jobs_user ON export_jobs(user_id, created_at DESC);
CREATE INDEX idx_export_jobs_status ON export_jobs(status) WHERE status IN ('queued','processing');

ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own export jobs" ON export_jobs USING (auth.uid() = user_id);


CREATE TABLE user_stats_cache (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year        integer NOT NULL,
  month       integer NOT NULL DEFAULT 0,
  stats_json  jsonb NOT NULL DEFAULT '{}',
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, year, month)
);

CREATE INDEX idx_stats_cache_user ON user_stats_cache(user_id, year DESC);

ALTER TABLE user_stats_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stats cache" ON user_stats_cache FOR SELECT USING (auth.uid() = user_id);


CREATE TABLE verse_interactions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book             text NOT NULL,
  chapter          integer NOT NULL,
  verse            integer NOT NULL,
  interaction_type text NOT NULL
                     CHECK (interaction_type IN ('highlight','bookmark','word_study','memory_add','share')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_verse_interactions_user ON verse_interactions(user_id, book, chapter, verse);
CREATE INDEX idx_verse_interactions_count ON verse_interactions(user_id, created_at DESC);

ALTER TABLE verse_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own verse interactions" ON verse_interactions USING (auth.uid() = user_id);


CREATE TABLE user_covenant_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  covenant_key text NOT NULL,
  unlocked_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, covenant_key)
);

CREATE INDEX idx_covenant_progress_user ON user_covenant_progress(user_id);

ALTER TABLE user_covenant_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own covenant progress" ON user_covenant_progress USING (auth.uid() = user_id);


CREATE TYPE outline_mode AS ENUM ('sermon', 'small_group', 'family_devotions');

CREATE TABLE sermon_outlines (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  passage_ref     text NOT NULL,
  book            text NOT NULL,
  chapter_start   integer NOT NULL,
  chapter_end     integer,
  verse_start     integer,
  verse_end       integer,
  outline_mode    outline_mode NOT NULL DEFAULT 'sermon',
  generated_json  jsonb NOT NULL DEFAULT '{}',
  user_notes      text,
  companion_id    uuid REFERENCES companion_definitions(id) ON DELETE SET NULL,
  exported_at     timestamptz,
  archived        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sermon_outlines_user ON sermon_outlines(user_id, created_at DESC);
CREATE INDEX idx_sermon_outlines_passage ON sermon_outlines(user_id, book, chapter_start);

ALTER TABLE sermon_outlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sermon outlines" ON sermon_outlines USING (auth.uid() = user_id);


-- =============================================================================
-- 12 — Community of the Book
-- (study_group_members created before study_groups policy to avoid FK error)
-- =============================================================================

CREATE TYPE group_type AS ENUM ('family', 'church', 'friends');

CREATE TABLE study_groups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  invite_code     text NOT NULL UNIQUE,
  created_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  group_type      group_type NOT NULL DEFAULT 'friends',
  reading_plan_id uuid REFERENCES reading_plans(id) ON DELETE SET NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE group_role AS ENUM ('leader', 'member');

CREATE TABLE study_group_members (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id           uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id            uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name       text NOT NULL,
  role               group_role NOT NULL DEFAULT 'member',
  highlights_visible boolean NOT NULL DEFAULT false,
  prayer_visible     boolean NOT NULL DEFAULT true,
  joined_at          timestamptz NOT NULL DEFAULT now(),
  last_active        timestamptz,
  UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_members_group ON study_group_members(group_id);
CREATE INDEX idx_group_members_user  ON study_group_members(user_id);

-- Now safe to add policies that cross-reference study_group_members
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view" ON study_groups
  USING (
    id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Group creator can update" ON study_groups
  FOR UPDATE USING (created_by = auth.uid());

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own group membership" ON study_group_members
  USING (
    group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Members manage own row" ON study_group_members
  FOR ALL USING (user_id = auth.uid());


CREATE TABLE group_verse_threads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  verse_ref         text NOT NULL,
  book              text NOT NULL,
  chapter           integer NOT NULL,
  verse             integer,
  thread_starter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, verse_ref)
);

CREATE INDEX idx_group_threads_group   ON group_verse_threads(group_id);
CREATE INDEX idx_group_threads_passage ON group_verse_threads(group_id, book, chapter);

ALTER TABLE group_verse_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view threads" ON group_verse_threads
  USING (
    group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );


CREATE TABLE group_thread_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  uuid NOT NULL REFERENCES group_verse_threads(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at  timestamptz
);

CREATE INDEX idx_group_thread_msgs ON group_thread_messages(thread_id, created_at);

ALTER TABLE group_thread_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view thread messages" ON group_thread_messages
  USING (
    thread_id IN (
      SELECT t.id FROM group_verse_threads t
      JOIN study_group_members m ON m.group_id = t.group_id
      WHERE m.user_id = auth.uid()
    )
  );
CREATE POLICY "Users manage own messages" ON group_thread_messages
  FOR ALL USING (user_id = auth.uid());


CREATE TABLE group_prayer_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body        text NOT NULL,
  verse_ref   text,
  is_answered boolean NOT NULL DEFAULT false,
  answered_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_group_prayer_group ON group_prayer_requests(group_id, created_at DESC);

ALTER TABLE group_prayer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view prayer requests" ON group_prayer_requests
  USING (
    group_id IN (
      SELECT group_id FROM study_group_members
      WHERE user_id = auth.uid() AND prayer_visible = true
    )
    OR user_id = auth.uid()
  );
CREATE POLICY "Users manage own prayer requests" ON group_prayer_requests
  FOR ALL USING (user_id = auth.uid());


CREATE TABLE verse_pulse_cache (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  verse_ref  text NOT NULL,
  book       text NOT NULL,
  chapter    integer NOT NULL,
  verse      integer,
  raw_count  integer NOT NULL DEFAULT 0,
  weight     numeric(4,3) NOT NULL DEFAULT 0.000,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_start, verse_ref)
);

CREATE INDEX idx_pulse_week ON verse_pulse_cache(week_start DESC, weight DESC);


-- =============================================================================
-- 13 — Operations & Infrastructure
-- =============================================================================

CREATE TABLE webhook_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type      text NOT NULL,
  status          text NOT NULL DEFAULT 'processing'
                    CHECK (status IN ('processing', 'succeeded', 'failed', 'ignored')),
  error_message   text,
  payload         jsonb NOT NULL DEFAULT '{}',
  received_at     timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz,
  CONSTRAINT stripe_event_id_not_empty CHECK (stripe_event_id <> '')
);

CREATE INDEX idx_webhook_events_received ON webhook_events(received_at DESC);
CREATE INDEX idx_webhook_events_status ON webhook_events(status) WHERE status IN ('processing', 'failed');


CREATE TABLE cron_job_runs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name       text NOT NULL,
  status         text NOT NULL DEFAULT 'running'
                   CHECK (status IN ('running', 'succeeded', 'failed', 'skipped')),
  scope          jsonb DEFAULT '{}',
  rows_processed integer DEFAULT 0,
  rows_skipped   integer DEFAULT 0,
  error_message  text,
  started_at     timestamptz NOT NULL DEFAULT now(),
  completed_at   timestamptz,
  duration_ms    integer
);

CREATE INDEX idx_cron_runs_job_name ON cron_job_runs(job_name, started_at DESC);
CREATE INDEX idx_cron_runs_status ON cron_job_runs(status) WHERE status = 'running';
CREATE INDEX idx_cron_runs_started ON cron_job_runs(started_at DESC);


CREATE TABLE seed_checkpoints (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_name       text NOT NULL UNIQUE,
  last_checkpoint jsonb NOT NULL DEFAULT '{}',
  rows_inserted   integer NOT NULL DEFAULT 0,
  rows_skipped    integer NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'complete', 'failed')),
  error_message   text,
  started_at      timestamptz NOT NULL DEFAULT now(),
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz
);

CREATE INDEX idx_seed_checkpoints_name ON seed_checkpoints(seed_name);


-- =============================================================================
-- Seed Charles as the default companion
-- =============================================================================
INSERT INTO companion_definitions (slug, display_name, tagline, tradition, is_default, sort_order)
VALUES ('charles', 'Charles', 'Your personal Bible study companion', 'reformed', true, 0);
