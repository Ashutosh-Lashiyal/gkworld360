// StatPill — one live count, e.g. "4 / Topics". Used under page titles (subject
// pages, /subjects) for real numbers only (lib/site-stats.ts).
//
// REDESIGN PHASE 4 (30 Oct 2026): no longer a round pill — a big Anton number
// with its word underneath, the design's "stats" row:
//
//     1          4          12
//     Category   Topics     Places on the Atlas
//
//   tone="dark"  → for the dark stage (subject pages)
//   tone="light" → for the page
// (The name StatPill is kept so the pages using it didn't have to change.)
//
// Numbers count up from 0 when the page opens (CountUp, 28 Oct 2026). Text
// values like "—" are shown as they are.

import CountUp from "@/components/CountUp";

export default function StatPill({
  value,
  label,
  tone = "light",
}: {
  value: number | string;
  label: string;
  tone?: "light" | "dark";
}) {
  return (
    <span className="inline-flex flex-col mr-4 md:mr-6">
      <span className={`font-display text-[40px] md:text-[46px] leading-none tabular-nums ${tone === "dark" ? "text-on-dark" : "text-foreground"}`}>
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </span>
      <span className={`mt-1.5 font-body text-sm font-bold ${tone === "dark" ? "text-on-dark/60" : "text-muted"}`}>{label}</span>
    </span>
  );
}
