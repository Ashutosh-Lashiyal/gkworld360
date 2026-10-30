// Custom 404 page — shown when a visitor hits a URL that doesn't exist.
// Next.js automatically uses this file for all 404 responses.

import Button from "@/components/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found", // the layout appends " | GKWorld360"
};

// REDESIGN PHASE 4 (30 Oct 2026): a giant outlined "404" in Anton, the
// message, and two ways back.
export default function NotFound() {
  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
      {/* Large 404 number — decoration, outlined */}
      <p aria-hidden="true" className="gk-404 m-0 select-none">404</p>

      <h1 className="m-0 mt-2 gk-big-title text-foreground">
        Page <em className="gk-big-title__accent">not found</em>
      </h1>

      <p className="font-body text-lg text-muted mt-5 max-w-md mx-auto leading-relaxed">
        The page you are looking for does not exist or may have been moved.
        Try browsing our subjects or searching for what you need.
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
        <Button href="/">Go to homepage</Button>
        <Button href="/subjects" variant="ghost">Browse subjects</Button>
      </div>
    </div>
  );
}
