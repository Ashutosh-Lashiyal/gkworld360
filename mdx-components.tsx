// This file is REQUIRED by Next.js App Router when using @next/mdx.
// It maps every markdown element (headings, paragraphs, lists, etc.)
// to a styled React component using our "Academic Clarity" design tokens.
//
// WHY THIS FILE EXISTS:
// When you write "# History of India" in an MDX file, it becomes an <h1> tag.
// But a plain <h1> has no styling — it looks like default browser text.
// This file tells Next.js: "whenever you see an <h1> from MDX, render it
// with Source Serif 4, in Deep Navy, at the correct size from our design system."
//
// RESULT: Every article on the site automatically gets beautiful, consistent
// typography — no need to add classes to every heading inside each article.

import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import KeyTakeaways from "@/components/KeyTakeaways";
import TopicImage from "@/components/TopicImage";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // ── CUSTOM CONTENT COMPONENTS ────────────────────────────────────────────
    // These can be used directly inside any .mdx file without importing them.
    // Example:  <KeyTakeaways points={["...", "..."]} />
    // Example:  <TopicImage src="..." alt="..." width={1200} height={675} caption="..." />
    KeyTakeaways,
    TopicImage,

    // ── MARKDOWN IMAGES ──────────────────────────────────────────────────────
    // Handles simple markdown image syntax:  ![alt text](/images/example.jpg)
    // Renders a responsive, rounded image that scales to the column width while
    // preserving its natural aspect ratio. Use this for quick inline images;
    // use <TopicImage> when you want optimisation and a caption.
    // eslint-disable-next-line @next/next/no-img-element
    img: ({ src, alt }) => (
      <img
        src={typeof src === "string" ? src : ""}
        alt={alt ?? ""}
        loading="lazy"
        className="rounded-card w-full h-auto border border-hairline my-6"
      />
    ),

    // ── HEADINGS ────────────────────────────────────────────────────────────
    // All headings use Source Serif 4 (font-heading) in Deep Navy.
    // Sizes match the type scale from the Academic Clarity design system.

    h1: ({ children }) => (
      // display-md: 36px/700 — main article title
      <h1 className="font-heading text-4xl font-bold text-navy mt-0 mb-6 leading-tight">
        {children}
      </h1>
    ),

    h2: ({ children, id }) => (
      // headline-lg: 30px/600 — major section heading
      // scroll-mt-24 ensures TOC anchor jumps land below the sticky header
      <h2 id={id} className="font-heading text-3xl font-semibold text-navy mt-10 mb-4 leading-snug scroll-mt-24 clear-both">
        {children}
      </h2>
    ),

    h3: ({ children, id }) => (
      // headline-md: 24px/600 — sub-section heading
      <h3 id={id} className="font-heading text-2xl font-semibold text-navy mt-8 mb-3 leading-snug scroll-mt-24">
        {children}
      </h3>
    ),

    h4: ({ children }) => (
      <h4 className="font-heading text-xl font-semibold text-navy mt-6 mb-2 leading-snug">
        {children}
      </h4>
    ),

    // ── BODY TEXT ────────────────────────────────────────────────────────────
    // body-lg: 18px/400 — comfortable for long study sessions (from design system)
    // line-height 1.6 reduces eye strain during reading

    p: ({ children }) => (
      <p className="font-body text-lg text-foreground leading-relaxed mb-5">
        {children}
      </p>
    ),

    // ── LINKS ────────────────────────────────────────────────────────────────
    // Sapphire blue — the interactive colour from our design tokens

    a: ({ href, children }) => {
      // External links open in a new tab; internal links use Next.js Link
      const isExternal = href?.startsWith("http");
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sapphire underline underline-offset-2 hover:text-sapphire-dark transition-colors"
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href ?? "/"}
          className="text-sapphire underline underline-offset-2 hover:text-sapphire-dark transition-colors"
        >
          {children}
        </Link>
      );
    },

    // ── LISTS ────────────────────────────────────────────────────────────────

    ul: ({ children }) => (
      // disc bullets, indented, with comfortable spacing between items
      <ul className="font-body text-lg text-foreground leading-relaxed mb-5 ml-6 list-disc space-y-2">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      // numbered lists — same style as bullets but with numbers
      <ol className="font-body text-lg text-foreground leading-relaxed mb-5 ml-6 list-decimal space-y-2">
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li className="font-body text-lg text-foreground leading-relaxed">
        {children}
      </li>
    ),

    // ── BLOCKQUOTE ───────────────────────────────────────────────────────────
    // Used for important quotes or callout text in articles.
    // Sapphire left border signals it's highlighted content.

    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-sapphire pl-5 my-6 bg-surface-low rounded-r-card py-3 pr-4">
        <div className="font-body text-lg text-muted italic leading-relaxed">
          {children}
        </div>
      </blockquote>
    ),

    // ── CODE ─────────────────────────────────────────────────────────────────
    // Inline code — small monospace text with a tinted background

    code: ({ children }) => (
      <code className="font-mono text-sm bg-surface-low text-navy px-1.5 py-0.5 rounded-sm">
        {children}
      </code>
    ),

    // Code block (inside ``` fences) — styled differently from inline code
    pre: ({ children }) => (
      <pre className="bg-navy-dark text-on-dark rounded-card p-5 my-6 overflow-x-auto text-sm font-mono leading-relaxed">
        {children}
      </pre>
    ),

    // ── DIVIDER ──────────────────────────────────────────────────────────────
    // The --- horizontal rule — a subtle hairline to separate sections

    hr: () => (
      <hr className="border-t border-hairline my-10" />
    ),

    // ── TABLES ───────────────────────────────────────────────────────────────
    // Tables appear on topic pages for historical dates, comparisons, data etc.

    table: ({ children }) => (
      <div className="overflow-x-auto my-6"> {/* wrapper for horizontal scroll on mobile */}
        <table className="w-full border-collapse font-body text-base">
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead className="bg-surface-mid">{children}</thead>
    ),

    th: ({ children }) => (
      <th className="text-left text-sm font-semibold text-navy px-4 py-3 border-b border-hairline">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="text-base text-foreground px-4 py-3 border-b border-hairline">
        {children}
      </td>
    ),

    // ── STRONG & EMPHASIS ─────────────────────────────────────────────────────

    strong: ({ children }) => (
      <strong className="font-semibold text-navy">{children}</strong>
    ),

    em: ({ children }) => (
      <em className="italic text-foreground">{children}</em>
    ),

    // Spread any extra components passed in — allows per-page overrides
    ...components,
  };
}
