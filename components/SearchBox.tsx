"use client";
// "use client" — interactive: it navigates to the search page when submitted.
//
// A reusable search input used on the homepage hero. On submit (Enter or the
// Explore/Search button), it sends the user to /search?q=<their text>.

import { useState } from "react";
import { useRouter } from "next/navigation";

type SearchBoxProps = {
  buttonLabel?: string;  // text on the button (default "Search")
  placeholder?: string;
};

export default function SearchBox({
  buttonLabel = "Search",
  placeholder = "Search topics, subjects, articles...",
}: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  // Runs when the form is submitted (Enter key or button click)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // stop the browser's default full-page reload
    const q = value.trim();
    // Go to the search page — with the query if there is one, otherwise just /search
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full",
          "font-body text-base text-foreground placeholder:text-muted",
          "bg-background border border-hairline rounded-card",
          "px-4 py-3",
          "outline-none focus:border-sapphire focus:ring-2 focus:ring-sapphire/20",
          "transition-colors",
        ].join(" ")}
      />
      <button
        type="submit"
        className="w-full sm:w-auto font-body text-sm font-semibold text-on-dark bg-navy hover:bg-navy-dark rounded-card px-6 py-3 transition-colors whitespace-nowrap"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
