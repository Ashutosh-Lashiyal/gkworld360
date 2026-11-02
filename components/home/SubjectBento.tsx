// SubjectBento — "Choose a subject to start: EXPLORE subjects" on the homepage
// (redesign phase 3, 30 Oct 2026). A "bento box" grid: the subject with the
// most topics gets a BIG card (two columns wide, two rows tall) with its
// picture filling the card and its topic names appearing on hover; the others
// are smaller cards. Subjects with no topics yet are greyed, "Coming soon".
//
// Which six subjects appear is still set by homepageOrder in each subject's
// overview.mdx (lib/content.ts → getHomepageSubjects). Counts are live
// (lib/site-stats.ts). Server component.
//
// HINDI HOMEPAGE (2 Nov 2026, lang="hi"): the same six cards, but counting
// only articles that have a Hindi version, with the Hindi names, the Hindi
// descriptions (lib/subjects.ts) and the Hindi article titles on the big card.
// The cards still open the subject's page, which is in English until phase 3
// (the owner's call). "सभी विषय" leads to /hi/subjects (phase 2).

import Link from "next/link";
import Image from "next/image";
import SectionHead from "@/components/SectionHead";
import { getHomepageSubjects } from "@/lib/content";
import { getSiteStats } from "@/lib/site-stats";
import { getAllTopics } from "@/lib/topics";
import { getSubjectInfo, SUBJECT_DESCRIPTIONS_HI } from "@/lib/subjects";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import type { Lang } from "@/lib/lang";
import { HOME_TEXT, homeHref } from "@/lib/home-text";

// 1 → "I", 4 → "IV"… the subject's number, as on the old cards
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII"];

export default async function SubjectBento({ lang = "en" }: { lang?: Lang }) {
  const t = HOME_TEXT[lang];
  const hi = lang === "hi";
  const subjects = getHomepageSubjects();
  if (subjects.length === 0) return null;
  const [stats, allTopics] = await Promise.all([getSiteStats(), getAllTopics()]);
  // On the Hindi homepage only the articles that exist in Hindi count
  const topics = hi ? allTopics.filter((tp) => tp.hindiHref) : allTopics;
  const count = (slug: string) =>
    hi ? topics.filter((tp) => tp.slug[0] === slug).length : stats.topicsBySubject[slug] ?? 0;
  // Categories: the site's count in English; in Hindi, the categories that
  // have at least one Hindi article (slug = [subject, category, article])
  const categoryCount = (slug: string) =>
    hi
      ? new Set(topics.filter((tp) => tp.slug[0] === slug && tp.slug.length > 2).map((tp) => tp.slug[1])).size
      : stats.categoriesBySubject[slug] ?? 0;
  // The big card: the subject with the most topics (History, for now)
  const big = subjects.reduce((best, s) => (count(s.slug) > count(best.slug) ? s : best), subjects[0]);
  const bigTopics = topics.filter((tp) => tp.slug[0] === big.slug).slice(0, 6);
  // The big card first, then the rest in their usual order
  const ordered = [big, ...subjects.filter((s) => s !== big)];

  return (
    <section aria-labelledby="subjects-title" className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-28">
      <SectionHead
        id="subjects-title"
        eyebrow={t.subjects.eyebrow}
        title={t.subjects.head.title}
        accent={t.subjects.head.accent}
        more={t.subjects.all ? { href: homeHref(lang, "/subjects"), label: t.subjects.all } : undefined}
      />

      <div data-reveal-group className="gk-bento">
        {ordered.map((s) => {
          const n = count(s.slug);
          const isBig = s === big && n > 0;
          const info = getSubjectInfo(s.slug);
          const number = ROMAN[subjects.indexOf(s)];
          const colours = SUBJECT_COLORS[s.slug];
          const cats = categoryCount(s.slug);
          // The name and description in the page's language
          const name = hi ? info?.labelHi ?? s.meta.title : s.meta.title;
          const description = hi ? SUBJECT_DESCRIPTIONS_HI[s.slug] : s.meta.description;
          return (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className={`gk-card gk-card--lift gk-tilt gk-subj ${isBig ? "gk-subj--big" : ""} ${n === 0 ? "gk-subj--wait" : ""}`}
              data-cursor={n > 0 ? t.cursor.explore : t.cursor.soon}
              // the subject's two colours: a dark one for light pages, a light one for dark pages
              style={{ ["--cl" as string]: colours?.accent ?? "#047857", ["--cd" as string]: colours?.bandAccent ?? "#6ee7b7" }}
            >
              <div className="gk-subj__pic">
                {s.meta.image && <Image src={s.meta.image} alt="" fill sizes={isBig ? "(max-width: 767px) 100vw, 820px" : "(max-width: 767px) 100vw, 420px"} className="object-cover" />}
              </div>
              <div className="gk-subj__txt font-body">
                {/* the small tag shows the OTHER language's name: "I · इतिहास" / "I · History" */}
                <span className="gk-subj__tag">
                  {number} · {hi ? <span lang="en">{info?.label}</span> : <span lang="hi" className="font-hindi">{info?.labelHi}</span>}
                </span>
                <h3 className="gk-subj__name">{name}</h3>
                {description && <p className="gk-subj__desc">{description}</p>}
                {/* the big card: its topics, shown on hover */}
                {isBig && bigTopics.length > 0 && (
                  <ul className="gk-subj__inside" aria-label={t.subjects.topicsIn(name)}>
                    {bigTopics.map((tp, i) => (
                      <li key={tp.slug.join("/")} style={{ ["--i" as string]: i }}>{hi ? tp.hindiTitle ?? tp.meta.title : tp.meta.title}</li>
                    ))}
                  </ul>
                )}
                <div className="gk-subj__meta">
                  <span>
                    {n > 0 ? t.subjects.counts(cats, n) : t.subjects.none}
                  </span>
                  {n > 0 ? <span className="gk-subj__go">{t.subjects.explore(isBig ? name : "").trim()}</span> : <span className="gk-soon">{t.subjects.soon}</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
