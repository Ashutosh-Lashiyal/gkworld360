// HeadlineThumb — the thumbnail for a headline card.
//
// Why this is its own "use client" component: external news images sometimes
// fail to load (e.g. LiveMint blocks its images from showing on other sites —
// "hotlink protection"). A plain server-rendered <img> would then show the
// browser's ugly broken-image icon. Here we listen for the image's `onError`
// event (a browser-only, client-side event) and, if it fires, swap in our
// branded 📰 fallback instead. This handles ANY broken image, from any source.
"use client";

import { useEffect, useRef, useState } from "react";

export default function HeadlineThumb({
  src,
  number,
  variant = "card",
}: {
  src?: string;
  // REDESIGN 16 Sep 2026: on /pulse rows the fallback is a numbered dark
  // square (board 6), so pass the row number; the card variant keeps the 📰.
  number?: number;
  variant?: "card" | "row";
}) {
  // `failed` flips to true if the image errors out while loading.
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // An image can fail BEFORE React attaches onError — the browser starts
  // loading it from the server-rendered HTML straight away, and if the error
  // fires before React wakes up ("hydrates"), nobody hears it. So on mount we
  // also inspect the element: `complete` with a 0 natural width = broken.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  // Show the image only if we have a URL AND it hasn't failed.
  const showImage = Boolean(src) && !failed;

  if (showImage) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        ref={imgRef}
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)} // broken image → fall back
        className={
          variant === "row"
            ? "absolute inset-0 w-full h-full object-cover"
            : "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        }
      />
    );
  }

  if (variant === "row") {
    // Fallback for a list row: the row number in mint on the deep teal —
    // same size as a thumbnail, so the list never has a hole.
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-navy-dark font-heading text-[22px] font-bold text-mint">
        {String(number ?? 0).padStart(2, "0")}
      </span>
    );
  }

  // Fallback for a card: a branded gradient tile with a newspaper icon.
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] flex items-center justify-center">
      <span className="text-5xl opacity-80" aria-hidden="true">
        📰
      </span>
    </div>
  );
}
