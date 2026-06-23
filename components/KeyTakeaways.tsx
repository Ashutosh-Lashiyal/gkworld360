// KeyTakeaways — a highlighted callout box for the most important points of a topic.
// Matches the Stitch design: sapphire left border, light sapphire tint background,
// uppercase "Key Takeaways" heading, and a clean bulleted list.
//
// HOW TO USE IT inside any .mdx article:
//
//   <KeyTakeaways points={[
//     "Started in Meerut on 10 May 1857",
//     "Mangal Pandey is regarded as the first martyr",
//     "Led to the end of East India Company rule",
//   ]} />
//
// It is registered globally in mdx-components.tsx, so no import is needed in MDX files.

type KeyTakeawaysProps = {
  points: string[]; // the list of key takeaway sentences
};

export default function KeyTakeaways({ points }: KeyTakeawaysProps) {
  if (!points || points.length === 0) return null;

  return (
    <aside
      className={[
        "my-8",
        "border-l-4 border-sapphire",   // sapphire left accent border
        "bg-surface-low",               // light sapphire tint background (#eff4ff)
        "rounded-r-card",               // rounded on the right side only
        "px-6 py-5",
      ].join(" ")}
    >
      {/* Heading — sapphire, uppercase, small, semibold */}
      <p className="font-body text-xs font-bold text-sapphire uppercase tracking-wider mb-4">
        Key Takeaways
      </p>

      {/* Bulleted list of takeaways */}
      <ul className="flex flex-col gap-2.5">
        {points.map((point, index) => (
          <li key={index} className="flex items-start gap-2.5">
            {/* Custom bullet dot in sapphire */}
            <span
              className="mt-2 w-1.5 h-1.5 rounded-full bg-sapphire flex-shrink-0"
              aria-hidden="true"
            />
            <span className="font-body text-base text-foreground leading-relaxed">
              {point}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
