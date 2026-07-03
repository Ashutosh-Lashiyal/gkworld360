// Media collection — handles all image uploads through the Payload admin panel.
// upload: true tells Payload this collection stores actual files (not just text).
// The s3Storage plugin in payload.config.ts automatically sends every uploaded
// file to Cloudflare R2 — you never have to manually move images around.
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
  },
  // Images must be publicly readable so the website can display them.
  access: {
    read: () => true,
  },
  // upload: true activates Payload's file handling system for this collection.
  // Each document here represents one image/file stored in Cloudflare R2.
  upload: true,
  fields: [
    {
      // Alt text is required for accessibility and SEO.
      // Screen readers use it to describe images to visually impaired users.
      name: "alt",
      type: "text",
      label: "Alt Text",
      required: true,
    },
    {
      // Optional caption shown below images in articles.
      name: "caption",
      type: "text",
      label: "Caption (optional)",
    },
  ],
};
