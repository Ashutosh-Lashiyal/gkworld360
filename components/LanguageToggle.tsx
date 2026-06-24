// LanguageToggle — the "English | हिंदी" switch shown on articles that exist in
// both languages. It's just two links between the two language URLs (Option B),
// so each language has its own address and stays separately indexable.
//
// It only renders when BOTH language versions exist; otherwise there's nothing
// to toggle to, so it shows nothing.

import Link from "next/link";

type LanguageToggleProps = {
  current: "en" | "hi";   // which language is currently being viewed
  enHref?: string;        // URL of the English version (if it exists)
  hiHref?: string;        // URL of the Hindi version (if it exists)
};

export default function LanguageToggle({ current, enHref, hiHref }: LanguageToggleProps) {
  // Need both versions for a toggle to make sense
  if (!enHref || !hiHref) return null;

  const basePill =
    "px-3 py-1.5 font-body text-sm font-medium transition-colors";
  const activePill = "bg-navy text-on-dark";
  const inactivePill = "text-navy hover:bg-surface-low";

  return (
    <div
      className="inline-flex items-center rounded-card border border-hairline overflow-hidden"
      role="group"
      aria-label="Choose language"
    >
      <Link
        href={enHref}
        className={`${basePill} ${current === "en" ? activePill : inactivePill}`}
        aria-current={current === "en" ? "true" : undefined}
        hrefLang="en"
      >
        English
      </Link>
      <Link
        href={hiHref}
        className={`${basePill} ${current === "hi" ? activePill : inactivePill}`}
        aria-current={current === "hi" ? "true" : undefined}
        hrefLang="hi"
        // The label "हिन्दी" itself is Devanagari, so render it in the Hindi font
        style={{ fontFamily: "var(--font-devanagari), sans-serif" }}
      >
        हिन्दी
      </Link>
    </div>
  );
}
