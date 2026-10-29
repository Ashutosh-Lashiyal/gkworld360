// /hi/atlas/<slug> — the Hindi Atlas with one card open (the shareable link).
import AtlasPage, { atlasMetadata } from "@/components/atlas/AtlasPage";

export const revalidate = 21600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return atlasMetadata("hi", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <AtlasPage lang="hi" slug={slug} />;
}
