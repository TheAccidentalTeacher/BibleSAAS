# 02 — Reading Plans

Plan definitions are shared (not per-user). User progress is per-user.

---

```sql
-- ============================================================
-- READING PLANS (shared definitions)
-- ============================================================
CREATE TABLE reading_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,       -- 'Book by Book', 'Chronological Year', 'Gospels Only', etc.
  type        text NOT NULL,       -- 'sequential', 'chronological', 'topical', 'single_book', 'custom'
  description text,
  book_filter text,                -- null = all books; 'Matthew' = single book plan
  is_default  boolean DEFAULT false,
  is_system   boolean DEFAULT true,  -- false = user-created custom plan
  meta        jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);


-- ============================================================
-- PLAN CHAPTERS (ordered chapter list for each plan)
-- ============================================================
CREATE TABLE plan_chapters (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         uuid NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  day_number      integer NOT NULL,   -- position/order in the plan
  book            text NOT NULL,
  chapter         integer NOT NULL,
  section_label   text,               -- optional: 'The Life of Abraham', 'Holy Week', etc.
  UNIQUE(plan_id, day_number)
);

CREATE INDEX idx_plan_chapters_plan ON plan_chapters(plan_id, day_number);


-- ============================================================
-- USER READING PLANS (which plan a user is on + progress)
-- ============================================================
CREATE TABLE user_reading_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id         uuid NOT NULL REFERENCES reading_plans(id),
  started_at      timestamptz DEFAULT now(),
  current_day     integer DEFAULT 1,
  active          boolean DEFAULT true,
  completed_at    timestamptz,
  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, plan_id)
);

ALTER TABLE user_reading_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own plans" ON user_reading_plans USING (auth.uid() = user_id);
```
