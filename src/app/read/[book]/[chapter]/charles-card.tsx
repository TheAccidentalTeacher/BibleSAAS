"use client";

/**
 * CharlesCard — Floating personalized commentary card (presentational).
 *
 * Receives content from ReadingView (which owns the fetch logic).
 * Free tier: shows Vault card (static, parchment styling).
 * Paid tiers: shows live intro + connections from Charles AI.
 *
 * Dismissible. Re-openable via the Charles avatar button in reading-view.
 */

import { X, BookOpen, MessageSquare } from "lucide-react";
import type { ChapterContent } from "@/lib/charles/content";

interface CharlesCardProps {
  userTier: string;
  content: ChapterContent | null; // null = loading done but free tier or failed
  loading: boolean;               // true = skeleton shimmer
  onStudyClick: () => void;
  onDismiss: () => void;
  onChatClick?: () => void;
}

// Vault card for free tier (parchment treatment)
function VaultCard({
  onStudyClick,
  onDismiss,
  onChatClick,
}: {
  onStudyClick: () => void;
  onDismiss: () => void;
  onChatClick?: () => void;
}) {
  return (
    <div
      className="vault-card relative rounded-2xl p-5 shadow-xl border"
      style={{ borderColor: "#C4A882" }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full bg-black/10"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <span className="vault-badge">FROM THE VAULT</span>
      </div>

      <p
        className="text-sm leading-relaxed mb-4"
        style={{ fontFamily: "var(--font-garamond)", fontSize: "15px" }}
      >
        Every great study begins with the first question: what does the text
        actually say? Before you reach for meaning, stay with the words.
        Observation is harder than interpretation — and more honest.
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onStudyClick}
          className="flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-full"
          style={{ background: "#3D2B1F", color: "#F5ECD7" }}
        >
          <BookOpen size={14} />
          Study this chapter
        </button>
        {onChatClick && (
          <button
            onClick={onChatClick}
            className="flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-full transition-opacity hover:opacity-80"
            style={{ background: "rgba(0,0,0,0.08)", color: "#3D2B1F" }}
          >
            <MessageSquare size={14} />
            Ask Charles
          </button>
        )}
      </div>
    </div>
  );
}

// Connection chips row
function ConnectionChips({
  connections,
}: {
  connections: ChapterContent["connections"];
}) {
  if (!connections?.length) return null;

  const typeColors: Record<string, string> = {
    life: "var(--color-accent)",
    cross_ref: "#6B7280",
    history: "#92400E",
    theme: "#4B5563",
  };

  return (
    <div className="flex gap-2 flex-wrap mt-3">
      {connections.map((c, i) => (
        <div
          key={i}
          className="text-xs px-3 py-1.5 rounded-full border"
          style={{
            borderColor: typeColors[c.type] ?? "var(--color-border)",
            color: "var(--color-text-2)",
            background: "var(--color-surface-2)",
          }}
        >
          {c.type === "cross_ref" && c.ref ? (
            <span>
              <span style={{ color: typeColors.cross_ref }}>↗ {c.ref}</span>{" "}
              {c.text}
            </span>
          ) : (
            c.text
          )}
        </div>
      ))}
    </div>
  );
}

// Loading skeleton (shimmer)
function ShimmerSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 shadow-xl border"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="h-4 rounded mb-2 animate-pulse"
        style={{ background: "var(--color-surface-2)", width: "40%" }}
      />
      <div
        className="h-3 rounded mb-1.5 animate-pulse"
        style={{ background: "var(--color-surface-2)", width: "100%" }}
      />
      <div
        className="h-3 rounded mb-1.5 animate-pulse"
        style={{ background: "var(--color-surface-2)", width: "92%" }}
      />
      <div
        className="h-3 rounded mb-4 animate-pulse"
        style={{ background: "var(--color-surface-2)", width: "78%" }}
      />
      <div className="flex gap-2">
        {[40, 55, 38].map((w, i) => (
          <div
            key={i}
            className="h-6 rounded-full animate-pulse"
            style={{ background: "var(--color-surface-2)", width: `${w}px` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CharlesCard({
  userTier,
  content,
  loading,
  onStudyClick,
  onDismiss,
  onChatClick,
}: CharlesCardProps) {
  const isFree = userTier === "free";

  // Still loading and past 500ms threshold — show skeleton
  if (loading) return <ShimmerSkeleton />;

  // Free user or null content — show Vault card
  if (isFree || !content) {
    return <VaultCard onStudyClick={onStudyClick} onDismiss={onDismiss} onChatClick={onChatClick} />;
  }

  // Loaded with content
  return (
    <div
      className="relative rounded-2xl p-5 shadow-xl border"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full"
        style={{
          background: "var(--color-surface-2)",
          color: "var(--color-text-2)",
        }}
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>

      {/* Intro */}
      <p
        className="text-sm leading-relaxed pr-8"
        style={{
          color: "var(--color-text-1)",
          fontFamily: "var(--font-garamond)",
          fontSize: "15px",
          lineHeight: "1.65",
        }}
      >
        {content.intro}
      </p>

      {/* Connection chips */}
      <ConnectionChips connections={content.connections} />

      {/* Study / Chat CTAs */}
      <div className="flex items-center gap-2 flex-wrap mt-4">
        <button
          onClick={onStudyClick}
          className="flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-full transition-opacity hover:opacity-80"
          style={{
            background: "var(--color-accent)",
            color: "var(--color-bg)",
          }}
        >
          <BookOpen size={14} />
          Study this chapter
        </button>
        {onChatClick && (
          <button
            onClick={onChatClick}
            className="flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-full transition-opacity hover:opacity-80"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-1)",
            }}
          >
            <MessageSquare size={14} />
            Ask Charles
          </button>
        )}
      </div>
    </div>
  );
}
