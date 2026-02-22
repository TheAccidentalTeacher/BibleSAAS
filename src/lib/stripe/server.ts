/**
 * src/lib/stripe/server.ts — Stripe server-side SDK instance
 *
 * All server-side Stripe operations import from this module.
 * Never import from this module in client components.
 */

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
  appInfo: {
    name: "Bible Study App",
    version: "1.0.0",
  },
});

// ── Tier → Price ID mapping ────────────────────────────────────────────────
// Set these in Vercel / .env.local after creating products in Stripe dashboard

export const STRIPE_PRICES = {
  standard: {
    monthly: process.env.STRIPE_PRICE_STANDARD_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_STANDARD_ANNUAL ?? "",
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL ?? "",
  },
  your_edition: {
    monthly: process.env.STRIPE_PRICE_YOUR_EDITION_MONTHLY ?? "",
    annual: process.env.STRIPE_PRICE_YOUR_EDITION_ANNUAL ?? "",
  },
} as const;

export type PaidTier = "standard" | "premium" | "your_edition";
export type BillingInterval = "monthly" | "annual";

/** Get the Stripe Price ID for a tier + interval combo */
export function getStripePrice(tier: PaidTier, interval: BillingInterval): string {
  return STRIPE_PRICES[tier][interval];
}

/** Get or create a Stripe customer for a user */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  return customer.id;
}
