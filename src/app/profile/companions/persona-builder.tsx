"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { buildPersona, type PersonaBuildInput } from "./actions";
import { setActiveCompanion } from "./actions";

interface CompanionLite {
  id: string;
  slug: string;
  display_name: string;
}

interface PersonaBuilderProps {
  sourceCompanions: CompanionLite[];
  onDone: () => void;
}

const STYLES = [
  { value: "conversational", label: "Conversational", desc: "Warm, direct, accessible" },
  { value: "scholarly", label: "Scholarly", desc: "Precise, text-focused, academic depth" },
  { value: "devotional", label: "Devotional", desc: "Prayerful, slow, spiritually attentive" },
  { value: "prophetic", label: "Prophetic", desc: "Urgent, confrontational, reforming" },
] as const;

const TRADITIONS = [
  "Reformed", "Lutheran", "Methodist", "Baptist", "Catholic",
  "Anglican", "Anabaptist", "Pentecostal", "Eastern Orthodox", "Evangelical", "Mystic",
];

export default function PersonaBuilder({
  sourceCompanions,
  onDone,
}: PersonaBuilderProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [traditions, setTraditions] = useState<string[]>([]);
  const [style, setStyle] = useState<PersonaBuildInput["style"]>("conversational");
  const [sources, setSources] = useState<string[]>([]);
  const [voiceNotes, setVoiceNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleTradition(t: string) {
    setTraditions((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function toggleSource(slug: string) {
    setSources((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < 3
        ? [...prev, slug]
        : prev
    );
  }

  function handleBuild() {
    if (!name.trim()) { setError("Give your companion a name."); return; }
    setError(null);
    startTransition(async () => {
      try {
        const newId = await buildPersona({
          name: name.trim(),
          tradition: traditions,
          style,
          sourceCompanionSlugs: sources,
          voiceNotes,
        });
        // Set as active
        await setActiveCompanion(newId);
        onDone();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#141414] border border-[#2C2C2C] rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[#E8E0D4] font-bold text-lg">Build Your Companion</h2>
            <p className="text-[#6B6056] text-xs mt-0.5">Step {step} of 4</p>
          </div>
          <button onClick={onDone} className="text-[#6B6056] hover:text-[#E8E0D4]">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? "bg-[#C4A040]" : "bg-[#2C2C2C]"
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-[#8A7F72] text-xs font-medium block mb-2">
                Name your companion
              </label>
              <input
                type="text"
                placeholder="e.g. Didymus, Brother Thomas, The Pilgrim…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-4 py-2.5 text-[#E8E0D4] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#C4A040] text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[#8A7F72] text-xs font-medium block mb-2">
                Theological tradition (pick all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {TRADITIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTradition(t)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      traditions.includes(t)
                        ? "bg-[#C4A040] border-[#C4A040] text-[#0D0D0D] font-semibold"
                        : "border-[#2C2C2C] text-[#8A7F72] hover:border-[#C4A040]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Style */}
        {step === 2 && (
          <div className="space-y-3">
            <label className="text-[#8A7F72] text-xs font-medium block mb-1">
              Communication style
            </label>
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  style === s.value
                    ? "border-[#C4A040] bg-[#1A1A1A]"
                    : "border-[#2C2C2C] bg-[#0D0D0D] hover:border-[#3C3C3C]"
                }`}
              >
                <p className="text-[#E8E0D4] text-sm font-medium">{s.label}</p>
                <p className="text-[#6B6056] text-xs mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — Source companions */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="text-[#8A7F72] text-xs font-medium block mb-1">
              Source theologians — pick up to 3
            </label>
            {sourceCompanions.map((c) => (
              <button
                key={c.slug}
                onClick={() => toggleSource(c.slug)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  sources.includes(c.slug)
                    ? "border-[#C4A040] bg-[#1A1A1A]"
                    : "border-[#2C2C2C] bg-[#0D0D0D] hover:border-[#3C3C3C]"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    sources.includes(c.slug) ? "text-[#C4A040]" : "text-[#E8E0D4]"
                  }`}
                >
                  {c.display_name}
                </p>
              </button>
            ))}
            <p className="text-[#4A4040] text-xs">
              Your companion will synthesize influences from your chosen voices.
            </p>
          </div>
        )}

        {/* Step 4 — Voice notes */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="text-[#8A7F72] text-xs font-medium block mb-2">
                Custom voice notes{" "}
                <span className="text-[#4A4040]">(optional)</span>
              </label>
              <textarea
                placeholder={`"Always bring questions back to the cross."\n"Never use the word 'journey.'"\n"Speak to me like I'm a thinking adult."`}
                value={voiceNotes}
                onChange={(e) => setVoiceNotes(e.target.value)}
                rows={5}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-lg px-4 py-2.5 text-[#E8E0D4] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#C4A040] text-sm resize-none"
              />
            </div>
            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}
          </div>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1E1E1E]">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-[#8A7F72] text-sm hover:text-[#E8E0D4] transition-colors"
            >
              ← Back
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !name.trim()}
              className="bg-[#C4A040] text-[#0D0D0D] text-sm font-semibold px-6 py-2 rounded-full hover:bg-[#D4B050] transition-colors disabled:opacity-40"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleBuild}
              disabled={isPending}
              className="bg-[#C4A040] text-[#0D0D0D] text-sm font-semibold px-6 py-2 rounded-full hover:bg-[#D4B050] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Building…
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Build Companion
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
