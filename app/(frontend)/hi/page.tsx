// /hi — THE HINDI START PAGE: "हिन्दी में पढ़ें" (Hindi discoverability, 2 Nov 2026).
//
// Everything that exists in Hindi, in one place, headed in Hindi:
//   - every article with a Hindi version (from the CMS and the .hi.mdx files —
//     lib/topics.ts already knows which ones have Hindi);
//   - current-affairs write-ups that have a Hindi version (when there are any);
//   - the Hindi World360 Atlas.
// New Hindi articles appear here by themselves — nothing to update by hand.
// The header's EN | हिं switch, the welcome strip and the homepage's Hindi
// button all lead here when a page has no Hindi version of its own.
//
// FOLDER NOTE: app/(frontend)/hi/page.tsx answers exactly /hi. Deeper Hindi
// addresses (/hi/history/…, /hi/news/…) still go to the catch-all route
// app/(frontend)/[...slug], and /hi/atlas to its own folder, as before.
//
// Server component; the page is rebuilt every 6 hours (and when /admin saves).

import type { Metadata } from "next";
import Link from "next/link";
import PageTitle from "@/components/PageTitle";
import ContentCard from "@/components/ContentCard";
import { pageMetadata } from "@/lib/og";
import { absoluteUrl } from "@/lib/site";
import { getAllTopics } from "@/lib/topics";
import { getCMSNewsInHindi } from "@/lib/cms";
import { getAtlasEntries } from "@/lib/atlas";
import { getSubjectInfo } from "@/lib/subjects";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { formatNewsDate } from "@/lib/date-utils";

export const revalidate = 21600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "हिन्दी में पढ़ें",
    description: "GKWorld360 हिन्दी में: इतिहास के लेख, समसामयिकी और वर्ल्ड360 एटलस — सब एक जगह।",
    label: "GKWorld360 हिन्दी में",
    path: "/hi",
  }),
  // Tell search engines (and the header's EN | हिं switch) that the English
  // start of the site is the homepage
  alternates: { canonical: absoluteUrl("/hi"), languages: { en: absoluteUrl("/"), hi: absoluteUrl("/hi") } },
};

export default async function HindiStartPage() {
  const [topics, news, atlas] = await Promise.all([getAllTopics(), getCMSNewsInHindi(), getAtlasEntries("hi")]);
  // Only the topics that have a Hindi version, newest first (getAllTopics' order)
  const hindiTopics = topics.filter((t) => t.hindiHref);

  return (
    // lang="hi": screen readers read this page in Hindi; font-hindi: the Devanagari font
    <div lang="hi" className="font-hindi">
      <PageTitle
        colors={null}
        label="GKWorld360 हिन्दी में"
        title="हिन्दी में पढ़ें"
        description="इतिहास के लेख, समसामयिकी और वर्ल्ड360 एटलस — सब हिन्दी में। नए हिन्दी लेख यहाँ अपने-आप जुड़ते जाते हैं।"
      >
        <span className="text-[15px] font-semibold text-muted">
          {hindiTopics.length} लेख{news.length > 0 ? ` · ${news.length} समसामयिकी` : ""}{atlas.length > 0 ? ` · एटलस पर ${atlas.length} स्थान` : ""}
        </span>
      </PageTitle>

      {/* ── ARTICLES ──────────────────────────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 md:pt-12" aria-labelledby="hi-articles">
        <h2 id="hi-articles" className="m-0 mb-6 text-3xl md:text-4xl font-bold leading-tight text-foreground">लेख</h2>
        {hindiTopics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hindiTopics.map((t) => {
              const subject = getSubjectInfo(t.slug[0]);
              const colours = SUBJECT_COLORS[t.slug[0]];
              return (
                <ContentCard
                  key={t.hindiHref}
                  title={t.hindiTitle ?? t.meta.title}
                  href={t.hindiHref!}
                  image={t.meta.image}
                  label={subject?.labelHi ?? subject?.label}
                  hoverBg={colours?.bg}
                  accent={colours?.accent}
                  ctaLabel="पढ़ें →"
                />
              );
            })}
          </div>
        ) : (
          <p className="m-0 text-lg text-muted">हिन्दी लेख जल्द ही आ रहे हैं।</p>
        )}
      </section>

      {/* ── CURRENT AFFAIRS (only when some write-ups have a Hindi version) ─ */}
      {news.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-14 md:pt-16" aria-labelledby="hi-news">
          <h2 id="hi-news" className="m-0 mb-6 text-3xl md:text-4xl font-bold leading-tight text-foreground">समसामयिकी</h2>
          <ul className="gk-card m-0 p-2.5 list-none">
            {news.map((n) => (
              <li key={n.slug}>
                <Link href={`/hi/news/${n.slug}`} className="gk-row group grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center px-3.5 py-3.5 rounded-2xl">
                  <span className="min-w-0">
                    <span className="block text-lg font-bold leading-snug text-foreground group-hover:text-accent transition-colors">{n.title}</span>
                    <span className="block mt-1 font-body text-[13px] font-semibold text-faint">
                      {[n.category, n.eventDate ? formatNewsDate(n.eventDate) : null].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span aria-hidden="true" className="gk-row__arrow font-extrabold text-accent">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── THE HINDI ATLAS ───────────────────────────────────────────────── */}
      {atlas.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-14 md:pt-16 pb-6">
          <Link href="/hi/atlas" className="gk-card gk-card--lift group block overflow-hidden rounded-card bg-navy-dark text-on-dark border-[var(--stage-line)] p-6 md:p-8">
            <span className="block text-mint text-lg font-semibold">मानचित्र पर ज्ञान</span>
            <span className="block mt-1 text-3xl md:text-5xl font-bold leading-tight text-on-dark">वर्ल्ड360 एटलस</span>
            <span className="block mt-3 max-w-[40em] text-base md:text-lg text-on-dark/70">
              {atlas.length} स्थान, समय के क्रम में, असली पृथ्वी पर — {atlas[0].date} से {atlas[atlas.length - 1].date} तक।
            </span>
            <span className="inline-block mt-5 text-lg font-bold text-mint group-hover:underline underline-offset-4">एटलस खोलें →</span>
          </Link>
        </section>
      )}
    </div>
  );
}
