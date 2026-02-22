/**
 * POST /api/stripe/webhook
 *
 * Receives and verifies Stripe webhook events.
 * Handles:
 *  - checkout.session.completed   → activate / gift subscription
 *  - customer.subscription.updated → update tier + renewal date
 *  - customer.subscription.deleted → downgrade to free
 *  - invoice.payment_failed        → send grace-period email
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/server";
// email import reserved for future payment-failure template

export const dynamic = "force-dynamic";

// Map Stripe price IDs → tier name
function priceIdToTier(priceId: string): string {
  const env = process.env;
  const map: Record<string, string> = {
    [env.STRIPE_PRICE_STANDARD_MONTHLY ?? ""]: "standard",
    [env.STRIPE_PRICE_STANDARD_ANNUAL ?? ""]: "standard",
    [env.STRIPE_PRICE_PREMIUM_MONTHLY ?? ""]: "premium",
    [env.STRIPE_PRICE_PREMIUM_ANNUAL ?? ""]: "premium",
    [env.STRIPE_PRICE_YOUR_EDITION_MONTHLY ?? ""]: "your_edition",
    [env.STRIPE_PRICE_YOUR_EDITION_ANNUAL ?? ""]: "your_edition",
  };
  return map[priceId] ?? "standard";
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function activateSubscription(
  supabaseUserId: string,
  tier: string,
  stripeSubscriptionId: string,
  currentPeriodEnd: number,
) {
  const adminClient = createAdminClient();
  const expiresAt = new Date(currentPeriodEnd * 1000).toISOString();
  await adminClient
    .from("profiles")
    .update({
      subscription_tier: tier,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_expires_at: expiresAt,
    })
    .eq("id", supabaseUserId);
}

async function handleGiftActivation(
  session: Stripe.Checkout.Session,
  subscriptionId: string,
  currentPeriodEnd: number,
) {
  const adminClient = createAdminClient();
  const meta = session.metadata ?? {};
  const giftRecipientEmail = meta.gift_recipient_email;
  const giftMessage = meta.gift_message ?? null;
  const giftRevealAt = meta.gift_reveal_at ?? null;
  const giftedBy = meta.supabase_user_id;
  const tier = meta.tier ?? "standard";

  if (!giftRecipientEmail) return;

  // Look up or create the recipient account
  const { data: recipient } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", giftRecipientEmail)
    .maybeSingle();

  if (!recipient) {
    // Can't auto-create—store gift for onboarding pickup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient as any).from("pending_gifts").insert({
      gifted_by: giftedBy,
      recipient_email: giftRecipientEmail,
      tier,
      stripe_subscription_id: subscriptionId,
      subscription_expires_at: new Date(currentPeriodEnd * 1000).toISOString(),
      gift_message: giftMessage,
      gift_reveal_at: giftRevealAt,
    });
    return;
  }

  await adminClient
    .from("profiles")
    .update({
      subscription_tier: tier,
      stripe_subscription_id: subscriptionId,
      subscription_expires_at: new Date(currentPeriodEnd * 1000).toISOString(),
      gifted_by: giftedBy,
      gifted_message: giftMessage,
      gifted_message_visible: giftRevealAt ? false : true,
      gifted_reveal_at: giftRevealAt,
    })
    .eq("id", recipient.id);
}

// ── main handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  try {
    switch (event.type) {
      // ── Checkout completed ────────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id ?? "";
        const tier = (session.metadata?.tier) ?? priceIdToTier(priceId);
        const currentPeriodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;

        if (session.metadata?.is_gift === "true") {
          await handleGiftActivation(session, subscriptionId, currentPeriodEnd);
        } else {
          const userId = session.metadata?.supabase_user_id;
          if (userId) {
            await activateSubscription(userId, tier, subscriptionId, currentPeriodEnd);
          }
        }
        break;
      }

      // ── Subscription updated ──────────────────────────────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id ?? "";
        const tier = priceIdToTier(priceId);
        const currentPeriodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;
        const expiresAt = new Date(currentPeriodEnd * 1000).toISOString();

        // Find the profile by subscription ID
        const { data: profile } = await adminClient
          .from("profiles")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        if (profile) {
          await adminClient
            .from("profiles")
            .update({
              subscription_tier: tier,
              subscription_expires_at: expiresAt,
            })
            .eq("id", profile.id);
        }
        break;
      }

      // ── Subscription deleted (cancelled + expired) ─────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: profile } = await adminClient
          .from("profiles")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        if (profile) {
          await adminClient
            .from("profiles")
            .update({
              subscription_tier: "free",
              stripe_subscription_id: null,
              subscription_expires_at: null,
            })
            .eq("id", profile.id);
        }
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted) break;

        const email = (customer as Stripe.Customer).email;
        if (!email) break;

        // TODO: send payment-failure email once a dedicated template is created
        console.warn(`Payment failed for customer ${customerId}, email: ${email}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
