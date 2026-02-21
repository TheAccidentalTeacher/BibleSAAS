"use client";

/**
 * VerseActionMenu — Floating menu that appears when user taps a verse number.
 *
 * Shows:
 * - 6 color swatches (tap to highlight / re-highlight)
 * - "Add note" button (if verse is already highlighted)
 * - "Remove highlight" button (if verse is already highlighted)
 * - Bookmark toggle
 *
 * Position: follows the tapped verse; auto-adjusts to stay on screen.
 */

import { useEffect, useRef, useState } from "react";
import { X, Bookmark, BookmarkCheck, MessageSquare, Trash2 } from "lucide-react";

export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "orange" | "purple";

export const HIGHLIGHT_HEX: Record<HighlightColor, string> = {
  yellow: "#F5C842",
  green:  "#5DBB63",
  blue:   "#5B9BD5",
  pink:   "#E86B8A",
  orange: "#F0954A",
  purple: "#9B72CF",
};

// 40% opacity tint for verse backgrounds
export const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  yellow: "rgba(245,200,66,0.30)",
  green:  "rgba(93,187,99,0.30)",
  blue:   "rgba(91,155,213,0.30)",
  pink:   "rgba(232,107,138,0.30)",
  orange: "rgba(240,149,74,0.30)",
  purple: "rgba(155,114,207,0.30)",
};

export interface HighlightState {
  id: string;
  verse_start: number;
  verse_end: number | null;
  color: HighlightColor;
  note: string | null;
}

export interface BookmarkState {
  id: string;
  verse: number;
}

interface VerseActionMenuProps {
  verse: number;
  anchorY: number;          // pageY of the tapped verse number
  existingHighlight: HighlightState | null;
  isBookmarked: boolean;
  onHighlight: (verse: number, color: HighlightColor) => void;
  onRemoveHighlight: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
  onBookmark: (verse: number) => void;
  onRemoveBookmark: (verse: number) => void;
  onClose: () => void;
}

export default function VerseActionMenu({
  verse,
  anchorY,
  existingHighlight,
  isBookmarked,
  onHighlight,
  onRemoveHighlight,
  onAddNote,
  onBookmark,
  onRemoveBookmark,
  onClose,
}: VerseActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [noteText, setNoteText] = useState(existingHighlight?.note ?? "");

  // Close on outside tap
  useEffect(() => {
    const handleTap = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleTap);
    document.addEventListener("touchstart", handleTap);
    return () => {
      document.removeEventListener("mousedown", handleTap);
      document.removeEventListener("touchstart", handleTap);
    };
  }, [onClose]);

  // Calculate position: show above or below the tapped point
  const menuHeight = noteMode ? 200 : 100;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
  const top = anchorY + menuHeight > viewportH - 20
    ? anchorY - menuHeight - 8
    : anchorY + 24;

  if (noteMode && existingHighlight) {
    return (
      <div
        ref={menuRef}
        className="fixed left-4 right-4 z-50 rounded-2xl shadow-2xl p-4 border"
        style={{
          top,
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold" style={{ color: "var(--color-text-2)" }}>
            Verse {verse} note
          </p>
          <button onClick={() => setNoteMode(false)} aria-label="Back" style={{ color: "var(--color-text-2)" }}>
            <X size={15} />
          </button>
        </div>
        <textarea
          className="w-full rounded-lg p-3 text-sm resize-none outline-none border"
          rows={3}
          maxLength={500}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note to this highlight…"
          style={{
            background: "var(--color-surface-2)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-1)",
          }}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => setNoteMode(false)}
            className="text-xs px-3 py-1.5 rounded-full border"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-2)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onAddNote(existingHighlight.id, noteText);
              setNoteMode(false);
              onClose();
            }}
            className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="fixed left-4 right-4 z-50 rounded-2xl shadow-2xl p-4 border"
      style={{
        top,
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold" style={{ color: "var(--color-text-2)" }}>
          Verse {verse}
        </p>
        <button onClick={onClose} aria-label="Close" style={{ color: "var(--color-text-2)" }}>
          <X size={15} />
        </button>
      </div>

      {/* Color swatches */}
      <div className="flex items-center gap-2 mb-3">
        {(Object.keys(HIGHLIGHT_HEX) as HighlightColor[]).map((color) => (
          <button
            key={color}
            onClick={() => {
              onHighlight(verse, color);
              onClose();
            }}
            className="w-8 h-8 rounded-full transition-transform hover:scale-110 active:scale-95 border-2"
            style={{
              background: HIGHLIGHT_HEX[color],
              borderColor:
                existingHighlight?.color === color
                  ? "var(--color-text-1)"
                  : "transparent",
            }}
            aria-label={`Highlight ${color}`}
          />
        ))}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2">
        {/* Bookmark toggle */}
        <button
          onClick={() => {
            if (isBookmarked) onRemoveBookmark(verse);
            else onBookmark(verse);
            onClose();
          }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors"
          style={{
            background: isBookmarked ? "var(--color-accent)" : "var(--color-surface-2)",
            borderColor: isBookmarked ? "var(--color-accent)" : "var(--color-border)",
            color: isBookmarked ? "var(--color-bg)" : "var(--color-text-1)",
          }}
        >
          {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </button>

        {/* Note (only if highlighted) */}
        {existingHighlight && (
          <button
            onClick={() => setNoteMode(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-1)",
            }}
          >
            <MessageSquare size={13} />
            {existingHighlight.note ? "Edit note" : "Add note"}
          </button>
        )}

        {/* Remove highlight */}
        {existingHighlight && (
          <button
            onClick={() => {
              onRemoveHighlight(existingHighlight.id);
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ml-auto"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-3)",
            }}
          >
            <Trash2 size={13} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
