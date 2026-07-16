// Articles collection — the actual topic pages (the heart of the site).
// An article belongs to a Subject and, optionally, a Category. Its body is a
// rich text field that can contain Key Takeaways and Image blocks.
import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "subject", "category", "publishedDate"],
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
      name: "description",
      type: "textarea",
      localized: true,
      admin: {
        description: "A short summary used for SEO and in card previews.",
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
        description: "When this article was published.",
      },
    },
  ],
};
