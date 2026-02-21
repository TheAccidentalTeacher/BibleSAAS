# ADR 002 — AI Model Selection and Routing

**Status:** Accepted  
**Date:** 2026-01-01  
**Author:** Project lead

---

## Context

The core product promise is deep personalization — the AI should know who the user is and speak directly to their life, not generically to any Bible reader. This requires:

1. **High-quality reasoning** for OIA question generation, Charles commentary, and portrait synthesis — the output is the product; a generically mediocre response breaks trust fast
2. **Cost containment** for batch operations — seeding ~3,000 lexicon entries, ~500K TSK cross-references, and weekly letters for potentially thousands of users cannot run at Sonnet prices
3. **Specific voice consistency** — "Charles" must sound like the same person across onboarding, chapter commentary, chat, and sermon outlines, regardless of which model is executing it

The decision is not just which model, but how to route different task types to the right model.

---

## Decision

**Primary model:** `claude-sonnet-4-6` (Anthropic)  
**Bulk/batch model:** `claude-haiku-4` (Anthropic)

### Routing table

| Task | Model | Reason |
|---|---|---|
| Onboarding conversation | Sonnet | First impression; must feel human and perceptive |
| OIA question generation | Sonnet | Quality of questions is the core product |
| OIA answer responses | Sonnet | Charles's response directly impacts user retention |
| Portrait regeneration | Sonnet | Synthetic profile document; errors compound |
| Chat (Ask Charles) | Sonnet | Interactive; quality visible in real time |
| Sermon outline generation | Sonnet | Used by pastors preparing sermons; stakes are high |
| Year in Review narrative | Sonnet | High-emotion personal document |
| Weekly Charles letters | Sonnet | Personal; users will re-read these |
| Word study synthesis (batch seed) | Haiku | ~3,000 entries; 20:1 cost difference justifies quality tradeoff |
| Dictionary synthesis (batch seed) | Haiku | Batch reference data; not personalized |
| Archaeological note generation | Haiku | Short, factual; low personalization requirement |

### Why not GPT-4o or Gemini

The Charles persona requires narrative consistency that benefits from a specific model family. Anthropic's Constitutional AI training aligns better with the product's need to handle spiritually sensitive content without random refusals (e.g., passages about violence, lament, doubt). Claude's longer context window also handles the 3-layer system prompt (persona + living portrait + counselor guardrail) more reliably than competing models at equivalent pricing.

### Why not fine-tuning

Fine-tuning for voice consistency was considered and rejected. The cost of maintaining a fine-tuned model as the base model updates is high. The Charles persona is defined entirely in the system prompt; this is more maintainable and can be updated without a training run.

---

## Consequences

**Positive:**
- Consistent model family → more predictable voice behavior
- Haiku for batch work reduces seed job cost by ~20x vs Sonnet
- System prompt-driven persona is updateable without redeployment

**Negative:**
- Single vendor dependency on Anthropic; if API pricing changes significantly, cost model is affected
- Haiku's shorter context window constrains what can be included in batch prompts
- No offline AI capability — all AI features require network (acceptable given online-first design)

**Future consideration:**
- Monitor whether `claude-haiku-4` quality is sufficient for word study synthesis once real user data is available; may need to upgrade specific task types to Sonnet if quality gap is noticeable
