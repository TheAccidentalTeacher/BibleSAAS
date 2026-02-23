"use client";

/**
 * AudioContext — Global audio player state, persisted across Next.js route changes.
 *
 * Two playback modes:
 *  - "tts"  : Google Cloud Text-to-Speech API — high-quality Neural2 voices,
 *             verse-by-verse playback with read-along highlighting
 *  - "url"  : HTML5 <audio> — when a pre-recorded audio file URL is available
 *
 * Verse sync:
 *  - TTS mode:  verse index advances when each Audio element fires 'ended'
 *  - URL mode:  `timeupdate` events + timestamps array from DB
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
  voiceId: string;
  isPlaying: boolean;
  isLoading: boolean;
  currentVerse: number | null;
  currentTime: number;
  duration: number;
  speed: number;
  readAlong: boolean;
  completedPercent: number;
}

export interface AudioActions {
  loadChapter: (opts: {
    book: string;
    bookName: string;
    chapter: number;
    verses: Verse[];
    mode: PlaybackMode;
    audioUrl?: string | null;
    voiceId?: string;
    speed?: number;
    resumeSeconds?: number;
  }) => void;
  play: () => void;
  pause: () => void;
  seek: (secondsOrVerseIndex: number) => void;
  setSpeed: (speed: number) => void;
  toggleReadAlong: () => void;
  stop: () => void;
}

const DEFAULT_VOICE = "en-US-Neural2-D";

const defaultState: AudioState = {
  book: null,
  bookName: null,
  chapter: null,
  verses: [],
  mode: "tts",
  audioUrl: null,
  voiceId: DEFAULT_VOICE,
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

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AudioState>(defaultState);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsVerseIdxRef = useRef<number>(0);
  const ttsCancelRef = useRef<boolean>(false);
  const speakVerseCallbackRef = useRef<(idx: number) => void>(() => {});
  const speedRef = useRef<number>(1.0);
  const stateRef = useRef<AudioState>(state);
  stateRef.current = state;

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

  const stopTTS = useCallback(() => {
    ttsCancelRef.current = true;
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
  }, []);

  const speakVerse = useCallback((idx: number) => {
    const s = stateRef.current;
    if (idx >= s.verses.length) {
      setState((prev) => ({ ...prev, isPlaying: false, isLoading: false, completedPercent: 100 }));
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
      isLoading: true,
      completedPercent: Math.round((idx / s.verses.length) * 100),
    }));
    const voiceId = s.voiceId || DEFAULT_VOICE;
    void (async () => {
      try {
        const res = await fetch("/api/audio/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: verseData.text, voice_id: voiceId }),
        });
        if (ttsCancelRef.current) return;
        if (!res.ok) {
          setState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
          return;
        }
        const data = await res.json() as { audioContent: string };
        if (ttsCancelRef.current) return;
        const binaryStr = atob(data.audioContent);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)!;
        const blob = new Blob([bytes], { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = speedRef.current;
        ttsAudioRef.current = audio;
        setState((prev) => ({ ...prev, isLoading: false }));
        audio.addEventListener("ended", () => {
          URL.revokeObjectURL(url);
          ttsAudioRef.current = null;
          if (!ttsCancelRef.current && stateRef.current.isPlaying) {
            speakVerseCallbackRef.current(idx + 1);
          }
        });
        await audio.play();
      } catch {
        if (!ttsCancelRef.current) {
          setState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
        }
      }
    })();
  }, [awardAudioCredit, saveProgress]);

  useEffect(() => {
    speakVerseCallbackRef.current = speakVerse;
  }, [speakVerse]);

  const setupAudioElement = useCallback((url: string, resumeSeconds: number) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
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

  const actions: AudioActions = {
    loadChapter: useCallback(({ book, bookName, chapter, verses, mode, audioUrl, voiceId, speed = 1.0, resumeSeconds = 0 }) => {
      stopTTS();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      creditRef.current = false;
      speedRef.current = speed;
      ttsCancelRef.current = false;
      if (mode === "url" && audioUrl) setupAudioElement(audioUrl, resumeSeconds);
      setState({
        book, bookName, chapter, verses, mode,
        audioUrl: audioUrl ?? null,
        voiceId: voiceId ?? DEFAULT_VOICE,
        isPlaying: false,
        isLoading: false,
        currentVerse: verses[0]?.verse ?? null,
        currentTime: resumeSeconds,
        duration: mode === "tts" ? verses.length : 0,
        speed, readAlong: true, completedPercent: 0,
      });
      if (mode === "tts") ttsVerseIdxRef.current = 0;
    }, [stopTTS, setupAudioElement]),

    play: useCallback(() => {
      if (!stateRef.current.book) return;
      ttsCancelRef.current = false;
      setState((prev) => ({ ...prev, isPlaying: true }));
      const s = stateRef.current;
      if (s.mode === "tts") {
        speakVerseCallbackRef.current(ttsVerseIdxRef.current);
      } else if (audioRef.current) {
        void audioRef.current.play();
      }
    }, []),

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
        ttsCancelRef.current = false;
        setState((prev) => ({ ...prev, currentVerse: s.verses[idx]?.verse ?? null, currentTime: idx }));
        if (s.isPlaying) speakVerseCallbackRef.current(idx);
      } else if (audioRef.current) {
        audioRef.current.currentTime = val;
      }
    }, [stopTTS]),

    setSpeed: useCallback((speed: number) => {
      speedRef.current = speed;
      setState((prev) => ({ ...prev, speed }));
      if (ttsAudioRef.current) ttsAudioRef.current.playbackRate = speed;
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

  useEffect(() => {
    function handleHide() {
      const s = stateRef.current;
      if (!s.book || !s.chapter) return;
      const pos = s.mode === "tts" ? ttsVerseIdxRef.current : (audioRef.current?.currentTime ?? 0);
      void saveProgress(s, pos, false);
      stopTTS();
      if (audioRef.current) audioRef.current.pause();
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
