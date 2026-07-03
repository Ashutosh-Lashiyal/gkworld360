// All Topics page — /topics and /topics?sort=popular or /topics?sort=recent
//
// This is a Server Component. It reads the ?sort= query param from the URL,
// fetches all topic articles accordingly, enriches each with Hindi info and
// subject colour, then renders them in a grid.
//
// The SortToggle (client component) handles switching sorts — it just changes
// the URL, which causes this server component to re-run with the new sort.

import type { Metadata } from "next";
import Link from "next/link";
import {
  getRecentTopics,
  hasTranslation,
  resolveContentFile,
  getContentMeta,
} from "@/lib/content";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { getSubjectInfo } from "@/lib/subjects";
import ContentCard from "@/components/ContentCard";
import SortToggle from "@/components/SortToggle";

export const metadata: Metadata = {
  title: "All Topics | GKWorld360",
  description:
    "Browse every topic on GKWorld360 — history, geography, science, polity, and more.",
};

export default async function TopicsPage({
  searchParams,
}: {
  // In Next.js App Router, searchParams is a Promise — we must await it
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;

  // Determine which sort is active. Default to "recent" if nothing is in the URL.
  // "popular" is the sort activated by the Popular Topics "View all" button.
  // "recent"  is the sort activated by the Recently Added "View all" button.
  const activeSort: "popular" | "recent" = sort === "popular" ? "popular" : "recent";

  // Fetch all topic articles (pass a large limit to get everything).
  // Both sorts use date-based ordering for now — when a real popularity
  // mechanism (e.g. view counts) is built, replace the popular branch with
  // a ranked fetch. The page UI does not need to change.
  const topics = getRecentTopics(999);

  // Enrich each topic with Hindi info and subject colour — same pattern used
  // on the homepage. Done here on the server so ContentCard receives clean props.
  const enrichedTopics = topics.map((item) => {
    const hindiResolved = hasTranslation(item.slug, "hi")
      ? resolveContentFile(item.slug, "hi")
      : null;
    const subject = getSubjectInfo(item.slug[0]);
    const colors = SUBJECT_COLORS[item.slug[0]];
    return {
      title:       item.meta.title,
      description: item.meta.description,
      href:        "/" + item.slug.join("/"),
      subjectLabel: subject?.label ?? item.slug[0],
      hoverBg:     colors?.bg,
      hindiHref:   hindiResolved ? "/hi/" + item.slug.join("/") : undefined,
      hindiTitle:  hindiResolved
        ? getContentMeta(hindiResolved.filePath).title
        : undefined,
    };
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">

      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div className="mb-10">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <Link href="/" className="font-body text-sm text-muted hover:text-navy transition-colors">
            Home
          </Link>
          <span className="mx-2 text-muted">›</span>
          <span className="font-body text-sm text-navy">All Topics</span>
        </nav>

        <h1 className="font-heading text-4xl font-bold text-navy mb-2">
          All Topics
        </h1>
        <p className="font-body text-lg text-muted">
          {enrichedTopics.length} topic{enrichedTopics.length !== 1 ? "s" : ""} across all subjects
        </p>
      </div>

      {/* ── SORT TOGGLE ──────────────────────────────────────────────────────── */}
      {/* SortToggle is a client component — it changes the URL when clicked,
          which causes this server component to re-render with the new sort.   */}
      <div className="mb-8">
        <SortToggle activeSort={activeSort} />
      </div>

      {/* ── TOPIC GRID ───────────────────────────────────────────────────────── */}
      {enrichedTopics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedTopics.map((topic) => (
            <ContentCard
              key={topic.href}
              title={topic.title}
              description={topic.description}
              href={topic.href}
              hoverBg={topic.hoverBg}
              hindiHref={topic.hindiHref}
              hindiTitle={topic.hindiTitle}
            />
          ))}
        </div>
      ) : (
        // Empty state — shown if no topics have been published yet
        <div className="py-20 text-center">
          <p className="font-body text-lg text-muted">
            No topics published yet. Check back soon.
          </p>
          <Link
            href="/subjects"
            className="font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark mt-4 inline-block"
          >
            Browse subjects instead →
          </Link>
        </div>
      )}
    </div>
  );
}
