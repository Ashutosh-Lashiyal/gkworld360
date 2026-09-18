"use client";
// NavigationLoader — shows the book animation while the site moves from one
// page to another (18 Sep 2026). Before this, clicking a filter chip on /pulse
// or a card gave no feedback for a second or two, because Next.js keeps the
// OLD page on screen until the new one is ready.
//
// How it works: we listen for clicks on any internal link. When one is
// clicked we remember where it's going; while the browser's address hasn't
// reached that place yet, we show the overlay. The moment the URL changes
// (Next.js has swapped the page in) the overlay disappears. No state is set
// inside an effect — "pending" is DERIVED from (where we're going) ≠ (where we
// are), which keeps React happy and can never get stuck: a safety timer also
// clears it after 8 s in case a navigation is cancelled.
//
// The overlay waits 800 ms before fading in (see .nav-loader in globals.css),
// so only genuinely slow page changes show it. There are no page skeletons any
// more — the page you're on stays put, dimmed and blurred, until the next one
// is ready (owner's choice, 18 Sep).

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import BookLoader from "@/components/BookLoader";

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;

  const [target, setTarget] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Only plain left-clicks on our own links (no new-tab modifiers, no
      // external sites, no downloads, no in-page anchors, no hash links).
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;
      const dest = `${url.pathname}${url.search}`;
      if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (dest === `${window.location.pathname}${window.location.search}`) return;

      setTarget(dest);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setTarget(null), 8000); // never stuck
    };
    // Capture phase (`true`): we see the click BEFORE Next.js's link handler,
    // which marks it as handled — in the normal phase we'd never hear it.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const pending = target !== null && target !== current;
  if (!pending) return null;

  return (
    <div
      aria-hidden="true"
      className="nav-loader fixed inset-0 z-[70] flex items-center justify-center bg-background/70 backdrop-blur-sm pointer-events-none"
    >
      <BookLoader />
    </div>
  );
}
