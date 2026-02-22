import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CrossReferenceTrailRow, TrailStepRow } from "@/types/database";

// GET /api/trails/[id] — full trail with steps
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: rawTrail, error } = await supabase
    .from("cross_reference_trails")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !rawTrail) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const trail = rawTrail as unknown as CrossReferenceTrailRow;

  // Check access: must be owner or public
  if (trail.user_id !== user.id && !trail.is_public) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: rawSteps } = await supabase
    .from("trail_steps")
    .select("*")
    .eq("trail_id", id)
    .order("step_order");

  const steps = (rawSteps ?? []) as unknown as TrailStepRow[];

  return NextResponse.json({ trail, steps });
}

// PATCH /api/trails/[id] — update name, mark public, set completed
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Partial<{ name: string; is_public: boolean; completed_at: string }> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.is_public !== undefined) updates.is_public = body.is_public;
  if (body.completed) updates.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from("cross_reference_trails")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
