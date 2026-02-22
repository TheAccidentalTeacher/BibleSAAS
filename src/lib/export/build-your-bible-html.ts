/**
 * build-your-bible-html.ts
 *
 * Generates a self-contained, print-optimised HTML document of the user's
 * personal Bible study record. No external dependencies — pure string
 * templating. Upload the output to Supabase Storage and send the signed URL
 * to the user; they can print-to-PDF from any modern browser.
 */

export interface YourBibleData {
  userName: string;
  companionName: string;
  generatedAt: string;            // ISO date string
  chapters: StudiedChapter[];
}

export interface StudiedChapter {
  book: string;
  bookName: string;
  chapter: number;
  completedAt: string;            // ISO date string
  highlights: HighlightRow[];
  journalNote: string | null;
}

export interface HighlightRow {
  verse: number;
  text: string;                   // verse text (may be empty if not fetched)
  color: string;                  // hex — e.g. "#C4A040"
}

/** Returns a complete standalone HTML string. */
export function buildYourBibleHtml(data: YourBibleData): string {
  const generated = new Date(data.generatedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const chapterSections = data.chapters.map((ch) => {
    const highlightItems =
      ch.highlights.length > 0
        ? ch.highlights
            .map(
              (h) =>
                `<div class="highlight" style="border-left-color:${h.color}">
                   <span class="verse-num">${h.verse}</span>
                   <span class="verse-text">${escHtml(h.text || `${ch.bookName} ${ch.chapter}:${h.verse}`)}</span>
                 </div>`
            )
            .join("\n")
        : `<p class="empty">No highlights recorded.</p>`;

    const journal = ch.journalNote
      ? `<div class="journal-block"><p class="journal-label">Study Notes</p><p class="journal-text">${escHtml(ch.journalNote)}</p></div>`
      : "";

    const dateStr = new Date(ch.completedAt).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

    return `
<section class="chapter-section">
  <div class="chapter-header">
    <h2 class="chapter-title">${escHtml(ch.bookName)} ${ch.chapter}</h2>
    <span class="chapter-date">${dateStr}</span>
  </div>
  <div class="highlights-block">
    <p class="block-label">Highlights</p>
    ${highlightItems}
  </div>
  ${journal}
</section>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your Bible — ${escHtml(data.userName)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Barlow+Condensed:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #1A1410;
    --gold: #8B6914;
    --muted: #5A4E44;
    --light: #F5F0E8;
    --border: #D4C8B4;
    --hl-bg: #FAF6EF;
  }

  html { font-size: 11pt; }

  body {
    font-family: 'EB Garamond', Georgia, serif;
    color: var(--ink);
    background: #fff;
    max-width: 680px;
    margin: 0 auto;
    padding: 2cm 2cm 3cm;
    line-height: 1.65;
  }

  /* ── Cover page ── */
  .cover {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 4rem 0 2rem;
    border-bottom: 2px solid var(--gold);
    margin-bottom: 4rem;
    page-break-after: always;
  }
  .cover-eyebrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 9pt;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 1.5rem;
  }
  .cover-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 52pt;
    font-weight: 700;
    line-height: 1.0;
    color: var(--ink);
    margin-bottom: 1rem;
  }
  .cover-subtitle {
    font-size: 13pt;
    color: var(--muted);
    margin-bottom: 2.5rem;
    font-style: italic;
  }
  .cover-meta {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 10pt;
    color: var(--muted);
    letter-spacing: 0.05em;
  }
  .cover-meta span { display: block; margin-top: 0.4rem; }

  /* ── Chapter section ── */
  .chapter-section {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    page-break-inside: avoid;
  }
  .chapter-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  .chapter-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20pt;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--ink);
  }
  .chapter-date {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 9pt;
    color: var(--muted);
    letter-spacing: 0.1em;
  }

  /* ── Highlights ── */
  .block-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 8pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.6rem;
  }
  .highlights-block { margin-bottom: 1.2rem; }
  .highlight {
    display: flex;
    gap: 0.8rem;
    align-items: baseline;
    border-left: 3px solid var(--gold);
    padding: 0.35rem 0.75rem;
    background: var(--hl-bg);
    margin-bottom: 0.4rem;
    border-radius: 0 3px 3px 0;
    page-break-inside: avoid;
  }
  .verse-num {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 8pt;
    font-weight: 600;
    color: var(--muted);
    min-width: 1.4rem;
    text-align: right;
  }
  .verse-text { font-size: 10.5pt; }
  .empty { color: var(--muted); font-style: italic; font-size: 9pt; }

  /* ── Journal ── */
  .journal-block {
    background: #FDFAF4;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.9rem 1.1rem;
    page-break-inside: avoid;
  }
  .journal-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 8pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.5rem;
  }
  .journal-text { font-size: 10.5pt; white-space: pre-wrap; }

  /* ── Print tweaks ── */
  @media print {
    body { padding: 0; max-width: 100%; }
    .cover { page-break-after: always; }
    .chapter-section { page-break-inside: avoid; }
    a { text-decoration: none; color: inherit; }
  }

  /* ── Print button (screen only) ── */
  .print-bar {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 100;
  }
  .print-btn {
    background: var(--gold);
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.6rem 1.2rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11pt;
    letter-spacing: 0.06em;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  @media print { .print-bar { display: none; } }
</style>
</head>
<body>

<!-- Print button -->
<div class="print-bar">
  <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
</div>

<!-- Cover page -->
<div class="cover">
  <p class="cover-eyebrow">A Personal Study Record</p>
  <h1 class="cover-title">Your<br>Bible</h1>
  <p class="cover-subtitle">Studied alongside ${escHtml(data.companionName)}</p>
  <div class="cover-meta">
    <span>${escHtml(data.userName)}</span>
    <span>Generated ${generated}</span>
    <span>${data.chapters.length} chapter${data.chapters.length !== 1 ? "s" : ""} recorded</span>
  </div>
</div>

<!-- Chapter sections -->
${chapterSections}

</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
