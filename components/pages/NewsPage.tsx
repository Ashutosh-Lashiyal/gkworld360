// NewsPage — "Current Affairs", in English (/news) or Hindi (/hi/news).
// (components/pages/ — see the folder note in AboutPage.tsx.)
//
// Shows all current-affairs write-ups, grouped by month (newest month first).
// The ENGLISH page merges TWO sources during the CMS migration: items written
// in the Payload CMS AND the old MDX files, so nothing disappears.
// (Individual items are rendered by the catch-all route.)
//
// TWO LANGUAGES (3 Nov 2026, the whole site in Hindi, phase 4): this file used
// to be app/(frontend)/news/page.tsx. It moved here so two addresses share it:
//   app/(frontend)/news/page.tsx     → <NewsPage lang="en" />   ("/news")
//   app/(frontend)/hi/news/page.tsx  → <NewsPage lang="hi" />   ("/hi/news")
// THE HINDI PAGE lists only write-ups that have a Hindi version, with their
// Hindi titles and summaries, each card opening the Hindi write-up (the owner's
// rule: no English on a Hindi page). Until the first Hindi write-up exists it
// says so and shows the newest Hindi headlines instead — never an empty page.
// Server component.

import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import PageTitle from "@/components/PageTitle";
import LatestHeadlinesSection from "@/components/LatestHeadlinesSection";
import { getSubjectColors } from "@/lib/subject-colors";
import { getAllNews } from "@/lib/news";
import {
  hasTranslation,
  resolveContentFile,
  getContentMeta,
  type ContentMeta,
} from "@/lib/content";
import { getCMSNewsList, getCMSNewsHindiSlugs, getCMSNewsInHindi } from "@/lib/cms";
import { formatMonthYear } from "@/lib/date-utils";
import { PAGE_TEXT } from "@/lib/page-text";
import { localHref } from "@/lib/site-text";
import type { Lang } from "@/lib/lang";

// One item in the listing (compatible with NewsCard's props).
type NewsListItem = {
  key: string; // the article slug — used to de-duplicate MDX vs CMS
  url: string;
  meta: ContentMeta;
  hindiHref?: string;
  hindiTitle?: string;
};

// "2026-05-22" → "2026-05" (the sortable key we group by).
function monthKey(date?: string | null): string {
  if (!date) return "0000-00";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "0000-00";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ENGLISH: every write-up, MDX + CMS (the CMS wins when a slug is in both).
async function englishItems(): Promise<NewsListItem[]> {
  // ── Source 1: legacy MDX news ──
  const mdxItems: NewsListItem[] = getAllNews().map((item) => {
    const hindiResolved = hasTranslation(item.slug, "hi")
      ? resolveContentFile(item.slug, "hi")
      : null;
    return {
      key: item.slug[item.slug.length - 1],
      url: item.url,
      meta: item.meta,
      hindiHref: hindiResolved ? "/hi/" + item.slug.join("/") : undefined,
      hindiTitle: hindiResolved
        ? getContentMeta(hindiResolved.filePath).title
        : undefined,
    };
  });

  // ── Source 2: CMS (Payload) news ──
  // Which CMS items also have a Hindi version? One query for the whole list
  // (never one per item) — the CMS equivalent of the .hi.mdx check above.
  const cmsHindi = await getCMSNewsHindiSlugs();
  const cmsItems: NewsListItem[] = (await getCMSNewsList()).map((n) => ({
    key: n.slug,
    url: `/news/${n.slug}`,
    hindiHref: cmsHindi.has(n.slug) ? `/hi/news/${n.slug}` : undefined,
    meta: {
      title: n.title,
      description: n.description ?? "",
      category: n.category ?? undefined,
      date: n.eventDate ?? undefined,
      image: n.coverImage?.url ?? undefined,
      imageWidth: n.coverImage?.width ?? undefined,
      imageHeight: n.coverImage?.height ?? undefined,
      imageCaption: n.coverImageCaption ?? undefined,
    } as ContentMeta,
  }));

  // Merge — if the same article slug exists in both, the CMS version wins.
  const byKey = new Map<string, NewsListItem>();
  for (const it of mdxItems) byKey.set(it.key, it);
  for (const it of cmsItems) byKey.set(it.key, it);
  return Array.from(byKey.values());
}

// HINDI: only the CMS write-ups that have a Hindi version, in Hindi. (No MDX:
// the old MDX news folder is empty — every write-up is in the CMS now.)
async function hindiItems(): Promise<NewsListItem[]> {
  return (await getCMSNewsInHindi()).map((n) => ({
    key: n.slug,
    url: `/hi/news/${n.slug}`,
    meta: {
      title: n.title,
      description: n.description ?? "",
      category: n.category ?? undefined,
      date: n.eventDate ?? undefined,
      image: n.image?.url,
      imageWidth: n.image?.width,
      imageHeight: n.image?.height,
    } as ContentMeta,
  }));
}

export default async function NewsPage({ lang }: { lang: Lang }) {
  const t = PAGE_TEXT[lang].news;
  const hi = lang === "hi";
  const all = hi ? await hindiItems() : await englishItems();

  // Group by month, newest month first.
  const groups = new Map<string, NewsListItem[]>();
  for (const it of all) {
    const k = monthKey(it.meta.date);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(it);
  }
  const monthKeys = Array.from(groups.keys()).sort().reverse();
  // Within each month, newest first.
  for (const arr of groups.values()) {
    arr.sort(
      (a, b) =>
        new Date(b.meta.date ?? 0).getTime() - new Date(a.meta.date ?? 0).getTime()
    );
  }

  // "2026-05" → "May 2026" / "मई 2026" (the heading shown to readers).
  const monthLabel = (key: string) => {
    if (key === "0000-00") return t.undated;
    const [y, m] = key.split("-").map(Number);
    return formatMonthYear(y, m - 1, lang);
  };

  // 17 Sep 2026: the same centred title block every listing page has (board 11),
  // in the Current Affairs signal colour, then the month-by-month grid.
  const colors = getSubjectColors("current-affairs");

  const body = (
    <>
    <PageTitle
      colors={colors}
      label={t.label}
      title={t.title}
      description={t.description}
    >
      {/* No count while the Hindi page is empty — "0 लेख" would only say the same thing twice */}
      {all.length > 0 && <span className="font-body text-[13px] text-muted">{t.count(all.length)}</span>}
    </PageTitle>

    <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-6">

      {all.length > 0 ? (
        <div className="space-y-14">
          {monthKeys.map((k) => (
            <section key={k}>
              {/* Month heading (e.g. "May 2026") */}
              {/* PHASE 4 (30 Oct 2026): the month in big Anton capitals */}
              <h2 data-reveal className="m-0 mb-6 pb-3 border-b-2 border-hairline font-display text-[40px] md:text-[54px] font-normal leading-none uppercase text-foreground">
                {monthLabel(k)}
              </h2>
              <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {groups.get(k)!.map((item) => (
                  <NewsCard
                    key={item.url}
                    url={item.url}
                    meta={item.meta}
                    hindiHref={item.hindiHref}
                    hindiTitle={item.hindiTitle}
                    lang={lang}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="font-body text-lg text-muted">{t.empty}</p>
          {/* Hindi only: a way on to the Hindi headlines */}
          {t.emptyLink && (
            <p className="mt-4 font-body">
              <Link href={localHref(lang, "/pulse")} className="font-extrabold text-accent hover:underline underline-offset-4">
                {t.emptyLink}
              </Link>
            </p>
          )}
        </div>
      )}
    </div>

    {/* HINDI, before the first Hindi write-up: the newest Hindi headlines, so
        the page still has today's news on it (agreed with the owner, 3 Nov 2026) */}
    {hi && all.length === 0 && <LatestHeadlinesSection lang="hi" />}
    </>
  );

  // Hindi: wrapped so screen readers read it in Hindi (lang="hi") and the Hindi
  // type rules apply (globals.css, .gk-hi-page — shared by every Hindi page).
  return hi ? <div lang="hi" className="gk-hi-page">{body}</div> : body;
}
