// NewsArticleView — the layout for a single news item. Lighter than a Topic
// page (no sticky sidebar / Quick Facts): a news item is timely, so the focus is
// the date, category, and a clean read. Includes the bilingual toggle and
// NewsArticle structured data.
//
// The actual article body (compiled MDX) is passed in as `children`.

import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import LanguageToggle from "@/components/LanguageToggle";
import JsonLd from "@/components/JsonLd";
import NewsCard from "@/components/NewsCard";
import { formatNewsDate, type NewsItem } from "@/lib/news";
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/site";
import type { ContentMeta } from "@/lib/content";

type NewsArticleViewProps = {
  meta: ContentMeta;
  lang: "en" | "hi";
  url: string;              // absolute-path URL of this item (e.g. /news/2026/06/slug)
  enHref?: string;
  hiHref?: string;
  readingTime: string;
  recent: NewsItem[];       // other recent news for the "More News" section
  children: React.ReactNode; // the compiled MDX article body
};

export default function NewsArticleView({
  meta,
  lang,
  url,
  enHref,
  hiHref,
  readingTime,
  recent,
  children,
}: NewsArticleViewProps) {
  const breadcrumbs = [
    { label: "News", href: "/news" },
    { label: meta.title, href: url },
  ];

  // NewsArticle structured data — tells Google/AI this is timely news.
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

      {/* Reading column — centred, comfortable width for a news read */}
      <div className="max-w-[760px] mx-auto">
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

        {/* Language toggle (only when both versions exist) */}
        <div className="mt-5">
          <LanguageToggle current={lang} enHref={enHref} hiHref={hiHref} />
        </div>

        {/* Banner image.
            If the real dimensions are known, render at the image's NATURAL shape
            (w-full h-auto) so nothing is cropped — important for wide infographics.
            Otherwise fall back to a 16:9 cover crop. */}
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

        {/* Article body (compiled MDX). Hindi gets the Devanagari font. */}
        <article lang={lang} className={`prose mt-8 ${lang === "hi" ? "font-hindi" : ""}`}>
          {children}
        </article>
      </div>

      {/* More News */}
      {recent.length > 0 && (
        <section className="mt-16 max-w-[1200px] mx-auto">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-heading text-2xl font-semibold text-navy">More News</h2>
            <Link href="/news" className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors">
              View all news →
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
