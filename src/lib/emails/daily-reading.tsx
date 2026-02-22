/**
 * daily-reading.tsx — Daily reading digest email with passage + questions.
 */

import { Section, Text, Button } from "@react-email/components";
import EmailWrapper from "./email-wrapper";

interface DailyReadingEmailProps {
  recipientName: string | null;
  book: string;
  chapter: number;
  bookName: string;
  questions: string[];
  readUrl: string;
}

const s = {
  greeting: { fontSize: "16px", color: "#999", marginBottom: "4px" },
  heading: { fontSize: "26px", color: "#E8E0D4", lineHeight: "1.3", marginBottom: "20px", marginTop: "0" },
  body: { fontSize: "15px", color: "#B8AFA4", lineHeight: "1.7", marginBottom: "24px" },
  qLabel: { fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#C4A040", marginBottom: "10px" },
  question: {
    fontSize: "14px",
    color: "#D4C9BC",
    lineHeight: "1.6",
    paddingLeft: "12px",
    borderLeft: "2px solid #2A2A2A",
    marginBottom: "10px",
  },
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

export default function DailyReadingEmail({
  recipientName,
  bookName,
  chapter,
  questions,
  readUrl,
}: DailyReadingEmailProps) {
  const name = recipientName ?? "Friend";
  const preview = `Today's reading: ${bookName} ${chapter}`;

  return (
    <EmailWrapper preview={preview}>
      <Section>
        <Text style={s.greeting}>Good morning, {name}.</Text>
        <Text style={s.heading}>
          {bookName} {chapter}
        </Text>
        <Text style={s.body}>
          Here are a few questions to carry into today's reading.
        </Text>
        {questions.length > 0 && (
          <>
            <Text style={s.qLabel}>As you read</Text>
            {questions.map((q, i) => (
              <Text key={i} style={s.question}>
                {q}
              </Text>
            ))}
          </>
        )}
        <Button href={readUrl} style={{ ...s.btn, marginTop: "20px" }}>
          Open in Bible Study
        </Button>
      </Section>
    </EmailWrapper>
  );
}
