// SubjectsPage — "All Subjects", in English (/subjects) or Hindi (/hi/subjects).
// (components/pages/ — see the folder note in AboutPage.tsx.)
//
// Every subject as a card (same 3-column layout as the homepage). On the Hindi
// page: the Hindi names and descriptions (lib/subjects.ts), Hindi counts, and
// "देखें →". The cards still open the English subject page until the subject
// pages get their Hindi twin (phase 3). Server component.

import SubjectCard from "@/components/SubjectCard";
import PageTitle from "@/components/PageTitle";
import { getAllSubjects } from "@/lib/content";
import { getSubjectInfo, SUBJECT_DESCRIPTIONS_HI } from "@/lib/subjects";
import { PAGE_TEXT } from "@/lib/page-text";
import { localHref } from "@/lib/site-text";
import type { Lang } from "@/lib/lang";

export default function SubjectsPage({ lang }: { lang: Lang }) {
  const t = PAGE_TEXT[lang].subjects;
  const hi = lang === "hi";
  const subjects = getAllSubjects();

  const body = (
    <>
      {/* REDESIGN PHASE 4 (30 Oct 2026): the big title (components/PageTitle.tsx) */}
      <PageTitle
        colors={null}
        breadcrumbs={[{ label: t.title, href: localHref(lang, "/subjects") }]}
        label={t.label}
        title={t.title}
        description={t.description(subjects.length)}
      />

      {/* Subject card grid — same 3-column layout as homepage */}
      <div data-reveal-group className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 md:pt-12 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.slug}
            // Hindi: the Hindi name and description (when there is one)
            title={hi ? getSubjectInfo(subject.slug)?.labelHi ?? subject.meta.title : subject.meta.title}
            description={hi ? SUBJECT_DESCRIPTIONS_HI[subject.slug] ?? "" : subject.meta.description}
            slug={subject.slug}
            icon={subject.meta.icon}
            image={subject.meta.image}
            lang={lang}
          />
        ))}
      </div>

      {/* Empty state — shown if no subjects exist yet */}
      {subjects.length === 0 && (
        <div className="text-center py-20">
          <p className="font-body text-lg text-muted">{t.empty}</p>
        </div>
      )}
    </>
  );

  return hi ? <div lang="hi" className="gk-hi-page">{body}</div> : body;
}
