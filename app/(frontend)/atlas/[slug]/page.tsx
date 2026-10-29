// /atlas/<slug> — the Atlas with one card already open, e.g.
// /atlas/vasco-da-gama-reaches-calicut-1498. This is the address people share.
// [slug] in the folder name means "any value here" — it arrives as params.slug.
import AtlasPage, { atlasMetadata } from "@/components/atlas/AtlasPage";

export const revalidate = 21600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return atlasMetadata("en", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <AtlasPage lang="en" slug={slug} />;
}
