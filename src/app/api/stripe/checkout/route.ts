/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session and returns the session URL.
 *
 * Body: {
 *   tier: "standard" | "premium" | "your_edition",
 *   interval: "monthly" | "annual",
 *   gift?: boolean,
 *   giftEmail?: string,
 *   giftMessage?: string,
 *   giftRevealAt?: string,   // ISO date string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  stripe,
  getOrCreateStripeCustomer,
  getStripePrice,
  type PaidTier,
  type BillingInterval,
} from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/server";

interface CheckoutBody {
  tier: PaidTier;
  interval: BillingInterval;
  gift?: boolean;
  giftEmail?: string;
  giftMessage?: string;
  giftRevealAt?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: CheckoutBody;
  try {
    body = await request.json() as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { tier, interval, gift = false, giftEmail, giftMessage, giftRevealAt } = body;
  const priceId = getStripePrice(tier, interval);

  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe Price ID not configured for ${tier}/${interval}` },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://biblestudy.app";

  // Get user's email and existing Stripe customer ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, stripe_customer_id, display_name")
    .eq("id", user.id)
    .single();

  const email = (profile?.email as string | null) ?? user.email ?? "";
  const existingCustomerId = profile?.stripe_customer_id as string | null;

  // Get or create Stripe customer
  const customerId = await getOrCreateStripeCustomer(user.id, email, existingCustomerId);

  // Persist customer ID if new
  if (!existingCustomerId) {
    const adminClient = createAdminClient();
    await adminClient
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // Build session metadata
  const metadata: Record<string, string> = {
    supabase_user_id: user.id,
    tier,
    interval,
  };

  if (gift && giftEmail) {
    metadata.is_gift = "true";
    metadata.gift_recipient_email = giftEmail;
    if (giftMessage) metadata.gift_message = giftMessage.slice(0, 500);
    if (giftRevealAt) metadata.gift_reveal_at = giftRevealAt;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/profile/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/profile/upgrade?cancelled=1`,
    metadata,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 7,
      metadata,
    },
  });

  return NextResponse.json({ url: session.url });
}
