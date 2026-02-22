/**
 * POST /api/cron/daily-reading
 *
 * Sends daily reading digest emails to users who have email_digest enabled.
 * Batch runs at various hours (approximates user timezone preferences).
 * Called by Vercel Cron at 07:00, 12:00, and 17:00 UTC.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { trySendEmail } from "@/lib/email";
import DailyReadingEmail from "@/lib/emails/daily-reading";
import React from "react";
import { getBook } from "@/lib/bible";

function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://biblestudy.app";
  const today = new Date().toISOString().slice(0, 10);

  // Get this morning's trail
  const { data: trail } = await supabase
    .from("daily_trails")
    .select("origin_book, origin_chapter")
    .eq("trail_date", today)
    .eq("slot", "morning")
    .maybeSingle();

  if (!trail) {
    return NextResponse.json({ ok: false, message: "No daily trail found for today" });
  }

  const bookInfo = getBook(trail.origin_book as string);
  const chapter = trail.origin_chapter as number;
  if (!bookInfo) {
    return NextResponse.json({ ok: false, message: "Unknown book in trail" });
  }

  // Get users with daily reading emails enabled
  const { data: notifSettings } = await supabase
    .from("notification_settings")
    .select("user_id, email_digest")
    .eq("email_digest", true);

  if (!notifSettings?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const userIds = notifSettings.map((n) => n.user_id as string);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .in("id", userIds);

  const readUrl = `${appUrl}/read/${trail.origin_book as string}/${chapter}`;
  const subject = `Today's reading: ${bookInfo.name} ${chapter}`;

  // Simple questions based on OIA — same for all users (personalized version is paid tier)
  const questions = [
    `What does this passage say? (Observation)`,
    `What does it mean for how we live? (Application)`,
    `How might you pray this passage back to God? (Prayer)`,
  ];

  let sent = 0;

  for (const profile of profiles ?? []) {
    const email = profile.email as string;
    if (!email) continue;

    await trySendEmail({
      to: email,
      subject,
      react: React.createElement(DailyReadingEmail, {
        recipientName: profile.display_name as string | null,
        book: trail.origin_book as string,
        chapter,
        bookName: bookInfo.name,
        questions,
        readUrl,
      }),
      tags: [{ name: "type", value: "daily-reading" }],
    });

    sent++;
  }

  return NextResponse.json({ ok: true, sent, passage: `${bookInfo.name} ${chapter}` });
}
