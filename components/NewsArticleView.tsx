// NewsArticleView — layout for a single news article.
// Two-column on desktop (article left, sticky sidebar right).
// Sidebar shows Table of Contents only when the article has 2+ headings.

import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import LanguageToggle from "@/components/LanguageToggle";
import TableOfContents from "@/components/TableOfContents";
import JsonLd from "@/components/JsonLd";
import NewsCard from "@/components/NewsCard";
import { type NewsItem } from "@/lib/news";
// formatNewsDate imported from date-utils (not lib/news) — lib/news pulls in
// Node.js fs via lib/content which cannot run in the browser.
import { formatNewsDate } from "@/lib/date-utils";
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/site";
import type { ContentMeta, TocHeading } from "@/lib/content";

type NewsArticleViewProps = {
  meta: ContentMeta;
  lang: "en" | "hi";
  url: string;
  enHref?: string;
  hiHref?: string;
  readingTime: string;
  recent: NewsItem[];
  headings: TocHeading[];      // extracted from the article for the sidebar TOC
  children: React.ReactNode;
};

export default function NewsArticleView({
  meta,
  lang,
  url,
  enHref,
  hiHref,
  readingTime,
  recent,
  headings,
  children,
}: NewsArticleViewProps) {
  const breadcrumbs = [
    { label: "Current Affairs", href: "/news" },
    { label: meta.title, href: url },
  ];

  // Only show the Table of Contents sidebar when there are at least 2 headings.
  // A single heading doesn't need a TOC — it adds no navigation value.
  const showSidebar = headings.length >= 2;

  const newsJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: meta.title,
    description: meta.description,
    ...(meta.image ? { image: absoluteUrl(meta.image) } : {}),
    ...(meta.date ? { datePublished: meta.date, dateModified: meta.date } : {}),
    mainEntityOfPage: absoluteUrl(url),
    articleSection: meta.category,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
      <JsonLd data={newsJsonLd} />

      {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────────────────────
          Main article on the left, sticky sidebar on the right (desktop only).
          On mobile/tablet the sidebar is hidden — no distractions.             */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── MAIN ARTICLE COLUMN ─────────────────────────────────────────── */}
        <div className="min-w-0 flex-1 max-w-[760px]">
          <Breadcrumb items={breadcrumbs} />

          {/* Category + date + reading time */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
            {meta.category && (
              <span className="font-body text-xs font-semibold text-sapphire uppercase tracking-wider">
                {meta.category}
              </span>
            )}
            {meta.date && (
              <>
                <span className="text-muted opacity-40">·</span>
                <span className="font-body text-sm text-muted">{formatNewsDate(meta.date)}</span>
              </>
            )}
            <span className="text-muted opacity-40">·</span>
            <span className="font-body text-sm text-muted">{readingTime}</span>
          </div>

          {/* Title */}
          <h1
            className={`text-3xl md:text-4xl font-bold text-navy leading-tight ${
              lang === "hi" ? "font-hindi" : "font-heading"
            }`}
            lang={lang}
          >
            {meta.title}
          </h1>

          {/* Language toggle */}
          <div className="mt-5">
            <LanguageToggle current={lang} enHref={enHref} hiHref={hiHref} />
          </div>

          {/* Banner image */}
          {meta.image && (
            <figure className="mt-6">
              {meta.imageWidth && meta.imageHeight ? (
                <Image
                  src={meta.image}
                  alt={meta.imageCaption ?? meta.title}
                  width={meta.imageWidth}
                  height={meta.imageHeight}
                  priority
                  className="w-full h-auto rounded-card border border-hairline"
                  sizes="(max-width: 760px) 100vw, 760px"
                />
              ) : (
                <div className="relative w-full aspect-video rounded-card overflow-hidden bg-surface-mid">
                  <Image
                    src={meta.image}
                    alt={meta.imageCaption ?? meta.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 760px) 100vw, 760px"
                  />
                </div>
              )}
              {meta.imageCaption && (
                <figcaption className="font-body text-sm text-muted italic mt-2 text-center">
                  {meta.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Article body */}
          <article lang={lang} className={`prose mt-8 ${lang === "hi" ? "font-hindi" : ""}`}>
            {children}
          </article>
        </div>

        {/* ── STICKY SIDEBAR ────────────────────────────────────────────────
            Only shown on large screens and only when there are 2+ headings.
            top-32 clears the sticky header (128px) with comfortable spacing. */}
        {showSidebar && (
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-32">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        )}
      </div>

      {/* More News */}
      {recent.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-heading text-2xl font-semibold text-navy">More Current Affairs</h2>
            <Link href="/news" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((item) => (
              <NewsCard key={item.url} url={item.url} meta={item.meta} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
