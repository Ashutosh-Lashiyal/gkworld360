// HeadlineRow — one headline in the /pulse archive list.
//
// REDESIGN 16 Sep 2026 (board 6, "option B"): a 72px square thumbnail when
// the feed provided one, otherwise a numbered dark square of the SAME size —
// the list never has a hole. Then the title (serif, up to 2 lines), a meta line
// (category in its colour · source · time), and the Read Later bookmark.
//
// Nothing to fetch here: the headline store already carries `image`, so the
// thumbnails cost no extra database work.
//
// Server component; HeadlineThumb and ReadLaterButton inside it are the client parts.
//
// PHASE 4 (30 Oct 2026): rows inside one chunky card; rounded thumbnails; the
// category as a soft round pill (its colour mixed with the page's text colour,
// so it reads in Dark mode too); a hover tint and "Open ↗".

import HeadlineThumb from "@/components/HeadlineThumb";
import ReadLaterButton from "@/components/ReadLaterButton";
import type { Headline } from "@/lib/pulse";
import { SOURCE_ICONS, CATEGORY_COLOR } from "@/lib/pulse-sources";
import TimeAgo from "@/components/TimeAgo";


export default function HeadlineRow({ headline, index }: { headline: Headline; index: number }) {
  const h = headline;
  return (
    <li className="gk-hl grid grid-cols-[64px_minmax(0,1fr)_44px] md:grid-cols-[72px_minmax(0,1fr)_44px] gap-3.5 md:gap-4 items-center p-3 md:p-3.5 rounded-2xl">
      {/* Thumbnail or numbered square — always the same box */}
      <a
        href={h.link}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
        className="relative block w-16 h-16 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden bg-navy-dark"
      >
        {/* HeadlineThumb is a client component: publishers sometimes block
            their images on other sites, and only the browser can tell — it
            swaps in the numbered square if the image fails to load. */}
        <HeadlineThumb src={h.image} number={index} variant="row" />
      </a>

      <a
        href={h.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-1 min-w-0 text-foreground"
      >
        <span className="font-body text-[15px] md:text-[17px] font-bold leading-[1.4] text-foreground group-hover:text-accent transition-colors line-clamp-3 md:line-clamp-2">
          {h.title}
        </span>
        {/* Category and source as TAGS — small bordered chips, clearly not part
            of the headline (owner's friend, 18 Sep: plain text under the title
            read as a continuation of it). Category in its colour, source neutral,
            then the time as plain text. */}
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 font-body text-[13px] font-semibold text-faint">
          {h.category && (
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
              /* eslint-disable-next-line @next/next/no-img-element -- tiny local favicon, no optimisation needed */
              <img src={SOURCE_ICONS[h.source]} alt="" width={14} height={14} className="w-3.5 h-3.5" />
            )}
            {h.source}
          </span>
          <TimeAgo iso={h.isoDate} fallback={h.timeAgo} />
          <span className="gk-hl__go text-accent" aria-hidden="true">Open ↗</span>
        </span>
      </a>

      <ReadLaterButton headline={h} variant="light" />
    </li>
  );
}
