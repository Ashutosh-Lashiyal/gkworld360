// The catch-all route — handles EVERY content page with one file.
// Detects what type of page is being requested and renders the correct layout:
//
//   /history                          → Subject page (shows category cards)
//   /history/modern-india             → Category page (shows topic cards)
//   /history/modern-india/revolt-1857 → Topic page (shows the article)
//   /human-body                       → Subject page with no categories (shows topics directly)

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import {
  getAllSlugs,
  slugToFilePath,
  getContentMeta,
  isOverviewFile,
  getPageType,
  getCategoriesInSubject,
  getTopicsInSubject,
  getTopicsInCategory,
  extractHeadings,
  calculateReadingTime,
  getAdjacentTopics,
  getRelatedTopics,
} from "@/lib/content";
import Breadcrumb from "@/components/Breadcrumb";
import ContentCard from "@/components/ContentCard";
import TableOfContents from "@/components/TableOfContents";
import QuickFacts from "@/components/QuickFacts";
import TopicNav from "@/components/TopicNav";

// ── GENERATE STATIC PARAMS ────────────────────────────────────────────────────
// Tells Next.js every URL that exists so pages are pre-built at deploy time.
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── SEO METADATA ──────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const filePath = slugToFilePath(slug);
  if (!filePath) return {};

  const meta = getContentMeta(filePath);
  return {
    title: meta.title ? `${meta.title} | GKWorld360` : "GKWorld360",
    description: meta.description ?? undefined,
  };
}

// ── BREADCRUMB BUILDER ────────────────────────────────────────────────────────
// Converts a slug array into breadcrumb items.
// ['history', 'modern-india', 'revolt-of-1857'] →
//   [{ label: 'History', href: '/history' },
//    { label: 'Modern India', href: '/history/modern-india' },
//    { label: 'Revolt of 1857', href: '/history/modern-india/revolt-of-1857' }]
function buildBreadcrumbs(
  slug: string[],
  titles: Record<string, string>
): { label: string; href: string }[] {
  return slug.map((segment, index) => {
    const href = "/" + slug.slice(0, index + 1).join("/");
    // Use the fetched title if available, otherwise prettify the slug
    const label =
      titles[segment] ??
      segment
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    return { label, href };
  });
}

// ── PAGE COMPONENT ────────────────────────────────────────────────────────────
export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // Find the file that matches this slug
  const filePath = slugToFilePath(slug);
  if (!filePath) notFound();

  const meta = getContentMeta(filePath!);
  const pageType = getPageType(slug);

  // Build breadcrumbs — we need the title of each slug segment
  // For now, prettify slug segments (will be replaced by real titles later)
  const breadcrumbTitles: Record<string, string> = { [slug[slug.length - 1]]: meta.title };
  const breadcrumbs = buildBreadcrumbs(slug, breadcrumbTitles);

  // ── SUBJECT PAGE (folder with category sub-folders) ───────────────────────
  if (pageType === "subject") {
    const categories = getCategoriesInSubject(slug[0]);

    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
        <Breadcrumb items={breadcrumbs} />

        {/* Subject header */}
        <div className="mb-10">
          <h1 className="font-heading text-4xl font-bold text-navy">
            {meta.title}
          </h1>
          {meta.description && (
            <p className="font-body text-lg text-muted mt-3 max-w-2xl">
              {meta.description}
            </p>
          )}
        </div>

        {/* Category cards grid */}
        {categories.length > 0 ? (
          <>
            <h2 className="font-heading text-xl font-semibold text-navy mb-5">
              Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <ContentCard
                  key={cat.slug}
                  title={cat.meta.title}
                  description={cat.meta.description}
                  href={`/${slug[0]}/${cat.slug}`}
                />
              ))}
            </div>
          </>
        ) : (
          // No categories yet — show empty state
          <div className="py-16 text-center">
            <p className="font-body text-lg text-muted">
              Topics coming soon. Check back later.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── CATEGORY PAGE (folder with topic files, no sub-folders) ───────────────
  if (pageType === "category") {
    // Could be a subject with no categories, or an actual category inside a subject
    const topics =
      slug.length === 1
        ? getTopicsInSubject(slug[0])           // subject with no categories
        : getTopicsInCategory(slug[0], slug[1]); // category inside a subject

    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
        <Breadcrumb items={breadcrumbs} />

        {/* Category/subject header */}
        <div className="mb-10">
          <h1 className="font-heading text-4xl font-bold text-navy">
            {meta.title}
          </h1>
          {meta.description && (
            <p className="font-body text-lg text-muted mt-3 max-w-2xl">
              {meta.description}
            </p>
          )}
        </div>

        {/* Topic list */}
        {topics.length > 0 ? (
          <>
            <h2 className="font-heading text-xl font-semibold text-navy mb-5">
              Topics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <ContentCard
                  key={topic.slug.join("/")}
                  title={topic.meta.title}
                  description={topic.meta.description}
                  href={`/${topic.slug.join("/")}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="font-body text-lg text-muted">
              Topics coming soon. Check back later.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── TOPIC PAGE (actual article) ────────────────────────────────────────────
  // Use .catch(() => null) instead of try-catch to avoid TypeScript flow issues.
  // If the import fails, mdxMod is null → notFound() is called.
  const slugPath = slug.join("/");
  const useOverview = isOverviewFile(filePath!);

  const mdxMod = await (
    useOverview
      ? import(`@/content/${slugPath}/overview.mdx`).catch(() => null)
      : import(`@/content/${slugPath}.mdx`).catch(() => null)
  );

  // If the MDX file couldn't be loaded, show 404
  if (!mdxMod?.default) notFound();

  // Cast to React.ComponentType — TypeScript now knows it's defined
  const ContentComponent = mdxMod!.default as React.ComponentType;

  // Gather all the data the topic page needs
  const headings = extractHeadings(filePath!);          // Table of Contents
  const readingTime = calculateReadingTime(filePath!);  // "8 min read"
  const { previous, next } = getAdjacentTopics(slug);   // Prev/Next navigation
  const relatedTopics = getRelatedTopics(slug);         // Related Topics cards

  // Pretty subject label for the meta bar (e.g. "history" → "History")
  const subjectLabel = slug[0]
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Meta bar items reused in both the banner and the plain header
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
      {meta.date && (
        <>
          <span className={light ? "text-on-dark/50" : "text-muted opacity-40"}>·</span>
          <span className={`font-body text-sm ${light ? "text-on-dark/80" : "text-muted"}`}>
            Updated {meta.date}
          </span>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-12">

      {/* ── HEADER ─────────────────────────────────────────────────────────────
          If the topic has a banner image, show a big hero banner with the title,
          breadcrumb, and meta bar overlaid on top of it (with a dark gradient
          overlay for readability). If there is no image, fall back to a clean
          text header inside the reading column further below.                    */}
      {meta.image ? (
        <section className="relative w-full h-[320px] md:h-[420px] rounded-card overflow-hidden mb-10">
          {/* The banner image fills the whole section */}
          <Image
            src={meta.image}
            alt={meta.imageCaption ?? meta.title}
            fill
            priority   // this is the largest image on the page — load it first (good for LCP)
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />

          {/* Dark gradient overlay — darker at the bottom so the white text on
              top of the image stays readable regardless of the photo.
              A flat dark tint is layered under the gradient for extra contrast. */}
          <div className="absolute inset-0 bg-navy-dark/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/95 via-navy-dark/70 to-navy-dark/30" />

          {/* Overlaid content, anchored to the bottom-left of the banner */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
            <Breadcrumb items={breadcrumbs} tone="light" />
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-on-dark leading-tight max-w-3xl">
              {meta.title}
            </h1>
            <div className="mt-4">{metaBar(true)}</div>
          </div>
        </section>
      ) : (
        // No banner image — plain breadcrumb on the light page background
        <Breadcrumb items={breadcrumbs} />
      )}

      {/* TWO-COLUMN LAYOUT:
          - Main reading column (left, max 720px)
          - Sticky sidebar (right, ~280px) — only on large screens (lg+)
          On tablet/mobile the sidebar drops below the article.                   */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── MAIN READING COLUMN ──────────────────────────────────────────────*/}
        <div className="min-w-0 flex-1 max-w-[720px]">

          {/* Plain text header — only shown when there is NO banner image
              (when there is a banner, the title + meta are already on it). */}
          {!meta.image && (
            <>
              <h1 className="font-heading text-4xl font-bold text-navy leading-tight">
                {meta.title}
              </h1>
              <div className="mt-4 mb-8">{metaBar(false)}</div>
            </>
          )}

          {/* The article content (rendered from MDX, styled via mdx-components.tsx) */}
          <article>
            <ContentComponent />
          </article>

          {/* Previous / Next navigation */}
          <TopicNav previous={previous} next={next} />

          {/* Related Topics */}
          {relatedTopics.length > 0 && (
            <section className="mt-12">
              <h2 className="font-heading text-2xl font-semibold text-navy mb-5">
                Related Topics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedTopics.map((topic) => (
                  <ContentCard
                    key={topic.slug.join("/")}
                    title={topic.meta.title}
                    href={`/${topic.slug.join("/")}`}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── STICKY SIDEBAR ───────────────────────────────────────────────────
            Hidden on mobile/tablet, visible on large screens.
            `sticky top-24` keeps it visible as the user scrolls (24 = clears the
            sticky header). `self-start` is required for sticky to work in flex.  */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="sticky top-24 flex flex-col gap-5">
            <TableOfContents headings={headings} />
            {meta.quickFacts && <QuickFacts facts={meta.quickFacts} />}
          </div>
        </aside>
      </div>
    </div>
  );
}
