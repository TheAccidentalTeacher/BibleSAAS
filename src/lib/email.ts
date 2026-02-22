/**
 * src/lib/email.ts — Resend email wrapper
 *
 * Provides a single `sendEmail` helper used by all cron jobs / API routes.
 * Templates are React Email components in src/lib/emails/.
 */

import { Resend } from "resend";
import type { ReactElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "Charles <charles@biblestudy.app>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export async function sendEmail(opts: SendEmailOptions) {
  const { to, subject, react, replyTo, tags } = opts;

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(tags ? { tags } : {}),
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}

/** Safely try to send — swallows errors so callers don't need try/catch */
export async function trySendEmail(
  opts: SendEmailOptions
): Promise<boolean> {
  try {
    await sendEmail(opts);
    return true;
  } catch (err) {
    console.error("[email] trySendEmail swallowed error:", err);
    return false;
  }
}
