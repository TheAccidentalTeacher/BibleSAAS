"use client";

/**
 * TrailConstellation — D3 force-directed graph visualization of a cross-reference trail.
 *
 * Each node = a verse stop on the trail.
 * Each edge = the sequential connection between stops.
 * Node radius grows with TSK density (approximated by step index for now —
 * a future iteration can fetch verse stats per node).
 */

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { GitFork, ChevronLeft, ChevronRight, Pencil, Share2, Check, X } from "lucide-react";

interface TrailStep {
  id: string;
  step_order: number;
  book: string;
  chapter: number;
  verse: number;
  note: string | null;
}

interface Trail {
  id: string;
  name: string | null;
  trail_type: string;
  origin_book: string;
  origin_chapter: number;
  origin_verse: number;
  step_count: number;
  share_token: string;
  is_public: boolean;
  created_at: string;
  completed_at: string | null;
}

interface TrailConstellationProps {
  trail: Trail;
  steps: TrailStep[];
  /** Whether the current user is the owner (can rename, share) */
  isOwner: boolean;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  stepOrder: number;
  ref: string;
  book: string;
  chapter: number;
  verse: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const NODE_ACCENT = "var(--color-accent, #C4A77D)";
const NODE_COLORS = [
  "#C4A77D", "#6ee7b7", "#f59e0b", "#60a5fa",
  "#a78bfa", "#f472b6", "#34d399", "#fb923c",
];

export default function TrailConstellation({ trail, steps, isOwner }: TrailConstellationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIdx, setActiveIdx] = useState(0); // which step is focused in bottom drawer
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(trail.name ?? "");
  const [trailName, setTrailName] = useState<string | null>(trail.name);
  const [savingName, setSavingName] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeStep = steps[activeIdx] ?? null;

  // ── D3 graph ──────────────────────────────────────────────────────────────
  const drawGraph = useCallback(() => {
    const container = svgRef.current?.parentElement;
    if (!container || steps.length === 0) return;

    const W = container.clientWidth;
    const H = Math.min(container.clientHeight, 320);

    const nodes: GraphNode[] = steps.map((s, i) => ({
      id: s.id,
      stepOrder: s.step_order,
      ref: `${s.book} ${s.chapter}:${s.verse}`,
      book: s.book,
      chapter: s.chapter,
      verse: s.verse,
      // Spread nodes radially from center as starting positions
      x: W / 2 + Math.cos((i / steps.length) * 2 * Math.PI) * (W * 0.3),
      y: H / 2 + Math.sin((i / steps.length) * 2 * Math.PI) * (H * 0.3),
    }));

    const links: GraphLink[] = steps.slice(1).map((s, i) => ({
      source: steps[i].id,
      target: s.id,
    }));

    // Clear existing
    const svgEl = svgRef.current!;
    d3.select(svgEl).selectAll("*").remove();
    svgEl.setAttribute("width", String(W));
    svgEl.setAttribute("height", String(H));

    const svg = d3.select(svgEl);

    // Add arrow marker
    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 18)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#888");

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(90).strength(0.7))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide(32))
      .alphaDecay(0.04);

    // Links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#555")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5,3")
      .attr("marker-end", "url(#arrow)");

    // Step-order labels on links
    const linkLabel = svg.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("font-size", 9)
      .attr("fill", "#888")
      .text((_, i) => `+${i + 1}`);

    // Nodes
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (_, d) => {
        const idx = steps.findIndex((s) => s.id === d.id);
        if (idx >= 0) setActiveIdx(idx);
      });

    nodeGroup.append("circle")
      .attr("r", (d, i) => (i === 0 ? 18 : 14))
      .attr("fill", (d, i) => NODE_COLORS[i % NODE_COLORS.length])
      .attr("opacity", 0.85)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", 9)
      .attr("font-weight", "bold")
      .attr("fill", "#1a1a1a")
      .text((d) => String(d.stepOrder));

    // Ref labels below nodes
    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 22)
      .attr("font-size", 8)
      .attr("fill", "#ccc")
      .text((d) => d.ref.length > 14 ? d.ref.slice(0, 13) + "…" : d.ref);

    simulation.on("tick", () => {
      // Clamp nodes to SVG bounds
      nodes.forEach((d) => {
        d.x = Math.max(30, Math.min(W - 30, d.x ?? W / 2));
        d.y = Math.max(25, Math.min(H - 25, d.y ?? H / 2));
      });

      link
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

      linkLabel
        .attr("x", (d) => (((d.source as GraphNode).x ?? 0) + ((d.target as GraphNode).x ?? 0)) / 2)
        .attr("y", (d) => (((d.source as GraphNode).y ?? 0) + ((d.target as GraphNode).y ?? 0)) / 2);

      nodeGroup.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Highlight active node
    simulation.on("end", () => {
      nodeGroup.selectAll<SVGCircleElement, GraphNode>("circle")
        .attr("stroke-width", (d) => steps.findIndex((s) => s.id === d.id) === activeIdx ? 3 : 1.5)
        .attr("stroke", (d) => steps.findIndex((s) => s.id === d.id) === activeIdx ? NODE_ACCENT : "#fff");
    });

    return () => { simulation.stop(); };
  }, [steps, activeIdx]);

  useEffect(() => {
    const cleanup = drawGraph();
    return () => { cleanup?.(); };
  }, [drawGraph]);

  // Redraw on resize
  useEffect(() => {
    const ro = new ResizeObserver(() => drawGraph());
    if (svgRef.current?.parentElement) ro.observe(svgRef.current.parentElement);
    return () => ro.disconnect();
  }, [drawGraph]);

  // ── Rename ────────────────────────────────────────────────────────────────
  async function saveName() {
    if (!nameInput.trim()) return;
    setSavingName(true);
    const res = await fetch(`/api/trails/${trail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.trim() }),
    });
    setSavingName(false);
    if (res.ok) {
      setTrailName(nameInput.trim());
      setRenaming(false);
    }
  }

  // ── Share ─────────────────────────────────────────────────────────────────
  async function handleShare() {
    // Make trail public and copy share link
    await fetch(`/api/trails/${trail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_public: true }),
    });
    const url = `${window.location.origin}/share/trail/${trail.share_token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy trail link:", url);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ color: "var(--color-text-1)" }}>
      {/* ── Trail header ── */}
      <div
        className="flex items-center justify-between px-5 pt-5 pb-3 border-b gap-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex-1 min-w-0">
          {renaming ? (
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-transparent border-b text-sm font-semibold outline-none min-w-0"
                style={{ borderColor: "var(--color-accent)", color: "var(--color-text-1)" }}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void saveName(); if (e.key === "Escape") setRenaming(false); }}
                autoFocus
              />
              <button
                onClick={() => void saveName()}
                disabled={savingName}
                className="p-1 rounded"
                style={{ color: "var(--color-accent)" }}
              >
                <Check size={16} />
              </button>
              <button onClick={() => setRenaming(false)} className="p-1 rounded" style={{ color: "var(--color-text-3)" }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <GitFork size={14} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
              <span
                className="text-sm font-semibold truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {trailName ?? `Trail from ${trail.origin_book} ${trail.origin_chapter}:${trail.origin_verse}`}
              </span>
              {isOwner && (
                <button
                  onClick={() => { setNameInput(trailName ?? ""); setRenaming(true); }}
                  className="p-1 rounded flex-shrink-0"
                  style={{ color: "var(--color-text-3)" }}
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          )}
          <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-3)" }}>
            {steps.length} stop{steps.length !== 1 ? "s" : ""} · {trail.trail_type.replace(/_/g, " ")}
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => void handleShare()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
            style={{ background: "var(--color-surface-2)", color: "var(--color-text-1)" }}
          >
            {copied ? <Check size={13} /> : <Share2 size={13} />}
            {copied ? "Copied!" : "Share"}
          </button>
        )}
      </div>

      {/* ── D3 Constellation ── */}
      <div
        className="flex-1 min-h-[280px] relative"
        style={{ background: "var(--color-bg)" }}
      >
        {steps.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: "var(--color-text-3)" }}>
              No steps yet.
            </p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        )}
      </div>

      {/* ── Step drawer ── */}
      {activeStep && (
        <div
          className="px-5 py-4 border-t"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--color-text-3)" }}
              >
                Step {activeStep.step_order}
              </span>
              <a
                href={`/read/${activeStep.book}/${activeStep.chapter}`}
                className="ml-2 text-sm font-bold hover:underline"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  color: "var(--color-accent)",
                }}
              >
                {activeStep.book} {activeStep.chapter}:{activeStep.verse}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx((p) => Math.max(0, p - 1))}
                className="p-1 rounded-lg disabled:opacity-30"
                style={{ background: "var(--color-surface-2)", color: "var(--color-text-1)" }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={activeIdx === steps.length - 1}
                onClick={() => setActiveIdx((p) => Math.min(steps.length - 1, p + 1))}
                className="p-1 rounded-lg disabled:opacity-30"
                style={{ background: "var(--color-surface-2)", color: "var(--color-text-1)" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          {activeStep.note && (
            <p className="text-xs italic" style={{ color: "var(--color-text-2)" }}>
              &ldquo;{activeStep.note}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
