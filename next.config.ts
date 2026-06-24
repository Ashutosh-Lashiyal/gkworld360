import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Tell Next.js to treat .md and .mdx files as pages and importable modules.
  // Without this, Next.js would ignore MDX files entirely.
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  images: {
    // Allow the optimised <Image> component to render SVG files (e.g. diagrams,
    // maps, charts) from our own /public folder. The CSP sandbox below makes
    // this safe by stripping any scripts — SVGs are treated as plain images only.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

const withMDX = createMDX({
  options: {
    // remark-frontmatter: strips the ---YAML--- block from the rendered page output.
    // Without this, the frontmatter (title, description etc.) would appear as
    // visible text on the page instead of staying hidden as metadata.
    // String form is required for Turbopack compatibility (functions can't pass to Rust).
    // remark-gfm: adds GitHub Flavored Markdown — most importantly TABLES, plus
    // strikethrough, task lists, and autolinks. Without it, | pipe | tables |
    // render as plain text instead of an actual table.
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],

    // rehype-slug: automatically adds an `id` to every heading (h2, h3, etc.)
    // based on its text. This lets the Table of Contents links jump to sections
    // (e.g. clicking "Underlying Causes" scrolls to <h2 id="underlying-causes">).
    rehypePlugins: ["rehype-slug"],
  },
});

// Wrap the Next.js config with MDX support and export
export default withMDX(nextConfig);
