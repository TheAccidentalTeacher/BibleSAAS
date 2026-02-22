"use client";

/**
 * AudioContext — Global audio player state, persisted across Next.js route changes.
 *
 * Two playback modes:
 *  - "tts"  : Web Speech API — no API key needed, verse-by-verse utterances
 *  - "url"  : HTML5 <audio> — when an audio file URL is available
 *
 * Verse sync:
 *  - TTS mode: verse index advances on utterance `end` event
 *  - URL mode: `timeupdate` events + timestamps array from DB
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type PlaybackMode = "tts" | "url";

export interface Verse {
  verse: number;
  text: string;
}

export interface AudioState {
  book: string | null;
  bookName: string | null;
  chapter: number | null;
  verses: Verse[];
  mode: PlaybackMode;
  audioUrl: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentVerse: number | null;   // 1-based verse number currently being spoken/playing
  currentTime: number;           // seconds (URL mode)
  duration: number;              // seconds (URL mode), or verse count (TTS mode)
  speed: number;
  readAlong: boolean;
  completedPercent: number;      // 0–100
}

export interface AudioActions {
  loadChapter: (opts: {
    book: string;
    bookName: string;
    chapter: number;
    verses: Verse[];
    mode: PlaybackMode;
    audioUrl?: string | null;
    speed?: number;
    resumeSeconds?: number;
  }) => void;
  play: () => void;
  pause: () => void;
  seek: (secondsOrVerseIndex: number) => void;
  setSpeed: (speed: number) => void;
  toggleReadAlong: () => void;
  stop: () => void;  // clears the player entirely
}

const defaultState: AudioState = {
  book: null,
  bookName: null,
  chapter: null,
  verses: [],
  mode: "tts",
  audioUrl: null,
  isPlaying: false,
  isLoading: false,
  currentVerse: null,
  currentTime: 0,
  duration: 0,
  speed: 1.0,
  readAlong: true,
  completedPercent: 0,
};

const AudioStateCtx = createContext<AudioState>(defaultState);
const AudioActionsCtx = createContext<AudioActions>({
  loadChapter: () => {},
  play: () => {},
  pause: () => {},
  seek: () => {},
  setSpeed: () => {},
  toggleReadAlong: () => {},
  stop: () => {},
});

export function useAudioState() { return useContext(AudioStateCtx); }
export function useAudioActions() { return useContext(AudioActionsCtx); }

// ─── Provider ────────────────────────────────────────────────────────────────

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioState>(defaultState);

  // HTML5 audio ref (url mode)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // TTS state
  const ttsVerseIdxRef = useRef<number>(0);    // index into state.verses
  const ttsUtterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speedRef = useRef<number>(1.0);
  const stateRef = useRef<AudioState>(state);
  stateRef.current = state;

  // Save progress to DB (debounced — called on pause/unload)
  const saveProgress = useCallback(async (s: AudioState, posSeconds: number, completed: boolean) => {
    if (!s.book || !s.chapter) return;
    try {
      await fetch("/api/audio/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: s.book,
          chapter: s.chapter,
          position_seconds: posSeconds,
          completed,
          playback_speed: s.speed,
          readalong_on: s.readAlong,
        }),
      });
    } catch { /* ignore */ }
  }, []);

  // Fire XP + reading-progress credit when >90% complete
  const creditRef = useRef(false);
  const awardAudioCredit = useCallback(async (book: string, chapter: number) => {
    if (creditRef.current) return;
    creditRef.current = true;
    try {
      await fetch("/api/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, chapter, source: "audio" }),
      });
    } catch { /* ignore */ }
  }, []);

  // ── TTS helpers ────────────────────────────────────────────────────────────
  const stopTTS = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    ttsUtterRef.current = null;
  }, []);

  const speakVerse = useCallback((idx: number) => {
    if (typeof window === "undefined") return;
    const s = stateRef.current;
    if (idx >= s.verses.length) {
      // Session complete
      setState((prev) => ({ ...prev, isPlaying: false, currentVerse: null, completedPercent: 100 }));
      void saveProgress(s, s.verses.length, true);
      void awardAudioCredit(s.book!, s.chapter!);
      return;
    }
    const verseData = s.verses[idx]!;
    ttsVerseIdxRef.current = idx;
    setState((prev) => ({
      ...prev,
      currentVerse: verseData.verse,
      currentTime: idx,
      completedPercent: Math.round((idx / s.verses.length) * 100),
    }));

    const utt = new SpeechSynthesisUtterance(verseData.text);
    utt.rate = speedRef.current;
    utt.lang = "en-US";
    utt.onend = () => {
      const nextIdx = idx + 1;
      // Check if still playing (not paused)
      if (stateRef.current.isPlaying) {
        // eslint-disable-next-line react-hooks/immutability
        speakVerse(nextIdx);
      }
    };
    ttsUtterRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [awardAudioCredit, saveProgress]);

  // ── URL mode helpers ──────────────────────────────────────────────────────
  const setupAudioElement = useCallback((url: string, resumeSeconds: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.currentTime = resumeSeconds;

    audio.addEventListener("timeupdate", () => {
      const s = stateRef.current;
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: audio.duration || prev.duration,
        completedPercent: audio.duration ? Math.round((audio.currentTime / audio.duration) * 100) : 0,
      }));
      // 90% credit
      if (audio.duration && audio.currentTime / audio.duration > 0.9) {
        void awardAudioCredit(s.book!, s.chapter!);
      }
    });
    audio.addEventListener("ended", () => {
      setState((prev) => ({ ...prev, isPlaying: false, completedPercent: 100 }));
      void saveProgress(stateRef.current, audio.currentTime, true);
    });
    audio.addEventListener("loadedmetadata", () => {
      setState((prev) => ({ ...prev, duration: audio.duration, isLoading: false }));
    });
    audio.playbackRate = speedRef.current;
  }, [awardAudioCredit, saveProgress]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const actions: AudioActions = {
    loadChapter: useCallback(({ book, bookName, chapter, verses, mode, audioUrl, speed = 1.0, resumeSeconds = 0 }) => {
      // Stop existing playback
      stopTTS();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      creditRef.current = false;
      speedRef.current = speed;

      if (mode === "url" && audioUrl) {
        setupAudioElement(audioUrl, resumeSeconds);
      }

      setState({
        book,
        bookName,
        chapter,
        verses,
        mode,
        audioUrl: audioUrl ?? null,
        isPlaying: false,
        isLoading: mode === "url",
        currentVerse: verses[0]?.verse ?? null,
        currentTime: resumeSeconds,
        duration: mode === "tts" ? verses.length : 0,
        speed,
        readAlong: true,
        completedPercent: 0,
      });

      if (mode === "tts") ttsVerseIdxRef.current = 0;
    }, [stopTTS, setupAudioElement]),

    play: useCallback(() => {
      const s = stateRef.current;
      if (!s.book) return;
      setState((prev) => ({ ...prev, isPlaying: true }));
      if (s.mode === "tts") {
        speakVerse(ttsVerseIdxRef.current);
      } else if (audioRef.current) {
        void audioRef.current.play();
      }
    }, [speakVerse]),

    pause: useCallback(() => {
      const s = stateRef.current;
      setState((prev) => ({ ...prev, isPlaying: false }));
      if (s.mode === "tts") {
        stopTTS();
      } else if (audioRef.current) {
        audioRef.current.pause();
        void saveProgress(s, audioRef.current.currentTime, false);
      }
    }, [stopTTS, saveProgress]),

    seek: useCallback((val: number) => {
      const s = stateRef.current;
      if (s.mode === "tts") {
        stopTTS();
        const idx = Math.max(0, Math.min(val, s.verses.length - 1));
        ttsVerseIdxRef.current = idx;
        setState((prev) => ({ ...prev, currentVerse: s.verses[idx]?.verse ?? null, currentTime: idx }));
        if (s.isPlaying) speakVerse(idx);
      } else if (audioRef.current) {
        audioRef.current.currentTime = val;
      }
    }, [stopTTS, speakVerse]),

    setSpeed: useCallback((speed: number) => {
      speedRef.current = speed;
      setState((prev) => ({ ...prev, speed }));
      if (audioRef.current) audioRef.current.playbackRate = speed;
    }, []),

    toggleReadAlong: useCallback(() => {
      setState((prev) => ({ ...prev, readAlong: !prev.readAlong }));
    }, []),

    stop: useCallback(() => {
      stopTTS();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      creditRef.current = false;
      setState(defaultState);
    }, [stopTTS]),
  };

  // Save progress when tab hidden / unloaded
  useEffect(() => {
    function handleHide() {
      const s = stateRef.current;
      if (!s.book || !s.chapter) return;
      const pos = s.mode === "tts" ? ttsVerseIdxRef.current : (audioRef.current?.currentTime ?? 0);
      void saveProgress(s, pos, false);
      if (s.mode === "tts") stopTTS();
      else if (audioRef.current) audioRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
    document.addEventListener("visibilitychange", handleHide);
    window.addEventListener("beforeunload", handleHide);
    return () => {
      document.removeEventListener("visibilitychange", handleHide);
      window.removeEventListener("beforeunload", handleHide);
    };
  }, [saveProgress, stopTTS]);

  return (
    <AudioStateCtx.Provider value={state}>
      <AudioActionsCtx.Provider value={actions}>
        {children}
      </AudioActionsCtx.Provider>
    </AudioStateCtx.Provider>
  );
}
