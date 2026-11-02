// AboutPage — the About page, in English (/about) or Hindi (/hi/about).
//
// FOLDER NOTE (2 Nov 2026, the whole site in Hindi, phase 2): components/pages/
// holds the BODY of the site's own pages. Each page used to live entirely in
// app/(frontend)/<page>/page.tsx; now that file (and its Hindi twin under
// app/(frontend)/hi/<page>/) only says which language to show, and the body is
// here — written once, words from lib/page-text.ts. Same idea as the homepage
// (components/home/HomePage.tsx).
//
// The page: the big title, the live numbers on the dark stage, the mission,
// the feature cards and a closing call (redesign phase 4, 30 Oct 2026).
// Server component.

import Button from "@/components/Button";
import PageTitle from "@/components/PageTitle";
import SectionHead from "@/components/SectionHead";
import { getSiteStats } from "@/lib/site-stats";
import { PAGE_TEXT } from "@/lib/page-text";
import { localHref } from "@/lib/site-text";
import type { Lang } from "@/lib/lang";

export default async function AboutPage({ lang }: { lang: Lang }) {
  const t = PAGE_TEXT[lang].about;
  const hi = lang === "hi";

  // Key platform facts — LIVE from lib/site-stats.ts (16 Sep 2026). These used
  // to be typed in by hand ("18+", "100+") and drifted from the truth.
  const s = await getSiteStats();
  const stats = [
    { value: s.subjects, label: t.stats.subjects(s.subjects) },
    { value: s.topics, label: t.stats.topics(s.topics) },
    { value: s.hindi, label: t.stats.hindi },
    { value: s.writeups, label: t.stats.writeups },
  ];

  const body = (
    <>
      <PageTitle colors={null} label={t.label} title={t.title} accent={t.accent} description={t.description} />

      {/* ── STATS on the dark stage ───────────────────────────────────────────*/}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 rounded-card md:rounded-[28px] bg-navy-dark text-on-dark border-2 border-[var(--stage-line)] px-6 py-8 md:px-10 md:py-10">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="m-0 font-display text-5xl md:text-6xl leading-none text-on-dark tabular-nums">{stat.value}</p>
              <p className="m-0 mt-2 font-body text-sm font-bold text-on-dark/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ───────────────────────────────────────────────────────────*/}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-24">
        <SectionHead eyebrow={t.mission.eyebrow} title={t.mission.head.title} accent={t.mission.head.accent} />
        <div className="max-w-[720px] font-heading text-lg md:text-xl leading-relaxed text-foreground">
          {t.mission.paragraphs.map((p, i) => (
            <p key={i} className={`m-0 ${i < t.mission.paragraphs.length - 1 ? "mb-4" : ""}`}>{p}</p>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────*/}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-24">
        <SectionHead eyebrow={t.features.eyebrow} title={t.features.head.title} accent={t.features.head.accent} />
        <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.items.map((feature) => (
            <div key={feature.title} className="gk-card p-6 font-body">
              <span className="text-3xl" aria-hidden="true">{feature.icon}</span>
              <h3 className="m-0 mt-3 mb-2 font-heading text-[22px] font-semibold text-foreground">{feature.title}</h3>
              <p className="m-0 text-[15px] text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────*/}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-6">
        <SectionHead eyebrow={t.cta.eyebrow} title={t.cta.head.title} accent={t.cta.head.accent} lede={t.cta.lede} />
        <div className="flex flex-wrap gap-4">
          <Button href={localHref(lang, "/subjects")}>{t.cta.browse}</Button>
          <Button href={localHref(lang, "/contact")} variant="ghost">{t.cta.contact}</Button>
        </div>
      </section>
    </>
  );

  // Hindi: lang="hi" for screen readers, and the Hindi type rules (globals.css, .gk-hi-page)
  return hi ? <div lang="hi" className="gk-hi-page">{body}</div> : body;
}
