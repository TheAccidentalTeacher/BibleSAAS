/**
 * useOnlineStatus — wraps navigator.onLine + online/offline events
 *
 * Returns `true` when the browser reports network connectivity.
 * Uses a stable SSR-safe initial value (true) to avoid hydration mismatches.
 */

"use client";

import { useEffect, useState } from "react";

export function useOnlineStatus(): boolean {
  // SSR-safe lazy initializer: reads navigator.onLine only on client, defaults to true on server
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
