/**
 * POST /api/journal/submit
 *
 * Submits OIA answers for a chapter study session and returns Charles's
 * responses to each answered question.
 *
 * Request body:
 *   {
 *     book: string,
 *     chapter: number,
 *     translation: string,
 *     answers: Array<{
 *       oia_type: 'observe' | 'interpret' | 'apply',
 *       question_text: string,
 *       answer_text: string
 *     }>
 *   }
 *
 * Response:
 *   {
 *     entry_id: string,
 *     responses: Array<{ oia_type, question_text, charles_response }>
 *   }
 *
 * Flow:
 *   1. Create/update journal_entries row
 *   2. Insert journal_answers for all submitted answers
 *   3. Call Anthropic for each answer with content (parallel requests)
 *   4. Update journal_answers with Charles responses
 *   5. Return all responses
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildContentSystemPrompt } from "@/lib/charles/content";
import { ANTHROPIC_MODEL } from "@/lib/charles/prompts";
import { getChapter } from "@/lib/bible/index";
import type { ProfileRow } from "@/types/database";

interface AnswerInput {
  oia_type: "observe" | "interpret" | "apply";
  question_text: string;
  answer_text: string;
}

interface SubmitBody {
  book: string;
  chapter: number;
  translation: string;
  answers: AnswerInput[];
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { book, chapter, translation, answers } = body;

  if (!book || !chapter || !answers?.length) {
    return NextResponse.json(
      { error: "book, chapter, and answers are required" },
      { status: 400 }
    );
  }

  // Filter to answered questions only (non-empty answer_text)
  const answeredItems = answers.filter(
    (a) => a.answer_text && a.answer_text.trim().length > 0
  );

  if (!answeredItems.length) {
    return NextResponse.json(
      { error: "At least one answer must have content" },
      { status: 400 }
    );
  }

  // Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileData as unknown as ProfileRow) ?? null;
  const tier = (profile?.subscription_tier as string) ?? "free";

  // ----- Create/update journal entry -----
  // Check if there's already an OIA entry for this chapter today
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { data: existingEntry } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("book_code", book.toUpperCase())
    .eq("chapter_number", chapter)
    .eq("entry_type", "oia")
    .gte("created_at", `${today}T00:00:00Z`)
    .maybeSingle();

  let entryId: string;

  if (existingEntry) {
    entryId = existingEntry.id as string;
  } else {
    const { data: newEntry, error: entryError } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        book_code: book.toUpperCase(),
        chapter_number: chapter,
        entry_type: "oia",
        content: { answers: answeredItems },
      })
      .select("id")
      .single();

    if (entryError || !newEntry) {
      console.error("[journal/submit] Entry insert failed:", entryError?.message);
      return NextResponse.json(
        { error: "Failed to create journal entry" },
        { status: 500 }
      );
    }
    entryId = newEntry.id as string;
  }

  // ----- Insert answer rows -----
  const { data: insertedAnswers, error: answersError } = await supabase
    .from("journal_answers")
    .insert(
      answeredItems.map((a) => ({
        entry_id: entryId,
        user_id: user.id,
        oia_type: a.oia_type,
        question_text: a.question_text,
        answer_text: a.answer_text,
        charles_response: null,
      }))
    )
    .select("id, oia_type, question_text, answer_text");

  if (answersError || !insertedAnswers) {
    console.error("[journal/submit] Answers insert failed:", answersError?.message);
    return NextResponse.json(
      { error: "Failed to save answers" },
      { status: 500 }
    );
  }

  // ----- Call Anthropic for responses (paid tiers only) -----
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || tier === "free") {
    // Free users get no AI response — just acknowledgment
    return NextResponse.json({
      entry_id: entryId,
      responses: insertedAnswers.map((a) => ({
        id: a.id,
        oia_type: a.oia_type,
        question_text: a.question_text,
        charles_response: null,
      })),
    });
  }

  // Fetch Bible text for response context
  const chapterData = await getChapter(book.toUpperCase(), chapter, translation ?? "KJV");
  const verseLines =
    chapterData?.verses.map((v) => `[${v.verse}] ${v.text}`) ?? [];

  const systemPrompt = profile
    ? buildContentSystemPrompt({
        id: user.id,
        display_name: profile.display_name,
        age_range: profile.age_range,
        faith_stage: profile.faith_stage,
        tone_preference: profile.tone_preference,
        living_portrait: profile.living_portrait,
        subscription_tier: profile.subscription_tier,
      })
    : "";

  const passageContext =
    chapterData && verseLines.length > 0
      ? `PASSAGE: ${chapterData.book_name} ${chapter} (${translation})\n\n${verseLines.join("\n")}\n\n`
      : "";

  const anthropic = new Anthropic({ apiKey });

  // Generate Charles's response for each answer in parallel
  const responsePromises = insertedAnswers.map(async (answer) => {
    const userMsg = `${passageContext}The reader answered the question:\n\n"${answer.question_text}"\n\nTheir answer:\n"${answer.answer_text}"\n\nRespond as Charles — 2-6 sentences, honest and specific, grounded in the text. Mirror their depth. Don't repeat what they said back to them.`;

    try {
      const msg = await anthropic.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      });

      const responseText =
        msg.content[0]?.type === "text" ? msg.content[0].text : null;

      return {
        id: answer.id as string,
        oia_type: answer.oia_type,
        question_text: answer.question_text,
        charles_response: responseText,
      };
    } catch (err) {
      console.error(
        `[journal/submit] Response generation failed for answer ${answer.id}:`,
        err
      );
      return {
        id: answer.id as string,
        oia_type: answer.oia_type,
        question_text: answer.question_text,
        charles_response: null,
      };
    }
  });

  const responses = await Promise.all(responsePromises);

  // ----- Update answers with Charles responses -----
  await Promise.all(
    responses
      .filter((r) => r.charles_response !== null)
      .map((r) =>
        supabase
          .from("journal_answers")
          .update({ charles_response: r.charles_response })
          .eq("id", r.id)
      )
  );

  return NextResponse.json({ entry_id: entryId, responses });
}
