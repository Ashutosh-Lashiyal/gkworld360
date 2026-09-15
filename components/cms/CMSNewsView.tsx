// CMSNewsView — renders a news item that comes from the Payload CMS.
// It reuses the existing NewsArticleView layout (the two-column news page with
// the Table of Contents sidebar), just feeding it data from the CMS instead of
// from an MDX file. So CMS news looks identical to the old MDX news.
import NewsArticleView from "@/components/NewsArticleView";
import CMSRichText from "@/components/cms/CMSRichText";
import {
  type CMSNews,
  type CMSLocale,
  estimateReadingTime,
  extractHeadingsFromLexical,
} from "@/lib/cms";
import type { ContentMeta } from "@/lib/content";

export default function CMSNewsView({
  news,
  lang = "en",
  enHref,
  hiHref,
}: {
  news: CMSNews;
  // Which language this page shows. NewsArticleView already knows how to render
  // Hindi (font + lang attribute) and how to draw the English|हिन्दी toggle —
  // this wrapper used to hard-code "en" and pass no links, so CMS news could
  // never appear in Hindi and never showed the toggle. Fixed 15 Sep 2026.
  lang?: CMSLocale;
  enHref?: string;
  hiHref?: string;
}) {
  // NewsArticleView expects a `meta` object (the same shape MDX frontmatter
  // produces). We build one from the CMS fields so we can reuse that component.
  const meta = {
    title: news.title,
    description: news.description ?? "",
    category: news.category ?? undefined,
    date: news.eventDate ?? undefined,
    image: news.coverImage?.url ?? undefined,
    imageWidth: news.coverImage?.width ?? undefined,
    imageHeight: news.coverImage?.height ?? undefined,
    imageCaption: news.coverImageCaption ?? undefined,
  } as ContentMeta;

  return (
    <NewsArticleView
      meta={meta}
      lang={lang}
      enHref={enHref}
      hiHref={hiHref}
      url={lang === "hi" ? `/hi/news/${news.slug}` : `/news/${news.slug}`}
      readingTime={estimateReadingTime(news.body)}
      recent={[]} // "More News" list — left empty for now (wired up later)
      headings={extractHeadingsFromLexical(news.body)}
    >
      {/* The article body, rendered from the CMS's Lexical JSON */}
      <CMSRichText data={news.body} />
    </NewsArticleView>
  );
}
