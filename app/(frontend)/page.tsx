// GKWorld360 Homepage
// Server Component — runs on the server, no client-side JS needed.
//
// REDESIGN 16 Sep 2026 (board 5, revised the same evening on the owner's review):
//   1. HERO            — DARK. Brand-teal tint over the photo; centred words, the
//                        search as a white box, four stats. No card (it looked
//                        cluttered — removed on review).
//   2. SUBJECTS        — LIGHT. Six white cards; signal colours only as bars/labels.
//   3. HEADLINES       — DARK band. Numbered list (LatestHeadlinesSection).
//   4. POPULAR TOPICS  — LIGHT. Four cards → /topics?sort=popular
//   5. RECENTLY ADDED  — DARK band. Numbered rows → /topics?sort=recent
//   6. CURRENT AFFAIRS + QUOTE — LIGHT.
//   7. FOOTER          — DARK (in layout.tsx).
// Strict light/dark alternation. "Popular" is recency until real view counts
// exist (see lib/topics.ts). The About block is gone; its text lives on /about.

import Link from "next/link";
import Image from "next/image";
import SearchBox from "@/components/SearchBox";
import SubjectCard from "@/components/SubjectCard";
import ContentCard from "@/components/ContentCard";
import { getPopularTopics, getRecentlyAddedTopics, formatAddedTime } from "@/lib/topics";
import NewsCard from "@/components/NewsCard";
import LatestHeadlinesSection from "@/components/LatestHeadlinesSection";
import { getHomepageSubjects, hasTranslation, resolveContentFile, getContentMeta, type ContentMeta } from "@/lib/content";
import { getRecentNews } from "@/lib/news";
import { getCMSNewsList, getCMSNewsHindiSlugs } from "@/lib/cms";
import { getDailyQuote } from "@/lib/quote";

// Re-generate the homepage at most once every 60 seconds so the headline teaser
// and the latest CMS news stay current (instead of freezing at deploy time),
// while still serving a fast, cached page between refreshes.
export const revalidate = 60;
import { SUBJECT_COLORS } from "@/lib/subject-colors";
// getSubjectInfo maps a subject slug like "history" to its display label
// ("History") and emoji icon ("🏛️") so TopicCards show the right category.
import { getSubjectInfo } from "@/lib/subjects";
import { getSiteStats } from "@/lib/site-stats";


// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const homepageSubjects = getHomepageSubjects();
  const stats = await getSiteStats(); // live counts for the hero

  // ── CURRENT AFFAIRS (homepage) ────────────────────────────────────────────
  // Merge CMS (Payload) news with the legacy MDX news, newest 3. Each item is
  // shaped for NewsCard (url + meta), with Hindi info where available.
  const mdxRecent = getRecentNews(10).map((item) => {
    const hi = hasTranslation(item.slug, "hi") ? resolveContentFile(item.slug, "hi") : null;
    return {
      key: item.slug[item.slug.length - 1],
      url: item.url,
      meta: item.meta,
      hindiHref: hi ? "/hi/" + item.slug.join("/") : (undefined as string | undefined),
      hindiTitle: hi ? getContentMeta(hi.filePath).title : (undefined as string | undefined),
    };
  });
  // Which CMS items also exist in Hindi — one query for the whole list.
  const cmsHindi = await getCMSNewsHindiSlugs();
  const cmsRecent = (await getCMSNewsList()).map((n) => ({
    key: n.slug,
    url: `/news/${n.slug}`,
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
    hindiHref: cmsHindi.has(n.slug) ? `/hi/news/${n.slug}` : undefined,
    hindiTitle: undefined as string | undefined,
  }));
  // Merge (CMS wins on same slug), newest first, take 3.
  const mergedNews = new Map<string, (typeof mdxRecent)[number]>();
  for (const it of mdxRecent) mergedNews.set(it.key, it);
  for (const it of cmsRecent) mergedNews.set(it.key, it);
  const recentNews = Array.from(mergedNews.values())
    .sort((a, b) => new Date(b.meta.date ?? 0).getTime() - new Date(a.meta.date ?? 0).getTime())
    .slice(0, 3);

  // ── POPULAR + RECENTLY ADDED ───────────────────────────────────────────────
  // Both from lib/topics.ts, which merges MDX and CMS topics. Four for the
  // Popular grid, six for the Recently Added rows (two columns of three).
  const popularTopics = await getPopularTopics(4);
  const recentlyAdded = await getRecentlyAddedTopics(6);
  // "History · Modern India" for a topic's small label
  const topicLabel = (slug: string[]) =>
    [
      getSubjectInfo(slug[0])?.label ?? slug[0],
      slug.length > 2 ? slug[1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : undefined,
    ]
      .filter(Boolean)
      .join(" · ");

  // recentNews already carries hindiHref/hindiTitle (built above), so the news
  // section can use it directly.
  const recentNewsWithHindi = recentNews;
  const dailyQuote = getDailyQuote();

  return (
    <>
      {/* ══ 1. HERO — DARK ═══════════════════════════════════════════════════
          The photo is tinted with the FRAME teal (#122a26) at 66%, plus a
          gradient that darkens toward the bottom where the text sits. Same
          recipe as every band on the site, in the brand colour instead of a
          subject's — the homepage belongs to the site, not to one subject.   */}
      {/* No `overflow-hidden` here on purpose: the search box's results list
          drops BELOW the hero's bottom edge, and overflow-hidden clipped it. The
          background photo doesn't need it — `fill` already confines it. */}
      <section className="relative bg-navy-dark text-on-dark">
        <Image
          src="/images/hero-banner.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-navy-dark/65" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(18,42,38,0.85) 0%, rgba(18,42,38,0.35) 55%, rgba(18,42,38,0.2) 100%)" }}
        />

        {/* Centred, one column, nothing competing with the words. */}
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-14 md:py-20 flex flex-col items-center text-center gap-5">
          <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">
            Trusted educational content · General knowledge · Current affairs
          </span>

          {/* One word in mint — the single accent moment in the headline */}
          <h1 className="m-0 font-heading text-5xl md:text-6xl lg:text-[72px] font-bold leading-[1.02] tracking-[-0.025em] text-on-dark max-w-[820px] [text-wrap:balance]">
            Master the World&apos;s <span className="text-mint">Core</span> Knowledge
          </h1>
          <p className="m-0 font-body text-base md:text-lg leading-[1.6] text-on-dark/80 max-w-[620px]">
            A curated reference for UPSC, SSC, Railways and lifelong learners — every
            topic in English and Hindi, fact-checked and written to be remembered.
          </p>

          {/* Search as a WHITE box on the dark — the one big input */}
          <div className="w-full max-w-[620px] mt-1">
            <SearchBox buttonLabel="Search" boxed />
          </div>

          {/* Live counts as PILLS (owner, 17 Sep): Subjects · Topics · Categories,
              and Users once the login feature exists (`stats.users` is undefined
              until then, so that pill simply doesn't render). Every number is
              real — lib/site-stats.ts, cached hourly. */}
          <ul className="flex flex-wrap justify-center gap-3 mt-3 m-0 p-0 list-none">
            {[
              [stats.subjects, stats.subjects === 1 ? "Subject" : "Subjects"],
              [stats.topics, stats.topics === 1 ? "Topic" : "Topics"],
              [stats.categories, stats.categories === 1 ? "Category" : "Categories"],
              ...(stats.users !== undefined ? [[stats.users, stats.users === 1 ? "Reader" : "Readers"]] : []),
            ].map(([value, label]) => (
              <li
                key={String(label)}
                // A translucent white pill on the dark hero: big enough to read
                // at a glance (48px tall), number in the serif, label in the sans.
                className="inline-flex items-center gap-2.5 min-h-12 px-6 rounded-full bg-on-dark/10 border border-on-dark/25 backdrop-blur-sm"
              >
                <span className="font-heading text-2xl font-bold leading-none text-on-dark">{value}</span>
                <span className="font-body text-[15px] font-medium text-on-dark/85">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ 2. EXPLORE SUBJECTS — LIGHT ══════════════════════════════════════
          Six subject cards, read from content/ — change homepageOrder in a
          subject's overview.mdx to swap which six appear here.               */}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-14 md:py-[72px] flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Part one</span>
              <h2 className="m-0 font-heading text-3xl md:text-[40px] font-bold tracking-[-0.015em] text-navy-dark">
                Explore Subjects
              </h2>
            </div>
            <Link href="/subjects" className="font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
              All subjects →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {homepageSubjects.map((subject, i) => (
              <SubjectCard
                key={subject.slug}
                title={subject.meta.title}
                description={subject.meta.description}
                slug={subject.slug}
                image={subject.meta.image}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. LATEST HEADLINES — DARK band ══════════════════════════════════ */}
      <LatestHeadlinesSection />

      {/* ══ 4. POPULAR TOPICS — LIGHT ════════════════════════════════════════
          Four cards. "View all" opens /topics with the Popular sort active. */}
      {popularTopics.length > 0 && (
        <section className="bg-background">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-14 md:py-[72px] flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Part three · most read</span>
                <h2 className="m-0 font-heading text-3xl md:text-[40px] font-bold tracking-[-0.015em] text-navy-dark">
                  Popular Topics
                </h2>
              </div>
              <Link href="/topics?sort=popular" className="font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
                All topics →
              </Link>
            </div>
            {/* 4 across on desktop, 2 on tablet, 1 on phones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularTopics.map((t) => (
                <ContentCard
                  key={t.slug.join("/")}
                  title={t.meta.title}
                  description={t.meta.description}
                  href={"/" + t.slug.join("/")}
                  image={t.meta.image}
                  label={topicLabel(t.slug)}
                  hoverBg={SUBJECT_COLORS[t.slug[0]]?.bg}
                  accent={SUBJECT_COLORS[t.slug[0]]?.accent}
                  hindiHref={t.hindiHref}
                  hindiTitle={t.hindiTitle}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 5. RECENTLY ADDED — DARK band ════════════════════════════════════
          Numbered rows, two columns — the same pattern as a subject page's
          "New in History" band. "View all" opens /topics with Recent active. */}
      {recentlyAdded.length > 0 && (
        <section className="bg-navy-dark text-on-dark">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-14 flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">Part four · fresh from the desk</span>
                <h2 className="m-0 font-heading text-3xl md:text-[40px] font-bold tracking-[-0.015em] text-on-dark">
                  Recently Added
                </h2>
              </div>
              <Link href="/topics?sort=recent" className="font-body text-sm font-semibold text-mint hover:text-on-dark transition-colors whitespace-nowrap">
                View all →
              </Link>
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-12 list-none m-0 p-0">
              {recentlyAdded.map((t, i) => (
                <li key={t.slug.join("/")}>
                  <Link
                    href={"/" + t.slug.join("/")}
                    className="grid grid-cols-[40px_minmax(0,1fr)_auto] gap-3.5 items-baseline py-4 border-b border-on-dark/10 hover:text-mint transition-colors"
                  >
                    <span className="font-heading text-xl font-bold text-mint">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-heading text-lg font-semibold leading-snug">{t.meta.title}</span>
                      <span className="font-body text-[13px] text-on-dark/60">
                        {topicLabel(t.slug)} · {formatAddedTime(t.meta.date)}
                      </span>
                    </span>
                    <span className="font-body text-xs text-on-dark/60 whitespace-nowrap">{t.hindiHref ? "EN · हिन्दी" : "EN"}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ══ 6. CURRENT AFFAIRS + QUOTE — LIGHT ═══════════════════════════════ */}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-14 md:py-[72px] flex flex-col gap-14">
          {recentNews.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: SUBJECT_COLORS["current-affairs"].accent }}>
                    Part five · <span lang="hi" className="font-hindi normal-case tracking-normal">समसामयिकी</span>
                  </span>
                  <h2 className="m-0 font-heading text-3xl md:text-[40px] font-bold tracking-[-0.015em] text-navy-dark">
                    Current Affairs
                  </h2>
                </div>
                <Link href="/news" className="font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark transition-colors whitespace-nowrap">
                  All write-ups →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recentNewsWithHindi.map((item) => (
                  <NewsCard
                    key={item.url}
                    url={item.url}
                    meta={item.meta}
                    hindiHref={item.hindiHref}
                    hindiTitle={item.hindiTitle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quote of the day — a white card, quiet. Edit content/daily-quote.mdx. */}
          <figure className="m-0 flex flex-col items-center gap-4 text-center bg-surface border border-hairline rounded-card px-6 py-10 md:px-14 md:py-12">
            <span className="font-heading text-[56px] leading-[0.6] text-sapphire select-none" aria-hidden="true">&ldquo;</span>
            <blockquote className="m-0 font-heading text-xl md:text-[26px] leading-[1.45] italic text-navy-dark max-w-[860px] [text-wrap:balance]">
              {dailyQuote.quote}
            </blockquote>
            <figcaption className="flex items-center gap-3">
              {dailyQuote.authorImage && (
                <span className="relative w-10 h-10 rounded-full overflow-hidden border border-hairline flex-shrink-0">
                  <Image src={dailyQuote.authorImage} alt={dailyQuote.author} fill className="object-cover" sizes="40px" />
                </span>
              )}
              <span className="flex flex-col gap-1 text-left">
                <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  — {dailyQuote.author} · Quote of the day
                </span>
                {dailyQuote.authorTitle && (
                  <span className="font-body text-xs text-muted leading-snug max-w-[560px]">{dailyQuote.authorTitle}</span>
                )}
              </span>
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
