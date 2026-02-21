# 10 — Notifications & Settings

Per-user display preferences, notification config, and feature toggles.

---

```sql
-- ============================================================
-- NOTIFICATION SETTINGS
-- ============================================================
CREATE TABLE notification_settings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_daily_reading boolean DEFAULT true,
  email_streak_reminders boolean DEFAULT true,
  email_memory_verse_review boolean DEFAULT true,
  email_prayer_followup boolean DEFAULT false,
  push_enabled        boolean DEFAULT false,
  daily_time          time DEFAULT '07:00',   -- preferred delivery time (user local)
  timezone            text DEFAULT 'America/Chicago',
  frequency           text DEFAULT 'daily'
                        CHECK (frequency IN ('daily', 'weekdays', 'custom')),
  custom_days         integer[],              -- [1,2,3,4,5] = Mon–Fri (0=Sun)  -- Charles nudge: notifies a family member when a verse thread message goes unanswered 7+ days.
  -- Off by default. User is shown this option during onboarding/settings discovery.
  charles_nudge_enabled boolean DEFAULT false,  meta                jsonb DEFAULT '{}'
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification settings" ON notification_settings USING (auth.uid() = user_id);


-- ============================================================
-- USER DISPLAY SETTINGS
-- ============================================================
CREATE TABLE user_display_settings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  theme           text DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'sepia')),
  font_size       text DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),
  -- Bible reading text: user-choosable from 5 options. EB Garamond is default.
  -- Vault treatment always overrides to EB Garamond regardless of this setting.
  bible_reading_font text DEFAULT 'eb_garamond'
                    CHECK (bible_reading_font IN ('eb_garamond', 'lora', 'merriweather', 'literata', 'system_serif')),
  just_read_default boolean DEFAULT false,    -- start sessions in Just Read mode by default
  -- Default reading mode (Session 22: Pray This Passage mode)
  default_study_mode text DEFAULT 'study'
                    CHECK (default_study_mode IN ('study', 'pray', 'listen')),
  show_verse_numbers boolean DEFAULT true,
  show_red_letter boolean DEFAULT true,
  show_cross_refs boolean DEFAULT true,
  translation     text DEFAULT 'ESV',

  -- Translation comparison (Standard+: 2 translations, Premium: up to 4)
  compare_mode_enabled    boolean DEFAULT false,
  comparison_translations text[] DEFAULT '{}',  -- e.g. ['KJV', 'WEB'] alongside primary

  -- Progress Map visual identity (Session 4)
  -- 'runner' | 'home' | 'library' | 'garden' | 'puzzle' | 'default'
  -- Inferred from archetype during onboarding; user can change in settings.
  visual_theme    text DEFAULT 'default',
  -- Which progress view loads by default on the Progress screen
  -- 'phases' | 'fog_map' | 'skill_tree' | 'constellation' | 'stats'
  progress_view_default text DEFAULT 'phases',

  -- Gamification visibility (Session 23)
  -- Prayer Warrior archetype defaults to false; all others default to true
  gamification_enabled  boolean NOT NULL DEFAULT true,

  -- Canonical shape widget (Session 27)
  show_five_act_widget  boolean NOT NULL DEFAULT true,

  -- Catechism layer (Session 30)
  -- Off by default; on by default for prayer_warrior archetype at account creation
  catechism_layer_enabled boolean NOT NULL DEFAULT false,

  -- Session 31: "On This Day" card — surfaces same-date content from prior years
  -- Always minimum 12 months ago. Dismissible per-card.
  show_on_this_day boolean NOT NULL DEFAULT true,

  meta            jsonb DEFAULT '{}'
);

ALTER TABLE user_display_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own display settings" ON user_display_settings USING (auth.uid() = user_id);


-- ============================================================
-- FEATURE TOGGLES (per-user on/off for specific features)
-- Allows gradual rollout and per-tier gating
-- ============================================================
CREATE TABLE feature_toggles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key     text NOT NULL,          -- 'word_study', 'cross_ref_bingo', 'ai_chat', etc.
  enabled         boolean DEFAULT true,
  tier_required   text DEFAULT 'free'
                    CHECK (tier_required IN ('free', 'standard', 'premium', 'your_edition')),
  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, feature_key)
);

ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own toggles" ON feature_toggles USING (auth.uid() = user_id);
```
