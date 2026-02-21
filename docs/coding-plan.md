# Bible Study App — Coding Plan
## Phase-by-Phase, Step-by-Step Implementation Guide

> **For use by:** Claude Sonnet 4.6 / Claude Opus 4  
> **Reference files:** `docs/project-notes.md` (all 31 sessions), `docs/charles-persona.md`, `sql/` (13 schema files + README)  
> **Stack:** Next.js 14 App Router · Supabase · Vercel · Anthropic API · Resend · Stripe · Tailwind CSS

---

## HOW TO USE THIS PLAN

Each Phase is a **self-contained coding session**. Hand the agent this file + the referenced source files. Every Phase ends with a working, testable state. Never skip a Phase — each one is a dependency for what follows.

**Reading the spec:** Before coding any Phase, read:
1. This plan (Phase overview + all steps)
2. The relevant sessions in `project-notes.md`
3. The relevant `sql/` files for that Phase's tables

---

## PHASE 0 — Foundation & Infrastructure
*Sessions referenced: Session 2 (schema), Session 11 (design tokens), Session 12 (legal/env)*  
*Produces: A running Next.js app connected to Supabase with all tables migrated and seed data loaded.*

### Step 0.1 — Next.js Project Initialization
- `npx create-next-app@latest bible-study-app --typescript --tailwind --app --src-dir --import-alias "@/*"`
- Install core dependencies:
  ```
  @supabase/supabase-js @supabase/auth-helpers-nextjs
  @anthropic-ai/sdk
  resend
  @stripe/stripe-js stripe
  next-pwa
  dexie
  d3
  phosphor-react
  lucide-react (fallback icons)
  ```
- Configure `next.config.js`: PWA settings, image domains, env vars
- Set up `.env.local` with all required keys:
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ANTHROPIC_API_KEY
  RESEND_API_KEY
  STRIPE_SECRET_KEY
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  STRIPE_WEBHOOK_SECRET
  ESV_API_KEY
  API_BIBLE_KEY
  ```
- `.gitignore` must include `.env.local` — verify before first commit

### Step 0.2 — Design Token System
*Reference: Session 11 (Typography, Theming & Design Language)*
- Install fonts via `next/font`:
  - `EB Garamond` (Google Fonts)
  - `Inter` (Google Fonts, variable)
  - `Barlow Condensed` weight 700 (Google Fonts)
  - `Roboto Mono` weight 400 (for Strong's numbers / TSK refs)
- Create `src/styles/tokens.css` with all CSS custom properties:
  - All color tokens for default dark theme
  - All color tokens for light mode overlay
  - All 6 identity themes (runner, home, library, garden, puzzle, default)
  - Vault treatment colors (parchment system, separate namespace)
  - Type scale variables
  - Spacing/shape variables
- Configure Tailwind to read from CSS custom properties
- Apply `data-theme="default"` to `<html>` in root layout
- Vault treatment class: `.vault-card` — add to global CSS

### Step 0.3 — Supabase Project Setup
- Create Supabase project (or use existing)
- Run SQL migrations **in order** via Supabase SQL editor:
  1. `sql/01-core-auth-profiles.md`
  2. `sql/02-reading-plans.md`
  3. `sql/03-bible-content.md`
  4. `sql/04-journal.md`
  5. `sql/05-highlights-bookmarks.md`
  6. `sql/06-progress-gamification.md`
  7. `sql/07-source-data.md`
  8. `sql/08-word-study.md`
  9. `sql/09-geography-archaeology.md`
  10. `sql/10-notifications-settings.md`
  11. `sql/11-extensibility.md`
  12. `sql/12-community.md`
- Enable RLS on all user tables (already included in schema files, verify)
- Configure Supabase Auth: enable Email (magic link + password)
- Create Storage buckets: `exports` (private), `audio` (private), `avatars` (public)

### Step 0.4 — Supabase Client Setup
- Create `src/lib/supabase/client.ts` — browser client
- Create `src/lib/supabase/server.ts` — server client (cookies-based for App Router)
- Create `src/lib/supabase/middleware.ts` — session refresh middleware
- Configure `middleware.ts` at project root: refresh session on every request, protect `/dashboard` and all authenticated routes
- TypeScript types: run `supabase gen types typescript` → output to `src/types/database.ts`

### Step 0.5 — Bible Data: Seed Public Domain Translations
*Reference: Session 14 (Translations), `sql/03-bible-content.md`*
- Write a one-time seed script `scripts/seed-translations.ts`:
  - Download WEB (World English Bible) structured JSON from `ebible.org`
  - Download KJV structured JSON (Project Gutenberg cleaned source)
  - Insert into `chapters` table: `(book, chapter, translation='WEB', text_json, expires_at=NULL)`
  - Insert `supported_translations` rows for all Day-1 translations
- Also seed: `ASV`, `YLT` public domain texts if available in clean JSON format
- Seed `reading_plans` with standard plans:
  - "Read Through the Bible in a Year" (365 days, canonical order)
  - "New Testament in 90 Days"
  - "Psalms & Proverbs in a Month"
  - "Heidelberg Catechism — 52 Lord's Days" (special plan type)

### Step 0.6 — Public Domain Source Data Seed Scripts
*Reference: Sessions 5, 6, 7, 13, 15, 30 — all the reference content*  
Each is a separate script, run once at deploy time:

- `scripts/seed-tsk.ts` — Import Treasury of Scripture Knowledge (~500K cross-reference pairs into `tsk_references`; pre-compute `tsk_verse_stats`)
- `scripts/seed-strongs.ts` — Import Strong's Hebrew (H) + Greek (G) lexicon into `strongs_lexicon` (strong's number, original word, short_def, long_def, POS, KJV usage)
- `scripts/seed-morphology.ts` — Import MorphGNT + OpenScriptures Hebrew morphology into `morphology_data` and `word_occurrences` (attribution required per CC license)
- `scripts/seed-spurgeon.ts` — Import Spurgeon's Morning & Evening into `spurgeon_index` keyed by (book, chapter, slot='morning'|'evening'); import Treasury of David for Psalms
- `scripts/seed-commentaries.ts` — Import Matthew Henry, Calvin, Adam Clarke into `commentary_entries` keyed by (source, book, chapter, verse_start, verse_end)
- `scripts/seed-dictionary.ts` — Import Easton's, Smith's, ISBE into `bible_dictionary_entries` with slug normalization
- `scripts/seed-catechism.ts` — Import Westminster Shorter (107 Q), Westminster Larger (196 Q), Heidelberg (129 Q/52 Lord's Days) into `catechism_entries` with proof_texts jsonb
- `scripts/seed-hymns.ts` — Import public domain hymn index (pre-1927) into `hymn_index`
- `scripts/seed-characters.ts` — Import Bible character data + rarity tiers into `bible_characters`
- `scripts/seed-geography.ts` — Import geographic locations + passage locations into `geographic_locations`, `passage_locations`
- `scripts/seed-plan-chapters.ts` — Populate `plan_chapters` for all seeded reading plans

### Step 0.7 — Shared Utility Layer
- `src/lib/bible.ts` — Book name ↔ USFM code mappings, chapter counts per book, canonical book order
- `src/lib/api-clients.ts` — ESV API fetch wrapper, API.Bible fetch wrapper (with TTL cache logic)
- `src/types/app.ts` — Shared TypeScript interfaces (UserProfile, Chapter, JournalEntry, etc.)
- `src/lib/tier.ts` — Tier checking utilities (`canAccess(feature, tier)`, tier enum)

**Phase 0 complete when:** `npm run dev` produces a page, Supabase is connected, all migrations are applied, WEB/KJV translations are in the DB, and `npx ts-node scripts/seed-tsk.ts` runs without error.

---

## PHASE 1 — Authentication & User Profiles
*Sessions referenced: Session 1 (Profile Schema), Session 2 (Supabase Auth), Session 9 (Tier fields)*  
*Produces: Working signup/login/logout + profile creation.*

### Step 1.1 — Auth Pages
- `/auth/login` — Email field + "Send magic link" button; password option behind toggle
- `/auth/signup` — Email + password + age confirmation (must be 13+, COPPA compliance)
- `/auth/callback` — Magic link handler (Supabase OAuth callback route)
- `/auth/verify` — "Check your email" confirmation screen
- Age gate: if birth year entered < 13 years ago from today → block with clear message

### Step 1.2 — Profile Auto-Creation on Signup
- Supabase Auth trigger (database function + trigger) OR server-side in `/auth/callback`:
  - On new `auth.users` row → INSERT into `profiles` with defaults
  - Set `subscription_tier = 'free'`
  - Set `active_companion_id = NULL` (Charles is default, no FK needed for default)
- Create `user_display_settings` row with defaults on profile creation
- Create `notification_settings` row with defaults on profile creation

### Step 1.3 — Auth Middleware & Route Protection
- All routes under `/dashboard/**`, `/read/**`, `/journey/**`, `/trails/**`, `/library/**`, `/profile/**` require auth
- Unauthenticated users redirect to `/auth/login`
- Authenticated users hitting `/` redirect to `/dashboard`
- Middleware reads Supabase session from cookies (server-side, App Router pattern)

### Step 1.4 — Profile Page (Basic)
- `/profile` route with basic info: name, email, tier badge, joined date
- Edit display name
- "Sign out" button

**Phase 1 complete when:** User can sign up, receive a magic link, click it, land on `/dashboard` (empty for now), and sign out.

---

## PHASE 2 — Conversational Onboarding
*Sessions referenced: Session 1 (onboarding spec, gifted accounts)*  
*Produces: Charles-led onboarding that builds the user profile from conversation.*

### Step 2.1 — Onboarding Route & Flow
- `/onboarding` — Full-screen chat UI, no nav bar
- Check: `profiles.onboarding_complete = false` → redirect here after login for new users
- Once complete: `onboarding_complete = true`, redirect to `/dashboard`
- Gifted account detection: `profiles.gifted_by IS NOT NULL AND onboarding_complete = false` → special greeting ("Your dad set this up for you...")

### Step 2.2 — Onboarding Chat API
- `POST /api/onboarding/chat` — streaming endpoint
- System prompt: Charles persona (from `charles-persona.md`) + extraction instructions
- Charles's opening line: "Before we get started — tell me a little about yourself. I want to make sure this Bible feels like yours."
- Conversation continues until Charles has enough context (he decides, not a step counter)
- Charles's closing: "Alright — I think I've got a good sense of you. Let's get started."

### Step 2.3 — Profile Extraction
- After onboarding conversation ends, fire a second API call:
  - Input: full onboarding transcript
  - System: "Extract user profile as JSON: `{display_name, age_range, vocation, interests[], faith_stage, tone_preference, goals[], default_reading_mode, archetype_hint}`"
  - Store result in `profiles` columns + `profile_interests` rows
- Set archetype-appropriate defaults in `user_display_settings`:
  - Prayer warrior → `gamification_enabled = false`, `catechism_layer_enabled = true`
  - Scholar → `spurgeon_layer = true`, `catechism_layer_enabled = true`
  - Tim/runner → `visual_theme = 'runner'`
  - New believer → `default_study_mode = 'study'`, scaffolding flags on
- Store transcript in `onboarding_conversations` table

### Step 2.4 — Gifted Account Setup Flow
- Separate route `/gift/setup/[token]` for gift givers
- Form: "Tell me about the person you're giving this to" (freeform, no word limit)
- Optional: "Write a birthday letter" (stored in `messages` with `delivery_date`)
- On submit: creates recipient `profiles` row with `gifted_by`, seeds profile from gift-giver description

**Phase 2 complete when:** A new user completes onboarding, their profile is populated with name/interests/faith stage, visual theme defaults are applied, and they land on `/dashboard`.

---

## PHASE 3 — Core Bible Reading Screen
*Sessions referenced: Session 10 (UX Flow), Session 11 (Typography), Session 14 (Translations)*  
*Produces: Working Bible reading screen with text, verse display, translation switching.*

### Step 3.1 — Bible Text API Layer
- `src/lib/bible/esv.ts` — ESV API fetch (`api.esv.org/v3/passage/text/`):
  - Returns verse-by-verse JSON
  - Caches result in `chapters` table with `expires_at = now() + interval '24 hours'`
  - Checks cache before fetching (serve from DB if not expired)
  - Includes ESV copyright attribution in response
- `src/lib/bible/local.ts` — WEB/KJV/ASV/YLT: simple DB lookup (no expiry)
- `src/lib/bible/api-bible.ts` — API.Bible for NIV/NASB/NLT/CSB (Standard tier+, 1h TTL)
- `src/lib/bible/index.ts` — Unified `getChapter(book, chapter, translation)` that routes to correct source

### Step 3.2 — Reading Screen Layout (`/read/[book]/[chapter]`)
- Top bar: `[Book] [Chapter]` title + chapter nav arrows + bookmark icon + share icon
- Translation pill (shows current translation abbreviation, tap to switch)
- "Just Read / Study" mode toggle (stored in session, defaults from `user_display_settings`)
- Chapter text rendering:
  - Map over verse array
  - Verse number in right-aligned gutter (28px)
  - Left gutter 40px (reserved for annotations, flame icons later)
  - Paragraph breaks from ESV API `p` markers
  - Chapter drop number: Barlow Condensed 700, 64px, ghosted behind first verse
- ESV attribution footer (required on every page showing ESV text)

### Step 3.3 — Translation Picker Sheet
- Bottom sheet with translation groups: FREE / STANDARD (locked icon for free users)
- Selecting translation: calls `getChapter` with new translation, re-renders
- Persists selection to `user_display_settings.translation`
- "Compare translations" CTA at bottom (multi-translation compare view has no dedicated phase in this plan — post-launch enhancement; placeholder CTA only for now)

### Step 3.4 — Verse-Level Actions (Long Press / Tap Menu)
- Long-press any word → Word Note popover (Phase 12 — placeholder)
- Tap verse number → action menu:
  - "Highlight" — opens color picker (Phase 5)
  - "Bookmark" — adds bookmark (Phase 5)
  - "Copy" — copies verse text + reference to clipboard
  - "Share" — (Phase 11)
  - "Start thread" — (Phase 11)
  - "Memorize" — (Phase 9)
- Use a `useVerseSelection` hook to track selected verse

### Step 3.5 — Chapter Navigation
- Previous/next chapter arrows in top bar
- Navigate within same book; at book start/end, prompt to jump to next/prev book
- Deep-link support: `/read/[book]/[chapter]?verse=[v]` scrolls to and highlights target verse
- `useParams` + `useSearchParams` in App Router

### Step 3.6 — Reading Progress Tracking
- On chapter scroll completion (>80% visible): fire `markChapterRead(book, chapter)`
- Updates `user_reading_plans.current_day` if chapter is in active plan
- Inserts/updates `journal_entries` row (with `studied_at` timestamp)
- Does NOT trigger AI generation (that's Phase 4) — just the completion event

**Phase 3 complete when:** User can navigate to `/read/Genesis/1`, read the chapter in WEB or ESV, switch translations, tap a verse number to see the action menu (with non-functional placeholders), and mark the chapter as read.

---

## PHASE 4 — Charles AI Layer & OIA Study System
*Sessions referenced: Session 3 (AI Prompt Architecture), Session 6 (Commentary Layers), Session 17 (Chat)*  
*Produces: AI-generated questions, Charles commentary card, and answer submission with Charles response.*

### Step 4.1 — Charles Persona System Prompt Builder
- `src/lib/charles/prompt.ts`:
  - `buildSystemPrompt(profile, companion?)` → assembles the 3-layer system prompt:
    - Layer 1: Static Charles persona (from `charles-persona.md`, condensed to ~400 tokens)
    - Layer 2: Living portrait block (from `profiles.living_portrait` if exists; fallback: template from profile fields)
    - Layer 3: Counselor guardrail (locked language from Session 3)
  - `buildContentContext(book, chapter, chapterText, tskRefs?, spurgeon?)` → passage context block

### Step 4.2 — Content Generation API
- `POST /api/content/generate` — generates personalized content for (user × chapter)
- Input: `{userId, book, chapter}`
- Logic:
  1. Check `personalized_content` table for existing row matching `profile_hash`
  2. If exists and profile_hash matches current `profiles.profile_hash` → return cached
  3. If stale or missing → call Anthropic API:
     - Model: `claude-sonnet-4-6` (Tim/Your Edition) or `claude-haiku-4` (Standard)
     - System: `buildSystemPrompt(profile)` + `buildContentContext(book, chapter, text, tskRefs, spurgeon)`
     - Prompt: "Generate the study content for this chapter per the JSON contract"
     - Expected JSON: `{intro, connections[], questions[{oia_type, text, answer_prompt}], closing, word_note}`
  4. Insert/update `personalized_content` row with generated JSON + current `profile_hash`
  5. Return content
- Question distribution: 3 Observe → 1 Interpret → 1 Apply (enforce in prompt)

### Step 4.3 — Charles Floating Card
- Renders on reading screen, 2-second delay after chapter loads
- Dismissible (X button); re-summonable via floating Charles avatar button (bottom-right)
- Free tier: serves `charles_vault_entries` (parchment Vault treatment, instant render)
  - Vault card visual: `#F5ECD7` background, `#3D2B1F` text, "FROM THE VAULT" badge, wax-seal SVG
- Paid tiers: live generated intro from `personalized_content.content_json.intro`
- Loading state: shimmer skeleton (NOT a spinner — only show if generation takes >500ms)
- Charles connections chips: `content_json.connections[]` rendered as swipeable cards below intro

### Step 4.4 — OIA Study Session (Sheet)
- Triggered by "Study this chapter" CTA at end of chapter / in top bar
- Full-screen bottom sheet (swipe-to-dismiss)
- Shows 5 questions in order: 3 Observe → 1 Interpret → 1 Apply
- Each question: `text` + `answer_prompt` hint (smaller text below)
- Answer fields: `<textarea>` per question, min-height 80px, auto-expanding
  - One question at a time (accordion expand model) OR all shown at once (scrollable)
  - Decision: all shown at once (less friction, matches the "go at your own pace" principle)
- Submit button: active only when at least 1 answer has content
- On submit: `POST /api/journal/submit` with answers array

### Step 4.5 — Answer Submission & Charles Response
- `POST /api/journal/submit`:
  1. Insert `journal_entries` row (updates existing if re-study)
  2. Insert `journal_answers` rows for each question/answer pair
  3. For each answer with content: call Anthropic API for Charles's response
     - Model: `claude-sonnet-4-6`
     - System: same 3-layer prompt + passage context
     - User message: `[Question]: [answer text]`
     - Expected: 2-6 sentences. Length mirrors user's answer depth.
  4. Update `journal_answers.charles_response` with each response
  5. Return all responses
- UI: responses animate in one by one after submit
- After all responses: streak update animation + possible character card unlock (Phase 7)

### Step 4.6 — Spurgeon Card Integration
- Query `spurgeon_index` for `(book, chapter)` — returns morning + evening entries
- Morning card: rendered at TOP of chapter view (before verse 1), collapsed by default
- Evening card: rendered at BOTTOM of chapter view (after final verse), collapsed by default
- Visual: warm amber border, Spurgeon name attribution, "Morning Reading" / "Evening Reading" label
- Source attribution required: "C.H. Spurgeon, Morning & Evening (1865)"

### Step 4.7 — Archaeological Note
- Query `archaeological_sites` for any site connected to `passage_locations` matching (book, chapter)
- If found: render a brief inline note between Charles card and verse 1
- Always shown (no toggle), always 1-2 sentences max
- Pulls `description` from `archaeological_sites`, formatted as a pullout quote

**Phase 4 complete when:** A logged-in user reads a chapter, sees a Charles card appear (Vault for free, live-generated for paid), taps "Study", completes OIA questions, submits, and receives Charles's responses to their answers. Spurgeon cards render above and below the chapter.

---

## PHASE 5 — Highlights, Bookmarks & Annotations
*Sessions referenced: Session 7 (Sharing), reading screen spec*  
*Produces: Full highlighting system with 6 colors + inline annotations.*

### Step 5.1 — Text Selection & Highlight UI
- `useTextSelection` hook: detects text selection on verse elements, returns `{startVerse, endVerse, selectedText}`
- On selection detected: floating action bubble appears above selection with "Highlight" + color swatches
- 6 colors: yellow `#F5C842`, green `#5DBB63`, blue `#5B9BD5`, pink `#E86B8A`, orange `#F0954A`, purple `#9B72CF`
- Tapping a color: highlights selected verses with background tint, saves to `highlights` table:
  `{user_id, book, chapter, verse_start, verse_end, color, annotation: null}`

### Step 5.2 — Highlight Persistence & Rendering
- On chapter load: query `highlights` for `(user_id, book, chapter)` → apply color backgrounds to matched verses
- Highlights stored as verse-level (not character offset) for simplicity and resilience
- Tap an existing highlight: shows edit menu — "Edit note", "Change color", "Remove"
- Highlight note: annotation field, max 500 chars, saves to `highlights.annotation`
- Note indicator: small speech-bubble icon overlaid on highlighted verse when annotation exists

### Step 5.3 — Bookmark System
- "Bookmark" in verse action menu → inserts into `bookmarks` table
- Bookmark indicator: small ribbon icon in verse gutter
- `/profile/bookmarks` list (basic list now; detailed filtering can be deferred)
- "Bookmarked" state toggle: tap again to remove

**Phase 5 complete when:** User can select text, choose a highlight color, see the highlight persist on reload, tap a highlight to add a note, and bookmark individual verses.

---

## PHASE 6 — Dashboard & Reading Plans
*Sessions referenced: Session 10 (Dashboard spec), Session 4 (reading plans concept)*  
*Produces: Working dashboard with reading plan progress, resume card, and streak display.*

### Step 6.1 — Dashboard Layout (`/dashboard`)
- 5-tab bottom navigation: Read / Journey / Trails / Library / Profile
  - Icons: Phosphor Icons (Book, Map, GitFork, Library, User)
  - Active tab indicator: accent color dot above icon
- Quick-resume card (top): book cover art (Criterion-style SVG from Phase 14) + last chapter + progress bar
  - "Continue reading: [Book] [Chapter]" → `/read/[book]/[chapter]`
- Streak counter widget: flame icon + current streak number + longest streak
- Daily trail pair cards: Morning trail + Evening trail (Phase 13 — placeholder cards for now)

### Step 6.2 — Reading Plan Selection
- `/dashboard` → "Choose a plan" CTA when no active plan
- Plan picker: list of `reading_plans`, each with name, description, duration
- On select: creates `user_reading_plans` row with `start_date = today`, `status = 'active'`
- Plan progress bar: `completed_days / total_days`

### Step 6.3 — Today's Reading
- Query `plan_chapters` for today's plan chapters
- "Today's reading" card on dashboard: lists today's chapters
- Tapping → navigates to `/read/[book]/[chapter]`
- Completed chapters get checkmarks on the card

### Step 6.4 — Journal History Quick Access
- Recent journal entries strip (last 3, horizontal scroll)
- Each card: book + chapter + date + first line of journal note
- "See all" → `/profile/journal`

**Phase 6 complete when:** Dashboard shows the reading plan progress, active streak, and today's chapters. User can select a plan, read chapters, and see them marked complete.

---

## PHASE 7 — Streaks, XP & Gamification
*Sessions referenced: Session 23 (Gamification), Session 6 (progress system)*  
*Produces: Streak tracking, XP events, achievement system.*

### Step 7.1 — Streak Engine
- `src/lib/streaks.ts`:
  - `recordStudyActivity(userId, activityType)` → updates `streaks` table
  - Logic: if `last_active = yesterday` → increment `current_streak`; if today → no change; if gap > 1 day → reset to 1
  - Grace period: if `streak_grace_used = false` and gap is exactly 1 missed day → apply grace, set `streak_grace_used = true`
  - Reset grace after next consecutive day
  - Prayer activity separately tracked: `prayer_days_streaked`, `prayer_last_active`
- Streak display: animated flame icon (Lottie/CSS) + number

### Step 7.2 — XP Events
- `src/lib/xp.ts`: `awardXP(userId, eventType, amount)` → inserts `xp_events` row
- XP event types and amounts (seed `achievements` table):
  - `chapter_read`: 10 XP
  - `journal_answer`: 5 XP per answer (up to 25 XP/session)
  - `streak_day`: 5 XP
  - `streak_7`: 50 XP bonus
  - `streak_30`: 200 XP bonus
  - `highlight_added`: 2 XP
  - `memory_verse_reviewed`: 5 XP
  - `memory_verse_mastered`: 50 XP
  - `prayer_entry`: 10 XP
  - `chapter_audio_complete`: 8 XP
- Total XP computed via aggregate (or maintain `profiles.total_xp` denormalized)

### Step 7.3 — Level System
- Levels by cumulative XP (stored as `streaks.current_level`):
  - Level 1: 0 XP (Seeker)
  - Level 2: 100 XP (Reader)
  - Level 3: 300 XP (Student)
  - Level 4: 600 XP (Disciple)
  - Level 5: 1,000 XP (Faithful)
  - Level 6: 2,000 XP (Scholar)
  - Level 7: 4,000 XP (Sage)
  - Level 8: 8,000 XP (Witness)
- Level up: celebration animation + Charles line

### Step 7.4 — Achievement System
- Achievements defined in `achievements` table (seeded at deploy):
  - "First Chapter" (read chapter 1)
  - "Week in the Word" (7-day streak)
  - "Month of Faithfulness" (30-day streak)
  - "TSK Traveler" (first trail completed)
  - "Memory Keeper" (first verse memorized)
  - "First Answer" (first OIA answer submitted)
  - "Gospel Reader" (finished all 4 Gospels)
  - "Psalm Singer" (finished all 150 Psalms)
  - [30+ more achievements seeded]
- `user_achievements` table: unlock on achievement trigger
- Achievement unlock UI: card reveal animation (rarity shimmer by tier)
- Hidden achievements (`is_hidden = true`): shown as "???" until unlocked

### Step 7.5 — Gamification Visibility Toggle
- `user_display_settings.gamification_enabled` — toggled in settings
- When `false`: hide streak counter on dashboard, hide XP bar, suppress achievement popups
- Still track internally — user can re-enable and see their data
- Prayer warrior archetype: defaults to `false` (set during onboarding extraction)

**Phase 7 complete when:** Chapters read increment streak, award XP, and trigger achievement unlocks. The dashboard shows streak + level. Gamification can be turned off entirely.

---

## PHASE 8 — Journal & Prayer Journal
*Sessions referenced: Session 19 (Prayer Journal), Session 26 (Lament Mode)*  
*Produces: Full journal history, prayer journal, and lament mode.*

### Step 8.1 — Journal History Screen (`/profile/journal`)
- List of all `journal_entries`, sorted by `studied_at DESC`
- Each entry: book + chapter + date + first line of note
- Search: full-text search on `journal_entries.note` + `journal_answers.answer_text`
- Filter by: book, date range, has-note, has-highlights
- Tap entry → full journal session view

### Step 8.2 — Journal Session View
- Shows: chapter header + study date
- Charles intro card (from `personalized_content.content_json.intro`)
- OIA questions + user's answers + Charles's responses (indented, italic)
- Free-form note section (editable inline — updates `journal_entries.note`)
- "Response to younger self" section (Phase 23 — defer)
- Highlights from this chapter displayed below

### Step 8.3 — Prayer Journal (`/profile/prayer` or integrated in Profile tab)
- "New prayer entry" CTA
- Entry form:
  - `body`: the prayer/request text
  - `category`: praise / petition / thanksgiving / lament / intercession
  - `linked_verse_text`: optional, link to a specific verse
  - `reminder_at`: optional date/time reminder
- `charles_note`: auto-generated brief response from Charles (short, < 100 tokens, Haiku model)
- List view: sorted by `created_at DESC`, filterable by category + answered/unanswered
- "Mark answered" button: sets `is_answered = true`, `answered_at = now()`
- Answered prayers section: separated by divider, celebrating faithfulness

### Step 8.4 — Lament Mode
*Reference: Session 26*
- Entry point: "This is a hard day" option in prayer journal category selector
- OR: Charles detects lament language in journal entry → gentle nudge offered
- Lament session: sets `journal_entries.is_lament_session = true`
- UI shift: darker, quieter, more spacious. No streak reminders. No gamification.
- Charles response register shifts: more pastoral, less exuberant, sits with the dark
- `follow_up_at` set to `now() + interval '24 hours'`: Charles follows up the next day
  - Follow-up: gentle notification + Charles checking in
- Lament mode does NOT suppress streaks (studying in grief is still study)

**Phase 8 complete when:** User can view full journal history, write/edit prayer journal entries, mark prayers answered, and enter lament mode which shifts Charles's register.

---

## PHASE 9 — Memory Verse System
*Sessions referenced: Session 16 (Memory Verse), Session 30 (Catechism — memory_type extension)*  
*Produces: Full SM-2 spaced repetition memory system with 3 review modes.*

### Step 9.1 — Add to Memory Flow
- Verse action menu: "Memorize" → save-confirm bottom sheet
- Sheet shows: verse text, review mode selector (All / Flashcard / Fill in Blank / Word Order)
- Saves to `memory_verses`: `{user_id, book, chapter, verse, verse_text, translation, review_mode}`
- SM-2 defaults: `ease_factor=2.5, interval_days=1, repetitions=0, next_review=today`

### Step 9.2 — Daily Review Queue
- Dashboard card: "X verses due today" (when `next_review <= today`)
- `/profile/memory-verses` management screen:
  - "Due Today" section (sorted by overdue first)
  - "All Verses" list with intervals shown in human-readable form
  - "Mastered" section (crown icon)

### Step 9.3 — Review Session UI
- Full-screen review mode, no nav bar
- Progress: "3 of 7 remaining" at top
- **Flashcard mode:** Front (reference), back (verse text + 3 buttons)
- **Fill in Blank mode:** Verse with blanks, keyboard input, correct/incorrect animations
- **Word Order mode:** Shuffled word chips, drag-to-slot interface
- Mode rotation per `all` logic (Sessions 16 spec)
- Rating buttons: Hard / Got It / Nailed It → maps to SM-2 quality 2/4/5
- On rate: `POST /api/memory/review` → recalculates SM-2, updates `memory_verses`, inserts `memory_verse_reviews`

### Step 9.4 — Mastery Celebration
- On `mastered = true`: animation + single Charles line (Vault entry for this verse)
- Gold crown icon in verse list
- XP award: 50 XP via `awardXP`

### Step 9.5 — Memory Verse Sidebar Indicator
- On reading screen, check if any `memory_verses` rows exist for verses in current chapter
- Show gold star in verse margin if memorized; "Due for review" badge if `next_review <= today`

**Phase 9 complete when:** User can add a verse to memory, complete a daily review session in all 3 modes, see SM-2 intervals updating, and reach mastery with celebration.

---

## PHASE 10 — Audio Layer
*Sessions referenced: Session 8 (Audio Layer)*  
*Produces: Full-featured audio Bible player with verse sync and persistent mini player.*

### Step 10.1 — Audio Fetch & Cache
- `src/lib/audio.ts`:
  - `getChapterAudio(book, chapter)` → checks Supabase Storage first; fetches from ESV Audio API if not cached; stores in Storage `audio/[book]/[chapter].mp3`
  - Returns signed URL for private Storage access
- `chapter_audio_timestamps` population:
  - One-time script `scripts/align-audio.ts` using forced alignment (aeneas or gentle) → outputs `{verse, start_seconds}` array per chapter
  - Store in `chapter_audio_timestamps` table

### Step 10.2 — Audio Player State (`useAudioPlayer` hook)
- Manages: `isPlaying`, `currentTime`, `duration`, `speed`, `currentVerse`, `readAlong`
- Uses HTML5 `<audio>` element ref
- `navigator.mediaSession` integration: lock screen controls (play/pause/skip)
- Playback speeds: 0.75x / 1x / 1.25x / 1.5x / 2x
- Saves `position_seconds` to `audio_progress` table on pause/unload

### Step 10.3 — Read-Along Verse Sync
- On `timeupdate` event: find current verse from `chapter_audio_timestamps` where `start_seconds <= currentTime`
- Apply amber highlight class to current verse element (`--color-accent` background tint)
- Auto-scroll to keep highlighted verse visible
- Distinct from user's manual highlights (transient, disappears on pause)
- Read-along: on by default when screen visible, auto-off when page hidden

### Step 10.4 — Player UI
- **Expanded player:** Full-screen sheet — chapter title, verse reference, scrubber, controls, speed selector
- **Mini player:** 52px persistent bar above bottom nav (shows when audio active on any screen)
  - Title, play/pause, thin progress line
  - Tap → expands to full player
- **Auto-advance:** on chapter end, 3-second countdown card "Up next: [Book] [Chapter]" with cancel option

### Step 10.5 — Audio Progress Credit
- On chapter audio completion (>90% played): fire same `markChapterRead` as text reading
- Awards same XP, updates reading plan, triggers streak

**Phase 10 complete when:** User can play ESV audio for any chapter, see verses highlight in sync, see the mini player while browsing other screens, and earn reading credit for listening.

---

## PHASE 11 — Sharing & Internal Messaging (Verse Threads)
*Sessions referenced: Session 7 (Sharing & Messaging)*  
*Produces: External sharing, family verse threading, read receipts.*

### Step 11.1 — External Sharing
- Share sheet (bottom sheet) triggered from verse action menu or header share icon
- Share content types:
  - **Verse/passage:** formatted text "Genesis 1:1 (ESV) — 'In the beginning...'" → clipboard copy
  - **Highlight + annotation:** verse + user's note → clipboard
  - **Trail constellation PNG:** (Phase 13)
  - **Streak card:** SVG with "Day 47 in the Word" → download or share
- All shares logged in `shared_content` with `share_token`
- Public deep-link: `/share/[token]` → read-only verse/note view (no auth required)

### Step 11.2 — Family Unit Setup
- `/profile/family` screen
- "Create family unit" or "Join family unit" (invite code)
- Lists family members with their display names
- Each member: online indicator, last active

### Step 11.3 — Verse Thread (Internal Messaging)
- Verse action menu: "Send to [name]" (for each family member)
- Composer: verse quoted at top (locked) + message body (1,000 char limit)
- Sends to `verse_thread_messages` table
- **Flame icon in verse gutter:** renders when thread exists on that verse (tapped to open panel)
  - Color = family unit accent color (stored in `family_units`)
  - Slides open as a right-side panel (desktop) / slide-up sheet (mobile)
  - Shows full thread history anchored to that verse, in chronological order
  - Reply: new message field inline at bottom

### Step 11.4 — Notifications: Verse Thread
- On new verse thread message: send email via Resend
  - Template: "[Name] left you a note on [Book] [Chapter]:[Verse]" + deep-link
  - Deep-link: `/read/[book]/[chapter]?verse=[v]&thread=open`
- Push notification (if `push_enabled = true` in `notification_settings`)

### Step 11.5 — Read Receipts
- On message view: update `read_by` jsonb with `{userId: timestamp}`
- "Seen" indicator in the thread UI
- Toggle in settings (`read_receipts_visible` on `family_members`)

### Step 11.6 — Charles Nudge (Optional)
- Background job: daily at 9am — find threads with messages > 7 days old with no reply
- If `charles_nudge_enabled = true` on sender's `notification_settings`: send Resend email
- Template: "[Name] hasn't replied to your note on [Book] [Chapter]:[Verse]. They might still be thinking about it."

**Phase 11 complete when:** User can send a verse thread message to a family member, see the flame icon on that verse, open the thread panel, reply, and receive email notifications.

---

## PHASE 12 — Word Study & Library
*Sessions referenced: Session 13 (Word Study), Session 15 (Library)*  
*Produces: Full word study system and library reference hub.*

### Step 12.1 — Word Note Popover
- Long-press any word in reading screen → identifies word via verse+position
- Matches word to `word_occurrences` table via verse reference + word index
- Gets `strongs_number` → looks up `strongs_lexicon.charles_study.charles_synthesis`
- Popover shows: original word (correct script), transliteration, Charles synthesis sentence
- "Go Deeper" button → `/library/word-study/[strongs]`
- Instant render (data pre-generated by the Step 12.3 batch job before launch — reads from `strongs_lexicon.charles_study`, NOT from the Phase 4 per-chapter `word_note`)

### Step 12.2 — Word Study Page (`/library/word-study/[strongs]`)
- Header: original word (large, RTL for Hebrew), transliteration, language badge, Strong's number
- **Charles Explains section:** displays `charles_study` jsonb fields (intro, etymology, usage_insight, theological_weight, closing_line)
- **Occurrence Heat Map:** 
  - `occurrence_heatmap` jsonb → CSS Grid of 66 books, color-scaled
  - User's read books: overlay ring from `journal_entries` query
  - Tap cell → filters verse list to that book
- **Verse list:** sorted by book, reference + 80-char snippet, tap → navigate to reading screen
- **Raw Lexicon:** collapsed accordion (Standard) / expanded (Premium) — `short_def`, `long_def`, POS, KJV usage
- **Related Words:** Strong's numbers sharing same root → chip strip

### Step 12.3 — Charles Word Study Background Job
- `scripts/generate-word-studies.ts`: iterates `strongs_lexicon` where `charles_study = '{}'`
- Calls Anthropic Haiku for each entry (bulk, async, rate-limited)
- Stores result in `charles_study` jsonb
- Estimated 14,000 entries × ~$0.001 = ~$14 total cost
- Run once at deploy; re-run for new entries

### Step 12.4 — Library Home (`/library`)
- "Recently Visited" horizontal strip from `user_library_history`
- Section grid: Word Study / Commentary / Dictionary / Characters / Catechism / Hymns
- Global search bar (debounced, full-text across all sections via Postgres tsvector)

### Step 12.5 — Dictionary (`/library/dictionary/[slug]`)
- Term title + Charles note (pre-generated synthesis sentence)
- Source tabs: Easton's / Smith's / ISBE (only show tabs with data)
- Passage reference pills → navigate to reading screen
- Related terms chip strip

### Step 12.6 — Commentary Vault (Library Browse)
- `/library/commentary` — browse Matthew Henry, Calvin, Clarke by book/chapter
- Matches Tab-panel design from Session 6 (already on reading screen — re-use components)
- "Today in the Vault" featured section on library home

### Step 12.7 — Hymn Index (`/library/hymns`)
- Theme filter chips (Grace / Atonement / Resurrection / etc.)
- Scripture filter: book picker → hymns tagged to that book
- Hymn card: title + author + year + first line
- Hymn detail: full lyrics + Scripture refs + theme tags

**Phase 12 complete when:** User can long-press a word to see the word note, navigate to the full word study page with heat map and Charles explanation, browse the dictionary, and find hymns by theme.

---

## PHASE 13 — TSK Cross-Reference Trails
*Sessions referenced: Session 5 (TSK + Trails)*  
*Produces: All 4 trail modes, D3 constellation visualization, thread system.*

### Step 13.1 — TSK Reference Panel
- Tap TSK density dot (verse gutter) → opens cross-reference bottom sheet
- Sheet layout: verse text at top, then grouped TSK refs (by type: fulfillment/echo/parallel/quotation)
- Each ref: reference pill + verse text snippet (rendered from WEB cached text)
- "Add to Trail" button on each ref → starts/extends a trail

### Step 13.2 — Trail Data Model & API
- `POST /api/trails/create` → creates `cross_reference_trails` + first `trail_steps` row
- `POST /api/trails/[id]/add-step` → adds verse to trail
- `GET /api/trails/[id]` → returns full trail with all steps and verse texts

### Step 13.3 — Active Trail UI
- Trail is in progress: persistent "Active Trail" pill at bottom of reading screen
  - Shows: step count + current verse origin
  - "View Trail" → `/trails/[id]`
  - "End Trail" → closes trail, renders constellation

### Step 13.4 — D3 Constellation Visualization (`/trails/[id]`)
- D3 force-directed graph:
  - Nodes = trail steps (verse references)
  - Labels = verse reference (Roboto Mono) + short text snippet
  - Edges = TSK connections between steps
  - Node size = TSK density of that verse
  - Force simulation with gentle gravity
- Bottom drawer: current step's verse text, prev/next navigation
- "Name this trail" → saves `name` to `cross_reference_trails`
- "Share" → generates SVG → PNG download or share sheet
- Share token: public read-only trail view at `/share/trail/[token]`

### Step 13.5 — Daily Trails (`/trails/daily`)
- Morning + Evening cards (two trails per day)
- Seeded at midnight by a daily cron job (Vercel Cron or Supabase Edge Function scheduled)
- Job: picks starting verse based on current reading community position + AI selection
  - One Anthropic call per day for the whole platform (trivially cheap)
  - Stores result in `daily_trails` table with `trail_date`
- Free users: view-only daily trail; paid: interact and add steps
- Community stat: "Today, N people started at [verse]"

### Step 13.6 — Thread the Needle Mode
- `/trails/new` → "Thread the Needle" option
- Shows two pre-selected verses (daily puzzle, refreshes daily)
- User must find shortest TSK path between them
- Scoring: steps taken + time
- "My solution" vs "Optimal solution" reveal on completion

### Step 13.7 — Canonical Thread System
- `thread_definitions` table: 12 canonical threads per book (already seeded in Phase 0)
- Trail touches a verse in a thread → mark that instance in `user_trail_threads`
- Thread completion: all instances of a theme touched → "You pulled the [theme] thread"
- Visual: completed book on Journey/Phases screen shows woven pattern overlay

**Phase 13 complete when:** User can tap a TSK density dot, explore cross-references, start a trail, see the D3 constellation, and run the daily morning/evening trails.

---

## PHASE 14 — Journey Screen & Progress Visualization
*Sessions referenced: Session 4 (Progress Map), Session 10 (Journey screen)*  
*Produces: All 5 Journey views — Fog Map, Phases, Skill Tree, Constellation, Stats.*

### Step 14.1 — Journey Screen Shell (`/journey`)
- 5 view switcher: Map / Phases / Skill Tree / Constellation / Stats
- Horizontal icon pill at top
- CSS fade transition between views
- Opens to `user_display_settings.progress_view_default`

### Step 14.2 — Fog of War Map (`/journey/map`)
- Custom SVG base map: Ancient Near East + Mediterranean geography
- CSS masking layer: starts black, lifts per `passage_locations` read by user
- `passage_locations` query: get all distinct locations for chapters user has read
- Locations revealed: city name appears, road glows, coastline traces
- Tap revealed location: pulls up a slide-from-bottom panel
  - Key events at this location, dictionary entry, chapters read here
- Archaeological sites toggle: `archaeological_sites` pins appear on map (advanced geography polish in Phase 24)

### Step 14.3 — Cinematic Phases (`/journey/phases`)
- 7 Phase sections (from Session 4 spec)
- Each book: Criterion-style typographic poster (SVG, designed, never generated)
  - 66 book posters to create as SVG components — batch design task
  - Unread: desaturated/dim; read: full color, gold border
- Completing a phase: "Phase Complete" animation + Charles phase-level insight (vault entry)
- "Now Reading" badge on active book

### Step 14.4 — Skill Tree (`/journey/skill-tree`)
- CSS-rendered tree, root at Genesis
- `skill_tree_nodes` table: seeded at deploy (books + theology concept nodes)
- Adjacent node unlock on chapter completion
- Lateral theology unlocks: Tabernacle chapters → "Architecture of Holiness" node
- Color coding: Blue=narrative, Gold=theological, Green=cross-ref, Red=hard passage
- Tap node: shows description + unlock criteria

### Step 14.5 — Constellation Sky (`/journey/constellation`)
- Canvas/Three.js: 66 stars, fixed positions (designed layout)
- Star brightness = % of book read
- Star color = section (blue=Law, gold=Poetry, red=Prophecy, white=Gospels)
- Completed book: star pulses, constellation outline draws in
- Full sky: all 66 books complete — renders stunning static constellation image

### Step 14.6 — Stats Dashboard (`/journey/stats`)
- Chapters read + % of Bible
- Current streak + longest streak
- Total study time
- Most active book
- Memory verses mastered
- Journal entry count
- Questions answered
- All sourced from `user_stats_cache` (updated by background job after each session)

**Phase 14 complete when:** All 5 Journey views are functional with real user data powering them.

---

## PHASE 15 — AI Chat (Ask Charles)
*Sessions referenced: Session 17 (AI Chat)*  
*Produces: Full streaming AI chat anchored to passages or open-ended.*

### Step 15.1 — Chat Session API (Streaming)
- `POST /api/chat/message` — SSE streaming endpoint
- Input: `{sessionId?, message, anchorBook?, anchorChapter?, userId}`
- Logic:
  1. Create `chat_sessions` if new
  2. Insert user message into `chat_messages`
  3. Build context: system prompt (Charles persona + living portrait) + passage context (if anchored) + message history (last 20 turns)
  4. Stream Anthropic API response (SSE)
  5. On completion: insert assistant message + update session title (after 2nd user message)
- Rate limiting: Vercel middleware (5 req/min Standard, 20 req/min Your Edition)

### Step 15.2 — Chat UI
- Full route: `/read/[book]/[chapter]/chat` (anchored) or `/chat/[sessionId]` (open)
- Message list: user right (surface-2 bubble) + Charles left (companion avatar)
- Streaming: text appears word by word
- Suggested questions: 3 chip strip below Charles's message (from `suggested_questions` jsonb)
- Input bar: sticky at bottom, 1,000 char limit, send button
- "New conversation" button starts fresh session

### Step 15.3 — Chat History (`/profile/chats`)
- List sorted by `last_message_at DESC`
- Row: companion avatar + auto-title + last message preview + date
- Tap → resumes session

### Step 15.4 — Companion Switching in Chat
- `chat_sessions.companion_id` snapshot at session start
- If user changes `active_companion_id` after session started: old sessions keep original voice
- Chat header shows active companion name + avatar

**Phase 15 complete when:** User can open Ask Charles from the reading screen, have a streamed conversation anchored to the current chapter, see suggested follow-up questions, and access chat history.

---

## PHASE 16 — Notifications & Email
*Sessions referenced: Session 1 (reminders), Session 7 (verse thread email), Session 16 (memory verse email)*  
*Produces: All transactional emails and notification plumbing.*

### Step 16.1 — Resend Integration
- `src/lib/email.ts`: wrapper around Resend SDK
- All templates use React Email components
- Templates needed:
  - **Magic Link:** auth email (Supabase handles, but style it)
  - **Verse Thread:** "[Name] left you a note on [Book] [Verse]"
  - **Memory Verse Due:** "You have N verses due for review today"
  - **Daily Reading:** Today's passage + 2-3 questions (if `email_daily_reading` on)
  - **PDF Ready:** "Your Bible export is ready" + signed download link
  - **Birthday Letter:** Triggered on birthday — Dad's letter surfaced
  - **Weekly Charles Letter:** Monday email from companion
  - **Year in Review:** Annual PDF + Charles reflection
  - **Grace Period Expiry:** Streak about to reset

### Step 16.2 — Notification Settings
- `/profile/settings` → Notifications section
- Toggle per type (mirrors `notification_settings` table fields)
- Time picker for daily reading email (user's preferred time)
- All off by default except magic link / verse thread / PDF ready

### Step 16.3 — Daily Cron Jobs (Vercel Cron)
- `api/cron/daily-trail` — runs at midnight; generates new daily trail pair
- `api/cron/memory-verse-reminders` — runs at 7am; sends Resend emails to users due for review
- `api/cron/daily-reading` — runs at user's preferred time (approximated — batch job)
- `api/cron/birthday-letters` — runs at midnight; checks `profiles.birthday` + queued letters + `verse_thread_messages.delivery_date`
- `api/cron/portrait-regen` — runs every 6 hours; finds users with 5+ new journal entries since last portrait regeneration; regenerates `living_portrait`

### Step 16.4 — Portrait Regeneration Job
- `src/lib/portrait.ts`: `regenerateLivingPortrait(userId)` 
- Reads: recent journal entries, existing portrait, full profile, life updates
- Calls Anthropic Sonnet: "Update this living portrait based on what you've observed..."
- Writes back to `profiles.living_portrait` + updates profile `theological_fingerprint` + `study_dna`
- Increments `profile_hash` (triggers `personalized_content` stale detection)

**Phase 16 complete when:** All transactional emails render correctly, notification settings work, cron jobs run, and living portrait regenerates after 5 new journal entries.

---

## PHASE 17 — PWA & Offline Mode
*Sessions referenced: Session 20 (Offline Mode & Sync Strategy)*  
*Produces: Installable PWA with offline reading for public domain translations.*

### Step 17.1 — PWA Manifest & Service Worker
- `public/manifest.json`: name, icons (512px + maskable), display=standalone, theme_color
- Service worker (via `next-pwa` or custom Workbox config):
  - Cache strategy: `StaleWhileRevalidate` for static assets
  - Cache strategy: `NetworkFirst` with `CacheFirst` fallback for API routes
  - Pre-cache: all app shell files (fonts, icons, CSS, JS)
- iOS meta tags: `apple-mobile-web-app-capable`, `apple-touch-icon`
- "Add to Home Screen" prompt: deferred install banner on first login

### Step 17.2 — Dexie.js IndexedDB Store
- `src/lib/offline/db.ts`: Dexie database schema
  - `offlineChapters`: `{book, chapter, translation, textJson, cachedAt}`
  - `pendingSync`: `{tableName, operation, payload, createdAt}` — sync queue
- Auto-cache: when user reads WEB/KJV translation, store that chapter in IndexedDB
- ESV: not preloaded (license restriction); falls back to WEB when offline

### Step 17.3 — Offline Detection & Fallback
- `useOnlineStatus` hook: wraps `navigator.onLine` + online/offline events
- When offline: banner appears ("You're offline — showing cached content")
- Reading screen: serves from IndexedDB if chapter is cached; warns if not cached
- AI features (Charles card, OIA): gracefully degraded — show "Generate when back online" placeholder
- Actions taken offline: `highlights`, `journal_entries`, `bookmarks` written to `pendingSync` queue

### Step 17.4 — Background Sync
- On reconnect: process `pendingSync` queue in order
- Background Sync API (`navigator.serviceWorker.ready.then(reg => reg.sync.register())`)
- Conflict resolution: last-write-wins on `updated_at` (as designed in Session 20)
- Show sync status indicator during reconciliation

**Phase 17 complete when:** App installs as PWA on iOS and Android, WEB/KJV chapters read while online are available offline, and changes made offline sync on reconnect.

---

## PHASE 18 — Monetization & Stripe
*Sessions referenced: Session 9 (Monetization), Session 12 (commercial licensing)*  
*Produces: Working subscription tiers, Stripe checkout, gift flow, companion purchases.*

### Step 18.1 — Stripe Products & Price Setup
- Create Stripe Products (one per tier): Reader (free), Disciple, Scholar, Living Bible
- Create Stripe Prices: monthly + annual for each paid tier
- Create Stripe Products for companions: one per companion (one-time payment)
- Store `stripe_product_id` in `companion_definitions` rows (seeded)
- Create `stripe_webhook` endpoint in Vercel

### Step 18.2 — Subscription Checkout
- `/profile/upgrade` screen: 4 tier cards with pricing
- "Upgrade" CTA → `POST /api/stripe/checkout` → returns Stripe Checkout `session.url` → redirect
- Success: Stripe webhook `checkout.session.completed` → update `profiles.subscription_tier`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_expires_at`
- Cancel/failure: return to upgrade screen with message
- Customer portal: `/api/stripe/portal` → Stripe billing portal (cancel, change plan, update card)

### Step 18.3 — Webhook Handler
- `POST /api/stripe/webhook` (raw body, verify signature):
  - `checkout.session.completed` → activate subscription / companion purchase
  - `customer.subscription.updated` → update tier + expiry
  - `customer.subscription.deleted` → downgrade to free tier
  - `invoice.payment_failed` → email user via Resend + grace period start

### Step 18.4 — Tier-Gated Features
- `src/lib/tier.ts`: `canAccess(feature, tier)` — returns boolean
- Gate decorators/wrappers for:
  - AI content generation (Standard+)
  - Compare mode 4 translations (Premium+)
  - PDF export (Your Edition / Premium with restriction)
  - Companions store (Standard+)
  - Your Edition features (Your Edition only)
- UI: locked features show upgrade prompt with tier requirement label

### Step 18.5 — Gift Flow
- `/profile/upgrade` → "Give as a Gift" toggle
- Gift form: recipient email + personal letter field + tier selection + reveal date (optional)
- `POST /api/stripe/checkout?gift=true` → Stripe Checkout with metadata
- Webhook: on payment → create `profiles` row for recipient if not exists, set `gifted_by`, `gifted_message`, `gifted_reveal_at`
- Recipient's first login: sees gifted greeting from Dad's letter

### Step 18.6 — Companion Store & Purchase
- `/profile/companions` screen: owned companions + "Meet More" store section
- Companion card: display name + tradition + tagline + price + "Add" button
- One-time purchase via Stripe: `POST /api/stripe/checkout?companionId=[id]`
- On payment: insert `user_companions` row
- Purchased companion unlocks in companion selector

**Phase 18 complete when:** A test user can upgrade from Free to Standard, receive their new tier access, and a simulated gift flow creates a recipient account with the gifted letter.

---

## PHASE 19 — Companion System & Persona Builder
*Sessions referenced: Session 9 (Companion System)*  
*Produces: Multiple companion voices, active companion switching, Persona Builder.*

### Step 19.1 — Companion Seed Data
- Seed `companion_definitions` table:
  - Augustine (tradition: catholic/reformed, style: rhetorical, confessional)
  - Wesley (tradition: methodist, style: devotional, sanctification-focused)
  - Luther (tradition: lutheran, style: bold, grace-emphatic)
  - Calvin (tradition: reformed, style: precise, exegetical)
  - Tozer (tradition: evangelical/mystic, style: prophetic, burning)
- Each: `theological_dna[]`, `style_notes`, heraldic SVG icon, `stripe_product_id`

### Step 19.2 — Companion System Prompt Integration
- `buildSystemPrompt` already accepts `companion?` param (Phase 4)
- When `active_companion_id` is set: load that companion's `theological_dna` + `style_notes`
- Inject companion block INSTEAD of default Charles block in Layer 1 of prompt
- Companions still use user's `living_portrait` — they know the user

### Step 19.3 — Persona Builder (Your Edition)
- `/profile/companions` → "Build Your Own" card
- Multi-step form:
  1. Name your companion
  2. Theological tradition (multi-select)
  3. Communication style (conversational / scholarly / devotional / prophetic)
  4. Source theologians (pick up to 3 from the companion library)
  5. Custom voice notes (free text: "emphasize...", "never use...")
- On complete: AI call (Sonnet) → generates `system_prompt_block` from config
- Store config in `user_companions.custom_config` jsonb
- Available immediately as active companion

**Phase 19 complete when:** User can switch active companion, see the different voice in OIA responses and chat, and create a custom companion via Persona Builder.

---

## PHASE 20 — Community Features (Study Groups)
*Sessions referenced: Session 29 (Community of the Book)*  
*Produces: Small groups with verse-anchored threads, anonymous pulse, group prayer.*

### Step 20.1 — Anonymous Verse Pulse
- Background job (daily): aggregate `verse_interactions` by week into `verse_pulse_cache`
- Compute relative weight (0.0–1.0) — never expose raw counts
- Reading screen: if `show_global_pulse = true` in `user_display_settings`:
  - Apply subtle ink-depth variation on verses above a weight threshold
  - Dashboard "This week in the Book" widget: top 3 verses by pulse weight

### Step 20.2 — Study Group Creation & Joining
- `/profile/family` → "Create a group" or "Join with code"
- Create: generates 6-char invite code, creates `study_groups` row
- Join: input invite code → adds `study_group_members` row (choose display name at join)
- Group settings: toggle `highlights_visible`, `prayer_visible`

### Step 20.3 — Group Verse Threads
- Reading screen: when in a group with `highlights_visible = true`, see members' highlight colors as additional left-gutter indicators
- Verse action menu: "Start group thread on this verse" → creates `group_verse_threads` row
- Group thread panel: shows `group_thread_messages`, verse-anchored, not a general chat

### Step 20.4 — Group Prayer Requests
- Section in group view: prayer requests
- Add: `body` + optional `verse_ref` + `is_answered` toggle
- List: member name (display_name) + body + verse anchor
- No likes, no reactions — "Mark answered" only
- Privacy: only visible to members with `prayer_visible = true`

**Phase 20 complete when:** User can join a group, see anonymous pulse on the reading screen (toggleable), participate in verse-anchored group threads, and share/view prayer requests.

---

## PHASE 21 — Export & "Your Bible" PDF
*Sessions referenced: Session 18 (Export & PDF)*  
*Produces: Working PDF export pipeline, data export, account deletion flow.*

### Step 21.1 — Export Job Queue
- `/profile/settings` → "Export My Bible" (Your Edition) or "Export Data" (all tiers)
- `POST /api/export/create` → inserts `export_jobs` row with `status = 'pending'`

### Step 21.2 — PDF Generation Pipeline
- Vercel background function (or Supabase Edge Function):
  1. Fetch all studied chapters for scope
  2. Assemble document structure JSON
  3. Puppeteer: render HTML page → PDF
     - HTML template: EB Garamond body, Barlow Condensed titles, generous margins
     - Cover page: user name + date range + companion name + "A Personal Study Record"
     - Each chapter section: Chapter header, WEB passage, Charles intro, Word Note, OIA Q&A, journal note, highlights
  4. Store PDF in Supabase Storage `/exports/[userId]/[timestamp].pdf`
  5. Update `export_jobs` with `status = 'complete'`, `storage_path`, `download_url` (signed URL, 7 days), set `expires_at`
  6. Send Resend email: "Your Bible is ready" + download link

### Step 21.3 — Data Export (JSON/CSV)
- Same `export_jobs` flow for type `data_export`
- Generate JSON dump of all user data
- Generate CSV of journal answers
- Deliver via Resend download link

### Step 21.4 — Account Deletion Flow
- `/profile/settings` → "Delete my account"
- 30-day grace period: set `profiles.deletion_requested_at = now()`
- Grace period screen: "Your account will be deleted on [date]. Cancel?" 
- After 30 days: cron job deletes `auth.users` row → cascade deletes all data
- Confirmation emails at request + final deletion

**Phase 21 complete when:** A Your Edition user can request a PDF export, receive an email with a working download link, and the PDF renders correctly with all study notes.

---

## PHASE 22 — Advanced AI Features
*Sessions referenced: Session 22 (Pray This Passage), Session 21 (Hymn Connections), Session 23 (Gamification depth), Session 24 (Reading Stats)*  
*Produces: Pray This Passage mode, hymn surface, deeper stat analytics.*

### Step 22.1 — Pray This Passage Mode
- Reading screen top bar: Study / Pray / Listen mode switcher (stored in `user_display_settings.default_study_mode`)
- In Pray mode:
  - After reading: instead of OIA questions, show "Transforms" — each verse's text becomes a prayer turn
  - Charles generates prayer prompts per verse (different prompt, same content generation call)
  - User types/speaks their prayer in each prompt field
  - Saved to `prayer_journal` table (with `linked_verse_text`)
  - Closing: "Amen" button — marks session complete, updates streak

### Step 22.2 — Hymn Connections
- On reading screen: if `hymn_index` has entries with `explicit_refs` matching this chapter → hymn connection chip appears in verse margin
- Tap chip → Hymn card slides up: title, first line, lyrics, "View in Library" link
- Charles may mention hymn connections in commentary when hymn has deep passage grounding
- "Pray This Passage" mode: offer to sing the connected hymn (show lyrics, no audio)

### Step 22.3 — Year in Review (Annual Document)
- Cron: January 1 — triggers `year_in_review` generation for all Your Edition users
- Content sections (generated by Charles/Sonnet):
  - Opening (Charles letter to the user)
  - Chapters read + key passages
  - Recurring themes identified
  - Answered prayers from `prayer_journal`
  - Streak story
  - Memory verses mastered
  - "What I noticed about your year" (Charles's longitudinal observation)
- Generated as PDF via same Puppeteer pipeline (Phase 21)
- Stored in `year_in_review` table + Supabase Storage
- Accessible at `/profile/year-in-review`

### Step 22.4 — Weekly Charles Letter
- Monday morning cron: generates weekly letter for Your Edition users with `weekly_letter_enabled = true`
- Charles (or active companion) writes about the week's reading
- Sent via Resend + stored in `weekly_charles_letters`
- Accessible from `/profile/letters` as persistent inbox

**Phase 22 complete when:** User can switch to Pray mode and receive prayer-formatted prompts, hymn connections appear on relevant verses, and Year in Review generates correctly.

---

## PHASE 23 — Sermon Notes, Catechism & The Long Game
*Sessions referenced: Session 28 (Sermon Notes), Session 30 (Catechism), Session 31 (Tim's Arc)*  
*Produces: Sermon skeleton generator, catechism browser, "On This Day" feature.*

### Step 23.1 — Sermon Outline Generator
- Entry: reading screen → toolbar → "Outline this passage" (Premium+)
- Mode select sheet: Sermon Skeleton / Small Group / Family Devotions
- `POST /api/sermon/generate` → calls Sonnet with sermon outline prompt
- Prompt flag: `mode=sermon_outline`, collegial register, no alliteration, structure follows text shape
- Output JSON: `{text, context, main_idea, movements[], application_directions, exegetical_footnotes, illustrative_threads}`
- Display: clean outline view, sections collapsible, user can edit inline (`user_notes` field)
- Export: clipboard (Markdown), `.docx` (server-side `docx` npm package), internal share

### Step 23.2 — Catechism Browser (`/library/catechism`)
- Already seeded in Phase 0; browser UI built in Phase 12
- Add: catechism layer indicator on reading screen (`catechism_layer_enabled`)
  - Verse margin badge "C" when verse is a `proof_text` in any catechism entry
  - Tap: card shows Q&A that cites this verse, "Read full Q&A" link
- 52-week Heidelberg plan: activate from `/library/catechism` → "Start Lord's Day plan"

### Step 23.3 — Catechism Q&A Memory
- `/profile/memory-verses`: add `memory_type = 'catechism_qa'` items
- Flashcard mode: front = question, back = answer + proof texts
- Same SM-2 mechanics as verse memory (Phase 9)

### Step 23.4 — "On This Day" Feature
- Dashboard: query `journal_entries` where `date_trunc('day', studied_at) = today AND studied_at < now() - interval '1 year'`
- If found: "On This Day" card showing: N years ago, book + chapter, first 2 lines of note
- "Read more" → full journal entry view
- Dismiss (persists to `meta` on `journal_entries` or separate preference)

### Step 23.5 — Forward Birthday Letters
- `/profile/family` → "Write a letter to future me"
- Composer: rich text + verse anchor + delivery date picker
- Saved to `verse_thread_messages` with `delivery_date` set
- Birthday cron (Phase 16): checks `delivery_date` daily, delivers when reached

### Step 23.6 — Response to Younger Self
- In journal session view (Phase 8): old entries (1+ years old) show "Write a response" affordance
- Form: response text → saved to `journal_entries.response_note` + `responded_at`
- Original entry immutable; response displayed as addendum with different visual treatment

**Phase 23 complete when:** Premium users can generate sermon outlines, the catechism layer shows on relevant verses, and long-game features (On This Day, forward letters) work correctly.

---

## PHASE 24 — Geographic & Archaeological Layer
*Sessions referenced: Session 4 (Fog Map detail), Session 9 (geography)*  
*Produces: Complete Fog of War map with interactive location pins.*

### Step 24.1 — SVG Map Asset
- Commission / create custom SVG map file: Ancient Near East + Mediterranean
  - Must include: Mesopotamia, Canaan, Egypt, Asia Minor, Greece, Rome region
  - All significant Bible land locations as named points
  - Scalable to mobile viewport
- SVG stored in `public/maps/bible-world.svg`

### Step 24.2 — Map Unlock Engine
- Query: all `passage_locations` for chapters user has read → get matching `geographic_locations`
- Apply: CSS unmask for `location.map_region` regions the user has unlocked
- Reveal animation: CSS keyframe fade from dark to light as new regions unlock
- First read: trigger region reveal (with brief pulse animation)

### Step 24.3 — Location Panel
- Tap any revealed location dot → side panel:
  - Location name + region
  - Key events (from `geographic_locations.notable_events` jsonb)
  - Dictionary entry link (if `bible_dictionary_entries` has entry for this location)
  - "Chapters you've read here": list of studies at this location
- Archaeological sites toggle: shows pins for `archaeological_sites` rows
  - Tap pin: brief description + Scripture connection

**Phase 24 complete when:** The Fog of War map correctly reveals geography as chapters are read, locations are tappable with useful information panels, and archaeological site overlays work.

---

## PHASE 25 — Pre-Launch Hardening
*Sessions referenced: Session 12 (Legal), Session 31 (legal pages)*  
*Produces: All legal pages, accessibility audit, performance optimization, ESV attribution.*

### Step 25.1 — Legal Pages
- `/privacy` — Privacy Policy (COPPA + CCPA + GDPR lite)
- `/terms` — Terms of Service
- `/credits` — Full attribution page:
  - ESV copyright notice (required on every page + here in full)
  - MorphGNT CC-BY-SA attribution
  - OpenScriptures CC-BY attribution
  - Spurgeon, Matthew Henry, Calvin, Clarke (public domain, with sourcedates)
  - D3.js, other open source library credits

### Step 25.2 — ESV Attribution on Every Reading Page
- Footer on every `/read/**` page (if ESV translation active):
  - "Scripture quotations are from the ESV® Bible, © 2001 by Crossway, used by permission."
  - Link to `www.esv.org`
- Required by ESV API terms — verify it renders before any public access

### Step 25.3 — Age Gate Enforcement
- Onboarding: birth year field or age confirmation checkbox (must affirmatively confirm 13+)
- Under-13 attempt: blocked with clear message + parent contact option
- Gift flow: if recipient age implies < 13, require parent email confirmation

### Step 25.4 — Performance & Accessibility
- Lighthouse audit: target 90+ performance on mobile
- `next/image` for all images
- Font display: `swap` on all Google Fonts
- `preload` for EB Garamond (primary reading font)
- `aria-label` on all icon buttons (Phosphor icons are decorative SVGs — wrap correctly)
- Focus states on all interactive elements (keyboard navigation)
- Large text mode + high contrast check (Prayer Warrior archetype accessibility)
- `env(safe-area-inset-bottom)` applied to bottom nav + mini player (iPhone notch/home bar)

### Step 25.5 — Error Handling & Loading States
- Global error boundary in App Router layout
- Loading UI for every async route (using `loading.tsx` in App Router)
- 404 and 500 pages (branded)
- API error handling: all `fetch` calls have try/catch + user-facing error messages
- AI generation failures: graceful retry + "Trying again..." message (not a spinner)

### Step 25.6 — Rate Limiting & Security
- Vercel middleware: rate limit `/api/chat/**` and `/api/content/**` by authenticated userId
- CORS: restrict API routes to app domain only
- Supabase RLS: final audit — every user table has RLS enabled and policies verified
- Stripe webhook signature verification: ensure `constructEvent` check is in place
- `.env.local` audit: no secrets in client-side variables (no `NEXT_PUBLIC_` prefix on secret keys)

**Phase 25 complete when:** All legal pages are live, ESV attribution renders on reading pages, age gate blocks under-13 signups, Lighthouse mobile score ≥90, and RLS is verified on all user tables.

---

## PHASE 26 — Data Integrity & Seeding Verification
*Produces: Verified seed data, all background jobs tested, production readiness.*

### Step 26.1 — Seed Data Verification
Run verification queries to confirm data integrity:
- `SELECT COUNT(*) FROM tsk_references` — expect ~500,000
- `SELECT COUNT(*) FROM strongs_lexicon WHERE language = 'Hebrew'` — expect ~8,674
- `SELECT COUNT(*) FROM strongs_lexicon WHERE language = 'Greek'` — expect ~5,624
- `SELECT COUNT(*) FROM spurgeon_index` — expect 730+ entries
- `SELECT COUNT(*) FROM catechism_entries WHERE catechism = 'WSC'` — expect 107
- `SELECT COUNT(*) FROM catechism_entries WHERE catechism = 'HC'` — expect 129
- `SELECT COUNT(*) FROM chapters WHERE translation = 'WEB'` — expect 1,189 (all chapters)
- `SELECT COUNT(*) FROM chapters WHERE translation = 'KJV'` — expect 1,189
- Verify `tsk_verse_stats` has rows for major reference verses (Jn 3:16, Rom 3:23, etc.)

### Step 26.2 — Background Jobs Testing
Test each cron job in development:
- Daily trail generation produces a valid `daily_trails` row
- Portrait regeneration reads journal entries and produces a coherent `living_portrait`
- Memory verse reminder sends a correctly rendered Resend email
- Charles word study job processes 10 test entries and saves valid `charles_study` jsonb
- Verse pulse job aggregates and computes weights between 0.000 and 1.000

### Step 26.3 — End-to-End User Flows
Manual QA of primary flows:
1. New user signup → onboarding → dashboard (read chapter → study → journal → streak)
2. Family gifting: dad gifts → Tim receives → sees Dad's letter → completes onboarding
3. Verse thread: Dad sends note → Tim sees flame icon → Tim replies → Dad gets email
4. Memory verse: add → review session (all 3 modes) → reach mastery
5. Trail: start from TSK dot → add 5 steps → view constellation → name + share
6. PDF export: Your Edition user → request → receive email → download renders correctly
7. Stripe: free → upgrade to Standard → verify tier access → customer portal → cancel → downgrade

---

## PHASE 27 — Commercial Launch Preparation
*Sessions referenced: Session 12 (ESV commercial license), Session 9 (Stripe activation)*  
*Produces: App ready for public SaaS launch.*

### Step 27.1 — Form Legal Entity
- Register LLC (required before Crossway ESV commercial license application)
- Set up business bank account
- Stripe business account upgrade (from personal)

### Step 27.2 — ESV Commercial License
- Submit license application: `crosswaygnp.formstack.com/forms/esv_digital_licensing_proposal`
- Timeline: allow 4-8 weeks minimum
- Fallback: launch with WEB as default translation; ESV text access gated (shows upgrade prompt to ESV Users)
- Once licensed: remove the 24h TTL restriction; permanent ESV caching permitted

### Step 27.3 — API.Bible Commercial Account
- Contact `support@api.bible` for commercial licensing clarity
- Needed for: NIV, NASB, NLT, CSB as Standard tier features
- Attribution: per-Bible requirements must appear in UI when those translations are active

### Step 27.4 — Stripe Production Configuration
- Switch from Stripe test to production mode
- Create production products and prices
- Re-configure webhook endpoint with production signing secret
- Test complete subscription lifecycle: create → invoice → renew → cancel → downgrade

### Step 27.5 — Vercel Production Setup
- Custom domain configuration
- Environment variable management (Vercel env vars for production)
- Vercel Analytics enabled
- Log Drain: configure for error monitoring (Sentry or Vercel's built-in)
- Supabase: upgrade to Pro plan (for PITR backup, custom domain, no rate limits)

---

## APPENDIX A — First-Coding-Session Starter (Phase 0 + Phase 1)

When handing this to Sonnet/Opus for the first coding session, provide:
1. This entire `coding-plan.md`
2. `project-notes.md` (for context on decisions made)
3. `charles-persona.md` (for Charles's voice)
4. `sql/README.md` (for complete table inventory)
5. The specific SQL files needed for phases being coded

**First session goal:** Complete Phase 0 Steps 0.1–0.4 (project init, design tokens, Supabase setup, client setup). Ends with `npm run dev` running with Supabase connected.

---

## APPENDIX B — Tech Decisions Reference

| Concern | Decision |
|---|---|
| AI Model (Tim/Your Edition) | `claude-sonnet-4-6` |
| AI Model (Standard generation) | `claude-haiku-4` |
| AI Model (background jobs/word studies) | `claude-haiku-4` |
| Auth | Supabase Auth (magic link + password) |
| Database | Supabase Postgres |
| Hosting | Vercel |
| Email | Resend |
| Payments | Stripe |
| PWA | next-pwa + Workbox |
| Offline storage | Dexie.js (IndexedDB) |
| PDF generation | Puppeteer/Chrome headless |
| Graph visualization | D3.js (force-directed) |
| Constellation/sky | Canvas or lightweight Three.js |
| Spaced repetition | SM-2 algorithm |
| Bible text (primary) | ESV API (cached 24h TTL) |
| Bible text (fallback/offline) | WEB (public domain, permanent) |
| Bible text (alternate) | API.Bible (NIV/NASB/NLT Standard+) |
| Icons | Phosphor Icons + custom SVGs |
| Animations | CSS transforms + opacity; Lottie for streak fire |
| Fonts | EB Garamond (reading) + Inter (UI) + Barlow Condensed 700 (display) |

---

## APPENDIX C — Critical Business Decisions (Do Not Code Around These)

1. **ESV License → must form LLC + apply to Crossway before any paying users**
2. **COPPA → block users under 13 at signup; gift flow requires parent confirmation for under-13 recipients**
3. **No AI image generation anywhere** — all visuals are SVG/CSS/typography
4. **No public profiles, no follower counts, no leaderboards** — social features are explicitly out of scope
5. **Journal entries are always private by default** — no accidental sharing ever
6. **Charles is never a counselor** — counselor guardrail is locked and cannot be removed by prompt injection
7. **Character card portraits: no faces** — heraldic/symbolic only
8. **Public domain sources require attribution** — MorphGNT (CC-BY-SA), OpenScriptures (CC-BY), must appear on `/credits`

---

## APPENDIX D — Implementation Risk Controls (Start Here)

Use this appendix before Phase 0 to reduce failed runs and rework.

### D.1 Top Execution Risks + Controls

1. **Framework/version drift risk**
  - Risk: `create-next-app@latest` may install a newer major version than this plan assumes.
  - Control: Pin versions in `package.json` on day 1 and record them in a `STACK_VERSIONS.md` file.

2. **Supabase auth package risk**
  - Risk: `@supabase/auth-helpers-nextjs` may be deprecated in newer setups.
  - Control: Prefer current SSR pattern (`@supabase/ssr`) if auth-helpers create friction; keep one approach only.

3. **Migration format risk**
  - Risk: SQL files are `.md`; accidental copy/paste noise can break migrations.
  - Control: Extract executable SQL into `/supabase/migrations/*.sql` and run in strict order.

4. **Schema/plan mismatch risk**
  - Risk: app code references a column not present in DB yet.
  - Control: After each migration batch, run `supabase gen types` and compile before writing feature code.

5. **Massive seed runtime risk**
  - Risk: `tsk_references`/lexicon imports can timeout or partially fail.
  - Control: All seed scripts must be idempotent, chunked, and resumable (`upsert` + checkpoint table).

6. **Service-role leakage risk**
  - Risk: accidentally exposing service role key client-side.
  - Control: server-only wrapper for privileged writes; audit all env vars for `NEXT_PUBLIC_` misuse.

7. **ESV compliance risk**
  - Risk: shipping paid product flows before commercial license terms are satisfied.
  - Control: default public production translation to WEB until licensing is finalized; enforce attribution checks.

8. **Stripe webhook race risk**
  - Risk: duplicate events create inconsistent tier state.
  - Control: webhook idempotency table keyed by Stripe event ID; ignore already-processed events.

9. **Offline sync conflict risk**
  - Risk: stale writes overwrite newer cloud data.
  - Control: persist `updated_at` on write and enforce deterministic last-write-wins in one sync handler.

10. **Background job reliability risk**
   - Risk: cron route failures go unnoticed.
   - Control: add job-run logs table + failure alerts (email/log drain) for every cron endpoint.

11. **AI contract drift risk**
   - Risk: model output breaks expected JSON shape.
   - Control: strict JSON schema validation + retry once with repair prompt; on fail, return graceful fallback.

12. **Cost blowout risk**
   - Risk: unbounded generation (chat/content/word studies) spikes spend.
   - Control: per-tier rate limits, request budgets, and daily spend guardrails before public launch.

### D.2 Go/No-Go Gates (Required)

- **Gate A (before Phase 3):** Auth works, migrations are clean, type generation passes, no RLS policy gaps on core user tables.
- **Gate B (before Phase 4):** AI JSON contract validated in code, fallback UI exists for generation failure/timeouts.
- **Gate C (before Phase 18):** Stripe webhook idempotency implemented and tested with replayed events.
- **Gate D (before Phase 17 production):** offline queue survives refresh + reconnect and resolves conflicts predictably.
- **Gate E (before launch):** legal pages live, ESV attribution verified, under-13 sign-up blocking confirmed.

### D.3 First 5-Day Build Order (Lowest-Risk Start)

- **Day 1:** Phase 0.1–0.4 only (project, Supabase, auth plumbing, typegen).
- **Day 2:** Minimal Phase 1 auth screens + profile auto-create + protected routes.
- **Day 3:** Phase 3.1–3.2 with WEB only (defer ESV/API.Bible until core reader is stable).
- **Day 4:** Phase 5 basic highlights/bookmarks + persistence.
- **Day 5:** Phase 4 skeleton (mock JSON first), then swap in Anthropic call after schema validation.
