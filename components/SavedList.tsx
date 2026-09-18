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
import { SOURCE_ICONS, CATEGORY_COLOR } from "@/lib/pulse-sources";


export default function SavedList() {
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
      window.dispatchEvent(new CustomEvent("gk-toast", { detail: { message: "Read Later list cleared" } }));
    } else {
      const link = confirm.link;
      write(readSaved().filter((h) => h.link !== link));
      window.dispatchEvent(new CustomEvent("gk-toast", { detail: { message: "Removed from Read Later" } }));
    }
    setConfirm(null);
  }

  const count = items?.length ?? 0;

  return (
    <>
      <PageTitle
        colors={null}
        label="Your list · on this device"
        title="Read Later"
        description="Saved headlines stay here until you remove them."
      >
        <span className="font-body text-[13px] text-muted">
          {items === null ? "Loading…" : `${count} saved ${count === 1 ? "headline" : "headlines"}`}
        </span>
        {count > 0 && (
          <Button variant="danger" onClick={() => setConfirm({ kind: "all" })}>
            Clear all
          </Button>
        )}
      </PageTitle>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 pt-10 pb-14">
        {/* The honest note about where this list lives */}
        <p className="mb-6 font-body text-[13px] text-muted border-l-2 border-hairline pl-3">
          This list is saved in this browser only — your phone and computer each keep their own, and
          clearing browser data erases it. Accounts, coming soon, will sync it across devices.
        </p>

        {items === null ? null : items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-hairline">
            <p className="font-heading text-xl font-semibold text-navy-dark">Nothing saved yet</p>
            <p className="font-body text-muted mt-2">Tap the bookmark on any headline to keep it here.</p>
            <div className="mt-6">
              <Button href="/pulse">Browse Latest Headlines →</Button>
            </div>
          </div>
        ) : (
          <ol className="m-0 p-0 list-none flex flex-col lg:max-w-[880px]">
            {items.map((h, i) => (
              <li
                key={h.link}
                className="grid grid-cols-[64px_minmax(0,1fr)_44px] md:grid-cols-[72px_minmax(0,1fr)_44px] gap-3.5 md:gap-4 items-center py-3.5 border-b border-border-subtle"
              >
                <a
                  href={h.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="relative block w-16 h-16 md:w-[72px] md:h-[72px] overflow-hidden bg-navy-dark"
                >
                  <HeadlineThumb src={h.image} number={i + 1} variant="row" />
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
                        /* eslint-disable-next-line @next/next/no-img-element -- tiny local favicon */
                        <img src={SOURCE_ICONS[h.source]} alt="" width={14} height={14} className="w-3.5 h-3.5" />
                      )}
                      {h.source}
                    </span>
                    <span className="ml-0.5">Saved {new Date(h.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  </span>
                </a>

                {/* Remove — asks first */}
                <button
                  type="button"
                  onClick={() => setConfirm({ kind: "one", link: h.link, title: h.title })}
                  aria-label="Remove from Read Later"
                  title="Remove"
                  className="flex items-center justify-center w-11 h-11 border border-hairline bg-surface text-muted hover:border-[#b91c1c] hover:text-[#b91c1c] transition-colors"
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
        title={confirm?.kind === "all" ? "Clear your whole list?" : "Remove this headline?"}
        message={
          confirm?.kind === "all"
            ? `All ${count} saved ${count === 1 ? "headline" : "headlines"} will be removed from this device. This cannot be undone.`
            : `"${confirm?.kind === "one" ? confirm.title : ""}" will be removed from your Read Later list.`
        }
        confirmLabel={confirm?.kind === "all" ? "Yes, clear all" : "Yes, remove"}
        onConfirm={doConfirm}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
