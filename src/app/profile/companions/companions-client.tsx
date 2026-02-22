"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Lock, Plus } from "lucide-react";
import { setActiveCompanion } from "./actions";
import PersonaBuilder from "./persona-builder";

interface CompanionDef {
  id: string;
  slug: string;
  display_name: string;
  tagline: string | null;
  tradition: string | null;
  price_usd: number;
  is_default: boolean;
  is_custom: boolean;
}

interface CompanionsClientProps {
  companions: CompanionDef[];
  ownedIds: Set<string>;
  currentTier: string;
  activeCompanionId: string | null;
}

export default function CompanionsClient({
  companions,
  ownedIds,
  currentTier,
  activeCompanionId,
}: CompanionsClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const isYourEdition = currentTier === "your_edition";
  const canBuyCompanions = currentTier !== "free";

  function handleSwitch(companionId: string | null) {
    setSwitchingId(companionId ?? "charles");
    startTransition(async () => {
      await setActiveCompanion(companionId);
      setSwitchingId(null);
      router.refresh();
    });
  }

  // Owned = default Charles + anything in ownedIds
  function isOwned(def: CompanionDef): boolean {
    return def.is_default || ownedIds.has(def.id);
  }

  // Active companion: null means Charles (default)
  function isActive(def: CompanionDef): boolean {
    if (def.is_default) return activeCompanionId === null;
    return activeCompanionId === def.id;
  }

  const owned = companions.filter(isOwned);
  const available = companions.filter((c) => !isOwned(c) && !c.is_custom);
  const sourceCompanions = companions.filter((c) => !c.is_custom && !c.is_default);

  // Sort: default first, then by sort_order
  owned.sort((a, b) => (a.is_default ? -1 : b.is_default ? 1 : 0));

  return (
    <>
      {showBuilder && isYourEdition && (
        <PersonaBuilder
          sourceCompanions={sourceCompanions}
          onDone={() => {
            setShowBuilder(false);
            router.refresh();
          }}
        />
      )}

      <div className="min-h-screen bg-[#0D0D0D] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#E8E0D4]">Companions</h1>
            <p className="text-[#6B6056] text-sm mt-1">
              Choose the theological voice that walks through Scripture with you.
            </p>
          </div>

          {/* Owned companions */}
          <section className="mb-8">
            <h2 className="text-[#8A7F72] text-xs font-semibold uppercase tracking-widest mb-3">
              Your Library
            </h2>
            <div className="space-y-2">
              {owned.map((c) => {
                const active = isActive(c);
                const isSwitching = switchingId === (c.is_default ? "charles" : c.id);

                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${
                      active
                        ? "border-[#C4A040] bg-[#1A1A1A]"
                        : "border-[#2C2C2C] bg-[#141414]"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[#E8E0D4] font-medium text-sm">
                          {c.display_name}
                        </p>
                        {c.is_custom && (
                          <span className="text-[10px] bg-[#C4A040]/20 text-[#C4A040] px-1.5 py-0.5 rounded-full font-medium">
                            Custom
                          </span>
                        )}
                        {active && (
                          <span className="text-[10px] bg-[#C4A040] text-[#0D0D0D] px-1.5 py-0.5 rounded-full font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      {c.tagline && (
                        <p className="text-[#6B6056] text-xs mt-0.5 truncate">{c.tagline}</p>
                      )}
                    </div>

                    {!active && (
                      <button
                        onClick={() => handleSwitch(c.is_default ? null : c.id)}
                        disabled={pending}
                        className="ml-4 text-xs text-[#C4A040] border border-[#C4A040]/40 px-3 py-1 rounded-full hover:bg-[#C4A040]/10 transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                      >
                        {isSwitching && <Loader2 size={11} className="animate-spin" />}
                        <Check size={11} />
                        Use
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Store — available companions */}
          {available.length > 0 && (
            <section className="mb-8">
              <h2 className="text-[#8A7F72] text-xs font-semibold uppercase tracking-widest mb-3">
                Meet More
              </h2>
              <div className="space-y-2">
                {available.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-5 py-4 rounded-xl border border-[#2C2C2C] bg-[#141414]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[#E8E0D4] font-medium text-sm">
                        {c.display_name}
                      </p>
                      {c.tagline && (
                        <p className="text-[#6B6056] text-xs mt-0.5 truncate">{c.tagline}</p>
                      )}
                      {c.tradition && (
                        <p className="text-[#4A4040] text-xs mt-0.5 capitalize">{c.tradition}</p>
                      )}
                    </div>

                    <div className="ml-4 shrink-0">
                      {canBuyCompanions ? (
                        <button
                          onClick={() =>
                            router.push(
                              `/api/stripe/checkout?companion=${c.id}`
                            )
                          }
                          className="text-xs bg-[#1E1E1E] border border-[#3C3C3C] text-[#E8E0D4] px-3 py-1 rounded-full hover:border-[#C4A040] transition-all"
                        >
                          ${c.price_usd.toFixed(0)} — Add
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-[#4A4040]">
                          <Lock size={11} />
                          Disciple+
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Persona Builder CTA */}
          <section>
            <h2 className="text-[#8A7F72] text-xs font-semibold uppercase tracking-widest mb-3">
              Build Your Own
            </h2>
            <div
              className={`px-5 py-5 rounded-xl border transition-all ${
                isYourEdition
                  ? "border-[#C4A040]/40 bg-[#141414]"
                  : "border-[#2C2C2C] bg-[#0D0D0D]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[#E8E0D4] font-medium text-sm">Persona Builder</p>
                  <p className="text-[#6B6056] text-xs mt-1 leading-relaxed max-w-xs">
                    Design a companion with your own name, theological tradition, communication
                    style, and voice. Claude generates the persona from your specifications.
                  </p>
                  {!isYourEdition && (
                    <p className="text-[#4A4040] text-xs mt-2 flex items-center gap-1">
                      <Lock size={10} />
                      Living Bible exclusive
                    </p>
                  )}
                </div>
                <button
                  onClick={() => isYourEdition && setShowBuilder(true)}
                  disabled={!isYourEdition}
                  className={`shrink-0 flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all ${
                    isYourEdition
                      ? "bg-[#C4A040] text-[#0D0D0D] hover:bg-[#D4B050]"
                      : "bg-[#1A1A1A] text-[#4A4040] border border-[#2C2C2C] cursor-not-allowed"
                  }`}
                >
                  <Plus size={12} />
                  Build
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
