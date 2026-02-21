# 07 — Source Data (Public Domain Reference Content)

Static/imported reference tables. No RLS — read-only, public content. Populated via import scripts.

---

```sql
-- ============================================================
-- TSK REFERENCES (Treasury of Scripture Knowledge)
-- ~500K cross-reference pairs
-- ============================================================
CREATE TABLE tsk_references (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_book   text NOT NULL,
  from_chapter integer NOT NULL,
  from_verse  integer NOT NULL,
  to_book     text NOT NULL,
  to_chapter  integer NOT NULL,
  to_verse    integer NOT NULL,
  meta        jsonb DEFAULT '{}'
);

CREATE INDEX idx_tsk_from ON tsk_references(from_book, from_chapter, from_verse);
CREATE INDEX idx_tsk_to ON tsk_references(to_book, to_chapter, to_verse);


-- ============================================================
-- TSK VERSE STATS (pre-computed reference density per verse)
-- Populated at import time from tsk_references.
-- Drives the reference density gutter on the reading screen.
-- No runtime aggregation needed.
-- ============================================================
CREATE TABLE tsk_verse_stats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book            text NOT NULL,
  chapter         integer NOT NULL,
  verse           integer NOT NULL,
  reference_count integer NOT NULL DEFAULT 0,
  -- Tier drives gutter display: none=0, low=1-5 (dot), medium=6-15 (badge), high=16+ (glow)
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


-- ============================================================
-- SPURGEON INDEX
-- Indexes Morning & Evening, Treasury of David, Sermons
-- ============================================================
CREATE TABLE spurgeon_index (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source      text NOT NULL,      -- 'morning_evening', 'treasury_of_david', 'sermon'
  date_key    text,               -- 'jan_1_am', 'jan_1_pm' for Morning & Evening
  book        text,               -- primary passage
  chapter     integer,
  verse       integer,
  title       text,
  body        text NOT NULL,
  meta        jsonb DEFAULT '{}'
);

CREATE INDEX idx_spurgeon_passage ON spurgeon_index(book, chapter, verse);
CREATE INDEX idx_spurgeon_source ON spurgeon_index(source, date_key);


-- ============================================================
-- CATECHISM ENTRIES
-- Westminster (WLC, WSC) + Heidelberg
-- ============================================================
CREATE TABLE catechism_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catechism       text NOT NULL,  -- 'WSC', 'WLC', 'HC'
  question_number integer NOT NULL,
  lord_day        integer,        -- HC only: 1–52
  section         text,           -- HC: 'guilt'|'grace'|'gratitude'; WLC: 'God'|'Man'|'Christ'|'Salvation'|'Law'|'Means_of_Grace'
  question_text   text NOT NULL,
  answer_text     text NOT NULL,
  scripture_refs  text[],         -- legacy flat array: ['Rom 3:23', 'Isa 53:6']
  proof_texts     jsonb DEFAULT '[]',  -- richer: [{ref, book, chapter, verse, note}] — engine for bidirectional lookup
  keywords        text[],         -- searchable theological keywords
  charles_note    text,           -- Charles synthesis paragraph (Your Edition)
  meta            jsonb DEFAULT '{}',
  UNIQUE(catechism, question_number)
);

CREATE INDEX idx_catechism ON catechism_entries(catechism, question_number);
CREATE INDEX idx_catechism_lord_day ON catechism_entries(catechism, lord_day);
CREATE INDEX idx_catechism_proof_texts ON catechism_entries USING GIN (proof_texts);
CREATE INDEX idx_catechism_keywords ON catechism_entries USING GIN (keywords);


-- ============================================================
-- TYPOLOGY CONNECTIONS
-- OT type → NT antitype mappings
-- ============================================================
CREATE TABLE typology_connections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ot_book         text NOT NULL,
  ot_chapter      integer,
  ot_verse        integer,
  ot_label        text NOT NULL,              -- 'The Bronze Serpent'
  nt_book         text NOT NULL,
  nt_chapter      integer,
  nt_verse        integer,
  nt_label        text NOT NULL,              -- 'Christ Lifted Up'
  explanation     text,                       -- curated/imported explanation
  charles_note    text,                       -- Session 27: AI-generated synthesis
  direction       text NOT NULL DEFAULT 'ot_to_nt'
                    CHECK (direction IN ('ot_to_nt','nt_looks_back','within_ot','within_nt')),
  prominence      integer NOT NULL DEFAULT 3
                    CHECK (prominence BETWEEN 1 AND 5),
  -- 1=minor echo, 5=explicit NT citation; used to rank which connections surface
  connection_type text DEFAULT 'typology'
                    CHECK (connection_type IN ('typology', 'prophecy', 'canonical_shape', 'theme')),
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_typology_ot ON typology_connections(ot_book, ot_chapter);
CREATE INDEX idx_typology_nt ON typology_connections(nt_book, nt_chapter);


-- ============================================================
-- BIBLE DICTIONARY ENTRIES
-- Easton's, Smith's, ISBE — one row per source per term.
-- Multiple sources can share the same slug (same term, different source).
-- Page route: /library/dictionary/[slug]
-- Tabs on page: one per source that has an entry for this slug.
-- ============================================================
CREATE TABLE bible_dictionary_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source      text NOT NULL,      -- 'eastons', 'smiths', 'isbe'
  term        text NOT NULL,
  slug        text NOT NULL,      -- URL-safe, shared across sources: 'pharisees', 'ark-of-the-covenant'
  body        text NOT NULL,
  passage_refs text[] DEFAULT '{}',  -- scripture references mentioned in entry (for cross-linking)
  -- Charles note: one punchy synthesis sentence across all sources for this slug.
  -- Stored only on the PRIMARY source row (eastons preferred; smiths fallback; isbe fallback).
  -- NULL on secondary source rows.
  charles_note text,
  is_primary_source boolean DEFAULT false,  -- true on the one row that carries charles_note
  meta        jsonb DEFAULT '{}'
);

CREATE INDEX idx_dict_slug ON bible_dictionary_entries(slug);
CREATE INDEX idx_dict_term ON bible_dictionary_entries(lower(term));
CREATE INDEX idx_dict_source ON bible_dictionary_entries(source, slug);
CREATE UNIQUE INDEX idx_dict_source_slug ON bible_dictionary_entries(source, slug);


-- ============================================================
-- COMMENTARY ENTRIES
-- Matthew Henry, Calvin, Adam Clarke
-- ============================================================
CREATE TABLE commentary_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source          text NOT NULL,  -- 'matthew_henry', 'calvin', 'adam_clarke'
  book            text NOT NULL,
  chapter         integer NOT NULL,
  verse_start     integer,
  verse_end       integer,
  section_title   text,           -- Displayed as subheading in Commentary Vault tab
  body            text NOT NULL,
  -- Vault display: Clarke is verse-level (is_vault_featured only on key insight verses);
  -- MH and Calvin are chapter-level (is_vault_featured = true on every chapter row).
  is_vault_featured boolean DEFAULT false,  -- shown in the reading screen Commentary Vault strip
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_commentary_passage ON commentary_entries(book, chapter, verse_start);
CREATE INDEX idx_commentary_source ON commentary_entries(source, book, chapter);


-- ============================================================
-- HYMN INDEX
-- Public domain hymns with scripture tags
-- ============================================================
CREATE TABLE hymn_index (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  first_line      text,                       -- opening line of lyrics (display preview)
  author          text,
  year_written    integer,
  tune_name       text,                       -- e.g. 'LOBE DEN HERREN', 'HYFRYDOL'
  meter           text,                       -- e.g. '8.7.8.7', 'L.M.', '10.10.10.10'
  lyrics          text NOT NULL,              -- full text, stanzas separated by blank lines
  explicit_refs   text[],                     -- parsed Scripture refs, e.g. 'JHN 3:16' (Session 21)
  thematic_tags   text[],                     -- 'grace', 'atonement', 'resurrection' (was: themes)
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_hymn_refs ON hymn_index USING gin(explicit_refs);
CREATE INDEX idx_hymn_themes ON hymn_index USING gin(thematic_tags);


-- ============================================================
-- BIBLE CHARACTERS
-- Index of all named people in Scripture (~3,237 entries).
-- Sourced from public domain dictionaries. No AI-generated images.
-- Character cards use heraldic SVG icon + typography only.
-- ============================================================
CREATE TABLE bible_characters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  alternate_names text[],
  -- Role determines which SVG calling-symbol icon is displayed on card
  primary_role    text,           -- 'king', 'prophet', 'apostle', 'judge', 'priest',
                                  --  'warrior', 'patriarch', 'matriarch', 'disciple',
                                  --  'musician', 'builder', 'servant', 'seeker', 'angel'
  tribe_nation    text,           -- 'Israel/Judah', 'Gentile', 'angel', etc.
  era             text,           -- 'Patriarchal', 'Exodus', 'Judges', 'United Kingdom',
                                  --  'Divided Kingdom', 'Exile', 'Post-Exile',
                                  --  'Intertestamental', 'NT Gospels', 'NT Epistles'
  first_mention_book    text NOT NULL,
  first_mention_chapter integer NOT NULL,
  first_mention_verse   integer,
  key_verse       text,           -- e.g. 'John 11:35' — the verse that defines them
  key_verse_text  text,
  description     text,           -- short bio sourced from public domain dictionary
  -- Rarity tier (Session 4 vocabulary: Faithful / Renowned / Mighty / Eternal)
  -- Christ is a separate tier: 'the_word'
  rarity          text DEFAULT 'faithful'
                    CHECK (rarity IN ('faithful', 'renowned', 'mighty', 'eternal', 'the_word')),
  -- Special badges
  is_athlete_of_faith boolean DEFAULT false,  -- David, Elijah, Paul, Samson, Jonathan
  is_in_hebrews_11    boolean DEFAULT false,  -- Hall of Faith
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_characters_first_mention ON bible_characters(first_mention_book, first_mention_chapter);
CREATE INDEX idx_characters_role ON bible_characters(primary_role);
CREATE INDEX idx_characters_rarity ON bible_characters(rarity);


-- ============================================================
-- USER LIBRARY HISTORY
-- Tracks recently visited reference entries (dictionary, commentary, hymns, catechism).
-- Powers: "Recently visited" on Library home, study DNA blind spots,
-- skill tree library nodes, achievement unlocks.
-- ============================================================
CREATE TABLE user_library_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_type      text NOT NULL
                    CHECK (entry_type IN ('dictionary', 'commentary', 'word_study',
                                          'catechism', 'hymn', 'character_card', 'typology')),
  entry_id        uuid NOT NULL,              -- FK to the relevant source table (polymorphic)
  entry_slug      text,                       -- human-readable reference (e.g. 'pharisees', 'H0157')
  entry_label     text,                       -- display label (e.g. 'Pharisees', 'Matthew Henry - John 3')
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
```


---

## psalm_classifications (Session 25  The Psalms as Their Own Category)

Static seed table. No RLS  this is reference data, not user data.

```sql
CREATE TABLE psalm_classifications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psalm_number   integer NOT NULL UNIQUE CHECK (psalm_number BETWEEN 1 AND 150),
  psalm_types    text[] NOT NULL DEFAULT '{}',
  -- Values: 'lament' | 'penitential' | 'praise' | 'royal' | 'wisdom'
  --         'pilgrimage' | 'imprecatory' | 'historical' | 'entrustment'
  psalter_book   integer NOT NULL CHECK (psalter_book BETWEEN 1 AND 5),
  -- Book I=1-41, II=42-72, III=73-89, IV=90-106, V=107-150
  ascent_number  integer,    -- 1-15 for Psalms 120-134 (Songs of Ascent)
  superscription text,       -- The heading in the text, if any
  notes          text        -- Editorial notes on classification decisions
);

CREATE INDEX idx_psalm_class_types ON psalm_classifications USING gin(psalm_types);
-- No RLS  public reference data
```


---

## book_genre_notes (Session 26  Lament Mode)

Static seed table for genre/register metadata on non-Psalm books.
Used by lament mode and typology layer (Session 27) to adjust Charles' register and suggest relevant passages.

```sql
CREATE TABLE book_genre_notes (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_code                text NOT NULL UNIQUE,  -- USFM code: 'JOB', 'LAM', 'HAB', etc.
  book_name                text NOT NULL,
  genre_flags              text[] NOT NULL DEFAULT '{}',
  -- Values: 'lament' | 'wisdom' | 'prophecy' | 'apocalyptic' | 'narrative'
  --         'law' | 'epistle' | 'gospel' | 'poetry' | 'history'
  lament_mode_default      boolean NOT NULL DEFAULT false,
  -- If true, app defaults to lament register when reading this book
  charles_register_override text,
  -- e.g. 'contemplative' | 'pastoral' | 'prophetic' | null (use default)
  lament_passage_refs      text[],
  -- Specific chapters/verses within this book that are especially suited
  -- for lament reading, e.g. ['JOB 3', 'JOB 38-41', 'LAM 3:1-33']
  notes                    text
);

-- No RLS  public reference data
-- Seed examples:
-- ('JOB',  'Job',          '{lament,wisdom}',      true,  'pastoral',      '{JOB 3, JOB 38}',   null)
-- ('LAM',  'Lamentations', '{lament,poetry}',       true,  'pastoral',      '{LAM 3, LAM 5}',    null)
-- ('HAB',  'Habakkuk',     '{lament,prophecy}',     false, 'contemplative', '{HAB 1, HAB 3}',    null)
-- ('RUT',  'Ruth',         '{narrative,entrustment}',false, null,            null,                null)
-- ('JER',  'Jeremiah',     '{lament,prophecy}',     false, 'pastoral',      '{JER 12, JER 20}',  null)
```


---

## five_act_map (Session 27  Canonical Shape and Typology)

Static seed. Maps every Bible chapter to one of the five dramatic acts of Scripture.

```sql
CREATE TABLE five_act_map (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_code       text NOT NULL,     -- USFM book code
  chapter         integer NOT NULL,  -- chapter number (1-based); 0 = whole book applies
  act_number      integer NOT NULL CHECK (act_number BETWEEN 1 AND 5),
  -- Act I=Creation&Fall(Gen1-Gen11), II=Israel&Covenants(Gen12-Mal), III=Jesus(Matt-John),
  -- IV=Church(Acts-Rev3), V=NewCreation(Rev4-22)
  act_name        text NOT NULL,
  act_theme       text,              -- short phrase, e.g. 'The Promise Begins'
  color_key       text,              -- CSS token: 'act-1', 'act-2'... for UI dot/pill
  UNIQUE(book_code, chapter)
);

-- No RLS  public reference data
```


---

## covenant_map (Session 27  Canonical Shape and Typology)

Static seed. The six covenants of Scripture with Charles' synthesis note per covenant.

```sql
CREATE TABLE covenant_map (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  covenant_key        text NOT NULL UNIQUE,
  -- 'adamic' | 'noahic' | 'abrahamic' | 'mosaic' | 'davidic' | 'new'
  name                text NOT NULL,
  anchor_chapters     text[] NOT NULL,
  -- e.g. ['GEN 15', 'GEN 17']  ALL must be read to unlock
  promise_text        text NOT NULL,    -- one-sentence core promise
  sign_text           text,             -- rainbow, circumcision, Sabbath, etc.
  parties_text        text,             -- who the covenant is with
  forward_connection  text,             -- how it points to the next covenant or Christ
  charles_note        text,             -- Charles' synthesis paragraph (Premium tier display)
  sort_order          integer NOT NULL DEFAULT 0
);

-- No RLS  public reference data
```
