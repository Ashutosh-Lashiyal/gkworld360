"use client";
// "use client" is required here because this component has interactive behaviour:
// the mobile menu opens and closes when the user taps the hamburger icon.
// Without this, Next.js would try to render it on the server, where clicks don't exist.

import { useState } from "react";
import Link from "next/link"; // Next.js Link = instant page navigation without full reload

// ── NAVIGATION LINKS ──────────────────────────────────────────────────────────
// Defined once here as a list — both the desktop nav and mobile menu use this
// same list. Adding a new page later = add one line here, appears in both places.
const navLinks = [
  { label: "Home",     href: "/" },
  { label: "Subjects", href: "/subjects" },
  { label: "Articles", href: "/articles" },
  { label: "About",    href: "/about" },
  { label: "Contact",  href: "/contact" },
];

// ── SEARCH ICON ───────────────────────────────────────────────────────────────
// A simple magnifying-glass SVG. No icon library needed — keeps the project lean.
function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor" // "currentColor" means it inherits whatever text colour is set
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true" // hidden from screen readers — the button label handles accessibility
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── HAMBURGER ICON (three lines — "menu closed" state) ────────────────────────
function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ── CLOSE ICON (X — "menu open" state) ───────────────────────────────────────
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6"  x2="6"  y2="18" />
      <line x1="6"  y1="6"  x2="18" y2="18" />
    </svg>
  );
}

// ── HEADER COMPONENT ──────────────────────────────────────────────────────────
export default function Header() {
  // useState stores whether the mobile menu is open (true) or closed (false).
  // When this value changes, React automatically re-renders the component.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    // sticky top-0 z-50 → header stays fixed at the top as the user scrolls
    // border-b border-hairline → a 1px bottom border separates header from content
    // bg-surface → pure white background (#ffffff) from our design tokens
    <header className="sticky top-0 z-50 bg-surface border-b border-hairline">

      {/* ── MAIN HEADER BAR ──────────────────────────────────────────────────
          max-w-[1200px] mx-auto → centres content within the 1200px container
          px-4 md:px-8 lg:px-16 → 16px / 32px / 64px side padding at mobile / tablet / desktop
          py-4                  → 16px top and bottom padding
          flex items-center justify-between → logo left, nav right, vertically centred */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-4 flex items-center justify-between">

        {/* ── LOGO ─────────────────────────────────────────────────────────────
            Links back to the homepage. Source Serif 4 bold in Deep Navy.
            "font-heading" uses Source Serif 4 (set in our design tokens).       */}
        <Link
          href="/"
          className="font-heading font-bold text-xl text-navy hover:text-sapphire transition-colors"
        >
          GKWorld360
        </Link>

        {/* ── DESKTOP NAVIGATION ───────────────────────────────────────────────
            hidden md:flex → invisible on mobile, becomes a flex row on tablet+
            gap-8 → 32px space between each nav link                             */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href} // React needs a unique key when rendering a list
              href={link.href}
              className="font-body text-sm font-medium text-foreground hover:text-sapphire transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── DESKTOP SEARCH ICON ──────────────────────────────────────────────
            hidden md:flex → hidden on mobile (search is in the mobile menu).
            Links to the /search page.                                          */}
        <Link
          href="/search"
          className="hidden md:flex items-center text-foreground hover:text-sapphire transition-colors"
          aria-label="Search"
        >
          <SearchIcon />
        </Link>

        {/* ── MOBILE HAMBURGER BUTTON ───────────────────────────────────────────
            md:hidden → only visible on mobile; disappears on tablet and desktop
            Toggles mobileMenuOpen between true and false on each tap.           */}
        <button
          className="md:hidden text-foreground hover:text-sapphire transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {/* Show X icon when menu is open, hamburger icon when closed */}
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* ── MOBILE DROPDOWN MENU ───────────────────────────────────────────────
          Only rendered when mobileMenuOpen is true (the && operator controls this).
          md:hidden → just in case, never shows on desktop.
          Each link closes the menu when tapped (onClick sets mobileMenuOpen false). */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-t border-hairline">
          <nav
            className="max-w-[1200px] mx-auto px-4 py-2"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center py-3 font-body text-sm font-medium text-foreground hover:text-sapphire transition-colors border-b border-hairline"
                onClick={() => setMobileMenuOpen(false)} // close menu after navigating
              >
                {link.label}
              </Link>
            ))}

            {/* Search link in mobile menu — goes to the /search page and closes the menu */}
            <Link
              href="/search"
              className="flex items-center gap-2 py-3 font-body text-sm font-medium text-foreground hover:text-sapphire transition-colors w-full"
              onClick={() => setMobileMenuOpen(false)}
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
