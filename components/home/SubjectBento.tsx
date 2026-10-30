// SubjectBento — "Choose a subject to start: EXPLORE subjects" on the homepage
// (redesign phase 3, 30 Oct 2026). A "bento box" grid: the subject with the
// most topics gets a BIG card (two columns wide, two rows tall) with its
// picture filling the card and its topic names appearing on hover; the others
// are smaller cards. Subjects with no topics yet are greyed, "Coming soon".
//
// Which six subjects appear is still set by homepageOrder in each subject's
// overview.mdx (lib/content.ts → getHomepageSubjects). Counts are live
// (lib/site-stats.ts). Server component.

import Link from "next/link";
import Image from "next/image";
import SectionHead from "@/components/SectionHead";
import { getHomepageSubjects } from "@/lib/content";
import { getSiteStats } from "@/lib/site-stats";
import { getAllTopics } from "@/lib/topics";
import { getSubjectInfo } from "@/lib/subjects";
import { SUBJECT_COLORS } from "@/lib/subject-colors";

// 1 → "I", 4 → "IV"… the subject's number, as on the old cards
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII"];

export default async function SubjectBento() {
  const subjects = getHomepageSubjects();
  if (subjects.length === 0) return null;
  const [stats, topics] = await Promise.all([getSiteStats(), getAllTopics()]);
  const count = (slug: string) => stats.topicsBySubject[slug] ?? 0;
  // The big card: the subject with the most topics (History, for now)
  const big = subjects.reduce((best, s) => (count(s.slug) > count(best.slug) ? s : best), subjects[0]);
  const bigTopics = topics.filter((t) => t.slug[0] === big.slug).slice(0, 6);
  // The big card first, then the rest in their usual order
  const ordered = [big, ...subjects.filter((s) => s !== big)];

  return (
    <section aria-labelledby="subjects-title" className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-28">
      <SectionHead id="subjects-title" eyebrow="Choose a subject to start" title="Explore" accent="subjects" more={{ href: "/subjects", label: "All subjects" }} />

      <div data-reveal-group className="gk-bento">
        {ordered.map((s) => {
          const n = count(s.slug);
          const isBig = s === big && n > 0;
          const info = getSubjectInfo(s.slug);
          const number = ROMAN[subjects.indexOf(s)];
          const colours = SUBJECT_COLORS[s.slug];
          const cats = stats.categoriesBySubject[s.slug] ?? 0;
          return (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className={`gk-card gk-card--lift gk-subj ${isBig ? "gk-subj--big" : ""} ${n === 0 ? "gk-subj--wait" : ""}`}
              // the subject's two colours: a dark one for light pages, a light one for dark pages
              style={{ ["--cl" as string]: colours?.accent ?? "#047857", ["--cd" as string]: colours?.bandAccent ?? "#6ee7b7" }}
            >
              <div className="gk-subj__pic">
                {s.meta.image && <Image src={s.meta.image} alt="" fill sizes={isBig ? "(max-width: 767px) 100vw, 820px" : "(max-width: 767px) 100vw, 420px"} className="object-cover" />}
              </div>
              <div className="gk-subj__txt font-body">
                <span className="gk-subj__tag">
                  {number} · <span lang="hi" className="font-hindi">{info?.labelHi}</span>
                </span>
                <h3 className="gk-subj__name">{s.meta.title}</h3>
                <p className="gk-subj__desc">{s.meta.description}</p>
                {/* the big card: its topics, shown on hover */}
                {isBig && bigTopics.length > 0 && (
                  <ul className="gk-subj__inside" aria-label={`Topics in ${s.meta.title}`}>
                    {bigTopics.map((t, i) => (
                      <li key={t.slug.join("/")} style={{ ["--i" as string]: i }}>{t.meta.title}</li>
                    ))}
                  </ul>
                )}
                <div className="gk-subj__meta">
                  <span>
                    {n > 0 ? `${cats} ${cats === 1 ? "category" : "categories"} · ${n} ${n === 1 ? "topic" : "topics"}` : "0 topics"}
                  </span>
                  {n > 0 ? <span className="gk-subj__go">Explore {isBig ? s.meta.title : ""} →</span> : <span className="gk-soon">Coming soon</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
