"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a random 6-char alphanumeric invite code. */
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── Actions ──────────────────────────────────────────────────────────────────

export type GroupType = "family" | "church" | "friends";

/**
 * Create a new study group.
 * The creator is automatically added as leader.
 */
export async function createGroup(input: {
  name: string;
  groupType: GroupType;
  displayName: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const inviteCode = generateInviteCode();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: group, error: groupError } = await (supabase as any)
    .from("study_groups")
    .insert({
      name: input.name.trim(),
      invite_code: inviteCode,
      created_by: user.id,
      group_type: input.groupType,
    })
    .select("id")
    .single();

  if (groupError || !group) throw new Error(groupError?.message ?? "Failed to create group");
  const groupId = group.id as string;

  // Add creator as leader
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("study_group_members")
    .insert({
      group_id: groupId,
      user_id: user.id,
      display_name: input.displayName.trim(),
      role: "leader",
      highlights_visible: false,
      prayer_visible: true,
    });

  revalidatePath("/profile/groups");
  return { groupId, inviteCode };
}

/**
 * Join an existing group by invite code.
 */
export async function joinGroup(input: {
  inviteCode: string;
  displayName: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Find group by invite code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: group, error: findError } = await (supabase as any)
    .from("study_groups")
    .select("id, name, is_active")
    .eq("invite_code", input.inviteCode.toUpperCase().trim())
    .single();

  if (findError || !group) throw new Error("Invalid invite code");
  if (!group.is_active) throw new Error("This group is no longer active");

  const groupId = group.id as string;

  // Check if already a member
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("study_group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) throw new Error("You are already a member of this group");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("study_group_members")
    .insert({
      group_id: groupId,
      user_id: user.id,
      display_name: input.displayName.trim(),
      role: "member",
    });

  revalidatePath("/profile/groups");
  return { groupId, groupName: group.name as string };
}

/**
 * Update the user's own member settings (highlights visible, prayer visible).
 */
export async function updateMemberSettings(input: {
  groupId: string;
  highlightsVisible: boolean;
  prayerVisible: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("study_group_members")
    .update({
      highlights_visible: input.highlightsVisible,
      prayer_visible: input.prayerVisible,
    })
    .eq("group_id", input.groupId)
    .eq("user_id", user.id);

  revalidatePath(`/profile/groups/${input.groupId}`);
}

/**
 * Leave a group.
 */
export async function leaveGroup(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("study_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  revalidatePath("/profile/groups");
}

/**
 * Post a message to a group verse thread, creating the thread if needed.
 */
export async function postGroupThreadMessage(input: {
  groupId: string;
  book: string;
  chapter: number;
  verse: number;
  body: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const verseRef = `${input.book} ${input.chapter}:${input.verse}`;

  // Get or create thread
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: thread } = await (supabase as any)
    .from("group_verse_threads")
    .select("id")
    .eq("group_id", input.groupId)
    .eq("verse_ref", verseRef)
    .maybeSingle();

  if (!thread) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newThread, error: threadError } = await (supabase as any)
      .from("group_verse_threads")
      .insert({
        group_id: input.groupId,
        verse_ref: verseRef,
        book: input.book,
        chapter: input.chapter,
        verse: input.verse,
        thread_starter_id: user.id,
      })
      .select("id")
      .single();
    if (threadError || !newThread) throw new Error("Failed to create thread");
    thread = newThread;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("group_thread_messages")
    .insert({
      thread_id: thread.id as string,
      user_id: user.id,
      body: input.body.trim(),
    });

  revalidatePath(`/profile/groups/${input.groupId}`);
}

/**
 * Add a prayer request to a group.
 */
export async function addGroupPrayer(input: {
  groupId: string;
  body: string;
  verseRef?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("group_prayer_requests")
    .insert({
      group_id: input.groupId,
      user_id: user.id,
      body: input.body.trim(),
      verse_ref: input.verseRef ?? null,
      is_answered: false,
    });

  revalidatePath(`/profile/groups/${input.groupId}`);
}

/**
 * Mark a prayer request as answered.
 */
export async function markPrayerAnswered(prayerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("group_prayer_requests")
    .update({ is_answered: true, answered_at: new Date().toISOString() })
    .eq("id", prayerId)
    .eq("user_id", user.id);

  revalidatePath("/profile/groups");
}
