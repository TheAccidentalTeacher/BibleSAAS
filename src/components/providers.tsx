"use client";

/**
 * ClientProviders — Wraps all client-side context providers.
 * Used in the root layout (which is a Server Component).
 */

import { AudioProvider } from "@/context/audio-context";
import MiniPlayer from "@/components/audio/mini-player";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      {children}
      <MiniPlayer />
    </AudioProvider>
  );
}
