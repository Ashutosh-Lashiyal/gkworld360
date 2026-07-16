// /pulse — the dedicated "Latest Headlines" feed page.
// Shows ALL stored headlines (the rolling 7-day window) in strict newest-first
// order, 50 per page with Previous/Next paging (URL: /pulse?page=2).
import type { Metadata } from "next";
import Link from "next/link";
import { getHeadlinesPage } from "@/lib/pulse";
import LatestHeadlines from "@/components/LatestHeadlines";

// Render this page fresh on EVERY visit (never freeze/cache it). This is what
// makes the headlines live: each request re-reads the store and re-computes the
// "X ago" times, and it lets the background refresh (via after()) actually run
// in production. Without this, Next.js would bake the page once at deploy time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Headlines — Current Affairs | GKWorld360",
  description:
    "Fresh current-affairs headlines from trusted Indian news sources, curated for competitive-exam aspirants and general-knowledge learners.",
};

// In Next 16, `searchParams` is a Promise — we await it to read ?page=N.
export default async function PulsePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  // Parse ?page= safely: default to 1, never below 1.
  const requestedPage = Math.max(1, Number(sp.page) || 1);
  const { items, page, totalPages, totalDocs } = await getHeadlinesPage(
    requestedPage,
    50
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-navy tracking-tight">
            Latest Headlines
          </h1>
          <p className="font-body text-base text-muted mt-2 max-w-2xl">
            Fresh current affairs from trusted sources, updated through the day.
            Tap any headline to read the full story at its original source.
          </p>
        </div>
        <Link
          href="/saved"
          className="flex items-center gap-2 font-body text-sm font-medium text-sapphire hover:text-sapphire-dark border border-hairline hover:border-sapphire rounded-full px-4 py-2 whitespace-nowrap transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Read Later
        </Link>
      </header>

      {/* Retention notice — headlines are kept for a rolling week */}
      <div className="mb-8 border-l-2 border-sapphire pl-3 py-1 font-body text-sm text-muted">
        <strong className="font-semibold text-navy">Note:</strong> Headlines stay here for about{" "}
        <strong className="font-semibold text-navy">1 week</strong>. Want to keep one longer? Tap the{" "}
        <strong className="font-semibold text-navy">bookmark icon</strong> on any headline to save it to
        your <strong className="font-semibold text-navy">Read Later</strong> list.
      </div>

      {/* How many + ordering, so users know what they're looking at */}
      <p className="mb-4 font-body text-sm text-muted">
        <strong className="font-semibold text-navy">{totalDocs}</strong> headlines
        from the last 7 days · newest first
      </p>

      <LatestHeadlines items={items} />

      {/* Pagination — the feed is newest-first, so "Newer" moves toward page 1 */}
      {totalPages > 1 && (
        <nav
          className="mt-10 flex items-center justify-between gap-4"
          aria-label="Headlines pagination"
        >
          {page > 1 ? (
            <Link
              href={`/pulse?page=${page - 1}`}
              className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark border border-hairline hover:border-sapphire rounded-full px-4 py-2 transition-colors"
            >
              ← Newer
            </Link>
          ) : (
            <span className="font-body text-sm font-medium text-muted/40 border border-hairline rounded-full px-4 py-2 cursor-not-allowed">
              ← Newer
            </span>
          )}

          <span className="font-body text-sm text-muted">
            Page <strong className="font-semibold text-navy">{page}</strong> of{" "}
            {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              href={`/pulse?page=${page + 1}`}
              className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark border border-hairline hover:border-sapphire rounded-full px-4 py-2 transition-colors"
            >
              Older →
            </Link>
          ) : (
            <span className="font-body text-sm font-medium text-muted/40 border border-hairline rounded-full px-4 py-2 cursor-not-allowed">
              Older →
            </span>
          )}
        </nav>
      )}

      {/* Transparency + attribution note (honest + copyright-clean) */}
      <p className="font-body text-xs text-muted mt-10 pt-6 border-t border-hairline">
        Headlines are aggregated from publishers&apos; public RSS feeds and link
        to the original articles. GKWorld360 does not host this content — all
        credit and copyright belong to the respective sources.
      </p>
    </div>
  );
}
