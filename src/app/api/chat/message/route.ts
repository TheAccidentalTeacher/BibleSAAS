import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  ANTHROPIC_MODEL,
  buildChatSystemPrompt,
  buildChatTitlePrompt,
  CHAT_TITLE_SYSTEM,
  type ChatUserContext,
  type ChatPassageContext,
  type CompanionContext,
} from "@/lib/charles/prompts";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface MessageBody {
  sessionId?: string;
  message: string;
  anchorBook?: string;
  anchorChapter?: number;
}

/**
 * POST /api/chat/message
 *
 * Streams Charles's response as text/plain tokens, saves both turns to the
 * DB when the stream completes, optionally generates a session title.
 *
 * Request body:  { sessionId?, message, anchorBook?, anchorChapter? }
 * Response:      text/plain stream — raw AI tokens, then "\n\x00\n" sentinel,
 *                then a single JSON line with { suggestedQuestions, title? }
 * Response header: X-Session-Id — the chat session UUID
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: MessageBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { message, anchorBook, anchorChapter } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // ── Get or create session ──────────────────────────────────────────────────
  let sessionId = body.sessionId ?? "";
  if (!sessionId) {
    // We need active_companion_id before creating session — load it first via service
    const { data: minimal } = await supabase
      .from("profiles")
      .select("active_companion_id")
      .eq("id", user.id)
      .single();
    const { data: newSession, error: sessionError } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        anchor_book: anchorBook ?? null,
        anchor_chapter: anchorChapter ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        companion_id: (minimal?.active_companion_id as string | null) ?? null,
      })
      .select("id")
      .single();
    if (sessionError || !newSession) {
      return NextResponse.json({ error: "Could not create session" }, { status: 500 });
    }
    sessionId = newSession.id as string;
  }

  // ── Load user profile ──────────────────────────────────────────────────────
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("display_name, faith_stage, living_portrait, age_range, vocation, active_companion_id")
    .eq("id", user.id)
    .single();

  const userCtx: ChatUserContext = {
    display_name: (profileRaw?.display_name as string | null) ?? null,
    faith_stage: (profileRaw?.faith_stage as string | null) ?? null,
    living_portrait: (profileRaw?.living_portrait as string | null) ?? null,
    age_range: (profileRaw?.age_range as string | null) ?? null,
    vocation: (profileRaw?.vocation as string | null) ?? null,
  };

  // ── Load active companion ──────────────────────────────────────────────────
  let companionCtx: CompanionContext | undefined;
  const activeCompanionId = profileRaw?.active_companion_id as string | null;
  if (activeCompanionId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: companionRow } = await (supabase as any)
      .from("companion_definitions")
      .select("slug, display_name, tradition, theological_dna, style_notes")
      .eq("id", activeCompanionId)
      .single();
    if (companionRow) {
      companionCtx = {
        slug: companionRow.slug as string,
        display_name: companionRow.display_name as string,
        tradition: (companionRow.tradition as string | null) ?? null,
        theological_dna: (companionRow.theological_dna as string[] | null) ?? [],
        style_notes: (companionRow.style_notes as string | null) ?? null,
      };
    }
  }

  // ── Load last 20 messages for context ────────────────────────────────────
  const { data: historyRows } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: true })
    .limit(20);

  const history: Array<{ role: "user" | "assistant"; content: string }> =
    (historyRows ?? []).map((r) => ({
      role: r.role as "user" | "assistant",
      content: r.content as string,
    }));

  // ── Count user turns to decide if we should generate a title ─────────────
  const { count: userMsgCount } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("role", "user");
  const isSecondTurn = (userMsgCount ?? 0) === 1; // about to become 2nd

  // ── Build passage context ─────────────────────────────────────────────────
  let passageCtx: ChatPassageContext | undefined;
  if (anchorBook && anchorChapter) {
    const { BIBLE_BOOKS } = await import("@/lib/bible");
    const bookInfo = BIBLE_BOOKS.find((b) => b.code === anchorBook);
    passageCtx = {
      book: anchorBook,
      bookName: bookInfo?.name ?? anchorBook,
      chapter: anchorChapter,
    };
  }

  const systemPrompt = buildChatSystemPrompt(userCtx, passageCtx, companionCtx);

  // ── Save user message ──────────────────────────────────────────────────────
  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    user_id: user.id,
    role: "user",
    content: message,
  });

  // ── Stream ─────────────────────────────────────────────────────────────────
  const encoder = new TextEncoder();
  const sid = sessionId; // stable copy for closure
  const uid = user.id;

  const stream = new ReadableStream({
    async start(controller) {
      let accumulated = "";

      try {
        const apiMessages: Array<{ role: "user" | "assistant"; content: string }> = [
          ...history,
          { role: "user", content: message },
        ];

        const anthropicStream = anthropic.messages.stream({
          model: ANTHROPIC_MODEL,
          max_tokens: 2048,
          system: systemPrompt,
          messages: apiMessages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const token = event.delta.text;
            accumulated += token;
            controller.enqueue(encoder.encode(token));
          }
        }

        // ── Parse assistant content + suggested questions ──────────────────
        let assistantContent = accumulated;
        let suggestedQuestions: Array<{ text: string }> = [];

        try {
          // Charles is prompted to return JSON: { content, suggested_questions }
          const jsonStart = accumulated.indexOf("{");
          const jsonEnd = accumulated.lastIndexOf("}");
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const parsed = JSON.parse(accumulated.slice(jsonStart, jsonEnd + 1)) as {
              content?: string;
              suggested_questions?: Array<{ text: string }>;
            };
            assistantContent = parsed.content ?? accumulated;
            suggestedQuestions = parsed.suggested_questions ?? [];
          }
        } catch {
          // Not JSON — use raw text
        }

        // ── Save assistant message ────────────────────────────────────────
        await supabase.from("chat_messages").insert({
          session_id: sid,
          user_id: uid,
          role: "assistant",
          content: assistantContent,
          suggested_questions: suggestedQuestions,
        });

        // ── Update session metadata ───────────────────────────────────────
        await supabase
          .from("chat_sessions")
          .update({
            last_message_at: new Date().toISOString(),
            message_count: (userMsgCount ?? 0) * 2 + 2,
          })
          .eq("id", sid);

        // ── Generate title on 2nd user turn ──────────────────────────────
        let generatedTitle: string | undefined;
        if (isSecondTurn) {
          try {
            const titleResp = await anthropic.messages.create({
              model: ANTHROPIC_MODEL,
              max_tokens: 20,
              system: CHAT_TITLE_SYSTEM,
              messages: [{ role: "user", content: buildChatTitlePrompt(message, assistantContent) }],
            });
            if (titleResp.content[0].type === "text") {
              generatedTitle = titleResp.content[0].text.trim().slice(0, 60);
              await supabase
                .from("chat_sessions")
                .update({ title: generatedTitle })
                .eq("id", sid);
            }
          } catch {
            // title generation is best-effort
          }
        }

        // ── Emit sentinel + metadata ──────────────────────────────────────
        const meta = JSON.stringify({
          suggestedQuestions,
          ...(generatedTitle ? { title: generatedTitle } : {}),
        });
        controller.enqueue(encoder.encode(`\n\x00\n${meta}`));
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "AI error";
        controller.enqueue(encoder.encode(`\n\x00\n${JSON.stringify({ error: errMsg })}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
      "X-Session-Id": sid,
    },
  });
}

