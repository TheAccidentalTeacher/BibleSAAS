# 05 — Highlights, Bookmarks & Messages

Inline reading interactions. Messages stores AI chat threads per passage.

---

```sql
-- ============================================================
-- HIGHLIGHTS (colored verse highlighting)
-- ============================================================
CREATE TABLE highlights (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book        text NOT NULL,
  chapter     integer NOT NULL,
  verse_start integer NOT NULL,
  verse_end   integer,                   -- null = single verse
  color       text NOT NULL DEFAULT 'yellow'
                CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'orange', 'purple')),
  note        text,                      -- optional inline annotation on this highlight
  created_at  timestamptz DEFAULT now(),
  deleted_at  timestamptz,               -- soft delete
  meta        jsonb DEFAULT '{}'
);

CREATE INDEX idx_highlights_user_chapter ON highlights(user_id, book, chapter);

ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own highlights" ON highlights USING (auth.uid() = user_id);


-- ============================================================
-- BOOKMARKS (saved passage references)
-- ============================================================
CREATE TABLE bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book        text NOT NULL,
  chapter     integer NOT NULL,
  verse       integer,
  label       text,       -- user-named: 'My life verse', 'Share this', etc.
  created_at  timestamptz DEFAULT now(),
  meta        jsonb DEFAULT '{}',
  UNIQUE(user_id, book, chapter, verse)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON bookmarks USING (auth.uid() = user_id);


-- ============================================================
-- MESSAGES (AI chat threads — per user × passage)
-- ============================================================
-- Freeform "ask Charles anything about this passage" feature.
-- One thread per (user × book × chapter); appended with each message.
CREATE TABLE messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book        text NOT NULL,
  chapter     integer NOT NULL,
  role        text NOT NULL CHECK (role IN ('user', 'assistant')),
  content     text NOT NULL,
  tokens_used integer,                 -- track cost per message
  created_at  timestamptz DEFAULT now(),
  meta        jsonb DEFAULT '{}'
);

CREATE INDEX idx_messages_thread ON messages(user_id, book, chapter, created_at ASC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own messages" ON messages USING (auth.uid() = user_id);


-- ============================================================
-- VERSE THREAD MESSAGES (family + small group verse-anchored conversation)
-- Every message is anchored to a specific verse.
-- The thread lives permanently on that verse for every participant.
-- ============================================================
CREATE TABLE verse_thread_messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_unit_id    uuid NOT NULL REFERENCES family_units(id) ON DELETE CASCADE,
  sender_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Verse anchor (required)
  book              text NOT NULL,
  chapter           integer NOT NULL,
  verse             integer NOT NULL,

  -- Content
  body              text NOT NULL CHECK (char_length(body) <= 1000),
  parent_id         uuid REFERENCES verse_thread_messages(id),  -- for threaded replies

  -- Session 31: forward letters — written now, surfaced on a future date
  -- NULL = deliver immediately. A future date = hold until that date.
  delivery_date     date,

  -- Read receipts
  -- Stored as jsonb: {"user_uuid": "iso_timestamp", ...}
  -- Null entry = unseen. Users can disable read receipts in settings.
  read_by           jsonb DEFAULT '{}',

  created_at        timestamptz DEFAULT now(),
  deleted_at        timestamptz,   -- soft delete
  meta              jsonb DEFAULT '{}'
);

CREATE INDEX idx_verse_thread_anchor ON verse_thread_messages(family_unit_id, book, chapter, verse, created_at ASC);
CREATE INDEX idx_verse_thread_sender ON verse_thread_messages(sender_id);

ALTER TABLE verse_thread_messages ENABLE ROW LEVEL SECURITY;
-- Users can see messages in family units they belong to
CREATE POLICY "Family members see thread messages" ON verse_thread_messages
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_unit_id = verse_thread_messages.family_unit_id
        AND fm.user_id = auth.uid()
    )
  );


-- ============================================================
-- SHARED CONTENT (log of externally shared items)
-- Tracks what was shared, what format, and generates share tokens
-- for trail constellation links and read-only verse cards.
-- ============================================================
CREATE TABLE shared_content (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type    text NOT NULL
                    CHECK (content_type IN ('verse', 'highlight', 'journal_answer', 'trail', 'streak')),
  -- Polymorphic reference to the source record
  source_id       uuid,             -- id of the highlight, journal_answer, trail, etc.
  -- The shareable payload (pre-rendered for verse/highlight/streak cards)
  payload         jsonb NOT NULL,   -- {verse_ref, text, note, color, ...}
  share_token     text UNIQUE DEFAULT gen_random_uuid()::text,
  is_active       boolean DEFAULT true,
  view_count      integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  expires_at      timestamptz,      -- null = never expires
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_shared_content_token ON shared_content(share_token) WHERE is_active = true;
CREATE INDEX idx_shared_content_user ON shared_content(user_id, created_at DESC);

ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own shares" ON shared_content USING (auth.uid() = user_id);
-- Public read via token handled at API layer (service role bypass)
```
