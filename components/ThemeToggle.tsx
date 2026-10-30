"use client";

// The sun/moon button in the header: flips the site between Light and Dark.
// (Reading mode is switched on from articles, phase 2. If you press this while
// reading, it goes back to Light.) The actual switching lives in lib/mode.ts.

import { currentMode, setMode } from "@/lib/mode";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const flip = () => setMode(currentMode() === "light" ? "dark" : "light");

  return (
    <button
      type="button"
      onClick={flip}
      // The label says what the button WILL do; it's correct for both modes
      // because a screen reader reads it fresh each time.
      aria-label="Switch between light and dark"
      title="Light / Dark"
      // gk-theme: globals.css swaps the sun and the moon with a small turn,
      // based on the page's mode, so the icon is right even before React runs.
      className={`gk-theme gk-icon-btn relative inline-grid place-items-center w-[42px] h-[42px] rounded-full ${className}`}
    >
      {/* sun */}
      <svg className="gk-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      {/* moon — stacked exactly on top of the sun (absolute) */}
      <svg className="gk-moon absolute" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
      </svg>
    </button>
  );
}
