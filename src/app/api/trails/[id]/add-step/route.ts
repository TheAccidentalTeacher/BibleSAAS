import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TrailStepRow } from "@/types/database";

// POST /api/trails/[id]/add-step
// Body: { book, chapter, verse, note? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: rawTrail } = await supabase
    .from("cross_reference_trails")
    .select("user_id, step_count")
    .eq("id", id)
    .single();

  if (!rawTrail) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const trail = rawTrail as unknown as { user_id: string; step_count: number };
  if (trail.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { book, chapter, verse, note = null } = body;
  if (!book || !chapter || !verse) {
    return NextResponse.json({ error: "Missing book/chapter/verse" }, { status: 400 });
  }

  const nextOrder = trail.step_count + 1;

  const { data: rawStep, error: stepError } = await supabase
    .from("trail_steps")
    .insert({ trail_id: id, step_order: nextOrder, book, chapter, verse, note })
    .select()
    .single();

  if (stepError || !rawStep) {
    return NextResponse.json({ error: stepError?.message ?? "Failed to add step" }, { status: 500 });
  }

  const step = rawStep as unknown as TrailStepRow;

  // Update step count
  await supabase
    .from("cross_reference_trails")
    .update({ step_count: nextOrder })
    .eq("id", id);

  return NextResponse.json({ step_id: step.id, step_order: nextOrder });
}
