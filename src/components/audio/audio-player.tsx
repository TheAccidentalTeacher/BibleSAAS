"use client";

/**
 * AudioPlayer — Full-screen expandable audio player sheet.
 *
 * Shows:
 *  - Book/Chapter reference
 *  - Verse list or scrubber (depending on mode)
 *  - Play/Pause, skip verse (TTS), scrub (URL)
 *  - Speed selector (0.75 / 1 / 1.25 / 1.5 / 2)
 *  - Read-along toggle
 *  - Auto-advance notice
 */

import { X, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useAudioState, useAudioActions } from "@/context/audio-context";

interface Props {
  onClose: () => void;
}

const SPEEDS = [0.75, 1.0, 1.25, 1.5, 2.0];

function formatTime(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ onClose }: Props) {
  const state = useAudioState();
  const actions = useAudioActions();

  if (!state.book) return null;

  const label = `${state.bookName} ${state.chapter}`;

  // TTS: currentTime = verse index (0-based)
  const verseIdx = state.mode === "tts" ? Math.max(0, state.verses.findIndex(v => v.verse === state.currentVerse)) : 0;
  const totalVerses = state.verses.length;

  function skipBack() {
    if (state.mode === "tts") {
      actions.seek(Math.max(0, verseIdx - 1));
    } else {
      actions.seek(Math.max(0, state.currentTime - 10));
    }
  }

  function skipForward() {
    if (state.mode === "tts") {
      actions.seek(Math.min(totalVerses - 1, verseIdx + 1));
    } else {
      actions.seek(state.currentTime + 10);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-t-3xl border-t"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="font-semibold text-base" style={{ color: "var(--color-text-1)" }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>
              {state.mode === "tts" ? "Text-to-Speech" : "Audio Bible"}
              {state.isLoading && " · Loading…"}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "var(--color-text-3)" }} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-5">
          {/* Progress */}
          {state.mode === "url" ? (
            /* URL mode: scrubber */
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={state.duration || 1}
                step={1}
                value={state.currentTime}
                onChange={(e) => actions.seek(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "var(--color-accent)" }}
              />
              <div className="flex justify-between text-[11px]" style={{ color: "var(--color-text-3)" }}>
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>
          ) : (
            /* TTS mode: verse scrubber */
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={Math.max(0, totalVerses - 1)}
                step={1}
                value={verseIdx}
                onChange={(e) => actions.seek(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "var(--color-accent)" }}
              />
              <div className="flex justify-between text-[11px]" style={{ color: "var(--color-text-3)" }}>
                <span>Verse {state.currentVerse ?? "–"}</span>
                <span>{totalVerses} verses</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={skipBack}
              className="flex items-center justify-center w-11 h-11 rounded-full border"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-2)" }}
              aria-label={state.mode === "tts" ? "Previous verse" : "Back 10s"}
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={() => state.isPlaying ? actions.pause() : actions.play()}
              disabled={state.isLoading}
              className="flex items-center justify-center w-16 h-16 rounded-full shadow-lg"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                opacity: state.isLoading ? 0.7 : 1,
              }}
              aria-label={state.isPlaying ? "Pause" : "Play"}
            >
              {state.isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>

            <button
              onClick={skipForward}
              className="flex items-center justify-center w-11 h-11 rounded-full border"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-2)" }}
              aria-label={state.mode === "tts" ? "Next verse" : "Forward 10s"}
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Speed selector */}
          <div>
            <p className="text-xs mb-2" style={{ color: "var(--color-text-3)" }}>Playback speed</p>
            <div className="flex gap-2">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => actions.setSpeed(s)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all"
                  style={{
                    background: state.speed === s ? "var(--color-accent)" : "var(--color-surface-2)",
                    borderColor: state.speed === s ? "var(--color-accent)" : "var(--color-border)",
                    color: state.speed === s ? "var(--color-bg)" : "var(--color-text-2)",
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          {/* Read-along toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-1)" }}>Read-along highlight</p>
              <p className="text-xs" style={{ color: "var(--color-text-3)" }}>
                Highlights the current verse while it plays
              </p>
            </div>
            <button
              onClick={actions.toggleReadAlong}
              className="relative w-12 h-6 rounded-full transition-all"
              style={{
                background: state.readAlong ? "var(--color-accent)" : "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow"
                style={{ left: state.readAlong ? "calc(100% - 22px)" : "2px" }}
              />
            </button>
          </div>

          {/* Progress percentage */}
          <div className="text-center">
            <p className="text-xs" style={{ color: "var(--color-text-3)" }}>
              {state.completedPercent}% complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
