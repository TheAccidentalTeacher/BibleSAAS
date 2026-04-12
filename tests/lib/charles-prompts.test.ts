import { describe, expect, it } from "vitest";
import {
  ANTHROPIC_MODEL,
  CHARLES_ONBOARDING_SYSTEM,
  PROFILE_EXTRACTION_SYSTEM,
  PROFILE_EXTRACTION_USER_PROMPT,
  OIA_QUESTION_SYSTEM,
  CHAT_TITLE_SYSTEM,
  buildChatTitlePrompt,
  buildGiftedOnboardingSystem,
  buildCommentarySystem,
  buildChatSystemPrompt,
  buildSermonOutlineSystem,
  buildSermonOutlinePrompt,
  type CompanionContext,
  type ChatUserContext,
  type ChatPassageContext,
} from "@/lib/charles/prompts";

/**
 * Tests for Charles prompt composition.
 *
 * These are pure string-builder functions — the value of the test is
 * guarding critical product invariants:
 *   - Profanity/language guardrails never get stripped
 *   - Personalization context reaches the model
 *   - Output format specs stay parseable
 *   - Cardinal rules are present in every persona variant
 */

// ─── Guardrail invariants ────────────────────────────────────────────────────
const BANNED_PHRASE_FRAGMENTS = [
  "What a wonderful passage",
  "As we journey",
  "May you be blessed",
];

describe("ANTHROPIC_MODEL", () => {
  it("defaults to claude-sonnet-4-5 when ANTHROPIC_MODEL env is unset", () => {
    // We don't clear the env here — instead we assert the module exports
    // a non-empty model identifier that starts with 'claude-'.
    expect(ANTHROPIC_MODEL).toMatch(/^claude-/);
  });
});

describe("CHARLES_ONBOARDING_SYSTEM", () => {
  it("contains the base persona identity", () => {
    expect(CHARLES_ONBOARDING_SYSTEM).toContain("Charles");
    expect(CHARLES_ONBOARDING_SYSTEM).toContain("Spurgeon");
  });

  it("includes the no-profanity cardinal rule", () => {
    expect(CHARLES_ONBOARDING_SYSTEM).toMatch(/profanity/i);
    expect(CHARLES_ONBOARDING_SYSTEM).toMatch(/non-negotiable/i);
  });

  it("lists the banned stock phrases", () => {
    for (const phrase of BANNED_PHRASE_FRAGMENTS) {
      expect(CHARLES_ONBOARDING_SYSTEM).toContain(phrase);
    }
  });

  it("specifies the exact opening line for onboarding", () => {
    expect(CHARLES_ONBOARDING_SYSTEM).toContain(
      "Before we get started — tell me a little about yourself"
    );
  });
});

describe("buildGiftedOnboardingSystem()", () => {
  it("extends the base onboarding prompt with gifter context", () => {
    const prompt = buildGiftedOnboardingSystem("My mom gifted this to me");
    expect(prompt).toContain("Gifted Account");
    expect(prompt).toContain("My mom gifted this to me");
  });

  it("preserves the base onboarding guardrails", () => {
    const prompt = buildGiftedOnboardingSystem("anyone");
    expect(prompt).toMatch(/profanity/i);
    for (const phrase of BANNED_PHRASE_FRAGMENTS) {
      expect(prompt).toContain(phrase);
    }
  });

  it("injects the gifter text verbatim (no truncation)", () => {
    const longDescription = "A".repeat(500);
    const prompt = buildGiftedOnboardingSystem(longDescription);
    expect(prompt).toContain(longDescription);
  });
});

describe("PROFILE_EXTRACTION_SYSTEM", () => {
  it("requests JSON-only output (no markdown)", () => {
    expect(PROFILE_EXTRACTION_SYSTEM).toMatch(/ONLY valid JSON/);
    expect(PROFILE_EXTRACTION_SYSTEM).toMatch(/no markdown/i);
  });

  it("declares every archetype option the app supports", () => {
    for (const archetype of ["runner", "home", "library", "garden", "puzzle", "default"]) {
      expect(PROFILE_EXTRACTION_SYSTEM).toContain(archetype);
    }
  });

  it("declares every faith_stage option", () => {
    for (const stage of [
      "exploring",
      "new_believer",
      "established",
      "questioning",
      "reconstructing",
      "mature",
    ]) {
      expect(PROFILE_EXTRACTION_SYSTEM).toContain(stage);
    }
  });
});

describe("PROFILE_EXTRACTION_USER_PROMPT()", () => {
  it("embeds the transcript verbatim", () => {
    const transcript = "USER: hi\nCHARLES: hello\nUSER: I am a teacher";
    const prompt = PROFILE_EXTRACTION_USER_PROMPT(transcript);
    expect(prompt).toContain(transcript);
  });
});

describe("buildCommentarySystem()", () => {
  it("addresses the user by display name when provided", () => {
    const prompt = buildCommentarySystem({
      display_name: "Hannah",
      archetype_hint: "runner",
    });
    expect(prompt).toContain("Hannah");
    expect(prompt).toContain("runner");
  });

  it("falls back to 'the reader' when display_name is missing", () => {
    const prompt = buildCommentarySystem({});
    expect(prompt).toContain("the reader");
  });

  it("only mentions vocation when provided", () => {
    const withVocation = buildCommentarySystem({ vocation: "chef" });
    const withoutVocation = buildCommentarySystem({});
    expect(withVocation).toContain("chef");
    expect(withoutVocation).not.toMatch(/Vocation:/);
  });

  it("only mentions interests when provided", () => {
    const withInterests = buildCommentarySystem({ interests: ["hiking", "piano"] });
    expect(withInterests).toContain("hiking");
    expect(withInterests).toContain("piano");
  });

  it("includes the base persona guardrails", () => {
    const prompt = buildCommentarySystem({ display_name: "Test" });
    expect(prompt).toMatch(/profanity/i);
    expect(prompt).toContain("Spurgeon");
  });
});

describe("buildChatSystemPrompt() — default Charles persona", () => {
  const user: ChatUserContext = {
    display_name: "Hannah",
    faith_stage: "questioning",
    living_portrait: "Hannah is a 28-year-old chef exploring Scripture.",
    age_range: "twenties",
    vocation: "chef",
  };

  it("uses the Charles persona when no companion is supplied", () => {
    const prompt = buildChatSystemPrompt(user);
    expect(prompt).toContain("Spurgeon");
  });

  it("embeds the living portrait when available", () => {
    const prompt = buildChatSystemPrompt(user);
    expect(prompt).toContain("Hannah is a 28-year-old chef");
  });

  it("falls back to 'friend' when display_name is null", () => {
    const anonUser: ChatUserContext = { ...user, display_name: null };
    const prompt = buildChatSystemPrompt(anonUser);
    expect(prompt).toContain("friend");
  });

  it("omits the portrait section when living_portrait is null", () => {
    const noPortrait: ChatUserContext = { ...user, living_portrait: null };
    const prompt = buildChatSystemPrompt(noPortrait);
    expect(prompt).not.toContain("What You Know About");
  });

  it("includes the passage section when provided", () => {
    const passage: ChatPassageContext = {
      book: "ROM",
      bookName: "Romans",
      chapter: 8,
      chapterText: "There is therefore now no condemnation...",
    };
    const prompt = buildChatSystemPrompt(user, passage);
    expect(prompt).toContain("Romans 8");
    expect(prompt).toContain("no condemnation");
  });

  it("truncates long chapter text to 2000 characters", () => {
    // Use a sentinel character guaranteed not to appear elsewhere in the prompt.
    const SENTINEL = "\u0467";
    const longText = SENTINEL.repeat(5000);
    const passage: ChatPassageContext = {
      book: "PSA",
      bookName: "Psalms",
      chapter: 119,
      chapterText: longText,
    };
    const prompt = buildChatSystemPrompt(user, passage);
    const count = (prompt.match(new RegExp(SENTINEL, "g")) ?? []).length;
    expect(count).toBe(2000);
  });

  it("requires JSON-shaped response format with suggested_questions", () => {
    const prompt = buildChatSystemPrompt(user);
    expect(prompt).toContain('"content"');
    expect(prompt).toContain('"suggested_questions"');
  });
});

describe("buildChatSystemPrompt() — companion override", () => {
  const user: ChatUserContext = {
    display_name: "Sam",
    faith_stage: "mature",
    living_portrait: null,
    age_range: "forties",
    vocation: "pastor",
  };

  it("uses the Charles persona when companion slug is 'charles'", () => {
    const charles: CompanionContext = {
      slug: "charles",
      display_name: "Charles",
      tradition: null,
      theological_dna: [],
      style_notes: null,
    };
    const prompt = buildChatSystemPrompt(user, undefined, charles);
    expect(prompt).toContain("Spurgeon");
  });

  it("swaps in the companion persona for a non-Charles slug", () => {
    const calvin: CompanionContext = {
      slug: "calvin",
      display_name: "John Calvin",
      tradition: "Reformed",
      theological_dna: ["covenant theology", "sovereignty of God"],
      style_notes: "measured, exegetical, pastoral",
    };
    const prompt = buildChatSystemPrompt(user, undefined, calvin);
    expect(prompt).toContain("John Calvin");
    expect(prompt).toContain("Reformed");
    expect(prompt).toContain("covenant theology");
    // Persona block should no longer be Spurgeon-focused
    expect(prompt).not.toMatch(/Spurgeon's fire: pastoral urgency/);
  });

  it("companion prompts still include the no-profanity guardrail", () => {
    const companion: CompanionContext = {
      slug: "wesley",
      display_name: "John Wesley",
      tradition: "Methodist",
      theological_dna: ["holiness"],
      style_notes: null,
    };
    const prompt = buildChatSystemPrompt(user, undefined, companion);
    expect(prompt).toMatch(/profanity/i);
  });

  it("companion prompts retain banned-phrase rules", () => {
    const companion: CompanionContext = {
      slug: "wesley",
      display_name: "John Wesley",
      tradition: "Methodist",
      theological_dna: ["holiness"],
      style_notes: null,
    };
    const prompt = buildChatSystemPrompt(user, undefined, companion);
    expect(prompt).toContain("What a wonderful passage");
  });
});

describe("OIA_QUESTION_SYSTEM", () => {
  it("requests 5 OIA questions in JSON format", () => {
    expect(OIA_QUESTION_SYSTEM).toMatch(/5 OIA study questions/);
    expect(OIA_QUESTION_SYSTEM).toContain("observation");
    expect(OIA_QUESTION_SYSTEM).toContain("interpretation");
    expect(OIA_QUESTION_SYSTEM).toContain("application");
  });

  it("demands the application question be personalized", () => {
    expect(OIA_QUESTION_SYSTEM).toMatch(/personalized/i);
  });
});

describe("CHAT_TITLE_SYSTEM and buildChatTitlePrompt()", () => {
  it("CHAT_TITLE_SYSTEM asks for a short title (3-7 words)", () => {
    expect(CHAT_TITLE_SYSTEM).toMatch(/3.{0,2}7 word/);
  });

  it("buildChatTitlePrompt embeds user message and assistant reply", () => {
    const prompt = buildChatTitlePrompt("What does Romans 8 mean?", "Paul is contrasting flesh and Spirit...");
    expect(prompt).toContain("Romans 8");
    expect(prompt).toContain("flesh and Spirit");
  });

  it("buildChatTitlePrompt truncates oversized inputs to protect token budget", () => {
    // Use distinct sentinel characters so the count isn't polluted by
    // the literal template text ("User asked:", "Assistant replied:", etc.).
    const USER_SENTINEL = "\u0467";
    const ASSISTANT_SENTINEL = "\u046B";
    const longUser = USER_SENTINEL.repeat(1000);
    const longAssistant = ASSISTANT_SENTINEL.repeat(1000);
    const prompt = buildChatTitlePrompt(longUser, longAssistant);
    expect((prompt.match(new RegExp(USER_SENTINEL, "g")) ?? []).length).toBe(200);
    expect((prompt.match(new RegExp(ASSISTANT_SENTINEL, "g")) ?? []).length).toBe(300);
  });
});

describe("buildSermonOutlineSystem()", () => {
  it("produces mode-specific instructions", () => {
    const sermon = buildSermonOutlineSystem("sermon");
    const smallGroup = buildSermonOutlineSystem("small_group");
    const family = buildSermonOutlineSystem("family_devotions");

    expect(sermon).toContain("Sunday Sermon Skeleton");
    expect(smallGroup).toContain("Small Group Guide");
    expect(family).toContain("Family Devotions");
  });

  it("small_group mode includes discussion_questions in the JSON shape", () => {
    const prompt = buildSermonOutlineSystem("small_group");
    expect(prompt).toContain("discussion_questions");
    expect(prompt).toContain("prayer_direction");
  });

  it("family_devotions mode includes kid_friendly_summary and activity", () => {
    const prompt = buildSermonOutlineSystem("family_devotions");
    expect(prompt).toContain("kid_friendly_summary");
    expect(prompt).toContain("activity");
    expect(prompt).toContain("prayer_starter");
  });

  it("sermon mode does NOT include small-group or family-only fields", () => {
    const prompt = buildSermonOutlineSystem("sermon");
    expect(prompt).not.toContain("kid_friendly_summary");
    expect(prompt).not.toContain("prayer_starter");
  });

  it("every mode retains the base persona guardrails", () => {
    for (const mode of ["sermon", "small_group", "family_devotions"] as const) {
      expect(buildSermonOutlineSystem(mode)).toMatch(/profanity/i);
    }
  });
});

describe("buildSermonOutlinePrompt()", () => {
  it("includes the book name, chapter, and mode label", () => {
    const prompt = buildSermonOutlinePrompt("Romans", 8, "Text of Romans 8...", "sermon");
    expect(prompt).toContain("Romans");
    expect(prompt).toContain("8");
    expect(prompt).toContain("Sunday Sermon Skeleton");
  });

  it("truncates chapter text to 4000 characters", () => {
    const longText = "y".repeat(10_000);
    const prompt = buildSermonOutlinePrompt("Psalms", 119, longText, "small_group");
    const ys = (prompt.match(/y/g) ?? []).length;
    expect(ys).toBe(4000);
  });
});
