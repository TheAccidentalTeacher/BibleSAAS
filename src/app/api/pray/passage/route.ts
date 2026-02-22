/**
 * POST /api/pray/passage
 *
 * Generates prayer prompts for each "block" of verses in a chapter using
 * Anthropic. A block is a group of 2-4 consecutive verses with a shared
 * paragraph/theme boundary. Returns an array of { verseRange, prompt }.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_MODEL } from "@/lib/charles/prompts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface PrayBlock {
  startVerse: number;
  endVerse: number;
  verseText: string;
  prompt: string;
}

interface RequestBody {
  book: string;
  chapter: number;
  verses: { verse: number; text: string }[];
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as RequestBody;
  const { book, chapter, verses } = body;

  if (!verses || verses.length === 0) {
    return NextResponse.json({ blocks: [] });
  }

  // Group verses into blocks of ~3
  const blocks: { start: number; end: number; text: string }[] = [];
  for (let i = 0; i < verses.length; i += 3) {
    const group = verses.slice(i, i + 3);
    blocks.push({
      start: group[0]!.verse,
      end: group[group.length - 1]!.verse,
      text: group.map((v) => `${v.verse} ${v.text}`).join(" "),
    });
  }

  const passage = verses.map((v) => `${v.verse} ${v.text}`).join(" ");
  const bookChapter = `${book} ${chapter}`;

  const systemPrompt = `You are a gentle guide helping a Christian pray through Scripture. For each passage block provided, write a brief, personal prayer prompt (1-2 sentences, second person "you") that invites the reader to respond to what they've just read in prayer. The prompt should be specific to the text, devotional in tone, and end with a short prayer starter like "Lord, ..." or "Father, ..." or "Jesus, ..." — allowing the user to continue in their own words.`;

  const userMsg = `I am reading ${bookChapter}. Generate prayer prompts for each of these ${blocks.length} verse block${blocks.length !== 1 ? "s" : ""}. Return a JSON array with exactly ${blocks.length} objects, each with "i" (block index, 0-based) and "prompt" (the prayer prompt string). Only return the JSON array, no other text.

${blocks.map((b, i) => `Block ${i} (v${b.start}-${b.end}): "${b.text}"`).join("\n\n")}`;

  try {
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 800,
      messages: [{ role: "user", content: userMsg }],
      system: systemPrompt,
    });

    const raw = response.content[0]?.type === "text" ? response.content[0].text.trim() : "[]";

    // Parse JSON
    let parsed: { i: number; prompt: string }[] = [];
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      parsed = jsonMatch ? (JSON.parse(jsonMatch[0]) as { i: number; prompt: string }[]) : [];
    } catch {
      // Fallback: generate simple prompts
    }

    const result: PrayBlock[] = blocks.map((b, idx) => ({
      startVerse: b.start,
      endVerse: b.end,
      verseText: b.text.slice(0, 200),
      prompt: parsed.find((p) => p.i === idx)?.prompt ??
        `Reflect on what God is saying to you through these words from ${bookChapter}. Lord, as I read this...`,
    }));

    return NextResponse.json({ blocks: result, passage });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
