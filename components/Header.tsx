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

  const linkClass = (href: string) => {
    const active = pathname === href;
    return [
      // whitespace-nowrap keeps each label on ONE line (no more "Current
      // Affairs" breaking in two); px-2.5 tightens spacing so all 7 items fit.
      "font-body text-base font-medium whitespace-nowrap rounded-full px-2.5 py-1.5 transition-all duration-200",
      active
        ? "bg-surface-mid text-sapphire"
        : "text-navy hover:bg-surface-mid hover:text-sapphire",
    ].join(" ");
  };

  return (
    <header
      className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md transition-all duration-300"
      style={subjectColors
        ? { borderBottom: `3px solid ${subjectColors.border}` }
        : { borderBottom: "1px solid var(--hairline)" }
      }
    >

      {/* `relative` on the container lets us absolutely-position the nav.
          The nav is pinned to the full width of the container and centres its
          links inside — so it always sits in the true middle of the header,
          regardless of how wide the logo or the search icon is.
          Logo stays at the far left, search stays at the far right. */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-3 relative flex items-center">

        {/* Logo — far left, does not participate in centering the nav */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.png"
              alt="GKWorld360 — Know More, Grow More"
              height={64}
              width={96}
              className="h-20 md:h-24 w-auto"
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
                "font-body text-base font-medium whitespace-nowrap rounded-full px-2.5 py-1.5 transition-all duration-200 flex items-center gap-1",
                subjectsOpen
                  ? "bg-surface-mid text-sapphire"
                  : "text-navy hover:bg-surface-mid hover:text-sapphire",
              ].join(" ")}
              aria-expanded={subjectsOpen}
              aria-haspopup="true"
            >
              Subjects
              <ChevronDownIcon open={subjectsOpen} />
            </button>

            {subjectsOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 w-[580px] bg-surface rounded-card border border-hairline shadow-card-hover z-50 overflow-hidden"
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
          <Link
            href="/search"
            className="hidden lg:flex items-center gap-2 xl:w-52 bg-surface border border-hairline rounded-full px-2.5 xl:px-4 py-2 text-muted hover:border-sapphire hover:text-sapphire transition-all duration-200 group"
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
            className="lg:hidden text-navy hover:text-sapphire transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-hairline">
          <nav className="max-w-[1200px] mx-auto px-4 py-2" aria-label="Mobile navigation">

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center py-3 font-body text-sm font-medium text-navy hover:text-sapphire transition-colors border-b border-hairline"
            >
              Home
            </Link>

            {/* Subjects — expands inline on mobile */}
            <div className="border-b border-hairline">
              <button
                className="flex items-center justify-between w-full py-3 font-body text-sm font-medium text-navy hover:text-sapphire transition-colors"
                onClick={() => setMobileSubjectsOpen(!mobileSubjectsOpen)}
              >
                <span>Subjects</span>
                <ChevronDownIcon open={mobileSubjectsOpen} />
              </button>

              {mobileSubjectsOpen && (
                <div className="pb-3">
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    {SUBJECTS.map((subject) => (
                      <Link
                        key={subject.slug}
                        href={`/${subject.slug}`}
                        onClick={() => { setMobileMenuOpen(false); setMobileSubjectsOpen(false); }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-navy hover:text-sapphire hover:bg-surface-low transition-colors"
                      >
                        <span aria-hidden="true">{subject.icon}</span>
                        <span className="font-medium">{subject.label}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/subjects"
                    onClick={() => { setMobileMenuOpen(false); setMobileSubjectsOpen(false); }}
                    className="block pt-2 border-t border-hairline font-body text-sm font-semibold text-sapphire hover:text-sapphire-dark transition-colors"
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
                className="flex items-center py-3 font-body text-sm font-medium text-navy hover:text-sapphire transition-colors border-b border-hairline"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-3 font-body text-sm font-medium text-navy hover:text-sapphire transition-colors"
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
