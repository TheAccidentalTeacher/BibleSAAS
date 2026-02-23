import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-12 h-0.5 rounded-full" style={{ background: "var(--color-accent)" }} />
        </div>

        <div>
          <p
            className="text-6xl font-bold mb-4"
            style={{ color: "var(--color-accent)", fontFamily: "var(--font-display)" }}
          >
            404
          </p>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}>
            Page not found
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
            &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)]/50 mt-1">Psalm 119:105</p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center
                       transition-opacity hover:opacity-90"
            style={{ background: "var(--color-accent)", color: "var(--color-bg-primary)" }}
          >
            Return to dashboard
          </Link>
          <Link
            href="/library"
            className="w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center
                       border border-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Browse library
          </Link>
        </div>
      </div>
    </div>
  );
}
