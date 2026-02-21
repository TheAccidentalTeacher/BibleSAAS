# 13 — Operations & Infrastructure

Background job safety, Stripe idempotency, and resumable seed scripts.
These tables have **no user-facing UI** but are required for production reliability.
See `coding-plan.md` Appendix D (Implementation Risk Controls) for full context.

---

```sql
-- ============================================================
-- WEBHOOK EVENTS (Stripe idempotency log)
-- Appendix D Risk #8: every Stripe webhook handler must check this table
-- before acting. Insert on first receipt; reject duplicates.
-- Retention: rows older than 90 days are deleted by weekly cron job.
-- ============================================================
CREATE TABLE webhook_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Stripe event id — globally unique per event (e.g. 'evt_1OxABC...')
  stripe_event_id text NOT NULL UNIQUE,
  event_type      text NOT NULL,               -- 'checkout.session.completed', 'customer.subscription.deleted', etc.
  -- Processing state
  status          text NOT NULL DEFAULT 'processing'
                    CHECK (status IN ('processing', 'succeeded', 'failed', 'ignored')),
  error_message   text,                        -- populated when status = 'failed'
  -- Payload snapshot (full Stripe event object for debugging / replay)
  payload         jsonb NOT NULL DEFAULT '{}',
  -- Timing
  received_at     timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz,                 -- NULL until handler completes
  -- Unique constraint ensures exactly-once processing
  -- Handler pattern:
  --   INSERT INTO webhook_events (stripe_event_id, ...) ON CONFLICT DO NOTHING
  --   RETURNING id  →  if no row returned, event was already processed; return 200 early
  CONSTRAINT stripe_event_id_not_empty CHECK (stripe_event_id <> '')
);

CREATE INDEX idx_webhook_events_received ON webhook_events(received_at DESC);
CREATE INDEX idx_webhook_events_status ON webhook_events(status) WHERE status IN ('processing', 'failed');

-- No RLS — service-role only. Never exposed to client.


-- ============================================================
-- CRON JOB RUNS (background job audit log)
-- Appendix D Risk #10: every background job records start/end/result here.
-- Enables: duplicate-run detection, alerting on failure, timing analysis.
-- Jobs: portrait_regen, stripe_sync, birthday_letters, weekly_letters,
--       year_in_review, esv_cache_expiry, seed_runner, stats_cache, etc.
-- Retention: rows older than 180 days deleted by weekly cleanup job.
-- ============================================================
CREATE TABLE cron_job_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name        text NOT NULL,               -- 'portrait_regen', 'stripe_sync', 'birthday_letters', etc.
  -- Guard: if a row exists for this job with status='running' started within the
  -- last N minutes, the new invocation should abort to prevent overlap.
  status          text NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running', 'succeeded', 'failed', 'skipped')),
  -- Scope (optional): used by jobs that operate in batches
  -- e.g. {'user_id': 'uuid', 'batch_number': 3, 'environment': 'production'}
  scope           jsonb DEFAULT '{}',
  -- Result summary (populated on completion)
  rows_processed  integer DEFAULT 0,
  rows_skipped    integer DEFAULT 0,
  error_message   text,
  -- Timing
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,                 -- NULL while running
  duration_ms     integer                      -- populated from (completed_at - started_at) by handler
);

CREATE INDEX idx_cron_runs_job_name ON cron_job_runs(job_name, started_at DESC);
CREATE INDEX idx_cron_runs_status ON cron_job_runs(status) WHERE status = 'running';
CREATE INDEX idx_cron_runs_started ON cron_job_runs(started_at DESC);

-- No RLS — service-role only.


-- ============================================================
-- SEED CHECKPOINTS (resumable seed script progress)
-- Appendix D Risk #5: large seed scripts (WEB/KJV import, strongs_lexicon,
-- spurgeon_index, commentary_entries, geography) take 30-60 minutes.
-- If interrupted, re-running from scratch wastes time and risks duplicates.
-- Each seed script logs its progress here and resumes from last checkpoint.
-- ============================================================
CREATE TABLE seed_checkpoints (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seed_name       text NOT NULL UNIQUE,        -- 'web_kjv_chapters', 'strongs_lexicon', 'spurgeon_index',
                                               -- 'commentary_entries', 'geography', 'catechism', etc.
  -- Resumable cursor: the last successfully processed item identifier.
  -- Shape depends on seed. Examples:
  --   web_kjv_chapters:   { "last_book": "PSA", "last_chapter": 119 }
  --   strongs_lexicon:    { "last_strongs_number": "H3068" }
  --   commentary_entries: { "last_row_id": 48291 }
  last_checkpoint jsonb NOT NULL DEFAULT '{}',
  -- Progress counters
  rows_inserted   integer NOT NULL DEFAULT 0,
  rows_skipped    integer NOT NULL DEFAULT 0,  -- already existed (idempotent re-run)
  -- Status
  status          text NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'complete', 'failed')),
  error_message   text,
  -- Timing
  started_at      timestamptz NOT NULL DEFAULT now(),
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz
);

CREATE INDEX idx_seed_checkpoints_name ON seed_checkpoints(seed_name);

-- No RLS — service-role only (accessed by seed scripts via SUPABASE_SERVICE_ROLE_KEY).
```

---

## Usage Patterns

### webhook_events — Exactly-once Stripe processing
```typescript
// In: app/api/webhooks/stripe/route.ts
const { rows } = await supabase.rpc('insert_webhook_if_new', {
  p_stripe_event_id: event.id,
  p_event_type:      event.type,
  p_payload:         event,
});
if (rows.length === 0) {
  // Already processed — idempotent early return
  return new Response('ok', { status: 200 });
}
// ... handle event ...
await supabase
  .from('webhook_events')
  .update({ status: 'succeeded', processed_at: new Date().toISOString() })
  .eq('stripe_event_id', event.id);
```

### cron_job_runs — Overlap guard pattern
```typescript
// In any background job handler
const runId = await startJobRun('portrait_regen');   // inserts row, checks for existing 'running' row
if (!runId) return;                                   // overlap detected — abort
try {
  const count = await doWork();
  await completeJobRun(runId, { rows_processed: count });
} catch (e) {
  await failJobRun(runId, e.message);
}
```

### seed_checkpoints — Resume from cursor
```typescript
// In: scripts/seed-web-kjv.ts
const checkpoint = await getCheckpoint('web_kjv_chapters');
const startBook  = checkpoint?.last_checkpoint?.last_book ?? 'GEN';
const startChap  = checkpoint?.last_checkpoint?.last_chapter ?? 0;
// ... process chapters starting from cursor ...
await updateCheckpoint('web_kjv_chapters', { last_book: book, last_chapter: chapter });
```
