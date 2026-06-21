// The catch-all route — handles EVERY content page with one file.
// Detects what type of page is being requested and renders the correct layout:
//
//   /history                          → Subject page (shows category cards)
//   /history/modern-india             → Category page (shows topic cards)
//   /history/modern-india/revolt-1857 → Topic page (shows the article)
//   /human-body                       → Subject page with no categories (shows topics directly)

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllSlugs,
  slugToFilePath,
  getContentMeta,
  isOverviewFile,
  getPageType,
  getCategoriesInSubject,
  getTopicsInSubject,
  getTopicsInCategory,
} from "@/lib/content";
import Breadcrumb from "@/components/Breadcrumb";
import ContentCard from "@/components/ContentCard";

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

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
      <Breadcrumb items={breadcrumbs} />

      {/* Reading column — max 720px for comfortable long-form reading */}
      <article className="max-w-[720px]">
        <ContentComponent />
      </article>
    </div>
  );
}
