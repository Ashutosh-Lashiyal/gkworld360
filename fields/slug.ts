// A reusable "slug" field shared by every content collection.
// A slug is the permanent, URL-safe piece of an address — e.g. the
// "revolt-of-1857" in /history/modern-india/revolt-of-1857.
//
// Why a shared helper: Subjects, Categories, Articles and News ALL need a slug
// with the same rules. Defining it once here keeps them consistent and means a
// rule change happens in a single place.
import type { Field } from "payload";

// `unique` is optional: Subjects and News slugs must be globally unique, but
// Article/Category slugs only need to be unique within their subject path
// (two different subjects could each have an "introduction" article), so we
// leave those non-unique and rely on the subject+slug combination instead.
export const slugField = ({ unique = false }: { unique?: boolean } = {}): Field => ({
  name: "slug",
  type: "text",
  required: true,
  index: true, // makes look-ups by slug fast (the site fetches pages by slug)
  unique,
  admin: {
    position: "sidebar",
    description:
      "Permanent URL piece — lowercase words separated by hyphens (e.g. revolt-of-1857). Do NOT change after publishing; it would break links and SEO.",
  },
  // Slug is intentionally NOT localized — the Hindi version lives at /hi/<slug>
  // using the SAME slug, so the URL stays consistent across languages.
  validate: (value: unknown) => {
    if (typeof value !== "string" || value.length === 0) {
      return "Slug is required.";
    }
    // Only lowercase letters, numbers, and single hyphens between words.
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return "Use lowercase letters, numbers and hyphens only (e.g. revolt-of-1857).";
    }
    return true;
  },
});
