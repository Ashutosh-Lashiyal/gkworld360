// News collection — current-affairs items. Kept separate from Articles because
// news is date-driven (sorted by when the event happened) and lives under /news.
import type { CollectionConfig } from "payload";
import { articleImagePrompts, headingsOf } from "@/lib/image-style";
import { slugField } from "@/fields/slug";

export const News: CollectionConfig = {
  slug: "news", // slug stays "news" so URLs (/news) and the API don't change
  // The admin/site display name — the founder's own in-depth current-affairs
  // write-ups (distinct from the aggregated "Latest Headlines" RSS feed).
  labels: {
    singular: "Current Affairs",
    plural: "Current Affairs",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "_status", "eventDate"],
  },
  access: {
    read: () => true,
  },
  // ── DRAFT MODE ───────────────────────────────────────────────────────────────
  // Identical to Articles (see collections/Articles.ts for the full note).
  // Current Affairs items go through the same AI-draft → owner-reviews → Publish
  // pipeline as articles, so they need the same draft/published status. One
  // Publish click publishes both languages, and the public site only ever
  // shows `_status: "published"` (lib/cms.ts).
  //
  // ⚠️ Turning this on hides pre-existing items from the admin LIST until they
  // are re-saved once (they have no version history yet). Done for the Smart
  // Border item on dev 15 Sep 2026; must be repeated on production after deploy.
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
    // News URLs are /news/<slug>, so slugs must be globally unique.
    slugField({ unique: true }),
    {
      name: "category",
      type: "text",
      localized: true,
      admin: {
        position: "sidebar",
        description: "e.g. International Affairs, Economy, Science & Tech.",
      },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      // Cap at 220 characters (17 Sep 2026) — see the same field in Articles.ts.
      maxLength: 220,
      admin: { description: "One or two sentences (max 220 characters). Shown under the title and used by Google as the snippet." },
    },
    {
      // Ready-to-paste Gemini prompts in the house style — see Articles.ts.
      name: "imagePrompts",
      type: "textarea",
      admin: {
        position: "sidebar",
        rows: 14,
        description:
          "Copy ONE prompt at a time into the Gemini app, then upload the picture as the cover or in the body. Auto-written on save; you can edit.",
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
    },
    {
      name: "eventDate",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        // displayFormat controls how the date reads in the admin. "dd-MMM-yyyy"
        // → "21-Apr-2026" (day-month-year with the month NAME, so it's never
        // confused like 04/05 could be). Matches the site's public date format.
        date: {
          displayFormat: "dd-MMM-yyyy",
        },
        description:
          "The date the event actually HAPPENED (verify on Google), not when the article was written. This is what students rely on.",
      },
    },
  ],

  hooks: {
    beforeChange: [
      // Write the image prompts on first save (only when the box is empty).
      ({ data }) => {
        if (data.imagePrompts?.trim() || !data.title) return data;
        data.imagePrompts = articleImagePrompts({
          title: data.title,
          subject: "Current Affairs",
          category: data.category,
          description: data.description,
          headings: headingsOf(data.body),
        });
        return data;
      },
    ],
  },
};
