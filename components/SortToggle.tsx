"use client";
// "use client" — this component uses useRouter to change the URL when the
// user clicks a sort button. URL changes trigger the server to re-render the
// topics page with the correct sort order — no page reload needed.

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
// The page's language: on /hi/topics the buttons say लोकप्रिय / नए and stay on /hi/topics (2 Nov 2026)
import { useSiteText } from "@/lib/use-site-text";
import { PAGE_TEXT } from "@/lib/page-text";

type SortToggleProps = {
  // Which sort is currently active — read from the URL's ?sort= param by the page
  activeSort: "popular" | "recent";
};

export default function SortToggle({ activeSort }: SortToggleProps) {
  const router = useRouter();
  const { lang, href } = useSiteText();
  const t = PAGE_TEXT[lang].topics;
  const base = href("/topics"); // "/topics" or "/hi/topics"

  // REDESIGN 16 Sep 2026 — the site's one Button. This is a toggle, so the
  // active sort is the solid button and the other is the outline ("ghost").
  const variantFor = (sort: "popular" | "recent") =>
    activeSort === sort ? "primary" : "ghost";

  return (
    <div className="flex items-center gap-3">
      <span className="font-body text-sm text-muted mr-1">{t.sortBy}</span>

      {/* Clicking navigates to /topics?sort=popular — the server re-renders
          with popular sort active and the button highlights automatically     */}
      <Button
        variant={variantFor("popular")}
        onClick={() => router.push(`${base}?sort=popular`)}
        aria-current={activeSort === "popular" ? "true" : undefined}
      >
        {t.popular}
      </Button>

      <Button
        variant={variantFor("recent")}
        onClick={() => router.push(`${base}?sort=recent`)}
        aria-current={activeSort === "recent" ? "true" : undefined}
      >
        {t.recent}
      </Button>
    </div>
  );
}
