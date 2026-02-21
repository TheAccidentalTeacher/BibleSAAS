# SQL Schema — Bible Study App

## Overview
All Supabase/Postgres schema definitions live here. Each file is a logical grouping of related tables. Run them in order when setting up a new environment.

Row-Level Security (RLS) is enabled on all user-data tables. Every user can only read and write their own rows unless explicitly shared.

## File Index

| File | Tables | Status |
|---|---|---|
| [01-core-auth-profiles.md](01-core-auth-profiles.md) | profiles (+ stripe_customer_id, active_companion_id, theological_fingerprint, study_dna, **onboarding_complete, profile_hash, birthday, deletion_requested_at**), profile_interests, user_life_updates, family_units (**+ accent_color**), family_members | Draft |
| [02-reading-plans.md](02-reading-plans.md) | reading_plans, plan_chapters, user_reading_plans | Draft |
| [03-bible-content.md](03-bible-content.md) | chapters (multi-translation, expires_at, chapter_themes), supported_translations, questions, personalized_content | Draft |
| [04-journal.md](04-journal.md) | journal_entries (+ voice_note fields, is_lament_session, follow_up_at, response_note, responded_at), journal_answers | Draft |
| [05-highlights-bookmarks.md](05-highlights-bookmarks.md) | highlights, bookmarks, messages, verse_thread_messages (+ delivery_date for forward letters), shared_content | Draft |
| [06-progress-gamification.md](06-progress-gamification.md) | streaks (+ prayer_days_streaked, prayer_last_active, current_level, streak_grace fields), achievements (+ category, tier_required, is_hidden), xp_events, user_achievements, memory_verses (+ review_mode, practice_count, added_from, memory_type, catechism_entry_id), memory_verse_reviews, prayer_journal (+ category, linked_verse_text, reminder fields, charles_note, hymn_id), prayer_updates, user_character_cards, skill_tree_nodes, user_skill_tree | Draft |
| [07-source-data.md](07-source-data.md) | tsk_references, tsk_verse_stats, spurgeon_index, catechism_entries (+ lord_day, section, keywords, charles_note, proof_texts), typology_connections (+ charles_note, direction, prominence), bible_dictionary_entries (+ slug, charles_note, passage_refs), commentary_entries (+ section_title, is_vault_featured), hymn_index (+ first_line, tune_name, meter, explicit_refs, thematic_tags), bible_characters, user_library_history, psalm_classifications, book_genre_notes, five_act_map, covenant_map | Draft |
| [08-word-study.md](08-word-study.md) | strongs_lexicon (+ hebrew_root, semantic_domain, occurrence_heatmap, charles_study), morphology_data, word_occurrences, user_word_study_history | Draft |
| [09-geography-archaeology.md](09-geography-archaeology.md) | geographic_locations, passage_locations, archaeological_sites, user_map_discoveries | Draft |
| [10-notifications-settings.md](10-notifications-settings.md) | notification_settings, user_display_settings (+ visual_theme, progress_view_default, default_study_mode, gamification_enabled, show_five_act_widget, catechism_layer_enabled, show_on_this_day), feature_toggles | Draft |
| [11-extensibility.md](11-extensibility.md) | daily_trails, cross_reference_trails, trail_steps, thread_definitions, user_trail_threads, audio_progress, chapter_audio_timestamps, integrations, onboarding_conversations, companion_definitions, user_companions, charles_vault_entries, year_in_review (+ charles_reflection), weekly_charles_letters, chat_sessions, chat_messages, export_jobs, user_stats_cache, verse_interactions, user_covenant_progress, sermon_outlines | Draft |
| [12-community.md](12-community.md) | study_groups, study_group_members, group_verse_threads, group_thread_messages, group_prayer_requests, verse_pulse_cache | Draft |
| [13-operations.md](13-operations.md) | webhook_events (Stripe idempotency), cron_job_runs (background job audit log), seed_checkpoints (resumable seed progress) | Draft |

## Design Principles

- **UUIDs everywhere** for primary keys
- **Soft extensibility** — most tables have a `meta jsonb` column for future fields without migrations
- **Cache invalidation via hash** — personalized_content stores a profile_hash; stale content is regenerated when the profile changes substantially
- **RLS by default** — all user tables locked down; service role used for admin/background jobs only
- **Never delete user data** — use soft deletes (`deleted_at`) on precious data (journal, highlights, prayer journal)
- **Pricing hooks** — personalized_content and word_study are the expensive tables at scale; flag them for tier enforcement

## Adding New Tables

When a new feature requires a new table:
1. Add it to the most logical existing file, OR create a new numbered file
2. Update this README index
3. Update project-notes.md session log
4. Run migration in Supabase dashboard
