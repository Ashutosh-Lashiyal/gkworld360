"use client";

// AlsoInHindi — a small note at the top of an ENGLISH article that also exists
// in Hindi (Hindi discoverability, 2 Nov 2026):
//
//   [हिं]  यह लेख हिन्दी में भी है
//          हिन्दी में पढ़ें →                              ×
//
// WHO SEES IT: readers who chose Hindi once (the header switch or the welcome
// strip), or whose phone is set to Hindi and haven't chosen English. That
// decision is made before the page is drawn (MODE_SCRIPT sets
// data-prefers-hi on <html>, globals.css shows the note) — so it never pops
// in late. Everyone else never sees it; the meta line's "हिन्दी में पढ़ें"
// link is still there for them.
//
// × hides it for this article until the tab is closed.

import { useEffect, useState } from "react";
import Link from "next/link";
import { chooseLanguage } from "@/lib/lang";

export default function AlsoInHindi({ hiHref }: { hiHref: string }) {
  const key = `gk-also-hi-closed:${hiHref}`;
  const [closed, setClosed] = useState(false);

  // Closed earlier in this visit? (Read once React has started, in the browser.)
  useEffect(() => {
    let wasClosed = false;
    try { wasClosed = sessionStorage.getItem(key) === "1"; } catch { /* storage blocked */ }
    if (!wasClosed) return;
    const frame = requestAnimationFrame(() => setClosed(true));
    return () => cancelAnimationFrame(frame);
  }, [key]);

  if (closed) return null;

  const close = () => {
    try { sessionStorage.setItem(key, "1"); } catch { /* not remembered — fine */ }
    setClosed(true);
  };

  return (
    <div className="gk-also-hi mt-5" lang="hi" role="note">
      <span aria-hidden="true" className="gk-also-hi__ic">हिं</span>
      <div className="min-w-0 flex-1">
        <b className="block font-hindi text-[15px] font-bold leading-snug text-foreground">यह लेख हिन्दी में भी है</b>
        <Link href={hiHref} hrefLang="hi" onClick={() => chooseLanguage("hi")} className="font-hindi text-sm font-bold text-accent hover:underline underline-offset-4">
          हिन्दी में पढ़ें →
        </Link>
      </div>
      <button type="button" lang="en" aria-label="Close" onClick={close} className="px-1.5 text-[22px] leading-none text-muted hover:text-foreground">×</button>
    </div>
  );
}
