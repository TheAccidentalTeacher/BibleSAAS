"use client";

import { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BIBLE_BOOKS } from "@/lib/bible";
import { STAR_POSITIONS } from "../journey-types";
import type { JourneyData } from "../journey-types";

interface Props {
  data: JourneyData;
}

const OT_COLOR = "#f59e0b";   // gold
const NT_COLOR = "#60a5fa";   // blue

// Module-level constants derived from the immutable BIBLE_BOOKS array
const CHAPTER_COUNT = Object.fromEntries(BIBLE_BOOKS.map((b) => [b.code, b.chapters]));
const OT_CODES = new Set(BIBLE_BOOKS.filter((b) => b.testament === "OT").map((b) => b.code));

export default function JourneyConstellation({ data }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { byBook } = data;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Scale positions to canvas size
    const scaleX = W / 1040;
    const scaleY = H / 500;

    STAR_POSITIONS.forEach(({ x, y, book }) => {
      const total = CHAPTER_COUNT[book] ?? 1;
      const read = (byBook[book] ?? []).length;
      const pct = read / total;
      const alpha = 0.15 + pct * 0.85;
      const isOT = OT_CODES.has(book);
      const color = isOT ? OT_COLOR : NT_COLOR;
      const radius = 3 + pct * 5;
      const cx = x * scaleX;
      const cy = y * scaleY;

      // Glow for completed books
      if (pct >= 1) {
        const glow = ctx.createRadialGradient(cx, cy, radius, cx, cy, radius * 4);
        glow.addColorStop(0, `${color}66`);
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Star body
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = hexAlpha(color, alpha);
      ctx.fill();
    });
  }, [byBook]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 1040;
      const my = ((e.clientY - rect.top) / rect.height) * 500;

      // Hit-test stars
      for (const { x, y, book } of STAR_POSITIONS) {
        const total = CHAPTER_COUNT[book] ?? 1;
        const read = (byBook[book] ?? []).length;
        const pct = read / total;
        const radius = 3 + pct * 5 + 8; // generous hit area
        const dist = Math.hypot(mx - x, my - y);
        if (dist <= radius) {
          router.push(`/read/${book}/1`);
          return;
        }
      }
    },
    [byBook, router]
  );

  // OT/NT counts for legend
  const otRead = BIBLE_BOOKS.filter((b) => b.testament === "OT" && (byBook[b.code] ?? []).length > 0).length;
  const ntRead = BIBLE_BOOKS.filter((b) => b.testament === "NT" && (byBook[b.code] ?? []).length > 0).length;
  const otTotal = BIBLE_BOOKS.filter((b) => b.testament === "OT").length;
  const ntTotal = BIBLE_BOOKS.filter((b) => b.testament === "NT").length;

  return (
    <div className="space-y-4 pb-6">
      <p className="text-xs text-[var(--color-text-secondary)] text-center">
        Tap a star to open that book
      </p>

      <canvas
        ref={canvasRef}
        width={1040}
        height={500}
        onClick={handleClick}
        className="w-full rounded-2xl cursor-pointer"
        style={{ background: "rgba(0,0,0,0.4)", touchAction: "manipulation" }}
      />

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs">
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: OT_COLOR }}
          />
          <span className="text-[var(--color-text-secondary)]">
            Old Testament ({otRead}/{otTotal} started)
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: NT_COLOR }}
          />
          <span className="text-[var(--color-text-secondary)]">
            New Testament ({ntRead}/{ntTotal} started)
          </span>
        </span>
      </div>

      <p className="text-[11px] text-center text-[var(--color-text-secondary)]">
        Brighter = more complete · Glow = finished
      </p>
    </div>
  );
}

function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
}
