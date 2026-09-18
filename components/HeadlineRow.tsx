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

import HeadlineThumb from "@/components/HeadlineThumb";
import ReadLaterButton from "@/components/ReadLaterButton";
import type { Headline } from "@/lib/pulse";
import { SOURCE_ICONS, CATEGORY_COLOR } from "@/lib/pulse-sources";


export default function HeadlineRow({ headline, index }: { headline: Headline; index: number }) {
  const h = headline;
  return (
    <li className="grid grid-cols-[64px_minmax(0,1fr)_44px] md:grid-cols-[72px_minmax(0,1fr)_44px] gap-3.5 md:gap-4 items-center py-3.5 border-b border-border-subtle">
      {/* Thumbnail or numbered square — always the same box */}
      <a
        href={h.link}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
        className="relative block w-16 h-16 md:w-[72px] md:h-[72px] rounded-none overflow-hidden bg-navy-dark"
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
        className="flex flex-col gap-1 min-w-0 text-foreground hover:text-sapphire transition-colors"
      >
        <span className="font-heading text-[15px] md:text-[17px] font-semibold leading-[1.35] text-navy-dark line-clamp-3 md:line-clamp-2">
          {h.title}
        </span>
        {/* Category and source as TAGS — small bordered chips, clearly not part
            of the headline (owner's friend, 18 Sep: plain text under the title
            read as a continuation of it). Category in its colour, source neutral,
            then the time as plain text. */}
        <span className="flex flex-wrap items-center gap-1.5 mt-1 font-body text-[11px] text-muted">
          {h.category && (
            <span
              className="inline-flex items-center px-2 py-0.5 border font-semibold uppercase tracking-[0.12em] bg-surface"
              style={{ color: CATEGORY_COLOR[h.category] ?? "#4a6460", borderColor: CATEGORY_COLOR[h.category] ?? "#d9d6cf" }}
            >
              {h.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 border border-hairline bg-surface font-medium text-foreground/80">
            {SOURCE_ICONS[h.source] && (
              /* eslint-disable-next-line @next/next/no-img-element -- tiny local favicon, no optimisation needed */
              <img src={SOURCE_ICONS[h.source]} alt="" width={14} height={14} className="w-3.5 h-3.5" />
            )}
            {h.source}
          </span>
          <span className="ml-0.5">{h.timeAgo}</span>
        </span>
      </a>

      <ReadLaterButton headline={h} variant="light" />
    </li>
  );
}
