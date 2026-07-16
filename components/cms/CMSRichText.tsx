// CMSRichText — turns a Payload "Lexical" rich-text body into real React/HTML.
//
// Payload stores the article body as structured JSON (headings, paragraphs,
// lists, and our custom blocks). Payload's <RichText> component walks that JSON
// and renders it. The default rules already handle headings/paragraphs/lists/
// links. We add "converters" for our two custom blocks so they render as the
// SAME components the old MDX articles used — keeping the look identical.
import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import KeyTakeaways from "@/components/KeyTakeaways";
import TopicImage from "@/components/TopicImage";
import { slugifyHeading } from "@/lib/cms";

// Payload's converter callbacks receive richly-typed nodes; we only need a few
// fields, so we describe those loosely here (the `any`s are deliberate and
// contained to this file).
/* eslint-disable @typescript-eslint/no-explicit-any */

// A "converter" says: for this node/block type, render this React.
const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters, // keep all the built-in rules (headings, paragraphs, etc.)
  // Override the heading rule so every heading gets an `id` (e.g. id="causes").
  // This is what lets the Table of Contents links jump to a section. The id is
  // built with slugifyHeading — the SAME function the TOC uses — so they match.
  heading: ({ node, nodesToJSX }: { node: any; nodesToJSX: any }) => {
    const children = nodesToJSX({ nodes: node.children });
    const NodeTag = node.tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    const text = (node.children ?? []).map((c: any) => c?.text ?? "").join("");
    return <NodeTag id={slugifyHeading(text)}>{children}</NodeTag>;
  },
  blocks: {
    // "keyTakeaways" matches the block slug in blocks/KeyTakeaways.ts.
    // The block stores points as [{ text }]; our component wants a string[],
    // so we map the objects down to plain strings.
    keyTakeaways: ({ node }: { node: any }) => {
      const points = ((node.fields?.points as { text: string }[]) ?? []).map(
        (p) => p.text
      );
      return <KeyTakeaways points={points} />;
    },
    // "topicImage" matches blocks/TopicImage.ts. The image is a populated
    // Media document (it has url, alt, width, height from Cloudflare R2).
    topicImage: ({ node }: { node: any }) => {
      const img = node.fields?.image as
        | { url?: string; alt?: string; width?: number; height?: number }
        | undefined;
      if (!img?.url) return <></>;
      return (
        <TopicImage
          src={img.url}
          alt={img.alt ?? ""}
          width={img.width ?? 1200}
          height={img.height ?? 800}
          caption={node.fields?.caption as string | undefined}
          size={(node.fields?.size as "small" | "medium" | "full") ?? "full"}
          // "align" is the new field — it lets the author put the image on the
          // side (wrap-left/wrap-right) so text flows beside it.
          align={
            (node.fields?.align as
              | "left"
              | "center"
              | "right"
              | "wrap-left"
              | "wrap-right") ?? "center"
          }
        />
      );
    },
  },
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function CMSRichText({ data }: { data: unknown }) {
  // `data` is the Lexical JSON from the article's `body` field.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <RichText data={data as any} converters={jsxConverters} />;
}
