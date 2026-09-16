// GKWorld360 Homepage
// Server Component — runs on the server, no client-side JS needed.
//
// REDESIGN 16 Sep 2026 (board 5). Built entirely from the page system:
//   1. HERO         — DARK. Brand-teal tint over the photo (the frame's colour,
//                     not a subject's), the search as a white box on the dark,
//                     and a white "Featured today" card floating on the right.
//   2. SUBJECTS     — LIGHT. Six white cards; signal colours only as bars/labels.
//   3. HEADLINES    — DARK band. Numbered list, mint numbers (LatestHeadlinesSection).
//   4. CURRENT AFFAIRS + QUOTE — LIGHT. Write-up cards, then the quote as a white card.
//   5. FOOTER       — DARK (in layout.tsx).
// Strict light/dark alternation. The old "Popular Topics" / "Recently Added
// Topics" / "About" sections are gone: the first two were empty bands, the
// About text lives on /about.

import Link from "next/link";
import Image from "next/image";
import SearchBox from "@/components/SearchBox";
import SubjectCard from "@/components/SubjectCard";
import ContentCard from "@/components/ContentCard";
import NewsCard from "@/components/NewsCard";
import LatestHeadlinesSection from "@/components/LatestHeadlinesSection";
import { getHomepageSubjects, getRecentTopics, hasTranslation, resolveContentFile, getContentMeta, type ContentMeta } from "@/lib/content";
import { getRecentNews } from "@/lib/news";
import { getCMSNewsList, getCMSNewsHindiSlugs, getCMSLatestArticles, type CMSListedTopic } from "@/lib/cms";
import { getDailyQuote } from "@/lib/quote";

// Re-generate the homepage at most once every 60 seconds so the headline teaser
// and the latest CMS news stay current (instead of freezing at deploy time),
// while still serving a fast, cached page between refreshes.
export const revalidate = 60;
import { SUBJECT_COLORS } from "@/lib/subject-colors";
// getSubjectInfo maps a subject slug like "history" to its display label
// ("History") and emoji icon ("🏛️") so TopicCards show the right category.
import { getSubjectInfo, SUBJECTS } from "@/lib/subjects";


// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const homepageSubjects = getHomepageSubjects();

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

  // ── FEATURED TOPIC (hero card) ────────────────────────────────────────────
  // The most recently published topic, shown as the white card floating on the
  // hero. CMS first (that is where new content comes from now), MDX as the
  // fallback. Until a real "featured" flag exists in the CMS, recency stands in.
  const [cmsLatest] = await getCMSLatestArticles(1);
  const [mdxLatest] = getRecentTopics(1);
  const featuredRaw: CMSListedTopic | undefined =
    cmsLatest ??
    (mdxLatest
      ? {
          slug: mdxLatest.slug,
          meta: mdxLatest.meta,
          hindiHref: hasTranslation(mdxLatest.slug, "hi") ? "/hi/" + mdxLatest.slug.join("/") : undefined,
          hindiTitle: (() => {
            const hi = hasTranslation(mdxLatest.slug, "hi") ? resolveContentFile(mdxLatest.slug, "hi") : null;
            return hi ? getContentMeta(hi.filePath).title : undefined;
          })(),
        }
      : undefined);
  const featured = featuredRaw
    ? {
        title: featuredRaw.meta.title,
        description: featuredRaw.meta.description ?? "",
        href: "/" + featuredRaw.slug.join("/"),
        // "History · Modern India" — subject name + prettified category slug
        label: [
          getSubjectInfo(featuredRaw.slug[0])?.label ?? featuredRaw.slug[0],
          featuredRaw.slug.length > 2
            ? featuredRaw.slug[1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
            : undefined,
        ]
          .filter(Boolean)
          .join(" · "),
        image: featuredRaw.meta.image,
        colors: SUBJECT_COLORS[featuredRaw.slug[0]],
        hindiHref: featuredRaw.hindiHref,
        hindiTitle: featuredRaw.hindiTitle,
      }
    : null;

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

        <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-14 md:py-20 lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
          {/* Left: the words */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">
              Trusted educational content · General knowledge · Current affairs
            </span>

            {/* One word in mint — the single accent moment in the headline */}
            <h1 className="m-0 font-heading text-5xl md:text-6xl lg:text-[72px] font-bold leading-[1.02] tracking-[-0.025em] text-on-dark max-w-[760px] [text-wrap:balance]">
              Master the World&apos;s <span className="text-mint">Core</span> Knowledge
            </h1>
            <p lang="hi" className="m-0 font-hindi text-xl md:text-2xl leading-[1.4] text-on-dark/80">
              विश्व के मूल ज्ञान में महारत हासिल करें
            </p>
            <p className="m-0 font-body text-base md:text-lg leading-[1.6] text-on-dark/80 max-w-[580px]">
              A curated reference for UPSC, SSC, Railways and lifelong learners — every
              topic in English and Hindi, fact-checked and written to be remembered.
            </p>

            {/* Search as a WHITE box on the dark — the one big input */}
            <div className="max-w-[580px] mt-1">
              <SearchBox buttonLabel="Search" boxed />
            </div>

            {/* Four quiet stats instead of tick-badges */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-2 font-body text-[13px] text-on-dark/65">
              {[
                [String(SUBJECTS.length), "subjects"], // the real count, same as the menu
                ["EN · हिन्दी", "every topic"],
                ["Daily", "current affairs"],
                ["Free", "always"],
              ].map(([value, label]) => (
                <span key={label} className="flex flex-col gap-0.5">
                  <span className="font-heading text-[26px] font-bold leading-none text-on-dark">{value}</span>
                  <span>{label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right: the white card ON the stage — today's featured topic */}
          {featured && (
            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <ContentCard
                title={featured.title}
                description={featured.description}
                href={featured.href}
                image={featured.image}
                label={featured.label}
                badge="Featured today"
                hoverBg={featured.colors?.bg}
                accent={featured.colors?.accent}
                hindiHref={featured.hindiHref}
                hindiTitle={featured.hindiTitle}
                flat
              />
            </div>
          )}
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

      {/* ══ 4. CURRENT AFFAIRS + QUOTE — LIGHT ═══════════════════════════════ */}
      <section className="bg-background">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-14 md:py-[72px] flex flex-col gap-14">
          {recentNews.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: SUBJECT_COLORS["current-affairs"].accent }}>
                    Part three · <span lang="hi" className="font-hindi normal-case tracking-normal">समसामयिकी</span>
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
