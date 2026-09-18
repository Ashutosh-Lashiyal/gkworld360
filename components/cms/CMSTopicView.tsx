// CMSTopicView — the visual layout for a topic/article that comes from the
// Payload CMS (rather than an MDX file). This is what you SEE when a CMS
// article renders.
//
// EDITORIAL LAYOUT, 17 Sep 2026 (board 10b): the layout comes from two shared
// pieces — ArticleHeader (centred title block on the page, no banner) and
// ArticleLayout (one centred reading column + a quiet Contents rail + the
// reading-progress bar). Key Takeaways are pulled OUT of the body and shown
// FIRST, so exam readers get the summary before the read. The MDX topic page
// and the news page use the same pieces, so every article looks the same.
import ArticleHeader from "@/components/ArticleHeader";
import ArticleLayout from "@/components/ArticleLayout";
import TableOfContents from "@/components/TableOfContents";
import KeyTakeaways from "@/components/KeyTakeaways";
import CMSRichText from "@/components/cms/CMSRichText";
import {
  type CMSArticle,
  type CMSLocale,
  estimateReadingTime,
  extractHeadingsFromLexical,
  splitKeyTakeaways,
} from "@/lib/cms";
import type { SubjectColors } from "@/lib/subject-colors";
import { formatNewsDate } from "@/lib/date-utils";

export default function CMSTopicView({
  article,
  breadcrumbs,
  colors,
  lang = "en",
  enHref,
  hiHref,
}: {
  article: CMSArticle;
  breadcrumbs: { label: string; href: string }[];
  colors: SubjectColors | null;
  // Which language this page is showing. Drives the Devanagari font for Hindi
  // and which button is solid in the toggle.
  lang?: CMSLocale;
  // Links to the two language versions. The toggle only renders when BOTH
  // exist, so an English-only article simply shows no toggle.
  enHref?: string;
  hiHref?: string;
}) {
  const subjectLabel = article.subject?.name ?? "";
  const categoryLabel = article.category?.name ?? "";
  // "2 min read" → "2 मिनट का पाठ" on the Hindi page
  const readingTimeEn = estimateReadingTime(article.body);
  const readingTime = lang === "hi" ? readingTimeEn.replace(/(\d+) min read/, "$1 मिनट का पाठ") : readingTimeEn;
  // Show the published date if set, otherwise the last-updated date.
  const dateStr = article.publishedDate ?? article.updatedAt ?? null;
  // Key Takeaways come out of the body and go to the top.
  const { points, body } = splitKeyTakeaways(article.body);
  // The h2/h3 headings, for the Contents rail.
  const headings = extractHeadingsFromLexical(body);

  return (
    <ArticleLayout
      colors={colors}
      header={
        <ArticleHeader
          breadcrumbs={breadcrumbs}
          label={[subjectLabel, categoryLabel].filter(Boolean).join(" · ")}
          title={article.title}
          summary={article.description ?? undefined}
          metaItems={[readingTime, ...(dateStr ? [`${lang === "hi" ? "प्रकाशित" : "Published"} ${formatNewsDate(dateStr)}`] : [])]}
          coverUrl={article.coverImage?.url ?? undefined}
          coverAlt={article.coverImage?.alt ?? article.title}
          coverCaption={article.coverImage?.alt ?? undefined}
          lang={lang}
          enHref={enHref}
          hiHref={hiHref}
          colors={colors}
          shareUrl={(lang === "hi" ? hiHref : enHref) ?? enHref}
          shareText={article.description ?? undefined}
        />
      }
      above={points.length > 0 ? <KeyTakeaways points={points} first lang={lang} /> : undefined}
      rail={headings.length >= 2 ? <TableOfContents headings={headings} lang={lang} /> : undefined}
    >
      {/* The article body, rendered from the CMS. `prose` gives it the site's
          article typography. For Hindi, `lang="hi"` tells the browser the
          language (screen readers, hyphenation) and `font-hindi` applies the
          Devanagari font. */}
      <article lang={lang} className={`prose ${lang === "hi" ? "font-hindi" : ""}`}>
        <CMSRichText data={body} />
      </article>
    </ArticleLayout>
  );
}
