// TopicsPage — "All Topics", in English (/topics) or Hindi (/hi/topics).
// (components/pages/ — see the folder note in AboutPage.tsx.)
//
// Every topic as a card, with the Popular / Recently Added switch.
// THE HINDI PAGE lists only the articles that have a Hindi version, with
// their Hindi titles and summaries, each card opening the Hindi article.
// "Popular" is still "most recent" until real view counts exist (lib/topics.ts).
// Server component.

import Link from "next/link";
import { getPopularTopics, getRecentlyAddedTopics, getHindiTopics } from "@/lib/topics";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { getSubjectInfo } from "@/lib/subjects";
import ContentCard from "@/components/ContentCard";
import PageTitle from "@/components/PageTitle";
import SortToggle from "@/components/SortToggle";
import { PAGE_TEXT } from "@/lib/page-text";
import { localHref } from "@/lib/site-text";
import type { Lang } from "@/lib/lang";

export default async function TopicsPage({ lang, sort }: { lang: Lang; sort?: string }) {
  const t = PAGE_TEXT[lang].topics;
  const hi = lang === "hi";

  // Which sort is active. Default to "recent" if nothing is in the URL.
  // "popular" is the sort activated by the Popular Topics "View all" button.
  const activeSort: "popular" | "recent" = sort === "popular" ? "popular" : "recent";

  // Every topic from BOTH sources (MDX + CMS), via lib/topics.ts. Until real
  // view counts exist, "popular" and "recent" are the same newest-first list.
  // Hindi: only the topics with a Hindi version (also newest first).
  const topics = hi
    ? await getHindiTopics()
    : activeSort === "popular"
      ? await getPopularTopics(999)
      : await getRecentlyAddedTopics(999);

  // Shape each topic for its card, in the page's language
  const cards = topics.map((item) => {
    const subject = getSubjectInfo(item.slug[0]);
    const colors = SUBJECT_COLORS[item.slug[0]];
    return {
      title: hi ? item.hindiTitle ?? item.meta.title : item.meta.title,
      description: hi ? item.hindiDescription ?? "" : item.meta.description,
      href: hi && item.hindiHref ? item.hindiHref : "/" + item.slug.join("/"),
      subjectLabel: (hi ? subject?.labelHi : subject?.label) ?? item.slug[0],
      hoverBg: colors?.bg,
      accent: colors?.accent,
      image: item.meta.image,
      // English page: the "English | हिन्दी" pair of buttons. Hindi page: one "पढ़ें →".
      hindiHref: hi ? undefined : item.hindiHref,
      hindiTitle: hi ? undefined : item.hindiTitle,
    };
  });

  const body = (
    <>
      {/* REDESIGN PHASE 4 (30 Oct 2026): the big title (components/PageTitle.tsx),
          with the sort switch in the row underneath */}
      <PageTitle
        colors={null}
        breadcrumbs={[{ label: t.title, href: localHref(lang, "/topics") }]}
        label={t.label}
        title={t.title}
        description={t.description(cards.length)}
      >
        {/* SortToggle is a client component — it changes the URL when clicked,
            which causes this page to re-render with the new sort. */}
        <SortToggle activeSort={activeSort} />
      </PageTitle>

      <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 md:pt-12 pb-6">
        {/* ── TOPIC GRID ───────────────────────────────────────────────────── */}
        {cards.length > 0 ? (
          <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((topic) => (
              <ContentCard
                key={topic.href}
                title={topic.title}
                description={topic.description}
                href={topic.href}
                hoverBg={topic.hoverBg}
                accent={topic.accent}
                image={topic.image}
                label={topic.subjectLabel}
                hindiHref={topic.hindiHref}
                hindiTitle={topic.hindiTitle}
                ctaLabel={PAGE_TEXT[lang].card.read}
                lang={lang}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-body text-lg text-muted">{t.empty}</p>
            <Link
              href={localHref(lang, "/subjects")}
              className="font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark mt-4 inline-block"
            >
              {t.emptyLink}
            </Link>
          </div>
        )}
      </div>
    </>
  );

  return hi ? <div lang="hi" className="gk-hi-page">{body}</div> : body;
}
