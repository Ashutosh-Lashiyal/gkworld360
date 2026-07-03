// Categories collection — the optional middle level under a Subject
// (e.g. "Modern India" under History). Your site has category overview pages
// like /history/modern-india, so a category needs its own name, slug and
// overview text — hence it's a proper collection, not just a text label.
import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "subject"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
    },
    // Not globally unique: the same category slug could exist under two
    // different subjects. Uniqueness is really "unique within a subject".
    slugField(),
    {
      name: "subject",
      type: "relationship",
      relationTo: "subjects",
      required: true,
      admin: {
        position: "sidebar",
        description: "Which subject this category belongs to.",
      },
    },
    {
      name: "overview",
      type: "richText",
      localized: true,
      admin: {
        description: "The introductory text shown on the category's overview page.",
      },
      // Uses the global editor (with Key Takeaways + Image blocks) set in payload.config.ts.
    },
  ],
};
