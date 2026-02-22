/**
 * GET /api/cron/year-in-review
 *
 * Runs on January 1. For every active "your_edition" subscriber, generates a
 * Year in Review document using Anthropic and stores it in the year_in_review
 * table. Each user gets a short email notification.
 *
 * The content_json structure:
 *   {
 *     year: number,
 *     chapters_read: number,
 *     longest_streak: number,
 *     top_books: string[],
 *     recurring_themes: string[],
 *     charles_letter: string,      // opening letter from companion
 *     answered_prayers_count: number,
 *     memory_verses_mastered: number,
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_MODEL } from "@/lib/charles/prompts";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — processes multiple users

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const YEAR = new Date().getFullYear() - 1; // previous year
const YEAR_START = `${YEAR}-01-01`;
const YEAR_END = `${YEAR}-12-31`;

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Get all your_edition users (active subscription)
  const { data: users, error: usersError } = await adminClient
    .from("profiles")
    .select("id, display_name, subscription_tier")
    .eq("subscription_tier", "your_edition");

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const targets = (users ?? []) as { id: string; display_name: string | null; subscription_tier: string }[];
  let processed = 0;
  let failed = 0;

  for (const user of targets) {
    try {
      await generateForUser(adminClient, user.id, user.display_name);
      processed++;
    } catch (e) {
      console.error(`[year-in-review] failed for ${user.id}:`, e);
      failed++;
    }
  }

  return NextResponse.json({ year: YEAR, processed, failed });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateForUser(adminClient: any, userId: string, displayName: string | null) {
  const name = displayName ?? "Friend";

  // Check if already generated this year
  const { data: existing } = await adminClient
    .from("year_in_review")
    .select("id")
    .eq("user_id", userId)
    .eq("year", YEAR)
    .single();
  if (existing) return; // Already done

  // Gather stats in parallel
  const [
    { count: chaptersCount },
    { data: streakRow },
    { data: progressRows },
    { count: answeredPrayers },
    { count: masteredVerses },
  ] = await Promise.all([
    adminClient
      .from("reading_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("completed_at", YEAR_START)
      .lte("completed_at", YEAR_END),
    adminClient
      .from("streaks")
      .select("longest_streak")
      .eq("user_id", userId)
      .single(),
    adminClient
      .from("reading_progress")
      .select("book_code")
      .eq("user_id", userId)
      .gte("completed_at", YEAR_START)
      .lte("completed_at", YEAR_END),
    adminClient
      .from("prayer_journal")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "answered"),
    adminClient
      .from("memory_verses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("mastered", true),
  ]);

  const chaptersRead = chaptersCount ?? 0;
  const longestStreak = (streakRow as { longest_streak?: number } | null)?.longest_streak ?? 0;
  const answeredPrayersCount = answeredPrayers ?? 0;
  const masteredCount = masteredVerses ?? 0;

  // Compute top books (most chapters read)
  const bookCounts = new Map<string, number>();
  for (const row of (progressRows ?? []) as { book_code: string }[]) {
    bookCounts.set(row.book_code, (bookCounts.get(row.book_code) ?? 0) + 1);
  }
  const topBooks = Array.from(bookCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([b]) => b);

  // Generate Charles letter + themes with Anthropic
  const prompt = `You are Charles — the theological intelligence of a personalized Bible study app. Write a warm, personal Year in Review letter to ${name} for the year ${YEAR}.

Their study stats:
- Chapters read this year: ${chaptersRead}
- Longest streak: ${longestStreak} days
- Top books studied: ${topBooks.join(", ") || "Various"}
- Memory verses mastered: ${masteredCount}
- Answered prayers recorded: ${answeredPrayersCount}

Write:
1. A short opening letter (150-200 words) from you (Charles) — personal, warm, theologically rich, referencing their actual study stats
2. 3-5 recurring spiritual themes you perceive from their reading pattern (as a JSON array of short phrases)

Return as JSON: { "letter": "...", "themes": ["...", "..."] }`;

  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 700,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0]?.type === "text" ? response.content[0].text.trim() : "{}";
  let letter = `Dear ${name},\n\nWhat a year of faithfulness. ${chaptersRead} chapters read, ${longestStreak} days of unbroken seeking. I have walked beside you through every passage, and I count it an honour.\n\nWith deep respect,\nCharles`;
  let themes: string[] = [];

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { letter?: string; themes?: string[] };
      if (parsed.letter) letter = parsed.letter;
      if (parsed.themes) themes = parsed.themes;
    }
  } catch { /* use defaults */ }

  const contentJson = {
    year: YEAR,
    chapters_read: chaptersRead,
    longest_streak: longestStreak,
    top_books: topBooks,
    recurring_themes: themes,
    charles_letter: letter,
    answered_prayers_count: answeredPrayersCount,
    memory_verses_mastered: masteredCount,
  };

  // Upsert into year_in_review
  await adminClient
    .from("year_in_review")
    .upsert({
      user_id: userId,
      year: YEAR,
      content_json: contentJson,
      charles_reflection: letter,
      charles_reflection_at: new Date().toISOString(),
    }, { onConflict: "user_id,year" });

  // Fetch email
  const { data: authUser } = await adminClient.auth.admin.getUserById(userId);
  const email = authUser?.user?.email;

  if (email) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
      to: email,
      subject: `Your ${YEAR} Year in Review is ready`,
      html: `<p>Dear ${name},</p><p>Your ${YEAR} Year in Review is ready. Visit your profile to read Charles's letter to you and see your year of study.</p><p>— The Bible Study App Team</p>`,
    }).catch(() => { /* email send failure is non-fatal */ });
  }
}
