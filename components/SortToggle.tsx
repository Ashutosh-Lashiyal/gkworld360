"use client";
// "use client" — this component uses useRouter to change the URL when the
// user clicks a sort button. URL changes trigger the server to re-render the
// topics page with the correct sort order — no page reload needed.

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

type SortToggleProps = {
  // Which sort is currently active — read from the URL's ?sort= param by the page
  activeSort: "popular" | "recent";
};

export default function SortToggle({ activeSort }: SortToggleProps) {
  const router = useRouter();

  // REDESIGN 16 Sep 2026 — the site's one Button. This is a toggle, so the
  // active sort is the solid button and the other is the outline ("ghost").
  const variantFor = (sort: "popular" | "recent") =>
    activeSort === sort ? "primary" : "ghost";

  return (
    <div className="flex items-center gap-3">
      <span className="font-body text-sm text-muted mr-1">Sort by:</span>

      {/* Clicking navigates to /topics?sort=popular — the server re-renders
          with popular sort active and the button highlights automatically     */}
      <Button
        variant={variantFor("popular")}
        onClick={() => router.push("/topics?sort=popular")}
        aria-current={activeSort === "popular" ? "true" : undefined}
      >
        Popular
      </Button>

      <Button
        variant={variantFor("recent")}
        onClick={() => router.push("/topics?sort=recent")}
        aria-current={activeSort === "recent" ? "true" : undefined}
      >
        Recently Added
      </Button>
    </div>
  );
}
