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
// Each one opens the Atlas with that card open. A knob grows when you point at
// it. (Since 2 Nov the line is neutral and each knob takes its subject's colour.)
//
// Server component. Uses the Atlas's saved entry list (no extra database
// work) and draws NOTHING while the Atlas has no published entries.
//
// PHASE 4 (30 Oct 2026): also used on SUBJECT pages — pass `subject` to show
// only that subject's places, and your own title ("History on the Atlas:
// WHERE IT happened").
//
// EVERY SUBJECT (2 Nov 2026 — owner: "it looks like a history timeline"): on the
// homepage the section now says the Atlas is for ALL subjects:
//
//   SUBJECTS ON THE ATLAS
//   (● History 12 places) (○ Geography soon) (○ Physics soon) …
//
//   1498 ──●── 1600 ──●── … ──◌── Next
//        [HISTORY]             ● ● ● ● ●  More subjects join the map
//
//   - a row of subjects in their own colours: a subject with places is filled
//     in, shows its count and opens the Atlas filtered to it; the others are
//     dashed outlines marked "soon" (not links — there's nothing to show yet);
//   - every event carries a small tag in its subject's colour;
//   - a dashed "Next" stop at the end, with a dot for each subject still to come.
// All of it is counted from the Atlas's own list, so when (say) a Chemistry
// article gets its first Atlas place, Chemistry lights up by itself.
// On phones the timeline runs DOWN the screen instead of scrolling sideways.

import type { CSSProperties } from "react";
import Link from "next/link";
import SectionHead from "@/components/SectionHead";
import { getAtlasEntries } from "@/lib/atlas";
import { getHomepageSubjects } from "@/lib/content";
import { getSubjectInfo } from "@/lib/subjects";
import { SUBJECT_COLORS, FRAME_COLORS, type SubjectColors } from "@/lib/subject-colors";

type AtlasTeaserProps = {
  subject?: string; // only this subject's places (e.g. "history")
  eyebrow?: string;
  title?: string;
  accent?: string;
};

/** A subject's colours as CSS variables, read by the .gk-tl-* rules in globals.css:
 *  --sb the bright shade (dots, borders), --sa the dark shade (text on light
 *  pages), --sd the light shade (text on dark pages), --sk its very dark shade. */
function colourVars(slug: string) {
  const c: SubjectColors = SUBJECT_COLORS[slug] ?? FRAME_COLORS;
  return { "--sb": c.border, "--sa": c.accent, "--sd": c.bandAccent, "--sk": c.band } as CSSProperties;
}

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

  // THE SUBJECT ROW (homepage only): the homepage's six subjects in their order,
  // plus any other subject that already has places. Each with its count of places.
  const homepage = !subject;
  const counts = new Map<string, number>();
  for (const e of all) counts.set(e.subject, (counts.get(e.subject) ?? 0) + 1);
  const six = getHomepageSubjects().map((s) => s.slug);
  const subjects = [...six, ...[...counts.keys()].filter((slug) => !six.includes(slug))].map((slug) => ({
    slug,
    label: getSubjectInfo(slug)?.label ?? slug,
    count: counts.get(slug) ?? 0,
  }));
  // The subjects still to come — one dot each on the "Next" stop
  const comingSoon = subjects.filter((s) => s.count === 0);
  const showNext = homepage && comingSoon.length > 0;

  return (
    <section aria-labelledby="atlas-title" className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-28">
      <SectionHead
        id="atlas-title"
        eyebrow={eyebrow}
        title={title}
        accent={accent}
        lede={
          homepage
            ? "Every subject, one globe. History, geography, science and famous lives: whatever happened somewhere, at some time, gets its place on the map, in time order."
            : "Battles, discoveries, journeys and births, on one globe and in time order. Pick a year to see where it happened."
        }
        more={{ href: subject ? `/atlas?subject=${subject}` : "/atlas", label: "Open the Atlas" }}
      />

      {/* THE SUBJECT ROW — homepage only (a subject page is about one subject) */}
      {homepage && (
        <div className="mb-10 md:mb-12">
          <p className="gk-tl-label">Subjects on the Atlas</p>
          <ul className="m-0 p-0 list-none flex flex-wrap gap-2.5">
            {subjects.map((s) => (
              <li key={s.slug} style={colourVars(s.slug)}>
                {s.count > 0 ? (
                  // Has places: opens the Atlas showing only this subject
                  <Link href={`/atlas?subject=${s.slug}`} className="gk-tl-chip font-body">
                    <span className="gk-tl-chip__dot" aria-hidden="true" />
                    {s.label}
                    <span className="gk-tl-chip__count">{s.count} {s.count === 1 ? "place" : "places"}</span>
                  </Link>
                ) : (
                  // No places yet: a dashed outline, not a link
                  <span className="gk-tl-chip gk-tl-chip--soon font-body">
                    <span className="gk-tl-chip__dot" aria-hidden="true" />
                    {s.label}
                    <span className="gk-tl-chip__count">soon</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* THE TIMELINE — sideways on bigger screens, downwards on phones (gk-tl in globals.css) */}
      <div className="gk-tl">
        <ol data-reveal-group className="gk-tl__list" style={{ ["--n" as string]: n + (showNext ? 1 : 0) }}>
          {picks.map((e) => (
            <li key={e.id} style={colourVars(e.subject)}>
              <Link href={`/atlas/${e.slug}`} className="gk-tl__item font-body">
                <span className="gk-tl__year">{e.year}</span>
                <span className="gk-tl__knob" aria-hidden="true" />
                {/* the subject's tag — on the homepage, where subjects mix */}
                {homepage && <span className="gk-tl__tag">{getSubjectInfo(e.subject)?.label ?? e.subject}</span>}
                <span className="gk-tl__title">{e.title}</span>
                <span className="gk-tl__place">{e.place}</span>
              </Link>
            </li>
          ))}
          {/* THE "NEXT" STOP — the subjects still to come, as coloured dots */}
          {showNext && (
            <li>
              <div className="gk-tl__item gk-tl__item--next font-body">
                <span className="gk-tl__year">Next</span>
                <span className="gk-tl__knob" aria-hidden="true" />
                <span className="flex gap-1" aria-hidden="true">
                  {comingSoon.map((s) => <span key={s.slug} className="gk-tl__dot" style={colourVars(s.slug)} />)}
                </span>
                <span className="gk-tl__title">More subjects join the map</span>
                <span className="gk-tl__place">as their articles are written</span>
              </div>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
