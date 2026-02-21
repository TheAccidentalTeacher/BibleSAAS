# 03 — Bible Content & Personalized Content

Raw chapter cache, OIA questions, and AI-generated content keyed to user+chapter.

---

```sql
-- ============================================================
-- CHAPTERS (Bible text cache — multi-translation)
-- ESV: fetch live, cache for session only (license); expires_at set to now()+24h
-- KJV/WEB/ASV: stored permanently (public domain)
-- API.Bible translations: fetch on demand, session cache only (no permanent store)
-- ============================================================
CREATE TABLE chapters (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book          text NOT NULL,
  chapter       integer NOT NULL,
  translation   text NOT NULL DEFAULT 'ESV',  -- 'ESV', 'KJV', 'WEB', 'ASV', 'YLT', etc.
  text_json     jsonb NOT NULL,               -- verse-by-verse: [{"verse":1, "text":"..."}]
  fetched_at    timestamptz DEFAULT now(),
  -- License cache control:
  -- ESV rows: expires_at = fetched_at + 24h (cleared by background job; re-fetched on demand)
  -- Public domain rows: expires_at = NULL (permanent)
  -- API.Bible rows: expires_at = fetched_at + 1h (short session cache only)
  expires_at      timestamptz,
  -- Thematic tags for hymn matching (Session 21, AI-batched at import time)
  chapter_themes  text[] DEFAULT '{}',
  meta            jsonb DEFAULT '{}',
  UNIQUE(book, chapter, translation)
);

CREATE INDEX idx_chapters_translation ON chapters(translation, book, chapter);
CREATE INDEX idx_chapters_expiry ON chapters(expires_at) WHERE expires_at IS NOT NULL;
-- No RLS — chapter text is public; restricted at API layer if needed.


-- ============================================================
-- SUPPORTED TRANSLATIONS
-- Master catalog of all translations the app can serve.
-- source controls where text comes from at runtime.
-- ============================================================
CREATE TABLE supported_translations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE,      -- 'ESV', 'KJV', 'NIV', 'NASB', 'WEB', etc.
  display_name      text NOT NULL,             -- 'English Standard Version'
  abbreviation      text NOT NULL,             -- 'ESV' (for UI pills + labels)
  language          text NOT NULL DEFAULT 'en',
  source            text NOT NULL              -- 'esv_api', 'api_bible', 'local', 'supabase'
                      CHECK (source IN ('esv_api', 'api_bible', 'local', 'supabase')),
  api_bible_id      text,                      -- API.Bible bibleId GUID (for api_bible source)
  license_type      text NOT NULL DEFAULT 'public_domain'
                      CHECK (license_type IN ('public_domain', 'commercial_licensed', 'api_only')),
  -- Cache policy driven by license_type:
  -- public_domain     -> store permanently in chapters table
  -- commercial_licensed -> store with expires_at per session (negotiated terms)
  -- api_only          -> fetch on demand, short session cache, never permanently stored
  tier_required     text DEFAULT 'free'
                      CHECK (tier_required IN ('free', 'standard', 'premium', 'your_edition')),
  is_comparison_eligible boolean DEFAULT true, -- can be used in compare mode
  is_active         boolean DEFAULT true,
  sort_order        integer DEFAULT 0,         -- display order in translation picker
  launch_phase      text DEFAULT 'day1'
                      CHECK (launch_phase IN ('day1', 'v2', 'future')),
  notes             text,                      -- internal notes on licensing status
  meta              jsonb DEFAULT '{}'
);

-- Seed data (inserted at deploy time):
-- ('ESV',  'English Standard Version',    'ESV', 'en', 'esv_api',   NULL,       'commercial_licensed', 'free',     true,  true, 1,  'day1')
-- ('KJV',  'King James Version',          'KJV', 'en', 'supabase',  NULL,       'public_domain',       'free',     true,  true, 2,  'day1')
-- ('WEB',  'World English Bible',         'WEB', 'en', 'supabase',  NULL,       'public_domain',       'free',     true,  true, 3,  'day1')
-- ('ASV',  'American Standard Version',   'ASV', 'en', 'supabase',  NULL,       'public_domain',       'free',     true,  true, 4,  'day1')
-- ('NIV',  'New International Version',   'NIV', 'en', 'api_bible', '[guid]',   'api_only',            'standard', true,  true, 5,  'v2')
-- ('NASB', 'New American Standard Bible', 'NASB','en', 'api_bible', '[guid]',   'api_only',            'standard', true,  true, 6,  'v2')
-- ('NLT',  'New Living Translation',      'NLT', 'en', 'api_bible', '[guid]',   'api_only',            'standard', true,  true, 7,  'v2')
-- ('CSB',  'Christian Standard Bible',    'CSB', 'en', 'api_bible', '[guid]',   'api_only',            'standard', true,  true, 8,  'v2')
-- ('YLT',  'Young-s Literal Translation', 'YLT', 'en', 'supabase',  NULL,       'public_domain',       'free',     true,  true, 9,  'day1')
-- No RLS — read-only reference data.


-- ============================================================
-- QUESTIONS (OIA question bank per chapter — shared)
-- ============================================================
CREATE TABLE questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book            text NOT NULL,
  chapter         integer NOT NULL,
  oia_type        text NOT NULL CHECK (oia_type IN ('observe', 'interpret', 'apply')),
  question_text   text NOT NULL,
  answer_prompt   text,                       -- coaching hint for the user
  difficulty      text DEFAULT 'standard'     -- 'surface', 'standard', 'deep'
                    CHECK (difficulty IN ('surface', 'standard', 'deep')),
  source          text DEFAULT 'system',      -- 'system', 'ai-generated', 'user-contributed'
  is_active       boolean DEFAULT true,
  meta            jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_questions_book_chapter ON questions(book, chapter, oia_type);


-- ============================================================
-- PERSONALIZED CONTENT (AI-generated, user+chapter keyed)
-- ============================================================
-- One row per (user × book × chapter) — generated once, reused until stale.
CREATE TABLE personalized_content (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book            text NOT NULL,
  chapter         integer NOT NULL,

  -- AI outputs
  intro_text      text,           -- Charles's opening hook for this chapter
  connections     jsonb,          -- [{type:'life', text:'...'}, ...] tailored hooks
  question_ids    uuid[],         -- ordered list of question ids chosen for this user
  questions       jsonb,          -- [{oia_type, text, answer_prompt}] — fully generated questions (Model B)
  word_note       jsonb,          -- Clarke-methodology Word Note (Tim + Scholar archetype).
                                  -- Pipeline: strongs_lexicon + clarke commentary_entry
                                  --   → Charles synthesizes to one sentence.
                                  -- Shape: {
                                  --   strongs_number, original_word, transliteration,
                                  --   morphology, short_def,
                                  --   clarke_note (raw Clarke if exists),
                                  --   charles_synthesis
                                  -- }
                                  -- Null when word_note feature toggle is off for this user.
  closing_text    text,           -- Charles's sign-off / blessing

  -- Cache invalidation
  profile_hash    text NOT NULL,  -- snapshot of profile state at generation time
  generated_at    timestamptz DEFAULT now(),
  is_stale        boolean DEFAULT false,

  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, book, chapter)
);

ALTER TABLE personalized_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own content" ON personalized_content USING (auth.uid() = user_id);

-- Service role used by background revalidation job — no RLS restriction needed at service tier.
```
