// Subjects collection — the top level of the content hierarchy
// (History, Geography, Physics, ...). Managing subjects here means their name,
// icon, cover photo, colours and homepage order all live in one editable place
// instead of being hard-coded in lib/subjects.ts + lib/subject-colors.ts.
import type { CollectionConfig } from "payload";
import { slugField } from "@/fields/slug";

export const Subjects: CollectionConfig = {
  slug: "subjects",
  admin: {
    useAsTitle: "name", // show the subject name as the row title in the admin
    defaultColumns: ["name", "slug", "homepageOrder"],
  },
  // read: () => true makes subjects publicly readable through the API so the
  // website can fetch them without a logged-in user. Creating/editing still
  // requires an admin login (that's the default for the other operations).
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true, // "History" (en) / "इतिहास" (hi)
    },
    // Permanent URL piece, e.g. "history". Globally unique — each subject is one-of-a-kind.
    slugField({ unique: true }),
    {
      name: "icon",
      type: "text",
      admin: { description: "An emoji shown on the subject card, e.g. 🏛️" },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "The cover photo on the homepage subject card." },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
    },
    {
      name: "homepageOrder",
      type: "number",
      admin: {
        position: "sidebar",
        description:
          "Lower numbers appear first on the homepage. Leave blank to keep the subject off the homepage.",
      },
    },
    {
      // Per-subject theme colours (matches the current lib/subject-colors.ts).
      name: "colors",
      type: "group",
      admin: { description: "Optional theme colours (hex codes) for this subject." },
      fields: [
        { name: "accent", type: "text", admin: { description: "e.g. #92400e" } },
        { name: "background", type: "text", admin: { description: "e.g. #fffbf4" } },
        { name: "border", type: "text", admin: { description: "e.g. #d97706" } },
      ],
    },
  ],
};
