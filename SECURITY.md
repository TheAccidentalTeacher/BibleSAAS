# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in BibleSaaS, **please do not open a public GitHub issue.**

Report vulnerabilities privately by emailing the repository owner directly (see GitHub profile for contact).

Include in your report:
- Description of the vulnerability and its potential impact
- Steps to reproduce
- Any proof-of-concept code (if applicable)
- Your suggested remediation (optional but appreciated)

You will receive an acknowledgment within 48 hours. We aim to address confirmed vulnerabilities within 7 days for critical issues and 30 days for others.

---

## Scope

The following assets are in scope:

| Asset | Notes |
|---|---|
| Application code (Next.js routes, API routes) | All environments |
| Database RLS policies | Supabase Postgres |
| Authentication flows | Magic link, session handling |
| Stripe webhook handler | Payment integrity |
| AI prompt injection | Claude API routes |

Out of scope:
- Supabase infrastructure itself (report to Supabase)
- Vercel infrastructure (report to Vercel)
- Stripe infrastructure (report to Stripe)
- Social engineering attacks targeting users

---

## Security-Sensitive Areas

This application handles:

- **User journal entries and prayers** — highly personal content; treat with extreme sensitivity
- **Minor users** — COPPA compliance required; users under 13 must not be able to create accounts
- **Payment data** — handled entirely by Stripe; no card data ever touches our servers
- **AI-generated content** — prompt injection is a real threat surface; the counselor guardrail in the system prompt must never be overridable
- **Gifted accounts** — a gift-giver can write a personal letter to a recipient; ensure no XSS or content injection is possible

---

## Known Security Decisions

| Decision | Rationale |
|---|---|
| Supabase service role key never exposed to client | All admin operations run server-side only |
| RLS on every user table | Defense in depth — API bugs don't expose other users' data |
| Stripe webhook idempotency via `webhook_events` table | Prevents double-billing from replayed webhooks |
| ESV text cached with TTL, not permanently | License compliance; also reduces attack surface for bulk scraping |
| Counselor guardrail hardcoded in system prompt | User safety; cannot be bypassed via companion customization or user input |
| Age gate on signup | COPPA compliance for users under 13 |

---

## Supported Versions

This project is in pre-launch development. Security fixes will be applied to the `main` branch only.
