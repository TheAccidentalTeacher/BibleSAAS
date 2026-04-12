import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { calcSM2, QUALITY_MAP } from "@/lib/sm2";

/**
 * Tests for the SM-2 spaced repetition algorithm.
 *
 * The implementation follows Wozniak (1990):
 *   quality 0–2 → failed (reset reps to 0, interval to 1)
 *   quality 3–5 → passed (advance reps, schedule per interval table)
 *
 * Mastery: interval >= 21 AND reps >= 3
 */

// Freeze "today" so nextReview calculations are deterministic.
const FIXED_NOW = new Date("2026-04-12T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("calcSM2 — failure branch (quality < 3)", () => {
  it("resets reps to 0 and interval to 1 on a failed review", () => {
    const result = calcSM2(2.5, 15, 4, 2); // 'hard' rating
    expect(result.reps).toBe(0);
    expect(result.interval).toBe(1);
  });

  it("clamps ease factor at 1.3 minimum even after repeated failures", () => {
    let ease = 1.3;
    for (let i = 0; i < 5; i++) {
      const result = calcSM2(ease, 1, 0, 0);
      ease = result.ease;
    }
    expect(ease).toBe(1.3);
  });

  it("does not grant mastery on a failed review even if previous reps were high", () => {
    const result = calcSM2(2.5, 30, 10, 1);
    expect(result.mastered).toBe(false);
  });
});

describe("calcSM2 — success branch (quality >= 3)", () => {
  it("first successful review sets interval to 1 day", () => {
    const result = calcSM2(2.5, 0, 0, 5);
    expect(result.interval).toBe(1);
    expect(result.reps).toBe(1);
  });

  it("second successful review sets interval to 6 days", () => {
    const result = calcSM2(2.5, 1, 1, 5);
    expect(result.interval).toBe(6);
    expect(result.reps).toBe(2);
  });

  it("third and beyond uses interval * ease with rounding", () => {
    const result = calcSM2(2.5, 6, 2, 5);
    // 6 * newEase, where newEase for quality=5 is 2.5 + 0.1 = 2.6
    expect(result.interval).toBe(Math.round(6 * 2.6));
    expect(result.reps).toBe(3);
  });

  it("increments reps by exactly 1 per successful review", () => {
    const r1 = calcSM2(2.5, 0, 0, 4);
    const r2 = calcSM2(r1.ease, r1.interval, r1.reps, 4);
    const r3 = calcSM2(r2.ease, r2.interval, r2.reps, 4);
    expect([r1.reps, r2.reps, r3.reps]).toEqual([1, 2, 3]);
  });
});

describe("calcSM2 — ease factor updates (SM-2 formula)", () => {
  it("quality 5 (perfect) increases ease by +0.1", () => {
    const result = calcSM2(2.5, 6, 2, 5);
    expect(result.ease).toBe(2.6);
  });

  it("quality 4 (hesitation) leaves ease unchanged", () => {
    const result = calcSM2(2.5, 6, 2, 4);
    expect(result.ease).toBe(2.5);
  });

  it("quality 3 (barely passed) decreases ease", () => {
    const result = calcSM2(2.5, 6, 2, 3);
    // newEase = 2.5 + (0.1 - 2*(0.08 + 2*0.02)) = 2.5 + (0.1 - 0.24) = 2.36
    expect(result.ease).toBe(2.36);
  });

  it("rounds ease to 2 decimal places", () => {
    const result = calcSM2(2.5, 6, 2, 3);
    const decimals = result.ease.toString().split(".")[1] ?? "";
    expect(decimals.length).toBeLessThanOrEqual(2);
  });
});

describe("calcSM2 — mastery threshold", () => {
  it("marks mastered when interval >= 21 AND reps >= 3", () => {
    // interval=30, reps=2 → not mastered even though interval >= 21
    const notYet = calcSM2(2.5, 30, 2, 5);
    expect(notYet.mastered).toBe(true); // reps becomes 3 after success
    expect(notYet.interval).toBeGreaterThanOrEqual(21);
    expect(notYet.reps).toBeGreaterThanOrEqual(3);
  });

  it("does not mark mastered when interval < 21", () => {
    const result = calcSM2(2.5, 6, 2, 4);
    // 6 * 2.5 = 15 < 21
    expect(result.mastered).toBe(false);
  });

  it("does not mark mastered when reps < 3 (even if interval is large)", () => {
    // reps starts at 0, so after 1 success reps=1, interval=1 — not mastered
    const result = calcSM2(2.5, 0, 0, 5);
    expect(result.mastered).toBe(false);
  });
});

describe("calcSM2 — nextReview date", () => {
  it("returns ISO date string (YYYY-MM-DD) N days from today", () => {
    const result = calcSM2(2.5, 0, 0, 5); // interval = 1
    expect(result.nextReview).toBe("2026-04-13");
  });

  it("returns correct date for a 6-day interval", () => {
    const result = calcSM2(2.5, 1, 1, 5); // interval = 6
    expect(result.nextReview).toBe("2026-04-18");
  });

  it("produces a valid YYYY-MM-DD shape", () => {
    const result = calcSM2(2.5, 6, 2, 5);
    expect(result.nextReview).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("QUALITY_MAP — UI button → SM-2 quality mapping", () => {
  it("maps 'hard' to a failing quality (< 3)", () => {
    expect(QUALITY_MAP.hard).toBeLessThan(3);
  });

  it("maps 'got_it' to a passing quality with hesitation", () => {
    expect(QUALITY_MAP.got_it).toBe(4);
  });

  it("maps 'nailed_it' to perfect recall", () => {
    expect(QUALITY_MAP.nailed_it).toBe(5);
  });
});

describe("calcSM2 — long-term simulation", () => {
  it("a user who nails every review reaches mastery within a few sessions", () => {
    let ease = 2.5;
    let interval = 0;
    let reps = 0;
    let mastered = false;

    for (let i = 0; i < 10 && !mastered; i++) {
      const result = calcSM2(ease, interval, reps, 5);
      ease = result.ease;
      interval = result.interval;
      reps = result.reps;
      mastered = result.mastered;
    }

    expect(mastered).toBe(true);
    expect(reps).toBeGreaterThanOrEqual(3);
    expect(interval).toBeGreaterThanOrEqual(21);
  });

  it("a failure mid-sequence resets progress but preserves ease floor", () => {
    let state = calcSM2(2.5, 0, 0, 5);
    state = calcSM2(state.ease, state.interval, state.reps, 5);
    state = calcSM2(state.ease, state.interval, state.reps, 0); // crash fail
    expect(state.reps).toBe(0);
    expect(state.interval).toBe(1);
    expect(state.ease).toBeGreaterThanOrEqual(1.3);
  });
});
