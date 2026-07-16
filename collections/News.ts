// News collection — current-affairs items. Kept separate from Articles because
// news is date-driven (sorted by when the event happened) and lives under /news.
import type { CollectionConfig } from "payload";
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
    defaultColumns: ["title", "category", "eventDate"],
  },
  access: {
    read: () => true,
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
      admin: { description: "Short summary for SEO and card previews." },
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
};
