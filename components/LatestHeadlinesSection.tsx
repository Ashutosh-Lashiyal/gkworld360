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
import { getLatestHeadlines } from "@/lib/pulse";
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
              Part two · updated through the day
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
                <span className="font-body text-[13px] text-on-dark/60">
                  {h.source} · {h.timeAgo}
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
