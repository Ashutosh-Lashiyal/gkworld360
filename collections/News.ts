// News collection — current-affairs items. Kept separate from Articles because
// news is date-driven (sorted by when the event happened) and lives under /news.
import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";

export const News: CollectionConfig = {
  slug: "news",
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
        description:
          "The date the event actually HAPPENED (verify on Google), not when the article was written. This is what students rely on.",
      },
    },
  ],
};
