"use client";
// "use client" — this component uses useRouter to change the URL when the
// user clicks a sort button. URL changes trigger the server to re-render the
// topics page with the correct sort order — no page reload needed.

import { useRouter } from "next/navigation";

type SortToggleProps = {
  // Which sort is currently active — read from the URL's ?sort= param by the page
  activeSort: "popular" | "recent";
};

export default function SortToggle({ activeSort }: SortToggleProps) {
  const router = useRouter();

  const buttonClass = (sort: "popular" | "recent") =>
    [
      "font-body text-sm font-semibold px-5 py-2 rounded-full border transition-all duration-200",
      // Active sort: filled sapphire background
      // Inactive sort: outlined, switches to sapphire on hover
      activeSort === sort
        ? "bg-sapphire text-white border-sapphire"
        : "text-muted border-hairline hover:border-sapphire hover:text-sapphire bg-surface",
    ].join(" ");

  return (
    <div className="flex items-center gap-3">
      <span className="font-body text-sm text-muted mr-1">Sort by:</span>

      {/* Clicking navigates to /topics?sort=popular — the server re-renders
          with popular sort active and the button highlights automatically     */}
      <button
        className={buttonClass("popular")}
        onClick={() => router.push("/topics?sort=popular")}
      >
        Popular
      </button>

      <button
        className={buttonClass("recent")}
        onClick={() => router.push("/topics?sort=recent")}
      >
        Recently Added
      </button>
    </div>
  );
}
