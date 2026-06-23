// QuickFacts — a sidebar card on topic pages showing key facts for fast revision.
// Data comes from the `quickFacts` field in the topic's frontmatter.
// Server component — just displays data, no interactivity.

import type { QuickFact } from "@/lib/content";

type QuickFactsProps = {
  facts: QuickFact[];
};

export default function QuickFacts({ facts }: QuickFactsProps) {
  // Don't render anything if there are no facts
  if (!facts || facts.length === 0) return null;

  return (
    <div className="bg-surface border border-hairline rounded-card p-5 shadow-card">
      <h2 className="font-heading text-base font-semibold text-navy mb-4">
        Quick Facts
      </h2>
      <dl className="flex flex-col gap-3">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-0.5">
            {/* Fact label — small muted uppercase */}
            <dt className="font-body text-xs font-semibold text-muted uppercase tracking-wide">
              {fact.label}
            </dt>
            {/* Fact value — navy, readable */}
            <dd className="font-body text-sm text-navy">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
