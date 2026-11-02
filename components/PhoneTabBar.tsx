"use client";

// ── THE PHONE TAB BAR (redesign phase 1, 30 Oct 2026) ────────────────────────
// Phones only (hidden from 768px up). Most visitors read on a phone, so the
// five main places sit along the bottom of the screen, where the thumb already
// is — the way apps work:
//
//      Home   Learn   [Gyaani]   News   Atlas
//
// Gyaani sits raised in the middle. Pressing it sends a little message
// ("event") called "gk:open-gyaani" that components/Gyaani.tsx listens for —
// the two components never need to know about each other directly.
//
// Like the header, the bar slides away while you scroll down to read and
// comes back when you scroll up (or reach the bottom of the page).
// Its colours and the pill behind the current tab are in globals.css (.gk-tab…).

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getSubjectFromPath } from "@/lib/subject-colors";
import { useHideOnScroll } from "@/lib/use-hide-on-scroll";
// The page's language and its words — Hindi pages: होम · सीखें · ज्ञानी · समाचार · एटलस (2 Nov 2026)
import { useSiteText } from "@/lib/use-site-text";

// Each icon is one simple outline drawing (24 × 24)
const ICONS = {
  home: "M4 10.5 12 4l8 6.5V20h-5v-6h-6v6H4z",
  learn: "M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5zM12 6v13.5",
  news: "M5 4h11v16H6a2 2 0 0 1-2-2V5zM16 8h4v10a2 2 0 0 1-2 2h-2M7.5 8h5M7.5 11.5h5M7.5 15h3",
  atlas: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 1 0 0-17zM3.5 12h17M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17",
};
function TabIcon({ d }: { d: string }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function PhoneTabBar() {
  const pathname = usePathname();
  // Slide away on scroll down, back on scroll up or at the very bottom
  // (lib/use-hide-on-scroll.ts — shared with the article reading bar)
  const away = useHideOnScroll();

  const { t, href } = useSiteText();
  const atlasHref = href("/atlas"); // the Hindi Atlas on Hindi pages

  // Which tab is "where you are" (the /hi versions count too)
  const on = {
    home: pathname === "/" || pathname === "/hi",
    learn: /^\/(hi\/)?subjects$/.test(pathname) || !!getSubjectFromPath(pathname),
    news: /^\/(hi\/)?(news|pulse)(\/|$)/.test(pathname),
    atlas: /^\/(hi\/)?atlas(\/|$)/.test(pathname),
  };
  const tab = "gk-tab relative flex flex-col items-center justify-end gap-1 h-14 font-body text-[11px] font-extrabold tracking-[0.02em]";
  const current = (b: boolean) => (b ? ("page" as const) : undefined);

  return (
    <nav
      aria-label={t.phone.mainNav}
      // md:hidden — only on phones. fixed + left/right 10px: a floating bar.
      className={`gk-tabbar gk-tabbar--main md:hidden fixed z-40 left-2.5 right-2.5 h-[66px] px-1.5 pb-2 rounded-[24px] grid grid-cols-5 items-end ${away ? "is-away" : ""}`}
    >
      <Link href={href("/")} className={tab} aria-current={current(on.home)}><TabIcon d={ICONS.home} />{t.phone.home}</Link>
      <Link href={href("/subjects")} className={tab} aria-current={current(on.learn)}><TabIcon d={ICONS.learn} />{t.phone.learn}</Link>

      {/* Gyaani, raised in the middle. A button (not a link): it opens the chat. */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("gk:open-gyaani"))}
        aria-label={t.phone.askGyaani}
        className={`${tab} gk-tab-gyaani text-foreground`}
      >
        <Image src="/images/vivekananda.png" alt="" width={54} height={54} className="w-[54px] h-[54px] -mt-[26px] rounded-full object-cover bg-[#0b0b0d]" />
        {t.phone.gyaani}
      </button>

      <Link href={href("/news")} className={tab} aria-current={current(on.news)}><TabIcon d={ICONS.news} />{t.phone.news}</Link>
      <Link href={atlasHref} className={tab} aria-current={current(on.atlas)}><TabIcon d={ICONS.atlas} />{t.phone.atlas}</Link>
    </nav>
  );
}
