// lib/image-style.ts — the HOUSE STYLE for every picture on GKWorld360, and
// the prompt builders that put it into words (18 Sep 2026).
//
// Why: the owner was writing prompts by hand in the Gemini app and getting
// random results. Now every article, news write-up and quote gets its prompts
// generated FOR it and shown in /admin, ready to copy. One style, written once
// here, so all pictures look like one family — the same reason the site has
// one button.
//
// The style follows the image policy (pipeline doc §6): everything is an
// illustration; real people are sketches, never photos; no text in the image.

export const HOUSE_STYLE =
  "Style: a fine sepia pen-and-ink line illustration on aged cream paper, in the manner of a " +
  "19th-century book engraving — confident hatching, warm brown ink, restrained detail, plenty " +
  "of quiet paper. No text, no captions, no labels, no borders, no watermark. Landscape 16:9.";

const PORTRAIT_STYLE =
  "Style: a fine sepia pen-and-ink portrait sketch on aged cream paper, head and shoulders, " +
  "in the manner of a 19th-century book engraving — dignified, plain background, warm brown ink. " +
  "No text, no captions, no borders. Square 1:1.";

const clean = (s?: string | null) => (s ?? "").replace(/\s+/g, " ").trim();

/** Prompts for an article: one for the cover, one per section heading. */
export function articleImagePrompts(input: {
  title: string;
  subject?: string | null;
  category?: string | null;
  description?: string | null;
  headings?: string[];
}): string {
  const where = [clean(input.subject), clean(input.category)].filter(Boolean).join(" · ");
  const lines: string[] = [];
  lines.push(`COVER — "${clean(input.title)}"${where ? ` (${where})` : ""}`);
  lines.push(
    `An illustration for an article titled "${clean(input.title)}"${input.description ? `: ${clean(input.description)}` : "."} ` +
      `Show the defining scene of the subject — the place, the period, the objects; any people as small figures in period dress, seen from a distance. ` +
      HOUSE_STYLE
  );
  for (const h of input.headings ?? []) {
    const heading = clean(h);
    if (!heading) continue;
    lines.push("");
    lines.push(`SECTION — "${heading}"`);
    lines.push(
      `An illustration for the section "${heading}" of an article titled "${clean(input.title)}". ` +
        `Depict what this section is about as a single clear scene; people only as sketched figures, never portraits. ` +
        HOUSE_STYLE
    );
  }
  lines.push("");
  lines.push("Tip: paste ONE prompt at a time into the Gemini app. If the result has text in it, add \"absolutely no lettering\" and try again.");
  return lines.join("\n");
}

/** Prompt for a quote author's portrait. */
export function portraitPrompt(input: { author: string; authorTitle?: string | null }): string {
  const who = clean(input.authorTitle);
  return (
    `A portrait sketch of ${clean(input.author)}${who ? `, ${who}` : ""}. ` +
    `Faithful to their well-known likeness; calm, thoughtful expression. ` +
    PORTRAIT_STYLE
  );
}

/** The H2 headings of a Lexical body, for the per-section prompts. */
export function headingsOf(body: unknown): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const children: any[] = (body as any)?.root?.children ?? [];
  return children
    .filter((n) => n?.type === "heading" && n?.tag === "h2")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((n) => (n.children ?? []).map((c: any) => (c?.type === "text" ? c.text ?? "" : "")).join("").trim())
    .filter(Boolean);
}
