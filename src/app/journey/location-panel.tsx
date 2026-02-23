"use client";

import { useEffect, useRef } from "react";
import { X, MapPin, Star, Scroll } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MapLocation {
  id: string;
  name: string;
  alternate_names: string[];
  modern_name: string | null;
  lat: number;
  lng: number;
  location_type: string;
  description: string;
  significance: string;
  total_passages: number;
  discovered: boolean;
}

export interface PassageEntry {
  location_id: string;
  book: string;
  chapter: number;
  context_note: string | null;
  read: boolean;
}

interface Props {
  location: MapLocation | null;
  passages: PassageEntry[];
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  city:      "bg-amber-900/60 text-amber-300",
  mountain:  "bg-stone-700/60 text-stone-300",
  river:     "bg-blue-900/60 text-blue-300",
  sea:       "bg-cyan-900/60 text-cyan-300",
  region:    "bg-emerald-900/60 text-emerald-300",
  desert:    "bg-yellow-900/60 text-yellow-300",
  valley:    "bg-green-900/60 text-green-300",
  well:      "bg-teal-900/60 text-teal-300",
  plain:     "bg-lime-900/60 text-lime-300",
};

const BOOK_NAMES: Record<string, string> = {
  GEN:"Genesis", EXO:"Exodus", LEV:"Leviticus", NUM:"Numbers", DEU:"Deuteronomy",
  JOS:"Joshua", JDG:"Judges", RUT:"Ruth", "1SA":"1 Samuel", "2SA":"2 Samuel",
  "1KI":"1 Kings", "2KI":"2 Kings", "1CH":"1 Chronicles", "2CH":"2 Chronicles",
  EZR:"Ezra", NEH:"Nehemiah", EST:"Esther", JOB:"Job", PSA:"Psalms",
  PRO:"Proverbs", ECC:"Ecclesiastes", SNG:"Song of Songs", ISA:"Isaiah",
  JER:"Jeremiah", LAM:"Lamentations", EZK:"Ezekiel", DAN:"Daniel",
  HOS:"Hosea", JOL:"Joel", AMO:"Amos", OBA:"Obadiah", JON:"Jonah",
  MIC:"Micah", NAH:"Nahum", HAB:"Habakkuk", ZEP:"Zephaniah", HAG:"Haggai",
  ZEC:"Zechariah", MAL:"Malachi",
  MAT:"Matthew", MRK:"Mark", LUK:"Luke", JHN:"John", ACT:"Acts",
  ROM:"Romans", "1CO":"1 Corinthians", "2CO":"2 Corinthians", GAL:"Galatians",
  EPH:"Ephesians", PHP:"Philippians", COL:"Colossians", "1TH":"1 Thessalonians",
  "2TH":"2 Thessalonians", "1TI":"1 Timothy", "2TI":"2 Timothy", TIT:"Titus",
  PHM:"Philemon", HEB:"Hebrews", JAS:"James", "1PE":"1 Peter", "2PE":"2 Peter",
  "1JN":"1 John", "2JN":"2 John", "3JN":"3 John", JUD:"Jude", REV:"Revelation",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function LocationPanel({ location, passages, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!location) return null;

  const locPassages = passages.filter((p) => p.location_id === location.id);
  const readPassages = locPassages.filter((p) => p.read);
  const typeLabel = location.location_type.charAt(0).toUpperCase() + location.location_type.slice(1);
  const typeCls = TYPE_COLORS[location.location_type] ?? "bg-zinc-700/60 text-zinc-300";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto
                   rounded-t-2xl bg-[var(--color-bg-secondary)] border-t border-white/[0.08]
                   shadow-2xl animate-slide-up"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        role="dialog"
        aria-label={`Location: ${location.name}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white leading-tight">{location.name}</h2>
              <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${typeCls}`}>
                {typeLabel}
              </span>
              {location.discovered && (
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 flex items-center gap-1">
                  <Star size={8} fill="currentColor" /> Discovered
                </span>
              )}
            </div>

            {location.alternate_names && location.alternate_names.length > 0 && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Also known as: {location.alternate_names.join(", ")}
              </p>
            )}

            {location.modern_name && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
                <MapPin size={10} className="flex-shrink-0" />
                {location.modern_name}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 rounded-full p-1.5 text-[var(--color-text-secondary)]
                       hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-white/[0.06]" />

        {/* Description */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">
              {location.description}
            </p>
          </div>

          {location.significance && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
              <p className="text-xs font-semibold text-yellow-400/80 uppercase tracking-wide mb-1">
                Significance
              </p>
              <p className="text-sm text-yellow-100/80 leading-relaxed italic">
                {location.significance}
              </p>
            </div>
          )}

          {/* Passages */}
          {locPassages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Scroll size={13} className="text-[var(--color-text-secondary)]" />
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                  Passages at this location
                </p>
                <span className="text-[10px] bg-white/10 text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded-full">
                  {readPassages.length}/{locPassages.length} read
                </span>
              </div>

              <div className="space-y-1.5">
                {locPassages.map((p, i) => {
                  const bookName = BOOK_NAMES[p.book] ?? p.book;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm
                        ${p.read
                          ? "bg-yellow-500/10 border border-yellow-500/20"
                          : "bg-white/[0.03] border border-white/[0.05]"
                        }`}
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${p.read ? "bg-yellow-400" : "bg-white/20"}`} />
                      <div className="min-w-0">
                        <span className={`font-medium ${p.read ? "text-yellow-200" : "text-[var(--color-text-secondary)]"}`}>
                          {bookName} {p.chapter}
                        </span>
                        {p.context_note && (
                          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                            {p.context_note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animation style (for minimal slide-up) */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
