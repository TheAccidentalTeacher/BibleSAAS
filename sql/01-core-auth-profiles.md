# 01 — Core Auth & Profiles

Supabase Auth manages `auth.users`. Everything here hangs off `auth.users.id`.

---

```sql
-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id                      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name            text,
  full_name               text,
  nickname                text,
  email                   text,

  -- Identity / life stage (conversationally inferred, not form-filled)
  age_range               text,        -- 'teen', 'young_adult', 'adult', 'midlife', 'senior', 'elder'
  life_stage              text,        -- 'middle_school', 'high_school', 'college', 'young_professional',
                                       --  'parent_young_kids', 'midlife', 'empty_nester', 'retired', 'unspecified'

  -- Faith posture
  faith_stage             text,        -- 'new', 'growing', 'mature', 'skeptic', 'returning', 'complicated'
  church_background       text,        -- 'none', 'evangelical', 'reformed', 'catholic', 'charismatic', 'other'
  theological_depth       text,        -- 'surface', 'medium', 'deep'

  -- Primary reading goal (changeable any time)
  primary_goal            text,        -- 'devotional', 'deep_study', 'read_through', 'single_book', 'hard_season'
  time_budget_min         integer,     -- 10, 20, 30
  reading_cadence         text,        -- 'daily', 'few_per_week', 'whenever'
  tone_preference         text,        -- 'challenging', 'devotional', 'scholarly', 'conversational' — inferred, dynamic

  -- AI portrait
  -- Two fields: text for prompt injection, JSON for app display and regeneration context.
  -- Regenerated every 5-8 journal entries via background job.
  living_portrait         text,        -- Rendered narrative — injected directly into Claude system prompt as the user briefing
  living_portrait_json    jsonb,       -- Structured portrait sections (see below for shape)
                                       -- {
                                       --   "who": "full narrative — who this person is",
                                       --   "identity_lenses": ["chef", "athlete", "student"],
                                       --   "faith_journey": "where they are spiritually, how they got there",
                                       --   "study_patterns": "what they engage with, what they avoid, patterns in answers",
                                       --   "life_season": "what's hard, what's good right now",
                                       --   "tone_notes": "communication preferences inferred from journal tone",
                                       --   "family_context": "gifted account info, family relationships if relevant",
                                       --   "notable_insights": ["notable things they've said or noticed in study"],
                                       --   "generated_at": "iso timestamp",
                                       --   "journal_entries_at_generation": 0
                                       -- }
  portrait_updated_at     timestamptz,

  -- Gifted account
  gifted_by               uuid REFERENCES profiles(id),
  gifted_message          text,        -- Dad's letter to Tim
  gifted_message_visible  boolean DEFAULT false,
  gifted_reveal_at        date,        -- Optional: reveal on a specific date (birthday)

  -- Subscription / tier (for commercial phase)
  subscription_tier       text DEFAULT 'free',  -- 'free', 'standard', 'premium', 'your_edition'
  subscription_expires_at timestamptz,

  -- Stripe (set at first payment intent; used by backend + webhooks)
  stripe_customer_id      text UNIQUE,
  stripe_subscription_id  text,

  -- Companion (FK constraint added in file 11 after companion_definitions is created)
  active_companion_id     uuid,                    -- which AI companion is active (default = Charles)

  -- AI-computed intelligence (background job, every 5-8 sessions)
  theological_fingerprint jsonb DEFAULT '{}',      -- {traditions:{reformed:0.8,...}, themes:{grace:94,...}}
  study_dna               jsonb DEFAULT '{}',      -- {total_chapters, streak_best, favorite_book, blind_spots,...}
  fingerprint_updated_at  timestamptz,

  -- Onboarding lifecycle
  onboarding_complete     boolean DEFAULT false,   -- Phase 2: set true on final onboarding step; gates main app routing

  -- Cache invalidation
  -- Recomputed (SHA-256 short hash) whenever key personalization columns change.
  -- Stored here so Phase 4 background job can compare profiles.profile_hash
  -- to personalized_content.profile_hash without a full profile re-read.
  profile_hash            text,                    -- NULL until first portrait generation

  -- Birthday (for Phase 16 birthday letter cron + Phase 23 year-in-review personalization)
  birthday                date,                    -- user-provided; optional; no COPPA check needed (18+ product)

  -- Account deletion (GDPR / user-initiated; Phase 21)
  -- Backend cron job permanently deletes the row 30 days after this is set.
  deletion_requested_at   timestamptz,             -- NULL = active account

  -- Extensibility
  meta                    jsonb DEFAULT '{}',

  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);


-- ============================================================
-- PROFILE INTERESTS
-- ============================================================
CREATE TABLE profile_interests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest    text NOT NULL,   -- 'cooking', 'athletics', 'medicine', 'law', 'parenting',
                               --  'music', 'visual_art', 'history', 'science', 'outdoors',
                               --  'business', 'teaching', 'military', 'farming', 'engineering'
  freeform    boolean DEFAULT false,   -- true if user typed it themselves
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE profile_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interests" ON profile_interests USING (auth.uid() = user_id);


-- ============================================================
-- USER LIFE UPDATES (opt-in context; not auto-prompted)
-- ============================================================
CREATE TABLE user_life_updates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE user_life_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own updates" ON user_life_updates USING (auth.uid() = user_id);


-- ============================================================
-- FAMILY UNITS
-- ============================================================
CREATE TABLE family_units (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_by  uuid NOT NULL REFERENCES profiles(id),
  -- Verse thread color tinting: each family gets a unique accent color.
  -- Used by Phase 14 (Family Verse Threads) to visually distinguish family
  -- contributions. Defaults to warm slate; admin can change in family settings.
  accent_color text NOT NULL DEFAULT '#7C6B5A',  -- hex color string
  created_at  timestamptz DEFAULT now()
);


-- ============================================================
-- FAMILY MEMBERS
-- ============================================================
CREATE TABLE family_members (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_unit_id      uuid NOT NULL REFERENCES family_units(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role                text DEFAULT 'member',  -- 'admin', 'member'
  share_progress      boolean DEFAULT false,
  share_highlights    boolean DEFAULT false,
  -- Read receipts: visible to other family members by default.
  -- User can disable in settings for privacy (teenagers).
  read_receipts_visible boolean DEFAULT true,
  joined_at           timestamptz DEFAULT now(),
  UNIQUE(family_unit_id, user_id)
);
```
