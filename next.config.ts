import type { NextConfig } from "next";
import createMDX from "@next/mdx";
// withPayload connects Payload CMS to Next.js — sets up the @payload-config
// alias and ensures Payload's admin panel builds correctly.
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Tell Next.js to treat .md and .mdx files as pages and importable modules.
  // Without this, Next.js would ignore MDX files entirely.
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  // Turbopack is the default bundler in Next.js 16.
  // withPayload() only sets up webpack aliases — not Turbopack aliases.
  // So we manually add @payload-config here so Turbopack can resolve it.
  // @payload-config is a virtual alias that points to our payload.config.ts file.
  turbopack: {
    // Fix: Next.js was detecting /Users/asherashutosh/ as the workspace root
    // (because there is a package-lock.json in the home folder) and loading
    // .env.local from there instead of this project folder. Explicitly setting
    // root tells Turbopack the correct project directory.
    root: __dirname,
    resolveAlias: {
      "@payload-config": "./payload.config.ts",
    },
  },

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

// withPayload must be the OUTERMOST wrapper — it needs to see the final config.
// withMDX handles MDX files, withPayload handles Payload CMS integration.
// We will remove withMDX in Phase 5 once all content is moved to Payload.
export default withPayload(withMDX(nextConfig));
