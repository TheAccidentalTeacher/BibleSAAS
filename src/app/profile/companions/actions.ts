"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_MODEL } from "@/lib/charles/prompts";

/**
 * Set the user's active companion (null = back to Charles default).
 */
export async function setActiveCompanion(companionId: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase
    .from("profiles")
    .update({ active_companion_id: companionId })
    .eq("id", user.id);

  revalidatePath("/profile/companions");
}

/**
 * Purchase a companion (inserts a user_companions row).
 * Actual payment is handled via Stripe checkout — this action is called
 * after a successful webhook confirmation. For now it can be called
 * directly for free companions or as a test helper.
 */
export async function unlockCompanion(companionId: string, stripePaymentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("user_companions")
    .upsert(
      {
        user_id: user.id,
        companion_id: companionId,
        stripe_payment_id: stripePaymentId ?? null,
      },
      { onConflict: "user_id,companion_id" }
    );

  revalidatePath("/profile/companions");
}

// ── Persona Builder ───────────────────────────────────────────────────────────

export interface PersonaBuildInput {
  name: string;
  tradition: string[];
  style: "conversational" | "scholarly" | "devotional" | "prophetic";
  sourceCompanionSlugs: string[];
  voiceNotes: string;
}

/**
 * Generates a custom persona system_prompt_block and saves it as a
 * user_companions row with is_custom_build = true.
 * Returns the new companion row ID.
 */
export async function buildPersona(input: PersonaBuildInput): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check tier — only Your Edition
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if ((profile?.subscription_tier as string) !== "your_edition") {
    throw new Error("Persona Builder is a Living Bible exclusive feature.");
  }

  // Load source companion style notes for context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sources } = await (supabase as any)
    .from("companion_definitions")
    .select("display_name, style_notes, theological_dna")
    .in("slug", input.sourceCompanionSlugs);

  const sourceBlock =
    sources && sources.length > 0
      ? sources
          .map(
            (s: { display_name: string; style_notes: string | null }) =>
              `- ${s.display_name as string}: ${(s.style_notes as string | null)?.slice(0, 200) ?? ""}`
          )
          .join("\n")
      : "No specific sources selected.";

  const buildPrompt = `You are designing the system-prompt persona block for a custom AI Bible study companion.

The user has defined the following:
- Companion name: ${input.name}
- Theological traditions: ${input.tradition.join(", ") || "not specified"}
- Communication style: ${input.style}
- Source theologians to synthesize: 
${sourceBlock}
- Custom voice notes: ${input.voiceNotes || "none"}

Write a 200–300 word "Identity and Rules" block that:
1. Opens with "You are ${input.name}..." defining the persona
2. Lists the theological emphases (bullet points)
3. Describes the communication style (2–3 sentences)
4. States 3–4 cardinal rules specific to this persona

Write ONLY the persona block — no preamble, no explanation, no markdown fences.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: buildPrompt }],
  });

  const systemPromptBlock =
    response.content[0]?.type === "text" ? response.content[0].text : "";

  // Insert a companion_definitions row for this custom companion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newDef } = await (supabase as any)
    .from("companion_definitions")
    .insert({
      slug: `custom_${user.id.slice(0, 8)}_${Date.now()}`,
      display_name: input.name,
      tagline: `Custom companion — ${input.tradition.join(", ") || input.style}`,
      tradition: input.tradition[0] ?? "custom",
      theological_dna: input.tradition,
      style_notes: systemPromptBlock,
      is_default: false,
      is_custom: true,
      price_usd: 0,
      sort_order: 99,
      is_active: true,
    })
    .select("id")
    .single();

  if (!newDef) throw new Error("Failed to save persona");

  const companionDefId = newDef.id as string;

  // Add user_companions row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("user_companions").insert({
    user_id: user.id,
    companion_id: companionDefId,
    is_custom_build: true,
    custom_config: {
      name: input.name,
      tradition: input.tradition,
      style: input.style,
      sourceCompanionSlugs: input.sourceCompanionSlugs,
      voiceNotes: input.voiceNotes,
    },
  });

  revalidatePath("/profile/companions");
  return companionDefId;
}
