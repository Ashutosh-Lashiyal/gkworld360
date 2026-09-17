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

// The category colours borrow subject signals: National = rust, International
// = navy, Sci-Tech = sky, Business = forest, Sports = red.
const CATEGORY_COLOR: Record<string, string> = {
  National: "#7c2d12",
  International: "#1e3a8a",
  "Sci-Tech": "#0c4a6e",
  Business: "#064e3b",
  Sports: "#991b1b",
};

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
        <span className="flex flex-wrap items-center gap-1.5 font-body text-[11px] md:text-xs text-muted">
          {h.category && (
            <>
              <span
                className="font-semibold uppercase tracking-[0.14em]"
                style={{ color: CATEGORY_COLOR[h.category] ?? "#4a6460" }}
              >
                {h.category}
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span>{h.source}</span>
          <span aria-hidden="true">·</span>
          <span>{h.timeAgo}</span>
        </span>
      </a>

      <ReadLaterButton headline={h} variant="light" />
    </li>
  );
}
