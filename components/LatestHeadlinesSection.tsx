// LatestHeadlinesSection — the "Latest Headlines" band on the homepage.
//
// Auto-updating current-affairs headlines from trusted sources (The Hindu,
// Indian Express, LiveMint…), fetched + cached by lib/pulse and refreshed every
// ~30 min by the cron. Each headline links OUT to its source — we aggregate,
// we don't host. "View all" goes to /pulse, which keeps about a week of them.
//
// REDESIGN 16 Sep 2026 (board 5): a DARK band — the second beat of the
// homepage's light/dark alternation — with a numbered list in two columns.
// The mint number is the one accent; titles are white serif; source and time
// sit under each title in muted white. No thumbnails here (the /pulse page
// decides that separately); a Read Later button ends each row.

import Link from "next/link";
import { getLatestHeadlines, SOURCE_ICONS } from "@/lib/pulse";
import ReadLaterButton from "@/components/ReadLaterButton";

export default async function LatestHeadlinesSection() {
  const items = await getLatestHeadlines(6);
  if (!items.length) return null;

  return (
    <section className="bg-navy-dark text-on-dark">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-14 md:py-16 flex flex-col gap-6">
        {/* Header row: label + title on the left, two mint links on the right */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">
              Updated through the day
            </span>
            <h2 className="m-0 font-heading text-3xl md:text-[40px] font-bold tracking-[-0.015em] text-on-dark">
              Latest Headlines
            </h2>
          </div>
          <div className="flex items-center gap-5 font-body text-sm font-semibold">
            <Link href="/saved" className="text-mint hover:text-on-dark transition-colors">
              Read Later
            </Link>
            <Link href="/pulse" className="text-mint hover:text-on-dark transition-colors">
              View all →
            </Link>
          </div>
        </div>

        {/* What the bookmark does — readers had no way to know (owner, 17 Sep) */}
        <p className="m-0 -mt-2 flex items-center gap-2 font-body text-sm text-on-dark/70">
          <span aria-hidden="true" className="inline-flex items-center justify-center w-7 h-7 rounded-none border border-on-dark/25 text-on-dark/70">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </span>
          Tap the bookmark on any headline to keep it in your <Link href="/saved" className="text-mint hover:text-on-dark font-semibold transition-colors">Read Later</Link> list — headlines here disappear after about a week.
        </p>

        {/* Two columns on desktop, one on phones. Each row: number · text · bookmark */}
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-14 list-none m-0 p-0">
          {items.map((h, i) => (
            <li
              key={h.link}
              className="grid grid-cols-[36px_minmax(0,1fr)_auto] gap-3.5 items-start py-4 border-b border-on-dark/10"
            >
              <span className="font-heading text-xl font-bold text-mint leading-[1.35]">{i + 1}</span>
              <a
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 text-on-dark hover:text-mint transition-colors"
              >
                <span className="font-heading text-lg font-semibold leading-[1.35]">{h.title}</span>
                {/* Source as a tag + time, like the /pulse rows (18 Sep) */}
                <span className="flex flex-wrap items-center gap-1.5 mt-0.5 font-body text-[11px] text-on-dark/60">
                  {h.category && (
                    <span className="inline-flex items-center px-2 py-0.5 border border-mint/40 text-mint font-semibold uppercase tracking-[0.12em]">
                      {h.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 border border-on-dark/25 text-on-dark/80 font-medium">
                    {SOURCE_ICONS[h.source] && (
                      /* eslint-disable-next-line @next/next/no-img-element -- tiny local favicon */
                      <img src={SOURCE_ICONS[h.source]} alt="" width={14} height={14} className="w-3.5 h-3.5" />
                    )}
                    {h.source}
                  </span>
                  <span className="ml-0.5">{h.timeAgo}</span>
                </span>
              </a>
              <ReadLaterButton headline={h} variant="row" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
