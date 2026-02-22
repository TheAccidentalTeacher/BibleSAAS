/**
 * useOfflineChapter — caches a Bible chapter in IndexedDB when online,
 * and provides the cached data when offline.
 *
 * Usage:
 *   const { isCached } = useOfflineChapter({ book, chapter, translation, verses });
 *
 * When the component mounts (while online), the chapter is saved to IndexedDB.
 * The `isCached` flag lets the UI show an offline availability indicator.
 */

"use client";

import { useEffect, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { cacheChapter } from "@/lib/offline/db";

interface UseOfflineChapterOptions {
  book: string;
  chapter: number;
  translation: string;
  verses: Array<{ verse: number; text: string }>;
}

interface UseOfflineChapterReturn {
  isCached: boolean;
  isOffline: boolean;
}

export function useOfflineChapter({
  book,
  chapter,
  translation,
  verses,
}: UseOfflineChapterOptions): UseOfflineChapterReturn {
  const isOnline = useOnlineStatus();
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    // Only cache public domain translations
    const CACHEABLE = ["WEB", "KJV"];
    if (!CACHEABLE.includes(translation.toUpperCase())) return;
    if (!verses.length) return;

    void cacheChapter(book, chapter, translation, verses).then(() => {
      setIsCached(true);
    });
  }, [book, chapter, translation, verses]);

  return { isCached, isOffline: !isOnline };
}
