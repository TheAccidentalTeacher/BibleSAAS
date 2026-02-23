"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { JourneyData } from "../journey-types";
import LocationPanel, { type MapLocation, type PassageEntry } from "../location-panel";

// ── Coordinate helpers ────────────────────────────────────────────────────────
// Viewport: 800 × 500, covering 5°E–55°E lon and 20°N–50°N lat

const W = 800;
const H = 500;
const LNG_MIN = 5;
const LAT_MAX = 50;
const LNG_RANGE = 50; // 55-5
const LAT_RANGE = 30; // 50-20

function toSVG(lat: number, lng: number): [number, number] {
  const x = ((lng - LNG_MIN) / LNG_RANGE) * W;
  const y = ((LAT_MAX - lat) / LAT_RANGE) * H;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

// ── Simplified geographic paths ───────────────────────────────────────────────
// These are rough approximations sufficient to orient users. All in SVG coords.

// Land background — the main continent block
// Mediterranean, Black Sea and Red Sea carved out on top

// Coastal outline of Mediterranean Sea (clockwise from NW, closing west/south edges)
// Values derived from real coords using toSVG()
const MED_SEA_POLY =
  "0,67 16,60 48,62 80,60 144,65 152,80 188,90 " +
  "240,120 272,160 336,200 352,210 384,215 " +
  "496,228 498,268 472,302 " +
  "432,316 360,316 280,310 200,296 " +
  "128,282 72,218 0,196";

// Black Sea (upper right region)
const BLACK_SEA_POLY = "368,0 576,0 576,50 544,55 490,60 448,80 400,90 368,60";

// Red Sea (narrow diagonal sliver, lower center-right)
const RED_SEA_POLY = "432,333 428,420 436,500 462,500 468,410 480,350 464,330";

// Persian Gulf (far right lower area)
const PERSIAN_GULF_POLY = "624,292 640,316 660,333 680,325 692,310 660,290";

// Caspian Sea (far upper right)
const CASPIAN_SEA_POLY = "680,0 736,0 736,133 712,167 688,150 672,100 664,50";

// Simplified Nile River path (south-to-north through Egypt)
const NILE_PATH = "M 432,500 L 428,420 L 416,380 L 400,350 L 392,316";

// ── Panel types ───────────────────────────────────────────────────────────────

interface MapData {
  locations: MapLocation[];
  discoveredIds: string[];
  passages: PassageEntry[];
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  data: JourneyData;
}

export default function JourneyFogMap({ data: _journeyData }: Props) {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MapLocation | null>(null);

  // Pan / zoom state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef(0);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // ── Fetch map data ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/map/data");
        if (res.ok) {
          const json = await res.json() as MapData;
          if (!cancelled) setMapData(json);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Interaction helpers ─────────────────────────────────────────────────────

  const clampOffset = useCallback((x: number, y: number, s: number) => {
    // Allow panning but keep map at least half-visible
    const maxX = (W * s - W) / 2 + W * 0.4;
    const maxY = (H * s - H) / 2 + H * 0.4;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  // Mouse pan
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName === "circle") return; // let dot click handle
    isPanning.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPoint.current.x;
    const dy = e.clientY - lastPoint.current.y;
    lastPoint.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => clampOffset(o.x + dx, o.y + dy, scale));
  };
  const onMouseUp = () => { isPanning.current = false; };

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => Math.max(0.6, Math.min(4, s + delta)));
  };

  // Touch pan + pinch-zoom
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isPanning.current = true;
      lastPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      lastTouchDist.current = Math.hypot(dx, dy);
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning.current) {
      const dx = e.touches[0].clientX - lastPoint.current.x;
      const dy = e.touches[0].clientY - lastPoint.current.y;
      lastPoint.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setOffset((o) => clampOffset(o.x + dx, o.y + dy, scale));
    } else if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = (dist - lastTouchDist.current) * 0.01;
      lastTouchDist.current = dist;
      setScale((s) => Math.max(0.6, Math.min(4, s + delta)));
    }
  };
  const onTouchEnd = () => { isPanning.current = false; };

  // Double-tap to reset
  const lastTap = useRef(0);
  const onTouchStartReset = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
    lastTap.current = now;
    onTouchStart(e);
  };

  // ── SVG dot rendering ───────────────────────────────────────────────────────

  const renderDot = (loc: MapLocation) => {
    const [x, y] = toSVG(loc.lat, loc.lng);
    const discovered = loc.discovered;
    const r = discovered ? 5 : 3.5;

    return (
      <g
        key={loc.id}
        style={{ cursor: "pointer" }}
        onClick={(e) => { e.stopPropagation(); setSelected(loc); }}
        aria-label={loc.name}
        role="button"
      >
        {discovered && (
          <circle
            cx={x} cy={y} r={r + 4}
            fill="none"
            stroke="#C4A040"
            strokeWidth="1"
            opacity="0.3"
          />
        )}
        <circle
          cx={x} cy={y} r={r}
          fill={discovered ? "#C4A040" : "#4a4a4a"}
          opacity={discovered ? 1 : 0.45}
          style={discovered ? { filter: "drop-shadow(0 0 3px #C4A040)" } : undefined}
        />
        {discovered && (
          <text
            x={x} y={y - r - 3}
            textAnchor="middle"
            fontSize="5.5"
            fill="#d4b86a"
            opacity="0.9"
            style={{ pointerEvents: "none", fontFamily: "serif" }}
          >
            {loc.name}
          </text>
        )}
      </g>
    );
  };

  // ── Stats bar ───────────────────────────────────────────────────────────────

  const discoveredCount = mapData?.locations.filter((l) => l.discovered).length ?? 0;
  const totalCount = mapData?.locations.length ?? 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span className="text-sm">Loading map…</span>
        </div>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="text-center py-16 text-[var(--color-text-secondary)] text-sm">
        Unable to load map data.
      </div>
    );
  }

  const seaPts = [MED_SEA_POLY, BLACK_SEA_POLY, RED_SEA_POLY, PERSIAN_GULF_POLY, CASPIAN_SEA_POLY];

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Biblical World Map
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Read chapters to reveal locations
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: "var(--color-accent)" }}>
            {discoveredCount}
            <span className="text-sm font-normal text-[var(--color-text-secondary)]">
              /{totalCount}
            </span>
          </p>
          <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wide">
            Discovered
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: totalCount > 0 ? `${(discoveredCount / totalCount) * 100}%` : "0%",
            background: "linear-gradient(90deg, #8B6E2E, #C4A040)",
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C4A040] inline-block" style={{ boxShadow: "0 0 4px #C4A040" }} />
          Discovered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4a4a4a] opacity-50 inline-block" />
          Undiscovered
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] opacity-60">Pinch/scroll to zoom • Drag to pan</span>
        </span>
      </div>

      {/* SVG Map */}
      <div
        ref={svgContainerRef}
        className="relative w-full overflow-hidden rounded-xl border border-white/[0.06]"
        style={{ aspectRatio: "8/5", background: "#080e15", touchAction: "none" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onTouchStart={onTouchStartReset}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="100%"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isPanning.current ? "none" : "transform 0.15s ease-out",
            cursor: isPanning.current ? "grabbing" : "grab",
          }}
        >
          {/* ── Land background ── */}
          <rect width={W} height={H} fill="#1a2010" />

          {/* ── Sea bodies (cut out from land) ── */}
          {seaPts.map((pts, i) => (
            <polygon key={i} points={pts} fill="#0a1620" opacity="0.95" />
          ))}

          {/* ── Nile river ── */}
          <path d={NILE_PATH} stroke="#1a3040" strokeWidth="2" fill="none" opacity="0.5" />

          {/* ── Grid lines (lat/lon) ── */}
          {/* Every 10° longitude */}
          {[15, 25, 35, 45].map((lng) => {
            const x = ((lng - 5) / 50) * W;
            return <line key={lng} x1={x} y1={0} x2={x} y2={H} stroke="white" strokeWidth="0.3" opacity="0.08" strokeDasharray="4 6" />;
          })}
          {/* Every 10° latitude */}
          {[30, 40].map((lat) => {
            const y = ((50 - lat) / 30) * H;
            return <line key={lat} x1={0} y1={y} x2={W} y2={y} stroke="white" strokeWidth="0.3" opacity="0.08" strokeDasharray="4 6" />;
          })}

          {/* ── Location dots ── */}
          {mapData.locations.map(renderDot)}

          {/* ── Fog of war overlay (undiscovered regions fades to dark) ── */}
          {/* Light radii around discovered points, rest stays dim */}
          <defs>
            <radialGradient id="fogReveal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C4A040" stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Discovered location glow halos */}
          {mapData.locations
            .filter((l) => l.discovered)
            .map((loc) => {
              const [x, y] = toSVG(loc.lat, loc.lng);
              return (
                <circle
                  key={`halo-${loc.id}`}
                  cx={x} cy={y} r={30}
                  fill="url(#fogReveal)"
                  style={{ pointerEvents: "none" }}
                />
              );
            })}

          {/* Map border vignette */}
          <rect
            width={W} height={H}
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity="0.04"
          />
        </svg>

        {/* Empty state overlay */}
        {discoveredCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-8">
              <p className="text-sm font-medium text-white/60">
                No locations discovered yet
              </p>
              <p className="text-xs text-white/30 mt-1">
                Read Bible chapters to reveal the world
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Location panel */}
      <LocationPanel
        location={selected}
        passages={mapData.passages}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
