"use client";

/**
 * VerseThreadPanel — Slide-up sheet showing thread messages for a given verse.
 *
 * Features:
 * - Displays all messages chronologically
 * - Reply input at bottom
 * - Marks messages as read on open
 * - Flame icon accent color from family unit
 */

import { useState, useEffect, useRef } from "react";
import { X, Send, Flame } from "lucide-react";

interface ThreadMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  body: string;
  created_at: string;
  is_mine: boolean;
  read_by: Record<string, string> | null;
}

interface VerseThreadPanelProps {
  book: string;
  bookName: string;
  chapter: number;
  verse: number;
  verseText: string;
  accentColor?: string;
  onClose: () => void;
}

export default function VerseThreadPanel({
  book,
  bookName,
  chapter,
  verse,
  verseText,
  accentColor = "#7C6B5A",
  onClose,
}: VerseThreadPanelProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, verse]);

  async function loadMessages() {
    setLoading(true);
    const res = await fetch(`/api/verse-thread?book=${book}&chapter=${chapter}&verse=${verse}`);
    if (res.ok) {
      const { messages: msgs } = await res.json() as { messages: ThreadMessage[] };
      setMessages(msgs);

      // Mark unread messages as read
      const unread = msgs.filter((m) => !m.is_mine && !m.read_by?.[m.sender_id]);
      if (unread.length > 0) {
        await fetch("/api/verse-thread", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message_ids: unread.map((m) => m.id) }),
        });
      }
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function handleSend() {
    if (!reply.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/verse-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book, chapter, verse, body: reply.trim() }),
    });
    if (res.ok) {
      setReply("");
      await loadMessages();
    }
    setSending(false);
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl border-t"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          maxHeight: "80vh",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--color-border)" }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <Flame size={16} style={{ color: accentColor }} />
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-1)" }}>
              {bookName} {chapter}:{verse}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--color-text-2)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Verse preview */}
        <div
          className="px-4 py-3 border-b text-sm leading-relaxed"
          style={{
            borderColor: "var(--color-border)",
            background: `${accentColor}15`,
            color: "var(--color-text-2)",
            fontFamily: "var(--font-serif)",
          }}
        >
          &ldquo;{verseText}&rdquo;
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--color-border)", borderTopColor: accentColor }} />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Flame size={28} style={{ color: accentColor, opacity: 0.5 }} />
              <p className="text-sm text-center" style={{ color: "var(--color-text-3)" }}>
                Start a conversation about this verse with your family.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.is_mine ? "items-end" : "items-start"}`}
            >
              {!msg.is_mine && (
                <p className="text-[10px] mb-1 ml-1" style={{ color: "var(--color-text-3)" }}>
                  {msg.sender_name}
                </p>
              )}
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  background: msg.is_mine ? accentColor : "var(--color-surface-2)",
                  color: msg.is_mine ? "#fff" : "var(--color-text-1)",
                }}
              >
                {msg.body}
              </div>
              <p className="text-[10px] mt-1 mx-1" style={{ color: "var(--color-text-3)" }}>
                {formatTime(msg.created_at)}
                {msg.is_mine && msg.read_by && Object.keys(msg.read_by).length > 0 && (
                  <span className="ml-1">· Seen</span>
                )}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Reply input */}
        <div
          className="flex items-end gap-2 px-4 py-3 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <textarea
            className="flex-1 rounded-xl border px-3 py-2.5 text-sm resize-none outline-none"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-1)",
              minHeight: "40px",
              maxHeight: "120px",
            }}
            rows={1}
            maxLength={1000}
            placeholder="Reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!reply.trim() || sending}
            aria-label="Send"
            className="flex items-center justify-center w-10 h-10 rounded-full disabled:opacity-40 shrink-0"
            style={{ background: accentColor, color: "#fff" }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
