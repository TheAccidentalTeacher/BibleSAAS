# Contributing

BibleSaaS is a proprietary commercial project in active pre-launch development. This is not an open-source project — contributions are limited to approved collaborators.

---

## For Approved Collaborators

### Prerequisites

- Node.js 20+
- Supabase CLI (`npm install -g supabase`)
- A Supabase project (see repo owner for dev credentials)
- All API keys filled in (see `.env.example`)

### Setup

```bash
git clone https://github.com/TheAccidentalTeacher/BibleSAAS.git
cd BibleSAAS
npm install
cp .env.example .env.local
# Fill in .env.local with provided dev credentials
npm run dev
```

### Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code; deploys to production |
| `dev` | Integration branch; deploys to staging |
| `feature/*` | Feature branches; open PRs against `dev` |
| `fix/*` | Bug fix branches |

```bash
git checkout -b feature/your-feature-name
```

### Before opening a PR

- [ ] `npm run type-check` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] All new tables have RLS enabled
- [ ] All API routes validate session server-side (not just client-side)
- [ ] No `console.log` statements left in production paths
- [ ] No new env vars added without updating `.env.example`
- [ ] No ESV text or licensed Bible text committed to the repo
- [ ] No personally identifying information in seed data or test fixtures
- [ ] If you added a background job: it logs to `cron_job_runs` and handles overlap
- [ ] If you added a Stripe webhook handler: it checks `webhook_events` for idempotency

### Code conventions

- **TypeScript strict mode** — no `any`, no `// @ts-ignore`
- **Server components by default** — only use `"use client"` when you need browser APIs or interactivity
- **No raw SQL in application code** — use the Supabase client or RPC calls
- **All AI prompts live in `src/lib/charles/`** — not scattered across route handlers
- **Reading speed** — write code for the next person reading it, not for the machine executing it

### Commit messages

Follow conventional commits:

```
feat: add prayer journal reminder toggle
fix: correct streak grace period boundary condition
chore: update Supabase client to v2.x
docs: add ADR for spaced repetition algorithm
```

---

## Not Accepting

- Feature additions not aligned with `docs/coding-plan.md`
- Changes to the `SECURITY.md` counselor guardrail provisions
- Dependencies that require App Store distribution
- Any code that permanently stores licensed Bible text (ESV, NIV, NASB, NLT, CSB)
