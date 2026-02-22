/**
 * public/sw.js — Bible Study App Service Worker
 *
 * Caching strategy:
 *   - Static assets (_next/static/): CacheFirst (long TTL)
 *   - Chapter API (/api/chapter — WEB/KJV only): StaleWhileRevalidate
 *   - Other API routes: NetworkOnly (no cache)
 *   - Page navigations: NetworkFirst with offline fallback
 *
 * IndexedDB (via Dexie in-app) handles chapter text for offline reading.
 * This SW supplements by caching the Next.js app shell.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PAGES_CACHE = `pages-${CACHE_VERSION}`;

// App shell pages to pre-cache on install
const PRECACHE_PAGES = ["/", "/dashboard", "/offline"];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  // @ts-ignore
  event.waitUntil(
    caches.open(PAGES_CACHE).then((cache) =>
      cache.addAll(PRECACHE_PAGES).catch(() => {
        /* ignore non-critical pre-cache failures */
      })
    )
  );
  // @ts-ignore
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  // @ts-ignore
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  // @ts-ignore
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  // @ts-ignore
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // ── Static assets: CacheFirst ──────────────────────────────────────────────
  if (url.pathname.startsWith("/_next/static/")) {
    // @ts-ignore
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ??
            fetch(request).then((response) => {
              cache.put(request, response.clone());
              return response;
            })
        )
      )
    );
    return;
  }

  // ── API routes: network-only (except chapter for offline) ─────────────────
  if (url.pathname.startsWith("/api/")) {
    // Let network handle all API calls — Dexie in the app handles chapter cache
    return;
  }

  // ── Page navigations: NetworkFirst with offline fallback ──────────────────
  if (request.mode === "navigate") {
    // @ts-ignore
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ??
              caches.match("/offline").then(
                (offline) => offline ?? new Response("Offline", { status: 503 })
              )
          )
        )
    );
    return;
  }
});

// ── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  // @ts-ignore
  if (event.tag === "pending-sync") {
    // @ts-ignore
    event.waitUntil(notifyClientToSync());
  }
});

async function notifyClientToSync() {
  // @ts-ignore
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "SYNC_PENDING" });
  }
}
