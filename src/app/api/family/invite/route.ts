import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/family/invite — return the invite link for the current user's family unit
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_unit_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) return NextResponse.json({ error: "Not in a family unit" }, { status: 400 });

  return NextResponse.json({ invite_code: membership.family_unit_id });
}
