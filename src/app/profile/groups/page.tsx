import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GroupsClient from "./groups-client";

export const metadata = {
  title: "Study Groups | Bible Study",
};

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Get groups the user is a member of
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: memberRows } = await (supabase as any)
    .from("study_group_members")
    .select("group_id, role")
    .eq("user_id", user.id);

  const groupIds = (memberRows ?? []).map((r: { group_id: string }) => r.group_id);
  const roleMap = new Map<string, string>(
    (memberRows ?? []).map((r: { group_id: string; role: string }) => [r.group_id, r.role] as [string, string])
  );

  let groups: {
    id: string;
    name: string;
    invite_code: string;
    group_type: string;
    memberCount: number;
    myRole: string;
  }[] = [];

  if (groupIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: groupRows } = await (supabase as any)
      .from("study_groups")
      .select("id, name, invite_code, group_type")
      .in("id", groupIds)
      .eq("is_active", true);

    if (groupRows) {
      // count members for each group
      const memberCounts: Record<string, number> = {};
      await Promise.all(
        (groupRows as { id: string }[]).map(async (g) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { count } = await (supabase as any)
            .from("study_group_members")
            .select("id", { count: "exact", head: true })
            .eq("group_id", g.id);
          memberCounts[g.id] = count ?? 0;
        })
      );

      groups = (groupRows as { id: string; name: string; invite_code: string; group_type: string }[]).map((g) => ({
        id: g.id,
        name: g.name,
        invite_code: g.invite_code,
        group_type: g.group_type,
        memberCount: memberCounts[g.id] ?? 0,
        myRole: roleMap.get(g.id) ?? "member",
      }));
    }
  }

  return (
    <GroupsClient
      groups={groups}
      displayName={(profile?.display_name as string | null) ?? null}
    />
  );
}
