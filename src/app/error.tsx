"use client";

/**
 * Error boundary — catches unhandled errors within the root layout's children.
 * Next.js App Router convention: error.tsx in /app.
 * NOTE: Do NOT include <html>/<body> here — that is for global-error.tsx only.
 */

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="max-w-sm w-full text-center space-y-6">

        <div className="flex justify-center">
          <div
            className="w-12 h-0.5 rounded-full"
            style={{ background: "var(--color-accent)" }}
          />
        </div>

        <div>
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--color-accent)" }}
          >
            Something went wrong
          </p>
          <h1
            className="text-2xl font-bold text-[var(--color-text-primary)] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            An unexpected error occurred
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
            &ldquo;For I know the plans I have for you,&rdquo; declares the LORD,
            &ldquo;plans to prosper you and not to harm you.&rdquo;
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] opacity-50 mt-1">
            Jeremiah 29:11
          </p>
        </div>

        {error.digest && (
          <p className="text-[10px] text-[var(--color-text-secondary)] opacity-40 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => reset()}
            className="w-full h-10 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-accent)",
              color: "var(--color-bg-primary)",
            }}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center
                       border border-white/10 text-[var(--color-text-secondary)]
                       hover:text-[var(--color-text-primary)] transition-colors"
          >
            Return to dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
