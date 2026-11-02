"use client";

// The sun/moon button in the header.
//   - On most pages it flips the site between Light and Dark.
//   - On an ARTICLE (phase 2, 30 Oct 2026) it steps through all three looks:
//     Light → Dark → Reading → Light. Reading mode is only for articles.
// The actual switching lives in lib/mode.ts.
// 2 Nov 2026: the sun and moon drawings are exported, so the phone menu's
// Light / Dark (लाइट / डार्क) buttons show the same icons; the label is read
// aloud in the page's language.

import { currentMode, onArticle, setMode, setReading } from "@/lib/mode";
import { useSiteText } from "@/lib/use-site-text";

/** The sun — Light. `className` lets the button below animate it. */
export function SunIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
/** The moon — Dark. */
export function MoonIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  );
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { t } = useSiteText(); // the label in the page's language
  const flip = () => {
    const now = currentMode();
    if (onArticle()) {
      if (now === "light") setMode("dark");
      else if (now === "dark") setReading(true);
      else setMode("light"); // from Reading back to Light (this also turns Reading off)
    } else {
      setMode(now === "light" ? "dark" : "light");
    }
  };

  return (
    <button
      type="button"
      onClick={flip}
      // The label says what the button does; it's correct for every mode
      // because a screen reader reads it fresh each time.
      aria-label={t.look.toggle}
      title={t.look.toggleTitle}
      // gk-theme: globals.css swaps the sun and the moon with a small turn,
      // based on the page's mode, so the icon is right even before React runs.
      className={`gk-theme gk-icon-btn relative inline-grid place-items-center w-[42px] h-[42px] rounded-full ${className}`}
    >
      {/* sun */}
      <SunIcon className="gk-sun" />
      {/* moon — stacked exactly on top of the sun (absolute) */}
      <MoonIcon className="gk-moon absolute" />
    </button>
  );
}
