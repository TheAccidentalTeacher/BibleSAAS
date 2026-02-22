/**
 * sw-register.tsx — registers the service worker on mount.
 * Must be a client component rendered in the root layout.
 */

"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Listen for messages from the SW (e.g. SYNC_PENDING)
        navigator.serviceWorker.addEventListener("message", (event: MessageEvent) => {
          if (event.data?.type === "SYNC_PENDING") {
            // Trigger the sync API
            void fetch("/api/sync", { method: "POST" });
          }
        });

        // Attempt background sync registration on reconnect
        window.addEventListener("online", async () => {
          if ("sync" in registration) {
            try {
              // @ts-ignore — BackgroundSync API
              await registration.sync.register("pending-sync");
            } catch {
              // Background sync not supported — SW will handle via message
              void fetch("/api/sync", { method: "POST" });
            }
          } else {
            void fetch("/api/sync", { method: "POST" });
          }
        });

        console.log("[SW] Registered:", registration.scope);
      } catch (err) {
        console.warn("[SW] Registration failed:", err);
      }
    };

    void register();
  }, []);

  return null;
}
