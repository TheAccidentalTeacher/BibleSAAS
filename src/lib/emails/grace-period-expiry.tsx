/**
 * grace-period-expiry.tsx — Warning when streak grace period is about to expire.
 */

import { Section, Text, Button } from "@react-email/components";
import EmailWrapper from "./email-wrapper";

interface GracePeriodExpiryEmailProps {
  recipientName: string | null;
  currentStreak: number;
  hoursRemaining: number;   // hours until streak resets (typically 24h grace)
  readUrl: string;
}

const s = {
  heading: { fontSize: "22px", color: "#E8E0D4", lineHeight: "1.4", marginBottom: "12px" },
  body: { fontSize: "15px", color: "#B8AFA4", lineHeight: "1.7", marginBottom: "24px" },
  streak: { color: "#C4A040", fontWeight: "bold" as const },
  hours: { color: "#E05252", fontWeight: "bold" as const },
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

export default function GracePeriodExpiryEmail({
  recipientName,
  currentStreak,
  hoursRemaining,
  readUrl,
}: GracePeriodExpiryEmailProps) {
  const name = recipientName ?? "Friend";
  const preview = `Don't lose your ${currentStreak}-day streak — ${hoursRemaining}h remaining`;

  return (
    <EmailWrapper preview={preview}>
      <Section>
        <Text style={s.heading}>
          {name}, your streak is at risk.
        </Text>
        <Text style={s.body}>
          You have a{" "}
          <span style={s.streak}>{currentStreak}-day streak</span> — but it
          will reset in{" "}
          <span style={s.hours}>{hoursRemaining} hours</span> if you don&apos;t
          read today. One chapter is all it takes.
        </Text>
        <Button href={readUrl} style={s.btn}>
          Keep my streak
        </Button>
      </Section>
    </EmailWrapper>
  );
}
