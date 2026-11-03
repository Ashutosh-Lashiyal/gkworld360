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
  splitKeyTakeaways,
} from "@/lib/cms";
import type { ContentMeta } from "@/lib/content";
import { PAGE_TEXT } from "@/lib/page-text";

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

  // Key Takeaways go to the top of the page (editorial layout, 17 Sep 2026)
  const { points, body } = splitKeyTakeaways(news.body);

  // "3 min read" / "3 मिनट में पढ़ें" (3 Nov 2026, phase 4). estimateReadingTime
  // gives the English sentence — we keep only the number, same as CMSTopicView.
  const minutes = estimateReadingTime(news.body).match(/\d+/)?.[0] ?? "1";
  const readingTime = PAGE_TEXT[lang].article.minutes(minutes);

  return (
    <NewsArticleView
      meta={meta}
      lang={lang}
      enHref={enHref}
      hiHref={hiHref}
      url={lang === "hi" ? `/hi/news/${news.slug}` : `/news/${news.slug}`}
      readingTime={readingTime}
      recent={[]} // "More News" list — left empty for now (wired up later)
      headings={extractHeadingsFromLexical(body)}
      takeaways={points}
    >
      {/* The article body, rendered from the CMS's Lexical JSON */}
      <CMSRichText data={body} />
    </NewsArticleView>
  );
}
