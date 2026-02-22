import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/family/join
// Body: { invite_code }  — invite_code is the family unit UUID
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Already in a unit?
  const { data: existing } = await supabase
    .from("family_members")
    .select("family_unit_id")
    .eq("user_id", user.id)
    .single();
  if (existing) return NextResponse.json({ error: "Already in a family unit" }, { status: 400 });

  const { invite_code } = await req.json() as { invite_code: string };

  // invite_code is the unit id
  const { data: unit, error } = await supabase
    .from("family_units")
    .select("id, name")
    .eq("id", invite_code)
    .single();

  if (error || !unit) return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });

  const { error: joinErr } = await supabase.from("family_members").insert({
    family_unit_id: unit.id,
    user_id: user.id,
    role: "member",
  });

  if (joinErr) return NextResponse.json({ error: joinErr.message }, { status: 500 });

  return NextResponse.json({ unit });
}
