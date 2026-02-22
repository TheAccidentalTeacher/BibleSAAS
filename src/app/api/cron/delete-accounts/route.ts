/**
 * GET /api/cron/delete-accounts
 *
 * Daily cron: finds profiles where `deletion_requested_at` is more than
 * 30 days ago and permanently deletes the Supabase Auth user.
 * Cascade deletes all profile data automatically.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GRACE_DAYS = 30;

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const cutoff = new Date(Date.now() - GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Find profiles pending deletion past the grace period
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("id, deletion_requested_at")
    .not("deletion_requested_at", "is", null)
    .lte("deletion_requested_at" as never, cutoff as never);

  if (error) {
    console.error("[delete-accounts cron] fetch error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const toDelete = (profiles ?? []) as { id: string; deletion_requested_at: string }[];

  let deleted = 0;
  let failed = 0;

  for (const profile of toDelete) {
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(profile.id);
    if (deleteError) {
      console.error(`[delete-accounts cron] failed to delete ${profile.id}:`, deleteError.message);
      failed++;
    } else {
      console.log(`[delete-accounts cron] deleted user ${profile.id}`);
      deleted++;
    }
  }

  return NextResponse.json({
    checked: toDelete.length,
    deleted,
    failed,
  });
}
