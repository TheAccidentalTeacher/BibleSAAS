## Summary

<!-- One sentence: what does this PR do? -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (changes an existing API, DB schema, or behavior)
- [ ] Chore / refactor / docs

## Phase reference

<!-- Which phase in docs/coding-plan.md does this work belong to? -->
Phase: 

## Changes

<!-- What did you change? Why? -->

## Testing

<!-- How did you test this? -->

- [ ] Tested locally with `npm run dev`
- [ ] Tested against Supabase local instance (`supabase start`)
- [ ] Tested on mobile viewport
- [ ] Tested while unauthenticated (confirmed protected routes redirect correctly)

## Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes with no warnings
- [ ] All new tables have RLS enabled
- [ ] No `console.log` in production paths
- [ ] No sensitive data in test fixtures or seed files
- [ ] `.env.example` updated if new env vars were added
- [ ] `docs/sql/README.md` updated if schema changed
- [ ] If Stripe webhook handler added: idempotency check against `webhook_events` included
- [ ] If background job added: logs to `cron_job_runs` and has overlap guard
- [ ] No licensed Bible text (ESV, NIV, NASB, NLT, CSB) permanently stored

## Screenshots / recordings

<!-- For UI changes, include before/after screenshots or a screen recording -->
