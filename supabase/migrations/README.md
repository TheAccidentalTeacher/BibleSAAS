# Supabase Migrations

Executable `.sql` migration files for the BibleSaaS database schema.

---

## Migration naming convention

```
YYYYMMDDHHMMSS_description.sql
```

Example: `20260101000001_core_auth_profiles.sql`

---

## How migrations relate to `docs/sql/`

The `docs/sql/` directory contains **human-readable schema documentation** — markdown files explaining each table's purpose, design decisions, and column rationale.

The files in this directory are the **executable extracts** — plain SQL with no markdown, ready to run against a Supabase Postgres instance.

To extract migrations from the documentation files, run:

```bash
npx ts-node scripts/extract-migrations.ts
```

This regenerates all `.sql` files from the `.md` sources. The `.md` files are the source of truth; the `.sql` files are generated artifacts.

---

## Running migrations

### Via Supabase CLI (recommended for local dev)

```bash
supabase db push
```

### Via Supabase dashboard (manual)

Run each file in order via **SQL Editor**. Files must be executed in numerical order — migration 002 depends on tables created in migration 001.

### Execution order

| File | Creates |
|---|---|
| `..._001_core_auth_profiles.sql` | profiles, profile_interests, user_life_updates, family_units, family_members |
| `..._002_reading_plans.sql` | reading_plans, plan_chapters, user_reading_plans |
| `..._003_bible_content.sql` | chapters, supported_translations, questions, personalized_content |
| `..._004_journal.sql` | journal_entries, journal_answers |
| `..._005_highlights_bookmarks.sql` | highlights, bookmarks, messages, verse_thread_messages, shared_content |
| `..._006_progress_gamification.sql` | streaks, achievements, xp_events, user_achievements, memory_verses, memory_verse_reviews, prayer_journal, prayer_updates, user_character_cards, skill_tree_nodes, user_skill_tree |
| `..._007_source_data.sql` | tsk_references, tsk_verse_stats, spurgeon_index, catechism_entries, typology_connections, bible_dictionary_entries, commentary_entries, hymn_index, bible_characters, user_library_history, psalm_classifications, book_genre_notes, five_act_map, covenant_map |
| `..._008_word_study.sql` | strongs_lexicon, morphology_data, word_occurrences, user_word_study_history |
| `..._009_geography_archaeology.sql` | geographic_locations, passage_locations, archaeological_sites, user_map_discoveries |
| `..._010_notifications_settings.sql` | notification_settings, user_display_settings, feature_toggles |
| `..._011_extensibility.sql` | daily_trails, cross_reference_trails, trail_steps, thread_definitions, user_trail_threads, audio_progress, chapter_audio_timestamps, integrations, onboarding_conversations, companion_definitions, user_companions, charles_vault_entries, year_in_review, weekly_charles_letters, chat_sessions, chat_messages, export_jobs, user_stats_cache, verse_interactions, user_covenant_progress, sermon_outlines |
| `..._012_community.sql` | study_groups, study_group_members, group_verse_threads, group_thread_messages, group_prayer_requests, verse_pulse_cache |
| `..._013_operations.sql` | webhook_events, cron_job_runs, seed_checkpoints |

---

## Verifying migrations

After running migrations, verify RLS is enabled on all user tables:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All user-data tables must show `rowsecurity = true`.
