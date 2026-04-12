import { describe, expect, it, vi } from "vitest";

// The achievements module transitively imports next/headers via the Supabase
// server client. We mock those modules so we can unit-test the pure
// evaluateTrigger function without standing up a request/cookies context.
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [],
    set: () => {},
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({}),
  createAdminClient: () => ({}),
}));

vi.mock("@/lib/xp-server", () => ({
  awardXP: async () => undefined,
}));

import { evaluateTrigger, type AchievementTrigger } from "@/lib/achievements";

/**
 * Tests for the achievement unlock-predicate function.
 * Each achievement key has its own unlock rule — we exercise every branch.
 */

function trigger(
  overrides: Partial<AchievementTrigger> & { type: AchievementTrigger["type"] }
): AchievementTrigger {
  return { ...overrides };
}

describe("evaluateTrigger — first_chapter", () => {
  it("unlocks on any chapter_read trigger", () => {
    expect(evaluateTrigger("first_chapter", trigger({ type: "chapter_read" }))).toBe(true);
  });

  it("does not unlock on non-chapter triggers", () => {
    expect(evaluateTrigger("first_chapter", trigger({ type: "streak", streak: 5 }))).toBe(false);
    expect(evaluateTrigger("first_chapter", trigger({ type: "journal_answer" }))).toBe(false);
  });
});

describe("evaluateTrigger — streak achievements", () => {
  it("week_in_the_word unlocks at streak >= 7", () => {
    expect(evaluateTrigger("week_in_the_word", trigger({ type: "streak", streak: 7 }))).toBe(true);
    expect(evaluateTrigger("week_in_the_word", trigger({ type: "streak", streak: 50 }))).toBe(true);
  });

  it("week_in_the_word stays locked below 7", () => {
    expect(evaluateTrigger("week_in_the_word", trigger({ type: "streak", streak: 6 }))).toBe(false);
    expect(evaluateTrigger("week_in_the_word", trigger({ type: "streak", streak: 0 }))).toBe(false);
    expect(evaluateTrigger("week_in_the_word", trigger({ type: "streak" }))).toBe(false);
  });

  it("month_of_faithfulness unlocks at streak >= 30", () => {
    expect(evaluateTrigger("month_of_faithfulness", trigger({ type: "streak", streak: 30 }))).toBe(true);
    expect(evaluateTrigger("month_of_faithfulness", trigger({ type: "streak", streak: 29 }))).toBe(false);
  });

  it("streak achievements ignore non-streak triggers", () => {
    expect(evaluateTrigger("week_in_the_word", trigger({ type: "chapter_read" }))).toBe(false);
    expect(evaluateTrigger("month_of_faithfulness", trigger({ type: "journal_answer" }))).toBe(false);
  });
});

describe("evaluateTrigger — trail and memory achievements", () => {
  it("tsk_traveler unlocks on any trail_followed trigger", () => {
    expect(evaluateTrigger("tsk_traveler", trigger({ type: "trail_followed" }))).toBe(true);
    expect(evaluateTrigger("tsk_traveler", trigger({ type: "chapter_read" }))).toBe(false);
  });

  it("memory_keeper unlocks only on memory_verse_mastered", () => {
    expect(evaluateTrigger("memory_keeper", trigger({ type: "memory_verse_mastered" }))).toBe(true);
    expect(evaluateTrigger("memory_keeper", trigger({ type: "chapter_read" }))).toBe(false);
  });

  it("first_answer unlocks only on journal_answer", () => {
    expect(evaluateTrigger("first_answer", trigger({ type: "journal_answer" }))).toBe(true);
    expect(evaluateTrigger("first_answer", trigger({ type: "chapter_read" }))).toBe(false);
  });
});

describe("evaluateTrigger — book_completed achievements", () => {
  it("gospel_reader unlocks when any of the four Gospels is completed", () => {
    for (const book of ["Matthew", "Mark", "Luke", "John"]) {
      expect(
        evaluateTrigger("gospel_reader", trigger({ type: "book_completed", book }))
      ).toBe(true);
    }
  });

  it("gospel_reader stays locked for non-Gospel books", () => {
    expect(
      evaluateTrigger("gospel_reader", trigger({ type: "book_completed", book: "Acts" }))
    ).toBe(false);
    expect(
      evaluateTrigger("gospel_reader", trigger({ type: "book_completed", book: "Genesis" }))
    ).toBe(false);
  });

  it("gospel_reader stays locked when book field is missing", () => {
    expect(evaluateTrigger("gospel_reader", trigger({ type: "book_completed" }))).toBe(false);
  });

  it("psalm_singer unlocks only when Psalms is completed", () => {
    expect(
      evaluateTrigger("psalm_singer", trigger({ type: "book_completed", book: "Psalms" }))
    ).toBe(true);
    expect(
      evaluateTrigger("psalm_singer", trigger({ type: "book_completed", book: "Proverbs" }))
    ).toBe(false);
  });

  it("book achievements reject non-book_completed trigger types", () => {
    expect(
      evaluateTrigger("gospel_reader", trigger({ type: "chapter_read", book: "Matthew" }))
    ).toBe(false);
    expect(
      evaluateTrigger("psalm_singer", trigger({ type: "chapter_read", book: "Psalms" }))
    ).toBe(false);
  });
});

describe("evaluateTrigger — unknown keys", () => {
  it("returns false for any achievement key the switch doesn't recognize", () => {
    expect(evaluateTrigger("not_a_real_key", trigger({ type: "chapter_read" }))).toBe(false);
    expect(evaluateTrigger("", trigger({ type: "streak", streak: 100 }))).toBe(false);
  });
});
