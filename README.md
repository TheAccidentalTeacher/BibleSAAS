# BibleSaaS

> A personalized, AI-powered study Bible platform. Every user gets their own edition — same Scripture, radically different experience based on who they are.

Built with Next.js 14 App Router · Supabase · Anthropic Claude · Vercel · Stripe

[![CI](https://github.com/TheAccidentalTeacher/BibleSAAS/actions/workflows/ci.yml/badge.svg)](https://github.com/TheAccidentalTeacher/BibleSAAS/actions/workflows/ci.yml)

---

## What This Is

BibleSaaS is a mobile-first web platform (PWA) where the AI layer knows who you are and tailors everything — commentary, questions, passage connections, and tone — to your life, history, and interests. A 15-year-old athlete and a 70-year-old prayer warrior open the same chapter and see genuinely different study experiences.

**The product is not "AI added to a Bible app." The product is the personalization engine.** The Bible text is the constant; how it lands is the variable.

### Core features (planned)

- **Conversational onboarding** — Charles (the AI persona) learns who you are before showing you anything
- **OIA study system** — Observe, Interpret, Apply questions tuned to the individual user
- **Living portrait** — AI-maintained profile updated across every journal entry and session; drives all personalization
- **TSK cross-reference trails** — Treasury of Scripture Knowledge graph, surfaced as navigable trails
- **Full commentary library** — Spurgeon, Matthew Henry, Calvin, Adam Clarke, all synthesized by Charles
- **Memory verse system** — SM-2 spaced repetition with typing and cloze practice modes
- **Prayer journal** — Category-tagged prayers with follow-up and answered-prayer tracking
- **Audio Bible** — Narrated chapters with read-along verse highlighting
- **Your Edition PDF** — Personalized exportable study Bible with the user's own highlights and journal
- **Gamification layer** — Streaks, XP, levels, hidden achievements (opt-out for users who don't want it)
- **Gifted accounts** — One user gifts a personalized edition to someone else, including a personal letter

### The AI companion

**Charles** is the theological voice of the platform — named for C.H. Spurgeon, grounded in Ladd's Kingdom framework and MacArthur's exegetical rigor, but speaking in a modern voice that sounds like none of them. He adapts radically per user. See [`docs/charles-persona.md`](docs/charles-persona.md) for the full spec.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 App Router | RSC + streaming, file-based routing, Vercel-native |
| Database + Auth | Supabase (Postgres + GoTrue) | RLS, real-time, storage, Edge Functions, managed |
| AI | Anthropic Claude (`claude-sonnet-4-6`, `claude-haiku-4`) | Best-in-class reasoning; Sonnet for personalization, Haiku for bulk jobs |
| Hosting | Vercel | Preview deploys, edge functions, zero-config Next.js |
| Payments | Stripe | Subscriptions + one-time purchases + gifting |
| Email | Resend | Transactional email (magic links, weekly letters, year-in-review) |
| Styling | Tailwind CSS | Utility-first; pairs well with design token system |
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

> **Pre-development.** The repository currently contains the complete technical specification, database schema, and phase-by-phase coding plan. Application code begins in Phase 0.

| Artifact | Status |
|---|---|
| Database schema (13 files, ~60 tables) | ✅ Complete |
| Phase-by-phase coding plan (27 phases) | ✅ Complete |
| AI persona specification | ✅ Complete |
| Application code | 🔜 Phase 0 |

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
│   ├── charles-persona.md       # AI companion personality and theological DNA spec
│   └── adr/                     # Architecture Decision Records
│       ├── 001-tech-stack.md
│       ├── 002-ai-model-selection.md
│       ├── 003-bible-text-licensing.md
│       └── 004-personalization-architecture.md
├── sql/                         # Human-readable schema documentation
│   ├── README.md                # Table index and design principles
│   ├── 01-core-auth-profiles.md
│   ├── 02-reading-plans.md
│   └── ...                      # 13 files total
├── supabase/                    # Supabase project files
│   ├── config.toml
│   └── migrations/              # Executable .sql migration files (extracted from sql/ docs)
│       └── README.md            # How to run migrations
├── scripts/                     # Seed scripts (run once at deploy time)
│   ├── extract-migrations.ts    # Generates supabase/migrations/*.sql from sql/*.md
│   ├── seed-translations.ts     # WEB, KJV, ASV, YLT chapter data
│   ├── seed-tsk.ts              # Treasury of Scripture Knowledge (~500K cross-reference pairs)
│   ├── seed-strongs.ts          # Strong's Hebrew + Greek lexicon
│   ├── seed-spurgeon.ts         # Morning & Evening + Treasury of David
│   ├── seed-commentaries.ts     # Matthew Henry, Calvin, Adam Clarke
│   ├── seed-catechism.ts        # Westminster Shorter/Larger, Heidelberg
│   └── ...                      # See docs/coding-plan.md Phase 0 for full list
├── .env.example                 # Environment variable template
├── CONTRIBUTING.md
├── LICENSE
└── SECURITY.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- A [Stripe](https://stripe.com) account (for payment features; skip for local dev)
- An [ESV API](https://api.esv.org) key (free tier for development)
- A [Resend](https://resend.com) account

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

Run migrations in order via the Supabase SQL editor or Supabase CLI:

```bash
# Using Supabase CLI
supabase db push

# Or manually: run each file in supabase/migrations/ in sequence
```

> **Note:** Full migration extraction from `sql/` docs is part of Phase 0. See [`docs/coding-plan.md`](docs/coding-plan.md#phase-0--foundation--infrastructure) Step 0.3.

### 4. Seed public domain data

```bash
# Seed Bible translations (WEB, KJV, ASV, YLT)
npx ts-node scripts/seed-translations.ts

# Seed cross-reference data, commentaries, lexicon, etc.
# See docs/coding-plan.md Phase 0.6 for the full order
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
| Onboarding chat, OIA responses, sermon outlines, chat | `claude-sonnet-4-6` | Quality, reasoning depth |
| Portrait regeneration | `claude-sonnet-4-6` | User-facing output must be high quality |
| Word study synthesis (batch) | `claude-haiku-4` | ~3,000 lexicon entries; cost-sensitive |
| Weekly letters, Year in Review | `claude-sonnet-4-6` | Personal narrative; quality matters |

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
