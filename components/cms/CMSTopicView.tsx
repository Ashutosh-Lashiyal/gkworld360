// CMSTopicView — the visual layout for a topic/article that comes from the
// Payload CMS (rather than an MDX file). This is what you SEE when a CMS
// article renders.
//
// REDESIGN 16 Sep 2026: the layout now comes from two shared pieces —
// ArticleBand (the tinted header) and ArticleLayout (reading column + sidebar)
// — which the MDX topic page and the news page use too. So this file only has
// to turn CMS data into the props those pieces expect; the look lives in one
// place and every article on the site matches.
import Image from "next/image";
import ArticleBand from "@/components/ArticleBand";
import ArticleLayout from "@/components/ArticleLayout";
import TableOfContents from "@/components/TableOfContents";
import CMSRichText from "@/components/cms/CMSRichText";
import {
  type CMSArticle,
  type CMSLocale,
  estimateReadingTime,
  extractHeadingsFromLexical,
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
  const coverUrl = article.coverImage?.url ?? undefined;
  const coverAlt = article.coverImage?.alt ?? article.title;
  const readingTime = estimateReadingTime(article.body);
  // Show the published date if set, otherwise the last-updated date.
  const dateStr = article.publishedDate ?? article.updatedAt ?? null;
  // The h2/h3 headings, used to build the Contents sidebar.
  const headings = extractHeadingsFromLexical(article.body);

  return (
    <>
      <ArticleBand
        breadcrumbs={breadcrumbs}
        label={[subjectLabel, categoryLabel].filter(Boolean).join(" · ")}
        title={article.title}
        summary={article.description ?? undefined}
        metaItems={[readingTime, ...(dateStr ? [`Updated ${formatNewsDate(dateStr)}`] : [])]}
        coverUrl={coverUrl}
        coverAlt={coverAlt}
        lang={lang}
        enHref={enHref}
        hiHref={hiHref}
        colors={colors}
      />

      <ArticleLayout
        colors={colors}
        // The cover, shown clean (untinted) as the article's one illustration.
        // The same image sits tinted behind the band above — a deliberate echo.
        figure={
          coverUrl && (
            <figure className="m-0 flex flex-col gap-2.5">
              <div className="relative aspect-[4/3] md:aspect-[16/10] w-full rounded-card border border-hairline overflow-hidden bg-surface-low">
                <Image
                  src={coverUrl}
                  alt={coverAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                />
              </div>
              {article.coverImage?.alt && (
                <figcaption className="font-body text-[13px] text-muted">{article.coverImage.alt}</figcaption>
              )}
            </figure>
          )
        }
        sidebar={headings.length >= 2 ? <TableOfContents headings={headings} /> : undefined}
      >
        {/* The article body, rendered from the CMS. `prose` gives it the site's
            article typography. For Hindi, `lang="hi"` tells the browser the
            language (screen readers, hyphenation) and `font-hindi` applies the
            Devanagari font. */}
        <article lang={lang} className={`prose ${lang === "hi" ? "font-hindi" : ""}`}>
          <CMSRichText data={article.body} />
        </article>
      </ArticleLayout>
    </>
  );
}
