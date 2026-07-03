// KeyTakeaways — a custom "Block" for the rich text editor.
// In the old MDX system this was <KeyTakeaways points={[...]} />. In Payload,
// a Block is a reusable Lego-piece the author inserts into an article's body.
// Each block carries its own structured fields (here: a list of points), so the
// takeaways always render as a clean, consistent box — never free-form text.
//
// On the website (Phase 4) we map this block's `slug` ("keyTakeaways") to the
// same styled component you have today.
import type { Block } from "payload";

export const KeyTakeaways: Block = {
  slug: "keyTakeaways",
  // interfaceName gives this block a named TypeScript type in payload-types.ts,
  // which makes rendering it on the frontend type-safe in Phase 4.
  interfaceName: "KeyTakeawaysBlock",
  labels: {
    singular: "Key Takeaways",
    plural: "Key Takeaways",
  },
  fields: [
    {
      name: "points",
      type: "array", // a repeatable list — one row per takeaway
      label: "Points",
      minRows: 1,
      labels: { singular: "Point", plural: "Points" },
      fields: [
        {
          name: "text",
          type: "text",
          required: true,
        },
      ],
      // Note: no `localized: true` on these inner fields. The article `body`
      // field that CONTAINS this block is itself localized, so the English and
      // Hindi bodies (and their blocks) are already stored separately.
    },
  ],
};
