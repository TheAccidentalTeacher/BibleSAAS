/**
 * /offline — fallback page served by the service worker when user navigates
 * to an uncached page while offline.
 */

import Link from "next/link";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--color-bg)", color: "var(--color-text-1)" }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: "var(--color-surface-2)" }}
        aria-hidden="true"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--color-text-3)" }}
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      </div>

      <h1
        className="text-2xl font-semibold mb-3"
        style={{ color: "var(--color-text-1)" }}
      >
        You&apos;re offline
      </h1>
      <p
        className="text-base mb-8 max-w-xs"
        style={{ color: "var(--color-text-2)", lineHeight: "1.6" }}
      >
        This page hasn&apos;t been cached yet. Chapters you&apos;ve read before
        in WEB or KJV are available without a connection.
      </p>

      <Link
        href="/dashboard"
        className="py-3 px-6 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
