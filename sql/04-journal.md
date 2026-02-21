# 04 — Journal

Users write OIA answers and free-form notes. Precious data — soft deletes only.

---

```sql
-- ============================================================
-- JOURNAL ENTRIES (one per chapter-session)
-- ============================================================
CREATE TABLE journal_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book            text NOT NULL,
  chapter         integer NOT NULL,
  studied_at      timestamptz DEFAULT now(),  -- when the session happened
  just_read_mode  boolean DEFAULT false,       -- was "Just Read" mode active?
  note            text,                        -- free-form note at the top of session

  -- Voice notes (Your Edition feature — dictate, AI transcribes, links to passage)
  voice_note_url              text,            -- Supabase Storage URL for audio file
  voice_note_duration_seconds integer,
  voice_note_transcript       text,            -- AI transcription (Whisper)
  voice_note_transcribed_at   timestamptz,

  -- Lament mode (Session 26)
  is_lament_session  boolean NOT NULL DEFAULT false,
  follow_up_at       timestamptz,              -- scheduled 24h follow-up prompt after lament session

  deleted_at      timestamptz,                 -- soft delete

  -- Session 31: letter to younger self — response to an old journal entry
  -- The original entry is immutable; this is a separate addendum written later.
  response_note   text,
  responded_at    timestamptz,

  meta            jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_journal_user ON journal_entries(user_id, studied_at DESC);
CREATE INDEX idx_journal_chapter ON journal_entries(user_id, book, chapter);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journal" ON journal_entries USING (auth.uid() = user_id);


-- ============================================================
-- JOURNAL ANSWERS (per-question responses within a session)
-- ============================================================
CREATE TABLE journal_answers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id     uuid REFERENCES questions(id),
  oia_type        text CHECK (oia_type IN ('observe', 'interpret', 'apply')),
  question_text   text,                -- snapshot of question at time of answer
  answer_text     text,
  charles_response text,               -- Charles's reply after user submitted answer
  deleted_at      timestamptz,
  meta            jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_answers_entry ON journal_answers(entry_id);
CREATE INDEX idx_answers_user ON journal_answers(user_id, created_at DESC);

ALTER TABLE journal_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own answers" ON journal_answers USING (auth.uid() = user_id);
```
