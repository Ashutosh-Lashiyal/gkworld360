// TopicImage — a custom Block for placing a captioned image inside an article
// body (the old <TopicImage src caption size /> MDX component).
// The image itself is picked from the Media library (stored in Cloudflare R2).
import type { Block } from "payload";

export const TopicImage: Block = {
  slug: "topicImage",
  interfaceName: "TopicImageBlock",
  labels: {
    singular: "Image",
    plural: "Images",
  },
  fields: [
    {
      name: "image",
      type: "upload",
      relationTo: "media", // links to a file in the Media collection (→ R2)
      required: true,
    },
    {
      name: "caption",
      type: "text",
      // Captions differ per language, but the parent body field is already
      // localized, so no localized flag needed here (same reasoning as KeyTakeaways).
    },
    {
      name: "size",
      type: "select",
      defaultValue: "medium",
      options: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Full width", value: "full" },
      ],
      admin: {
        description: "How wide the image appears within the article column.",
      },
    },
    {
      // Alignment controls WHERE the image sits. The two "Wrap" options make the
      // text flow AROUND the image (image on one side, text on the other) — this
      // is the "image on the side" look. Wrapping works best with Small/Medium
      // size (a full-width image has no room for text beside it).
      name: "align",
      type: "select",
      defaultValue: "center",
      options: [
        { label: "Center", value: "center" },
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
        { label: "Wrap — image left, text on the right", value: "wrap-left" },
        { label: "Wrap — image right, text on the left", value: "wrap-right" },
      ],
      admin: {
        description:
          "Where the image sits. Choose a 'Wrap' option (with Small/Medium size) to put the image on the side with text flowing beside it.",
      },
    },
  ],
};
