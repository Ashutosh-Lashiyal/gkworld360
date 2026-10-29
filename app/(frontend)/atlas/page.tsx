// /atlas — the World360 Atlas in English. Everything lives in
// components/atlas/AtlasPage.tsx, shared with the other three Atlas addresses.
import AtlasPage, { atlasMetadata } from "@/components/atlas/AtlasPage";

// Saved copy kept up to 6 hours; saving in /admin refreshes it at once (lib/refresh.ts).
export const revalidate = 21600;

export const generateMetadata = () => atlasMetadata("en");

export default function Page() {
  return <AtlasPage lang="en" />;
}
