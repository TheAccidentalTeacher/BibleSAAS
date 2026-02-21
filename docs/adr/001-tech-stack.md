# ADR 001 — Tech Stack Selection

**Status:** Accepted  
**Date:** 2026-01-01  
**Author:** Project lead

---

## Context

We are building a personalized Bible study SaaS that requires:
- Mobile-first delivery without App Store dependency
- Real-time data (streaks, reading progress, shared verse threads)
- Server-side AI generation with streaming responses
- Background job execution (portrait regeneration, weekly letters, year in review)
- Strong data isolation (every user's journal and prayers are private)
- Rapid iteration without infrastructure management overhead
- Offline reading support for deployed PWA

The platform will serve users ranging from 15-year-olds on iPhones to 80-year-olds on desktop browsers. It must be installable (PWA) but must not require App Store approval for updates.

---

## Decision

**Framework:** Next.js 14 App Router  
**Backend + Auth + DB:** Supabase (managed Postgres + GoTrue Auth + Storage)  
**Hosting:** Vercel  
**AI:** Anthropic Claude API  

### Why Next.js 14 App Router over alternatives

React Server Components (RSC) allow us to keep AI-sensitive logic server-side by default. The App Router's built-in streaming supports Claude's streaming API cleanly. The file-based routing system is readable to any developer joining later. Vercel's edge network integrates with Next.js natively — no configuration needed.

Alternatives considered:
- **Remix** — Good DX, but smaller ecosystem and weaker Vercel integration for our use case
- **SvelteKit** — Compelling but the TypeScript/AI library ecosystem is less mature
- **T3 Stack** — tRPC is excellent but adds abstraction we don't need; Supabase already generates typed clients

### Why Supabase over alternatives

Supabase gives us Postgres (battle-tested), Row Level Security as a database primitive (not an ORM feature), GoTrue for auth with magic links out of the box, built-in Storage for audio/PDFs/exports, and Edge Functions for webhooks. The generated TypeScript types from `supabase gen types` remove an entire class of bugs.

The RLS model is specifically important here: every user's journal entries and prayers are isolated at the database layer, not just the API layer. An API bug cannot expose one user's data to another.

Alternatives considered:
- **PlanetScale + Clerk + S3** — More control but 4x more infrastructure to manage; no native RLS
- **Firebase** — Not relational; models this complex become painful
- **Neon + Auth.js** — Viable but no managed storage, no RLS, more setup

### Why Vercel over alternatives

Supabase + Next.js + Vercel is a known-good, zero-config deployment path. Preview deploys on every PR are critical for testing AI-generated content changes. Edge Functions for time-zone-aware cron jobs run in Vercel natively.

---

## Consequences

**Positive:**
- Zero infrastructure management; focus entirely on product
- Preview deploys enable testing personalization changes safely
- RLS at DB layer means a compromised API route can't leak other users' data
- Supabase free tier is sufficient for solo development; scales on demand

**Negative:**
- Supabase vendor lock-in: RLS policies are Postgres-specific; migrating away would require rewriting auth + security layer
- Next.js App Router is still maturing; some third-party libraries require `"use client"` wrapping
- Cold starts on serverless functions can affect first-visit AI response latency

**Mitigations:**
- Supabase is open-source (SupaBase OSS); self-hosting is possible if pricing becomes an issue
- Streaming responses partially mask cold start latency for AI calls
