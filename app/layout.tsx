// Next.js built-in tools for SEO metadata and optimised font loading
import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";

// Our global design tokens and base styles
import "./globals.css";

// ── FONTS ─────────────────────────────────────────────────────────────────────
// next/font loads Google Fonts at build time — no extra network request for visitors.
// The `variable` option creates a CSS custom property we reference in globals.css.

// Source Serif 4 — the heading font ("literary, authoritative" feel)
// Used for: h1, h2, h3 — hero titles, section headings, article titles
const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif", // sets --font-source-serif on <html>
  subsets: ["latin"],
  weight: ["600", "700"],          // 600 = section headings, 700 = hero/display
  display: "swap",                 // show text in a fallback font while loading — no invisible text
});

// Inter — the body and UI font (clean, screen-optimised sans-serif)
// Used for: body text, buttons, labels, captions, navigation
const inter = Inter({
  variable: "--font-inter",        // sets --font-inter on <html>
  subsets: ["latin"],
  weight: ["400", "500", "600"],   // 400 = body, 500 = small labels, 600 = buttons
  display: "swap",
});

// ── SITE METADATA ─────────────────────────────────────────────────────────────
// This appears in: browser tab titles, Google search results, social media previews.
// We will expand this per-page later (each article will have its own title + description).
export const metadata: Metadata = {
  title: "GKWorld360 | Trusted Educational Content, General Knowledge & Current Affairs for Every Learner",
  description:
    "High-quality general knowledge articles, current affairs, study resources and exam preparation content covering History, Geography, Science, Polity, Economics and more.",
};

// ── ROOT LAYOUT ───────────────────────────────────────────────────────────────
// This component wraps EVERY page on the site — it is the permanent outer shell.
// The site header and footer will be added here in the next step (Step 3).
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // children = whatever page is currently being viewed
}>) {
  return (
    <html
      lang="en"
      // Applying both font variables to <html> makes them available everywhere on the site.
      // globals.css reads these variables to power the font-heading and font-body Tailwind classes.
      className={`${sourceSerif4.variable} ${inter.variable}`}
    >
      <body
        className={[
          "bg-background",   // our off-white page background (#f8f9ff) — from design tokens
          "text-foreground", // our primary text colour (#0b1c30, deep navy-black)
          "font-body",       // Inter — applied to all text by default; headings override with font-heading
          "antialiased",     // smooths font edges on Mac/retina screens
          "min-h-screen",    // page is always at least the full height of the viewport
        ].join(" ")}
      >
        {/* children is replaced by the actual page content at render time */}
        {children}
      </body>
    </html>
  );
}
