import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FamilyClient from "./family-client";

export const metadata = { title: "Family Unit" };

export default async function FamilyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  // Fetch membership
  const { data: membership } = await supabase
    .from("family_members")
    .select("family_unit_id, role")
    .eq("user_id", user.id)
    .single();

  let unit: { id: string; name: string; accent_color: string } | null = null;
  let members: Array<{ user_id: string; role: string; display_name: string; avatar_url: string | null; is_me: boolean }> = [];

  if (membership) {
    const { data: u } = await supabase
      .from("family_units")
      .select("id, name, accent_color")
      .eq("id", membership.family_unit_id)
      .single();
    unit = u ? { id: u.id, name: u.name, accent_color: u.accent_color ?? "#7C6B5A" } : null;

    const { data: mems } = await supabase
      .from("family_members")
      .select("user_id, role, joined_at")
      .eq("family_unit_id", membership.family_unit_id);

    const userIds = (mems ?? []).map((m) => m.user_id);
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds)
      : { data: [] };
    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

    members = (mems ?? []).map((m) => ({
      ...m,
      display_name: (profileMap[m.user_id]?.display_name as string | null) ?? "Member",
      avatar_url: (profileMap[m.user_id]?.avatar_url as string | null) ?? null,
      is_me: m.user_id === user.id,
    }));
  }

  return (
    <FamilyClient
      unit={unit}
      members={members}
      myRole={membership?.role ?? null}
    />
  );
}
