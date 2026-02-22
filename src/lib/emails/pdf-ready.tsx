/**
 * pdf-ready.tsx — Notification when a Bible export PDF is ready for download.
 */

import { Section, Text, Button } from "@react-email/components";
import EmailWrapper from "./email-wrapper";

interface PdfReadyEmailProps {
  recipientName: string | null;
  fileName: string;
  downloadUrl: string;
  expiresHours?: number;
}

const s = {
  heading: { fontSize: "22px", color: "#E8E0D4", lineHeight: "1.4", marginBottom: "12px" },
  body: { fontSize: "15px", color: "#B8AFA4", lineHeight: "1.7", marginBottom: "8px" },
  note: { fontSize: "13px", color: "#666", marginBottom: "24px" },
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

export default function PdfReadyEmail({
  recipientName,
  fileName,
  downloadUrl,
  expiresHours = 48,
}: PdfReadyEmailProps) {
  const name = recipientName ?? "Friend";
  const preview = `Your Bible export "${fileName}" is ready to download`;

  return (
    <EmailWrapper preview={preview}>
      <Section>
        <Text style={s.heading}>{name}, your export is ready.</Text>
        <Text style={s.body}>
          <strong style={{ color: "#E8E0D4" }}>{fileName}</strong> has finished
          generating and is ready to download.
        </Text>
        <Text style={s.note}>
          This link expires in {expiresHours} hours.
        </Text>
        <Button href={downloadUrl} style={s.btn}>
          Download PDF
        </Button>
      </Section>
    </EmailWrapper>
  );
}
