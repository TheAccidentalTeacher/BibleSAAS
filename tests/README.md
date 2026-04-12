# Tests

Automated unit tests for BibleSaaS, powered by [Vitest](https://vitest.dev).

## Running

```bash
npm test              # run the full suite once
npm run test:watch    # re-run on file changes during development
npm run test:coverage # generate an lcov/html coverage report in coverage/
```

## Layout

```
tests/
└── lib/
    ├── sm2.test.ts              SM-2 spaced repetition algorithm
    ├── tier.test.ts             Subscription tier gating / canAccess
    ├── bible.test.ts            USFM codes, chapter navigation, formatting
    ├── xp.test.ts               XP amounts and level thresholds
    ├── achievements.test.ts     Achievement unlock predicate
    └── charles-prompts.test.ts  Charles prompt composition + guardrails
```

## Scope

The current suite targets **pure-logic modules** — functions with no database
or network I/O. These are the highest-leverage targets because:

1. Logic errors here silently corrupt user progress (spaced-repetition
   intervals, streak calculations, level thresholds).
2. Prompt composition tests lock in critical product invariants (no-profanity
   guardrail, banned stock phrases, personalization delivery).
3. Tier-gating regressions are subscription revenue risks.
4. They run in milliseconds with zero infrastructure.

## Out of scope (for now)

- **API route handlers** — require mocking Supabase, Anthropic, Stripe, and
  Resend clients. Introduce as integration tests with `msw` when needed.
- **React components** — most UI is Server Components; introduce
  `@testing-library/react` + `jsdom` environment when interactive client
  components need regression coverage.
- **End-to-end flows** — use Playwright against a Supabase test project for
  auth, reading, journaling, and Stripe webhook paths.

## Conventions

- File names: `<module>.test.ts` mirroring `src/lib/<module>.ts`.
- Use `vi.useFakeTimers()` for any code that reads `Date.now()` or `new Date()`.
- Mock server-only modules (`next/headers`, `@/lib/supabase/server`) via
  `vi.mock()` at the top of the test file.
- Prefer `describe` blocks that name the behaviour being tested, not the
  function being called. (The function name is obvious; the *contract* isn't.)
- Use sentinel Unicode characters (e.g. `\u0467`) when asserting on string
  truncation to avoid accidental collisions with template text.
