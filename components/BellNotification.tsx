"use client";
// "use client" — needed because we use useState to open/close the popup
// and onMouseEnter/onMouseLeave events (browser-only interactions).

import { useState } from "react";

// SVG bell icon — same style as the other icons in the header (Feather icon style)
function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Bell body */}
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      {/* Bell clapper (the small curve at the bottom) */}
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export default function BellNotification() {
  // Controls whether the popup is visible
  const [open, setOpen] = useState(false);

  return (
    // `relative` so the popup can be positioned below the bell
    <div
      className="relative"
      // On desktop: open on mouse hover, close when mouse leaves
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* ── BELL BUTTON ──────────────────────────────────────────────────────
          The `bell-ring` class (defined in globals.css) applies the continuous
          ringing animation. The button opens/closes the popup on click
          (useful on mobile where hover doesn't exist).                        */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-11 h-11 rounded-full text-sapphire hover:bg-surface-mid transition-colors cursor-pointer"
        aria-label="Hindi language availability"
      >
        <span className="bell-ring">
          <BellIcon />
        </span>
      </button>

      {/* ── POPUP ────────────────────────────────────────────────────────────
          Appears below the bell when open is true.
          `right-0` aligns the popup to the right edge of the bell button
          so it doesn't overflow off the screen on the right side.            */}
      {open && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-surface rounded-card border border-hairline shadow-card-hover z-50 overflow-hidden">

          {/* Top accent bar — sapphire green matches the site's brand colour */}
          <div className="h-1 bg-sapphire" />

          <div className="p-4">
            {/* Heading — underlined to give it emphasis */}
            <p className="font-heading text-base font-semibold text-navy underline mb-3">
              Now available in Hindi!
            </p>

            {/* Hindi text first — uses the Devanagari font via font-hindi class */}
            <p className="font-hindi text-sm text-sapphire leading-relaxed mb-3">
              GKWorld360 पर Topics और News अब हिन्दी में भी उपलब्ध हैं।
            </p>

            {/* English explanation below */}
            <p className="font-body text-sm text-muted leading-relaxed">
              Topics and News on GKWorld360 are now available in Hindi.
              Look for the language toggle on any article page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
