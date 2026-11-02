"use client";

// ── THE SITE HEADER ──────────────────────────────────────────────────────────
// REDESIGN 30 Oct 2026 (phase 1): a floating, see-through PILL near the top of
// the page (the "Playful + Cinematic" look), instead of the full-width dark bar.
//
//   [GK WORLD360]   Home  Subjects▾  Atlas NEW  Current Affairs  Headlines   [Search] [🔖] [🔔] [☀] [☰]
//
// What's kept from the old header (owner's features, unchanged):
//   - the Subjects menu with every subject, its Hindi name and live topic counts
//     (subjects without a page yet are greyed and not links);
//   - Atlas with its "New" tag (the Hindi Atlas on Hindi pages);
//   - Current Affairs, Headlines, search, Read Later (bookmark) and the language switch.
// What's new:
//   - the animated Day & Night logo (components/Logo.tsx);
//   - the EN | हिं language switch (components/LangSwitch.tsx, replaced the bell 2 Nov 2026);
//   - the sun/moon button for Light / Dark (components/ThemeToggle.tsx);
//   - phones and tablets get a FULL-SCREEN menu with big links, and phones also
//     get the tab bar at the bottom (components/PhoneTabBar.tsx);
//   - the header slides away while you scroll down to read, and comes back the
//     moment you scroll up.
// The colours come from globals.css (classes starting with gk-), so the header
// follows Light / Dark / Reading automatically.
//
// HINDI (the whole site in Hindi, phase 1, 2 Nov 2026): on a /hi page every
// word is Hindi (lib/site-text.ts), "Home" leads to /hi, the Subjects menu
// shows the Hindi names big and counts Hindi articles, and links go to a page's
// Hindi twin when it exists (otherwise the English page — the owner's call).

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getSubjectFromPath, SUBJECT_COLORS } from "@/lib/subject-colors";
import { SUBJECTS } from "@/lib/subjects";
// The EN | हिं language switch (replaced the bell, 2 Nov 2026)
import LangSwitch from "@/components/LangSwitch";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { currentMode, setMode } from "@/lib/mode";
// usePresence keeps a menu on the page for a moment after it closes, so it can
// fade out instead of vanishing (lib/use-presence.ts, 28 Oct 2026).
import { usePresence } from "@/lib/use-presence";
// This page's language and its words (lib/site-text.ts)
import { useSiteText } from "@/lib/use-site-text";
// The same sun and moon drawings as the header's Light/Dark button
import { SunIcon, MoonIcon } from "@/components/ThemeToggle";

// ── small icons ──
function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}
function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
// The small "New" / "नया" tag next to Atlas
function NewTag({ label }: { label: string }) {
  return (
    <span className="font-body text-[10px] font-extrabold uppercase tracking-[0.08em] leading-none text-[#04241b] bg-mint rounded-[5px] px-1.5 py-[3px]">
      {label}
    </span>
  );
}

type HeaderProps = {
  // Live counts from lib/site-stats.ts, passed in by the layout (this file is
  // a client component and cannot read the database itself).
  topicsBySubject?: Record<string, number>;
  liveSubjects?: string[]; // subjects that have a page today
  totalTopics?: number;
  // The same counts for Hindi pages: only topics that have a Hindi version
  hindiTopicsBySubject?: Record<string, number>;
  hindiTotalTopics?: number;
};

export default function Header({
  topicsBySubject = {},
  liveSubjects,
  totalTopics = 0,
  hindiTopicsBySubject = {},
  hindiTotalTopics = 0,
}: HeaderProps) {
  // A subject is "live" when its page exists. Without the list (shouldn't
  // happen) treat everything as live rather than greying the whole menu.
  const isLive = (slug: string) => !liveSubjects || liveSubjects.includes(slug);
  const liveCount = liveSubjects ? liveSubjects.length : SUBJECTS.length;

  const pathname = usePathname();
  const subjectSlug = getSubjectFromPath(pathname); // on a subject page → "Subjects" shows as active
  // The page's language, its words, and href() — a link to a page's Hindi twin when it has one
  const { lang, t, href } = useSiteText();
  const hi = lang === "hi";
  const atlasHref = href("/atlas"); // the Hindi Atlas on Hindi pages
  const onAtlas = /^\/(hi\/)?atlas(\/|$)/.test(pathname);
  const onHome = pathname === "/" || pathname === "/hi";
  // Counts in the page's language (Hindi pages count Hindi articles)
  const countFor = (slug: string) => (hi ? hindiTopicsBySubject[slug] ?? 0 : topicsBySubject[slug] ?? 0);
  const total = hi ? hindiTotalTopics : totalTopics;

  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubjectsOpen, setMobileSubjectsOpen] = useState(false);
  const [away, setAway] = useState(false);            // header slid out of view?
  const [mode, setModeState] = useState<"light" | "dark">("light"); // for the menu's Look switch
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subjectsMenu = usePresence(subjectsOpen, 150);
  const mobileMenu = usePresence(mobileMenuOpen, 150);

  const openSubjects = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSubjectsOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setSubjectsOpen(false), 150);
  };

  // Moving to another page closes every menu (the new page should start clean).
  // React's recommended way to "reset state when something changes": remember
  // the last address, and when it differs, update the state right here while
  // drawing (no effect needed, so no extra round of drawing).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileMenuOpen(false);
    setSubjectsOpen(false);
    setAway(false);
  }

  // While the phone menu is open the page behind it must not scroll
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // HIDE ON SCROLL: going down past the top → slide away; any scroll up → back.
  // "passive: true" tells the browser we never block scrolling, so it stays smooth.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 260 && y > last + 4) setAway(true);
      else if (y < last - 4 || y < 260) setAway(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // aria-current="page" marks the link for the page you're on; globals.css
  // (.gk-nav-link) gives it the soft green pill.
  const current = (on: boolean) => (on ? ("page" as const) : undefined);
  const navLink = "gk-nav-link inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full font-body text-[15px] font-extrabold whitespace-nowrap transition-colors";

  return (
    <header
      lang={lang}
      // sticky + top: the pill stays near the top of the screen as you scroll.
      // The extra env(...) keeps it below an iPhone's notch.
      className={`gk-head sticky z-50 mx-3 md:mx-4 mt-2.5 ${away && !mobileMenuOpen ? "is-away" : ""}`}
      style={{ top: "calc(10px + env(safe-area-inset-top, 0px))" }}
    >
      <div className="gk-head__pill relative max-w-[1280px] mx-auto h-[58px] md:h-16 rounded-full flex items-center gap-3 lg:gap-4 pl-4 pr-2 md:pl-5 md:pr-2.5">

        {/* Logo — the GK letters with the turning Earth, and the name */}
        <Link href={href("/")} aria-label={t.footer.home} className="flex-none">
          <Logo size={38} />
        </Link>

        {/* Desktop nav (large screens) — centred in the middle space */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-0.5" aria-label={t.nav.mainNav}>
          <Link href={href("/")} className={navLink} aria-current={current(onHome)}>{t.nav.home}</Link>

          {/* Subjects — hover or click to open; Escape closes */}
          <div
            onMouseEnter={openSubjects}
            onMouseLeave={scheduleClose}
            onKeyDown={(e) => { if (e.key === "Escape") setSubjectsOpen(false); }}
          >
            <button
              type="button"
              onClick={() => setSubjectsOpen(!subjectsOpen)}
              className={navLink}
              aria-current={current(!!subjectSlug)}
              aria-expanded={subjectsOpen}
              aria-haspopup="true"
            >
              {t.nav.subjects}
              <ChevronDownIcon open={subjectsOpen} />
            </button>

            {subjectsMenu.present && (
              <>
                {/* Dim the page behind the open menu. pointer-events-none: purely
                    visual, so moving the mouse out of the panel still closes it. */}
                <div
                  aria-hidden="true"
                  className={`fixed inset-0 top-[92px] bg-[rgba(5,7,13,0.35)] pointer-events-none ${subjectsMenu.closing ? "anim-fade-out" : "anim-fade-in"}`}
                />
                {/* THE PANEL — a chunky card under the pill: every subject in three
                    columns, each with its colour bar, Hindi name and topic count */}
                <div
                  className={`absolute top-[calc(100%+10px)] left-0 right-0 bg-surface text-foreground rounded-card border-2 border-hairline shadow-card-hover p-7 pb-6 flex flex-col gap-5 z-50 ${
                    subjectsMenu.closing ? "anim-menu-out" : "anim-menu-in"
                  }`}
                  onMouseEnter={openSubjects}
                  onMouseLeave={scheduleClose}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      {t.subjectsMenu.summary(liveCount, total)}
                    </span>
                    <Link href={href("/subjects")} onClick={() => setSubjectsOpen(false)} className="font-body text-[14px] font-extrabold text-sapphire hover:text-sapphire-dark transition-colors">
                      {t.subjectsMenu.all}
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-x-8 gap-y-1">
                    {SUBJECTS.map((subject) => {
                      const live = isLive(subject.slug);
                      const count = countFor(subject.slug);
                      const inner = (
                        <>
                          <span
                            aria-hidden="true"
                            className="w-1.5 h-9 rounded-full"
                            style={{ backgroundColor: live ? SUBJECT_COLORS[subject.slug]?.accent ?? "var(--accent)" : "var(--line-2)" }}
                          />
                          <span className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center px-3 py-2.5 rounded-[14px] transition-colors duration-100 ${live ? "group-hover:bg-surface-low" : ""}`}>
                            {/* the page's language big, the other one small underneath */}
                            <span className="flex flex-col leading-tight">
                              <span className={`font-heading text-base font-semibold ${live ? "text-foreground" : "text-muted"}`}>{hi ? subject.labelHi : subject.label}</span>
                              <span lang={hi ? "en" : "hi"} className={`${hi ? "font-body" : "font-hindi"} text-xs ${live ? "text-muted" : "text-muted/70"}`}>{hi ? subject.label : subject.labelHi}</span>
                            </span>
                            {/* A real count, or an honest "coming soon" */}
                            <span className={`font-body text-xs font-bold whitespace-nowrap ${live ? "text-muted" : "text-muted/70 italic"}`}>
                              {live ? t.subjectsMenu.count(count) : t.subjectsMenu.soon}
                            </span>
                          </span>
                        </>
                      );
                      return live ? (
                        <Link key={subject.slug} href={href(`/${subject.slug}`)} onClick={() => setSubjectsOpen(false)} className="grid grid-cols-[6px_minmax(0,1fr)] gap-2.5 items-center group">
                          {inner}
                        </Link>
                      ) : (
                        // No page yet → not a link (a dead link that 404s is worse than a greyed name)
                        <div key={subject.slug} aria-disabled="true" className="grid grid-cols-[6px_minmax(0,1fr)] gap-2.5 items-center cursor-default">
                          {inner}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t-2 border-border-subtle">
                    <span className="font-body text-[14px] text-muted">{t.subjectsMenu.hint}</span>
                    <Button href={href("/subjects")} onClick={() => setSubjectsOpen(false)}>{t.subjectsMenu.browse}</Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <Link href={atlasHref} className={navLink} aria-current={current(onAtlas)}>
            {t.nav.atlas} <NewTag label={t.nav.newTag} />
          </Link>
          {/* The links after "Subjects" and "Atlas" (menu tidy-up, 29 Oct 2026) */}
          {[
            { label: t.nav.currentAffairs, path: "/news" },
            { label: t.nav.headlines, path: "/pulse" },
          ].map((link) => (
            <Link key={link.path} href={href(link.path)} className={navLink} aria-current={current(pathname === href(link.path))}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: search, Read Later, EN | हिं, Light/Dark, and (phones/tablets) the menu */}
        <div className="ml-auto flex items-center gap-1 min-[400px]:gap-1.5 md:gap-2">
          {/* Search: a wide pill on big screens, a round icon on smaller ones */}
          <Link href={href("/search")} aria-label={t.nav.search} className="gk-icon-btn hidden xl:inline-flex items-center gap-2.5 h-[42px] pl-3.5 pr-4 rounded-full font-body text-sm font-bold text-muted">
            <SearchIcon /> {t.nav.search}
          </Link>
          <Link href={href("/search")} aria-label={t.nav.search} className="gk-icon-btn xl:hidden inline-grid place-items-center w-[38px] h-[38px] md:w-[42px] md:h-[42px] rounded-full">
            <SearchIcon />
          </Link>

          {/* Read Later — the bookmark */}
          <Link
            href={href("/saved")}
            aria-label={t.nav.readLaterLabel}
            title={t.nav.readLater}
            aria-current={current(pathname === href("/saved"))}
            // hidden on phones (2 Nov 2026): the EN | हिं button needed the room;
            // on phones Read Later is in the menu instead
            className="gk-icon-btn hidden sm:inline-grid place-items-center w-[38px] h-[38px] md:w-[42px] md:h-[42px] rounded-full aria-[current=page]:text-sapphire"
          >
            <BookmarkIcon />
          </Link>

          {/* The language switch: EN | हिं (a pill; one round button on phones).
              It replaced the ringing bell on 2 Nov 2026 — a bell didn't tell
              anyone the site is in Hindi. components/LangSwitch.tsx */}
          <LangSwitch />

          <ThemeToggle className="max-md:w-[38px] max-md:h-[38px]" />

          {/* The menu button — phones and tablets */}
          <button
            type="button"
            className="gk-icon-btn lg:hidden inline-grid place-items-center w-[38px] h-[38px] md:w-[42px] md:h-[42px] rounded-full"
            onClick={() => {
              // opening: read the current mode so the menu's Look switch shows it
              if (!mobileMenuOpen) setModeState(currentMode() === "dark" ? "dark" : "light");
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="gk-mobile-menu"
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>
        </div>
      </div>

      {/* ── THE PHONE / TABLET MENU ──────────────────────────────────────────
          A full-screen sheet behind the pill (z-index -1 inside the header):
          big Anton links you can't miss with a thumb, the subjects, the
          Light/Dark switch, and the smaller links. It fades in and out. */}
      {mobileMenu.present && (
        <div
          id="gk-mobile-menu"
          className={`lg:hidden fixed inset-0 -z-10 bg-background overflow-y-auto overscroll-contain ${mobileMenu.closing ? "anim-fade-out" : "anim-fade-in"}`}
          style={{ padding: "calc(92px + env(safe-area-inset-top, 0px)) max(20px, env(safe-area-inset-right, 0px)) calc(120px + env(safe-area-inset-bottom, 0px)) max(20px, env(safe-area-inset-left, 0px))" }}
        >
          <nav aria-label={t.nav.menu} className="max-w-[640px] mx-auto">
            {/* Big links, numbered: the numbers are just a reading aid */}
            {[
              { n: "01", label: t.nav.home, href: href("/"), on: onHome },
              { n: "02", label: t.nav.subjects, href: "", on: !!subjectSlug },
              { n: "03", label: t.nav.atlas, href: atlasHref, on: onAtlas, isNew: true },
              { n: "04", label: t.nav.currentAffairs, href: href("/news"), on: pathname === href("/news") },
              { n: "05", label: t.nav.headlines, href: href("/pulse"), on: pathname === href("/pulse") },
              { n: "06", label: t.nav.readLater, href: href("/saved"), on: pathname === href("/saved") },
            ].map((item, i) => {
              // Hindi: bold (Anton has no Hindi letters; the Hindi font's bold matches its weight)
              const cls = `flex items-baseline gap-3 w-full py-2 border-b-2 border-hairline font-display text-[clamp(38px,10vw,56px)] ${hi ? "font-bold leading-[1.3]" : "leading-[1.05]"} uppercase anim-menu-in ${item.on ? "text-sapphire" : "text-foreground"}`;
              const num = <small className="font-mono text-xs text-muted min-w-[22px]">{item.n}</small>;
              // "Subjects" opens the list of subjects underneath instead of going somewhere
              if (!item.href) {
                return (
                  <div key={item.n} style={{ animationDelay: `${i * 45}ms` }} className="anim-menu-in">
                    <button type="button" onClick={() => setMobileSubjectsOpen(!mobileSubjectsOpen)} aria-expanded={mobileSubjectsOpen} className={`${cls} text-left`}>
                      {num}{item.label}<span className="ml-auto self-center text-muted"><ChevronDownIcon open={mobileSubjectsOpen} /></span>
                    </button>
                    {mobileSubjectsOpen && (
                      <div className="grid grid-cols-2 gap-1 py-3">
                        {SUBJECTS.map((subject) => isLive(subject.slug) ? (
                          <Link key={subject.slug} href={href(`/${subject.slug}`)} className="flex items-center gap-2.5 min-h-12 px-2 rounded-[12px] hover:bg-surface-low">
                            <span aria-hidden="true" className="w-1.5 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: SUBJECT_COLORS[subject.slug]?.accent ?? "var(--accent)" }} />
                            <span className="flex flex-col leading-tight">
                              <span className="font-body text-[15px] font-extrabold text-foreground">{hi ? subject.labelHi : subject.label}</span>
                              <span lang={hi ? "en" : "hi"} className={`${hi ? "font-body" : "font-hindi"} text-[11px] text-muted`}>{hi ? subject.label : subject.labelHi}</span>
                            </span>
                          </Link>
                        ) : (
                          <div key={subject.slug} aria-disabled="true" className="flex items-center gap-2.5 min-h-12 px-2 text-muted/70">
                            <span aria-hidden="true" className="w-1.5 h-7 rounded-full flex-shrink-0 bg-surface-mid" />
                            <span className="flex flex-col leading-tight">
                              <span className="font-body text-[15px] font-bold">{hi ? subject.labelHi : subject.label}</span>
                              <span className="font-body text-[11px] italic">{t.subjectsMenu.soon}</span>
                            </span>
                          </div>
                        ))}
                        <Link href={href("/subjects")} className="col-span-2 pt-2 font-body text-sm font-extrabold text-sapphire">{t.subjectsMenu.all}</Link>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link key={item.n} href={item.href} className={cls} style={{ animationDelay: `${i * 45}ms` }} aria-current={current(item.on)}>
                  {num}{item.label}{item.isNew && <span className="self-center"><NewTag label={t.nav.newTag} /></span>}
                </Link>
              );
            })}

            {/* The Look switch: same as the sun/moon button, with words.
                2 Nov 2026: the ☀ ☾ text characters became the button's own sun and
                moon drawings (owner: "with the correct logos of them") */}
            <div className="flex items-center justify-between gap-3 mt-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{t.look.label}</span>
              <div role="group" aria-label={t.look.label} className="grid grid-cols-2 gap-1 p-1 rounded-[14px] bg-surface-low min-w-[220px]">
                {(["light", "dark"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => { setMode(m); setModeState(m); }}
                    className={`inline-flex items-center justify-center gap-2 py-2 rounded-[10px] font-body text-[13px] font-extrabold ${mode === m ? "bg-surface text-foreground shadow-[0_2px_0_var(--line-2)]" : "text-muted"}`}
                  >
                    {m === "light" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
                    {m === "light" ? t.look.light : t.look.dark}
                  </button>
                ))}
              </div>
            </div>

            {/* Smaller links, and the way to the other language's homepage */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 font-body text-[15px] font-extrabold text-muted">
              <Link href={href("/search")}>{t.nav.search}</Link>
              {/* Read Later lives here on phones (no room for its button in the header) */}
              <Link href={href("/saved")}>{t.nav.readLater}</Link>
              <Link href={href("/about")}>{t.smallLinks.about}</Link>
              <Link href={href("/contact")}>{t.smallLinks.contact}</Link>
              <Link href={href("/topics")}>{t.smallLinks.allTopics}</Link>
            </div>
            {/* The other language, from the menu too: "हिन्दी में पढ़ें →" on English
                pages, "Read in English →" on Hindi ones — straight to that homepage */}
            <Link
              href={t.otherLanguage.href}
              lang={t.otherLanguage.lang}
              className={`mt-5 inline-flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-accent bg-accent-soft text-base font-bold text-accent ${t.otherLanguage.lang === "hi" ? "font-hindi" : "font-body font-extrabold"}`}
            >
              {t.otherLanguage.main}
              {t.otherLanguage.small && <span lang="en" className="font-body text-xs font-extrabold uppercase tracking-[0.08em] text-muted">{t.otherLanguage.small}</span>}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
