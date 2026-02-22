"use client";

import { X, Music } from "lucide-react";

export interface HymnEntry {
  id: string;
  title: string;
  first_line: string | null;
  tune_name: string | null;
  lyrics: string | null;          // full lyrics
  explicit_refs: string[];
}

interface HymnCardProps {
  hymn: HymnEntry;
  onClose: () => void;
}

export default function HymnCard({ hymn, onClose }: HymnCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close hymn card"
      />

      {/* Card */}
      <div
        className="relative rounded-t-2xl max-h-[75vh] flex flex-col"
        style={{ background: "var(--color-bg)" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--color-border)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-start justify-between px-5 pt-1 pb-3 border-b shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-start gap-2.5">
            <Music
              size={16}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--color-accent)" }}
            />
            <div>
              <h3
                className="font-semibold text-base leading-tight"
                style={{ color: "var(--color-text-1)" }}
              >
                {hymn.title}
              </h3>
              {hymn.tune_name && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-text-3)" }}
                >
                  {hymn.tune_name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: "var(--color-text-3)" }}
            className="hover:opacity-70 ml-2 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lyrics / first line */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {hymn.first_line && (
            <p
              className="text-sm italic mb-4"
              style={{ color: "var(--color-text-2)" }}
            >
              "{hymn.first_line}"
            </p>
          )}

          {hymn.lyrics ? (
            <pre
              className="text-sm leading-relaxed whitespace-pre-wrap font-[inherit]"
              style={{ color: "var(--color-text-2)" }}
            >
              {hymn.lyrics}
            </pre>
          ) : (
            <p
              className="text-xs mt-2"
              style={{ color: "var(--color-text-3)" }}
            >
              Full lyrics not available in this edition.
            </p>
          )}

          {hymn.explicit_refs.length > 0 && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
              <p
                className="text-xs"
                style={{ color: "var(--color-text-3)" }}
              >
                Passages: {hymn.explicit_refs.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
