// The catch-all route — handles EVERY content page with one file.
// Detects what type of page is being requested and renders the correct layout:
//
//   /history                          → Subject page (shows category cards)
//   /history/modern-india             → Category page (shows topic cards)
//   /history/modern-india/revolt-1857 → Topic page (shows the article)
//   /human-body                       → Subject page with no categories (shows topics directly)

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import {
  getAllSlugs,
  slugToFilePath,
  getContentMeta,
  getPageType,
  getCategoriesInSubject,
  getTopicsInSubject,
  getTopicsInCategory,
  extractHeadings,
  calculateReadingTime,
  getAdjacentTopics,
  getRelatedTopics,
  parseLangSlug,
  resolveContentFile,
  hasTranslation,
} from "@/lib/content";
import ArticleBand from "@/components/ArticleBand";
import PageBand, { BandLabel, BandStat } from "@/components/PageBand";
import Button from "@/components/Button";
import Link from "next/link";
import { getSubjectInfo } from "@/lib/subjects";
import ArticleLayout from "@/components/ArticleLayout";
import ContentCard from "@/components/ContentCard";
import TableOfContents from "@/components/TableOfContents";
import QuickFacts from "@/components/QuickFacts";
import TopicNav from "@/components/TopicNav";
import JsonLd from "@/components/JsonLd";
import NewsArticleView from "@/components/NewsArticleView";
import { getRecentNews } from "@/lib/news";
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/site";
import { getSubjectColors } from "@/lib/subject-colors";
import { formatNewsDate } from "@/lib/date-utils";
// CMS (Payload) — used to render topics & news from the database when they exist there.
import {
  getCMSArticle,
  getCMSArticleLanguages,
  getCMSArticlesInCategory,
  getCMSNews,
  getCMSNewsLanguages,
  type CMSListedTopic,
} from "@/lib/cms";
import CMSTopicView from "@/components/cms/CMSTopicView";
import CMSNewsView from "@/components/cms/CMSNewsView";

// Re-generate each content page at most every 60 seconds, so edits and newly
// published articles/news from the Payload admin appear on the live site within
// a minute instead of only after a redeploy. (New slugs not in the pre-built
// list are rendered on first request, then cached — Next's default behaviour.)
export const revalidate = 60;

// ── GENERATE STATIC PARAMS ────────────────────────────────────────────────────
// Tells Next.js every URL that exists so pages are pre-built at deploy time.
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── SEO METADATA FOR CMS-ONLY PAGES ───────────────────────────────────────────
// Builds the same tag set we produce for MDX pages, but from a CMS record.
// Kept as a small helper so articles and news items cannot drift apart.
function cmsMetadata(
  title: string,
  description: string | null | undefined,
  imageUrl: string | null | undefined,
  url: string
): Metadata {
  const images = imageUrl ? [{ url: imageUrl }] : undefined;
  return {
    // Just the bare title — do NOT append the site name here. The root layout
    // (app/(frontend)/layout.tsx) sets `template: "%s | GKWorld360"`, which adds
    // it automatically. Appending it here too produced the double-suffix
    // "The Revolt of 1857 | GKWorld360 | GKWorld360" (caught in testing).
    title: title || SITE_NAME,
    description: description ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description: description ?? undefined,
      url,
      siteName: SITE_NAME,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images,
    },
  };
}

// ── SEO METADATA ──────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const filePath = slugToFilePath(slug);
  // Work out the language up front — both branches below need it.
  const { lang: metaLang, contentSlug } = parseLangSlug(slug);

  // ── CMS-ONLY PAGES (no MDX file on disk) ────────────────────────────────────
  // Content written in /admin exists ONLY in the database. `slugToFilePath()`
  // looks at the filesystem, so it returns null for those pages — and this
  // function used to give up with `return {}`. Next.js then fell back to the
  // site-wide default title, meaning EVERY CMS-only page shared the homepage's
  // <title> and description. For a site whose whole strategy is search and AI
  // discoverability, that is a serious bug. (Confirmed live 4 Sep 2026: the
  // "Smart Border Project" news item was serving the generic homepage title.)
  //
  // So when there is no file, ask the CMS before giving up.
  if (!filePath) {
    const url = absoluteUrl("/" + slug.join("/"));

    // News items live at the flat URL /news/<slug>
    if (contentSlug[0] === "news" && contentSlug.length === 2) {
      const langs = await getCMSNewsLanguages(contentSlug[1]);
      if (langs[metaLang]) {
        const news = await getCMSNews(contentSlug[1], metaLang);
        if (news) {
          const meta = cmsMetadata(news.title, news.description, news.coverImage?.url, url);
          if (langs.en && langs.hi) {
            meta.alternates = {
              ...meta.alternates,
              languages: {
                en: absoluteUrl("/news/" + contentSlug[1]),
                hi: absoluteUrl("/hi/news/" + contentSlug[1]),
              },
            };
          }
          return meta;
        }
      }
    }

    // Articles live at /<subject>/<category>/<topic> (or /<subject>/<topic>).
    // The length check keeps a bare subject URL like /history from being
    // mistaken for an article whose slug happens to be "history".
    // Works for BOTH languages: a /hi/... URL asks for the Hindi title and
    // description. We first check which languages genuinely exist — Payload's
    // fallback would otherwise hand us the English title for a Hindi URL.
    if (contentSlug[0] !== "news" && contentSlug.length >= 2) {
      const langs = await getCMSArticleLanguages(contentSlug);
      if (langs[metaLang]) {
        const article = await getCMSArticle(contentSlug, metaLang);
        if (article) {
          const meta = cmsMetadata(article.title, article.description, article.coverImage?.url, url);
          // hreflang: tell Google the two language versions are the same
          // article. Only emitted when both exist — same rule as the MDX path.
          if (langs.en && langs.hi) {
            meta.alternates = {
              ...meta.alternates,
              languages: {
                en: absoluteUrl("/" + contentSlug.join("/")),
                hi: absoluteUrl("/hi/" + contentSlug.join("/")),
              },
            };
          }
          return meta;
        }
      }
    }

    return {}; // genuinely nothing here — Next will 404 the page itself
  }

  const meta = getContentMeta(filePath);
  const url = absoluteUrl("/" + slug.join("/"));
  // Use the topic's banner image for the social-media preview, if it has one
  const ogImages = meta.image ? [{ url: meta.image }] : undefined;

  // Build hreflang links to the other-language version (if it exists), so
  // Google understands they're the same article in two languages.
  const languages: Record<string, string> = {};
  if (hasTranslation(contentSlug, "en")) {
    languages["en"] = absoluteUrl("/" + contentSlug.join("/"));
  }
  if (hasTranslation(contentSlug, "hi")) {
    languages["hi"] = absoluteUrl("/hi/" + contentSlug.join("/"));
  }

  return {
    title: meta.title || SITE_NAME,
    description: meta.description ?? undefined,
    // Canonical URL — the one true address for THIS language version.
    // `languages` adds the hreflang alternate links for the other language(s).
    alternates: {
      canonical: url,
      languages: Object.keys(languages).length > 1 ? languages : undefined,
    },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description ?? undefined,
      url,
      siteName: SITE_NAME,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description ?? undefined,
      images: ogImages,
    },
  };
}

// ── MERGE MDX + CMS TOPICS FOR A LISTING ──────────────────────────────────────
// A category (or subject) page lists its topics from TWO sources: the .mdx files
// on disk (the old system) and the CMS database (the new one). Both hand back
// the same shape, so merging is simple:
//   1. If the same topic exists in both, the CMS copy wins (Payload-first).
//   2. Sort by `order` (missing = 999, i.e. last), then alphabetically —
//      the same rule lib/content.ts uses for Previous/Next.
// This is the same pattern the /news listing already used for news items.
type ListedTopic = CMSListedTopic; // { slug, meta, hindiHref?, hindiTitle? }
function mergeTopics(mdx: ListedTopic[], cms: ListedTopic[]): ListedTopic[] {
  const byPath = new Map<string, ListedTopic>();
  for (const t of mdx) byPath.set(t.slug.join("/"), t);
  for (const t of cms) byPath.set(t.slug.join("/"), t); // overwrites → CMS wins
  return Array.from(byPath.values()).sort((a, b) => {
    const ao = a.meta.order ?? 999;
    const bo = b.meta.order ?? 999;
    if (ao !== bo) return ao - bo;
    return a.meta.title.localeCompare(b.meta.title);
  });
}

// ── BREADCRUMB BUILDER ────────────────────────────────────────────────────────
// Converts a slug array into breadcrumb items.
// ['history', 'modern-india', 'revolt-of-1857'] →
//   [{ label: 'History', href: '/history' },
//    { label: 'Modern India', href: '/history/modern-india' },
//    { label: 'Revolt of 1857', href: '/history/modern-india/revolt-of-1857' }]
function buildBreadcrumbs(
  slug: string[],
  titles: Record<string, string>
): { label: string; href: string }[] {
  return slug.map((segment, index) => {
    const href = "/" + slug.slice(0, index + 1).join("/");
    // Use the fetched title if available, otherwise prettify the slug
    const label =
      titles[segment] ??
      segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    return { label, href };
  });
}

// ── PAGE COMPONENT ────────────────────────────────────────────────────────────
export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // Work out the language (Hindi if the URL starts with /hi) and the content path
  const { lang, contentSlug } = parseLangSlug(slug);

  // Subject color — null for unknown subjects (falls back to plain white)
  const colors = getSubjectColors(contentSlug[0]);

  // ── PAYLOAD-FIRST NEWS (CMS) ──────────────────────────────────────────────
  // A CMS news item lives at the flat URL /news/<slug> (e.g. /news/smart-border).
  // We check this BEFORE the MDX lookup below, because a CMS-only news item has
  // no MDX file — so the MDX lookup would 404 it. Falls through if not in the CMS.
  // Both languages (15 Sep 2026): the `lang === "en"` gate is gone, same as for
  // articles. We check which languages genuinely exist first, because Payload's
  // fallback would otherwise serve English on a /hi/news/... URL.
  if (contentSlug[0] === "news" && contentSlug.length === 2) {
    const newsLangs = await getCMSNewsLanguages(contentSlug[1]);
    if (newsLangs[lang]) {
      const cmsNews = await getCMSNews(contentSlug[1], lang);
      if (cmsNews) {
        return (
          <CMSNewsView
            news={cmsNews}
            lang={lang}
            enHref={newsLangs.en ? "/news/" + contentSlug[1] : undefined}
            hiHref={newsLangs.hi ? "/hi/news/" + contentSlug[1] : undefined}
          />
        );
      }
    }
  }

  // ── PAYLOAD-FIRST ARTICLES (CMS) ───────────────────────────────────────────
  // This MUST run before the MDX lookup below, for exactly the same reason as
  // the news block above: an article written in /admin has NO .mdx file, and
  // `resolveContentFile()` is a plain filesystem check — so `notFound()` would
  // fire before we ever asked the database.
  //
  // THE BUG THIS FIXES (found 4 Sep 2026): this check used to sit ~180 lines
  // further down, after the `if (!resolved) notFound()` line. The intended
  // design was "Payload-first, MDX-fallback", and that IS how it behaved for
  // an article that existed in BOTH places (the CMS copy won). But a NEW
  // article created only in /admin returned 404 — the MDX file was silently
  // acting as a REQUIREMENT rather than a fallback. That made the admin panel
  // unusable for adding content, which is the entire point of having a CMS.
  //
  // The length check keeps a bare subject URL like /history from matching an
  // article whose slug happens to be "history".
  //
  // BOTH LANGUAGES (added 15 Sep 2026): this used to be gated to `lang === "en"`,
  // so a /hi/... URL never asked the CMS and Hindi written in /admin could only
  // ever 404. Now the URL's language is passed straight through. The one trap is
  // Payload's `fallback: true` — asking for Hindi that doesn't exist returns
  // English — so we check which languages REALLY exist first, and only serve a
  // Hindi CMS page when there is a Hindi title. Otherwise we fall through to
  // the .hi.mdx file (or 404), exactly as before.
  if (contentSlug[0] !== "news" && contentSlug.length >= 2) {
    const cmsLangs = await getCMSArticleLanguages(contentSlug);
    if (cmsLangs[lang]) {
      const cmsArticle = await getCMSArticle(contentSlug, lang);
      if (cmsArticle) {
        // Breadcrumbs come from the CMS record here, not from MDX frontmatter —
        // there may be no file to read. buildBreadcrumbs() prettifies any segment
        // we don't supply a title for, so the parent crumbs still read correctly.
        const cmsBreadcrumbs = buildBreadcrumbs(contentSlug, {
          [contentSlug[contentSlug.length - 1]]: cmsArticle.title,
        });
        // The toggle needs a link to each version that exists. A CMS article's
        // languages come from the database, not from .mdx files on disk.
        const cmsEnHref = cmsLangs.en ? "/" + contentSlug.join("/") : undefined;
        const cmsHiHref = cmsLangs.hi ? "/hi/" + contentSlug.join("/") : undefined;
        return (
          <CMSTopicView
            article={cmsArticle}
            breadcrumbs={cmsBreadcrumbs}
            colors={colors}
            lang={lang}
            enHref={cmsEnHref}
            hiHref={cmsHiHref}
          />
        );
      }
    }
  }

  // Find the file that matches this slug + language
  const resolved = resolveContentFile(contentSlug, lang);
  if (!resolved) notFound();

  const meta = getContentMeta(resolved!.filePath);
  const pageType = getPageType(slug);

  // Build breadcrumbs from the CONTENT path (never the "hi" prefix), so the
  // crumbs read "Home › History › Modern India › …" in both languages.
  const breadcrumbTitles: Record<string, string> = { [contentSlug[contentSlug.length - 1]]: meta.title };
  const breadcrumbs = buildBreadcrumbs(contentSlug, breadcrumbTitles);

  // News year/month "folder" paths (e.g. /news/2026 or /news/2026/06) are not
  // real pages — only the listing (/news, handled by app/news/page.tsx) and the
  // individual items (/news/YYYY/MM/slug, handled in the topic branch) exist.
  if (contentSlug[0] === "news" && pageType !== "topic") notFound();

  // ── HINDI INFO HELPER ─────────────────────────────────────────────────────
  // For a given content slug, returns the Hindi URL and title if a Hindi
  // version of that page exists. Returns null if no Hindi version is found.
  // Used to pass hindiHref and hindiTitle to ContentCards so they can flip.
  function getHindiInfo(itemSlug: string[]): { href: string; title: string } | null {
    if (!hasTranslation(itemSlug, "hi")) return null;
    const resolved = resolveContentFile(itemSlug, "hi");
    if (!resolved) return null;
    return {
      href: "/hi/" + itemSlug.join("/"),
      title: getContentMeta(resolved.filePath).title,
    };
  }

  // ── SUBJECT PAGE (top-level folder, e.g. /history) ────────────────────────
  // A subject shows its CATEGORIES if it has any (e.g. History → Modern India).
  // If it has no categories, it shows its TOPICS directly (e.g. Human Body → Blood).
  //
  // REDESIGN 16 Sep 2026 (board 3): tall tinted band with a white "Start here"
  // card floating on it → light section of category cards → dark "Recently
  // added" band → footer. Strict light/dark alternation; no subject-tinted page
  // background any more (the signal colour never sits below the band).
  if (pageType === "subject") {
    const categories = getCategoriesInSubject(slug[0]);
    const subjectInfo = getSubjectInfo(slug[0]); // English + Hindi names

    // Every topic in the subject, from BOTH sources (MDX folder + CMS), grouped
    // by category so we can show counts, "Start here" and "Recently added".
    // One CMS query per category; subject pages are generated statically, so
    // this runs at build/revalidate time, not on every visit.
    const topicsByCategory = new Map<string, ListedTopic[]>();
    if (categories.length === 0) {
      topicsByCategory.set(
        "",
        mergeTopics(getTopicsInSubject(slug[0]), await getCMSArticlesInCategory(slug[0], null))
      );
    } else {
      for (const cat of categories) {
        topicsByCategory.set(
          cat.slug,
          mergeTopics(getTopicsInCategory(slug[0], cat.slug), await getCMSArticlesInCategory(slug[0], cat.slug))
        );
      }
    }
    const allTopics = Array.from(topicsByCategory.values()).flat();
    const looseTopics = topicsByCategory.get("") ?? [];
    const hasHindi = allTopics.some((t) => t.hindiHref || getHindiInfo(t.slug));

    // "Start here": the first topics in reading order (already sorted by mergeTopics).
    const startHere = allTopics.slice(0, 3);
    // "Recently added": newest by date when we have dates, otherwise the LAST
    // topics in reading order (a fair proxy — new topics are appended).
    const recentlyAdded = [...allTopics]
      .sort((x, y) => {
        if (x.meta.date && y.meta.date) return y.meta.date.localeCompare(x.meta.date);
        if (x.meta.date) return -1;
        if (y.meta.date) return 1;
        return (y.meta.order ?? 0) - (x.meta.order ?? 0);
      })
      .slice(0, 4);

    // Pretty category name for a topic's small caption, e.g. "Modern India"
    const categoryTitle = (t: ListedTopic) =>
      categories.find((c) => c.slug === t.slug[1])?.meta.title ?? "";

    return (
      <>
        <PageBand
          colors={colors}
          breadcrumbs={[{ label: "Subjects", href: "/subjects" }]}
          coverUrl={meta.image}
          size="tall"
          aside={
            startHere.length > 0 && (
              // The white card ON the band — the Paymint move: a light object on
              // a dark stage. Lists the first topics so a new reader has a door.
              <div className="flex flex-col gap-1 bg-surface text-foreground rounded-[12px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                <span
                  className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
                  style={{ color: colors?.accent ?? "#059669" }}
                >
                  Start here
                </span>
                {startHere.map((t) => {
                  const hindi = t.hindiHref ? { href: t.hindiHref } : getHindiInfo(t.slug);
                  return (
                    <Link
                      key={t.slug.join("/")}
                      href={`/${t.slug.join("/")}`}
                      className="flex flex-col gap-1 py-3 border-b border-border-subtle hover:text-sapphire transition-colors"
                    >
                      <span className="font-heading text-lg font-semibold leading-snug">{t.meta.title}</span>
                      <span className="font-body text-[13px] text-muted">
                        {[categoryTitle(t), hindi ? "EN · हिन्दी" : "EN"].filter(Boolean).join(" · ")}
                      </span>
                    </Link>
                  );
                })}
                <Button href={categories.length > 0 ? "#categories" : "#topics"} className="mt-4">
                  Browse all {meta.title} topics
                </Button>
              </div>
            )
          }
        >
          <BandLabel colors={colors}>Subject</BandLabel>
          <h1 className="m-0 font-heading text-5xl md:text-[64px] font-bold leading-[1.02] tracking-[-0.02em] text-[#fffbf4]">
            {meta.title}
            {subjectInfo?.labelHi && (
              <span lang="hi" className="font-hindi text-3xl md:text-[44px] font-semibold opacity-85">
                {" "}· {subjectInfo.labelHi}
              </span>
            )}
          </h1>
          {meta.description && (
            <p className="m-0 font-heading text-lg md:text-xl leading-[1.5] text-[#fffbf4]/88 max-w-[620px]">
              {meta.description}
            </p>
          )}
          <div className="flex flex-wrap gap-7 mt-1.5">
            {categories.length > 0 && (
              <BandStat value={categories.length} label={categories.length === 1 ? "category" : "categories"} />
            )}
            <BandStat value={allTopics.length} label={allTopics.length === 1 ? "topic" : "topics"} />
            <BandStat value={hasHindi ? "EN · हिन्दी" : "EN"} label={hasHindi ? "both languages" : "English"} />
          </div>
        </PageBand>

        {/* ── LIGHT: categories (or loose topics) ─────────────────────────── */}
        <div id={categories.length > 0 ? "categories" : "topics"} className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 pt-12 md:pt-16 pb-12 md:pb-16 flex flex-col gap-6">
          {categories.length > 0 ? (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: colors?.accent ?? "#059669" }}>
                  {meta.title}
                </span>
                <h2 className="m-0 font-heading text-3xl md:text-4xl font-bold text-navy-dark tracking-[-0.015em]">Categories</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat) => {
                  const count = topicsByCategory.get(cat.slug)?.length ?? 0;
                  return (
                    <ContentCard
                      key={cat.slug}
                      title={cat.meta.title}
                      description={cat.meta.description}
                      label={`${count} ${count === 1 ? "topic" : "topics"}`}
                      href={`/${slug[0]}/${cat.slug}`}
                      hoverBg={colors?.bg}
                      accent={colors?.accent}
                      image={cat.meta.image}
                      ctaLabel="Explore →"
                    />
                  );
                })}
              </div>
            </>
          ) : looseTopics.length > 0 ? (
            <>
              <h2 className="m-0 font-heading text-3xl md:text-4xl font-bold text-navy-dark tracking-[-0.015em]">Topics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {looseTopics.map((topic) => {
                  const hindi = topic.hindiHref
                    ? { href: topic.hindiHref, title: topic.hindiTitle }
                    : getHindiInfo(topic.slug);
                  return (
                    <ContentCard
                      key={topic.slug.join("/")}
                      title={topic.meta.title}
                      description={topic.meta.description}
                      href={`/${topic.slug.join("/")}`}
                      hoverBg={colors?.bg}
                      accent={colors?.accent}
                      image={topic.meta.image}
                      hindiHref={hindi?.href}
                      hindiTitle={hindi?.title}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            // Nothing yet — empty state
            <div className="py-16 text-center">
              <p className="font-body text-lg text-muted">Topics coming soon. Check back later.</p>
            </div>
          )}
        </div>

        {/* ── DARK: recently added (the light/dark alternation) ────────────── */}
        {recentlyAdded.length > 0 && (
          <section className="bg-navy-dark text-on-dark">
            <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-14 flex flex-col gap-6">
              <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">Recently added</span>
                  <h2 className="m-0 font-heading text-3xl md:text-4xl font-bold tracking-[-0.015em] text-on-dark">New in {meta.title}</h2>
                </div>
              </div>
              {/* Numbered rows, two columns on desktop. The mint number is the
                  one accent; everything else is white at varying opacity. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                {recentlyAdded.map((t, i) => {
                  const hindi = t.hindiHref ? { href: t.hindiHref } : getHindiInfo(t.slug);
                  return (
                    <Link
                      key={t.slug.join("/")}
                      href={`/${t.slug.join("/")}`}
                      className="grid grid-cols-[40px_minmax(0,1fr)_auto] gap-3.5 items-baseline py-4 border-b border-on-dark/10 hover:text-mint transition-colors"
                    >
                      <span className="font-heading text-xl font-bold text-mint">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-heading text-lg font-semibold leading-snug">{t.meta.title}</span>
                        <span className="font-body text-[13px] text-on-dark/60">{categoryTitle(t)}</span>
                      </span>
                      <span className="font-body text-xs text-on-dark/60 whitespace-nowrap">{hindi ? "EN · हिन्दी" : "EN"}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </>
    );
  }

  // ── CATEGORY PAGE (folder with topic files, no sub-folders) ───────────────
  // REDESIGN 16 Sep 2026 (board 4): compact band, then the topic cards.
  if (pageType === "category") {
    // Could be a subject with no categories, or an actual category inside a subject
    // Topics from BOTH sources — the .mdx folder and the CMS — merged, CMS wins
    // on a clash, sorted by reading order. Without the CMS half, an article
    // written in /admin rendered at its URL but was listed NOWHERE (fixed 16 Sep).
    const mdxTopics =
      slug.length === 1
        ? getTopicsInSubject(slug[0])           // subject with no categories
        : getTopicsInCategory(slug[0], slug[1]); // category inside a subject
    const cmsTopics = await getCMSArticlesInCategory(slug[0], slug.length === 1 ? null : slug[1]);
    const topics = mergeTopics(mdxTopics, cmsTopics);

    // Breadcrumb trail WITHOUT the current page (the band's title is the page)
    const parentCrumbs = breadcrumbs.slice(0, -1);

    return (
      <>
        <PageBand colors={colors} breadcrumbs={parentCrumbs} coverUrl={meta.image} size="compact">
          <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="flex flex-col gap-3">
              <BandLabel colors={colors}>{[getSubjectInfo(slug[0])?.label ?? breadcrumbs[0]?.label, slug.length > 1 ? "Category" : "Subject"].filter(Boolean).join(" · ")}</BandLabel>
              <h1 className="m-0 font-heading text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.02em] text-[#fffbf4]">
                {meta.title}
              </h1>
              {meta.description && (
                <p className="m-0 font-heading text-lg leading-[1.5] text-[#fffbf4]/88 max-w-[640px]">{meta.description}</p>
              )}
            </div>
            <span className="font-body text-[13px] text-[#fffbf4]/75 whitespace-nowrap">
              {topics.length} {topics.length === 1 ? "topic" : "topics"} · reading order
            </span>
          </div>
        </PageBand>

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12 md:py-16 flex flex-col gap-6">
          {topics.length > 0 ? (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="m-0 font-heading text-2xl md:text-3xl font-bold text-navy-dark">Topics</h2>
                <span className="font-body text-[13px] text-muted">Sorted by reading order</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {topics.map((topic, i) => {
                  // CMS topics carry their own Hindi link; MDX topics use the file check.
                  const hindi = topic.hindiHref
                    ? { href: topic.hindiHref, title: topic.hindiTitle }
                    : getHindiInfo(topic.slug);
                  return (
                    <ContentCard
                      key={topic.slug.join("/")}
                      title={topic.meta.title}
                      description={topic.meta.description}
                      label={`${meta.title} · ${String(i + 1).padStart(2, "0")}`}
                      href={`/${topic.slug.join("/")}`}
                      hoverBg={colors?.bg}
                      accent={colors?.accent}
                      image={topic.meta.image}
                      hindiHref={hindi?.href}
                      hindiTitle={hindi?.title}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="font-body text-lg text-muted">Topics coming soon. Check back later.</p>
            </div>
          )}
        </div>
      </>
    );
  }

  // NOTE: the Payload-first CMS lookup for articles used to live HERE. It moved
  // up to just after the CMS news block (see the comment there) — it has to run
  // before `if (!resolved) notFound()`, or CMS-only articles 404 before the
  // database is ever consulted. Anything reaching this point has an MDX file
  // and no CMS entry, so it renders from MDX exactly as before.

  // ── TOPIC PAGE (actual article) ────────────────────────────────────────────
  // Build ONE import path (always ending in ".mdx") covering all four shapes:
  //   history/x            (English topic)
  //   history/x.hi         (Hindi topic)
  //   history/overview     (English overview)
  //   history/overview.hi  (Hindi overview)
  // A single dynamic import with a static ".mdx" suffix lets Turbopack build one
  // module context over all .mdx files (a four-pattern version fails when one
  // pattern, e.g. overview.hi.mdx, matches no files yet).
  const contentPath = contentSlug.join("/");
  let innerPath = resolved!.isOverview ? `${contentPath}/overview` : contentPath;
  if (lang === "hi") innerPath += ".hi";

  const mdxMod = await import(`@/content/${innerPath}.mdx`).catch(() => null);

  // If the MDX file couldn't be loaded, show 404
  if (!mdxMod?.default) notFound();

  // Cast to React.ComponentType — TypeScript now knows it's defined
  const ContentComponent = mdxMod!.default as React.ComponentType;

  // Gather all the data the topic page needs (from the resolved language file)
  const headings = extractHeadings(resolved!.filePath);          // Table of Contents
  const readingTime = calculateReadingTime(resolved!.filePath);  // "8 min read"

  // Prev/Next and Related are computed on the content (English) topic list, then
  // "localized": on a Hindi page, link to the Hindi version of each when it
  // exists (with its Hindi title), otherwise fall back to the English version.
  function localize(
    items: { slug: string[]; meta: typeof meta }[]
  ): { slug: string[]; meta: typeof meta }[] {
    if (lang === "en") return items;
    return items.map((it) => {
      if (hasTranslation(it.slug, "hi")) {
        const hi = resolveContentFile(it.slug, "hi");
        return {
          slug: ["hi", ...it.slug],
          meta: hi ? getContentMeta(hi.filePath) : it.meta,
        };
      }
      return it;
    });
  }

  const adjacent = getAdjacentTopics(contentSlug);
  const previous = adjacent.previous ? localize([adjacent.previous])[0] : null;
  const next = adjacent.next ? localize([adjacent.next])[0] : null;
  const relatedTopics = localize(getRelatedTopics(contentSlug));

  // Language-toggle links — present only when the other version exists
  const enHref = hasTranslation(contentSlug, "en") ? "/" + contentSlug.join("/") : undefined;
  const hiHref = hasTranslation(contentSlug, "hi") ? "/hi/" + contentSlug.join("/") : undefined;

  // Pretty subject label for the meta bar (e.g. "history" → "History")
  const subjectLabel = contentSlug[0]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // ── NEWS ITEM ──────────────────────────────────────────────────────────────
  // News items live under content/news/... and use the lighter NewsArticleView
  // layout instead of the heavy Topic layout. Everything else (bilingual,
  // sitemap, search, static generation) is shared with topics.
  if (contentSlug[0] === "news") {
    const currentUrl = "/" + slug.join("/");
    const recent = getRecentNews(4)
      .filter((n) => n.url !== "/" + contentSlug.join("/"))
      .slice(0, 3);

    // Extract headings for the Table of Contents sidebar.
    // Uses the same extractHeadings() function as topic pages.
    const newsHeadings = extractHeadings(resolved!.filePath);

    return (
      <NewsArticleView
        meta={meta}
        lang={lang}
        url={currentUrl}
        enHref={enHref}
        hiHref={hiHref}
        readingTime={readingTime}
        recent={recent}
        headings={newsHeadings}
      >
        <ContentComponent />
      </NewsArticleView>
    );
  }

  // Category label for the band, e.g. "Modern India" (second URL segment,
  // pretty-printed the same way as the subject).
  const categoryLabel =
    contentSlug.length > 2
      ? contentSlug[1].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : "";

  // Structured data for this topic — an Article plus its breadcrumb trail.
  // This helps Google show rich results and helps AI engines cite the page.
  const topicUrl = absoluteUrl("/" + slug.join("/"));
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    ...(meta.image ? { image: absoluteUrl(meta.image) } : {}),
    ...(meta.date ? { dateModified: meta.date, datePublished: meta.date } : {}),
    mainEntityOfPage: topicUrl,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: b.label,
        item: absoluteUrl(b.href),
      })),
    ],
  };

  // REDESIGN 16 Sep 2026: the page is built from the two shared article pieces
  // (ArticleBand + ArticleLayout) that the CMS topic view and the news page also
  // use, so every article on the site has one look. The old per-page banner,
  // subject-tinted page background and duplicated column layout are gone.
  return (
    <>
      {/* Structured data (invisible) — Article + breadcrumb trail for SEO/GEO */}
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <ArticleBand
        breadcrumbs={breadcrumbs}
        label={[subjectLabel, categoryLabel].filter(Boolean).join(" · ")}
        title={meta.title}
        summary={meta.description}
        metaItems={[readingTime, ...(meta.date ? [`Updated ${formatNewsDate(meta.date)}`] : [])]}
        coverUrl={meta.image}
        coverAlt={meta.imageCaption ?? meta.title}
        lang={lang}
        enHref={enHref}
        hiHref={hiHref}
        colors={colors}
      />

      <ArticleLayout
        colors={colors}
        // The cover, shown clean as the article's one illustration (the band
        // above shows the same image tinted — a deliberate echo).
        figure={
          meta.image && (
            <figure className="m-0 flex flex-col gap-2.5">
              <div className="relative aspect-[4/3] md:aspect-[16/10] w-full rounded-card border border-hairline overflow-hidden bg-surface-low">
                <Image
                  src={meta.image}
                  alt={meta.imageCaption ?? meta.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                />
              </div>
              {meta.imageCaption && (
                <figcaption className="font-body text-[13px] text-muted">{meta.imageCaption}</figcaption>
              )}
            </figure>
          )
        }
        // Previous / Next navigation stays inside the reading column
        after={<TopicNav previous={previous} next={next} />}
        sidebar={
          <>
            <TableOfContents headings={headings} />
            {meta.quickFacts && <QuickFacts facts={meta.quickFacts} />}
          </>
        }
        // Related topics run full-width under both columns
        below={
          relatedTopics.length > 0 && (
            <section className="mt-16">
              <h2 className="font-heading text-2xl font-semibold text-navy-dark mb-5">
                Related Topics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedTopics.map((topic) => {
                  const hindi = getHindiInfo(topic.slug);
                  return (
                    <ContentCard
                      key={topic.slug.join("/")}
                      title={topic.meta.title}
                      href={`/${topic.slug.join("/")}`}
                      hoverBg={colors?.bg}
                      accent={colors?.accent}
                      image={topic.meta.image}
                      hindiHref={hindi?.href}
                      hindiTitle={hindi?.title}
                    />
                  );
                })}
              </div>
            </section>
          )
        }
      >
        {/* The article content (rendered from MDX, styled via mdx-components.tsx).
            For Hindi, `lang="hi"` + the font-hindi class apply the Devanagari font. */}
        <article lang={lang} className={`prose ${lang === "hi" ? "font-hindi" : ""}`}>
          <ContentComponent />
        </article>
      </ArticleLayout>
    </>
  );
}
