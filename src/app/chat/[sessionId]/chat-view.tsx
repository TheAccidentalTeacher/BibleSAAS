"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, ArrowLeft, MoreHorizontal, Trash2, BookOpen } from "lucide-react";
import type { ChatSessionRow, ChatMessageRow } from "@/types/database";

interface Props {
  session: ChatSessionRow;
  initialMessages: ChatMessageRow[];
}

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedQuestions: Array<{ text: string }>;
  isStreaming?: boolean;
}

const SENTINEL = "\x00";

export default function ChatView({ session, initialMessages }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<DisplayMessage[]>(() =>
    initialMessages.map((m) => ({
      id: m.id as string,
      role: m.role as "user" | "assistant",
      content: m.content as string,
      suggestedQuestions: (m.suggested_questions as Array<{ text: string }>) ?? [],
    }))
  );
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionTitle, setSessionTitle] = useState<string>(
    (session.title as string | null) ?? ""
  );
  const [showMenu, setShowMenu] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const anchorBook = session.anchor_book as string | null;
  const anchorChapter = session.anchor_chapter as number | null;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setInput("");
      setIsStreaming(true);

      // Append user message optimistically
      const userMsgId = `optimistic-user-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: trimmed, suggestedQuestions: [] },
      ]);

      // Placeholder assistant message
      const assistantMsgId = `optimistic-assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          suggestedQuestions: [],
          isStreaming: true,
        },
      ]);

      abortRef.current = new AbortController();

      try {
        const resp = await fetch("/api/chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            message: trimmed,
            anchorBook: anchorBook ?? undefined,
            anchorChapter: anchorChapter ?? undefined,
          }),
          signal: abortRef.current.signal,
        });

        if (!resp.ok || !resp.body) throw new Error("Stream failed");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let displayContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Check for sentinel that separates content from metadata
          const sentinelIdx = buffer.indexOf(`\n${SENTINEL}\n`);
          if (sentinelIdx !== -1) {
            // Everything before sentinel is displayable content
            displayContent = buffer.slice(0, sentinelIdx);
            const metaStr = buffer.slice(sentinelIdx + 3); // skip "\n\x00\n"

            // Parse suggested questions
            let suggestedQuestions: Array<{ text: string }> = [];
            let newTitle: string | undefined;
            try {
              const meta = JSON.parse(metaStr) as {
                suggestedQuestions?: Array<{ text: string }>;
                title?: string;
                error?: string;
              };
              suggestedQuestions = meta.suggestedQuestions ?? [];
              newTitle = meta.title;
            } catch {
              // ignore parse errors
            }

            // Parse content if it's JSON (Charles returns { content, suggested_questions })
            let finalContent = displayContent;
            try {
              const jsonStart = displayContent.indexOf("{");
              const jsonEnd = displayContent.lastIndexOf("}");
              if (jsonStart !== -1 && jsonEnd !== -1) {
                const parsed = JSON.parse(displayContent.slice(jsonStart, jsonEnd + 1)) as {
                  content?: string;
                };
                finalContent = parsed.content ?? displayContent;
              }
            } catch {
              // use as-is
            }

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: finalContent, suggestedQuestions, isStreaming: false }
                  : m
              )
            );

            if (newTitle) setSessionTitle(newTitle);
            break;
          } else {
            // Still accumulating — show streaming text (render the raw buffer)
            // Try to show content if it already looks like JSON with content key
            let displayBuffer = buffer;
            try {
              const jsonStart = buffer.indexOf("{");
              if (jsonStart !== -1) {
                const partial = buffer.slice(jsonStart);
                const contentMatch = /"content"\s*:\s*"((?:[^"\\]|\\.)*)/.exec(partial);
                if (contentMatch) displayBuffer = contentMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
              }
            } catch {
              // use raw buffer
            }

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: displayBuffer, isStreaming: true }
                  : m
              )
            );
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: "Something went wrong. Please try again.", isStreaming: false }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [isStreaming, session.id, anchorBook, anchorChapter]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  const deleteSession = useCallback(async () => {
    await fetch(`/api/chat/sessions/${session.id as string}`, { method: "DELETE" });
    router.push("/profile/chats");
  }, [session.id, router]);

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg-primary)]">
      {/* ── Header ── */}
      <header
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
      >
        <Link href="/profile/chats" className="flex-none text-[var(--color-text-secondary)]">
          <ArrowLeft size={20} />
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {sessionTitle || "New Conversation"}
          </p>
          {anchorBook && anchorChapter && (
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              <BookOpen size={10} className="inline mr-1" />
              {anchorBook} {anchorChapter}
            </p>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="p-1.5 rounded-lg text-[var(--color-text-secondary)]"
          >
            <MoreHorizontal size={18} />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-40 rounded-xl shadow-lg overflow-hidden z-50"
              style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" }}
            >
              <button
                type="button"
                onClick={() => { void deleteSession(); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5"
              >
                <Trash2 size={14} />
                Delete chat
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-xl font-bold"
              style={{ background: "var(--color-accent)", color: "var(--color-bg-primary)" }}
            >
              C
            </div>
            <p className="text-base font-semibold text-[var(--color-text-primary)]">
              Ask Charles anything
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xs">
              {anchorBook && anchorChapter
                ? `We're anchored to ${anchorBook} ${anchorChapter}. Ask about this passage or anything on your mind.`
                : "Ask about a passage, a theological concept, or anything you're wrestling with."}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {msg.role === "assistant" && (
              <div
                className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold self-end mb-1"
                style={{ background: "var(--color-accent)", color: "var(--color-bg-primary)" }}
              >
                C
              </div>
            )}

            <div className="max-w-[80%] space-y-2">
              <div
                className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? { background: "var(--color-accent)", color: "var(--color-bg-primary)", borderBottomRightRadius: "4px" }
                    : { background: "var(--color-bg-elevated)", color: "var(--color-text-primary)", borderBottomLeftRadius: "4px" }
                }
              >
                {msg.isStreaming && !msg.content && (
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
                <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                {msg.isStreaming && msg.content && (
                  <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
                )}
              </div>

              {/* Suggested follow-up chips */}
              {!msg.isStreaming && msg.role === "assistant" && msg.suggestedQuestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {msg.suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      className="text-[11px] px-3 py-1.5 rounded-full border transition-colors"
                      style={{
                        borderColor: "var(--color-accent)44",
                        color: "var(--color-accent)",
                        background: "var(--color-accent)11",
                      }}
                      onClick={() => void sendMessage(q.text)}
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 flex items-end gap-2 border-t"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Charles…"
          rows={1}
          maxLength={1000}
          disabled={isStreaming}
          className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none min-h-[44px] max-h-40"
          style={{
            background: "var(--color-bg-primary)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            lineHeight: "1.4",
          }}
          // Auto-grow
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(160, el.scrollHeight)}px`;
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="flex-none w-11 h-11 rounded-xl flex items-center justify-center transition-opacity"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-bg-primary)",
            opacity: !input.trim() || isStreaming ? 0.5 : 1,
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
