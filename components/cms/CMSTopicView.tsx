// CMSTopicView — the visual layout for a topic/article that comes from the
// Payload CMS (rather than an MDX file). It mirrors the MDX topic page's look:
// a banner with the title on top (if there's a cover image), then the article
// body in a reading column. This is what you SEE when a CMS article renders.
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import TableOfContents from "@/components/TableOfContents";
import CMSRichText from "@/components/cms/CMSRichText";
import {
  type CMSArticle,
  estimateReadingTime,
  extractHeadingsFromLexical,
} from "@/lib/cms";
import type { SubjectColors } from "@/lib/subject-colors";
import { formatNewsDate } from "@/lib/date-utils";

export default function CMSTopicView({
  article,
  breadcrumbs,
  colors,
}: {
  article: CMSArticle;
  breadcrumbs: { label: string; href: string }[];
  colors: SubjectColors | null;
}) {
  const subjectLabel = article.subject?.name ?? "";
  const coverUrl = article.coverImage?.url ?? undefined;
  const readingTime = estimateReadingTime(article.body);
  // Show the published date if set, otherwise the last-updated date.
  const dateStr = article.publishedDate ?? article.updatedAt ?? null;
  // The h2/h3 headings, used to build the Table of Contents sidebar.
  const headings = extractHeadingsFromLexical(article.body);

  // The meta line (SUBJECT · N min read · Updated date). `light` = white text,
  // used when it sits on top of the dark banner image.
  const metaBar = (light: boolean) => (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span
        className={`font-body text-xs font-semibold uppercase tracking-wider ${
          light ? "text-on-dark" : "text-sapphire"
        }`}
      >
        {subjectLabel}
      </span>
      <span className={light ? "text-on-dark/50" : "text-muted opacity-40"}>·</span>
      <span className={`font-body text-sm ${light ? "text-on-dark/80" : "text-muted"}`}>
        {readingTime}
      </span>
      {dateStr && (
        <>
          <span className={light ? "text-on-dark/50" : "text-muted opacity-40"}>·</span>
          <span className={`font-body text-sm ${light ? "text-on-dark/80" : "text-muted"}`}>
            Updated {formatNewsDate(dateStr)}
          </span>
        </>
      )}
    </div>
  );

  return (
    // The whole page tints to the subject's background colour (like MDX pages).
    <div
      className="w-full min-h-screen transition-colors duration-300"
      style={colors ? { backgroundColor: colors.bg } : undefined}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">
        {coverUrl ? (
          // ── Banner with the title overlaid (when there's a cover image) ──
          <section className="relative w-full h-[320px] md:h-[420px] rounded-card overflow-hidden mb-10">
            <Image
              src={coverUrl}
              alt={article.coverImage?.alt ?? article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            {/* Dark overlay so white text stays readable over any photo */}
            <div className="absolute inset-0 bg-navy-dark/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/70 to-navy-dark/30" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <Breadcrumb items={breadcrumbs} tone="light" />
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-on-dark leading-tight max-w-3xl">
                {article.title}
              </h1>
              <div className="mt-4">{metaBar(true)}</div>
            </div>
          </section>
        ) : (
          // No cover image — plain breadcrumb on the tinted background
          <Breadcrumb items={breadcrumbs} />
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="min-w-0 flex-1 max-w-[720px]">
            {/* Plain text header only when there's NO banner */}
            {!coverUrl && (
              <>
                <h1
                  className="font-heading text-4xl font-bold leading-tight"
                  style={colors ? { color: colors.accent } : undefined}
                >
                  {article.title}
                </h1>
                {colors && (
                  <div
                    className="mt-4 h-[3px] w-14 rounded-full"
                    style={{ backgroundColor: colors.border }}
                  />
                )}
                <div className="mt-4 mb-8">{metaBar(false)}</div>
              </>
            )}

            {/* The article body, rendered from the CMS. `prose` gives it the
                same typography as the MDX articles. */}
            <article className="prose mt-6">
              <CMSRichText data={article.body} />
            </article>
          </div>

          {/* ── STICKY SIDEBAR ───────────────────────────────────────────────
              Table of Contents — shown on large screens when there are at least
              2 headings. `sticky top-32` keeps it in view while scrolling
              (top-32 clears the sticky site header). */}
          {headings.length >= 2 && (
            <aside className="hidden lg:block w-[280px] flex-shrink-0">
              <div className="sticky top-32">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
