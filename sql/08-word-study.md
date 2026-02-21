# 08 — Word Study

Strong's lexicon, morphological data, and word occurrence index.
These are reference/import tables — no RLS, read-only after import.

---

```sql
-- ============================================================
-- STRONGS LEXICON
-- Combined Hebrew (BDB/Strong's) + Greek (Thayer's/Abbott-Smith)
-- ============================================================
CREATE TABLE strongs_lexicon (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strongs_number  text NOT NULL UNIQUE,   -- 'H0001', 'G0001' (zero-padded for sorting)
  language        text NOT NULL CHECK (language IN ('hebrew', 'greek')),
  original_word   text NOT NULL,          -- Hebrew/Greek script
  transliteration text,
  pronunciation   text,
  part_of_speech  text,
  short_def       text,                   -- one-liner
  long_def        text,                   -- full lexicon entry
  usage_notes     text,                   -- how it's used across Scripture
  kjv_usage       text,                   -- how KJV translates it (helpful reference)
  source          text DEFAULT 'strongs', -- 'strongs', 'bdb', 'thayers', 'abbott_smith'

  -- Hebrew-specific (three-letter root system)
  hebrew_root     text,                   -- 3-letter shoresh e.g. 'אהב' (for Hebrew only)
  root_strongs    text,                   -- Strong's number of the root word (if different)

  -- Greek-specific
  semantic_domain text,                   -- Louw-Nida domain e.g. 'Psychological Faculties'

  -- Pre-computed: per-book occurrence counts for heat map rendering.
  -- Shape: {"Genesis": 4, "Psalms": 23, "Romans": 11, ...}
  -- Populated at import time; updated if morphology_data is re-imported.
  occurrence_heatmap jsonb DEFAULT '{}',
  total_occurrences  integer DEFAULT 0,   -- denormalized sum across all books

  -- Charles cached word study (shared across all users — not personalized).
  -- Generated once by background job; Charles explains this word in his voice.
  -- Standard tier: this IS the word study. Premium: raw lexicon data also shown.
  -- Shape: {intro, etymology, usage_insight, theological_weight, closing_line, generated_at}
  charles_study   jsonb DEFAULT '{}',
  charles_study_at timestamptz,

  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_strongs_number ON strongs_lexicon(strongs_number);
CREATE INDEX idx_strongs_language ON strongs_lexicon(language);
CREATE INDEX idx_strongs_root ON strongs_lexicon(hebrew_root) WHERE hebrew_root IS NOT NULL;


-- ============================================================
-- MORPHOLOGY DATA (from MorphGNT + OpenScriptures Hebrew Bible)
-- One row per word occurrence in Scripture
-- ============================================================
CREATE TABLE morphology_data (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book            text NOT NULL,
  chapter         integer NOT NULL,
  verse           integer NOT NULL,
  word_position   integer NOT NULL,       -- position within verse (1-based)
  original_word   text NOT NULL,
  normalized_form text,                   -- lemma / dictionary form
  strongs_number  text REFERENCES strongs_lexicon(strongs_number),
  language        text CHECK (language IN ('hebrew', 'greek')),
  morphology_code text,                   -- e.g. 'V-AAI-3S' (verb, aorist, active, indicative, 3rd singular)
  morphology_desc text,                   -- human-readable: 'Verb, Aorist Active Indicative, 3rd Person Singular'
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_morph_passage ON morphology_data(book, chapter, verse, word_position);
CREATE INDEX idx_morph_strongs ON morphology_data(strongs_number);
CREATE INDEX idx_morph_lemma ON morphology_data(normalized_form);


-- ============================================================
-- WORD OCCURRENCES (fast lookup: where does a Strong's word appear?)
-- Can be derived from morphology_data, but pre-indexed for speed.
-- ============================================================
CREATE TABLE word_occurrences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strongs_number  text NOT NULL REFERENCES strongs_lexicon(strongs_number),
  book            text NOT NULL,
  chapter         integer NOT NULL,
  verse           integer NOT NULL,
  count           integer DEFAULT 1,      -- how many times in this verse
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_word_occurrences_strongs ON word_occurrences(strongs_number);
CREATE INDEX idx_word_occurrences_passage ON word_occurrences(book, chapter, verse);


-- ============================================================
-- USER WORD STUDY HISTORY
-- Tracks which Strong's words each user has studied.
-- Powers: skill tree word-study nodes, "words studied" stat in Study DNA,
-- achievement unlocks (e.g. "Studied 100 Greek words"), and
-- "recently studied" list on /library/word-study screen.
-- ============================================================
CREATE TABLE user_word_study_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  strongs_number  text NOT NULL REFERENCES strongs_lexicon(strongs_number),
  first_studied_at timestamptz DEFAULT now(),
  last_studied_at  timestamptz DEFAULT now(),
  study_count      integer DEFAULT 1,    -- how many times this word has been opened
  source_book      text,                 -- book context where user first encountered this word
  source_chapter   integer,
  meta             jsonb DEFAULT '{}',
  UNIQUE(user_id, strongs_number)
);

CREATE INDEX idx_word_history_user ON user_word_study_history(user_id, last_studied_at DESC);

ALTER TABLE user_word_study_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own word history" ON user_word_study_history USING (auth.uid() = user_id);
```
