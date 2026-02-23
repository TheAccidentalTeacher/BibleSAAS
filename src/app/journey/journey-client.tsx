"use client";

import { useState } from "react";
import { Map, BookOpen, GitBranch, Star, BarChart2 } from "lucide-react";
import type { JourneyData, JourneyView } from "./journey-types";
import JourneyStats from "./views/journey-stats";
import JourneyPhases from "./views/journey-phases";
import JourneyConstellation from "./views/journey-constellation";
import JourneySkillTree from "./views/journey-skill-tree";
import JourneyFogMap from "./views/journey-fog-map";

interface Props {
  data: JourneyData;
}

const TABS: { id: JourneyView; label: string; Icon: React.ElementType }[] = [
  { id: "stats",         label: "Stats",  Icon: BarChart2  },
  { id: "phases",        label: "Phases", Icon: BookOpen   },
  { id: "skill-tree",    label: "Tree",   Icon: GitBranch  },
  { id: "constellation", label: "Stars",  Icon: Star       },
  { id: "map",           label: "Map",    Icon: Map        },
];

export default function JourneyClient({ data }: Props) {
  const [activeView, setActiveView] = useState<JourneyView>("stats");

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-primary)]">
      {/* Tab bar */}
      <nav className="sticky top-0 z-20 bg-[var(--color-bg-primary)] border-b border-white/[0.06] px-4">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label, Icon }) => {
            const active = id === activeView;
            return (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className="flex flex-col items-center gap-1 px-3 py-3 flex-none transition-colors"
                style={{
                  color: active ? "var(--color-accent)" : "var(--color-text-secondary)",
                  borderBottom: active ? "2px solid var(--color-accent)" : "2px solid transparent",
                }}
              >
                <Icon size={16} />
                <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* View content */}
      <div className="flex-1 px-4 pt-5 overflow-y-auto">
        {activeView === "stats"         && <JourneyStats         data={data} />}
        {activeView === "phases"        && <JourneyPhases        data={data} />}
        {activeView === "skill-tree"    && <JourneySkillTree     data={data} />}
        {activeView === "constellation" && <JourneyConstellation data={data} />}
        {activeView === "map"           && <JourneyFogMap       data={data} />}
      </div>
    </div>
  );
}
