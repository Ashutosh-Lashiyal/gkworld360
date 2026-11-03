// NewsArticleView — layout for a single news article (MDX or CMS — CMSNewsView
// feeds this same component). Band on top, reading column + sticky sidebar
// below; the sidebar's Contents list appears only when there are 2+ headings.
//
// HINDI (3 Nov 2026, the whole site in Hindi, phase 4): on /hi/news/<slug> the
// breadcrumb ("समसामयिकी" → /hi/news), the small label, the date ("17 सितंबर
// 2026") and "और समसामयिकी" are in Hindi (lib/page-text.ts, news). The cover
// picture's caption is English-only in /admin for now, so a Hindi page leaves
// it out (same as Hindi articles since phase 3).

import Link from "next/link";
import ArticleHeader from "@/components/ArticleHeader";
import KeyTakeaways from "@/components/KeyTakeaways";
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
import { PAGE_TEXT } from "@/lib/page-text";
import { localHref } from "@/lib/site-text";

type NewsArticleViewProps = {
  meta: ContentMeta;
  lang: "en" | "hi";
  url: string;
  enHref?: string;
  hiHref?: string;
  readingTime: string;
  recent: NewsItem[];
  headings: TocHeading[];      // extracted from the article for the Contents rail
  takeaways?: string[];        // Key Takeaways pulled out of a CMS body, shown first
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
  takeaways,
  children,
}: NewsArticleViewProps) {
  const t = PAGE_TEXT[lang].news;
  const hi = lang === "hi";
  const breadcrumbs = [
    { label: t.crumb, href: localHref(lang, "/news") },
    { label: meta.title, href: url },
  ];
  // English only in /admin, so a Hindi page doesn't show it (see the top note)
  const caption = hi ? undefined : meta.imageCaption;

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

  // News uses the Current Affairs signal colours (rust).
  const colors = getSubjectColors("current-affairs");

  // EDITORIAL LAYOUT, 17 Sep 2026: built from the shared ArticleHeader +
  // ArticleLayout so a current-affairs write-up looks like every other article.
  return (
    <>
      <JsonLd data={newsJsonLd} />

      <ArticleLayout
        colors={colors}
        lang={lang}
        header={
          <ArticleHeader
            breadcrumbs={breadcrumbs}
            label={[t.crumb, meta.category].filter(Boolean).join(" · ")}
            title={meta.title}
            summary={meta.description}
            metaItems={[...(meta.date ? [formatNewsDate(meta.date, lang)] : []), readingTime]}
            coverUrl={meta.image}
            coverAlt={caption ?? meta.title}
            coverCaption={caption}
            lang={lang}
            enHref={enHref}
            hiHref={hiHref}
            colors={colors}
            shareUrl={url}
            shareText={meta.description}
          />
        }
        above={takeaways && takeaways.length > 0 ? <KeyTakeaways points={takeaways} first lang={lang} /> : undefined}
        rail={showSidebar ? <TableOfContents headings={headings} lang={lang} /> : undefined}
        below={
          recent.length > 0 && (
            <section className="mt-16">
              <div className="flex items-end justify-between mb-6">
                <h2 className="m-0 font-display text-4xl md:text-5xl leading-none uppercase text-foreground">{t.more}</h2>
                <Link href={localHref(lang, "/news")} className="font-body text-sm font-extrabold text-accent hover:underline underline-offset-4">
                  {t.viewAll}
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recent.map((item) => (
                  <NewsCard key={item.url} url={item.url} meta={item.meta} lang={lang} />
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
