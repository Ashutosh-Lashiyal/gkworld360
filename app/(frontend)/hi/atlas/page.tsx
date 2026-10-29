// /hi/atlas — the World360 Atlas in Hindi.
//
// FOLDER NOTE: every other Hindi page (/hi/history/…) is served by the
// catch-all route app/(frontend)/[...slug]. This `hi/atlas` folder is more
// specific, so Next.js picks it for /hi/atlas only; all other /hi/… addresses
// still go to the catch-all exactly as before.
import AtlasPage, { atlasMetadata } from "@/components/atlas/AtlasPage";

export const revalidate = 21600;

export const generateMetadata = () => atlasMetadata("hi");

export default function Page() {
  return <AtlasPage lang="hi" />;
}
