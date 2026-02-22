/**
 * POST /api/cron/birthday-letters
 *
 * Runs at midnight UTC. Checks for:
 * 1. Users whose birthday is today — surfaces scheduled letters from verse threads
 * 2. verse_thread_messages with delivery_date = today — delivers them via email
 *
 * Called by Vercel Cron at 00:00 UTC.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { trySendEmail } from "@/lib/email";
import BirthdayLetterEmail from "@/lib/emails/birthday-letter";
import React from "react";

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
  const today = new Date().toISOString().slice(0, 10);
  const todayMMDD = today.slice(5); // MM-DD for birthday matching

  let sent = 0;

  // ── 1. Deliver verse thread messages with delivery_date = today ─────────────
  const { data: scheduledMessages } = await supabase
    .from("verse_thread_messages")
    .select(`
      id,
      content,
      delivery_date,
      book,
      chapter,
      verse,
      user_id,
      recipient_user_id,
      sender_display_name
    `)
    .eq("delivery_date", today)
    .eq("delivered", false);

  for (const msg of scheduledMessages ?? []) {
    const recipientId = msg.recipient_user_id as string | null;
    if (!recipientId) continue;

    const { data: recipient } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("id", recipientId)
      .single();

    if (!recipient?.email) continue;

    const book = msg.book as string | null;
    const chapter = msg.chapter as number | null;
    const verse = msg.verse as number | null;
    const verseRef =
      book && chapter && verse ? `${book} ${chapter}:${verse}` : undefined;

    const ok = await trySendEmail({
      to: recipient.email as string,
      subject: `A letter for you${verseRef ? ` — ${verseRef}` : ""}`,
      react: React.createElement(BirthdayLetterEmail, {
        recipientName: recipient.display_name as string | null,
        letterBody: msg.content as string,
        fromName: (msg.sender_display_name as string | null) ?? "Someone who loves you",
        verseRef,
      }),
      tags: [{ name: "type", value: "birthday-letter" }],
    });

    if (ok) {
      // Mark delivered
      await supabase
        .from("verse_thread_messages")
        .update({ delivered: true, delivered_at: new Date().toISOString() })
        .eq("id", msg.id);
      sent++;
    }
  }

  // ── 2. Find users with birthday today (MM-DD match) ──────────────────────
  // We look for profiles where birthday LIKE '%-MM-DD'
  const { data: birthdayProfiles } = await supabase
    .from("profiles")
    .select("id, email, display_name, birthday")
    .like("birthday", `%-${todayMMDD}`);

  // Birthday letters that weren't in scheduled messages are handled above
  // This second pass handles app-side birthday surfacing (no email for now)
  const birthdayUserIds = (birthdayProfiles ?? []).map((p) => p.id as string);

  return NextResponse.json({
    ok: true,
    sent,
    birthdayUsers: birthdayUserIds.length,
  });
}
