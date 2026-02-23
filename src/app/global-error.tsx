"use client";

/**
 * global-error.tsx — catches errors in the root layout itself.
 * Must include full <html> and <body> tags since the layout has crashed.
 */

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0d1117", color: "#fff" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ maxWidth: "24rem", width: "100%", textAlign: "center" }}>
            <div style={{ width: "3rem", height: "2px", background: "#C4A040", margin: "0 auto 2rem" }} />

            <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#C4A040", marginBottom: "0.75rem" }}>
              Critical error
            </p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.75rem" }}>
              The application failed to load
            </h1>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, fontStyle: "italic", marginBottom: "0.25rem" }}>
              &ldquo;He heals the brokenhearted and binds up their wounds.&rdquo;
            </p>
            <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.25)", marginBottom: "2rem" }}>
              Psalm 147:3
            </p>

            {error.digest && (
              <p style={{ fontSize: "0.625rem", fontFamily: "monospace", color: "rgba(255,255,255,0.2)", marginBottom: "1.5rem" }}>
                Error ID: {error.digest}
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                onClick={() => reset()}
                style={{
                  width: "100%",
                  height: "2.5rem",
                  borderRadius: "0.5rem",
                  background: "#C4A040",
                  color: "#0d1117",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "2.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                Return to dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
