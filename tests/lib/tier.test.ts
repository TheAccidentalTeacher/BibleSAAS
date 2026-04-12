import { describe, expect, it } from "vitest";
import {
  canAccess,
  getRequiredTier,
  meetsMinimumTier,
  SUBSCRIPTION_TIERS,
  TIER_LABELS,
  TIER_MARKETING,
  type SubscriptionTier,
} from "@/lib/tier";

/**
 * Tests for subscription tier gating.
 *
 * Tier rank order (ascending access):
 *   free (0) < standard (1) < premium (2) < your_edition (3)
 *
 * canAccess() is the single chokepoint for feature access —
 * all upstream API routes and UI gates must flow through it.
 */

describe("SUBSCRIPTION_TIERS constant", () => {
  it("exposes exactly 4 tiers in ascending rank order", () => {
    expect(SUBSCRIPTION_TIERS).toEqual([
      "free",
      "standard",
      "premium",
      "your_edition",
    ]);
  });
});

describe("canAccess() — free features", () => {
  const freeFeatures = [
    "web_kjv_reading",
    "vault_commentary",
    "basic_streaks",
    "offline_reading",
  ];

  it.each(freeFeatures)("every tier can access '%s'", (feature) => {
    for (const tier of SUBSCRIPTION_TIERS) {
      expect(canAccess(feature, tier)).toBe(true);
    }
  });
});

describe("canAccess() — standard-tier gated features", () => {
  const standardFeatures = [
    "esv_reading",
    "ai_questions",
    "journal",
    "highlights",
    "memory_verses",
  ];

  it.each(standardFeatures)("free tier blocked from '%s'", (feature) => {
    expect(canAccess(feature, "free")).toBe(false);
  });

  it.each(standardFeatures)("standard+ tiers allowed for '%s'", (feature) => {
    expect(canAccess(feature, "standard")).toBe(true);
    expect(canAccess(feature, "premium")).toBe(true);
    expect(canAccess(feature, "your_edition")).toBe(true);
  });
});

describe("canAccess() — premium-tier gated features", () => {
  const premiumFeatures = [
    "tsk_cross_refs",
    "word_study",
    "trails",
    "audio",
    "xp_gamification",
    "geography_map",
  ];

  it.each(premiumFeatures)("free and standard blocked from '%s'", (feature) => {
    expect(canAccess(feature, "free")).toBe(false);
    expect(canAccess(feature, "standard")).toBe(false);
  });

  it.each(premiumFeatures)("premium+ allowed for '%s'", (feature) => {
    expect(canAccess(feature, "premium")).toBe(true);
    expect(canAccess(feature, "your_edition")).toBe(true);
  });
});

describe("canAccess() — your_edition-tier gated features", () => {
  const yourEditionFeatures = [
    "companion_selection",
    "sermon_outlines",
    "data_export",
    "year_in_review",
    "weekly_charles_letters",
    "catechism_layer",
  ];

  it.each(yourEditionFeatures)(
    "only your_edition can access '%s'",
    (feature) => {
      expect(canAccess(feature, "free")).toBe(false);
      expect(canAccess(feature, "standard")).toBe(false);
      expect(canAccess(feature, "premium")).toBe(false);
      expect(canAccess(feature, "your_edition")).toBe(true);
    }
  );
});

describe("canAccess() — unknown features", () => {
  it("returns true for feature keys not in the gating table (allow-by-default)", () => {
    expect(canAccess("nonexistent_feature_xyz", "free")).toBe(true);
    expect(canAccess("", "free")).toBe(true);
  });
});

describe("getRequiredTier()", () => {
  it("returns the gating tier for a known feature", () => {
    expect(getRequiredTier("esv_reading")).toBe("standard");
    expect(getRequiredTier("tsk_cross_refs")).toBe("premium");
    expect(getRequiredTier("year_in_review")).toBe("your_edition");
  });

  it("returns 'free' for free-tier features", () => {
    expect(getRequiredTier("web_kjv_reading")).toBe("free");
  });

  it("returns null for unknown features", () => {
    expect(getRequiredTier("nonexistent_feature_xyz")).toBeNull();
  });
});

describe("meetsMinimumTier()", () => {
  it("returns true when user tier equals minimum", () => {
    expect(meetsMinimumTier("standard", "standard")).toBe(true);
  });

  it("returns true when user tier exceeds minimum", () => {
    expect(meetsMinimumTier("premium", "standard")).toBe(true);
    expect(meetsMinimumTier("your_edition", "free")).toBe(true);
  });

  it("returns false when user tier is below minimum", () => {
    expect(meetsMinimumTier("free", "standard")).toBe(false);
    expect(meetsMinimumTier("standard", "premium")).toBe(false);
    expect(meetsMinimumTier("premium", "your_edition")).toBe(false);
  });

  it("respects the full tier rank ordering", () => {
    const order: SubscriptionTier[] = [
      "free",
      "standard",
      "premium",
      "your_edition",
    ];
    for (let i = 0; i < order.length; i++) {
      for (let j = 0; j < order.length; j++) {
        expect(meetsMinimumTier(order[i]!, order[j]!)).toBe(i >= j);
      }
    }
  });
});

describe("TIER_LABELS — marketing display names", () => {
  it("provides a human label for every tier", () => {
    for (const tier of SUBSCRIPTION_TIERS) {
      expect(TIER_LABELS[tier]).toBeTypeOf("string");
      expect(TIER_LABELS[tier].length).toBeGreaterThan(0);
    }
  });
});

describe("TIER_MARKETING — pricing data", () => {
  it("includes all 4 tiers in ascending price order", () => {
    const tiers = TIER_MARKETING.map((t) => t.tier);
    expect(tiers).toEqual(["free", "standard", "premium", "your_edition"]);
  });

  it("free tier is $0 monthly and annually", () => {
    const free = TIER_MARKETING.find((t) => t.tier === "free")!;
    expect(free.price.monthly).toBe(0);
    expect(free.price.annual).toBe(0);
  });

  it("monthly price increases monotonically across paid tiers", () => {
    const paid = TIER_MARKETING.filter((t) => t.tier !== "free");
    for (let i = 1; i < paid.length; i++) {
      expect(paid[i]!.price.monthly).toBeGreaterThan(paid[i - 1]!.price.monthly);
    }
  });

  it("annual price offers savings vs 12× monthly for each paid tier", () => {
    const paid = TIER_MARKETING.filter((t) => t.tier !== "free");
    for (const tier of paid) {
      expect(tier.price.annual).toBeLessThan(tier.price.monthly * 12);
    }
  });

  it("every tier has at least one feature bullet", () => {
    for (const tier of TIER_MARKETING) {
      expect(tier.features.length).toBeGreaterThan(0);
    }
  });
});
