// Headlines — a CACHE of aggregated RSS headlines (NOT hand-edited content).
//
// RSS feeds only expose the last day or two of news, so headlines vanish quickly.
// So the "View all" page can retain a full week, the Pulse sync (lib/pulse.ts)
// saves headlines here and keeps a rolling 7-day window — filling and pruning it
// automatically. Nobody edits it by hand, so we HIDE it from the admin sidebar.
import type { CollectionConfig } from "payload";

export const Headlines: CollectionConfig = {
  slug: "headlines",
  admin: {
    hidden: true, // auto-managed cache — keep it out of the admin nav
    useAsTitle: "title",
  },
  access: { read: () => true }, // the site reads headlines from here
  fields: [
    { name: "title", type: "text", required: true },
    // The original article URL. `unique` makes it our de-duplication key so the
    // same headline is never stored twice.
    { name: "link", type: "text", required: true, unique: true, index: true },
    { name: "snippet", type: "textarea" },
    { name: "source", type: "text" }, // e.g. "The Hindu"
    { name: "category", type: "text", index: true }, // National / Sports / ...
    { name: "image", type: "text" }, // the source image URL (we don't store the file)
    // When the story was published — used for sorting and the 7-day prune.
    { name: "publishedAt", type: "date", index: true },
  ],
};
