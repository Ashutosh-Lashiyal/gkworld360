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
import LanguageToggle from "@/components/LanguageToggle";
import Breadcrumb from "@/components/Breadcrumb";
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
import { getCMSArticle, getCMSNews } from "@/lib/cms";
import CMSTopicView from "@/components/cms/CMSTopicView";
import CMSNewsView from "@/components/cms/CMSNewsView";

// ── GENERATE STATIC PARAMS ────────────────────────────────────────────────────
// Tells Next.js every URL that exists so pages are pre-built at deploy time.
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── SEO METADATA ──────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const filePath = slugToFilePath(slug);
  if (!filePath) return {};

  const meta = getContentMeta(filePath);
  const url = absoluteUrl("/" + slug.join("/"));
  // Use the topic's banner image for the social-media preview, if it has one
  const ogImages = meta.image ? [{ url: meta.image }] : undefined;

  // Work out the language and build hreflang links to the other-language version
  // (if it exists), so Google understands they're the same article in two languages.
  const { contentSlug } = parseLangSlug(slug);
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
  if (contentSlug[0] === "news" && contentSlug.length === 2 && lang === "en") {
    const cmsNews = await getCMSNews(contentSlug[1]);
    if (cmsNews) {
      return <CMSNewsView news={cmsNews} />;
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
  if (pageType === "subject") {
    const categories = getCategoriesInSubject(slug[0]);
    const looseTopics = categories.length === 0 ? getTopicsInSubject(slug[0]) : [];

    return (
      <div className="w-full min-h-screen transition-colors duration-300" style={colors ? { backgroundColor: colors.bg } : undefined}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
          <Breadcrumb items={breadcrumbs} />

          {/* Subject header */}
          <div className="mb-10">
            <h1 className="font-heading text-4xl font-bold leading-tight" style={colors ? { color: colors.accent } : undefined}>
              {meta.title}
            </h1>
            {meta.description && (
              <p className="font-body text-lg text-muted mt-3 max-w-2xl">
                {meta.description}
              </p>
            )}
            {colors && <div className="mt-5 h-[3px] w-14 rounded-full" style={{ backgroundColor: colors.border }} />}
          </div>

          {categories.length > 0 ? (
            // This subject has categories → show category cards
            <>
              <h2 className="font-heading text-xl font-semibold text-navy mb-5">
                Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const catSlug = [slug[0], cat.slug];
                  const hindi = getHindiInfo(catSlug);
                  return (
                    <ContentCard
                      key={cat.slug}
                      title={cat.meta.title}
                      description={cat.meta.description}
                      href={`/${slug[0]}/${cat.slug}`}
                      hoverBg={colors?.bg}
                      hindiHref={hindi?.href}
                      hindiTitle={hindi?.title}
                    />
                  );
                })}
              </div>
            </>
          ) : looseTopics.length > 0 ? (
            // No categories, but topics exist directly under the subject → show topics
            <>
              <h2 className="font-heading text-xl font-semibold text-navy mb-5">
                Topics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {looseTopics.map((topic) => {
                  const hindi = getHindiInfo(topic.slug);
                  return (
                    <ContentCard
                      key={topic.slug.join("/")}
                      title={topic.meta.title}
                      description={topic.meta.description}
                      href={`/${topic.slug.join("/")}`}
                      hoverBg={colors?.bg}
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
              <p className="font-body text-lg text-muted">
                Topics coming soon. Check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CATEGORY PAGE (folder with topic files, no sub-folders) ───────────────
  if (pageType === "category") {
    // Could be a subject with no categories, or an actual category inside a subject
    const topics =
      slug.length === 1
        ? getTopicsInSubject(slug[0])           // subject with no categories
        : getTopicsInCategory(slug[0], slug[1]); // category inside a subject

    return (
      <div className="w-full min-h-screen transition-colors duration-300" style={colors ? { backgroundColor: colors.bg } : undefined}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
          <Breadcrumb items={breadcrumbs} />

          {/* Category/subject header */}
          <div className="mb-10">
            <h1 className="font-heading text-4xl font-bold leading-tight" style={colors ? { color: colors.accent } : undefined}>
              {meta.title}
            </h1>
            {meta.description && (
              <p className="font-body text-lg text-muted mt-3 max-w-2xl">
                {meta.description}
              </p>
            )}
            {colors && <div className="mt-5 h-[3px] w-14 rounded-full" style={{ backgroundColor: colors.border }} />}
          </div>

          {/* Topic list */}
          {topics.length > 0 ? (
            <>
              <h2 className="font-heading text-xl font-semibold text-navy mb-5">
                Topics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map((topic) => {
                  const hindi = getHindiInfo(topic.slug);
                  return (
                    <ContentCard
                      key={topic.slug.join("/")}
                      title={topic.meta.title}
                      description={topic.meta.description}
                      href={`/${topic.slug.join("/")}`}
                      hoverBg={colors?.bg}
                      hindiHref={hindi?.href}
                      hindiTitle={hindi?.title}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="font-body text-lg text-muted">
                Topics coming soon. Check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── PAYLOAD-FIRST (CMS migration) ──────────────────────────────────────────
  // If this topic exists in the Payload CMS, render it from the database instead
  // of the MDX file. Topics not yet migrated simply fall through to the MDX
  // rendering below — so migrating happens one article at a time, safely.
  // (News and Hindi stay on MDX for now; this first slice covers English topics.)
  if (contentSlug[0] !== "news" && lang === "en") {
    const cmsArticle = await getCMSArticle(contentSlug);
    if (cmsArticle) {
      return (
        <CMSTopicView
          article={cmsArticle}
          breadcrumbs={breadcrumbs}
          colors={colors}
        />
      );
    }
  }

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

  // Meta bar items reused in both the banner and the plain header
  const metaBar = (light: boolean) => (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span
        className={`font-body text-xs font-semibold uppercase tracking-wider ${
          light ? "text-on-dark" : "text-sapphire"
        }`}
      >
        {subjectLabel}
      </span>
      <span className={light ? "text-on-dark/50" : "text-muted opacity-40"}>·</span>
      <span className={`font-body text-sm ${light ? "text-on-dark/80" : "text-muted"}`}>
        {readingTime}
      </span>
      {meta.date && (
        <>
          <span className={light ? "text-on-dark/50" : "text-muted opacity-40"}>·</span>
          <span className={`font-body text-sm ${light ? "text-on-dark/80" : "text-muted"}`}>
            Updated {formatNewsDate(meta.date)}
          </span>
        </>
      )}
    </div>
  );

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

  return (
    <div className="w-full min-h-screen transition-colors duration-300" style={colors ? { backgroundColor: colors.bg } : undefined}>
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">

      {/* Structured data (invisible) — Article + breadcrumb trail for SEO/GEO */}
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      {/* ── HEADER ─────────────────────────────────────────────────────────────
          If the topic has a banner image, show a big hero banner with the title,
          breadcrumb, and meta bar overlaid on top of it (with a dark gradient
          overlay for readability). If there is no image, fall back to a clean
          text header inside the reading column further below.                    */}
      {meta.image ? (
        <section className="relative w-full h-[320px] md:h-[420px] rounded-card overflow-hidden mb-10">
          {/* The banner image fills the whole section */}
          <Image
            src={meta.image}
            alt={meta.imageCaption ?? meta.title}
            fill
            priority   // this is the largest image on the page — load it first (good for LCP)
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />

          {/* Dark gradient overlay — darker at the bottom so the white text on
              top of the image stays readable regardless of the photo.
              A flat dark tint is layered under the gradient for extra contrast. */}
          <div className="absolute inset-0 bg-navy-dark/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/70 to-navy-dark/30" />

          {/* Overlaid content, anchored to the bottom-left of the banner */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
            <Breadcrumb items={breadcrumbs} tone="light" />
            <h1
              className={`text-3xl md:text-5xl font-bold text-on-dark leading-tight max-w-3xl ${
                lang === "hi" ? "font-hindi" : "font-heading"
              }`}
              lang={lang}
            >
              {meta.title}
            </h1>
            <div className="mt-4">{metaBar(true)}</div>
          </div>
        </section>
      ) : (
        // No banner image — plain breadcrumb on the light page background
        <Breadcrumb items={breadcrumbs} />
      )}

      {/* TWO-COLUMN LAYOUT:
          - Main reading column (left, max 720px)
          - Sticky sidebar (right, ~280px) — only on large screens (lg+)
          On tablet/mobile the sidebar drops below the article.                   */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── MAIN READING COLUMN ──────────────────────────────────────────────*/}
        <div className="min-w-0 flex-1 max-w-[720px]">

          {/* Plain text header — only shown when there is NO banner image
              (when there is a banner, the title + meta are already on it). */}
          {!meta.image && (
            <>
              <h1
                className="font-heading text-4xl font-bold leading-tight"
                lang={lang}
                style={colors ? { color: colors.accent } : undefined}
              >
                {meta.title}
              </h1>
              {colors && <div className="mt-4 h-[3px] w-14 rounded-full" style={{ backgroundColor: colors.border }} />}
              <div className="mt-4 mb-8">{metaBar(false)}</div>
            </>
          )}

          {/* Language toggle (English | हिन्दी) — only appears when both versions exist */}
          <div className="mb-6">
            <LanguageToggle current={lang} enHref={enHref} hiHref={hiHref} />
          </div>

          {/* The article content (rendered from MDX, styled via mdx-components.tsx).
              For Hindi, `lang="hi"` + the font-hindi class apply the Devanagari font. */}
          <article lang={lang} className={`prose ${lang === "hi" ? "font-hindi" : ""}`}>
            <ContentComponent />
          </article>

          {/* Previous / Next navigation */}
          <TopicNav previous={previous} next={next} />

          {/* Related Topics */}
          {relatedTopics.length > 0 && (
            <section className="mt-12">
              <h2 className="font-heading text-2xl font-semibold text-navy mb-5">
                Related Topics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedTopics.map((topic) => {
                  const hindi = getHindiInfo(topic.slug);
                  return (
                    <ContentCard
                      key={topic.slug.join("/")}
                      title={topic.meta.title}
                      href={`/${topic.slug.join("/")}`}
                      hoverBg={colors?.bg}
                      hindiHref={hindi?.href}
                      hindiTitle={hindi?.title}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ── STICKY SIDEBAR ───────────────────────────────────────────────────
            Hidden on mobile/tablet, visible on large screens.
            `sticky top-32` keeps it visible as the user scrolls (128px clears the
            taller header after the logo was enlarged). `self-start` is required
            for sticky to work in flex.                                            */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="sticky top-32 flex flex-col gap-5">
            <TableOfContents headings={headings} />
            {meta.quickFacts && <QuickFacts facts={meta.quickFacts} />}
          </div>
        </aside>
      </div>
    </div>
    </div>
  );
}
