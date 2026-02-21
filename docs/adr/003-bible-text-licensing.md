# ADR 003 — Bible Text Licensing Strategy

**Status:** Accepted  
**Date:** 2026-01-01  
**Author:** Project lead

---

## Context

The Bible is public domain as a text, but every modern English translation is separately licensed. The most widely-used translations (ESV, NIV, NASB, NLT, CSB) are commercially licensed and impose strict technical and legal requirements for digital use.

We need to decide:
1. Which translations to offer at launch vs. later
2. How to handle the ESV's session cache requirement
3. Whether to use API.Bible for commercial translations or seek direct licenses
4. How to store (or not store) licensed text

This decision has direct consequences for the legal defensibility of the business when it moves to commercial operation.

---

## Decision

### Tier 1 — Public domain (stored permanently, free)
WEB, KJV, ASV, YLT are stored in the `chapters` table with `expires_at = NULL`. These are seeded at deploy time and never re-fetched.

### Tier 2 — ESV via ESV API (24-hour session cache, all tiers)
The ESV API terms permit caching for "session" purposes. We interpret this as a 24-hour TTL and enforce it via a `chapters.expires_at` field and a nightly cleanup job. The ESV is the default translation because it is the best combination of accuracy and readability for our target audience.

**Critical:** Commercial deployment requires written authorization from Crossway (the ESV publisher). This must be resolved before launch. Until authorized, the ESV may be used for non-commercial development only.

### Tier 3 — Commercial translations via API.Bible (Standard tier+)
NIV, NASB, NLT, CSB are fetched on-demand via the API.Bible platform. They are cached with a 1-hour TTL for session use but never permanently stored. These translations are available on Standard tier and above.

### Why not seek direct licenses from each publisher

Direct licensing (contacting Zondervan for NIV, Crossway for ESV, etc.) is the correct long-term path for high-volume commercial use. However, startup-phase traffic does not justify the overhead of individual license negotiations. API.Bible abstracts licensing for most commercial translations and is designed for exactly this use case.

### Why not use only public domain translations

Public domain translations (KJV, WEB) are sufficient for launch and for free-tier users. However, the ESV and NIV are what most modern evangelical Bible readers consider "their Bible" — offering only archaic translations at all tiers would significantly undermine user adoption and retention.

---

## Consequences

**Positive:**
- Zero risk of licensing violation for public domain translations
- API.Bible provides a clean, single-contract path to multiple commercial translations
- 24-hour ESV cache reduces API costs without violating terms

**Negative:**
- ESV requires pre-launch legal work (LLC formation + Crossway authorization)
- The API.Bible dependency means any service disruption affects all non-public-domain translations
- Caching complexity: the `chapters` table must handle three different expiry behaviors in the same table

**Non-negotiable:**
- We will never permanently store ESV, NIV, NASB, NLT, or CSB text in the database
- The offline mode (Dexie.js / IndexedDB) is WEB/KJV only — no commercial translation text may be cached offline
- Every page that displays ESV text must include the required copyright attribution line

**Pre-launch checklist:**
- [ ] Form LLC or equivalent legal entity
- [ ] Submit ESV commercial licensing request to Crossway
- [ ] Confirm API.Bible commercial tier terms allow our subscription model
