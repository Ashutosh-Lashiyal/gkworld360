// useHideOnScroll() — true while the reader is scrolling DOWN the page, false
// when they scroll up, are near the top, or reach the bottom
// (redesign phase 2, 30 Oct 2026). Client components only.
//
// The phone tab bar and the phone reading bar use it to slide out of the way
// while you read, and come back the moment you scroll up — the way apps do.
// A new page always starts with the bar showing.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useHideOnScroll(): boolean {
  const pathname = usePathname();
  const [away, setAway] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 40;
      // 4px of "slack" so a shaky thumb doesn't make the bar flicker
      if (y > 260 && y > last + 4 && !atBottom) setAway(true);
      else if (y < last - 4 || y < 260 || atBottom) setAway(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A new page always starts with the bar showing. (Reset while drawing when
  // the address changes — React's recommended pattern, no extra effect.)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setAway(false);
  }

  return away;
}
