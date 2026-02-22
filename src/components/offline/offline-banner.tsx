/**
 * offline-banner.tsx — displays a subtle banner when the device goes offline.
 * Uses `useOnlineStatus` hook; animates in/out.
 */

"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
      style={{
        background: "#1A1A1A",
        borderBottom: "1px solid #333",
        color: "#B8AFA4",
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full bg-amber-500"
        aria-hidden="true"
      />
      You&apos;re offline — showing cached content
    </div>
  );
}
