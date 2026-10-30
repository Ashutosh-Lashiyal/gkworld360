// LatestHeadlinesSection — "Updated through the day: LATEST headlines" on the
// homepage: the six newest headlines from the news feeds (lib/pulse.ts).
//
// REDESIGN PHASE 3 (30 Oct 2026): one chunky card on the page (it used to be a
// dark band), two columns of rows. Each row: the headline, its category pill,
// the source and how long ago — and the Read Later bookmark on the right.
// Pointing at a row tints it and shows "Open ↗". Headlines open the
// publisher's site in a new tab (we only link to them).
//
// Server component (the bookmark inside is a client component).

import { getLatestHeadlines } from "@/lib/pulse";
import { SOURCE_ICONS, CATEGORY_COLOR } from "@/lib/pulse-sources";
import ReadLaterButton from "@/components/ReadLaterButton";
import TimeAgo from "@/components/TimeAgo";
import SectionHead from "@/components/SectionHead";

export default async function LatestHeadlinesSection() {
  const items = await getLatestHeadlines(6);
  if (!items.length) return null;

  return (
    <section aria-labelledby="headlines-title" className="max-w-[1320px] mx-auto px-4 md:px-8 pt-20 md:pt-28">
      <SectionHead
        id="headlines-title"
        eyebrow="Updated through the day"
        title="Latest"
        accent="headlines"
        lede="Tap the bookmark to keep a headline in Read Later — headlines here disappear after about a week."
        more={{ href: "/pulse", label: "All headlines" }}
      />

      <div className="gk-card p-2">
        {/* data-reveal-group: the rows settle in one after another (ScrollReveal) */}
        <ol data-reveal-group className="grid grid-cols-1 md:grid-cols-2 list-none m-0 p-0">
          {items.map((h) => (
            <li key={h.link} className="gk-hl grid grid-cols-[minmax(0,1fr)_auto] gap-3.5 items-start p-4 md:p-[18px] rounded-2xl">
              <a href={h.link} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2.5 min-w-0">
                <span className="font-body text-[17px] font-bold leading-[1.4] text-foreground group-hover:text-accent transition-colors [text-wrap:pretty]">
                  {h.title}
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-body text-[13px] font-semibold text-faint">
                  {h.category && (
                    // the category's colour, mixed with the page's text colour so it reads in Dark mode too
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold"
                      style={{
                        color: `color-mix(in srgb, ${CATEGORY_COLOR[h.category] ?? "#4a6460"} 60%, var(--ink))`,
                        backgroundColor: `color-mix(in srgb, ${CATEGORY_COLOR[h.category] ?? "#4a6460"} 14%, transparent)`,
                      }}
                    >
                      {h.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    {SOURCE_ICONS[h.source] && (
                      /* eslint-disable-next-line @next/next/no-img-element -- tiny local favicon */
                      <img src={SOURCE_ICONS[h.source]} alt="" width={14} height={14} className="w-3.5 h-3.5 rounded-sm" />
                    )}
                    {h.source} · <TimeAgo iso={h.isoDate} fallback={h.timeAgo} />
                  </span>
                  <span className="gk-hl__go text-accent" aria-hidden="true">Open ↗</span>
                </span>
              </a>
              <ReadLaterButton headline={h} variant="light" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
