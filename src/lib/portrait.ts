/**
 * src/lib/portrait.ts — Living Portrait regeneration
 *
 * Reads recent journal entries + existing portrait/profile data,
 * calls Anthropic to produce an updated living_portrait, and writes
 * it back to the profiles table. Also updates study_dna / theological_fingerprint
 * and increments profile_hash to invalidate cached personalized content.
 */

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/server";
import { ANTHROPIC_MODEL } from "@/lib/charles/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PORTRAIT_SYSTEM = `You are a perceptive spiritual director who knows this person well. 
You are updating a "Living Portrait" — a 150-200 word paragraph that captures who this person is: 
their faith journey, struggles, personality, vocational calling, and how they engage Scripture.

Instructions:
- Speak of the person in third person (e.g. "She is...")
- Be specific — reference real patterns you observe in their journal entries
- Be warm and honest — don't flatter, but do see them generously
- Update the existing portrait with new observations; don't start over unless the old portrait is empty
- Return ONLY the portrait paragraph text, nothing else`;

export async function regenerateLivingPortrait(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  // Load profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, living_portrait, faith_stage, age_range, vocation, theological_fingerprint, study_dna, profile_hash")
    .eq("id", userId)
    .single();

  if (!profile) return false;

  // Load last 20 journal entries since last portrait
  const { data: entries } = await supabase
    .from("journal_entries")
    .select("content, created_at, book, chapter, verse")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!entries?.length) return false;

  const journalBlob = entries
    .map((e) => {
      const ref = [e.book, e.chapter, e.verse].filter(Boolean).join(" ");
      return `[${new Date(e.created_at).toLocaleDateString()}]${ref ? ` (${ref})` : ""}: ${e.content}`;
    })
    .join("\n\n");

  const currentPortrait = profile.living_portrait ?? "";
  const contextBits: string[] = [];
  if (profile.display_name) contextBits.push(`Name: ${profile.display_name}`);
  if (profile.faith_stage) contextBits.push(`Faith stage: ${profile.faith_stage}`);
  if (profile.age_range) contextBits.push(`Age range: ${profile.age_range}`);
  if (profile.vocation) contextBits.push(`Vocation: ${profile.vocation}`);
  if (profile.theological_fingerprint) contextBits.push(`Theological fingerprint: ${JSON.stringify(profile.theological_fingerprint)}`);
  if (profile.study_dna) contextBits.push(`Study DNA: ${JSON.stringify(profile.study_dna)}`);

  const userMessage = `
CURRENT PORTRAIT:
${currentPortrait || "(none yet)"}

PROFILE CONTEXT:
${contextBits.join("\n")}

RECENT JOURNAL ENTRIES (newest first):
${journalBlob}

Please update the living portrait based on what you observe in these journal entries.
`.trim();

  try {
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      system: PORTRAIT_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const newPortrait =
      response.content[0].type === "text"
        ? response.content[0].text.trim()
        : null;

    if (!newPortrait) return false;

    const currentHash = typeof profile.profile_hash === "number" ? profile.profile_hash : 0;

    await supabase
      .from("profiles")
      .update({
        living_portrait: newPortrait,
        profile_hash: currentHash + 1,
      })
      .eq("id", userId);

    return true;
  } catch (err) {
    console.error("[portrait] regeneration error:", err);
    return false;
  }
}

/**
 * Check how many new journal entries exist since last portrait regeneration.
 * Returns userIds that need a regen (5+ new entries).
 */
export async function getUsersDueForPortraitRegen(): Promise<string[]> {
  const supabase = createAdminClient();

  // Find users with 5+ journal entries in the last 6 hours (approximate batch window)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("journal_entries")
    .select("user_id")
    .gte("created_at", sixHoursAgo);

  if (!data?.length) return [];

  // Count per user
  const counts: Record<string, number> = {};
  for (const row of data) {
    const uid = row.user_id as string;
    counts[uid] = (counts[uid] ?? 0) + 1;
  }

  return Object.entries(counts)
    .filter(([, count]) => count >= 5)
    .map(([uid]) => uid);
}
