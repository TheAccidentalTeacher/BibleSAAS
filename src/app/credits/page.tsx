import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Credits & Attribution",
  description: "Scripture attributions, open-source credits, and acknowledgements for Bible Study App.",
};

export default function CreditsPage() {
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
          Credits & Attribution
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-10">
          We are grateful to the scholars, publishers, and open-source developers whose work makes this app possible.
        </p>

        <div className="space-y-10">

          {/* ── Scripture ──────────────────────────────────────────────── */}
          <CreditSection title="Scripture Texts">

            <CreditEntry
              name="English Standard Version (ESV)"
              badge="Required attribution"
            >
              <p>
                Scripture quotations are from the <em>ESV&reg; Bible</em> (The Holy Bible, English Standard Version&reg;), copyright &copy;&nbsp;2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.
              </p>
              <p className="mt-2">
                The ESV text may not be quoted in any publication in a manner that compromises or competes with the publishing ministry of Crossway. Crossway is a not-for-profit publisher and ministry of Good News Publishers.
              </p>
              <p className="mt-2 text-[11px]">
                Full ESV copyright information:{" "}
                <a href="https://www.esv.org/resources/esv-global-study-bible/copyright-page/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">esv.org</a>
              </p>
            </CreditEntry>

            <CreditEntry name="World English Bible (WEB)" badge="Public Domain">
              <p>
                The World English Bible is in the public domain. It is a modern English translation of the Holy Bible based on the American Standard Version of the Holy Bible first published in 1901, the Biblia Hebraica Stutgartensa Old Testament, and the Greek Majority Text New Testament. It is not copyrighted.
              </p>
              <p className="mt-2 text-[11px]">
                <a href="https://worldenglish.bible" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">worldenglish.bible</a>
              </p>
            </CreditEntry>

            <CreditEntry name="Additional Translations via API.Bible" badge="Various licenses">
              <p>
                Other translations available in the App (NIV, NASB, NLT, CSB, and others) are accessed via the API.Bible service and are subject to the respective copyright holders&rsquo; terms. Attribution for each translation is displayed within the reading view when that translation is active.
              </p>
              <p className="mt-2 text-[11px]">
                <a href="https://scripture.api.bible" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">scripture.api.bible</a>
              </p>
            </CreditEntry>
          </CreditSection>

          {/* ── Lexical & Cross-reference Data ───────────────────────── */}
          <CreditSection title="Biblical Reference Data">

            <CreditEntry name="Strong's Concordance" badge="Public Domain">
              <p>
                Strong&rsquo;s Exhaustive Concordance of the Bible was compiled by James Strong and first published in 1890. The lexical data used in this application is derived from public domain sources and digitized by the Open Scriptures project.
              </p>
            </CreditEntry>

            <CreditEntry name="OpenScriptures Hebrew Bible (OSHB)" badge="CC BY 4.0">
              <p>
                The Open Scriptures Hebrew Bible tagset and morphology data, made available by the Open Scriptures project. Licensed under{" "}
                <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Creative Commons Attribution 4.0 International</a>.
              </p>
              <p className="mt-2 text-[11px]">
                <a href="https://github.com/openscriptures/morphhb" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">github.com/openscriptures/morphhb</a>
              </p>
            </CreditEntry>

            <CreditEntry name="MorphGNT" badge="CC BY-SA 3.0">
              <p>
                Greek morphology data for the New Testament, compiled by James Tauber and the MorphGNT project. Licensed under{" "}
                <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">Creative Commons Attribution-ShareAlike 3.0 Unported</a>.
              </p>
              <p className="mt-2 text-[11px]">
                <a href="https://github.com/morphgnt/sblgnt" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">github.com/morphgnt/sblgnt</a>
              </p>
            </CreditEntry>

            <CreditEntry name="Treasury of Scripture Knowledge (TSK)" badge="Public Domain">
              <p>
                The Treasury of Scripture Knowledge, originally compiled by R.A. Torrey and first published in 1896. The TSK contains over 500,000 Scripture cross-references and is in the public domain.
              </p>
            </CreditEntry>
          </CreditSection>

          {/* ── Classic Commentaries ──────────────────────────────────── */}
          <CreditSection title="Classic Commentaries (Public Domain)">
            <p className="text-[var(--color-text-secondary)] text-sm mb-4">
              All commentaries listed below are in the public domain and are used without modification or with minor editorial formatting for readability.
            </p>

            <CreditEntry name="C.H. Spurgeon — Morning & Evening" badge="Public Domain (1865)">
              <p>
                <em>Morning and Evening: Daily Readings</em> by Charles Haddon Spurgeon, originally published 1865. Text sourced from public domain digital editions. Spurgeon (1834–1892) was the pastor of the Metropolitan Tabernacle, London.
              </p>
            </CreditEntry>

            <CreditEntry name="Matthew Henry — Commentary on the Whole Bible" badge="Public Domain (1708–1714)">
              <p>
                Matthew Henry&rsquo;s Commentary on the Whole Bible, originally published 1708–1714. Henry (1662–1714) was a Nonconformist minister and prolific Bible commentator.
              </p>
            </CreditEntry>

            <CreditEntry name="John Calvin — Commentaries" badge="Public Domain (1551–1564)">
              <p>
                Selected commentary excerpts from John Calvin&rsquo;s Biblical Commentaries, originally published 1551–1564 in Latin and translated into English in the 19th century. Calvin (1509–1564) was the Reformer of Geneva.
              </p>
            </CreditEntry>

            <CreditEntry name="Adam Clarke — Commentary on the Bible" badge="Public Domain (1810–1826)">
              <p>
                Adam Clarke&rsquo;s Commentary on the Bible, originally published 1810–1826. Clarke (1760–1832) was a British Methodist theologian and scholar who spent 40 years writing this eight-volume work.
              </p>
            </CreditEntry>
          </CreditSection>

          {/* ── Open Source Software ──────────────────────────────────── */}
          <CreditSection title="Open Source Software">
            <p className="text-[var(--color-text-secondary)] text-sm mb-4">
              This application is built with gratitude on the work of the open-source community.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "Next.js", license: "MIT", url: "https://nextjs.org", desc: "React framework for the app" },
                { name: "React", license: "MIT", url: "https://react.dev", desc: "UI component library" },
                { name: "Tailwind CSS", license: "MIT", url: "https://tailwindcss.com", desc: "Utility-first CSS framework" },
                { name: "Supabase", license: "Apache 2.0", url: "https://supabase.com", desc: "Database and authentication" },
                { name: "D3.js", license: "ISC", url: "https://d3js.org", desc: "Data visualization (study trails)" },
                { name: "Dexie.js", license: "Apache 2.0", url: "https://dexie.org", desc: "IndexedDB wrapper for offline caching" },
                { name: "Phosphor Icons", license: "MIT", url: "https://phosphoricons.com", desc: "Navigation iconography" },
                { name: "Lucide Icons", license: "ISC", url: "https://lucide.dev", desc: "UI iconography" },
                { name: "EB Garamond", license: "SIL OFL 1.1", url: "https://fonts.google.com/specimen/EB+Garamond", desc: "Bible reading typeface" },
                { name: "Inter", license: "SIL OFL 1.1", url: "https://rsms.me/inter/", desc: "UI typeface" },
                { name: "Barlow Condensed", license: "SIL OFL 1.1", url: "https://fonts.google.com/specimen/Barlow+Condensed", desc: "Display typeface" },
                { name: "Anthropic Claude SDK", license: "MIT", url: "https://github.com/anthropics/anthropic-sdk-node", desc: "AI features" },
                { name: "Stripe SDK", license: "MIT", url: "https://stripe.com/docs/libraries", desc: "Payment processing" },
                { name: "Resend", license: "MIT", url: "https://resend.com", desc: "Email delivery" },
                { name: "Zod", license: "MIT", url: "https://zod.dev", desc: "Schema validation" },
              ].map((pkg) => (
                <div key={pkg.name} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={pkg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-medium text-[var(--color-accent)] hover:underline"
                    >
                      {pkg.name}
                    </a>
                    <span className="text-[10px] bg-white/10 text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {pkg.license}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{pkg.desc}</p>
                </div>
              ))}
            </div>
          </CreditSection>

          {/* ── Theology & Catechism ──────────────────────────────────── */}
          <CreditSection title="Catechisms & Confessions (Public Domain)">
            <CreditEntry name="Westminster Shorter Catechism" badge="Public Domain (1647)">
              <p>Adopted by the Westminster Assembly, 1647. Standard public domain text.</p>
            </CreditEntry>
            <CreditEntry name="Westminster Larger Catechism" badge="Public Domain (1647)">
              <p>Adopted by the Westminster Assembly, 1647. Standard public domain text.</p>
            </CreditEntry>
            <CreditEntry name="Heidelberg Catechism" badge="Public Domain (1563)">
              <p>Originally published 1563 under the supervision of Zacharias Ursinus and Caspar Olevianus. English translation in the public domain.</p>
            </CreditEntry>
            <CreditEntry name="Second London Baptist Confession of Faith (1689)" badge="Public Domain (1689)">
              <p>Also known as the 1689 Baptist Confession. Adopted by English Particular Baptist churches in 1689. Standard public domain text.</p>
            </CreditEntry>
          </CreditSection>

        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex gap-6 text-xs text-[var(--color-text-secondary)]">
          <Link href="/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[var(--color-text-primary)] transition-colors">Terms of Service</Link>
        </div>
      </div>
    </main>
  );
}

function CreditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4 pb-2 border-b border-white/[0.06]"
          style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function CreditEntry({ name, badge, children }: { name: string; badge: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{name}</h3>
        <span className="text-[10px] bg-yellow-500/10 text-yellow-400/80 border border-yellow-500/20 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      </div>
      <div className="text-xs text-[var(--color-text-secondary)] space-y-1 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
