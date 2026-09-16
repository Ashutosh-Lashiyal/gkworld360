"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
// Image is Next.js's built-in image component — it automatically optimises
// images (compresses, resizes, lazy-loads) so the site stays fast.
import { getSubjectFromPath, getSubjectColors, SUBJECT_COLORS } from "@/lib/subject-colors";
import { SUBJECTS } from "@/lib/subjects";
// SUBJECTS is now imported from the shared lib/subjects.ts file instead of
// being defined here — so the header and the homepage both use the same list.
import BellNotification from "@/components/BellNotification";


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

export default function Header() {
  const pathname = usePathname();
  const subjectSlug = getSubjectFromPath(pathname);
  const subjectColors = subjectSlug ? getSubjectColors(subjectSlug) : null;

  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubjectsOpen, setMobileSubjectsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracks which subject slug is currently being hovered in the dropdown.
  // null means nothing is hovered → no special background shown.
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);

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
        : "text-on-dark/80 border-transparent hover:text-on-dark",
    ].join(" ");
  };

  return (
    // The subject "signal" survives as a thin 3px line under the dark bar —
    // small, the way the design system wants signal colours used.
    <header
      className="sticky top-0 z-50 bg-navy-dark text-on-dark transition-all duration-300"
      style={subjectColors
        ? { borderBottom: `3px solid ${subjectColors.border}` }
        : { borderBottom: "3px solid transparent" }
      }
    >

      {/* `relative` on the container lets us absolutely-position the nav.
          The nav is pinned to the full width of the container and centres its
          links inside — so it always sits in the true middle of the header,
          regardless of how wide the logo or the search icon is.
          Logo stays at the far left, search stays at the far right. */}
      {/* py-2 + a 56px logo ≈ a 72px bar (was ~120px). A slimmer header leaves
          more of the screen for the article, which is what readers came for. */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-2 relative flex items-center">

        {/* Logo — far left, does not participate in centering the nav.
            The PNG is dark teal on transparent, which would vanish on this dark
            bar. `brightness(0)` turns every visible pixel black, `invert(1)` then
            flips black to white — a white silhouette of the logo, no second
            image file needed. Remove the filter and the coloured logo is back. */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.png"
              alt="GKWorld360 — Know More, Grow More"
              height={64}
              width={96}
              className="h-12 md:h-14 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
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

          {/* Subjects dropdown — wrapping div handles hover open/close */}
          <div
            className="relative"
            onMouseEnter={openSubjects}
            onMouseLeave={scheduleClose}
          >
            <button
              className={[
                "font-body text-[15px] font-medium whitespace-nowrap px-2.5 py-1.5 border-b-2 transition-colors duration-200 flex items-center gap-1",
                // Open, or on a subject page → treated as the active link
                subjectsOpen || subjectSlug
                  ? "text-on-dark border-mint"
                  : "text-on-dark/80 border-transparent hover:text-on-dark",
              ].join(" ")}
              aria-expanded={subjectsOpen}
              aria-haspopup="true"
            >
              Subjects
              <ChevronDownIcon open={subjectsOpen} />
            </button>

            {subjectsOpen && (
              <div
                // A WHITE panel dropping from the DARK bar — the same "white
                // card on a dark stage" move the whole design system is built
                // on. `mt-[3px]` lets it clear the subject line under the bar.
                // (Full board-8 restyle — signal bars, Hindi names, counts — is
                // Phase 2.)
                className="absolute top-full left-1/2 -translate-x-1/2 mt-[3px] w-[580px] bg-surface text-foreground rounded-card border border-hairline shadow-card-hover z-50 overflow-hidden"
                onMouseEnter={openSubjects}
                onMouseLeave={scheduleClose}
              >
                <div className="grid grid-cols-3 gap-1 p-4">
                  {SUBJECTS.map((subject) => (
                    <Link
                      key={subject.slug}
                      href={`/${subject.slug}`}
                      onClick={() => setSubjectsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-sm transition-colors group"
                      // Show the subject's own colour on hover — same colour
                      // used on that subject's pages — so the user gets a
                      // visual preview before they even click.
                      onMouseEnter={() => setHoveredSubject(subject.slug)}
                      onMouseLeave={() => setHoveredSubject(null)}
                      style={{
                        backgroundColor: hoveredSubject === subject.slug
                          ? SUBJECT_COLORS[subject.slug]?.bg
                          : undefined,
                      }}
                    >
                      <span className="text-base" aria-hidden="true">{subject.icon}</span>
                      <span className="font-body text-sm font-medium text-navy group-hover:text-sapphire transition-colors">
                        {subject.label}
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-hairline px-5 py-3 bg-surface-low flex items-center justify-between">
                  <span className="font-body text-xs text-muted">{SUBJECTS.length} subjects available</span>
                  <Link
                    href="/subjects"
                    onClick={() => setSubjectsOpen(false)}
                    className="font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark transition-colors"
                  >
                    View All Subjects →
                  </Link>
                </div>
              </div>
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
        <div className="ml-auto flex items-center">
          {/* Bell notification — rings to tell users Hindi is available */}
          <BellNotification />

          {/* Search bar — desktop only.
              This is a <Link> styled to look like a search input field.
              Clicking it navigates to /search where the real search works.
              We use a Link (not a real <input>) here because the header search
              is just a shortcut — the actual typing happens on the /search page. */}
          {/* On the dark bar the search box is a slightly LIGHTER teal block
              (#1e3d38) with 10px corners — reads as "a field", not a button. */}
          <Link
            href="/search"
            className="hidden lg:flex items-center gap-2 xl:w-52 h-9 bg-navy rounded-button px-2.5 xl:px-4 text-on-dark/60 hover:text-on-dark hover:bg-navy/80 transition-colors duration-200 group"
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
              className="flex items-center min-h-12 font-body text-base font-medium text-on-dark/85 hover:text-on-dark transition-colors border-b border-on-dark/10"
            >
              Home
            </Link>

            {/* Subjects — expands inline on mobile */}
            <div className="border-b border-on-dark/10">
              <button
                className="flex items-center justify-between w-full min-h-12 font-body text-base font-medium text-on-dark/85 hover:text-on-dark transition-colors"
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
                    {SUBJECTS.map((subject) => (
                      <Link
                        key={subject.slug}
                        href={`/${subject.slug}`}
                        onClick={() => { setMobileMenuOpen(false); setMobileSubjectsOpen(false); }}
                        className="flex items-center gap-2.5 min-h-11 px-2 rounded-sm text-sm text-on-dark/85 hover:text-on-dark hover:bg-on-dark/10 transition-colors"
                      >
                        <span
                          aria-hidden="true"
                          className="w-1 h-5 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: SUBJECT_COLORS[subject.slug]?.border ?? "#6ee7b7" }}
                        />
                        <span className="font-medium">{subject.label}</span>
                      </Link>
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
                className="flex items-center min-h-12 font-body text-base font-medium text-on-dark/85 hover:text-on-dark transition-colors border-b border-on-dark/10"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 min-h-12 font-body text-base font-medium text-on-dark/85 hover:text-on-dark transition-colors"
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
