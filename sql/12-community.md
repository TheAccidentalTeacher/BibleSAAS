# 12 — Community of the Book

Small group mode, anonymous pulse, and group prayer. All community features are
opt-in and off by default. No public profiles, no follower counts, no feeds.

---

## study_groups

```sql
CREATE TYPE group_type AS ENUM ('family', 'church', 'friends');

CREATE TABLE study_groups (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  invite_code     text NOT NULL UNIQUE,   -- 6-char alphanumeric, generated on create
  created_by      uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  group_type      group_type NOT NULL DEFAULT 'friends',
  reading_plan_id uuid REFERENCES reading_plans(id) ON DELETE SET NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
-- Leaders and members can read; only leader can update
CREATE POLICY "Group members can view" ON study_groups
  USING (
    id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Group creator can update" ON study_groups
  FOR UPDATE USING (created_by = auth.uid());
```

---

## study_group_members

```sql
CREATE TYPE group_role AS ENUM ('leader', 'member');

CREATE TABLE study_group_members (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id            uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name        text NOT NULL,        -- chosen at join, not pulled from profile
  role                group_role NOT NULL DEFAULT 'member',
  highlights_visible  boolean NOT NULL DEFAULT false,  -- share highlights with group
  prayer_visible      boolean NOT NULL DEFAULT true,   -- share prayer requests with group
  joined_at           timestamptz NOT NULL DEFAULT now(),
  last_active         timestamptz,
  UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_members_group ON study_group_members(group_id);
CREATE INDEX idx_group_members_user  ON study_group_members(user_id);

ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own group membership" ON study_group_members
  USING (
    group_id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Members manage own row" ON study_group_members
  FOR ALL USING (user_id = auth.uid());
```

---

## group_verse_threads

```sql
CREATE TABLE group_verse_threads (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id            uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  verse_ref           text NOT NULL,           -- e.g. 'Romans 8:1'
  book                text NOT NULL,
  chapter             integer NOT NULL,
  verse               integer,
  thread_starter_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, verse_ref)
);

CREATE INDEX idx_group_threads_group   ON group_verse_threads(group_id);
CREATE INDEX idx_group_threads_passage ON group_verse_threads(group_id, book, chapter);

ALTER TABLE group_verse_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view threads" ON group_verse_threads
  USING (
    group_id IN (
      SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
    )
  );
```

---

## group_thread_messages

```sql
CREATE TABLE group_thread_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid NOT NULL REFERENCES group_verse_threads(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  edited_at   timestamptz
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
```

---

## group_prayer_requests

```sql
CREATE TABLE group_prayer_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body         text NOT NULL,
  verse_ref    text,                   -- optional verse anchor
  is_answered  boolean NOT NULL DEFAULT false,
  answered_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
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
```

---

## verse_pulse_cache

Service-role only. Populated by a weekly background job aggregating `verse_interactions`.
No user RLS — users never query this table directly; it is read via a Supabase Edge Function
that returns the top-N verses as relative weight (0.0–1.0), never raw counts.

```sql
CREATE TABLE verse_pulse_cache (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start  date NOT NULL,                 -- Monday of the week
  verse_ref   text NOT NULL,
  book        text NOT NULL,
  chapter     integer NOT NULL,
  verse       integer,
  raw_count   integer NOT NULL DEFAULT 0,
  weight      numeric(4,3) NOT NULL DEFAULT 0.000,  -- 0.000–1.000, relative to max that week
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_start, verse_ref)
);

CREATE INDEX idx_pulse_week ON verse_pulse_cache(week_start DESC, weight DESC);
-- No RLS — service role only
```
