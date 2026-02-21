"use client";

/**
 * PlanPicker — Bottom sheet for selecting a reading plan.
 * Called from dashboard when no active plan exists.
 */

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import type { ReadingPlanRow } from "@/types/database";

interface PlanPickerProps {
  plans: ReadingPlanRow[];
  onSelect: (planId: string) => void;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  sequential: "Sequential",
  chronological: "Chronological",
  topical: "Topical",
  single_book: "Single Book",
  custom: "Custom",
};

export default function PlanPicker({ plans, onSelect, onClose }: PlanPickerProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/reading-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });
      if (res.ok) {
        onSelect(planId);
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Sheet */}
      <div
        className="relative z-10 rounded-t-3xl max-h-[85vh] overflow-y-auto"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <h2 className="font-semibold text-base" style={{ color: "var(--color-text-1)" }}>
            Choose a Reading Plan
          </h2>
          <button onClick={onClose} style={{ color: "var(--color-text-2)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3 pb-10">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSelect(plan.id)}
              disabled={loading === plan.id}
              className="text-left rounded-2xl p-4 border transition-colors"
              style={{
                background: "var(--color-surface-2)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text-1)" }}>
                      {plan.name}
                    </p>
                    {plan.is_default && (
                      <span
                        className="text-[10px] rounded-full px-2 py-0.5 font-semibold"
                        style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
                      >
                        Recommended
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-2)" }}>
                      {plan.description}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-3)" }}>
                    {TYPE_LABELS[plan.type] ?? plan.type}
                    {plan.total_days ? ` · ${plan.total_days} days` : ""}
                  </p>
                </div>
                {loading === plan.id && (
                  <CheckCircle size={18} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
