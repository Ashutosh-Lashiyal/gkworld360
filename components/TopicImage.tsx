// TopicImage — a rich, optimised image for use inside topic articles.
// Use this for important images where you know the dimensions and want a caption.
// It uses next/image, so the image is automatically optimised (WebP, lazy-loaded,
// no layout shift).
//
// HOW TO USE IT inside any .mdx article:
//
//   <TopicImage
//     src="/images/topics/indus-valley-map.jpg"
//     alt="Map of the Indus Valley Civilisation sites"
//     width={1200}
//     height={675}
//     caption="Major sites of the Indus Valley Civilisation."
//     size="medium"          // optional: "small" | "medium" | "full" (default "full")
//     align="center"         // optional: see ALIGN options below (default "center")
//   />
//
// ALIGN options (how the image sits horizontally):
//   "left"        → block image, pushed to the left of the column
//   "center"      → block image, centred (default)
//   "right"       → block image, pushed to the right of the column
//   "wrap-left"   → image floats left, the text flows around it on the right
//   "wrap-right"  → image floats right, the text flows around it on the left
//
// Registered globally in mdx-components.tsx — no import needed in MDX files.

import Image from "next/image";

type TopicAlign = "left" | "center" | "right" | "wrap-left" | "wrap-right";

type TopicImageProps = {
  src: string;                          // image path, e.g. "/images/topics/example.jpg"
  alt: string;                          // accessibility description (required)
  width: number;                        // the image's real width in pixels
  height: number;                       // the image's real height in pixels
  caption?: string;                     // optional caption shown below the image
  size?: "small" | "medium" | "full";   // controls how wide the image appears
  align?: TopicAlign;                   // controls horizontal placement / wrapping
};

// Maximum display widths for each size option.
const SIZE_MAX_WIDTH: Record<NonNullable<TopicImageProps["size"]>, string> = {
  small: "max-w-[320px]",
  medium: "max-w-[480px]",
  full: "max-w-full",
};

// Positioning classes for each align option.
// The "wrap-*" options use CSS float so text flows around the image.
// On mobile (max-sm) we cancel the float and centre the image, so it never
// gets squeezed into a tiny sliver beside text on small screens.
const ALIGN_CLASS: Record<TopicAlign, string> = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
  "wrap-left": "float-left mr-6 mb-4 max-sm:float-none max-sm:mx-auto max-sm:mr-auto",
  "wrap-right": "float-right ml-6 mb-4 max-sm:float-none max-sm:mx-auto max-sm:ml-auto",
};

export default function TopicImage({
  src,
  alt,
  width,
  height,
  caption,
  size = "full",
  align = "center",
}: TopicImageProps) {
  const isWrap = align === "wrap-left" || align === "wrap-right";

  return (
    <figure
      className={[
        // Wrapped images use a tighter top margin so they align with the
        // paragraph they sit beside; block images get generous vertical space.
        isWrap ? "mt-2 mb-4" : "my-8",
        SIZE_MAX_WIDTH[size],
        ALIGN_CLASS[align],
      ].join(" ")}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        // w-full h-auto makes the image scale to the figure width while keeping
        // its real aspect ratio (no distortion, no layout shift).
        className="rounded-card w-full h-auto border border-hairline"
        sizes="(max-width: 720px) 100vw, 720px"
      />
      {caption && (
        <figcaption className="font-body text-sm text-muted italic mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
