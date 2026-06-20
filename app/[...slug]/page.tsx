// This is the most important file in the project.
//
// It is a "catch-all" route — ONE file that handles EVERY content page:
//   /history                   → the History subject page
//   /history/revolt-of-1857    → a History topic page
//   /history/modern-india      → the Modern India category page
//
// HOW CATCH-ALL ROUTES WORK:
// The folder name [...slug] tells Next.js: "match any URL, capture all
// the path segments as an array called 'slug'."
// So /history/modern-india/revolt-of-1857 gives us slug = ['history', 'modern-india', 'revolt-of-1857']
// We use that array to find and load the right MDX file from content/.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSlugs, slugToFilePath, getContentMeta, isOverviewFile } from "@/lib/content";

// ── GENERATE STATIC PARAMS ────────────────────────────────────────────────────
// At build time, Next.js calls this function to discover ALL pages that need
// to be pre-built. It reads all your MDX files and tells Next.js the full list.
//
// This is what makes your site FAST — pages are built once at deploy time,
// not rebuilt on every visitor request. Vercel then serves them from a global
// CDN, so pages load instantly anywhere in the world.
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  // Return as objects with a 'slug' key — each one becomes a pre-built page
  return slugs.map((slug) => ({ slug }));
}

// ── GENERATE METADATA (SEO) ───────────────────────────────────────────────────
// Called by Next.js for every page to produce the <head> SEO tags.
// Reads the frontmatter of the matching MDX file to get the title and description.
// This is what appears in Google search results and browser tabs.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const filePath = slugToFilePath(slug);

  if (!filePath) return {}; // no file = 404, no metadata needed

  const meta = getContentMeta(filePath);

  return {
    // "Revolt of 1857 | GKWorld360" — consistent branding on every page
    title: meta.title ? `${meta.title} | GKWorld360` : "GKWorld360",
    description: meta.description ?? undefined,
  };
}

// ── PAGE COMPONENT ────────────────────────────────────────────────────────────
// This runs for every request to a content page.
// It finds the right MDX file, imports it as a React component, and renders it.
export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  // Step 1: find the file path on disk for this slug
  // e.g. ['history'] → /Users/.../content/history/overview.mdx
  const filePath = slugToFilePath(slug);

  // If no file found, show the 404 page
  if (!filePath) notFound();

  // Step 2: build the import path.
  // Dynamic imports use paths relative to the project — e.g. @/content/history/overview.mdx
  const slugPath = slug.join("/");
  const useOverview = isOverviewFile(filePath!);

  // Step 3: dynamically import the MDX file.
  // Each MDX file is compiled into a React component by @next/mdx.
  // We import it and render it like any other React component below.
  let ContentComponent: React.ComponentType | undefined;

  try {
    if (useOverview) {
      // Subject or category page: load overview.mdx from the folder
      // e.g. slug = ['history'] → @/content/history/overview.mdx
      const mod = await import(`@/content/${slugPath}/overview.mdx`);
      ContentComponent = mod.default;
    } else {
      // Regular topic page: load the file directly
      // e.g. slug = ['history', 'revolt-of-1857'] → @/content/history/revolt-of-1857.mdx
      const mod = await import(`@/content/${slugPath}.mdx`);
      ContentComponent = mod.default;
    }
  } catch {
    // If the import fails (file exists on disk but can't be loaded), show 404
    notFound();
  }

  // TypeScript doesn't know notFound() throws, so this guard satisfies the type checker
  if (!ContentComponent) {
    notFound();
    return null;
  }

  // Step 4: render the page.
  // The article content goes in a centred reading column (max 720px wide)
  // — the "reading column" spec from the Academic Clarity design system.
  return (
    // Outer padding matches the container margins: 16px mobile, 32px tablet, 64px desktop
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-12">
      {/* Reading column — never wider than 720px for comfortable long-form reading */}
      <article className="max-w-[720px]">
        {/* ContentComponent is the MDX file rendered as React.
            Styling comes from mdx-components.tsx — no classes needed here. */}
        <ContentComponent />
      </article>
    </div>
  );
}
