"use client";

/**
 * MiniPlayer — 52px persistent bar shown above BottomNav whenever audio is loaded.
 * Tapping the bar opens the full AudioPlayer sheet.
 */

import { useState } from "react";
import { Play, Pause, X } from "lucide-react";
import { useAudioState, useAudioActions } from "@/context/audio-context";
import AudioPlayer from "./audio-player";

export default function MiniPlayer() {
  const state = useAudioState();
  const actions = useAudioActions();
  const [expanded, setExpanded] = useState(false);

  // Don't render if no chapter loaded
  if (!state.book || !state.bookName || !state.chapter) return null;

  const label = `${state.bookName} ${state.chapter}`;
  const pct = state.completedPercent;

  return (
    <>
      {/* Mini bar — sits above bottom nav (add margin-bottom on page content where BottomNav is 64px) */}
      <div
        className="fixed bottom-16 left-0 right-0 z-30"
        style={{ zIndex: 30 }}
      >
        <div
          className="mx-3 rounded-2xl border shadow-lg overflow-hidden"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-accent)",
          }}
        >
          {/* Progress line */}
          <div className="h-0.5" style={{ background: "var(--color-surface-2)" }}>
            <div
              className="h-0.5 transition-all"
              style={{ background: "var(--color-accent)", width: `${pct}%` }}
            />
          </div>

          <div
            className="flex items-center gap-3 px-4 py-2 cursor-pointer"
            onClick={() => setExpanded(true)}
          >
            {/* Title */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "var(--color-text-1)" }}>
                {label}
              </p>
              <p className="text-[10px]" style={{ color: "var(--color-text-3)" }}>
                {state.mode === "tts" ? "Text-to-Speech" : "Audio Bible"} ·{" "}
                {state.mode === "tts"
                  ? `Verse ${state.currentVerse ?? "–"} of ${state.verses.length}`
                  : `${formatTime(state.currentTime)} / ${formatTime(state.duration)}`}
              </p>
            </div>

            {/* Play/Pause */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                state.isPlaying ? actions.pause() : actions.play();
              }}
              className="flex items-center justify-center w-9 h-9 rounded-full"
              style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
              aria-label={state.isPlaying ? "Pause" : "Play"}
            >
              {state.isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            {/* Close */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                actions.stop();
              }}
              aria-label="Close player"
              style={{ color: "var(--color-text-3)" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Full player sheet */}
      {expanded && <AudioPlayer onClose={() => setExpanded(false)} />}
    </>
  );
}

function formatTime(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
