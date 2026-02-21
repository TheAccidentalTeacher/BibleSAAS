/**
 * Charles content generation utilities.
 *
 * Provides:
 *  - Content JSON schema types
 *  - buildSystemPrompt(profile) — 3-layer system prompt for generation
 *  - buildContentContext(book, chapter, text) — passage context block
 *  - validateContentJSON(raw) — schema validation before DB insert
 */

import { buildCommentarySystem } from "./prompts";
import type { ProfileRow } from "@/types/database";

// ─── Content JSON shape ───────────────────────────────────────────────────────

export interface OIAQuestion {
  oia_type: "observe" | "interpret" | "apply";
  text: string;
  answer_prompt: string;
}

export interface ContentConnection {
  type: "life" | "cross_ref" | "history" | "theme";
  text: string;
  /** optional verse reference for cross_ref type */
  ref?: string;
}

export interface WordNote {
  strongs_number: string;
  original_word: string;
  transliteration: string;
  morphology: string;
  short_def: string;
  clarke_note: string | null;
  charles_synthesis: string;
}

export interface ChapterContent {
  intro: string;
  connections: ContentConnection[];
  questions: OIAQuestion[];
  closing: string;
  word_note: WordNote | null;
}

// ─── Profile shape for generation ────────────────────────────────────────────

type ContentProfile = Pick<
  ProfileRow,
  | "id"
  | "display_name"
  | "age_range"
  | "faith_stage"
  | "tone_preference"
  | "living_portrait"
  | "subscription_tier"
>;

// ─── Prompt builders ──────────────────────────────────────────────────────────

/**
 * Assembles the full 3-layer system prompt for chapter content generation.
 *
 * Layer 1 — Charles persona (via buildCommentarySystem)
 * Layer 2 — Living portrait / user context
 * Layer 3 — Counselor guardrail + JSON contract
 */
export function buildContentSystemPrompt(profile: ContentProfile): string {
  const name = (profile.display_name as string | null) ?? "the reader";
  const faithStage = (profile.faith_stage as string | null) ?? null;
  const tonePreference = (profile.tone_preference as string | null) ?? null;
  const livingPortrait = (profile.living_portrait as string | null) ?? null;
  const tier = (profile.subscription_tier as string) ?? "free";

  // Determine which model tier quality to use
  const qualityNote =
    tier === "your_edition" || tier === "premium"
      ? "Use deep, specific, unhurried language. This reader has invested in the app."
      : "Keep questions honest and useful, if more briefly set up.";

  const personaLayer = buildCommentarySystem({
    display_name: name,
    faith_stage: faithStage,
  });

  const portraitLayer = livingPortrait
    ? `\n## Living Portrait\nHere is what you know about ${name} from their journal history:\n\n${livingPortrait}\n\nLet this shape the specificity of your questions and connections — not just their content but the level of challenge and the metaphors you reach for.`
    : `\n## User Context\nNo portrait yet — this reader is new. Use ${faithStage ?? "default"} faith stage and ${tonePreference ?? "conversational"} tone as starting points.`;

  const contractLayer = `

## Generation Contract
You are generating structured study content for a Bible chapter. Return ONLY valid JSON matching this exact shape (no markdown, no explanation, no preamble):

{
  "intro": "string — 2-4 sentences, Charles's opening hook for this chapter. NOT a summary. An angle. Something specific.",
  "connections": [
    {"type": "life|cross_ref|history|theme", "text": "string", "ref": "optional verse ref for cross_ref"}
  ],
  "questions": [
    {"oia_type": "observe|interpret|apply", "text": "string", "answer_prompt": "string — brief prompt/hint under the question"}
  ],
  "closing": "string — 1-2 sentences, Charles's sign-off. Should feel like an invitation, not a conclusion.",
  "word_note": null
}

Rules for connections: 2-4 objects. Mix types. At least one life connection anchored in what you know about ${name}.
Rules for questions: EXACTLY 5 — 3 observe, 1 interpret, 1 apply. Question order: observe × 3, then interpret, then apply.
Rules for questions: All text-anchored in specific words, phrases, or structures from the passage.
Rules for the apply question: Speak to ${name}'s specific life context. Not generic.
${qualityNote}

## Counselor Guardrail
You are never a therapist or spiritual director. You do not diagnose, prescribe, or make decisions for users. You ask. You reflect. You trust the Spirit to apply. If a passage touches grief, trauma, or crisis — stay with the text, stay with the questions, never tell them what to feel.`;

  return personaLayer + portraitLayer + contractLayer;
}

/**
 * Builds the passage context block — the "user message" sent alongside the system prompt.
 * This includes the book/chapter reference, raw text, and optional cross-reference data.
 */
export function buildContentContext(
  bookName: string,
  chapter: number,
  translation: string,
  verseLines: string[],
  tskRefs?: string,
  spurgeonSnippet?: string
): string {
  const passageText = verseLines.join("\n");

  return `
PASSAGE: ${bookName} ${chapter} (${translation})

${passageText}

${tskRefs ? `TREASURY OF SCRIPTURE KNOWLEDGE CROSS-REFERENCES:\n${tskRefs}\n` : ""}
${spurgeonSnippet ? `SPURGEON RELATED READING:\n${spurgeonSnippet}\n` : ""}

Generate the study content for this chapter.`.trim();
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates and coerces a raw object into ChapterContent.
 * Throws if the structure is critically invalid.
 */
export function validateContentJSON(raw: unknown): ChapterContent {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Content JSON must be an object");
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.intro !== "string") {
    throw new Error("Missing intro string");
  }
  if (!Array.isArray(obj.questions) || obj.questions.length !== 5) {
    throw new Error(`Expected 5 questions, got ${Array.isArray(obj.questions) ? obj.questions.length : "non-array"}`);
  }
  if (!Array.isArray(obj.connections)) {
    throw new Error("Missing connections array");
  }
  if (typeof obj.closing !== "string") {
    throw new Error("Missing closing string");
  }

  return {
    intro: obj.intro,
    connections: obj.connections as ContentConnection[],
    questions: obj.questions as OIAQuestion[],
    closing: obj.closing,
    word_note: (obj.word_note as WordNote | null) ?? null,
  };
}
