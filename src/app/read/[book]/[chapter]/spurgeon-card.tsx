/**
 * SpurgeonCard — Displays a Spurgeon Morning & Evening entry.
 *
 * Morning entries appear at the TOP of the chapter (before verse 1).
 * Evening entries appear at the BOTTOM of the chapter (after the final verse).
 *
 * Collapsed by default; expand with a tap.
 * Attribution: "C.H. Spurgeon, Morning & Evening (1865)"
 */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface SpurgeonEntry {
  id: string;
  date_key: string | null;
  title: string | null;
  body: string;
  source: string;
}

interface SpurgeonCardProps {
  entry: SpurgeonEntry;
  position: "top" | "bottom";
}

function getLabel(source: string, dateKey: string | null): string {
  if (source === "morning_evening") {
    if (dateKey?.endsWith("_am")) return "Morning Reading";
    if (dateKey?.endsWith("_pm")) return "Evening Reading";
    return "Daily Reading";
  }
  if (source === "treasury_of_david") return "Treasury of David";
  return "Spurgeon";
}

export default function SpurgeonCard({ entry, position }: SpurgeonCardProps) {
  const [expanded, setExpanded] = useState(false);

  const label = getLabel(entry.source, entry.date_key);

  // Truncate to ~200 chars for collapsed state
  const truncated =
    entry.body.length > 220
      ? entry.body.slice(0, 218).replace(/\s\S*$/, "") + "…"
      : entry.body;

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${position === "top" ? "mb-6" : "mt-6"}`}
      style={{
        borderColor: "#D97706",
        background: "var(--color-surface)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3"
        style={{
          borderBottom: expanded ? `1px solid #D9770640` : "none",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Amber indicator */}
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: "#D97706" }}
          />
          <div className="text-left">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#D97706" }}
            >
              {label}
            </p>
            {entry.title && (
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: "var(--color-text-1)" }}
              >
                {entry.title}
              </p>
            )}
          </div>
        </div>
        <span style={{ color: "var(--color-text-3)" }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Body */}
      <div className="px-5 pb-4 pt-3">
        <p
          className="text-sm leading-relaxed"
          style={{
            fontFamily: "var(--font-garamond)",
            fontSize: "14px",
            color: "var(--color-text-2)",
            lineHeight: "1.7",
          }}
        >
          {expanded ? entry.body : truncated}
        </p>

        {/* Attribution */}
        <p
          className="text-[10px] mt-3"
          style={{ color: "var(--color-text-3)" }}
        >
          C.H. Spurgeon, Morning &amp; Evening (1865)
        </p>
      </div>
    </div>
  );
}
