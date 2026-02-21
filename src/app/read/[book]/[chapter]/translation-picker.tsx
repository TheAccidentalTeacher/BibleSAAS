"use client";

/**
 * TranslationPicker — Bottom sheet for switching Bible translation.
 *
 * Groups translations into FREE and STANDARD tiers.
 * Locked translations show a lock icon and are disabled for free users.
 */

import { useEffect } from "react";
import { X, Lock } from "lucide-react";
import { TRANSLATIONS } from "@/lib/bible/types";

interface TranslationPickerProps {
  currentTranslation: string;
  userTier: string;
  onSelect: (slug: string) => void;
  onClose: () => void;
}

const FREE_TIERS = ["free"];
const PAID_TIERS = ["standard", "premium"];

function userCanAccess(translationTier: string, userTier: string): boolean {
  if (translationTier === "free") return true;
  if (translationTier === "standard")
    return ["standard", "premium", "your_edition"].includes(userTier);
  if (translationTier === "premium")
    return ["premium", "your_edition"].includes(userTier);
  return false;
}

export default function TranslationPicker({
  currentTranslation,
  userTier,
  onSelect,
  onClose,
}: TranslationPickerProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const freeTranslations = TRANSLATIONS.filter((t) =>
    FREE_TIERS.includes(t.tier)
  );
  const standardTranslations = TRANSLATIONS.filter((t) =>
    PAID_TIERS.includes(t.tier)
  );

  function handleSelect(code: string, tier: string) {
    if (!userCanAccess(tier, userTier)) return;
    onSelect(code);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 rounded-t-2xl shadow-2xl"
        role="dialog"
        aria-label="Translation picker"
        style={{
          background: "var(--color-surface)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--color-border)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pb-3 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2
            className="font-semibold text-sm"
            style={{ color: "var(--color-text-1)" }}
          >
            Choose Translation
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-full"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-2)",
            }}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Free group */}
        <div className="px-4 pt-4">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1"
            style={{ color: "var(--color-text-3)" }}
          >
            Free
          </p>
          <div className="flex flex-col gap-1">
            {freeTranslations.map((t) => (
              <button
                key={t.code}
                onClick={() => handleSelect(t.code, t.tier)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors"
                style={{
                  background:
                    currentTranslation === t.code
                      ? "var(--color-accent)"
                      : "var(--color-surface-2)",
                  color:
                    currentTranslation === t.code
                      ? "var(--color-bg)"
                      : "var(--color-text-1)",
                }}
              >
                <span className="text-sm font-medium">{t.name}</span>
                <span
                  className="text-xs font-bold ml-2 shrink-0"
                  style={{
                    color:
                      currentTranslation === t.code
                        ? "var(--color-bg)"
                        : "var(--color-text-3)",
                  }}
                >
                  {t.abbreviation}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Standard+ group */}
        <div className="px-4 pt-5 pb-8">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5"
            style={{ color: "var(--color-text-3)" }}
          >
            Standard+
            {userTier === "free" && (
              <Lock
                size={10}
                style={{ color: "var(--color-text-3)" }}
              />
            )}
          </p>
          <div className="flex flex-col gap-1">
            {standardTranslations.map((t) => {
              const accessible = userCanAccess(t.tier, userTier);
              return (
                <button
                  key={t.code}
                  onClick={() => handleSelect(t.code, t.tier)}
                  disabled={!accessible}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors disabled:opacity-50"
                  style={{
                    background:
                      currentTranslation === t.code
                        ? "var(--color-accent)"
                        : "var(--color-surface-2)",
                    color:
                      currentTranslation === t.code
                        ? "var(--color-bg)"
                        : accessible
                          ? "var(--color-text-1)"
                          : "var(--color-text-3)",
                    cursor: accessible ? "pointer" : "default",
                  }}
                >
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="flex items-center gap-1.5 ml-2 shrink-0">
                    {!accessible && (
                      <Lock
                        size={12}
                        style={{ color: "var(--color-text-3)" }}
                      />
                    )}
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          currentTranslation === t.code
                            ? "var(--color-bg)"
                            : "var(--color-text-3)",
                      }}
                    >
                      {t.abbreviation}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {userTier === "free" && (
            <p
              className="mt-4 text-xs text-center"
              style={{ color: "var(--color-text-3)" }}
            >
              Upgrade to Standard to unlock ESV, NIV, NLT, and more.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
