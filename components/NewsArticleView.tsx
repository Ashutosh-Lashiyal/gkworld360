// NewsArticleView — layout for a single news article (MDX or CMS — CMSNewsView
// feeds this same component). Band on top, reading column + sticky sidebar
// below; the sidebar's Contents list appears only when there are 2+ headings.

import Link from "next/link";
import Image from "next/image";
import ArticleBand from "@/components/ArticleBand";
import ArticleLayout from "@/components/ArticleLayout";
import { getSubjectColors } from "@/lib/subject-colors";
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

  // News uses the Current Affairs signal colours (rust) on its band.
  const colors = getSubjectColors("current-affairs");

  // REDESIGN 16 Sep 2026: built from the shared ArticleBand + ArticleLayout so a
  // current-affairs write-up looks like every other article on the site.
  return (
    <>
      <JsonLd data={newsJsonLd} />

      <ArticleBand
        breadcrumbs={breadcrumbs}
        label={["Current Affairs", meta.category].filter(Boolean).join(" · ")}
        title={meta.title}
        summary={meta.description}
        metaItems={[...(meta.date ? [formatNewsDate(meta.date)] : []), readingTime]}
        coverUrl={meta.image}
        coverAlt={meta.imageCaption ?? meta.title}
        lang={lang}
        enHref={enHref}
        hiHref={hiHref}
        colors={colors}
      />

      <ArticleLayout
        colors={colors}
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
        sidebar={showSidebar ? <TableOfContents headings={headings} /> : undefined}
        below={
          recent.length > 0 && (
            <section className="mt-16">
              <div className="flex items-end justify-between mb-6">
                <h2 className="font-heading text-2xl font-semibold text-navy-dark">More Current Affairs</h2>
                <Link href="/news" className="font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark transition-colors">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recent.map((item) => (
                  <NewsCard key={item.url} url={item.url} meta={item.meta} />
                ))}
              </div>
            </section>
          )
        }
      >
        <article lang={lang} className={`prose ${lang === "hi" ? "font-hindi" : ""}`}>
          {children}
        </article>
      </ArticleLayout>
    </>
  );
}
