# BibleSaaS

> A personalized, AI-powered study Bible platform. Every user gets their own edition — same Scripture, radically different experience based on who they are.

Built with Next.js 16 App Router · Supabase · Anthropic Claude · Vercel · Stripe

[![CI](https://github.com/TheAccidentalTeacher/BibleSAAS/actions/workflows/ci.yml/badge.svg)](https://github.com/TheAccidentalTeacher/BibleSAAS/actions/workflows/ci.yml)

> **Status: Active development — Phase 26 of 27 complete.** All core features are built and seeded. Entering commercial launch preparation (Phase 27).

---

## What This Is

BibleSaaS is a mobile-first web platform (PWA) where the AI layer knows who you are and tailors everything — commentary, questions, passage connections, and tone — to your life, history, and interests. A 15-year-old athlete and a 70-year-old prayer warrior open the same chapter and see genuinely different study experiences.

**The product is not "AI added to a Bible app." The product is the personalization engine.** The Bible text is the constant; how it lands is the variable.

### Core features (built)

- **Conversational onboarding** — Charles (the AI persona) learns who you are before showing you anything
- **OIA study system** — Observe, Interpret, Apply questions tuned to the individual user
- **Living portrait** — AI-maintained profile updated across every journal entry and session; drives all personalization
- **TSK cross-reference trails** — Treasury of Scripture Knowledge graph (~344K refs), surfaced as navigable constellation trails
- **Full commentary library** — Spurgeon, Matthew Henry, Calvin, Adam Clarke (2,777 entries), all synthesized by Charles
- **Memory verse system** — SM-2 spaced repetition with typing, cloze, and flashcard practice modes
- **Prayer journal** — Category-tagged prayers with follow-up and answered-prayer tracking
- **Audio Bible** — Narrated chapters with read-along verse highlighting and mini-player
- **Your Edition PDF** — Personalized exportable study Bible with the user's own highlights and journal
- **Gamification layer** — Streaks, XP, levels, hidden achievements (opt-out for users who don't want it)
- **Gifted accounts** — One user gifts a personalized edition to someone else, including a personal letter
- **Geographic map** — Fog-of-war Biblical locations map (77 locations) unlocked as you read
- **Catechisms** — Westminster Shorter, Westminster Larger, Heidelberg, 1689 Confession (396 Q&As)
- **Sermon outline builder** — AI-structured sermon outlines with Markdown export
- **AI companion selection** — Choose Charles's voice style from multiple theological companions
- **Legal pages** — `/privacy`, `/terms`, `/credits` with full ESV attribution

### The AI companion

**Charles** is the theological voice of the platform — named for C.H. Spurgeon, grounded in Ladd's Kingdom framework and MacArthur's exegetical rigor, but speaking in a modern voice that sounds like none of them. He adapts radically per user. See [`docs/charles-persona.md`](docs/charles-persona.md) for the full spec.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16.1.6 App Router | RSC + streaming, file-based routing, Vercel-native |
| Database + Auth | Supabase (Postgres + GoTrue) | RLS, real-time, storage, Edge Functions, managed |
| AI | Anthropic Claude (`claude-sonnet-4-5`, `claude-haiku-4`) | Best-in-class reasoning; Sonnet for personalization, Haiku for bulk jobs |
| Hosting | Vercel | Preview deploys, edge functions, zero-config Next.js |
| Payments | Stripe | Subscriptions + one-time purchases + gifting |
| Email | Resend | Transactional email (magic links, weekly letters, year-in-review) |
| Styling | Tailwind CSS 4 | Utility-first; pairs well with design token system |
| Offline | Dexie.js (IndexedDB) + Background Sync API | Chapter caching, offline reads (WEB/KJV only — ESV license restriction) |
| PWA | `next-pwa` | Installable, home screen, service worker |
| Fonts | EB Garamond, Inter, Barlow Condensed, Roboto Mono | Established reading typography + clean UI |

### Bible text sources

| Translation | Source | Cache Policy |
|---|---|---|
| ESV | ESV API (`api.esv.org`) | 24-hour TTL (license requirement) |
| WEB, KJV, ASV, YLT | Stored in Supabase (`chapters` table) | Permanent (public domain) |
| NIV, NASB, NLT, CSB | API.Bible (Standard tier+) | 1-hour session cache; never stored permanently |

---

## Project Status

> **Active development — Phase 26 of 27 complete.** The application is feature-complete. Phase 27 covers commercial launch (LLC formation, ESV commercial license, Stripe production, Vercel prod config).

| Artifact | Status |
|---|---|
| Database schema (13 files, ~60 tables) | ✅ Complete |
| Supabase migrations | ✅ Applied |
| Phase-by-phase coding plan (27 phases) | ✅ Phases 1–26 complete |
| Bible translations (WEB, KJV) | ✅ Seeded — 1,189 chapters each |
| TSK cross-references | ✅ Seeded — 344,799 entries |
| Strong's lexicon (Hebrew + Greek) | ✅ Seeded — 14,197 entries |
| Spurgeon Morning & Evening | ✅ Seeded — 732 entries |
| Commentary entries (MH, Calvin, Clarke) | ✅ Seeded — 2,777 entries |
| Catechisms (WSC, WLC, HC, 1689) | ✅ Seeded — 396 Q&As |
| Geographic locations | ✅ Seeded — 77 locations, 210 passage links |
| Application code (213 TS/TSX files) | ✅ All routes built |
| Background jobs (8 cron routes) | ✅ All verified HTTP 200 |
| AI persona specification | ✅ Complete |
| Legal pages (/privacy, /terms, /credits) | ✅ Live |
| TypeScript errors | ✅ 0 |
| ESV commercial license | ⏳ Pending LLC formation (Phase 27) |
| Stripe production keys | ⏳ Phase 27 |
| Custom domain | ⏳ Phase 27 |

---

## Repository Structure

```
/
├── .github/
│   ├── ISSUE_TEMPLATE/          # Bug report + feature request forms
│   └── workflows/ci.yml         # Type check, SQL lint, secret scan
├── docs/                        # Project documentation
│   ├── coding-plan.md           # 27-phase implementation plan (the primary build guide)
│   ├── project-notes.md         # All 31 brainstorm/design sessions
│   └── charles-persona.md       # AI companion personality and theological DNA spec
├── sql/                         # Human-readable schema documentation
│   ├── README.md                # Table index and design principles
│   └── ...                      # 13 files covering all ~60 tables
├── supabase/
│   ├── config.toml
│   └── migrations/              # Executable .sql migration files
├── scripts/                     # Seed scripts (idempotent, resumable via seed_checkpoints)
│   ├── seed-translations.ts     # WEB + KJV chapters
│   ├── seed-tsk.ts              # TSK cross-references
│   ├── seed-strongs.ts          # Strong's Hebrew + Greek lexicon
│   ├── seed-spurgeon.ts         # Morning & Evening devotional
│   ├── seed-commentaries.ts     # Matthew Henry, Calvin, Adam Clarke
│   ├── seed-catechism.ts        # Westminster + Heidelberg catechisms
│   ├── seed-confession-1689.ts  # 1689 Baptist Confession
│   ├── seed-geography.ts        # 77 Biblical geographic locations
│   └── test-crons.ps1           # Smoke-test all 8 cron jobs
└── src/
    ├── app/                     # Next.js App Router pages (46 pages, 61 API routes)
    │   ├── auth/                # login, signup, verify, callback
    │   ├── dashboard/           # Home — streak, reading plan, On This Day
    │   ├── read/[book]/[chapter]/ # Chapter reading view
    │   ├── journey/             # Fog-of-war progress + geographic map
    │   ├── trails/              # TSK cross-reference constellation trails
    │   ├── library/             # Commentary Vault, word studies, catechism
    │   ├── profile/             # Settings, memory verses, journal, prayer, companions
    │   ├── chat/                # Full-screen Charles chat
    │   ├── onboarding/          # Conversational AI onboarding
    │   ├── gift/                # Gift flow
    │   ├── privacy|terms|credits/ # Legal pages
    │   └── api/                 # 61 route handlers (cron, chat, content, stripe, …)
    ├── components/              # Shared React components (audio, layout, trails, ui)
    ├── lib/                     # Server utilities (charles/, supabase/, portrait.ts)
    └── middleware.ts            # Auth session refresh + rate limiting
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (with migrations applied)
- An [Anthropic](https://console.anthropic.com) API key
- A [Stripe](https://stripe.com) account (for payment features; test keys work for local dev)
- An [ESV API](https://api.esv.org) key (free tier for development)
- A [Resend](https://resend.com) account (or use `re_dummy` locally)

### 1. Clone and install

```bash
git clone https://github.com/TheAccidentalTeacher/BibleSAAS.git
cd BibleSAAS
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

See [`.env.example`](.env.example) for all required variables and descriptions.

### 3. Database setup

Run migrations in order via the Supabase dashboard SQL editor or Supabase CLI:

```bash
# Using Supabase CLI
supabase db push

# Or manually: run each file in supabase/migrations/ in sequence
```

### 4. Seed public domain data

All seed scripts are idempotent (safe to re-run) and resumable via the `seed_checkpoints` table.

```bash
npm run seed:translations   # WEB + KJV chapters (1,189 each)
npm run seed:tsk            # TSK cross-references (~344K entries)
npm run seed:strongs        # Strong's Hebrew + Greek lexicon
npm run seed:spurgeon       # Morning & Evening devotional
npm run seed:commentaries   # Matthew Henry, Calvin, Adam Clarke
npm run seed:catechism      # Westminster + Heidelberg catechisms
npm run seed:confession     # 1689 Baptist Confession
npm run seed:geography      # 77 Biblical geographic locations
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

### Personalization pipeline

```
User journal answer
        ↓
Every 5-8 entries: background job (cron)
        ↓
Claude synthesizes → profiles.living_portrait (text) + living_portrait_json (structured)
        ↓
profile_hash updated
        ↓
Next chapter open: personalized_content.profile_hash mismatch → regenerate
        ↓
Chapter-specific content: intro, connections[], questions[], word_note, closing
```

### AI model routing

| Use case | Model | Reason |
|---|---|---|
| Onboarding chat, OIA responses, sermon outlines, chat | `claude-sonnet-4-5` | Quality, reasoning depth |
| Portrait regeneration | `claude-sonnet-4-5` | User-facing output must be high quality |
| Word study synthesis (batch) | `claude-haiku-4` | ~3,000 lexicon entries; cost-sensitive |
| Weekly letters, Year in Review | `claude-sonnet-4-5` | Personal narrative; quality matters |

### RLS strategy

All user tables enforce Row Level Security at the database layer — not just the API layer. Service role key is used only for background jobs, seed scripts, and admin operations. The anon/user key can only see the authenticated user's own rows.

---

## Subscription Tiers

| Tier | Access |
|---|---|
| Free | WEB/KJV reading, Vault commentary cards (pre-generated, non-personalized), basic streaks |
| Standard | ESV, API.Bible translations, live AI questions, journal, highlights, prayer journal |
| Premium | Full personalization engine, Spurgeon/TSK/word study layers, trails, audio, memory verses |
| Your Edition | Everything + AI companion selection, sermon outlines, export, Year in Review |

---

## Key Design Decisions

See [`docs/adr/`](docs/adr/) for full Architecture Decision Records. Summary:

- **No native app** — PWA avoids 30% App Store cut and enables instant deploys
- **No storing licensed Bible text permanently** — ESV and API.Bible translations use TTL caches; only public domain text is stored
- **No AI image generation** — Consistency across sessions impossible; not worth quality risk
- **No public user profiles** — Privacy-first; sharing is copy-to-clipboard, not social graph
- **COPPA compliance** — Age gate on signup; no data collection on users under 13
- **Counselor guardrail is locked** — Charles will not provide mental health counseling. This is hardcoded into the system prompt and cannot be changed by user or companion customization.
- **Supabase service role never exposed to client** — All admin operations run server-side via API routes or Edge Functions

---

## Contributing

This project is in active pre-launch development. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines.

For security vulnerabilities, see [`SECURITY.md`](SECURITY.md).

---

## License

Copyright © 2026. All rights reserved.

This software is proprietary and confidential. No part of this codebase may be copied, distributed, or used in any form without explicit written permission from the copyright holder. See [`LICENSE`](LICENSE) for full terms.
