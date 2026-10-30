// The /subjects page — shows ALL 18 subjects as a grid of cards.
// A user reaches this page by clicking "View all subjects →" on the homepage.
// Unlike the homepage which shows only 6, this page shows everything.

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/og";
import SubjectCard from "@/components/SubjectCard";
import PageTitle from "@/components/PageTitle";
import { getAllSubjects } from "@/lib/content";

// Title only — the root layout appends " | GKWorld360". pageMetadata also
// gives the page its link-preview card (lib/og.ts).
export const metadata: Metadata = pageMetadata({
  title: "All Subjects",
  description:
    "Browse all subjects on GKWorld360 — History, Geography, Science, Polity, Economics, Current Affairs, Physics, Chemistry, Biology and more.",
  label: "Browse by subject",
  path: "/subjects",
});

export default function SubjectsPage() {
  // Read every subject that has an overview.mdx in content/
  // Sorted: homepage subjects (1-6) first, then remaining alphabetically
  const subjects = getAllSubjects();

  return (
    <>
      {/* REDESIGN PHASE 4 (30 Oct 2026): the big title (components/PageTitle.tsx) */}
      <PageTitle
        colors={null}
        breadcrumbs={[{ label: "Subjects", href: "/subjects" }]}
        label="Choose where to start"
        title="All Subjects"
        description={`${subjects.length} subject${subjects.length !== 1 ? "s" : ""} to begin with. History is open now; the others are being written and checked.`}
      />

      {/* Subject card grid — same 3-column layout as homepage */}
      <div data-reveal-group className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 md:pt-12 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.slug}
            title={subject.meta.title}
            description={subject.meta.description}
            slug={subject.slug}
            icon={subject.meta.icon}
            image={subject.meta.image}
          />
        ))}
      </div>

      {/* Empty state — shown if no subjects exist yet */}
      {subjects.length === 0 && (
        <div className="text-center py-20">
          <p className="font-body text-lg text-muted">
            No subjects available yet. Check back soon.
          </p>
        </div>
      )}
    </>
  );
}
