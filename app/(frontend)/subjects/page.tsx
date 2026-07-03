// The /subjects page — shows ALL 18 subjects as a grid of cards.
// A user reaches this page by clicking "View all subjects →" on the homepage.
// Unlike the homepage which shows only 6, this page shows everything.

import type { Metadata } from "next";
import SubjectCard from "@/components/SubjectCard";
import { getAllSubjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "All Subjects | GKWorld360",
  description:
    "Browse all subjects on GKWorld360 — History, Geography, Science, Polity, Economics, Current Affairs, Physics, Chemistry, Biology and more.",
};

export default function SubjectsPage() {
  // Read every subject that has an overview.mdx in content/
  // Sorted: homepage subjects (1-6) first, then remaining alphabetically
  const subjects = getAllSubjects();

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">

      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-navy">
          All Subjects
        </h1>
        <p className="font-body text-lg text-muted mt-3">
          Browse all {subjects.length} subject{subjects.length !== 1 ? "s" : ""} available on GKWorld360
        </p>
      </div>

      {/* Subject card grid — same 3-column layout as homepage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
