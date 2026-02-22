/**
 * Shared types for all Journey views.
 * Based on the data shape returned by GET /api/journey.
 */

export interface JourneyData {
  byBook: Record<string, number[]>;       // book_code → array of read chapter numbers
  totalChaptersRead: number;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    totalXp: number;
    currentLevel: number;
    totalDays: number;
  };
  counts: {
    memory: number;
    mastered: number;
    journal: number;
    highlight: number;
    bookmark: number;
    trails: number;
  };
}

export type JourneyView = "map" | "phases" | "skill-tree" | "constellation" | "stats";

/** The 7 narrative phases of the Bible with their books. */
export interface BiblePhase {
  id: number;
  title: string;
  subtitle: string;
  color: string;        // CSS color
  accentBg: string;     // light tint
  books: string[];      // book codes in order
}

export const BIBLE_PHASES: BiblePhase[] = [
  {
    id: 1,
    title: "Creation & Covenant",
    subtitle: "The Pentateuch",
    color: "#C4A77D",
    accentBg: "rgba(196,167,125,0.12)",
    books: ["GEN", "EXO", "LEV", "NUM", "DEU"],
  },
  {
    id: 2,
    title: "Land & Kingdom",
    subtitle: "History",
    color: "#60a5fa",
    accentBg: "rgba(96,165,250,0.10)",
    books: ["JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST"],
  },
  {
    id: 3,
    title: "Wisdom & Song",
    subtitle: "Poetry",
    color: "#a78bfa",
    accentBg: "rgba(167,139,250,0.10)",
    books: ["JOB", "PSA", "PRO", "ECC", "SNG"],
  },
  {
    id: 4,
    title: "Voice of the Prophets",
    subtitle: "Major & Minor Prophets",
    color: "#f97316",
    accentBg: "rgba(249,115,22,0.10)",
    books: ["ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL"],
  },
  {
    id: 5,
    title: "The Coming King",
    subtitle: "Gospels",
    color: "#34d399",
    accentBg: "rgba(52,211,153,0.10)",
    books: ["MAT", "MRK", "LUK", "JHN"],
  },
  {
    id: 6,
    title: "The Spreading Flame",
    subtitle: "Acts & Letters",
    color: "#f59e0b",
    accentBg: "rgba(245,158,11,0.10)",
    books: ["ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM"],
  },
  {
    id: 7,
    title: "The New Creation",
    subtitle: "General Epistles & Revelation",
    color: "#ec4899",
    accentBg: "rgba(236,72,153,0.10)",
    books: ["HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"],
  },
];

/** Fixed star positions for the constellation (66 stars, 11×6 grid). */
export const STAR_POSITIONS: Array<{ x: number; y: number; book: string }> = [];
(function buildStarGrid() {
  const BOOKS = [
    "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI",
    "2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG",
    "ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC",
    "NAM","HAB","ZEP","HAG","ZEC","MAL","MAT","MRK","LUK","JHN","ACT",
    "ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI",
    "TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV",
  ];
  BOOKS.forEach((book, i) => {
    const col = i % 11;
    const row = Math.floor(i / 11);
    // Add slight offsets for a staggered feel
    const xJitter = (((i * 7) % 5) - 2) * 1.5;
    const yJitter = (((i * 13) % 5) - 2) * 1.5;
    STAR_POSITIONS.push({
      book,
      x: 32 + col * 86 + xJitter,
      y: 32 + row * 72 + yJitter,
    });
  });
})();
