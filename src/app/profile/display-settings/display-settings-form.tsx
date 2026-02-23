"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TRANSLATIONS } from "@/lib/bible/index";
import { saveDisplaySettings } from "./actions";

const VISUAL_THEMES = [
  { value: "default", label: "Classic", accent: "#C8A96E", bg: "#0F0F0F", desc: "Warm gold on deep black" },
  { value: "runner",  label: "Runner",  accent: "#E85D2F", bg: "#0D0D0F", desc: "Ember orange, velocity" },
  { value: "home",    label: "Home",    accent: "#D4A853", bg: "#0F0E0A", desc: "Morning light, wood grain" },
  { value: "library", label: "Library", accent: "#3B82B8", bg: "#0A0E10", desc: "Deep focus, late-night study" },
  { value: "garden",  label: "Garden",  accent: "#5E9E6E", bg: "#090F0B", desc: "Quiet growth, morning dew" },
  { value: "puzzle",  label: "Puzzle",  accent: "#7C6BD6", bg: "#0A0810", desc: "Discovery, wonder" },
];

const READ_MODES = [
  { value: "dark",  label: "Dark",  desc: "Restful at night" },
  { value: "light", label: "Light", desc: "Clean, daytime" },
  { value: "sepia", label: "Sepia", desc: "Warm parchment" },
];

const BIBLE_FONTS = [
  { value: "eb_garamond",  label: "EB Garamond",  css: "var(--font-garamond), Georgia, serif" },
  { value: "lora",         label: "Lora",          css: "var(--font-lora), Georgia, serif" },
  { value: "merriweather", label: "Merriweather",  css: "var(--font-merriweather), Georgia, serif" },
  { value: "literata",     label: "Literata",      css: "var(--font-literata), Georgia, serif" },
  { value: "system_serif", label: "System Serif",  css: "Georgia, 'Times New Roman', serif" },
];

const FONT_SIZES = [
  { value: "small",  label: "S",  px: "16px" },
  { value: "medium", label: "M",  px: "18px" },
  { value: "large",  label: "L",  px: "20px" },
  { value: "xlarge", label: "XL", px: "22px" },
];

const FONT_SIZE_MAP: Record<string, string> = {
  small: "16px", medium: "18px", large: "20px", xlarge: "22px",
};

interface Props {
  initial: {
    visual_theme: string;
    theme: string;
    bible_reading_font: string;
    font_size: string;
    translation: string;
    catechism_layer_enabled: boolean;
    show_cross_refs: boolean;
    show_verse_numbers: boolean;
    spurgeon_enabled: boolean;
  };
}

export default function DisplaySettingsForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [visualTheme,  setVisualTheme]  = useState(initial.visual_theme);
  const [theme,        setTheme]        = useState(initial.theme);
  const [font,         setFont]         = useState(initial.bible_reading_font);
  const [fontSize,     setFontSize]     = useState(initial.font_size);
  const [translation,  setTranslation]  = useState(initial.translation);
  const [catechism,    setCatechism]    = useState(initial.catechism_layer_enabled);
  const [crossRefs,    setCrossRefs]    = useState(initial.show_cross_refs);
  const [verseNums,    setVerseNums]    = useState(initial.show_verse_numbers);
  const [spurgeon,     setSpurgeon]     = useState(initial.spurgeon_enabled);

  // Live preview — update html element immediately
  const applyTheme = (t: string) => {
    document.documentElement.setAttribute("data-theme", t);
    setVisualTheme(t);
  };
  const applyMode = (m: string) => {
    if (m === "dark") document.documentElement.removeAttribute("data-mode");
    else document.documentElement.setAttribute("data-mode", m);
    setTheme(m);
  };
  const applyFont = (f: string) => {
    const matched = BIBLE_FONTS.find((b) => b.value === f);
    if (matched) {
      (document.documentElement.style as unknown as Record<string, string>)["--font-reading"] = matched.css;
    }
    setFont(f);
  };
  const applyFontSize = (s: string) => {
    const px = FONT_SIZE_MAP[s] ?? "18px";
    (document.documentElement.style as unknown as Record<string, string>)["--text-body-size"] = px;
    setFontSize(s);
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-accent)" }}>
      {children}
    </p>
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveDisplaySettings(fd);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-5 py-6 space-y-8">

      {/* ── Visual Theme ── */}
      <section>
        <SectionLabel>Identity Theme</SectionLabel>
        <p className="text-xs mb-4" style={{ color: "var(--color-text-3)" }}>
          Tap to preview instantly. Changes are saved when you tap Save.
        </p>
        <input type="hidden" name="visual_theme" value={visualTheme} />
        <div className="grid grid-cols-3 gap-3">
          {VISUAL_THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => applyTheme(t.value)}
              className="rounded-xl p-3 border-2 transition-all text-left"
              style={{
                background: t.bg,
                borderColor: visualTheme === t.value ? t.accent : "rgba(255,255,255,0.08)",
              }}
            >
              <div className="w-6 h-6 rounded-full mb-2" style={{ background: t.accent }} />
              <p className="text-xs font-semibold" style={{ color: "#F0EDE6" }}>{t.label}</p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "rgba(240,237,230,0.45)" }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Reading Mode ── */}
      <section>
        <SectionLabel>Reading Mode</SectionLabel>
        <input type="hidden" name="theme" value={theme} />
        <div className="grid grid-cols-3 gap-3">
          {READ_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => applyMode(m.value)}
              className="rounded-xl p-3 border-2 transition-all text-center"
              style={{
                background: m.value === "dark" ? "#111" : m.value === "light" ? "#FAFAF8" : "#F2E8D9",
                borderColor: theme === m.value ? "var(--color-accent)" : "var(--color-border)",
              }}
            >
              <p className="text-sm font-semibold"
                style={{ color: m.value === "dark" ? "#F0EDE6" : "#2C1F10" }}>
                {m.label}
              </p>
              <p className="text-[10px] mt-0.5"
                style={{ color: m.value === "dark" ? "rgba(240,237,230,0.4)" : "rgba(44,31,16,0.5)" }}>
                {m.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Bible Font ── */}
      <section>
        <SectionLabel>Bible Reading Font</SectionLabel>
        <input type="hidden" name="bible_reading_font" value={font} />
        <div className="flex flex-col gap-2">
          {BIBLE_FONTS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => applyFont(f.value)}
              className="rounded-xl px-4 py-3 border-2 flex items-center justify-between transition-all"
              style={{
                background: "var(--color-surface)",
                borderColor: font === f.value ? "var(--color-accent)" : "var(--color-border)",
              }}
            >
              <span className="text-xs font-medium" style={{ color: "var(--color-text-3)" }}>{f.label}</span>
              <span style={{ fontFamily: f.css, fontSize: "16px", color: "var(--color-text-1)" }}>
                In the beginning God created
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Font Size ── */}
      <section>
        <SectionLabel>Verse Text Size</SectionLabel>
        <input type="hidden" name="font_size" value={fontSize} />
        <div className="grid grid-cols-4 gap-3">
          {FONT_SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => applyFontSize(s.value)}
              className="rounded-xl py-4 border-2 flex flex-col items-center justify-center transition-all"
              style={{
                background: "var(--color-surface)",
                borderColor: fontSize === s.value ? "var(--color-accent)" : "var(--color-border)",
              }}
            >
              <span
                className="font-semibold"
                style={{ fontFamily: "var(--font-garamond)", fontSize: s.px, color: "var(--color-text-1)", lineHeight: 1 }}
              >
                Aa
              </span>
              <span className="text-[10px] mt-1" style={{ color: "var(--color-text-3)" }}>{s.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Default Translation ── */}
      <section>
        <SectionLabel>Default Translation</SectionLabel>
        <select
          name="translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm border appearance-none"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-1)",
          }}
        >
          {TRANSLATIONS.map((t) => (
            <option key={t.code} value={t.code}>{t.code} — {t.name}</option>
          ))}
        </select>
      </section>

      {/* ── Reading Layers ── */}
      <section>
        <SectionLabel>Reading Layers</SectionLabel>
        <div className="rounded-xl border divide-y overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
          {([
            { name: "spurgeon_enabled",       label: "Spurgeon Commentary",  desc: "Morning & Evening card in the reading view", val: spurgeon,  set: setSpurgeon },
            { name: "show_cross_refs",         label: "TSK Cross-References", desc: "Treasury of Scripture Knowledge dots & panel", val: crossRefs, set: setCrossRefs },
            { name: "catechism_layer_enabled", label: "Catechism Layer",       desc: "Westminster catechism connections on verses", val: catechism,  set: setCatechism },
            { name: "show_verse_numbers",      label: "Verse Numbers",         desc: "Show verse numbers in the reading view", val: verseNums,   set: setVerseNums },
          ] as Array<{ name: string; label: string; desc: string; val: boolean; set: (v: boolean) => void }>).map((row) => (
            <label
              key={row.name}
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors"
              style={{ background: "var(--color-surface)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-1)" }}>{row.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-3)" }}>{row.desc}</p>
              </div>
              <input
                type="checkbox"
                name={row.name}
                checked={row.val}
                onChange={(e) => row.set(e.target.checked)}
                className="w-5 h-5 rounded"
                style={{ accentColor: "var(--color-accent)" }}
              />
            </label>
          ))}
        </div>
      </section>

      {/* ── Save ── */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-4 text-sm font-semibold transition-opacity active:opacity-75 disabled:opacity-50"
        style={{ background: "var(--color-accent)", color: "#0F0F0F" }}
      >
        {pending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
