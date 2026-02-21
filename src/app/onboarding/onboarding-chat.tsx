"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OnboardingChatProps {
  isGifted: boolean;
}

/** The phrase Charles uses to signal onboarding is complete */
const COMPLETION_SIGNAL = "Let's get started";

export function OnboardingChat({ isGifted }: OnboardingChatProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Before we get started — tell me a little about yourself. I want to make sure this Bible feels like yours.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll to bottom when messages grow
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage() {
    const content = input.trim();
    if (!content || isStreaming || isCompleting) return;

    setInput("");
    setError(null);

    const userMessage: Message = { role: "user", content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Add an empty assistant message for streaming
    const streamingMessages = [
      ...updatedMessages,
      { role: "assistant" as const, content: "" },
    ];
    setMessages(streamingMessages);
    setIsStreaming(true);

    try {
      // Only send the actual conversation messages (strip the opening which is pre-set)
      // Format for Anthropic API: skip the pre-seeded assistant opener if this is message 1
      const apiMessages =
        updatedMessages.length === 2
          ? // First user message: let the API generate Charles's real response
            [{ role: "user" as const, content }]
          : // Subsequent turns: send the full history
            updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            }));

      const response = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });

        setMessages([
          ...updatedMessages,
          { role: "assistant", content: assistantText },
        ]);
      }

      // Check for completion signal
      if (assistantText.includes(COMPLETION_SIGNAL)) {
        setIsCompleting(true);
        await completeOnboarding([
          ...updatedMessages,
          { role: "assistant", content: assistantText },
        ]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      // Remove the empty streaming message
      setMessages(updatedMessages);
    } finally {
      setIsStreaming(false);
    }
  }

  async function completeOnboarding(finalMessages: Message[]) {
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: finalMessages }),
      });

      if (!response.ok) {
        console.error("Failed to complete onboarding:", await response.text());
      }
    } catch (err) {
      console.error("Onboarding completion error:", err);
    } finally {
      // Always redirect — even if extraction failed, don't trap the user
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main
      className="flex flex-col bg-[var(--color-bg)]"
      style={{ height: "100dvh" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4 flex-shrink-0">
        <div>
          <p
            className="text-lg font-bold text-[var(--color-text-1)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Charles
          </p>
          <p className="text-[12px] text-[var(--color-text-3)] uppercase tracking-widest">
            Getting started
          </p>
        </div>
        {isGifted && (
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px] text-[var(--color-text-3)] uppercase tracking-widest">
            Gift account
          </span>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.map((msg, i) => (
            <OnboardingMessage key={i} message={msg} isStreaming={isStreaming && i === messages.length - 1} />
          ))}

          {isCompleting && (
            <div className="text-center py-4">
              <p className="text-[14px] text-[var(--color-accent)]">
                Setting up your Bible...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-[var(--radius-button)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-400">
              {error}{" "}
              <button
                onClick={() => setError(null)}
                className="underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 flex-shrink-0 sm:px-6">
        <div className="mx-auto max-w-2xl flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your reply..."
            rows={1}
            disabled={isStreaming || isCompleting}
            className="flex-1 resize-none rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-[15px] text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] disabled:opacity-40 transition-colors"
            style={{ maxHeight: "120px", overflowY: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming || isCompleting}
            aria-label="Send"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-accent)] text-[#0F0F0F] transition-colors hover:bg-[var(--color-accent-dim)] disabled:opacity-40 disabled:pointer-events-none"
          >
            {isStreaming ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-[var(--color-text-3)]">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </main>
  );
}

function OnboardingMessage({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming: boolean;
}) {
  const isCharles = message.role === "assistant";

  return (
    <div className={`flex gap-4 ${isCharles ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      {isCharles && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mt-0.5">
          <span
            className="text-[13px] font-bold text-[var(--color-accent)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            C
          </span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-[var(--radius-card)] px-4 py-3 text-[15px] leading-relaxed ${
          isCharles
            ? "bg-[var(--color-surface)] text-[var(--color-text-1)] border border-[var(--color-border)]"
            : "bg-[var(--color-accent)] text-[#0F0F0F]"
        }`}
        style={{ fontFamily: isCharles ? "var(--font-reading)" : undefined }}
      >
        {message.content || (
          isStreaming ? (
            <span className="flex gap-1 items-center h-5">
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}
