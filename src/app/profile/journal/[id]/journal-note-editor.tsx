"use client";

import { useState, useTransition } from "react";

interface NoteEditorProps {
  entryId: string;
  initialNote: string | null;
}

export default function JournalNoteEditor({ entryId, initialNote }: NoteEditorProps) {
  const [note, setNote] = useState(initialNote ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/journal/entry/${entryId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        });
        if (res.ok) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } catch {
        // fail silently — user can retry
      }
    });
  }

  return (
    <div className="mt-1">
      <textarea
        className="w-full resize-none rounded-lg border bg-transparent px-3 py-2.5 text-[14px] leading-relaxed outline-none transition-colors focus:border-[var(--color-accent)]"
        style={{
          minHeight: 100,
          borderColor: "var(--color-border)",
          color: "var(--color-text-1)",
        }}
        placeholder="Add a note about this chapter…"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        onBlur={save}
      />
      <div className="mt-1 h-4 text-right text-[11px]" style={{ color: "var(--color-text-3)" }}>
        {isPending && "Saving…"}
        {saved && !isPending && "Saved ✓"}
      </div>
    </div>
  );
}
