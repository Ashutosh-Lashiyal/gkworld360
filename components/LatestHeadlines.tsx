// LatestHeadlines — aggregated news as a CARD GRID (matches SubjectCard: image
// on top, text below), so it feels native. Each card links OUT to the source and
// has a "Read Later" bookmark button.
//
// Layout trick: a button can't sit *inside* a link (invalid HTML). So the card is
// a <div> with a full-card link OVERLAY (absolute, z-0) for the "open source"
// click, and the ReadLaterButton floats above it (z-10) as a sibling — so each
// gets its own click.
//
// Thumbnails come from many external news CDNs (so we use HeadlineThumb's plain
// <img>, not next/image). If a feed gives no image — OR the image fails to load
// (e.g. LiveMint blocks hotlinking) — HeadlineThumb shows a branded 📰 instead.
import type { Headline } from "@/lib/pulse";
import ReadLaterButton from "@/components/ReadLaterButton";
import HeadlineThumb from "@/components/HeadlineThumb";

export default function LatestHeadlines({ items }: { items: Headline[] }) {
  if (!items.length) {
    return (
      <p className="font-body text-muted py-6">
        Headlines are taking a moment to load — check back shortly.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((h, i) => (
        <div
          key={`${h.link}-${i}`}
          className="group relative flex flex-col bg-surface border border-hairline rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:border-sapphire hover:-translate-y-1 transition-all duration-200"
        >
          {/* Full-card link overlay — makes the whole card open the source */}
          <a
            href={h.link}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={h.title}
            className="absolute inset-0 z-0"
          />

          {/* ── THUMBNAIL ────────────────────────────────────────────────────── */}
          <div className="relative h-44 overflow-hidden">
            {/* Shows the image, or a 📰 fallback if it's missing OR fails to load */}
            <HeadlineThumb src={h.image} />

            {/* Source badge (top-left) */}
            <span className="absolute top-3 left-3 z-10 bg-navy-dark/80 text-on-dark font-body text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {h.source}
            </span>

            {/* Read Later button (top-right) — above the link overlay */}
            <ReadLaterButton headline={h} className="absolute top-2.5 right-2.5 z-10" />
          </div>

          {/* ── CARD BODY ────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 p-5 flex-1">
            <h3 className="font-heading text-base font-semibold text-navy group-hover:text-sapphire transition-colors leading-snug line-clamp-3">
              {h.title}
            </h3>
            {h.snippet && (
              <p className="font-body text-sm text-muted leading-relaxed line-clamp-2">
                {h.snippet}
              </p>
            )}
            <div className="mt-auto pt-2 flex items-center gap-2 font-body text-xs text-muted">
              <span>{h.timeAgo}</span>
              <span className="opacity-40">·</span>
              <span className="font-semibold text-sapphire group-hover:text-sapphire-dark transition-colors">
                Read at {h.source} ↗
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
