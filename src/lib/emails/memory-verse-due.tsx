/**
 * memory-verse-due.tsx — Reminder email when memory verses are due for review.
 */

import { Section, Text, Button } from "@react-email/components";
import EmailWrapper from "./email-wrapper";

interface MemoryVerseDueEmailProps {
  recipientName: string | null;
  dueCount: number;
  reviewUrl: string;
}

const s = {
  heading: { fontSize: "22px", color: "#E8E0D4", lineHeight: "1.4", marginBottom: "12px" },
  body: { fontSize: "15px", color: "#B8AFA4", lineHeight: "1.7", marginBottom: "24px" },
  count: { color: "#C4A040", fontWeight: "bold" as const },
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

export default function MemoryVerseDueEmail({
  recipientName,
  dueCount,
  reviewUrl,
}: MemoryVerseDueEmailProps) {
  const name = recipientName ?? "Friend";
  const preview = `You have ${dueCount} memory verse${dueCount !== 1 ? "s" : ""} ready for review`;

  return (
    <EmailWrapper preview={preview}>
      <Section>
        <Text style={s.heading}>
          {name}, your verses are waiting.
        </Text>
        <Text style={s.body}>
          You have{" "}
          <span style={s.count}>
            {dueCount} verse{dueCount !== 1 ? "s" : ""}
          </span>{" "}
          due for review today. Spaced repetition works best when you stay
          consistent — just a few minutes keeps them sharp.
        </Text>
        <Button href={reviewUrl} style={s.btn}>
          Review now
        </Button>
      </Section>
    </EmailWrapper>
  );
}
