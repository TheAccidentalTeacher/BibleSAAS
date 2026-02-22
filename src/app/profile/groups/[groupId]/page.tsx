import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GroupDetailClient from "./group-detail-client";

interface Props {
  params: Promise<{ groupId: string }>;
}

export default async function GroupDetailPage({ params }: Props) {
  const { groupId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify membership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: membership } = await (supabase as any)
    .from("study_group_members")
    .select("role, display_name, highlights_visible, prayer_visible")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/profile/groups");

  // Group info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: group } = await (supabase as any)
    .from("study_groups")
    .select("name, invite_code, group_type")
    .eq("id", groupId)
    .single();

  if (!group) redirect("/profile/groups");

  // Members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: members } = await (supabase as any)
    .from("study_group_members")
    .select("user_id, display_name, role, highlights_visible, prayer_visible")
    .eq("group_id", groupId)
    .order("role", { ascending: true });

  // Threads with messages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawThreads } = await (supabase as any)
    .from("group_verse_threads")
    .select(
      `id, verse_ref, book, chapter, verse,
       group_thread_messages(
         id, user_id, body, created_at,
         profiles(username)
       )`
    )
    .eq("group_id", groupId)
    .order("updated_at", { ascending: false });

  // Build member display_name map
  const memberMap: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (members ?? []).forEach((m: any) => {
    memberMap[m.user_id] = m.display_name;
  });

  // Normalise threads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const threads = (rawThreads ?? []).map((t: any) => ({
    id: t.id as string,
    verse_ref: t.verse_ref as string,
    book: t.book as string,
    chapter: t.chapter as number,
    verse: t.verse as number | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: (t.group_thread_messages ?? []).map((msg: any) => ({
      id: msg.id as string,
      user_id: msg.user_id as string,
      body: msg.body as string,
      created_at: msg.created_at as string,
      display_name: memberMap[msg.user_id] ?? (msg.profiles?.username ?? "Member"),
    })),
  }));

  // Prayer requests (only if prayer_visible=true in their settings — already filtered by DB policy ideally,
  // but we fetch all and filter client-safe since settings live in members table)
  const visibleUserIds = new Set<string>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (members ?? []).filter((m: any) => m.prayer_visible).map((m: any) => m.user_id as string)
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawPrayers } = await (supabase as any)
    .from("group_prayer_requests")
    .select("id, user_id, body, verse_ref, is_answered, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prayers = (rawPrayers ?? []).filter((p: any) =>
    visibleUserIds.has(p.user_id) || p.user_id === user.id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).map((p: any) => ({
    id: p.id as string,
    user_id: p.user_id as string,
    body: p.body as string,
    verse_ref: p.verse_ref as string | null,
    is_answered: p.is_answered as boolean,
    created_at: p.created_at as string,
    display_name: memberMap[p.user_id] ?? "Member",
  }));

  return (
    <GroupDetailClient
      groupId={groupId}
      groupName={group.name}
      inviteCode={group.invite_code}
      groupType={group.group_type}
      threads={threads}
      prayers={prayers}
      members={members ?? []}
      currentUserId={user.id}
      myRole={membership.role}
      myHighlightsVisible={membership.highlights_visible}
      myPrayerVisible={membership.prayer_visible}
    />
  );
}
