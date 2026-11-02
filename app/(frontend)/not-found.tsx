// Custom 404 page — shown when a visitor hits a URL that doesn't exist.
// Next.js automatically uses this file for all 404 responses.
//
// REDESIGN PHASE 4 (30 Oct 2026): a giant outlined "404" in Anton, the
// message, and two ways back.
// HINDI (2 Nov 2026, phase 2): the body is components/NotFoundBody.tsx, which
// reads the address — a missing /hi/… page answers in Hindi.

import type { Metadata } from "next";
import NotFoundBody from "@/components/NotFoundBody";

export const metadata: Metadata = {
  title: "Page Not Found · पेज नहीं मिला", // the layout appends " | GKWorld360"
};

export default function NotFound() {
  return <NotFoundBody />;
}
