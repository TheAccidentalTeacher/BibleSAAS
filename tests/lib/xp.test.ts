import { describe, expect, it } from "vitest";
import { XP_AMOUNTS, getLevelForXp } from "@/lib/xp";

/**
 * Tests for the XP / levelling system.
 *
 * LEVEL_TABLE (from xp.ts):
 *   Level 1 — Seeker    (0 XP)
 *   Level 2 — Reader    (100 XP)
 *   Level 3 — Student   (300 XP)
 *   Level 4 — Disciple  (600 XP)
 *   Level 5 — Faithful  (1,000 XP)
 *   Level 6 — Scholar   (2,000 XP)
 *   Level 7 — Sage      (4,000 XP)
 *   Level 8 — Witness   (8,000 XP)  ← max level
 */

describe("XP_AMOUNTS — point awards", () => {
  it("exposes non-negative awards for every named event", () => {
    for (const key of Object.keys(XP_AMOUNTS)) {
      expect(XP_AMOUNTS[key]).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(XP_AMOUNTS[key])).toBe(true);
    }
  });

  it("rewards major milestones more than minor actions", () => {
    expect(XP_AMOUNTS.memory_verse_mastered).toBeGreaterThan(
      XP_AMOUNTS.memory_verse_reviewed!
    );
    expect(XP_AMOUNTS.streak_30).toBeGreaterThan(XP_AMOUNTS.streak_7!);
    expect(XP_AMOUNTS.streak_7).toBeGreaterThan(XP_AMOUNTS.streak_day!);
  });

  it("chapter_read is worth 10 XP (product contract)", () => {
    expect(XP_AMOUNTS.chapter_read).toBe(10);
  });
});

describe("getLevelForXp() — boundary behaviour", () => {
  it("returns level 1 (Seeker) for 0 XP", () => {
    const info = getLevelForXp(0);
    expect(info.level).toBe(1);
    expect(info.title).toBe("Seeker");
    expect(info.minXp).toBe(0);
    expect(info.nextLevelXp).toBe(100);
  });

  it("returns level 1 for XP just below the level 2 threshold", () => {
    expect(getLevelForXp(99).level).toBe(1);
  });

  it("promotes to level 2 (Reader) at exactly 100 XP", () => {
    const info = getLevelForXp(100);
    expect(info.level).toBe(2);
    expect(info.title).toBe("Reader");
    expect(info.nextLevelXp).toBe(300);
  });

  it("promotes to level 5 (Faithful) at exactly 1,000 XP", () => {
    const info = getLevelForXp(1000);
    expect(info.level).toBe(5);
    expect(info.title).toBe("Faithful");
  });

  it("stays on level 7 (Sage) from 4,000 through 7,999 XP", () => {
    expect(getLevelForXp(4000).level).toBe(7);
    expect(getLevelForXp(7999).level).toBe(7);
  });

  it("caps at level 8 (Witness) with null nextLevelXp", () => {
    const info = getLevelForXp(8000);
    expect(info.level).toBe(8);
    expect(info.title).toBe("Witness");
    expect(info.nextLevelXp).toBeNull();
  });

  it("still returns level 8 for XP well above the max threshold", () => {
    const info = getLevelForXp(100_000);
    expect(info.level).toBe(8);
    expect(info.nextLevelXp).toBeNull();
  });
});

describe("getLevelForXp() — monotonicity", () => {
  it("level is non-decreasing as XP grows", () => {
    let lastLevel = -1;
    for (let xp = 0; xp <= 10_000; xp += 50) {
      const { level } = getLevelForXp(xp);
      expect(level).toBeGreaterThanOrEqual(lastLevel);
      lastLevel = level;
    }
  });

  it("each returned minXp is <= the input XP", () => {
    for (const xp of [0, 99, 100, 500, 1500, 4000, 50_000]) {
      const { minXp } = getLevelForXp(xp);
      expect(minXp).toBeLessThanOrEqual(xp);
    }
  });

  it("nextLevelXp (when non-null) is strictly > current minXp", () => {
    for (const xp of [0, 150, 750, 2500, 5000]) {
      const { minXp, nextLevelXp } = getLevelForXp(xp);
      if (nextLevelXp !== null) {
        expect(nextLevelXp).toBeGreaterThan(minXp);
      }
    }
  });
});

describe("getLevelForXp() — negative/edge XP values", () => {
  it("treats negative XP as level 1 (Seeker) with minXp of 0", () => {
    // Defensive: XP should never be negative, but the loop falls back to level 1.
    const info = getLevelForXp(-50);
    expect(info.level).toBe(1);
    expect(info.title).toBe("Seeker");
  });
});
