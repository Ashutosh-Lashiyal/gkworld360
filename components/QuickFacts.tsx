// QuickFacts — a sidebar card on topic pages showing key facts for fast revision.
// Data comes from the `quickFacts` field in the topic's frontmatter.
// Server component — just displays data, no interactivity.
// REDESIGN PHASE 2 (30 Oct 2026): a chunky card (gk-card) with a small
// mono label, the facts in two columns on wider screens.

import type { QuickFact } from "@/lib/content";

type QuickFactsProps = {
  facts: QuickFact[];
};

export default function QuickFacts({ facts }: QuickFactsProps) {
  // Don't render anything if there are no facts
  if (!facts || facts.length === 0) return null;

  return (
    <div className="gk-card px-5 py-5 md:px-6 mb-8 font-body">
      <p className="gk-label m-0 mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
        Quick facts
      </p>
      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3.5 m-0">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-0.5">
            {/* Fact label — small muted uppercase */}
            <dt className="text-xs font-extrabold text-muted uppercase tracking-[0.08em]">
              {fact.label}
            </dt>
            {/* Fact value — navy, readable */}
            <dd className="m-0 text-[15px] font-semibold text-foreground">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
