// /saved — the "Read Later" page. A thin server wrapper (for the page title)
// around the client SavedList component (which does the localStorage work).
import type { Metadata } from "next";
import SavedList from "@/components/SavedList";

export const metadata: Metadata = {
  title: "Read Later — Saved Headlines | GKWorld360",
  description: "Headlines you've saved to read later.",
  // Personal utility page — no value in search engines indexing it.
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return <SavedList />;
}
