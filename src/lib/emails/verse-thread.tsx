/**
 * verse-thread.tsx — Email sent when someone adds a note to a shared verse thread.
 *
 * Subject: [Name] left you a note on [Book] [Chapter]:[Verse]
 */

import { Section, Text, Button } from "@react-email/components";
import EmailWrapper from "./email-wrapper";

interface VerseThreadEmailProps {
  recipientName: string | null;
  senderName: string;
  book: string;
  chapter: number;
  verse: number;
  verseRef: string;       // e.g. "John 3:16"
  snippet: string;        // first ~120 chars of the message
  threadUrl: string;
}

const s = {
  greeting: { fontSize: "18px", color: "#E8E0D4", lineHeight: "1.5", marginBottom: "16px" },
  body: { fontSize: "15px", color: "#B8AFA4", lineHeight: "1.7", marginBottom: "24px" },
  quoteBox: {
    borderLeft: "3px solid #C4A040",
    paddingLeft: "16px",
    margin: "0 0 24px 0",
  },
  quote: { fontSize: "14px", color: "#999", fontStyle: "italic", lineHeight: "1.6" },
  ref: { fontSize: "12px", color: "#C4A040", marginTop: "4px" },
  btn: {
    backgroundColor: "#C4A040",
    color: "#0D0D0D",
    borderRadius: "6px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
};

export default function VerseThreadEmail({
  recipientName,
  senderName,
  verseRef,
  snippet,
  threadUrl,
}: VerseThreadEmailProps) {
  const name = recipientName ?? "Friend";
  const preview = `${senderName} left you a note on ${verseRef}`;

  return (
    <EmailWrapper preview={preview}>
      <Section>
        <Text style={s.greeting}>
          {name}, {senderName} left you a note.
        </Text>
        <Text style={s.body}>
          Someone you love is thinking about the same passage you are.
        </Text>
        <div style={s.quoteBox}>
          <Text style={s.quote}>"{snippet}{snippet.length >= 120 ? "…" : ""}"</Text>
          <Text style={s.ref}>— on {verseRef}</Text>
        </div>
        <Button href={threadUrl} style={s.btn}>
          Read their note
        </Button>
      </Section>
    </EmailWrapper>
  );
}
