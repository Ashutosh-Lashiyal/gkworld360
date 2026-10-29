// AtlasEntries collection — the dots on the World360 Atlas (/atlas). Added 29 Oct 2026.
//
// ONE entry = ONE event at ONE place on ONE date, e.g. "Vasco da Gama reaches
// Calicut, 1498". Every entry is linked to the article that tells its story, so:
//   - the entry's SUBJECT (and so its colour on the globe) comes from that
//     article — it is never typed in twice and can never disagree
//   - the card's "Read the article" button knows where to go
//   - the article can show an "On the map" box listing its entries
//
// WHY A SEPARATE COLLECTION and not extra fields on Articles: one article can
// have several entries (The Dutch in India has five places), and each entry
// needs its own title, place, date and key points in both languages.
//
// TEXT IN BOTH LANGUAGES: every field a reader sees is `localized`, so one
// entry holds the English AND the Hindi text — exactly like Articles. In
// /admin, the EN / हिन्दी switch at the top flips which language you edit.
// One Publish publishes both. /atlas shows the English text, /hi/atlas the Hindi.
//
// DRAFT → PUBLISH, like Articles: new entries (including the ones Claude drafts
// with an article) start as drafts, and only the owner's Publish click puts
// them on the Atlas. The site also hides an entry whose ARTICLE is not
// published — a dot must never lead to a page that isn't there.
import type { CollectionConfig } from "payload";
import { ValidationError } from "payload";
import { refreshHooks } from "@/lib/refresh";

// Turns a title into the URL-safe slug style used everywhere on the site:
// "Vasco da Gama reaches Calicut" → "vasco-da-gama-reaches-calicut"
function slugify(text: string): string {
  return text
    .normalize("NFKD") //                   splits "á" into "a" + an accent mark…
    .replace(/[̀-ͯ]/g, "") //     …and drops the accent mark
    .toLowerCase()
    .replace(/[’']/g, "") //                "Ashoka’s" → "ashokas", not "ashoka-s"
    .replace(/[^a-z0-9]+/g, "-") //         every run of other characters → one hyphen
    .replace(/^-+|-+$/g, ""); //            no hyphen at the start or end
}

// The year as it appears in a slug: 1757 → "1757", -261 → "261-bc".
const yearForSlug = (year: number) => (year < 0 ? `${Math.abs(year)}-bc` : String(year));

export const AtlasEntries: CollectionConfig = {
  slug: "atlas-entries",
  labels: { singular: "Atlas entry", plural: "Atlas entries" },
  admin: {
    useAsTitle: "title",
    // `_status` = the Draft / Published column, so you can see at a glance
    // which entries are on the Atlas.
    defaultColumns: ["title", "article", "year", "place", "_status"],
    description:
      "The dots on the World360 Atlas (/atlas). Each entry is one event at one place, linked to the article that explains it. Fill in English first, then switch the language at the top to हिन्दी.",
  },
  access: {
    // Anyone may read PUBLISHED entries (the Atlas page and the public API).
    // Drafts are visible only to someone logged in to /admin — so an entry
    // that is still being checked can't be read by calling /api/atlas-entries.
    // (The site's own code uses Payload directly, which skips this rule.)
    read: ({ req }) => (req.user ? true : { _status: { equals: "published" } }),
  },
  // Gives the entry "Save draft" + "Publish" buttons and a version history.
  versions: {
    drafts: true,
  },
  fields: [
    {
      // The card's heading — what happened, in a few words.
      name: "title",
      type: "text",
      required: true,
      localized: true,
      admin: { description: "What happened, in a few words — e.g. “Vasco da Gama reaches Calicut”." },
    },
    {
      // The end of the card's web address: /atlas/vasco-da-gama-reaches-calicut-1498.
      // Same slug for both languages (/hi/atlas/… uses it too), like articles.
      //
      // Filled in AUTOMATICALLY from the English title + year when left empty
      // (see the beforeValidate hook below), and LOCKED once the entry has been
      // published — people may have shared that address, and changing it would
      // break their links. The lock is enforced in the beforeChange hook.
      name: "slug",
      type: "text",
      unique: true, // two cards can never share an address
      index: true, // the /atlas/<slug> page looks entries up by it
      admin: {
        position: "sidebar",
        description:
          "The card's web address (/atlas/<this>). Leave EMPTY and it is made from the English title and year when you save. Locked once published, because shared links use it.",
      },
      validate: (value: unknown) => {
        // Empty is allowed here only because the hook fills it in before this
        // runs; if it is STILL empty, the title was empty too.
        if (typeof value !== "string" || value.length === 0) {
          return "Could not make a web address — fill in the English title first.";
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return "Use lowercase letters, numbers and hyphens only (e.g. battle-of-plassey-1757).";
        }
        return true;
      },
    },
    {
      // Hidden switch: becomes true the first time the entry is published, and
      // from then on the slug can't change. Kept as a field (not worked out
      // from the status) so un-publishing an entry doesn't unlock it — its
      // address may already be out in the world.
      name: "slugLocked",
      type: "checkbox",
      defaultValue: false,
      admin: { hidden: true },
    },
    {
      // The article this entry belongs to. Its subject decides the dot's colour.
      name: "article",
      type: "relationship",
      relationTo: "articles",
      required: true,
      admin: {
        position: "sidebar",
        description: "The article that tells this story. The Atlas takes the subject (and colour) from it, and the card's “Read the article” opens it.",
      },
    },

    // ── WHERE ──────────────────────────────────────────────────────────────────
    {
      type: "row", // shows the next two fields side by side in /admin
      fields: [
        {
          // The place's name as the card shows it: "Calicut".
          name: "place",
          type: "text",
          required: true,
          localized: true,
          admin: { width: "50%", description: "The place as it was known then — e.g. “Calicut”." },
        },
        {
          // Where that is today, so readers can find it: "Kozhikode, Kerala".
          name: "region",
          type: "text",
          localized: true,
          admin: { width: "50%", description: "Where it is today — e.g. “Kozhikode, Kerala”." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          // North–south position. -90 (South Pole) to 90 (North Pole).
          name: "lat",
          label: "Latitude",
          type: "number",
          required: true,
          min: -90,
          max: 90,
          admin: {
            width: "50%",
            step: 0.01,
            description: "Google Maps: right-click the spot — the FIRST number shown. e.g. 11.26",
          },
        },
        {
          // East–west position. -180 to 180 (negative = west of London).
          name: "lng",
          label: "Longitude",
          type: "number",
          required: true,
          min: -180,
          max: 180,
          admin: {
            width: "50%",
            step: 0.01,
            description: "The SECOND number shown. e.g. 75.78",
          },
        },
      ],
    },

    // ── WHEN ───────────────────────────────────────────────────────────────────
    // The date is stored as NUMBERS so the timeline can sort it (BC before AD,
    // May 1857 before September 1857). The site writes the date out in each
    // language by itself — "11 May 1857" / "11 मई 1857", "c. 261 BC" /
    // "लगभग 261 ई.पू." — so nobody has to type it twice.
    {
      type: "row",
      fields: [
        {
          // Negative = BC. There is no year 0 (1 BC is followed by AD 1).
          name: "year",
          type: "number",
          required: true,
          admin: { width: "34%", description: "e.g. 1498. For BC use a minus: 261 BC = -261." },
          validate: (value: unknown) => {
            if (typeof value !== "number" || !Number.isInteger(value)) return "A whole year, e.g. 1498 (or -261 for 261 BC).";
            if (value === 0) return "There is no year 0 — use 1 (AD 1) or -1 (1 BC).";
            return true;
          },
        },
        {
          // Optional — only when the source gives the month.
          name: "month",
          type: "number",
          min: 1,
          max: 12,
          admin: { width: "33%", description: "Optional, 1–12. e.g. 5 for May." },
        },
        {
          // Optional — only when the source gives the exact day.
          name: "day",
          type: "number",
          min: 1,
          max: 31,
          admin: { width: "33%", description: "Optional, 1–31." },
        },
      ],
    },
    {
      // Tick when the date is not exact — the site then writes "c. 2500 BC"
      // ("circa" = about). Pipeline rule: an approximate date is always marked.
      name: "approximate",
      label: "The date is approximate",
      type: "checkbox",
      defaultValue: false,
    },
    {
      // For the rare date that numbers can't express ("5th century CE").
      // Leave empty almost always — the site writes the date from the numbers.
      name: "dateText",
      label: "Date as shown (optional)",
      type: "text",
      localized: true,
      admin: {
        description:
          "Leave EMPTY — the date is written from the numbers above, in both languages. Only for dates like “5th century CE”; then fill it in for हिन्दी too.",
      },
    },

    // ── WHAT ───────────────────────────────────────────────────────────────────
    {
      // The card's body: 2 or 3 short facts. The whole LIST is localized, so
      // English and Hindi each have their own list (switch the language at the
      // top of the page to edit the Hindi one).
      name: "keyPoints",
      type: "array",
      localized: true,
      minRows: 2,
      maxRows: 3,
      labels: { singular: "Key point", plural: "Key points" },
      admin: {
        description: "2 or 3 short facts, one sentence each. Facts only — checked against the article.",
      },
      fields: [
        {
          name: "text",
          type: "textarea",
          required: true,
          maxLength: 200,
        },
      ],
    },
    {
      // Optional. Empty → the card uses the article's cover picture.
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: { description: "Optional. Leave empty to use the article's cover picture." },
    },
  ],

  // ── HOOKS ────────────────────────────────────────────────────────────────────
  // A "hook" is a small function Payload runs at a fixed moment during a save.
  hooks: {
    // beforeValidate runs FIRST — before the field checks above — so an empty
    // slug can be filled in before the "slug is required" check sees it.
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data;
        // Only from the ENGLISH title: a Hindi title would give an empty slug
        // (the slug keeps only a–z and 0–9).
        const english = (req.locale ?? "en") === "en";
        if (!data.slug && english && typeof data.title === "string" && typeof data.year === "number") {
          const base = slugify(data.title);
          const year = yearForSlug(data.year);
          // "The Revolt of 1857 begins" already has its year — don't add it twice.
          data.slug = base.includes(year) ? base : `${base}-${year}`;
        }
        return data;
      },
    ],
    // beforeChange runs after the checks pass, just before saving.
    beforeChange: [
      ({ data, originalDoc, req }) => {
        // 1. A published entry's address can never change (see the slug field).
        if (originalDoc?.slugLocked) {
          if (data.slug && data.slug !== originalDoc.slug) {
            throw new ValidationError({
              collection: "atlas-entries",
              errors: [{ path: "slug", message: `This entry has been published, so its address is locked as “${originalDoc.slug}”. Links people have shared use it.` }],
              req,
            });
          }
          data.slugLocked = true; // stays locked even if the form didn't send it
        }
        // 2. Publishing for the first time → lock the address from now on.
        if (data._status === "published") data.slugLocked = true;
        return data;
      },
    ],
    // Saved or deleted → refresh the cached pages (lib/refresh.ts), so the
    // Atlas shows the change on the next visit, not an hour later.
    ...refreshHooks,
  },
};
