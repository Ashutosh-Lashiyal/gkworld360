// Custom 404 page — shown when a visitor hits a URL that doesn't exist.
// Next.js automatically uses this file for all 404 responses.

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | GKWorld360",
};

export default function NotFound() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-24 text-center">

      {/* Large 404 number */}
      <p className="font-heading text-8xl font-bold text-navy opacity-10 leading-none select-none">
        404
      </p>

      <h1 className="font-heading text-3xl font-semibold text-navy mt-4">
        Page not found
      </h1>

      <p className="font-body text-lg text-muted mt-4 max-w-md mx-auto leading-relaxed">
        The page you are looking for does not exist or may have been moved.
        Try browsing our subjects or searching for what you need.
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
        <Link
          href="/"
          className="font-body text-sm font-semibold text-on-dark bg-navy hover:bg-navy-dark rounded-card px-6 py-3 transition-colors"
        >
          Go to homepage
        </Link>
        <Link
          href="/subjects"
          className="font-body text-sm font-semibold text-sapphire border border-sapphire hover:bg-surface-low rounded-card px-6 py-3 transition-colors"
        >
          Browse subjects
        </Link>
      </div>
    </div>
  );
}
