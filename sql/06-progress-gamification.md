# 06 — Progress & Gamification

Streaks, achievements, memory verses (spaced repetition), and prayer journal.

---

```sql
-- ============================================================
-- STREAKS
-- ============================================================
CREATE TABLE streaks (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak        integer DEFAULT 0,
  longest_streak        integer DEFAULT 0,
  last_active_date      date,
  total_days            integer DEFAULT 0,
  total_xp              integer DEFAULT 0,
  -- Level (Session 23: derived from total_xp, cached)
  current_level         integer NOT NULL DEFAULT 1,
  -- Streak grace (one missed day doesn't break streak; resets after 7 active days)
  streak_grace_used     boolean NOT NULL DEFAULT false,
  streak_grace_last_used date,
  -- Prayer streak (Session 19)
  prayer_days_streaked  integer NOT NULL DEFAULT 0,
  prayer_longest_streak integer NOT NULL DEFAULT 0,
  prayer_last_active    date,
  meta                  jsonb DEFAULT '{}'
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own streaks" ON streaks USING (auth.uid() = user_id);


-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text NOT NULL UNIQUE,   -- 'first_chapter', 'streak_30', 'full_ot', etc.
  name            text NOT NULL,
  description     text,
  xp_value        integer DEFAULT 0,
  icon            text,                   -- Phosphor icon name or custom SVG key
  -- Session 23 additions
  category        text NOT NULL DEFAULT 'reading'
                    CHECK (category IN ('reading','streaks','engagement','memory','prayer','word_study','special')),
  tier_required   text NOT NULL DEFAULT 'free'
                    CHECK (tier_required IN ('free','standard','premium','your_edition')),
  is_hidden       boolean NOT NULL DEFAULT false, -- show as silhouette until earned
  sort_order      integer NOT NULL DEFAULT 0,
  meta            jsonb DEFAULT '{}'
);

CREATE TABLE user_achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id  uuid NOT NULL REFERENCES achievements(id),
  earned_at       timestamptz DEFAULT now(),
  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own achievements" ON user_achievements USING (auth.uid() = user_id);


-- ============================================================
-- XP EVENTS (Session 23 — immutable audit log of all XP earned)
-- ============================================================
CREATE TABLE xp_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  -- e.g. 'chapter_read', 'chapter_read_all_oia', 'memory_verse_mastered',
  --      'prayer_answered', 'streak_7', 'bingo_trail_complete', etc.
  xp_earned   integer NOT NULL,
  context     jsonb DEFAULT '{}',
  -- e.g. { "book": "JHN", "chapter": 3, "translation": "WEB" }
  --      { "verse_ref": "John 3:16", "strong_number": "G25" }
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_events_user ON xp_events(user_id, created_at DESC);
CREATE INDEX idx_xp_events_type ON xp_events(user_id, event_type);

ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own XP events" ON xp_events USING (auth.uid() = user_id);


-- ============================================================
-- MEMORY VERSES (spaced repetition — SM-2 algorithm)
-- ============================================================
CREATE TABLE memory_verses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book            text NOT NULL,
  chapter         integer NOT NULL,
  verse           integer NOT NULL,
  verse_text      text NOT NULL,          -- snapshot at time of saving
  translation     text DEFAULT 'ESV',

  -- SM-2 spaced repetition fields
  ease_factor     numeric DEFAULT 2.5,    -- SM-2 EF; starts at 2.5, min 1.3
  interval_days   integer DEFAULT 1,      -- days until next review
  repetitions     integer DEFAULT 0,      -- total successful reviews
  next_review     date DEFAULT now()::date,
  last_reviewed   timestamptz,
  mastered        boolean DEFAULT false,  -- true when interval_days >= 21 and repetitions >= 5
  practice_count  integer DEFAULT 0,      -- total review sessions (including failed)

  -- Review mode: how the user prefers to practice this verse
  -- 'flashcard' = show ref, tap to reveal full text
  -- 'fill_blank' = key words blanked, user types/selects each blank
  -- 'word_order' = all words shuffled, user taps in correct order
  -- 'all'        = app rotates through all three modes
  review_mode     text DEFAULT 'all'
                    CHECK (review_mode IN ('flashcard', 'fill_blank', 'word_order', 'all')),

  -- Source context: where the user added this verse from
  added_from      text DEFAULT 'reading'
                    CHECK (added_from IN ('reading', 'journal', 'search', 'suggestion', 'family_share')),

  -- Session 30: catechism Q&A memory (same SM-2 mechanics, different item type)
  -- 'verse' = Bible verse (default); 'catechism_qa' = catechism Q&A
  memory_type       text NOT NULL DEFAULT 'verse'
                      CHECK (memory_type IN ('verse', 'catechism_qa')),
  catechism_entry_id uuid REFERENCES catechism_entries(id) ON DELETE CASCADE,
  -- When memory_type = 'catechism_qa': verse/chapter/verse_text may be null;
  -- catechism_entry_id is required. Constraint enforced at app layer.

  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_memory_verses_review ON memory_verses(user_id, next_review);
CREATE INDEX idx_memory_verses_mastered ON memory_verses(user_id, mastered);

ALTER TABLE memory_verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory verses" ON memory_verses USING (auth.uid() = user_id);


-- ============================================================
-- MEMORY VERSE REVIEWS (log of every review session)
-- Powers: progress charts, streak integration, achievement triggers,
--         SM-2 algorithm history for debugging/analysis.
-- ============================================================
CREATE TABLE memory_verse_reviews (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memory_verse_id uuid NOT NULL REFERENCES memory_verses(id) ON DELETE CASCADE,
  reviewed_at     timestamptz DEFAULT now(),
  review_mode     text NOT NULL
                    CHECK (review_mode IN ('flashcard', 'fill_blank', 'word_order')),
  -- SM-2 quality score: 0-5 (0-1=fail, 2=hard, 3=good, 4=easy, 5=perfect)
  quality         integer NOT NULL CHECK (quality BETWEEN 0 AND 5),
  -- Snapshot of SM-2 state AFTER this review (for audit/replay)
  ease_factor_after   numeric,
  interval_after      integer,
  repetitions_after   integer,
  time_taken_seconds  integer,            -- how long the user spent on this verse
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_mv_reviews_user ON memory_verse_reviews(user_id, reviewed_at DESC);
CREATE INDEX idx_mv_reviews_verse ON memory_verse_reviews(memory_verse_id, reviewed_at DESC);

ALTER TABLE memory_verse_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews" ON memory_verse_reviews USING (auth.uid() = user_id);


-- ============================================================
-- PRAYER JOURNAL
-- ============================================================
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
  answered_note       text,                   -- how God answered
  passage_ref         text,                   -- optional: 'John 3:16'
  linked_verse_text   text,                   -- full verse text cached
  tags                text[],
  reminder_enabled    boolean NOT NULL DEFAULT false,
  reminder_time       time,                   -- e.g. '06:30'
  reminder_days       text[],                 -- e.g. ['MON','WED','FRI'] or ['DAILY']
  reminder_last_sent  timestamptz,
  charles_note        jsonb,
  -- { "text": "...", "generated_at": "...", "companion_id": "..." }
  shared_with         uuid[],                 -- Phase 2: accountability partner sharing
  hymn_id             uuid REFERENCES hymn_index(id) ON DELETE SET NULL, -- optional attached hymn (Session 21)
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

-- Prayer progress log (Session 19)
CREATE TABLE prayer_updates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id   uuid NOT NULL REFERENCES prayer_journal(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prayer_updates_prayer ON prayer_updates(prayer_id, created_at);

ALTER TABLE prayer_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prayer updates" ON prayer_updates USING (auth.uid() = user_id);


-- ============================================================
-- USER CHARACTER CARDS (earned when a character is first encountered)
-- ============================================================
CREATE TABLE user_character_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  character_id    uuid NOT NULL REFERENCES bible_characters(id),
  discovered_at   timestamptz DEFAULT now(),
  -- Book/chapter/verse where the user first read this character
  discovered_book    text,
  discovered_chapter integer,
  discovered_verse   integer,
  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, character_id)
);

CREATE INDEX idx_character_cards_user ON user_character_cards(user_id, discovered_at DESC);

ALTER TABLE user_character_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own cards" ON user_character_cards USING (auth.uid() = user_id);


-- ============================================================
-- SKILL TREE NODES (static — designed, not generated)
-- ============================================================
CREATE TABLE skill_tree_nodes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text NOT NULL UNIQUE,   -- 'genesis', 'exodus', 'tabernacle_deep_dive', etc.
  label           text NOT NULL,
  description     text,
  node_type       text NOT NULL           -- 'book', 'theology', 'cross_reference', 'hard_passage'
                    CHECK (node_type IN ('book', 'theology', 'cross_reference', 'hard_passage')),
  -- Color codes matching Session 4 design:
  -- Blue = narrative, Gold = theological, Green = cross-reference, Red = hard passage
  color_code      text DEFAULT 'blue'
                    CHECK (color_code IN ('blue', 'gold', 'green', 'red')),
  -- What reading triggers this node's unlock
  unlock_book     text,
  unlock_chapter_min integer,             -- must have read up to this chapter
  -- Tree structure
  parent_node_id  uuid REFERENCES skill_tree_nodes(id),
  sort_order      integer,
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_skill_tree_parent ON skill_tree_nodes(parent_node_id);


-- ============================================================
-- USER SKILL TREE (which nodes each user has unlocked)
-- ============================================================
CREATE TABLE user_skill_tree (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  node_id         uuid NOT NULL REFERENCES skill_tree_nodes(id),
  unlocked_at     timestamptz DEFAULT now(),
  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, node_id)
);

CREATE INDEX idx_user_skill_tree ON user_skill_tree(user_id);

ALTER TABLE user_skill_tree ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own skill tree" ON user_skill_tree USING (auth.uid() = user_id);
```
