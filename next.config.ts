import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Tell Next.js to treat .md and .mdx files as pages and importable modules.
  // Without this, Next.js would ignore MDX files entirely.
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    // remark-frontmatter: strips the ---YAML--- block from the rendered page output.
    // Without this, the frontmatter (title, description etc.) would appear as
    // visible text on the page instead of staying hidden as metadata.
    // String form is required for Turbopack compatibility (functions can't pass to Rust).
    remarkPlugins: ["remark-frontmatter"],
  },
});

// Wrap the Next.js config with MDX support and export
export default withMDX(nextConfig);
