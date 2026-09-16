// /pulse — the headlines ARCHIVE ("View all" from the homepage band).
//
// Shows every stored headline from the last 7 days, newest first, 50 per page,
// with optional filters by category and by source. Headlines link OUT to the
// publisher; we aggregate, we don't host. If the database is unreachable the
// data helper falls back to the live RSS feeds (see lib/pulse.ts).
//
// REDESIGN 16 Sep 2026 (boards 6 / 6b): brand-teal band (headlines belong to
// the site, not to a subject) → filter chips → the list with 72px thumbnails
// (option B: a numbered square when the feed has no image, so the list never
// has a hole) + a sidebar (Read Later peek, Sources) → pagination buttons.
//
// URL shape: /pulse?page=2&category=National&source=The%20Hindu

import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/Button";
import PageBand from "@/components/PageBand";
import HeadlineRow from "@/components/HeadlineRow";
import ReadLaterPeek from "@/components/ReadLaterPeek";
import { getHeadlinesPage, HEADLINE_CATEGORIES, HEADLINE_SOURCES } from "@/lib/pulse";

// The page reads ?page= / ?category= / ?source= so it must render per request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Headlines — Current Affairs | GKWorld360",
  description:
    "Fresh current-affairs headlines from trusted Indian news sources, curated for competitive-exam aspirants and general-knowledge learners.",
};

const PER_PAGE = 50;

export default async function PulsePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; source?: string }>;
}) {
  const sp = await searchParams;
  const requestedPage = Math.max(1, Number(sp.page) || 1);

  // Accept a filter only if it is one of OUR values — anything else in the URL
  // is ignored rather than passed to the database.
  const category = HEADLINE_CATEGORIES.includes(sp.category ?? "") ? sp.category : undefined;
  const source = HEADLINE_SOURCES.some((s) => s.source === sp.source) ? sp.source : undefined;

  const { items, page, totalPages, totalDocs } = await getHeadlinesPage(requestedPage, PER_PAGE, {
    category,
    source,
  });

  // Builds a /pulse URL that keeps the current filters. `overrides` changes
  // one thing (a page number, a chip); `undefined` removes that key.
  const href = (overrides: { page?: number; category?: string; source?: string }) => {
    const next = { category, source, page: undefined as number | undefined, ...overrides };
    const q = new URLSearchParams();
    if (next.category) q.set("category", next.category);
    if (next.source) q.set("source", next.source);
    if (next.page && next.page > 1) q.set("page", String(next.page));
    const qs = q.toString();
    return qs ? `/pulse?${qs}` : "/pulse";
  };

  // One chip. `on` = the active filter (dark fill); otherwise a white outline.
  const chip = (label: string, to: string, on: boolean) => (
    <Link
      key={label}
      href={to}
      aria-current={on ? "true" : undefined}
      className={[
        "inline-flex items-center min-h-9 px-3.5 rounded-button border font-body text-[13px] font-semibold whitespace-nowrap transition-colors",
        on
          ? "bg-navy-dark border-navy-dark text-on-dark"
          : "bg-surface border-hairline text-foreground hover:border-navy-dark",
      ].join(" ")}
    >
      {label}
    </Link>
  );

  const first = (page - 1) * PER_PAGE + 1; // number shown on the first row of this page

  return (
    <>
      <PageBand colors={null} breadcrumbs={[]} size="compact">
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-3">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">
              Aggregated from trusted Indian sources · kept for about a week
            </span>
            <h1 className="m-0 font-heading text-4xl md:text-5xl font-bold leading-[1.05] tracking-[-0.02em] text-[#fffbf4]">
              Latest Headlines
            </h1>
            <p className="m-0 font-body text-sm text-[#fffbf4]/75">
              <strong className="font-semibold text-[#fffbf4]">{totalDocs}</strong> headlines from the last 7 days
              {category || source ? " matching your filter" : ""} · newest first · tap the bookmark to save one to Read Later
            </p>
          </div>
          {/* Read Later on a dark band → the inverted (white) button */}
          <Button href="/saved" variant="onDark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Read Later
          </Button>
        </div>
      </PageBand>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 pt-6 pb-14">
        {/* ── FILTER CHIPS — scroll sideways on phones, wrap on desktop ─────── */}
        <div className="-mx-4 px-4 md:mx-0 md:px-0 flex md:flex-wrap items-center gap-2.5 overflow-x-auto [scrollbar-width:none] pb-1">
          {chip("All", href({ category: undefined }), !category)}
          {HEADLINE_CATEGORIES.map((c) => chip(c, href({ category: c }), category === c))}
          <span aria-hidden="true" className="w-px h-6 bg-hairline mx-1.5 flex-shrink-0" />
          {HEADLINE_SOURCES.map(({ source: s }) => chip(s, href({ source: source === s ? undefined : s }), source === s))}
        </div>

        {/* ── LIST + SIDEBAR ─────────────────────────────────────────────────── */}
        <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-14 lg:items-start">
          <div className="lg:col-span-8">
            {items.length > 0 ? (
              <ol className="m-0 p-0 list-none flex flex-col">
                {items.map((h, i) => (
                  <HeadlineRow key={h.link} headline={h} index={first + i} />
                ))}
              </ol>
            ) : (
              <div className="py-16 text-center">
                <p className="font-body text-lg text-muted">
                  No headlines {category || source ? "match that filter" : "right now"}. Check back soon.
                </p>
              </div>
            )}

            {/* Pagination — the feed is newest-first, so "Newer" moves toward page 1 */}
            {totalPages > 1 && (
              <nav className="mt-7 flex items-center justify-between gap-4" aria-label="Headlines pagination">
                {page > 1 ? (
                  <Button href={href({ page: page - 1 })}>← Newer</Button>
                ) : (
                  <Button variant="disabled">← Newer</Button>
                )}
                <span className="font-body text-sm text-muted text-center">
                  Page <strong className="font-semibold text-foreground">{page}</strong> of {totalPages}
                  <span className="hidden sm:inline"> · {PER_PAGE} per page</span>
                </span>
                {page < totalPages ? (
                  <Button href={href({ page: page + 1 })}>Older →</Button>
                ) : (
                  <Button variant="disabled">Older →</Button>
                )}
              </nav>
            )}

            <p className="mt-7 pt-4 border-t border-border-subtle font-body text-xs leading-relaxed text-muted">
              Headlines are aggregated from publishers&apos; public RSS feeds and link to the original
              articles. GKWorld360 does not host this content — all credit and copyright belong to
              the respective sources.
            </p>
          </div>

          {/* Sidebar: your saved list, then the sources as a dark card */}
          <aside className="mt-10 lg:mt-0 lg:col-span-4 flex flex-col gap-5">
            <ReadLaterPeek />
            <div className="flex flex-col gap-2 bg-navy-dark text-on-dark rounded-card px-5 py-5">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">Sources</span>
              <ul className="m-0 p-0 list-none flex flex-col">
                {HEADLINE_SOURCES.map(({ source: s, feeds }) => (
                  <li key={s} className="flex justify-between py-1.5 border-b border-on-dark/10 last:border-b-0 font-body text-sm">
                    <Link href={href({ source: s })} className="hover:text-mint transition-colors">{s}</Link>
                    <span className="text-on-dark/60">{feeds} {feeds === 1 ? "feed" : "feeds"}</span>
                  </li>
                ))}
              </ul>
              <span className="mt-1 font-body text-xs text-on-dark/60">Refreshed every 30 minutes.</span>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
