// PulsePage — the headlines ARCHIVE, in English (/pulse) or Hindi (/hi/pulse).
// (components/pages/ — see the folder note in AboutPage.tsx.)
//
// Shows every stored headline from the last 7 days, newest first, 50 per page,
// with optional filters by category and by source. Headlines link OUT to the
// publisher; we aggregate, we don't host. If the database is unreachable the
// data helper falls back to the live RSS feeds (see lib/pulse.ts).
//
// REDESIGN 16 Sep 2026 (boards 6 / 6b), title block instead of a band since
// 17 Sep (board 11) → filter chips → the list with 72px thumbnails
// (option B: a numbered square when the feed has no image, so the list never
// has a hole) + a sidebar (Read Later peek, Sources) → pagination buttons.
//
// URL shape: /pulse?page=2&category=National&source=The%20Hindu
//
// TWO LANGUAGES (3 Nov 2026, the whole site in Hindi, phase 4): this file used
// to be app/(frontend)/pulse/page.tsx. It moved here so two addresses share it:
//   app/(frontend)/pulse/page.tsx     → <PulsePage lang="en" … />  ("/pulse")
//   app/(frontend)/hi/pulse/page.tsx  → <PulsePage lang="hi" … />  ("/hi/pulse")
// The Hindi page shows ONLY the Hindi newspapers' headlines (Amar Ujala, Live
// Hindustan), with Hindi words from lib/page-text.ts (pulse) and Hindi names for
// the categories and sources (lib/pulse-sources.ts). The filter values in the
// address stay English on both pages (?category=Sports) — they're keys, not
// words a reader sees.
// Server component.

import Link from "next/link";
import Button from "@/components/Button";
import PageTitle from "@/components/PageTitle";
import HeadlineRow from "@/components/HeadlineRow";
import ReadLaterPeek from "@/components/ReadLaterPeek";
import { getHeadlinesPage, HEADLINE_CATEGORIES, headlineSources } from "@/lib/pulse";
import { categoryLabel, sourceLabel } from "@/lib/pulse-sources";
import { PAGE_TEXT } from "@/lib/page-text";
import { localHref } from "@/lib/site-text";
import type { Lang } from "@/lib/lang";

const PER_PAGE = 50;

// What the address can carry — the page file reads it and hands it over
export type PulseQuery = { page?: string; category?: string; source?: string };

export default async function PulsePage({ lang, query }: { lang: Lang; query: PulseQuery }) {
  const t = PAGE_TEXT[lang].pulse;
  const hi = lang === "hi";
  // This language's newspapers (the source chips and the Sources card)
  const sources = headlineSources(lang);
  // This page's own address: "/pulse" or "/hi/pulse"
  const base = localHref(lang, "/pulse");

  const requestedPage = Math.max(1, Number(query.page) || 1);

  // Accept a filter only if it is one of OUR values — anything else in the URL
  // is ignored rather than passed to the database.
  const category = HEADLINE_CATEGORIES.includes(query.category ?? "") ? query.category : undefined;
  const source = sources.some((s) => s.source === query.source) ? query.source : undefined;

  const { items, page, totalPages, totalDocs } = await getHeadlinesPage(requestedPage, PER_PAGE, {
    category,
    source,
    lang, // only this language's headlines
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
    return qs ? `${base}?${qs}` : base;
  };

  // One chip. `on` = the active filter (filled); otherwise an outline.
  // PHASE 4 (30 Oct 2026): chunky round chips (gk-chip in globals.css).
  const chip = (key: string, label: string, to: string, on: boolean) => (
    <Link
      key={key}
      href={to}
      aria-current={on ? "true" : undefined}
      className="gk-chip"
    >
      {label}
    </Link>
  );

  const first = (page - 1) * PER_PAGE + 1; // number shown on the first row of this page
  const filtered = Boolean(category || source);
  const [countBefore, countAfter] = t.count(filtered);
  const [pageBefore, pageAfter] = t.pageOf(totalPages);

  const body = (
    <>
      {/* 17 Sep 2026: the same centred title block as every other page (board 11);
          no breadcrumb here — a lone "Home" link was noise. */}
      <PageTitle
        colors={null}
        label={t.label}
        title={t.title}
      >
        <p className="m-0 w-full flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-sm text-muted">
          <span>
            {countBefore}
            <strong className="font-semibold text-navy-dark">{totalDocs}</strong>
            {countAfter}
          </span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span>{t.newest}</span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span className="inline-flex items-center gap-1.5">
            {t.tap[0]}
            <span aria-hidden="true" className="inline-flex items-center justify-center w-6 h-6 rounded-md border-2 border-hairline bg-surface">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            </span>
            {t.tap[1]}
          </span>
        </p>
        <Button href={localHref(lang, "/saved")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {t.readLater}
        </Button>
      </PageTitle>

      <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 pb-6">
        {/* ── FILTER CHIPS — scroll sideways on phones, wrap on desktop ─────── */}
        <div className="-mx-4 px-4 md:mx-0 md:px-0 flex md:flex-wrap items-center gap-2.5 overflow-x-auto [scrollbar-width:none] pb-1">
          {chip("all", t.all, href({ category: undefined }), !category)}
          {/* the key stays English (it goes in the address); the label is in the page's language */}
          {HEADLINE_CATEGORIES.map((c) => chip(c, categoryLabel(c, lang), href({ category: c }), category === c))}
          <span aria-hidden="true" className="w-px h-6 bg-hairline mx-1.5 flex-shrink-0" />
          {sources.map(({ source: s }) => chip(s, sourceLabel(s, lang), href({ source: source === s ? undefined : s }), source === s))}
        </div>

        {/* ── LIST + SIDEBAR ─────────────────────────────────────────────────── */}
        <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-14 lg:items-start">
          <div className="lg:col-span-8">
            {items.length > 0 ? (
              <ol className="gk-card m-0 p-2 list-none flex flex-col">
                {items.map((h, i) => (
                  <HeadlineRow key={h.link} headline={h} index={first + i} lang={lang} />
                ))}
              </ol>
            ) : (
              <div className="py-16 text-center">
                <p className="font-body text-lg text-muted">{t.empty(filtered)}</p>
              </div>
            )}

            {/* Pagination — the feed is newest-first, so "Newer" moves toward page 1 */}
            {totalPages > 1 && (
              <nav className="mt-7 flex items-center justify-between gap-4" aria-label={t.pagination}>
                {page > 1 ? (
                  <Button href={href({ page: page - 1 })}>{t.newer}</Button>
                ) : (
                  <Button variant="disabled">{t.newer}</Button>
                )}
                <span className="font-body text-sm text-muted text-center">
                  {pageBefore}<strong className="font-semibold text-foreground">{page}</strong>{pageAfter}
                  <span className="hidden sm:inline">{t.perPage(PER_PAGE)}</span>
                </span>
                {page < totalPages ? (
                  <Button href={href({ page: page + 1 })}>{t.older}</Button>
                ) : (
                  <Button variant="disabled">{t.older}</Button>
                )}
              </nav>
            )}

            <p className="mt-7 pt-4 border-t border-border-subtle font-body text-xs leading-relaxed text-muted">
              {t.credit}
            </p>
          </div>

          {/* Sidebar: your saved list, then the sources as a dark card */}
          <aside className="mt-10 lg:mt-0 lg:col-span-4 flex flex-col gap-5">
            <ReadLaterPeek />
            <div className="flex flex-col gap-2 bg-navy-dark text-on-dark rounded-card border-2 border-[var(--stage-line)] px-5 py-5">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">{t.sources}</span>
              <ul className="m-0 p-0 list-none flex flex-col">
                {sources.map(({ source: s, feeds }) => (
                  <li key={s} className="flex justify-between py-1.5 border-b border-on-dark/10 last:border-b-0 font-body text-sm">
                    <Link href={href({ source: s })} className="hover:text-mint transition-colors">{sourceLabel(s, lang)}</Link>
                    <span className="text-on-dark/60">{t.feeds(feeds)}</span>
                  </li>
                ))}
              </ul>
              <span className="mt-1 font-body text-xs text-on-dark/60">{t.refreshed}</span>
            </div>
          </aside>
        </div>
      </div>
    </>
  );

  // Hindi: wrapped so screen readers read it in Hindi (lang="hi") and the Hindi
  // type rules apply (globals.css, .gk-hi-page — shared by every Hindi page).
  return hi ? <div lang="hi" className="gk-hi-page">{body}</div> : body;
}
