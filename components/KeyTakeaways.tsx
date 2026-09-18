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

// lang: "hi" gives the Hindi heading "लेख से प्राप्त मुख्य बिंदु" (owner's wording, 17 Sep).
export default function KeyTakeaways({ points, first = false, lang = "en" }: KeyTakeawaysProps & { first?: boolean; lang?: "en" | "hi" }) {
  if (!points || points.length === 0) return null;

  return (
    // REDESIGN 16 Sep 2026 (board 2): a WHITE card with a 4px bar on top in the
    // page's signal colour. `var(--signal)` is set by ArticleLayout from the
    // subject, so this card is sepia-topped on History, violet on Physics, with
    // no per-page code. The `not-prose` idea: this sits inside the .prose
    // column, so the list resets in globals.css keep our own bullets.
    <aside className={`${first ? "" : "my-8"} flex flex-col bg-surface border border-hairline rounded-card overflow-hidden`}>
      <span aria-hidden="true" className="h-1 w-full" style={{ backgroundColor: "var(--signal, #059669)" }} />

      <div className="px-6 py-5 flex flex-col gap-3">
        {/* Heading — small caps in the signal colour, like every label on the site */}
        <p
          className="font-body text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--signal, #059669)" }}
        >
          {lang === "hi" ? (
            <span lang="hi" className="font-hindi normal-case tracking-normal text-[13px]">
              लेख से प्राप्त मुख्य बिंदु{first ? " · पहले इन्हें पढ़ें" : ""}
            </span>
          ) : (
            <>Key Takeaways{first ? " · read these first" : ""}</>
          )}
        </p>

        {/* Bulleted list of takeaways — 16px sans so it reads as a summary,
            distinct from the 19px serif body around it */}
        <ul className="flex flex-col gap-2">
          {points.map((point, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <span
                className="mt-[9px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "var(--signal, #059669)" }}
                aria-hidden="true"
              />
              <span className="font-body text-base text-foreground leading-relaxed">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
