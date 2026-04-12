import { describe, expect, it } from "vitest";
import {
  BIBLE_BOOKS,
  TOTAL_CHAPTERS,
  allBookCodes,
  chapterCount,
  findBook,
  formatRef,
  getBook,
  nextChapter,
  ntBooks,
  otBooks,
  prevChapter,
} from "@/lib/bible";

/**
 * Tests for Bible reference utilities (USFM 3.0 codes, canonical ordering,
 * chapter navigation, book lookups).
 *
 * These are the primitive building blocks for every reading route.
 */

describe("BIBLE_BOOKS — canonical data integrity", () => {
  it("contains exactly 66 canonical books", () => {
    expect(BIBLE_BOOKS).toHaveLength(66);
  });

  it("has 39 Old Testament and 27 New Testament books", () => {
    const ot = BIBLE_BOOKS.filter((b) => b.testament === "OT");
    const nt = BIBLE_BOOKS.filter((b) => b.testament === "NT");
    expect(ot).toHaveLength(39);
    expect(nt).toHaveLength(27);
  });

  it("uses unique USFM codes", () => {
    const codes = BIBLE_BOOKS.map((b) => b.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("uses unique canonical order values 1..66", () => {
    const orders = BIBLE_BOOKS.map((b) => b.order).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: 66 }, (_, i) => i + 1));
  });

  it("every book has at least 1 chapter", () => {
    for (const b of BIBLE_BOOKS) {
      expect(b.chapters).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("TOTAL_CHAPTERS constant", () => {
  it("equals 1,189 (the classic total)", () => {
    expect(TOTAL_CHAPTERS).toBe(1189);
  });

  it("matches the sum of BIBLE_BOOKS chapters", () => {
    const sum = BIBLE_BOOKS.reduce((acc, b) => acc + b.chapters, 0);
    expect(TOTAL_CHAPTERS).toBe(sum);
  });
});

describe("getBook()", () => {
  it("finds a book by its canonical uppercase code", () => {
    const gen = getBook("GEN");
    expect(gen?.name).toBe("Genesis");
    expect(gen?.chapters).toBe(50);
  });

  it("is case-insensitive on the input code", () => {
    expect(getBook("gen")?.code).toBe("GEN");
    expect(getBook("GeN")?.code).toBe("GEN");
  });

  it("returns undefined for unknown codes", () => {
    expect(getBook("XXX")).toBeUndefined();
    expect(getBook("")).toBeUndefined();
  });
});

describe("findBook()", () => {
  it("matches full book names case-insensitively", () => {
    expect(findBook("Genesis")?.code).toBe("GEN");
    expect(findBook("genesis")?.code).toBe("GEN");
    expect(findBook("REVELATION")?.code).toBe("REV");
  });

  it("matches standard abbreviations", () => {
    expect(findBook("Gen")?.code).toBe("GEN");
    expect(findBook("rev")?.code).toBe("REV");
  });

  it("handles whitespace around the query", () => {
    expect(findBook("  Genesis  ")?.code).toBe("GEN");
  });

  it("returns undefined for unknown names", () => {
    expect(findBook("not-a-real-book")).toBeUndefined();
    expect(findBook("")).toBeUndefined();
  });
});

describe("chapterCount()", () => {
  it("returns the correct chapter count for known books", () => {
    expect(chapterCount("PSA")).toBe(150);
    expect(chapterCount("OBA")).toBe(1);
    expect(chapterCount("GEN")).toBe(50);
    expect(chapterCount("REV")).toBe(22);
  });

  it("returns 0 for unknown codes", () => {
    expect(chapterCount("XXX")).toBe(0);
  });

  it("is case-insensitive", () => {
    expect(chapterCount("psa")).toBe(150);
  });
});

describe("allBookCodes()", () => {
  it("returns all 66 codes in canonical order", () => {
    const codes = allBookCodes();
    expect(codes).toHaveLength(66);
    expect(codes[0]).toBe("GEN");
    expect(codes[38]).toBe("MAL"); // last OT
    expect(codes[39]).toBe("MAT"); // first NT
    expect(codes[65]).toBe("REV"); // last NT
  });
});

describe("otBooks() and ntBooks()", () => {
  it("otBooks returns exactly 39 books, all OT", () => {
    const ot = otBooks();
    expect(ot).toHaveLength(39);
    expect(ot.every((b) => b.testament === "OT")).toBe(true);
  });

  it("ntBooks returns exactly 27 books, all NT", () => {
    const nt = ntBooks();
    expect(nt).toHaveLength(27);
    expect(nt.every((b) => b.testament === "NT")).toBe(true);
  });

  it("otBooks is canonically ordered starting with Genesis", () => {
    expect(otBooks()[0]!.code).toBe("GEN");
    expect(otBooks().at(-1)!.code).toBe("MAL");
  });

  it("ntBooks is canonically ordered starting with Matthew", () => {
    expect(ntBooks()[0]!.code).toBe("MAT");
    expect(ntBooks().at(-1)!.code).toBe("REV");
  });
});

describe("nextChapter() — in-book navigation", () => {
  it("advances to the next chapter within the same book", () => {
    expect(nextChapter("GEN", 1)).toEqual({ book: "GEN", chapter: 2 });
    expect(nextChapter("PSA", 118)).toEqual({ book: "PSA", chapter: 119 });
  });

  it("crosses book boundaries at end-of-book", () => {
    // End of Genesis (50) → Exodus 1
    expect(nextChapter("GEN", 50)).toEqual({ book: "EXO", chapter: 1 });
    // End of Malachi (4) → Matthew 1 (OT → NT handoff)
    expect(nextChapter("MAL", 4)).toEqual({ book: "MAT", chapter: 1 });
  });

  it("returns null at the final chapter of Revelation", () => {
    expect(nextChapter("REV", 22)).toBeNull();
  });

  it("returns null for unknown book codes", () => {
    expect(nextChapter("XXX", 1)).toBeNull();
  });
});

describe("prevChapter() — in-book navigation", () => {
  it("goes to the previous chapter within the same book", () => {
    expect(prevChapter("GEN", 2)).toEqual({ book: "GEN", chapter: 1 });
    expect(prevChapter("PSA", 119)).toEqual({ book: "PSA", chapter: 118 });
  });

  it("crosses book boundaries backwards", () => {
    // Exodus 1 → Genesis 50
    expect(prevChapter("EXO", 1)).toEqual({ book: "GEN", chapter: 50 });
    // Matthew 1 → Malachi 4 (NT → OT handoff)
    expect(prevChapter("MAT", 1)).toEqual({ book: "MAL", chapter: 4 });
  });

  it("returns null at Genesis 1 (start of the canon)", () => {
    expect(prevChapter("GEN", 1)).toBeNull();
  });

  it("returns null for unknown book codes", () => {
    expect(prevChapter("XXX", 1)).toBeNull();
  });
});

describe("formatRef()", () => {
  it("formats book + chapter", () => {
    expect(formatRef("GEN", 1)).toBe("Genesis 1");
    expect(formatRef("REV", 22)).toBe("Revelation 22");
  });

  it("formats book + chapter + verse", () => {
    expect(formatRef("JHN", 3, 16)).toBe("John 3:16");
  });

  it("falls back to raw code for unknown books", () => {
    expect(formatRef("XXX", 1)).toBe("XXX 1");
    expect(formatRef("XXX", 1, 5)).toBe("XXX 1:5");
  });
});

describe("Navigation round-trip — next then prev returns to start", () => {
  it("nextChapter then prevChapter is the identity within a book", () => {
    const start = { book: "JHN", chapter: 3 };
    const next = nextChapter(start.book, start.chapter)!;
    const back = prevChapter(next.book, next.chapter)!;
    expect(back).toEqual(start);
  });

  it("round-trip across a book boundary", () => {
    const start = { book: "GEN", chapter: 50 };
    const next = nextChapter(start.book, start.chapter)!; // EXO 1
    const back = prevChapter(next.book, next.chapter)!;
    expect(back).toEqual(start);
  });
});
