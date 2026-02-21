import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  ANTHROPIC_MODEL,
  PROFILE_EXTRACTION_SYSTEM,
  PROFILE_EXTRACTION_USER_PROMPT,
} from "@/lib/charles/prompts";
import type { VisualTheme } from "@/types/database";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ExtractedProfile {
  display_name: string | null;
  age_range: string | null;
  vocation: string | null;
  interests: string[];
  faith_stage: string | null;
  tone_preference: string | null;
  goals: string[];
  default_reading_mode: "read" | "study";
  archetype_hint: VisualTheme;
}

/**
 * POST /api/onboarding/complete
 *
 * Extracts user profile from the onboarding conversation transcript,
 * saves it to the database, sets archetype defaults, marks onboarding
 * complete, and stores the conversation for future reference.
 *
 * Request body:
 *   { messages: ChatMessage[] }
 */
export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let messages: ChatMessage[];
  try {
    const body = await request.json();
    messages = body.messages ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // ── Build transcript string for extraction ─────────────────────────────────
  const transcript = messages
    .map(
      (m) =>
        `${m.role === "user" ? "User" : "Charles"}: ${m.content}`
    )
    .join("\n\n");

  // ── Extract profile via Claude ─────────────────────────────────────────────
  let extracted: ExtractedProfile;
  try {
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 512,
      system: PROFILE_EXTRACTION_SYSTEM,
      messages: [
        {
          role: "user",
          content: PROFILE_EXTRACTION_USER_PROMPT(transcript),
        },
      ],
    });

    const rawJson =
      response.content[0].type === "text"
        ? response.content[0].text.trim()
        : "{}";

    extracted = JSON.parse(rawJson) as ExtractedProfile;
  } catch (err) {
    console.error("Profile extraction failed:", err);
    // Use safe defaults — don't block onboarding completion
    extracted = {
      display_name: null,
      age_range: null,
      vocation: null,
      interests: [],
      faith_stage: null,
      tone_preference: null,
      goals: [],
      default_reading_mode: "read",
      archetype_hint: "default",
    };
  }

  // ── Apply archetype-based display defaults ─────────────────────────────────
  const displayDefaults = archetypeToDisplayDefaults(extracted.archetype_hint);

  // ── Save to database in a transaction-like sequence ────────────────────────
  try {
    // 1. Save the conversation transcript
    await supabase.from("onboarding_conversations").insert({
      user_id: user.id,
      messages: messages,
      profile_extracted: true,
      extracted_json: extracted,
      completed_at: new Date().toISOString(),
    });

    // 2. Update profile with extracted data
    await supabase
      .from("profiles")
      .update({
        ...(extracted.display_name
          ? { display_name: extracted.display_name }
          : {}),
        onboarding_complete: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    // 3. Store interests
    if (extracted.interests.length > 0) {
      await supabase.from("profile_interests").insert(
        extracted.interests.map((interest) => ({
          user_id: user.id,
          interest,
        }))
      );
    }

    // 4. Update display settings with archetype defaults
    await supabase
      .from("user_display_settings")
      .update({
        visual_theme: extracted.archetype_hint ?? "default",
        default_reading_mode: extracted.default_reading_mode ?? "read",
        ...displayDefaults,
      })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true, profile: extracted });
  } catch (err) {
    console.error("Failed to save onboarding data:", err);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}

/**
 * Maps archetype to appropriate user_display_settings defaults.
 * Based on the product spec (Session 1 + Session 11).
 */
function archetypeToDisplayDefaults(archetype: VisualTheme): Record<string, unknown> {
  switch (archetype) {
    case "garden":
      // Prayer warrior archetype
      return {
        gamification_enabled: false,
        catechism_layer_enabled: true,
      };
    case "library":
      // Scholar archetype
      return {
        spurgeon_layer: true,
        catechism_layer_enabled: true,
      };
    case "runner":
      // Tim's archetype — keep gamification on, runner theme set via visual_theme
      return {};
    case "puzzle":
      // New believer / seeker
      return {
        default_reading_mode: "study" as const,
      };
    default:
      return {};
  }
}
