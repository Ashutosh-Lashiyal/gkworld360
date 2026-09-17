// StatPill — "number + word" in a round pill, e.g. (2) topics. Used for the
// live counts on the hero and on subject pages. Pills stay round on purpose
// even though cards and buttons are square (17 Sep 2026): a pill that isn't
// round isn't a pill.
//   tone="dark"  → translucent white on a dark hero
//   tone="light" → white with a hairline border, on the page

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
    <span
      className={[
        "inline-flex items-center gap-2.5 min-h-12 px-6 rounded-full",
        tone === "dark"
          ? "bg-on-dark/10 border border-on-dark/25 backdrop-blur-sm text-on-dark"
          : "bg-surface border border-hairline text-muted",
      ].join(" ")}
    >
      <span className={`font-heading text-2xl font-bold leading-none ${tone === "dark" ? "text-on-dark" : "text-navy-dark"}`}>{value}</span>
      <span className={`font-body text-[15px] font-medium ${tone === "dark" ? "text-on-dark/85" : ""}`}>{label}</span>
    </span>
  );
}
