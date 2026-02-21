/**
 * /api/reading-plans — Reading plan management
 *
 * GET  → list all system reading plans + user's active plan
 * POST { plan_id } → activate a plan for the current user
 * DELETE { id }   → deactivate (mark inactive)
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ReadingPlanRow, UserReadingPlanRow, PlanChapterRow } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // All system plans with chapter count
  const { data: plansData, error: plansErr } = await supabase
    .from("reading_plans")
    .select("*")
    .eq("is_system", true)
    .order("is_default", { ascending: false });

  if (plansErr) return NextResponse.json({ error: plansErr.message }, { status: 500 });
  const plans = (plansData as unknown as ReadingPlanRow[]) ?? [];

  // User's active plan
  const { data: activeData } = await supabase
    .from("user_reading_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  const activePlan = activeData as unknown as UserReadingPlanRow | null;

  return NextResponse.json({ plans, activePlan });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { plan_id: string };

  // Deactivate any existing active plans
  await supabase
    .from("user_reading_plans")
    .update({ active: false })
    .eq("user_id", user.id)
    .eq("active", true);

  // Activate the new plan
  const { data, error } = await supabase
    .from("user_reading_plans")
    .insert({
      user_id: user.id,
      plan_id: body.plan_id,
      started_at: new Date().toISOString(),
      current_day: 1,
      active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ userPlan: data as unknown as UserReadingPlanRow });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: string };

  const { error } = await supabase
    .from("user_reading_plans")
    .update({ active: false })
    .eq("id", body.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
