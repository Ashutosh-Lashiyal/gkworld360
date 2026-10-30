// All Topics page — /topics and /topics?sort=popular or /topics?sort=recent
//
// This is a Server Component. It reads the ?sort= query param from the URL,
// fetches all topic articles accordingly, enriches each with Hindi info and
// subject colour, then renders them in a grid.
//
// The SortToggle (client component) handles switching sorts — it just changes
// the URL, which causes this server component to re-run with the new sort.

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/og";
import Link from "next/link";
import { getPopularTopics, getRecentlyAddedTopics } from "@/lib/topics";
import { SUBJECT_COLORS } from "@/lib/subject-colors";
import { getSubjectInfo } from "@/lib/subjects";
import ContentCard from "@/components/ContentCard";
import PageTitle from "@/components/PageTitle";
import SortToggle from "@/components/SortToggle";

// Title only — the root layout appends " | GKWorld360". pageMetadata also
// gives the page its link-preview card (lib/og.ts).
export const metadata: Metadata = pageMetadata({
  title: "All Topics",
  description:
    "Browse every topic on GKWorld360 — history, geography, science, polity, and more.",
  label: "Every topic on the site",
  path: "/topics",
});

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
  // Every topic from BOTH sources (MDX + CMS), via lib/topics.ts. Until real
  // view counts exist, "popular" and "recent" are the same newest-first list
  // (that was already true of the old MDX-only version).
  const topics = activeSort === "popular" ? await getPopularTopics(999) : await getRecentlyAddedTopics(999);
  const enrichedTopics = topics.map((item) => {
    const subject = getSubjectInfo(item.slug[0]);
    const colors = SUBJECT_COLORS[item.slug[0]];
    return {
      title:       item.meta.title,
      description: item.meta.description,
      href:        "/" + item.slug.join("/"),
      subjectLabel: subject?.label ?? item.slug[0],
      hoverBg:     colors?.bg,
      accent:      colors?.accent,
      image:       item.meta.image,
      hindiHref:   item.hindiHref,
      hindiTitle:  item.hindiTitle,
    };
  });

  return (
    <>
      {/* REDESIGN PHASE 4 (30 Oct 2026): the big title (components/PageTitle.tsx),
          with the sort switch in the row underneath */}
      <PageTitle
        colors={null}
        breadcrumbs={[{ label: "All Topics", href: "/topics" }]}
        label="Every topic, in English and Hindi"
        title="All Topics"
        description={`${enrichedTopics.length} topic${enrichedTopics.length !== 1 ? "s" : ""} across all subjects.`}
      >
        {/* SortToggle is a client component — it changes the URL when clicked,
            which causes this server component to re-render with the new sort. */}
        <SortToggle activeSort={activeSort} />
      </PageTitle>

    <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 md:pt-12 pb-6">
      {/* ── TOPIC GRID ───────────────────────────────────────────────────────── */}
      {enrichedTopics.length > 0 ? (
        <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrichedTopics.map((topic) => (
            <ContentCard
              key={topic.href}
              title={topic.title}
              description={topic.description}
              href={topic.href}
              hoverBg={topic.hoverBg}
              accent={topic.accent}
              image={topic.image}
              label={topic.subjectLabel}
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
    </>
  );
}
