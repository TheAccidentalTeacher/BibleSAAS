import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  ANTHROPIC_MODEL,
  CHARLES_ONBOARDING_SYSTEM,
  buildGiftedOnboardingSystem,
} from "@/lib/charles/prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Message format used by Anthropic API */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * POST /api/onboarding/chat
 *
 * Streaming chat endpoint for the onboarding conversation.
 * Authenticates the user, builds the Charles system prompt
 * (with gifted account support), and streams the response.
 *
 * Request body:
 *   { messages: ChatMessage[] }
 *
 * Response:
 *   A plain text stream (text/plain) with Charles's reply tokens.
 *   Clients append chunks to reconstruct the full message.
 */
export async function POST(request: NextRequest) {
  // ── Auth check ─────────────────────────────────────────────────────────────
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

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  // ── Check for gifted account ───────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("gifted_by, gifted_message")
    .eq("id", user.id)
    .single();

  let systemPrompt = CHARLES_ONBOARDING_SYSTEM;
  if (profile?.gifted_by && profile?.gifted_message) {
    systemPrompt = buildGiftedOnboardingSystem(
      String(profile.gifted_message)
    );
  }

  // ── Stream response ────────────────────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model: ANTHROPIC_MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "AI service error";
        controller.enqueue(
          encoder.encode(`\n\n[Error: ${errorMsg}]`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no", // Disable Nginx buffering (important for Vercel)
    },
  });
}
