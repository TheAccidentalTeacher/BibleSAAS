"use client";

/**
 * AchievementToast — pops up briefly when the user earns an achievement.
 *
 * Usage:
 *   const [toast, setToast] = useState<string[]>([]);
 *   // when API returns achievements: earned
 *   setToast(earned);
 *
 *   <AchievementToast keys={toast} onDismiss={() => setToast([])} />
 */

import { useEffect, useState } from "react";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievements-data";

interface Props {
  earned: string[]; // achievement keys
  onDismiss: () => void;
}

export default function AchievementToast({ earned, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (earned.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [earned, onDismiss]);

  if (!visible || earned.length === 0) return null;

  const defs = earned
    .map((k) => ACHIEVEMENT_DEFINITIONS.find((d) => d.key === k))
    .filter(Boolean);

  return (
    <div
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {defs.map((def) => (
        <div
          key={def!.key}
          className="flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg border animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-accent)",
            color: "var(--color-text-1)",
            minWidth: "220px",
          }}
        >
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              Achievement Unlocked
            </p>
            <p className="text-[14px] font-medium">{def!.name}</p>
            <p className="text-[12px]" style={{ color: "var(--color-text-3)" }}>{def!.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
