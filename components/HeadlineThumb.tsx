// HeadlineThumb — the thumbnail for a headline card.
//
// Why this is its own "use client" component: external news images sometimes
// fail to load (e.g. LiveMint blocks its images from showing on other sites —
// "hotlink protection"). A plain server-rendered <img> would then show the
// browser's ugly broken-image icon. Here we listen for the image's `onError`
// event (a browser-only, client-side event) and, if it fires, swap in our
// branded 📰 fallback instead. This handles ANY broken image, from any source.
"use client";

import { useState } from "react";

export default function HeadlineThumb({ src }: { src?: string }) {
  // `failed` flips to true if the image errors out while loading.
  const [failed, setFailed] = useState(false);

  // Show the image only if we have a URL AND it hasn't failed.
  const showImage = Boolean(src) && !failed;

  if (showImage) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)} // broken image → fall back to 📰
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    );
  }

  // Fallback: a branded gradient tile with a newspaper icon.
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] flex items-center justify-center">
      <span className="text-5xl opacity-80" aria-hidden="true">
        📰
      </span>
    </div>
  );
}
