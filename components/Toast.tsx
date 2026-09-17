"use client";
// Toast — a small confirmation bar at the bottom of the screen ("Saved to Read
// Later · View list"). Added 17 Sep 2026 because tapping the bookmark gave no
// feedback at all — the icon changed, but nothing told the reader what happened.
//
// HOW IT WORKS: any component can show a message by firing a browser event:
//   window.dispatchEvent(new CustomEvent("gk-toast", { detail: { message, actionLabel?, actionHref? } }))
// This component (mounted once, in the layout) listens for that event, shows
// the bar for ~3 seconds, then hides it. One listener for the whole site.
//
// "use client" because it needs browser events, timers and state.

import { useEffect, useState } from "react";
import Link from "next/link";

type ToastDetail = { message: string; actionLabel?: string; actionHref?: string };

export default function Toast() {
  const [toast, setToast] = useState<ToastDetail | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;

    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      if (!detail?.message) return;
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
      setToast(detail);
      setVisible(true);
      hideTimer = setTimeout(() => setVisible(false), 3000); // slide out after 3 s
      clearTimer = setTimeout(() => setToast(null), 3400);   // then unmount
    };

    window.addEventListener("gk-toast", onToast);
    return () => {
      window.removeEventListener("gk-toast", onToast);
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, []);

  if (!toast) return null;

  return (
    // role="status" + aria-live: screen readers announce it without stealing focus.
    // Bottom-centre so it never covers the Gyaani button (bottom-right).
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed left-1/2 bottom-6 z-[60] -translate-x-1/2 max-w-[calc(100vw-2rem)]",
        "flex items-center gap-4 min-h-12 px-5 rounded-button bg-navy-dark text-on-dark border border-mint/40 shadow-[0_12px_32px_rgba(0,0,0,0.3)]",
        "font-body text-sm font-medium transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      ].join(" ")}
    >
      <span className="inline-flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-mint">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        {toast.message}
      </span>
      {toast.actionLabel && toast.actionHref && (
        <Link href={toast.actionHref} className="text-mint hover:text-on-dark font-semibold whitespace-nowrap transition-colors">
          {toast.actionLabel} →
        </Link>
      )}
    </div>
  );
}
