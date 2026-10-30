// AtlasTeaser — the homepage's "New · World360 Atlas: KNOWLEDGE on the map"
// section (29 Oct 2026).
//
// REDESIGN PHASE 3 (30 Oct 2026): a TIMELINE instead of the dark panel with a
// small globe (the big Earth now turns at the top of the homepage, so a second
// globe was too much). Six Atlas events spread across time, on a line:
//
//   1498 ────●──────── 1510 ────●──────── 1602 ────●───── …
//   Vasco da Gama      Albuquerque        The Dutch East
//   reaches Calicut    captures Goa       India Company…
//
// Each one opens the Atlas with that card open. The line is drawn in amber;
// a knob grows when you point at it.
//
// Server component. Uses the Atlas's saved entry list (no extra database
// work) and draws NOTHING while the Atlas has no published entries.
//
// PHASE 4 (30 Oct 2026): also used on SUBJECT pages — pass `subject` to show
// only that subject's places, and your own title ("History on the Atlas:
// WHERE IT happened").

import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import { getAtlasEntries } from "@/lib/atlas";

type AtlasTeaserProps = {
  subject?: string; // only this subject's places (e.g. "history")
  eyebrow?: string;
  title?: string;
  accent?: string;
};

export default async function AtlasTeaser({
  subject,
  eyebrow = "New · World360 Atlas",
  title = "Knowledge",
  accent = "on the map",
}: AtlasTeaserProps = {}) {
  const all = await getAtlasEntries("en");
  const entries = subject ? all.filter((e) => e.subject === subject) : all;
  if (entries.length === 0) return null;

  // Six events spread evenly through time (entries are already in time order):
  // the first, the last, and four evenly spaced between
  const n = Math.min(6, entries.length);
  const picks = Array.from({ length: n }, (_, i) => entries[Math.round((i * (entries.length - 1)) / Math.max(1, n - 1))]);

  return (
    <section aria-labelledby="atlas-title" className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-28">
      <SectionHead
        id="atlas-title"
        eyebrow={eyebrow}
        title={title}
        accent={accent}
        lede="Battles, discoveries, journeys and births, on one globe and in time order. Pick a year to see where it happened."
        more={{ href: subject ? `/atlas?subject=${subject}` : "/atlas", label: "Open the Atlas" }}
      />

      {/* On phones the timeline scrolls sideways (gk-tl in globals.css) */}
      <div className="gk-tl">
        <ol data-reveal-group className="gk-tl__list" style={{ ["--n" as string]: n }}>
          {picks.map((e) => (
            <li key={e.id}>
              <Link href={`/atlas/${e.slug}`} className="gk-tl__item font-body">
                <span className="gk-tl__year">{e.year}</span>
                <span className="gk-tl__knob" aria-hidden="true" />
                <span className="gk-tl__title">{e.title}</span>
                <span className="gk-tl__place">{e.place}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
