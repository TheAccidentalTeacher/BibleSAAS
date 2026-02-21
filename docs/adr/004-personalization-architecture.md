# ADR 004 — Personalization Architecture

**Status:** Accepted  
**Date:** 2026-01-01  
**Author:** Project lead

---

## Context

The core product promise is that "your Bible looks like yours." This requires an AI layer that:
1. Knows who the user is (interests, life stage, faith background, vocation, personality)
2. Updates that knowledge as the user engages with the app over time
3. Uses that knowledge to shape every piece of AI-generated content (questions, commentary, connections)
4. Does this without burdening the user with form-filling or explicit preference management

The design problem: how do you represent a complex human being as input to a language model, and how do you keep that representation fresh without running a model call on every page view?

---

## Decision

### The Living Portrait model

User knowledge is maintained as two columns on the `profiles` table:

- `living_portrait` (text) — A narrative paragraph written in second person ("You are a 15-year-old who..."), ready to be injected directly into Claude's system prompt as the user briefing.
- `living_portrait_json` (jsonb) — A structured breakdown of the same information: identity lenses, faith journey, study patterns, life season, tone notes, family context, notable insights.

The `text` field is used at inference time (prompt injection). The `json` field is used for app display ("What Charles knows about you") and as input to regeneration.

### Trigger: Every 5-8 journal entries

Portrait regeneration is triggered by a background job that monitors `journal_entries` counts. The job runs on a schedule and looks for users whose `journal_entries_since_last_generation` exceeds the threshold.

This threshold was chosen because:
- Too frequent (every entry): unnecessary API cost; the portrait doesn't change meaningfully in one session
- Too infrequent (every 30+ entries): the portrait goes stale; the user changes and Charles doesn't notice

### Cache invalidation via profile_hash

Personalized content (OIA questions, Charles commentary, connections) is generated once per `(user × chapter)` and stored in the `personalized_content` table. The question is: when should this content be regenerated?

Answer: when the portrait changes substantially. We compute a `profile_hash` (SHA-256 of the key personalization columns on `profiles`) and store it alongside the generated content. When the portrait is regenerated, `profile_hash` updates. The next time the user opens a chapter, the content system detects the mismatch and regenerates.

This means users who haven't visited a chapter in 6 months will see refreshed content reflecting who they are today, not who they were at first study.

### 3-layer system prompt

Every Charles API call assembles three layers:

1. **Static persona layer** (~400 tokens) — The Charles voice spec; loaded from `charles-persona.md` at build time
2. **Living portrait layer** (variable, ~200-500 tokens) — From `profiles.living_portrait`; this is what makes the content personal
3. **Counselor guardrail layer** (~100 tokens) — Hard-coded safety instructions; never modifiable by user input

These three layers compose the system prompt. The user's question or chapter context is the user turn.

---

## Consequences

**Positive:**
- Users never manage preferences explicitly; the system infers and maintains them
- Profile evolution is continuous and invisible (it just gets better over time)
- The `profile_hash` pattern prevents unnecessary AI generation without complex versioning
- The 3-layer prompt is auditable and testable; each layer can be evaluated independently
- The counselor guardrail being a fixed layer means it cannot be jailbroken by customizing the living portrait

**Negative:**
- Portrait regeneration adds latency to study sessions (it runs in background, but must complete before content is "fresh")
- The SHA-256 hash approach only detects changes, not which kind of change — minor profile edits (typo fix) will trigger regeneration
- Narrative portrait can drift in unexpected directions if journal content is unusual or adversarial; periodic review mechanism needed

**What this is NOT:**

This is not a recommendation engine (we are not trying to guess what content the user "wants"). It is a personalization layer that makes the content the user IS showing more relevant to who they ARE. The Scripture determines what they read; the portrait determines how it lands.

**Future consideration:**
- Evaluate whether `living_portrait_json` structured output enables more targeted cache invalidation (only regenerate if the changed field is one that matters for this specific chapter)
