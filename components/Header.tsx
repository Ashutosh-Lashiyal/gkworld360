"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// Image is Next.js's built-in image component — it automatically optimises
// images (compresses, resizes, lazy-loads) so the site stays fast.
import { getSubjectFromPath, SUBJECT_COLORS } from "@/lib/subject-colors";
import { SUBJECTS } from "@/lib/subjects";
// SUBJECTS is now imported from the shared lib/subjects.ts file instead of
// being defined here — so the header and the homepage both use the same list.
import BellNotification from "@/components/BellNotification";
import Button from "@/components/Button";


const OTHER_LINKS = [
  { label: "Current Affairs", href: "/news" },
  { label: "Headlines", href: "/pulse" },
  { label: "Read Later", href: "/saved" },
  { label: "Contact", href: "/contact" },
];

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

type HeaderProps = {
  // Live counts from lib/site-stats.ts, passed in by the layout (this file is
  // a client component and cannot read the database itself).
  topicsBySubject?: Record<string, number>;
  liveSubjects?: string[]; // subjects that have a page today
  totalTopics?: number;
};

export default function Header({ topicsBySubject = {}, liveSubjects, totalTopics = 0 }: HeaderProps) {
  // A subject is "live" when its page exists. Without the list (shouldn't
  // happen) treat everything as live rather than greying the whole menu.
  const isLive = (slug: string) => !liveSubjects || liveSubjects.includes(slug);
  const liveCount = liveSubjects ? liveSubjects.length : SUBJECTS.length;

  const pathname = usePathname();
  const subjectSlug = getSubjectFromPath(pathname); // on a subject page → "Subjects" shows as active

  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubjectsOpen, setMobileSubjectsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSubjects = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSubjectsOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setSubjectsOpen(false), 150);
  };

  // REDESIGN 16 Sep 2026 — the header is now part of the dark "frame" that is
  // identical on every page (deep teal #122a26, white text, one mint accent).
  // Nav links: white at 82% opacity, full white on hover. The ACTIVE link gets
  // a 2px mint underline instead of a filled pill — the mint accent is reserved
  // for "where am I / what can I do" cues, nowhere else.
  const linkClass = (href: string) => {
    const active = pathname === href;
    return [
      // whitespace-nowrap keeps each label on ONE line (no more "Current
      // Affairs" breaking in two); px-2.5 tightens spacing so all 7 items fit.
      "font-body text-[15px] font-medium whitespace-nowrap px-2.5 py-1.5 border-b-2 transition-colors duration-200",
      active
        ? "text-on-dark border-mint"
        : "text-on-dark/80 border-transparent hover:text-mint",
    ].join(" ");
  };

  return (
    // No coloured line under the bar any more (owner, 17 Sep — it clashed with
    // the reading-progress bar). The subject colour lives on the page itself.
    <header className="sticky top-0 z-50 bg-navy-dark text-on-dark">

      {/* `relative` on the container lets us absolutely-position the nav.
          The nav is pinned to the full width of the container and centres its
          links inside — so it always sits in the true middle of the header,
          regardless of how wide the logo or the search icon is.
          Logo stays at the far left, search stays at the far right. */}
      {/* py-2 + a 56px logo ≈ a 72px bar (was ~120px). A slimmer header leaves
          more of the screen for the article, which is what readers came for. */}
      {/* `relative` here (not on the Subjects button) is what lets the menu
          panel stretch across the whole header width, edge to edge with the
          logo and the search box, instead of hanging under one word. */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-2 relative flex items-center">

        {/* Logo — far left, does not participate in centering the nav.
            18 Sep 2026: new flat logo. Two files, one per background:
            logo-dark.png (off-white + mint) for the dark header/footer,
            logo-light.png (teal + mint) for light surfaces. The old CSS-filter
            trick that made a white silhouette is gone. width/height match the
            file's shape (1106×820) so the browser reserves the right space. */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo-dark.png"
              alt="GKWorld360 — Know More, Grow More"
              height={64}
              width={86}
              className="h-12 md:h-14 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Desktop nav — takes the middle space and centres its links there.
            Using flex-1 (instead of absolute positioning) means the nav, logo,
            and right-side controls each get their own space and never overlap,
            no matter how many nav items there are.                             */}
        <nav
          className="hidden lg:flex flex-1 justify-center items-center px-2"
          aria-label="Main navigation"
        >
        <div className="flex items-center gap-1">

          <Link href="/" className={linkClass("/")}>Home</Link>

          {/* Subjects dropdown — wrapping div handles hover open/close.
              Clicking the button also toggles it (touch laptops, keyboards),
              and Escape closes it. */}
          <div
            onMouseEnter={openSubjects}
            onMouseLeave={scheduleClose}
            onKeyDown={(e) => { if (e.key === "Escape") setSubjectsOpen(false); }}
          >
            <button
              onClick={() => setSubjectsOpen(!subjectsOpen)}
              className={[
                "font-body text-[15px] font-medium whitespace-nowrap px-2.5 py-1.5 border-b-2 transition-colors duration-200 flex items-center gap-1",
                // Open, or on a subject page → treated as the active link
                subjectsOpen || subjectSlug
                  ? "text-on-dark border-mint"
                  : "text-on-dark/80 border-transparent hover:text-mint",
              ].join(" ")}
              aria-expanded={subjectsOpen}
              aria-haspopup="true"
            >
              Subjects
              <ChevronDownIcon open={subjectsOpen} />
            </button>

            {subjectsOpen && (
              <>
                {/* Dim the page behind the open menu (board 8). It sits below
                    the bar, ignores the mouse (pointer-events-none) so hover
                    in/out of the panel still works, and is purely visual. */}
                <div
                  aria-hidden="true"
                  // The container is centred and 1200px wide, so "left-0 right-0" would
                  // only dim the middle. left-1/2 + -translate-x-1/2 + w-screen centres
                  // a viewport-wide strip on it instead.
                  className="absolute left-1/2 -translate-x-1/2 w-screen top-full h-screen bg-navy-dark/35 pointer-events-none"
                />

                {/* THE PANEL — a white card dropping from the dark bar, the
                    full width of the header content. All subjects in three
                    columns; each row = 4px signal bar · English name (serif)
                    · Hindi name. The signal colours are learnt here, before
                    the reader ever reaches a subject page. Topic counts per
                    subject arrive in Phase 4, when the CMS feeds this list. */}
                <div
                  className="absolute top-full left-4 md:left-8 lg:left-16 right-4 md:right-8 lg:right-16 mt-2 bg-surface text-foreground rounded-none shadow-[0_24px_64px_rgba(0,0,0,0.28)] p-7 pb-6 flex flex-col gap-5 z-50"
                  onMouseEnter={openSubjects}
                  onMouseLeave={scheduleClose}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {liveCount} {liveCount === 1 ? "subject" : "subjects"} · {totalTopics} {totalTopics === 1 ? "topic" : "topics"} · English and Hindi
                    </span>
                    <Link
                      href="/subjects"
                      onClick={() => setSubjectsOpen(false)}
                      className="font-body text-[13px] font-semibold text-sapphire hover:text-sapphire-dark transition-colors"
                    >
                      All subjects →
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-x-10 gap-y-1">
                    {SUBJECTS.map((subject) => {
                      const live = isLive(subject.slug);
                      const count = topicsBySubject[subject.slug] ?? 0;
                      const inner = (
                        <>
                          <span
                            aria-hidden="true"
                            className="w-1 h-9 rounded-sm"
                            style={{ backgroundColor: live ? SUBJECT_COLORS[subject.slug]?.accent ?? "#059669" : "#d9d6cf" }}
                          />
                          {/* Hover = the site's mint, same as every button (owner, 16 Sep).
                              The fill sits on the TEXT block only, so the signal bar on
                              the left stays clear of it (owner's note, same day). */}
                          <span className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center px-3 py-2.5 rounded-none transition-colors duration-100 ${live ? "group-hover:bg-mint" : ""}`}>
                            <span className="flex flex-col leading-tight">
                              <span className={`font-heading text-base font-semibold ${live ? "text-navy-dark" : "text-muted"}`}>
                                {subject.label}
                              </span>
                              <span lang="hi" className={`font-hindi text-xs ${live ? "text-muted group-hover:text-navy-dark/70" : "text-muted/70"} transition-colors`}>
                                {subject.labelHi}
                              </span>
                            </span>
                            {/* A real count, or an honest "coming soon" */}
                            <span className={`font-body text-xs whitespace-nowrap ${live ? "text-muted group-hover:text-navy-dark/70" : "text-muted/70 italic"}`}>
                              {live ? `${count} ${count === 1 ? "topic" : "topics"}` : "coming soon"}
                            </span>
                          </span>
                        </>
                      );
                      return live ? (
                        <Link
                          key={subject.slug}
                          href={`/${subject.slug}`}
                          onClick={() => setSubjectsOpen(false)}
                          className="grid grid-cols-[4px_minmax(0,1fr)] gap-2.5 items-center group"
                        >
                          {inner}
                        </Link>
                      ) : (
                        // No page yet → not a link. A dead link that 404s is worse
                        // than a greyed name (11 of 17 did exactly that before).
                        <div
                          key={subject.slug}
                          aria-disabled="true"
                          className="grid grid-cols-[4px_minmax(0,1fr)] gap-2.5 items-center cursor-default"
                        >
                          {inner}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-border-subtle">
                    <span className="font-body text-[13px] text-muted">
                      Not sure where to start? Every subject, with its categories, on one page.
                    </span>
                    <Button href="/subjects" onClick={() => setSubjectsOpen(false)}>
                      Browse all subjects
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {OTHER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>
        </nav>

        {/* Right side — pushed to the far right with ml-auto.
            Contains the search icon on desktop and the hamburger on mobile.
            Both live here so they always occupy the same right-side position. */}
        <div className="ml-auto flex items-center gap-1">

          {/* Search bar — desktop only.
              This is a <Link> styled to look like a search input field.
              Clicking it navigates to /search where the real search works.
              We use a Link (not a real <input>) here because the header search
              is just a shortcut — the actual typing happens on the /search page. */}
          {/* On the dark bar the search box is a slightly LIGHTER teal block
              (#1e3d38) with 10px corners — reads as "a field", not a button. */}
          <Link
            href="/search"
            className="hidden lg:flex items-center gap-2 xl:w-52 h-9 bg-navy rounded-button px-2.5 xl:px-4 text-on-dark/60 hover:text-mint hover:bg-navy/80 transition-colors duration-200 group"
            aria-label="Search"
          >
            {/* Search icon inside the bar */}
            <SearchIcon />
            {/* Placeholder-style text — hidden on medium screens (where it's just
                an icon to save room) and shown as a full bar from lg up. */}
            <span className="hidden xl:inline font-body text-sm truncate">
              Search subjects, topics, news...
            </span>
          </Link>

          {/* Bell notification — rings to tell users Hindi is available.
              In the far-right corner (owner's friend, 17 Sep) — after the search
              on desktop; on phones it sits just before the hamburger. */}
          <BellNotification />

          {/* Hamburger — mobile only */}
          <button
            // w-11 h-11 = a 44px tap target around the 24px icon
            className="lg:hidden flex items-center justify-center w-11 h-11 text-on-dark hover:text-mint transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {/* Mobile menu — a dark sheet continuing the bar. Every row is at least
          48px tall (py-3 + text) so it's comfortable under a thumb. Rows are
          divided by faint white lines (white at 10% opacity) instead of grey. */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-dark border-t border-on-dark/10">
          <nav className="max-w-[1200px] mx-auto px-4 py-2" aria-label="Mobile navigation">

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-12 font-body text-base font-medium text-on-dark/85 hover:text-mint transition-colors border-b border-on-dark/10"
            >
              Home
            </Link>

            {/* Subjects — expands inline on mobile */}
            <div className="border-b border-on-dark/10">
              <button
                className="flex items-center justify-between w-full min-h-12 font-body text-base font-medium text-on-dark/85 hover:text-mint transition-colors"
                onClick={() => setMobileSubjectsOpen(!mobileSubjectsOpen)}
                aria-expanded={mobileSubjectsOpen}
              >
                <span>Subjects</span>
                <ChevronDownIcon open={mobileSubjectsOpen} />
              </button>

              {mobileSubjectsOpen && (
                <div className="pb-3">
                  {/* Two columns of subjects; each gets its 4px signal bar on
                      the left so the subject colours are learnt here first. */}
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {SUBJECTS.map((subject) => isLive(subject.slug) ? (
                      <Link
                        key={subject.slug}
                        href={`/${subject.slug}`}
                        onClick={() => { setMobileMenuOpen(false); setMobileSubjectsOpen(false); }}
                        className="flex items-center gap-2.5 min-h-11 px-2 rounded-sm text-sm text-on-dark/85 hover:text-mint hover:bg-on-dark/10 transition-colors"
                      >
                        <span
                          aria-hidden="true"
                          className="w-1 h-7 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: SUBJECT_COLORS[subject.slug]?.border ?? "#6ee7b7" }}
                        />
                        <span className="flex flex-col leading-tight">
                          <span className="font-medium">{subject.label}</span>
                          <span lang="hi" className="font-hindi text-[11px] text-on-dark/60">{subject.labelHi}</span>
                        </span>
                      </Link>
                    ) : (
                      // No page yet → greyed, not a link
                      <div key={subject.slug} aria-disabled="true" className="flex items-center gap-2.5 min-h-11 px-2 rounded-sm text-sm text-on-dark/40">
                        <span aria-hidden="true" className="w-1 h-7 rounded-sm flex-shrink-0 bg-on-dark/20" />
                        <span className="flex flex-col leading-tight">
                          <span className="font-medium">{subject.label}</span>
                          <span className="font-body text-[11px] italic">coming soon</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/subjects"
                    onClick={() => { setMobileMenuOpen(false); setMobileSubjectsOpen(false); }}
                    className="block pt-3 border-t border-on-dark/10 font-body text-sm font-semibold text-mint hover:text-on-dark transition-colors"
                  >
                    View All Subjects →
                  </Link>
                </div>
              )}
            </div>

            {OTHER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center min-h-12 font-body text-base font-medium text-on-dark/85 hover:text-mint transition-colors border-b border-on-dark/10"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 min-h-12 font-body text-base font-medium text-on-dark/85 hover:text-mint transition-colors"
            >
              <SearchIcon />
              <span>Search</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
