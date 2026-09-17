// Articles collection — the actual topic pages (the heart of the site).
// An article belongs to a Subject and, optionally, a Category. Its body is a
// rich text field that can contain Key Takeaways and Image blocks.
import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    // `_status` is the Draft/Published column that `versions.drafts` adds —
    // showing it in the list view means you can see at a glance what is live.
    defaultColumns: ["title", "subject", "category", "_status", "publishedDate"],
  },
  access: {
    read: () => true,
  },
  // ── DRAFT MODE ───────────────────────────────────────────────────────────────
  // Turning on `versions.drafts` gives every article a status: "draft" or
  // "published". This is the foundation of the content pipeline
  // (docs/GKWORLD360_CONTENT_PIPELINE.md): AI-written articles are saved as
  // DRAFTS and only the owner's Publish click in /admin makes them public.
  //
  // What it changes in practice:
  //   - /admin gains "Save Draft" and "Publish" buttons instead of just "Save"
  //   - the public site must ask for `_status: "published"` only (see lib/cms.ts)
  //   - Payload keeps a history of versions, so a bad edit can be rolled back
  //
  // Because title/description/body are `localized`, ONE document holds both the
  // English and Hindi text — so one Publish publishes both languages together.
  // That enforces the rule "a topic is complete only when both languages exist".
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    slugField(),
    {
      name: "subject",
      type: "relationship",
      relationTo: "subjects",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      admin: {
        position: "sidebar",
        description: "Optional — the category this article sits under.",
      },
    },
    {
      // Controls the READING ORDER of this article within its category.
      //
      // Why this exists: study topics build on each other, so "Causes of the
      // Revolt" should come before "Consequences" — not whichever happens to be
      // alphabetically first. MDX articles have always had this as an `order:`
      // value in their frontmatter; without the same field here, articles
      // written in /admin could not be sequenced at all.
      //
      // How it behaves (identical to the MDX version, see lib/content.ts):
      //   - Lower numbers come first: 1, then 2, then 3…
      //   - Leave it EMPTY and the article sorts to the END (treated as 999).
      //   - Two articles with the same number fall back to alphabetical order.
      //
      // Tip: number in 10s (10, 20, 30) rather than 1, 2, 3 — then inserting a
      // new topic between two existing ones is just "15", with nothing to renumber.
      name: "order",
      type: "number",
      admin: {
        position: "sidebar",
        description:
          "Reading order within the category. Lower numbers first; empty sorts last. Tip: use 10, 20, 30 so you can insert between later.",
      },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      // Cap at 220 characters (17 Sep 2026): the summary shows in full under the
      // article title — 2–3 lines — and Google cuts snippets at ~160 anyway.
      // A paragraph here pushed the whole page down (Smart Border, 22 May).
      // This is validation only, not a database change.
      maxLength: 220,
      admin: {
        description: "One or two sentences (max 220 characters). Shown under the title and used by Google as the snippet.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "coverImageCaption",
      type: "text",
      localized: true,
    },
    {
      name: "body",
      type: "richText",
      required: true,
      localized: true,
      // Uses the global editor (with Key Takeaways + Image blocks).
    },
    {
      name: "publishedDate",
      type: "date",
      admin: {
        position: "sidebar",
        // Show dates as "21-Apr-2026" (day-month-year with month name) in the
        // admin, matching the site's public date format.
        date: {
          displayFormat: "dd-MMM-yyyy",
        },
        description: "When this article was published. Fills itself in the first time you press Publish; you can still change it.",
      },
    },
  ],

  // ── HOOKS ────────────────────────────────────────────────────────────────────
  // A "hook" is a small function Payload runs at a fixed moment — here, just
  // before an article is saved. This one fills in `publishedDate` the FIRST
  // time an article is published (added 17 Sep 2026: "The Portuguese in India"
  // went live with the date left blank, because the box is manual).
  //   - `data._status === "published"` → the save that is happening is a Publish
  //   - `!data.publishedDate`           → and no date has been typed in
  //   - `originalDoc?._status !== "published"` → and it wasn't already published
  //     (so re-saving an old article never overwrites its real date)
  // Only then do we stamp today. The owner can always edit the date afterwards.
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const publishingNow = data._status === "published" && originalDoc?._status !== "published";
        if (publishingNow && !data.publishedDate) {
          data.publishedDate = new Date().toISOString();
        }
        return data;
      },
    ],
  },
};
