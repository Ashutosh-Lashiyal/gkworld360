"use client";

// Sheet — a panel that slides up from the bottom of the screen on phones
// (redesign phase 2, 30 Oct 2026), the way apps show "more options".
// The phone reading bar uses it for Contents and for the Text settings.
//
// Closes when you tap the dark backdrop, press the × or press Escape.
//
// createPortal: the sheet is drawn straight into <body>, not inside the
// component that opened it. The reading bar slides up and down with a CSS
// transform, and a fixed-position element INSIDE a transformed one would move
// with it — drawing it in <body> keeps it pinned to the screen.

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  label: string;      // the small title at the top, also read out by screen readers
  closeLabel?: string; // "Close" (or the Hindi word on Hindi pages)
  lang?: "en" | "hi";  // the page's language — Hindi titles drop the spaced-out capitals
  children: ReactNode;
};

export default function Sheet({ open, onClose, label, closeLabel = "Close", lang = "en", children }: SheetProps) {
  // While open: Escape closes it, and the page behind can't scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = before;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      {/* the dimmed page behind; tapping it closes the sheet */}
      <div className="gk-sheet-bg fixed inset-0 z-[93] bg-black/45" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={label} lang={lang} className="gk-sheet fixed z-[94] inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface px-5 pt-2.5">
        {/* the little grab handle: tells people this is a sheet */}
        <span aria-hidden="true" className="block w-11 h-[5px] mx-auto mb-3 rounded-full bg-line-2" />
        <div className="flex items-center justify-between mb-3">
          <h2 className="gk-label m-0 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-faint">{label}</h2>
          <button type="button" onClick={onClose} aria-label={closeLabel} className="w-9 h-9 -mr-2 grid place-items-center rounded-full text-muted text-2xl leading-none hover:bg-surface-low">
            ×
          </button>
        </div>
        {children}
      </div>
    </>,
    document.body,
  );
}
