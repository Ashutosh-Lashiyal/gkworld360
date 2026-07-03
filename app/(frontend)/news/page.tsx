// The /news listing page — shows all news items, newest first.
// (Individual news items are served by the catch-all route, which renders the
// NewsArticleView layout for any path under /news/.)

import type { Metadata } from "next";
import NewsCard from "@/components/NewsCard";
import { getAllNews } from "@/lib/news";
import { hasTranslation, resolveContentFile, getContentMeta } from "@/lib/content";

export const metadata: Metadata = {
  title: "News & Current Affairs",
  description:
    "Latest news and current affairs for competitive exams — national, international, economy, sports and more, rewritten clearly and concisely.",
};

export default function NewsListingPage() {
  const news = getAllNews();

  // Pre-compute Hindi info outside the JSX to keep the map clean
  const newsWithHindi = news.map((item) => {
    const hindiResolved = hasTranslation(item.slug, "hi")
      ? resolveContentFile(item.slug, "hi")
      : null;
    return {
      ...item,
      hindiHref: hindiResolved ? "/hi/" + item.slug.join("/") : undefined,
      hindiTitle: hindiResolved
        ? getContentMeta(hindiResolved.filePath).title
        : undefined,
    };
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-navy">News &amp; Current Affairs</h1>
        <p className="font-body text-lg text-muted mt-3 max-w-2xl">
          The latest current affairs for competitive exams — clear, concise, and updated regularly.
        </p>
      </div>

      {news.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsWithHindi.map((item) => (
            <NewsCard
              key={item.url}
              url={item.url}
              meta={item.meta}
              hindiHref={item.hindiHref}
              hindiTitle={item.hindiTitle}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="font-body text-lg text-muted">No news published yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
