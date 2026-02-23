import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Bible Study App.",
};

const EFFECTIVE_DATE = "February 22, 2026";
const CONTACT_EMAIL = "legal@biblestudyapp.com";
const APP_NAME = "Bible Study App";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="max-w-2xl mx-auto px-5 py-12 pb-32">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-8 transition-colors"
        >
          ← Back
        </Link>
        <h1
          className="text-3xl font-bold text-[var(--color-text-primary)] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Terms of Service
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-10">
          Effective date: {EFFECTIVE_DATE}
        </p>

        <div className="space-y-8 text-sm leading-relaxed">

          <Section title="1. Acceptance">
            <p>
              By creating an account or using {APP_NAME} (&ldquo;the App&rdquo;), you agree to these Terms of Service. If you do not agree, do not use the App. These terms apply to all users, including those who access the App on behalf of a minor child.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least <strong>13 years old</strong> to create an account. Users under 18 must have a parent or guardian who creates and oversees the account. By signing up, you confirm that you meet this requirement.
            </p>
            <p>
              Accounts created for users under 13 will be suspended immediately. If you believe an account has been created in violation of this requirement, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-accent)] hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </Section>

          <Section title="3. Your Account">
            <p>
              You are responsible for maintaining the security of your account credentials. Do not share your password. You are responsible for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.
            </p>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, are used for abusive or illegal activity, or remain inactive for more than 24 consecutive months.
            </p>
          </Section>

          <Section title="4. Subscriptions & Billing">
            <p>
              {APP_NAME} offers both free and paid subscription tiers. Paid subscriptions are billed monthly or annually through Stripe. You authorize us to charge your payment method on a recurring basis.
            </p>
            <p>
              <strong>Cancellation:</strong> You may cancel at any time from your account settings. Access continues until the end of the current billing period. No prorated refunds are provided for partial billing periods, except where required by law.
            </p>
            <p>
              <strong>Price changes:</strong> We will notify you at least 30 days before any price increase. Continued use after the notice period constitutes acceptance of the new price.
            </p>
          </Section>

          <Section title="5. Bible Text & Copyright">
            <p>
              Scripture quotations marked <strong>ESV</strong> are from the <em>ESV&reg; Bible</em> (The Holy Bible, English Standard Version&reg;), copyright &copy;&nbsp;2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved. The ESV text may not be quoted in any publication in a manner that compromises or competes with the publishing ministry of Crossway. For permission requests, contact Crossway.
            </p>
            <p>
              The <strong>World English Bible (WEB)</strong> is in the public domain. Modifications to the WEB text are governed by its public domain status.
            </p>
            <p>
              Other translations accessed through API.Bible are subject to their respective copyright holders&rsquo; terms. Attribution notices are displayed within the App per each publisher&rsquo;s requirements.
            </p>
          </Section>

          <Section title="6. Your Content">
            <p>
              You retain ownership of all content you create in the App (journal entries, notes, prayer records, verse threads). By submitting content, you grant us a limited, non-exclusive license to store and display that content to you within the App.
            </p>
            <p>
              You agree not to submit content that is unlawful, abusive, harmful to minors, or that infringes third-party rights. We reserve the right to remove any content that violates these terms.
            </p>
          </Section>

          <Section title="7. AI Features">
            <p>
              The App includes AI-powered features (Charles companion, OIA questions, sermon outlines, word studies). These features are provided as a study aid and do not constitute professional theological, counseling, or pastoral advice.
            </p>
            <p>
              AI responses are generated and may contain errors. Always verify theological content against Scripture and consult your pastor or church leadership for matters of spiritual guidance. We are not responsible for decisions made based on AI-generated content.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              The App, its design, codebase, brand identity, and non-Scripture content (Charles persona, archetype system, UI/UX) are the property of {APP_NAME} and its creators. You may not reproduce, distribute, or create derivative works without express written permission.
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              THE APP IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY ACCURATE. YOUR USE IS AT YOUR SOLE RISK.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {APP_NAME.toUpperCase()} SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP, INCLUDING LOSS OF DATA. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of appropriate jurisdiction. You waive any right to participate in a class-action lawsuit against {APP_NAME}.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We may modify these terms at any time. Material changes will be communicated via email or in-app notice at least 14 days in advance. Continued use after the effective date of changes constitutes acceptance.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              Questions about these terms:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-accent)] hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </Section>

        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex gap-6 text-xs text-[var(--color-text-secondary)]">
          <Link href="/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy Policy</Link>
          <Link href="/credits" className="hover:text-[var(--color-text-primary)] transition-colors">Credits</Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3 border-l-2 pl-3"
          style={{ borderColor: "var(--color-accent)" }}>
        {title}
      </h2>
      <div className="space-y-3 text-[var(--color-text-secondary)]">
        {children}
      </div>
    </section>
  );
}
