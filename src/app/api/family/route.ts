import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/family — get current user's family unit + members
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find membership
  const { data: membership } = await supabase
    .from("family_members")
    .select("family_unit_id, role, joined_at")
    .eq("user_id", user.id)
    .single();

  if (!membership) return NextResponse.json({ unit: null, members: [] });

  const { data: unit } = await supabase
    .from("family_units")
    .select("id, name, accent_color, created_by, created_at")
    .eq("id", membership.family_unit_id)
    .single();

  const { data: members } = await supabase
    .from("family_members")
    .select("user_id, role, joined_at")
    .eq("family_unit_id", membership.family_unit_id);

  // Enrich with profile display names
  const userIds = (members ?? []).map((m) => m.user_id);
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const enriched = (members ?? []).map((m) => ({
    ...m,
    display_name: profileMap[m.user_id]?.display_name ?? "Member",
    avatar_url: profileMap[m.user_id]?.avatar_url ?? null,
    is_me: m.user_id === user.id,
  }));

  return NextResponse.json({ unit, members: enriched, my_role: membership.role });
}

// POST /api/family — create a new family unit
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check not already in a unit
  const { data: existing } = await supabase
    .from("family_members")
    .select("family_unit_id")
    .eq("user_id", user.id)
    .single();
  if (existing) return NextResponse.json({ error: "Already in a family unit" }, { status: 400 });

  const { name, accent_color } = await req.json() as { name: string; accent_color?: string };

  const { data: unit, error: unitErr } = await supabase
    .from("family_units")
    .insert({ name, created_by: user.id, accent_color: accent_color ?? "#7C6B5A" })
    .select("id, name, accent_color, created_by, created_at")
    .single();

  if (unitErr) return NextResponse.json({ error: unitErr.message }, { status: 500 });

  await supabase.from("family_members").insert({
    family_unit_id: unit.id,
    user_id: user.id,
    role: "admin",
  });

  return NextResponse.json({ unit });
}

// PATCH /api/family — update unit name/accent_color (admin only)
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_unit_id, role")
    .eq("user_id", user.id)
    .single();
  if (!membership) return NextResponse.json({ error: "Not in a family unit" }, { status: 400 });
  if (membership.role !== "admin") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const updates = await req.json() as { name?: string; accent_color?: string };
  await supabase
    .from("family_units")
    .update(updates)
    .eq("id", membership.family_unit_id);

  return NextResponse.json({ ok: true });
}

// DELETE /api/family — leave (or delete if admin & last)
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_unit_id, role")
    .eq("user_id", user.id)
    .single();
  if (!membership) return NextResponse.json({ error: "Not in a family unit" }, { status: 400 });

  await supabase
    .from("family_members")
    .delete()
    .eq("user_id", user.id)
    .eq("family_unit_id", membership.family_unit_id);

  // If no members left, delete the unit
  const { count } = await supabase
    .from("family_members")
    .select("id", { count: "exact", head: true })
    .eq("family_unit_id", membership.family_unit_id);

  if ((count ?? 0) === 0) {
    await supabase.from("family_units").delete().eq("id", membership.family_unit_id);
  }

  return NextResponse.json({ ok: true });
}
