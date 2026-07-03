// Next.js built-in tools for SEO metadata and optimised font loading
import type { Metadata } from "next";
import { Source_Serif_4, Inter, Noto_Sans_Devanagari } from "next/font/google";

// The permanent shell components — appear on every single page
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Gyaani from "@/components/Gyaani";

// Site config — URL, name, and the master indexing switch
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, INDEXING_ENABLED } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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

// Noto Sans Devanagari — the font for HINDI content (Source Serif 4 and Inter
// don't support the Devanagari script). Applied automatically to Hindi articles
// via the .font-hindi class (see globals.css).
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",   // sets --font-devanagari on <html>
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ── SITE METADATA ─────────────────────────────────────────────────────────────
// This appears in: browser tab titles, Google search results, social media previews.
// Individual pages (topics, subjects) override the title/description with their own.
export const metadata: Metadata = {
  // metadataBase lets Next.js turn relative image paths into absolute URLs for
  // social-media previews (Open Graph / Twitter cards).
  metadataBase: new URL(SITE_URL),

  // Default title. Pages can set their own; this is the fallback (e.g. homepage).
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    // Pages that set a title get "Their Title | GKWorld360" automatically.
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,

  // The master indexing switch. When INDEXING_ENABLED is false (pre-launch),
  // every page carries a "noindex, nofollow" instruction — a second safety layer
  // on top of robots.txt, so nothing can be indexed until launch.
  robots: {
    index: INDEXING_ENABLED,
    follow: INDEXING_ENABLED,
  },

  // Default social-media preview (Open Graph). Pages override per-page where useful.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
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
      className={`${sourceSerif4.variable} ${inter.variable} ${notoDevanagari.variable}`}
      // suppressHydrationWarning tells React: "don't block the page if the <html>
      // element looks slightly different between server and browser."
      // This handles cases where Next.js or macOS system tools add extra styles/attributes
      // to the root element that React doesn't expect. Safe to add here — it only
      // suppresses warnings for THIS element, not for the rest of the page.
      suppressHydrationWarning
    >
      <body
        className={[
          "bg-background",   // our off-white page background (#f8f9ff) — from design tokens
          "text-foreground", // our primary text colour (#0b1c30, deep navy-black)
          "font-body",       // Inter — applied to all text by default; headings override with font-heading
          "antialiased",     // smooths font edges on Mac/retina screens
          "min-h-screen",    // page is always at least the full height of the viewport
        ].join(" ")}
        // Same reason as above — macOS tools sometimes add CSS classes to <body>
        // (e.g. "aqua-ext-enabl") that cause a server/client mismatch.
        suppressHydrationWarning
      >
        {/* Site-wide structured data: tells search/AI engines what GKWorld360 is,
            and enables the search box to appear in Google results (SearchAction). */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />

        {/* Header sits at the top of every page — sticky, always visible */}
        <Header />

        {/* flex-1 makes the main content area grow to fill all available space.
            This ensures the footer always stays at the bottom, even on short pages. */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer sits at the bottom of every page */}
        <Footer />

        {/* Gyaani — floating AI chatbot, visible on every page */}
        <Gyaani />

        {/* Vercel Web Analytics — counts visitors, page views, top pages, referrers.
            Privacy-friendly (no cookies). Must also be enabled once in the Vercel
            dashboard (Project → Analytics → Enable). */}
        <Analytics />

        {/* Vercel Speed Insights — real-user performance (Core Web Vitals). */}
        <SpeedInsights />
      </body>
    </html>
  );
}
