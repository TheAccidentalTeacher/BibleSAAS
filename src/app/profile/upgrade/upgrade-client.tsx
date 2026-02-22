"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Gift, Loader2, Star } from "lucide-react";
import { TIER_MARKETING } from "@/lib/tier";
import type { SubscriptionTier } from "@/lib/tier";

interface UpgradeClientProps {
  currentTier: SubscriptionTier;
}

type Interval = "monthly" | "annual";

export default function UpgradeClient({ currentTier }: UpgradeClientProps) {
  const router = useRouter();
  const [interval, setInterval] = useState<Interval>("annual");
  const [loading, setLoading] = useState<string | null>(null);

  // Gift state
  const [isGift, setIsGift] = useState(false);
  const [giftTier, setGiftTier] = useState<string | null>(null);
  const [giftEmail, setGiftEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [giftRevealAt, setGiftRevealAt] = useState("");

  async function handleSubscribe(tier: string) {
    setLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          interval,
          gift: isGift && giftTier === tier,
          giftEmail: isGift && giftTier === tier ? giftEmail : undefined,
          giftMessage: isGift && giftTier === tier ? giftMessage : undefined,
          giftRevealAt: isGift && giftTier === tier ? giftRevealAt : undefined,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        router.push(data.url);
      } else {
        alert(data.error ?? "Something went wrong");
      }
    } catch {
      alert("Failed to start checkout");
    } finally {
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) router.push(data.url);
    } finally {
      setLoading(null);
    }
  }

  const savings = Math.round((1 - 79 / (9 * 12)) * 100); // ~27%

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#C4A040] text-sm font-semibold uppercase tracking-widest mb-2">
            Upgrade your study
          </p>
          <h1 className="text-3xl font-bold text-[#E8E0D4] mb-3">
            Choose your plan
          </h1>
          <p className="text-[#8A7F72] max-w-md mx-auto text-sm leading-relaxed">
            Every plan begins with a 7-day free trial. Cancel anytime.
          </p>
        </div>

        {/* Interval toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2C2C2C] rounded-full p-1">
            <button
              onClick={() => setInterval("monthly")}
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all ${
                interval === "monthly"
                  ? "bg-[#C4A040] text-[#0D0D0D]"
                  : "text-[#8A7F72] hover:text-[#E8E0D4]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("annual")}
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all flex items-center gap-2 ${
                interval === "annual"
                  ? "bg-[#C4A040] text-[#0D0D0D]"
                  : "text-[#8A7F72] hover:text-[#E8E0D4]"
              }`}
            >
              Annual
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  interval === "annual"
                    ? "bg-[#0D0D0D] text-[#C4A040]"
                    : "bg-[#C4A040]/20 text-[#C4A040]"
                }`}
              >
                −{savings}%
              </span>
            </button>
          </div>
        </div>

        {/* Gift toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsGift((v) => !v)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-all ${
              isGift
                ? "border-[#C4A040] text-[#C4A040] bg-[#C4A040]/10"
                : "border-[#2C2C2C] text-[#8A7F72] hover:border-[#C4A040] hover:text-[#C4A040]"
            }`}
          >
            <Gift size={14} />
            {isGift ? "Cancel gift" : "Give as a gift"}
          </button>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIER_MARKETING.map((plan) => {
            const isCurrent = plan.tier === currentTier;
            const price =
              interval === "annual" ? plan.price.annual : plan.price.monthly;
            const isHighlight = "highlight" in plan && plan.highlight;
            const isLoadingThis = loading === plan.tier;
            const isGiftTarget = isGift && giftTier === plan.tier;

            return (
              <div
                key={plan.tier}
                className={`relative flex flex-col rounded-2xl border p-5 transition-all ${
                  isHighlight
                    ? "border-[#C4A040] bg-[#1A1A1A]"
                    : "border-[#2C2C2C] bg-[#141414]"
                } ${isCurrent ? "opacity-80" : ""}`}
              >
                {isHighlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 bg-[#C4A040] text-[#0D0D0D] text-xs font-bold px-3 py-0.5 rounded-full">
                      <Star size={10} fill="currentColor" />
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#2C2C2C] text-[#8A7F72] text-xs font-semibold px-3 py-0.5 rounded-full">
                      Current plan
                    </span>
                  </div>
                )}

                {/* Plan name + tagline */}
                <div className="mb-4">
                  <h2 className="text-[#E8E0D4] font-bold text-lg">{plan.name}</h2>
                  <p className="text-[#6B6056] text-xs mt-0.5 leading-snug">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {price === 0 ? (
                    <span className="text-[#E8E0D4] text-3xl font-bold">Free</span>
                  ) : interval === "annual" ? (
                    <>
                      <span className="text-[#E8E0D4] text-3xl font-bold">
                        ${Math.round(price / 12)}
                      </span>
                      <span className="text-[#6B6056] text-sm">/mo</span>
                      <div className="text-[#8A7F72] text-xs mt-0.5">
                        billed ${price}/yr
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-[#E8E0D4] text-3xl font-bold">${price}</span>
                      <span className="text-[#6B6056] text-sm">/mo</span>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2 mb-5">
                  {(plan.features as readonly string[]).map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-[#B8AFA4]">
                      <Check size={12} className="text-[#C4A040] mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  plan.tier !== "free" ? (
                    <button
                      onClick={handleManageBilling}
                      disabled={loading === "portal"}
                      className="w-full py-2 rounded-lg border border-[#2C2C2C] text-[#8A7F72] text-sm hover:border-[#C4A040] hover:text-[#C4A040] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading === "portal" && <Loader2 size={13} className="animate-spin" />}
                      Manage billing
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-lg border border-[#2C2C2C] text-[#6B6056] text-sm text-center">
                      Free forever
                    </div>
                  )
                ) : plan.cta ? (
                  <div>
                    <button
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={!!loading}
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                        isHighlight
                          ? "bg-[#C4A040] text-[#0D0D0D] hover:bg-[#D4B050]"
                          : "bg-[#1E1E1E] border border-[#3C3C3C] text-[#E8E0D4] hover:border-[#C4A040]"
                      }`}
                    >
                      {isLoadingThis && <Loader2 size={13} className="animate-spin" />}
                      {plan.cta}
                    </button>

                    {/* Gift sub-form */}
                    {isGift && (
                      <div className="mt-3">
                        <button
                          onClick={() =>
                            setGiftTier((prev) =>
                              prev === plan.tier ? null : plan.tier
                            )
                          }
                          className="text-xs text-[#C4A040] underline underline-offset-2 mb-2"
                        >
                          {isGiftTarget ? "Hide gift options" : "Gift this plan →"}
                        </button>
                        {isGiftTarget && (
                          <div className="space-y-2">
                            <input
                              type="email"
                              placeholder="Recipient email"
                              value={giftEmail}
                              onChange={(e) => setGiftEmail(e.target.value)}
                              className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-[#E8E0D4] placeholder:text-[#4A4A4A] focus:outline-none focus:border-[#C4A040]"
                            />
                            <textarea
                              placeholder="Gift message (optional)"
                              value={giftMessage}
                              onChange={(e) => setGiftMessage(e.target.value)}
                              rows={2}
                              className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-[#E8E0D4] placeholder:text-[#4A4A4A] focus:outline-none focus:border-[#C4A040] resize-none"
                            />
                            <div>
                              <label className="text-[#6B6056] text-xs block mb-1">
                                Reveal date (optional)
                              </label>
                              <input
                                type="date"
                                value={giftRevealAt}
                                onChange={(e) => setGiftRevealAt(e.target.value)}
                                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-3 py-1.5 text-xs text-[#E8E0D4] focus:outline-none focus:border-[#C4A040]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-[#4A4040] text-xs mt-8">
          Prices in USD. Cancel anytime from your profile. Gifts are non-refundable.
        </p>
      </div>
    </div>
  );
}
