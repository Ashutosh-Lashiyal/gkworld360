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
import OnTheMap from "@/components/atlas/OnTheMap";
import { PAGE_TEXT } from "@/lib/page-text";

export default function CMSTopicView({
  article,
  breadcrumbs,
  colors,
  lang = "en",
  enHref,
  hiHref,
  label,
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
  // The subject pill's words, e.g. "इतिहास · आधुनिक भारत". The Hindi page passes
  // it (3 Nov 2026): the CMS has no Hindi SUBJECT names, so article.subject.name
  // would say "History" on a Hindi page. Left out → the CMS names, as before.
  label?: string;
}) {
  const hi = lang === "hi";
  const w = PAGE_TEXT[lang].article;
  const subjectLabel = article.subject?.name ?? "";
  const categoryLabel = article.category?.name ?? "";
  // "8 min read" / "8 मिनट में पढ़ें" (owner's word list A2, 3 Nov 2026):
  // estimateReadingTime gives "8 min read" — we keep only the number
  const minutes = estimateReadingTime(article.body).match(/\d+/)?.[0] ?? "1";
  const readingTime = w.minutes(minutes);
  // Show the published date if set, otherwise the last-updated date.
  const dateStr = article.publishedDate ?? article.updatedAt ?? null;
  // THE COVER'S CAPTION: the picture's words live on the picture itself in
  // /admin → Media, which has ONE language (English). On a Hindi page they'd
  // be English under a Hindi title, so the Hindi page shows no caption and
  // describes the picture with the Hindi title instead (3 Nov 2026).
  const coverWords = hi ? undefined : article.coverImage?.alt ?? undefined;
  // Key Takeaways come out of the body and go to the top.
  const { points, body } = splitKeyTakeaways(article.body);
  // The h2/h3 headings, for the Contents rail.
  const headings = extractHeadingsFromLexical(body);

  return (
    <ArticleLayout
      colors={colors}
      lang={lang}
      header={
        <ArticleHeader
          breadcrumbs={breadcrumbs}
          label={label ?? [subjectLabel, categoryLabel].filter(Boolean).join(" · ")}
          title={article.title}
          summary={article.description ?? undefined}
          metaItems={[readingTime, ...(dateStr ? [w.published(formatNewsDate(dateStr, lang))] : [])]}
          coverUrl={article.coverImage?.url ?? undefined}
          coverAlt={coverWords ?? article.title}
          coverCaption={coverWords}
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

      {/* "On the map" — this article's places on the World360 Atlas, if it has
          any (29 Oct 2026). Draws nothing for articles with no Atlas entries. */}
      {enHref && <OnTheMap articlePath={enHref} lang={lang} />}
    </ArticleLayout>
  );
}
