/**
 * email-wrapper.tsx — Shared layout wrapper for all Charles email templates.
 */

import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailWrapperProps {
  preview: string;
  children: ReactNode;
}

const styles = {
  body: {
    backgroundColor: "#0D0D0D",
    margin: "0",
    padding: "0",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  brandName: {
    fontSize: "13px",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#C4A040",
    marginBottom: "8px",
    display: "block",
  },
  divider: {
    borderColor: "#2A2A2A",
    marginTop: "32px",
    marginBottom: "24px",
  },
  footerText: {
    fontSize: "12px",
    color: "#555",
    lineHeight: "1.6",
  },
  footerLink: {
    color: "#888",
    textDecoration: "underline",
  },
};

export default function EmailWrapper({
  preview,
  children,
}: EmailWrapperProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://biblestudy.app";
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brandName}>Bible Study</Text>
          {children}
          <Hr style={styles.divider} />
          <Text style={styles.footerText}>
            You received this because you have email notifications enabled.{" "}
            <Link
              href={`${appUrl}/profile/settings`}
              style={styles.footerLink}
            >
              Manage preferences
            </Link>
            {" · "}
            <Link
              href={`${appUrl}/profile/settings?unsubscribe=1`}
              style={styles.footerLink}
            >
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
