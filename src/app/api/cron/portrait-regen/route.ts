/**
 * POST /api/cron/portrait-regen
 *
 * Finds users who have 5+ new journal entries in the last 6 hours
 * and regenerates their living_portrait.
 * Called by Vercel Cron every 6 hours.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  regenerateLivingPortrait,
  getUsersDueForPortraitRegen,
} from "@/lib/portrait";

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

  const userIds = await getUsersDueForPortraitRegen();

  if (!userIds.length) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  let succeeded = 0;
  let failed = 0;

  for (const userId of userIds) {
    const ok = await regenerateLivingPortrait(userId);
    if (ok) succeeded++;
    else failed++;
  }

  return NextResponse.json({ ok: true, processed: userIds.length, succeeded, failed });
}
