// LanguageToggle — the "English | हिन्दी" switch shown on articles that exist in
// both languages. It's just two links between the two language URLs (Option B),
// so each language has its own address and stays separately indexable.
//
// It only renders when BOTH language versions exist; otherwise there's nothing
// to toggle to, so it shows nothing.
//
// REDESIGN 16 Sep 2026 — uses the site's one Button. This is a TOGGLE, not a
// choice: the reader is already reading one language, so the current one is
// the solid button and the other is the outline ("ghost") version. That is the
// only place two side-by-side buttons are allowed to differ, and it's so the
// reader can see which language they're on. On a card (ContentCard) the two
// languages are equal choices and both buttons are solid.

import Button from "@/components/Button";

type LanguageToggleProps = {
  current: "en" | "hi";   // which language is currently being viewed
  enHref?: string;        // URL of the English version (if it exists)
  hiHref?: string;        // URL of the Hindi version (if it exists)
  // Set true when the toggle sits on a DARK band (the article header in the
  // redesign). The current language then inverts to white and the other
  // becomes a white outline — same idea, kept visible on dark.
  onDark?: boolean;
};

export default function LanguageToggle({ current, enHref, hiHref, onDark = false }: LanguageToggleProps) {
  // Need both versions for a toggle to make sense
  if (!enHref || !hiHref) return null;

  // Pick the pair of variants for the surface we're on.
  const activeVariant = onDark ? "onDark" : "primary";
  const otherVariant = onDark ? "ghostOnDark" : "ghost";

  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label="Choose language">
      <Button
        href={enHref}
        variant={current === "en" ? activeVariant : otherVariant}
        aria-current={current === "en" ? "page" : undefined}
        hrefLang="en"
        className="min-w-[140px]"
      >
        {current === "en" ? "Reading in English" : "Read in English"}
      </Button>
      <Button
        href={hiHref}
        variant={current === "hi" ? activeVariant : otherVariant}
        aria-current={current === "hi" ? "page" : undefined}
        hrefLang="hi"
        lang="hi"
        // The label is Devanagari, so render it in the Hindi font, one px larger
        // (Devanagari sits visually smaller than Latin at the same size).
        className="min-w-[140px] font-hindi text-[15px]"
      >
        {current === "hi" ? "हिन्दी में पढ़ रहे हैं" : "हिन्दी में पढ़ें"}
      </Button>
    </div>
  );
}
