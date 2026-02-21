/**
 * POST /api/content/generate
 *
 * Generates (or returns cached) personalized study content for a chapter.
 *
 * Request body:
 *   { book: string, chapter: number }
 *
 * Response:
 *   { content: ChapterContent } on success
 *   { error: string } on failure
 *
 * Cache logic:
 *   - Content is keyed by (user_id, book, chapter)
 *   - Cache is valid when personalized_content.profile_hash === profiles.profile_hash
 *   - Stale content is regenerated synchronously on demand
 *
 * Tier logic:
 *   - free: returns null (caller renders Vault card from charles_vault_entries)
 *   - standard: claude-haiku-3 (cheaper, sufficient for questions)
 *   - premium/your_edition: claude-sonnet (full depth)
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getChapter } from "@/lib/bible/index";
import {
  buildContentSystemPrompt,
  buildContentContext,
  validateContentJSON,
  type ChapterContent,
} from "@/lib/charles/content";
import { ANTHROPIC_MODEL } from "@/lib/charles/prompts";
import type { ProfileRow, PersonalizedContentRow } from "@/types/database";

// Model selection by tier
function modelForTier(tier: string): string {
  if (tier === "standard") return "claude-haiku-4-5";
  return ANTHROPIC_MODEL; // sonnet for premium/your_edition
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { book?: unknown; chapter?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const book = typeof body.book === "string" ? body.book.toUpperCase() : null;
  const chapter =
    typeof body.chapter === "number" ? body.chapter : null;

  if (!book || !chapter) {
    return NextResponse.json(
      { error: "book and chapter are required" },
      { status: 400 }
    );
  }

  // Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profile = profileData as unknown as ProfileRow;
  const tier = (profile.subscription_tier as string) ?? "free";

  // Free tier gets no generated content — client renders Vault card
  if (tier === "free") {
    return NextResponse.json({ content: null, tier: "free" });
  }

  const currentHash = (profile.profile_hash as string | null) ?? "";

  // Check cache
  const { data: cachedData } = await supabase
    .from("personalized_content")
    .select("*")
    .eq("user_id", user.id)
    .eq("book", book)
    .eq("chapter", chapter)
    .maybeSingle();

  if (cachedData) {
    const cached = cachedData as unknown as PersonalizedContentRow;
    const hashMatch = cached.profile_hash === currentHash;
    const notStale = !cached.is_stale;

    if (hashMatch && notStale) {
      const content: ChapterContent = {
        intro: (cached.intro_text as string) ?? "",
        connections:
          (cached.connections as ChapterContent["connections"]) ?? [],
        questions: (cached.questions as ChapterContent["questions"]) ?? [],
        closing: (cached.closing_text as string) ?? "",
        word_note: (cached.word_note as ChapterContent["word_note"]) ?? null,
      };
      return NextResponse.json({ content, cached: true });
    }
  }

  // ----- Generate new content -----
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 503 }
    );
  }

  // Fetch Bible text for context
  const translation =
    tier === "standard" ? "KJV" : "ESV"; // fallback to KJV if no ESV key for haiku
  const chapterData = await getChapter(book, chapter, translation);

  if (!chapterData || chapterData.verses.length === 0) {
    return NextResponse.json(
      { error: "Bible text not available for this chapter" },
      { status: 503 }
    );
  }

  const verseLines = chapterData.verses.map(
    (v) => `[${v.verse}] ${v.text}`
  );

  const systemPrompt = buildContentSystemPrompt({
    id: user.id,
    display_name: profile.display_name,
    age_range: profile.age_range,
    faith_stage: profile.faith_stage,
    tone_preference: profile.tone_preference,
    living_portrait: profile.living_portrait,
    subscription_tier: profile.subscription_tier,
  });

  const userMessage = buildContentContext(
    chapterData.book_name,
    chapter,
    translation,
    verseLines
  );

  let generatedContent: ChapterContent;

  try {
    const anthropic = new Anthropic({ apiKey });
    const model = modelForTier(tier);

    const message = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      message.content[0]?.type === "text" ? message.content[0].text : "";

    // Strip any markdown code block wrappers
    const cleaned = rawText
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned) as unknown;
    generatedContent = validateContentJSON(parsed);
  } catch (err) {
    console.error("[content/generate] Generation failed:", err);
    return NextResponse.json(
      { error: "Content generation failed" },
      { status: 502 }
    );
  }

  // ----- Cache result -----
  const now = new Date().toISOString();

  await supabase.from("personalized_content").upsert(
    {
      user_id: user.id,
      book,
      chapter,
      intro_text: generatedContent.intro,
      connections: generatedContent.connections,
      questions: generatedContent.questions,
      closing_text: generatedContent.closing,
      word_note: generatedContent.word_note,
      profile_hash: currentHash,
      generated_at: now,
      is_stale: false,
    },
    { onConflict: "user_id,book,chapter" }
  );

  return NextResponse.json({ content: generatedContent, cached: false });
}
