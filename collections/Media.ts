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
  // The upload config activates Payload's file handling AND optimises every
  // uploaded image (via `sharp`, wired up in payload.config.ts):
  upload: {
    // Cap the stored image at 1600px wide — plenty for any web page, and it
    // stops us storing giant 4000px originals. `withoutEnlargement` means small
    // images are left as-is (never blown up, which would look blurry).
    resizeOptions: {
      width: 1600,
      withoutEnlargement: true,
    },
    // Convert every upload to WebP at 80% quality. WebP is far smaller than
    // PNG/JPG at the same visual quality — this is the big space saver (a 2-3MB
    // PNG typically drops to ~150-300KB).
    formatOptions: {
      format: "webp",
      options: { quality: 80 },
    },
  },
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
