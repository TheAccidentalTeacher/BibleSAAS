/**
 * birthday-letter.tsx — A personal letter from Dad delivered on the user's birthday.
 *
 * Content: the saved verse thread message with delivery_date = today.
 */

import { Section, Text, Hr } from "@react-email/components";
import EmailWrapper from "./email-wrapper";

interface BirthdayLetterEmailProps {
  recipientName: string | null;
  letterBody: string;       // The raw letter text (stored in verse_thread_messages)
  fromName?: string;        // e.g. "Dad"
  verseRef?: string;        // e.g. "Psalm 139:14"
}

const s = {
  occasion: { fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: "#C4A040", marginBottom: "16px" },
  heading: { fontSize: "24px", color: "#E8E0D4", lineHeight: "1.4", marginBottom: "20px" },
  letter: {
    fontSize: "16px",
    color: "#D4C9BC",
    lineHeight: "1.85",
    fontFamily: "'Georgia', serif",
    whiteSpace: "pre-wrap" as const,
    marginBottom: "0",
  },
  sig: { fontSize: "15px", color: "#B8AFA4", fontStyle: "italic", marginTop: "24px" },
  verse: { fontSize: "13px", color: "#888", marginTop: "8px" },
  divider: { borderColor: "#2A2A2A", margin: "32px 0 24px" },
  footer: { fontSize: "13px", color: "#666", lineHeight: "1.6" },
};

export default function BirthdayLetterEmail({
  recipientName,
  letterBody,
  fromName = "Dad",
  verseRef,
}: BirthdayLetterEmailProps) {
  const name = recipientName ?? "Friend";
  const preview = `Happy Birthday, ${name} — a letter for you`;

  return (
    <EmailWrapper preview={preview}>
      <Section>
        <Text style={s.occasion}>A letter from {fromName}</Text>
        <Text style={s.heading}>Happy Birthday, {name}.</Text>
        <Text style={s.letter}>{letterBody}</Text>
        <Text style={s.sig}>— {fromName}</Text>
        {verseRef && <Text style={s.verse}>{verseRef}</Text>}
        <Hr style={s.divider} />
        <Text style={s.footer}>
          This letter was written by someone who loves you, and scheduled to arrive today.
          It lives in your Bible Study app alongside the verse it was written on.
        </Text>
      </Section>
    </EmailWrapper>
  );
}
