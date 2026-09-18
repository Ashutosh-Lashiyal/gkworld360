// Quotes collection — the "Quote of the day" shown in the footer of every page.
//
// Added 18 Sep 2026 so the owner manages quotes in /admin instead of a file:
// add as many as you like, switch them on/off, and PIN one to a date (Gandhi
// Jayanti, Republic Day…). The site picks today's quote like this
// (lib/quote.ts): a quote pinned to today wins; otherwise the active quotes
// rotate one per day, changing at midnight Indian time. If this collection
// is empty, the old file (data/daily-quote.mdx) is used, so nothing breaks.
//
// ACCURACY: only real, verifiable quotes with correct attribution — never
// invented or "improved" ones. A wrong attribution on an education site is
// worse than no quote.

import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { portraitPrompt } from "@/lib/image-style";

export const Quotes: CollectionConfig = {
  slug: "quotes",
  admin: {
    useAsTitle: "author",
    defaultColumns: ["author", "quote", "showOn", "active"],
    description: "The quote of the day in the footer. Pin one to a date, or let the active ones rotate daily.",
  },
  access: { read: () => true },
  fields: [
    {
      name: "quote",
      type: "textarea",
      required: true,
      localized: true, // English and Hindi renderings
      maxLength: 300,
      admin: { description: "The quote itself, exactly as the person said or wrote it. Max 300 characters." },
    },
    { name: "author", type: "text", required: true },
    {
      name: "authorTitle",
      type: "text",
      localized: true,
      maxLength: 120,
      admin: { description: "One line on who this is, e.g. 'Former Secretary-General of the United Nations'." },
    },
    {
      // Optional sketch portrait. The prompt below writes itself from the name.
      name: "portrait",
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar", description: "Optional. A sepia sketch — generate it with the prompt below and upload here." },
    },
    {
      name: "portraitPrompt",
      type: "textarea",
      admin: {
        position: "sidebar",
        rows: 8,
        description: "Copy into the Gemini app to draw the portrait. Auto-written on save; you can edit.",
      },
    },
    {
      // Pin to a specific day. Empty = takes part in the daily rotation.
      name: "showOn",
      type: "date",
      admin: {
        position: "sidebar",
        date: { displayFormat: "dd-MMM-yyyy" },
        description: "Show this quote on ONE particular day (e.g. 2 October). Leave empty to rotate.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar", description: "Untick to keep the quote but stop showing it." },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.portraitPrompt?.trim() && data.author) {
          data.portraitPrompt = portraitPrompt({ author: data.author, authorTitle: data.authorTitle });
        }
        return data;
      },
    ],
    // CACHE REFRESH (18 Sep 2026). The footer's "quote of the day" is looked
    // up once and the answer kept for an hour (lib/quote.ts, tag "daily-quote"),
    // so admin edits used to take up to an hour to show. These two hooks run
    // after a quote is saved or deleted and tell Next.js that saved answer is
    // out of date; the next page load fetches a fresh one. Same pattern will
    // go on Articles/News later.
    afterChange: [
      () => {
        revalidateTag("daily-quote", "max");
      },
    ],
    afterDelete: [
      () => {
        revalidateTag("daily-quote", "max");
      },
    ],
  },
};
