// AtlasTeaser — the homepage's "Knowledge on the map" section (29 Oct 2026),
// straight after Explore Subjects (placement agreed 29 Oct). From the approved
// prototype: a dark panel with the words, a row of subjects, a row of time
// periods and a small turning globe; every part opens the Atlas.
//
// The section sits on the LIGHT page with the DARK panel inside it, so the
// homepage's light / dark alternation (Subjects light → Headlines dark) holds.
//
// Server component. Uses the Atlas's saved entry list (no extra database
// work) and draws NOTHING while the Atlas has no published entries.

import Link from "next/link";
import Button from "@/components/Button";
import TeaserGlobe from "@/components/atlas/TeaserGlobe";
import { getAtlasEntries } from "@/lib/atlas";
import { PERIODS, eraOf } from "@/lib/atlas-shared";
import { SUBJECTS } from "@/lib/subjects";
import { SUBJECT_COLORS } from "@/lib/subject-colors";

export default async function AtlasTeaser() {
  const entries = await getAtlasEntries("en");
  if (entries.length === 0) return null;

  // Subjects that have entries, with their counts and colours
  const subjects = SUBJECTS.map((s) => ({ ...s, count: entries.filter((e) => e.subject === s.slug).length })).filter((s) => s.count > 0);
  // Time periods that have entries (the neutral ones — they suit every subject)
  const periods = PERIODS.map((p) => ({ ...p, count: entries.filter((e) => eraOf(e.year, PERIODS) === p).length })).filter((p) => p.count > 0);
  // The globe's dots: place + the subject's light colour (reads on dark)
  const points = entries.map((e) => ({ lat: e.lat, lng: e.lng, color: SUBJECT_COLORS[e.subject]?.bandAccent ?? "#6ee7b7" }));

  // One chip style for both rows: outlined on dark, mint on hover
  const chip =
    "inline-flex items-baseline gap-2 px-3 py-2 border border-on-dark/20 bg-on-dark/[0.04] font-body text-[13px] font-medium text-on-dark/90 hover:bg-mint hover:border-mint hover:text-navy-dark transition-colors group";

  return (
    <section className="bg-background">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 pb-14 md:pb-[72px]">
        <div data-reveal className="relative overflow-hidden bg-navy-dark text-on-dark grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-6 md:gap-12 p-6 md:p-12">
          {/* a faint mint glow behind the globe */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(60%_70%_at_80%_50%,rgba(110,231,183,0.10),transparent_70%)]" />

          <div className="relative flex flex-col items-start gap-4 min-w-0">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">New · World360 Atlas</span>
            <h2 className="m-0 font-heading text-3xl md:text-[44px] font-bold leading-[1.1] tracking-[-0.015em] text-white [text-wrap:balance]">
              Knowledge on the map
            </h2>
            <p className="m-0 font-body text-base md:text-[17px] leading-relaxed text-on-dark/80 max-w-[520px]">
              Where and when knowledge happened — battles, discoveries, journeys and births from every subject, on one globe and in time order.
            </p>

            {/* Subjects → the Atlas filtered to that subject */}
            <ul className="list-none m-0 p-0 flex flex-wrap gap-2" aria-label="Open the Atlas at a subject">
              {subjects.map((s) => (
                <li key={s.slug}>
                  <Link href={`/atlas?subject=${s.slug}`} className={chip}>
                    <span aria-hidden="true" className="w-2.5 h-2.5 self-center" style={{ backgroundColor: SUBJECT_COLORS[s.slug]?.bandAccent }} />
                    <b className="font-heading text-base font-bold leading-none" style={{ color: SUBJECT_COLORS[s.slug]?.bandAccent }}>{s.count}</b>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Time periods → the Atlas scrolled to that period */}
            <ul className="list-none m-0 p-0 flex flex-wrap gap-2" aria-label="Open the Atlas at a time period">
              {periods.map((p) => (
                <li key={p.id}>
                  <Link href={`/atlas?era=${p.id}`} className={chip}>
                    <b className="font-heading text-base font-bold leading-none text-mint group-hover:text-navy-dark">{p.count}</b>
                    {p.name.en}
                  </Link>
                </li>
              ))}
            </ul>

            <Button href="/atlas" variant="onDark" className="mt-2">Open the World360 Atlas →</Button>
          </div>

          {/* The small globe — the whole square is a link to the Atlas */}
          <Link
            href="/atlas"
            aria-label="Open the World360 Atlas"
            className="relative justify-self-center w-full max-w-[320px] md:max-w-[420px] aspect-square order-first md:order-none"
          >
            <TeaserGlobe points={points} />
          </Link>
        </div>
      </div>
    </section>
  );
}
