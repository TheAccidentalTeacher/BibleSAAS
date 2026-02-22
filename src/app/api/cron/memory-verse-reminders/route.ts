/**
 * POST /api/cron/memory-verse-reminders
 *
 * Sends review reminder emails to users who have memory verses due today.
 * Called by Vercel Cron at 07:00 UTC.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { trySendEmail } from "@/lib/email";
import MemoryVerseDueEmail from "@/lib/emails/memory-verse-due";
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://biblestudy.app";
  const today = new Date().toISOString().slice(0, 10);

  // Find users with verses due today and email digest enabled
  const { data: dueRows } = await supabase
    .from("memory_verses")
    .select("user_id")
    .lte("next_review_at", today)
    .eq("mastered", false);

  if (!dueRows?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  // Count dues per user
  const dueByUser: Record<string, number> = {};
  for (const row of dueRows) {
    const uid = row.user_id as string;
    dueByUser[uid] = (dueByUser[uid] ?? 0) + 1;
  }

  const userIds = Object.keys(dueByUser);

  // Get profiles + notification settings
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .in("id", userIds);

  const { data: notifSettings } = await supabase
    .from("notification_settings")
    .select("user_id, email_digest")
    .in("user_id", userIds)
    .eq("email_digest", true);

  const enabledUsers = new Set(
    (notifSettings ?? []).map((n) => n.user_id as string)
  );

  let sent = 0;
  const errors: string[] = [];

  for (const profile of profiles ?? []) {
    const uid = profile.id as string;
    if (!enabledUsers.has(uid)) continue;
    const dueCount = dueByUser[uid] ?? 0;
    const email = profile.email as string;
    if (!email) continue;

    const ok = await trySendEmail({
      to: email,
      subject: `${dueCount} verse${dueCount !== 1 ? "s" : ""} ready for review`,
      react: React.createElement(MemoryVerseDueEmail, {
        recipientName: profile.display_name as string | null,
        dueCount,
        reviewUrl: `${appUrl}/profile/memory-verses/review`,
      }),
      tags: [{ name: "type", value: "memory-verse-reminder" }],
    });

    if (ok) sent++;
    else errors.push(uid);
  }

  return NextResponse.json({ ok: true, sent, errors });
}
