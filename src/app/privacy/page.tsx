import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Bible Study App collects, uses, and protects your information.",
};

const EFFECTIVE_DATE = "February 22, 2026";
const CONTACT_EMAIL = "privacy@biblestudyapp.com";
const APP_NAME = "Bible Study App";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="max-w-2xl mx-auto px-5 py-12 pb-32">
        {/* Header */}
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
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-10">
          Effective date: {EFFECTIVE_DATE}
        </p>

        <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-[var(--color-text-primary)]">

          <Section title="1. Who We Are">
            <p>
              {APP_NAME} (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;) is a personal Bible reading and study application. We are committed to protecting the privacy of all users, especially children. This policy explains what data we collect, how we use it, and how you can control it.
            </p>
            <p>
              Contact: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-accent)] hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </Section>

          <Section title="2. Children's Privacy (COPPA)">
            <p>
              {APP_NAME} is designed for users age <strong>13 and older</strong>. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has submitted personal information to us, please contact us immediately at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-accent)] hover:underline">{CONTACT_EMAIL}</a>{" "}
              and we will delete that information promptly.
            </p>
            <p>
              Family accounts (&ldquo;gifting&rdquo; flows) intended for users under 18 require a parent or guardian to create and manage the account. Parents retain the right to review, edit, or delete their child&rsquo;s information at any time.
            </p>
          </Section>

          <Section title="3. Information We Collect">
            <p className="font-medium text-[var(--color-text-primary)]">Information you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Email address (required for account creation)</li>
              <li>Display name and optional profile details (archetype, timezone)</li>
              <li>Journal entries, prayer notes, and study annotations</li>
              <li>Memory verses and flashcard review records</li>
              <li>Reading progress and chapter completion records</li>
              <li>Messages sent to Charles (AI companion), stored for personalization</li>
            </ul>
            <p className="font-medium text-[var(--color-text-primary)] mt-4">Information collected automatically:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Reading session activity (chapters read, streak data, XP)</li>
              <li>Device type and browser (for PWA and offline optimization)</li>
              <li>IP address (rate limiting and fraud prevention only — not retained for profiling)</li>
            </ul>
            <p className="font-medium text-[var(--color-text-primary)] mt-4">Information we do NOT collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Payment card details (handled entirely by Stripe — we never see your card number)</li>
              <li>Location data beyond what you optionally enter</li>
              <li>Biometric or health data</li>
              <li>Contacts or address book</li>
            </ul>
          </Section>

          <Section title="4. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1">
              <li>Deliver and personalize the Bible reading experience</li>
              <li>Power AI-assisted study (Charles responses, Living Portrait, trail generation)</li>
              <li>Maintain reading streaks, XP, and achievement records</li>
              <li>Send transactional emails (account verification, password reset, memory verse reminders — when enabled)</li>
              <li>Process subscription payments via Stripe</li>
              <li>Detect and prevent abuse or unauthorized access</li>
              <li>Improve the product (aggregated, non-identifiable analytics)</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell your personal information. We do not use your data for third-party advertising.
            </p>
          </Section>

          <Section title="5. Data Storage & Security">
            <p>
              All user data is stored in Supabase (PostgreSQL) with row-level security (RLS) enforced — each user can only access their own records. Data is encrypted in transit (TLS) and at rest (AES-256). Our infrastructure is hosted in the United States.
            </p>
            <p>
              AI interactions are processed via Anthropic&rsquo;s Claude API. Conversation context is stored in our database; Anthropic&rsquo;s data retention policies apply to API processing. We do not opt into Anthropic&rsquo;s model training on customer data.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your account data for as long as your account is active. If you delete your account, all personal data&mdash;including journal entries, notes, and AI conversation history&mdash;is deleted within 30 days. Aggregate analytics data (not linked to you personally) may be retained indefinitely.
            </p>
          </Section>

          <Section title="7. Your Rights (CCPA / GDPR)">
            <p>Depending on your jurisdiction, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Correct</strong> — update incorrect or incomplete information via your profile settings</li>
              <li><strong>Delete</strong> — request deletion of your account and all associated data</li>
              <li><strong>Portability</strong> — request your data in a machine-readable format</li>
              <li><strong>Opt out</strong> — unsubscribe from any non-essential emails at any time</li>
              <li><strong>Non-discrimination</strong> — we will not discriminate against you for exercising your privacy rights</li>
            </ul>
            <p className="mt-3">
              To exercise any right, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-accent)] hover:underline">{CONTACT_EMAIL}</a>.
              We will respond within 30 days. California residents may also submit requests to our registered agent.
            </p>
          </Section>

          <Section title="8. Cookies & Local Storage">
            <p>
              We use browser local storage and IndexedDB (via Dexie.js) to cache Bible text for offline reading. We use Supabase auth cookies solely for session management. We do not set advertising or tracking cookies.
            </p>
          </Section>

          <Section title="9. Third-Party Services">
            <p>We use the following third-party services, each governed by their own privacy policies:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Supabase</strong> — database and authentication hosting</li>
              <li><strong>Vercel</strong> — application hosting and edge network</li>
              <li><strong>Anthropic</strong> — AI model API (Claude) for study features</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Crossway ESV API</strong> — Scripture text (ESV translation)</li>
            </ul>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this policy periodically. When we make material changes, we will update the effective date above and, for significant changes, notify users by email or in-app notice. Continued use of the app after the effective date constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For any privacy questions or requests: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-accent)] hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </Section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex gap-6 text-xs text-[var(--color-text-secondary)]">
          <Link href="/terms" className="hover:text-[var(--color-text-primary)] transition-colors">Terms of Service</Link>
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
