// Next.js built-in tools for SEO metadata and optimised font loading
import type { Metadata } from "next";
import { Anton, Instrument_Serif, Fraunces, Nunito, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
// The small "which mode?" script that runs before the page is drawn (see below)
import { MODE_SCRIPT } from "@/lib/mode";

// The permanent shell components — appear on every single page
import Header from "@/components/Header";
import Toast from "@/components/Toast";
import NavigationLoader from "@/components/NavigationLoader";
import { Suspense } from "react";
import { getSiteStats } from "@/lib/site-stats";
import { ogImages } from "@/lib/og";
import Footer from "@/components/Footer";
import Gyaani from "@/components/Gyaani";
import PhoneTabBar from "@/components/PhoneTabBar";

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

// REDESIGN 30 Oct 2026 ("Playful + Cinematic"): five fonts, each with one job.
// next/font downloads them when the site is BUILT and serves them from our own
// domain, so visitors never wait on Google and nothing jumps when they load.

// Anton — the GIANT, tall capitals: page titles like "KNOW MORE", the logo's name
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",          // Anton comes in one weight only
  display: "swap",        // show a fallback font until it arrives — no invisible text
});

// Instrument Serif (italic) — the elegant accent word: "Explore *subjects*"
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// Fraunces — headings, card titles, and the article body (a warm, bookish serif)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Nunito — everything else: buttons, menus, captions (rounded and friendly)
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

// Geist Mono — small labels in capitals ("QUOTE OF THE DAY", "EXPLORE")
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
  // The link-preview card (18 Sep 2026): every page inherits this branded
  // image unless it sets its own — see lib/og.ts and app/api/og/route.tsx.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: ogImages({ title: SITE_NAME, label: "General knowledge · Current affairs · English and Hindi" }),
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ogImages({ title: SITE_NAME, label: "General knowledge · Current affairs · English and Hindi" }),
  },
};

// ── ROOT LAYOUT ───────────────────────────────────────────────────────────────
// This component wraps EVERY page on the site — it is the permanent outer shell.
// The site header and footer will be added here in the next step (Step 3).
// async so it can read the site's live counts (cached for an hour) for the Header
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; // children = whatever page is currently being viewed
}>) {
  const stats = await getSiteStats();

  return (
    <html
      lang="en"
      // Applying both font variables to <html> makes them available everywhere on the site.
      // globals.css reads these variables to power the font-heading and font-body Tailwind classes.
      className={`${anton.variable} ${instrument.variable} ${fraunces.variable} ${nunito.variable} ${geistMono.variable} ${notoDevanagari.variable}`}
      // suppressHydrationWarning tells React: "don't block the page if the <html>
      // element looks slightly different between server and browser."
      // This handles cases where Next.js or macOS system tools add extra styles/attributes
      // to the root element that React doesn't expect. Safe to add here — it only
      // suppresses warnings for THIS element, not for the rest of the page.
      suppressHydrationWarning
    >
      <body
        className={[
          "bg-background",   // the page background — follows Light / Dark / Reading
          "text-foreground", // the main text colour — follows the mode too
          "font-body",       // Nunito by default; headings use font-heading (Fraunces)
          "antialiased",     // smooths font edges on Mac/retina screens
          "min-h-screen",    // page is always at least the full height of the viewport
        ].join(" ")}
        // Same reason as above — macOS tools sometimes add CSS classes to <body>
        // (e.g. "aqua-ext-enabl") that cause a server/client mismatch.
        suppressHydrationWarning
      >
        {/* LIGHT / DARK / READING — picks the mode BEFORE the page is drawn.
            A plain inline <script> as the very first thing in <body>: the
            browser runs it the moment it reads it, before it has drawn any of
            the page, so the page never flashes light-then-dark. The script
            itself (and what it sets) is in lib/mode.ts.
            FIX 30 Oct 2026 (phase 2): this used to be next/script with
            strategy="beforeInteractive". Checking the real HTML showed that
            Next.js only QUEUES such a script and runs it once its own
            JavaScript has loaded — on a slow phone, after the page was already
            painted. The root layout is drawn once per visit, so a plain script
            here is safe. */}
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />

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
        <Header topicsBySubject={stats.topicsBySubject} liveSubjects={stats.liveSubjects} totalTopics={stats.topics} />

        {/* flex-1 makes the main content area grow to fill all available space.
            This ensures the footer always stays at the bottom, even on short pages. */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer sits at the bottom of every page */}
        <Footer />

        {/* Gyaani — floating AI chatbot, visible on every page */}
        <Gyaani />
        {/* Phones only: the tab bar along the bottom (Home, Learn, Gyaani, News, Atlas) */}
        <PhoneTabBar />
        {/* Site-wide confirmation bar (e.g. "Saved to Read Later") — see components/Toast.tsx */}
        <Toast />
        {/* Book-turning-pages overlay while moving between pages. Suspense is
            required because the loader reads the URL's search params. */}
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>

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
