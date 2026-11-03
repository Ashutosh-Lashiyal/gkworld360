"use client";
// SavedList — the /saved ("Read Later") page. Shows the headlines this visitor
// has bookmarked, from the browser's localStorage (no account yet).
//
// 18 Sep 2026: rebuilt to match /pulse — the same centred title block, the same
// rows (thumbnail · title · category + agency tags · time) and a Remove
// button per row. "Clear all" is the site's one red button, and both it and
// Remove ask for confirmation first (components/ConfirmDialog.tsx).
//
// "use client" because localStorage and the dialogs live in the browser.

import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import HeadlineThumb from "@/components/HeadlineThumb";
import { READ_LATER_KEY, readSaved, type SavedHeadline } from "@/components/ReadLaterButton";
// categoryLabel / sourceLabel: "खेल", "अमर उजाला" on Hindi pages (3 Nov 2026, phase 4)
import { SOURCE_ICONS, CATEGORY_COLOR, categoryLabel, sourceLabel } from "@/lib/pulse-sources";
// HINDI (2 Nov 2026, phase 2): /hi/saved shows this same list with Hindi words.
// The list itself is shared — what you save on an English page shows here too.
import { useSiteText } from "@/lib/use-site-text";
import { PAGE_TEXT } from "@/lib/page-text";


export default function SavedList() {
  const { lang, href } = useSiteText();
  const t = PAGE_TEXT[lang].saved;
  const [items, setItems] = useState<SavedHeadline[] | null>(null);
  // Which question is open: clear everything, or remove one link (by its URL)
  const [confirm, setConfirm] = useState<{ kind: "all" } | { kind: "one"; link: string; title: string } | null>(null);

  useEffect(() => {
    const load = () => setItems(readSaved().sort((a, b) => b.savedAt - a.savedAt));
    load();
    window.addEventListener("read-later-changed", load);
    return () => window.removeEventListener("read-later-changed", load);
  }, []);

  function write(next: SavedHeadline[]) {
    localStorage.setItem(READ_LATER_KEY, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event("read-later-changed"));
  }

  function doConfirm() {
    if (!confirm) return;
    if (confirm.kind === "all") {
      write([]);
      window.dispatchEvent(new CustomEvent("gk-toast", { detail: { message: t.cleared } }));
    } else {
      const link = confirm.link;
      write(readSaved().filter((h) => h.link !== link));
      window.dispatchEvent(new CustomEvent("gk-toast", { detail: { message: t.removed } }));
    }
    setConfirm(null);
  }

  const count = items?.length ?? 0;

  return (
    <>
      <PageTitle
        colors={null}
        label={t.label}
        title={t.title}
        description={t.description}
      >
        <span className="font-body text-[13px] text-muted">
          {items === null ? t.loading : t.count(count)}
        </span>
        {count > 0 && (
          <Button variant="danger" onClick={() => setConfirm({ kind: "all" })}>
            {t.clearAll}
          </Button>
        )}
      </PageTitle>

      <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 pb-6">
        {/* The honest note about where this list lives */}
        <p className="m-0 mb-6 max-w-[880px] font-body text-[13px] text-muted border-l-2 border-hairline pl-3">
          {t.note}
        </p>

        {items === null ? null : items.length === 0 ? (
          <div className="gk-card max-w-[880px] text-center py-14 px-6">
            <p className={`m-0 font-display text-4xl uppercase text-foreground ${lang === "hi" ? "font-bold leading-snug" : ""}`}>{t.emptyTitle}</p>
            <p className="m-0 font-body text-muted mt-2">{t.emptyText}</p>
            <div className="mt-6">
              <Button href={href("/pulse")}>{t.browse}</Button>
            </div>
          </div>
        ) : (
          <ol className="gk-card m-0 p-2 list-none flex flex-col lg:max-w-[880px]">
            {items.map((h, i) => (
              <li
                key={h.link}
                className="gk-hl grid grid-cols-[64px_minmax(0,1fr)_44px] md:grid-cols-[72px_minmax(0,1fr)_44px] gap-3.5 md:gap-4 items-center p-3 md:p-3.5 rounded-2xl"
              >
                <a
                  href={h.link}
                  // Headlines open the publisher's site in a new tab; our own
                  // articles (saved from an article page, links starting with
                  // "/") open right here, like any page of the site.
                  target={h.link.startsWith("/") ? undefined : "_blank"}
                  rel={h.link.startsWith("/") ? undefined : "noopener noreferrer"}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="relative block w-16 h-16 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden bg-navy-dark"
                >
                  <HeadlineThumb src={h.image} number={i + 1} variant="row" />
                </a>

                <a
                  href={h.link}
                  target={h.link.startsWith("/") ? undefined : "_blank"}
                  rel={h.link.startsWith("/") ? undefined : "noopener noreferrer"}
                  className="group flex flex-col gap-1 min-w-0 text-foreground"
                >
                  <span className="font-body text-[15px] md:text-[17px] font-bold leading-[1.4] text-foreground group-hover:text-accent transition-colors line-clamp-3 md:line-clamp-2">
                    {h.title}
                  </span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 font-body text-[13px] font-semibold text-faint">
                    {h.category && (
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold normal-case tracking-normal"
                        style={{
                          color: `color-mix(in srgb, ${CATEGORY_COLOR[h.category] ?? "#4a6460"} 60%, var(--ink))`,
                          backgroundColor: `color-mix(in srgb, ${CATEGORY_COLOR[h.category] ?? "#4a6460"} 14%, transparent)`,
                        }}
                      >
                        {categoryLabel(h.category, lang)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 font-semibold text-faint">
                      {SOURCE_ICONS[h.source] && (
                        /* eslint-disable-next-line @next/next/no-img-element -- tiny local favicon */
                        <img src={SOURCE_ICONS[h.source]} alt="" width={14} height={14} className="w-3.5 h-3.5" />
                      )}
                      {sourceLabel(h.source, lang)}
                    </span>
                    <span className="ml-0.5">{t.savedOn(new Date(h.savedAt).toLocaleDateString(t.dateLocale, { day: "numeric", month: "short" }))}</span>
                  </span>
                </a>

                {/* Remove — asks first */}
                <button
                  type="button"
                  onClick={() => setConfirm({ kind: "one", link: h.link, title: h.title })}
                  aria-label={t.removeLabel}
                  title={t.remove}
                  className="flex items-center justify-center w-11 h-11 rounded-xl border-2 border-hairline bg-surface text-muted hover:border-[#dc2626] hover:text-[#dc2626] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.kind === "all" ? t.confirmAllTitle : t.confirmOneTitle}
        message={confirm?.kind === "all" ? t.confirmAllText(count) : t.confirmOneText(confirm?.kind === "one" ? confirm.title : "")}
        confirmLabel={confirm?.kind === "all" ? t.yesAll : t.yesOne}
        cancelLabel={t.cancel}
        onConfirm={doConfirm}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
