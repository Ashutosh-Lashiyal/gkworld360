# GKWorld360 — Design System

**Source of truth (text):** `docs/GKWORLD360_MASTER_BLUEPRINT.md`, `docs/GKWORLD360_TECH_FOUNDATION.md`, `docs/GKWORLD360_PROJECT_STRUCTURE.md`
**Source of truth (visual / design):** **This document + the implemented code (the design tokens in `app/(frontend)/globals.css` and the components) + the live site.** As of 25 June 2026, the design system has been extracted from Stitch into the codebase; **Stitch is no longer the source of truth.**
**Design theme:** **"Academic Clarity"** — originally generated in the Stitch project "GKWorld360 MVP Final Designs" (ID `10446470816480953843`, extracted 18 June 2026), now owned by the code.
**Stitch's role now:** an *optional* tool for exploring brand-new, visually distinct pages or a future redesign — not a thing to keep in sync for everyday work.
**Purpose:** This document records the implemented design system (colours, fonts, spacing, components) so any future session can apply it consistently.

> **📌 Doc status (updated 2 Jul 2026):** Reference doc, largely current — the design did not
> change during the Payload migration. One path note: the design tokens file moved from
> `app/globals.css` to **`app/(frontend)/globals.css`** when the app was split into route groups.

> **How to read this document:** The values below are the project's design tokens, now living in `app/(frontend)/globals.css`. When the design evolves, change the tokens/components in code and update this document to match — the **code + this doc + the live site** are the source of truth, not Stitch.

---

# Overview

GKWorld360's design system is called **"Academic Clarity"** (this is the name set inside the Stitch project). Its personality, in Stitch's own words, is **"Academic, Precise, and Enlightening."**

The site should feel:

- **Modern** — clean, current, and technologically sharp.
- **Clean** — generous whitespace, no clutter.
- **Educational** — structured like a high-quality digital library.
- **Content-focused** — the writing is the star; the design serves legibility above all.
- **Trustworthy** — stable, structured, "printed-page" reliability.
- **Easy to read** — high-contrast text and comfortable reading widths for long study sessions.

**Design inspiration** (the feeling we are aiming for):

- **FutureLearn** — structured, course-like clarity.
- **Wikipedia** — content density done legibly; reference-grade trust.
- **Britannica** — authoritative, encyclopedic credibility.
- **Khan Academy** — friendly, educational, approachable.

Stitch describes the aesthetic as **"Modern-Academic"**: a sophisticated minimalism that blends "the authoritative legacy of traditional encyclopedias with the functional efficiency of modern productivity tools." It deliberately avoids trendy effects (like glassmorphism) in favour of a "structured, stable interface that evokes trust" — a "digital library" atmosphere.

**Deliberately avoided** (per the Blueprint and the Stitch theme):

- Heavy animations.
- Video backgrounds.
- Excessive visual effects.

Depth and motion are used *sparingly* — soft shadows and subtle hover lifts only, never decoration for its own sake.

---

# Desktop First Philosophy

The Stitch project's device type is set to **DESKTOP**, and the design exists as three real screens: a **Desktop**, a **Tablet**, and a **Mobile** homepage. This confirms the Blueprint's ordering:

1. **Desktop is the primary design target.** All design decisions start here. The desktop homepage is the most complete, canonical screen.
2. **Mobile comes second.** A fully adapted mobile layout exists and must always work well.
3. **Tablet comes third.** A tablet layout exists and sits between the two.

**All pages must remain fully responsive.** "Desktop-first" describes the *order of design priority*, not an excuse to neglect smaller screens — every page must look and work correctly on desktop, tablet, and mobile. The exact responsive behaviour is documented in the **Responsiveness** section below, using the breakpoints defined in the Stitch theme.

---

# Colors

All values below are the **actual colours** from the "Academic Clarity" theme in Stitch.

### Brand colours (the source palette the designer chose)

| Role | Colour | Hex |
|---|---|---|
| **Primary — Deep Navy** | Navy | `#0f172a` (brand source) / `#131b2e` (primary-container) |
| **Secondary — Sapphire** | Blue | `#2563eb` (brand source) / `#0051d5` (secondary token) |
| **Tertiary — Emerald** | Green | `#059669` (brand source) / `#069669` (on-tertiary-container) |
| **Neutral — Slate** | Grey | `#64748b` (brand source) |

> **Important note on "Primary":** Stitch's generated `primary` token resolves to pure black (`#000000`), but the design's stated intent and brand source colour is **Deep Navy**. In implementation, **use Deep Navy (`#0f172a` / `#131b2e`) as the primary brand colour** (for headings, nav, primary buttons) — this matches both the written design intent and the brand source colour. Pure-black `#000000` should not be used as the literal primary fill.

Stitch's described roles:
- **Primary (Deep Navy):** headings, navigation, primary brand moments — establishes authority.
- **Secondary (Sapphire):** the "Scholar" accent — links, interactive elements, progress indicators.
- **Tertiary (Emerald):** success states, completed items, positive reinforcement.

### Background & surface colours

| Token | Hex | Use |
|---|---|---|
| `background` / `surface` / `surface-bright` | `#f8f9ff` | Page background (soft off-white with a cool tint) |
| `surface-container-lowest` | `#ffffff` | **Cards**, elevated containers (pure white) |
| `surface-container-low` | `#eff4ff` | Subtle section backgrounds |
| `surface-container` | `#e5eeff` | Medium section backgrounds |
| `surface-container-high` | `#dce9ff` | Stronger section backgrounds |
| `surface-container-highest` | `#d3e4fe` | Strongest section backgrounds |
| `surface-dim` | `#cbdbf5` | Dimmed surface |
| `surface-variant` | `#d3e4fe` | Variant surface |

### Text colours

| Token | Hex | Use |
|---|---|---|
| `on-surface` / `on-background` | `#0b1c30` | Primary text (deep navy-black) |
| `on-surface-variant` | `#45464d` | Secondary text, captions, metadata |
| `on-primary` | `#ffffff` | Text on navy/primary backgrounds |
| `on-secondary` | `#ffffff` | Text on sapphire backgrounds |

### Border / line colours

| Token | Hex | Use |
|---|---|---|
| `outline` | `#76777d` | Standard borders, dividers |
| `outline-variant` | `#c6c6cd` | Subtle borders |
| Card hairline border | `#E2E8F0` | The 1px border on cards/inputs (from the component spec) |

> **To be reconciled later:** the card component spec specifies a `#E2E8F0` hairline border, while the general `outline-variant` token is `#c6c6cd`. Both are real Stitch values; standardise on one for cards during implementation.

### Accent / status colours

| Token | Hex | Use |
|---|---|---|
| `secondary` | `#0051d5` | Links, interactive accents |
| `secondary-container` | `#316bf3` | Stronger interactive fills |
| `tertiary-fixed` | `#85f8c4` | Soft emerald highlight |
| `error` | `#ba1a1a` | Error text/states |
| `on-error` | `#ffffff` | Text on error |
| `error-container` | `#ffdad6` | Error background |
| `on-error-container` | `#93000a` | Text on error background |

### Inverse colours (for dark sections, if used)

| Token | Hex |
|---|---|
| `inverse-surface` | `#213145` |
| `inverse-on-surface` | `#eaf1ff` |
| `inverse-primary` | `#bec6e0` |

---

# Typography

The system uses a **dual-font strategy** (actual values from Stitch):

- **Headings → Source Serif 4** (a professional serif for a "literary, authoritative feel").
- **Body & UI → Inter** (a clean sans-serif optimised for screen reading).

> **Note for future AI sessions:** the current heading font is **Source Serif 4** (set in this Stitch project). Earlier project notes referenced other fonts; **Source Serif 4 + Inter is the current, authoritative pairing.**

### Type scale (exact values from Stitch)

| Token | Font | Size | Weight | Line height | Letter spacing | Typical use |
|---|---|---|---|---|---|---|
| `display-lg` | Source Serif 4 | 48px | 700 | 1.2 | -0.02em | Hero headline (desktop) |
| `display-md` | Source Serif 4 | 36px | 700 | 1.2 | — | Large headings |
| `headline-lg` | Source Serif 4 | 30px | 600 | 1.3 | — | Section headings (desktop) |
| `headline-lg-mobile` | Source Serif 4 | 24px | 600 | 1.3 | — | Section headings (mobile) |
| `headline-md` | Source Serif 4 | 24px | 600 | 1.4 | — | Sub-section headings, card titles |
| `body-lg` | Inter | 18px | 400 | 1.6 | — | Long-form reading (article/topic body) |
| `body-md` | Inter | 16px | 400 | 1.6 | — | Standard body, UI text |
| `body-sm` | Inter | 14px | 400 | 1.5 | — | Captions, metadata |
| `label-md` | Inter | 14px | 600 | 1.0 | 0.05em | Buttons, labels (semibold) |
| `label-sm` | Inter | 12px | 500 | 1.0 | — | Small labels, tags |

**Scale philosophy (from Stitch):** use `body-lg` (18px) for long-form learning content to reduce eye strain; use `body-md`/`body-sm` for utility-dense views.

---

# Layout Philosophy

Values below are from the "Academic Clarity" theme.

### Container widths
- **Max container width:** `1200px` (`container-max`). Content is centred within this on desktop.
- **Reading column:** for article/topic pages, the main text column **should never exceed `720px` wide**, even when the container is wider — this mimics academic-journal line lengths for comfortable reading.
- **Gutter:** `24px`.

### Spacing scale (4px baseline rhythm)

| Token | Value |
|---|---|
| `base` | 4px |
| `xs` | 8px |
| `sm` | 16px |
| `md` | 24px |
| `lg` | 40px |
| `xl` | 64px |

A strict **4px / 8px baseline grid** governs vertical rhythm to keep everything aligned and harmonious.

### Section spacing
- Sections are separated by generous whitespace (use `lg`/`xl`, i.e. 40–64px, between major sections) rather than heavy divider lines.
- Different content sections are distinguished using **tonal background shifts** (the `surface-container-*` scale) instead of borders.

### Alignment rules
- Content is **centred** within the 1200px container.
- Desktop side margins: **64px**; tablet: **32px**; mobile: **16px** (see Responsiveness).

### Content readability principles
- High contrast: dark navy text (`#0b1c30`) on soft off-white (`#f8f9ff`).
- Comfortable line length (≤720px for body text).
- Body line-height of 1.6 for long-form text.
- Generous whitespace to prevent "cognitive overload during complex study sessions."

---

# Components

The following components are documented from the **actual desktop homepage** in Stitch, combined with the component specifications in the "Academic Clarity" theme.

### Header
- **Contents:** "GKWorld360" text logo (left); horizontal nav links **Home · Subjects · Articles · About · Contact** (centre/right); a **search icon** (right).
- **Visual style:** light background, horizontal bar, clean and minimal.
- **Sticky behaviour:** **To be decided later** (not explicitly defined in the Stitch HTML).

> **Naming note (resolved):** the time-based content section is called **"Articles"** site-wide — matching the Stitch nav. The other docs have been aligned to use "Articles", and URLs use `/articles`. Within Articles, different kinds of content (e.g. current affairs, study tips) are handled with **categories/tags**, not separate sections.

### Navigation
- **Desktop:** full horizontal nav (the five links above) shown in the header.
- **Mobile:** collapses to a **hamburger / menu toggle** (the mobile screen contains `menu` and `close` controls that open an overlay/sidebar menu with the same links).
- **Purpose:** primary site navigation between the MVP sections.

### Hero section
- **Headline:** "Master the World's Core Knowledge" (`display-lg`, Source Serif 4, 48px).
- **Subtitle:** "Access a curated repository of global academics, from the depths of history to the frontiers of science."
- **Contents:** a prominent **search bar** plus an **"Explore"** button, with a **hero image** alongside or below the text.
- **Layout:** centred vertical stack on desktop and mobile.
- **Background:** **White** (`#ffffff` / `surface`) — **NOT dark navy**. The hero sits on a light background with the hero image providing visual weight.
- **Updated (Jun 2026):** Previous implementation used dark navy background — this was incorrect. Stitch confirms white/light background.

### Search bar
- **Placement:** centred in the hero, directly below the headline (also reachable via the header search icon).
- **Contents:** text input + search icon + adjacent **"Explore"** button.
- **Exact border/radius styling:** follows the input-field spec (1px border, 8px radius, sapphire focus border) — see Card System / component spec. Fine visual details **To be decided later** where not specified.

### Subject cards
- **Contents:** a **thumbnail image** on top, then **subject title**, a short **description**, and a **"View Curriculum →"** CTA link at the bottom.
- **Six subjects on the homepage (confirmed Jun 2026):** **History, Geography, Physics, Chemistry, Biology, Famous Personalities** — controlled via `homepageOrder` field in each subject's `overview.mdx`. Can be changed without code edits.
- **Grid:** 3 columns × 2 rows on desktop (6 cards total); 2 columns on tablet; 1 column (stacked) on mobile.
- **Section heading:** "Explore Subjects" with a "View all subjects →" link to `/subjects`.
- **Style (from component spec):** white background, **1px `#E2E8F0` border**, **8px** radius, soft diffused shadow, sapphire border + lifted shadow on hover.
- **Purpose:** entry points into each subject (the top of the content hierarchy).
- **Updated (Jun 2026):** Old doc listed different subjects (History, Geography, Science, Polity, Economics, Current Affairs). Confirmed new set from user decision. Cards now include thumbnail image and "View Curriculum" CTA — not just icon + title.

### Buttons
- **Primary button:** **Deep Navy background, white text**, padding **12px 24px**, **8px** radius. (e.g. "Explore".) Substantial, confident.
- **Secondary button:** **Sapphire outline** style (sapphire border + sapphire text on light background).
- **Tertiary/links:** text links with an `arrow_forward` icon (e.g. "View all subjects →").

### Topic cards (Popular Topics / Recently Added Topics)
- **Popular Topics:** vertical cards, **image on top**, then a **category label** (e.g. Polity, History, Geography, Science), a **headline**, and a short **description**. Four cards on the homepage.
- **Recently Added Topics:** a horizontal row/carousel (with chevron controls) of compact items — a **material icon**, a **category**, a **title**, and metadata ("Added [time] • [x] min read").
- **Purpose:** surface evergreen educational topics. (Topic cards are distinct from Article cards — see the Project Structure doc's golden rule.)

### Article cards (shown as "Recently Added Articles")
- **Contents:** featured image, **category**, **title**, short **description**, and **metadata** (posted date + read time, e.g. "Posted today • 5 min read"). Three cards on the homepage.
- **Style:** same card language as topic cards (white, hairline border, 8px radius, soft shadow).
- **Purpose:** surface time-based Articles, kept visually consistent with — but conceptually separate from — Topic cards.

### Footer
- **Columns:** four — **Company** (About Us, Careers, Press), **Support** (Help Center, Contact Support, Community), **Connect** (social/share links), **Legal** (Privacy Policy, Terms of Service).
- **Copyright line:** "© GKWorld360. All rights reserved. Empowering academic excellence." *(Use the correct current year dynamically — not hardcoded "2024".)*
- **Background colour:** **Resolved (Jun 2026):** Dark charcoal / `navy-dark` (`#131b2e`). Confirmed from mobile Stitch screen.
- **Mobile:** Stacks into single column. Shows logo + tagline + nav links + legal links + social icons + copyright.

### Homepage sections — complete confirmed order (Jun 2026)
The desktop homepage has these sections in this order:

1. **Header** (sticky navigation)
2. **Hero** — white background, headline, subtitle, search bar + Explore button, hero image
3. **Explore Subjects** — white background, 3×2 grid of 6 subject cards, "View all subjects →" link
4. **Quote Block** — light gray/subtle accent background, Kofi Annan quote: *"Knowledge is power. Information is liberating. Education is the premise of progress, in every society, in every family."*
5. **Popular Topics** — white background, 4-column card grid, each card: category label (Polity/History/Geography/Science), topic title, description
6. **Recently Added Topics** — white background, horizontal carousel with left/right chevron controls, each item: icon + category + title + metadata ("Added [time] • [x] min read")
7. **Recently Added Articles** — white background, 3-column card grid, each card: thumbnail image + category badge + title + description + posted date + read time
8. **About GKWorld360** — white background, two-column layout (text left, image right), heading: "Empowering Academic Excellence Through Structured Knowledge", body paragraphs, testimonial quote: *"The standard for general knowledge resources." — Education Review 2024*
9. **Footer** — dark charcoal background

**Mobile section order:** Same sections, all stacked single-column. Subject cards stack vertically (full width). Carousel becomes scrollable. Article grid becomes single column.

---

# Card System

The card is the core building block. Values from the "Academic Clarity" component spec:

- **Border radius:** **8px** (`0.5rem`) for cards (and buttons/inputs). Small elements like tags/checkboxes use **4px** (`0.25rem`). The shape language is "soft and precise" — never bubbly.
- **Shadows:** a single soft, diffused shadow — **`0px 4px 20px rgba(15, 23, 42, 0.05)`** — combined with a **1px `#E2E8F0` hairline border**. The border gives definition without heaviness ("tactile, printed quality").
- **Hover behaviour:** the card **lifts slightly** with a more pronounced shadow, and the **border colour shifts to the secondary sapphire** (`#2563eb` / `#0051d5`). Subtle only — no large motion.
- **Image usage:** many cards lead with a **featured image on top** (topic and article cards); subject cards use a smaller **icon/image**. Images sit above the text block.
- **Typography inside cards:** **title** in Source Serif 4 (≈`headline-md`, 24px/600); **category label** as a small Inter label (`label-sm`/`label-md`, often sapphire on a light tint); **description** in Inter `body-sm`/`body-md`; **metadata** (date, read time) in `body-sm` using the muted `on-surface-variant` colour.

---

# Responsiveness

The Stitch theme defines a **Fixed-Responsive Grid** with these exact breakpoints, and three real screens (Desktop, Tablet, Mobile) confirm the behaviour.

| Device | Breakpoint | Grid | Side margins |
|---|---|---|---|
| **Desktop** | 1200px and up | 12 columns | 64px |
| **Tablet** | 768px – 1199px | 8 columns | 32px |
| **Mobile** | up to 767px | 4 columns | 16px |

**How the layout adapts (from the actual screens):**

- **Desktop (primary):** full horizontal navigation in the header; multi-column grids (subject cards in 3 columns, topic/article cards in multi-column rows); content centred in the 1200px container.
- **Tablet:** narrower margins (32px) and fewer grid columns (8); multi-column card layouts reduce (typically to 2 columns); horizontal nav still feasible.
- **Mobile:** navigation **collapses to a hamburger/menu toggle** (overlay menu with the same links); card grids **stack into a single column**; sections stack vertically in reading order; the footer mirrors the header links and places social/contact icons at the bottom.

**Reading column:** regardless of device, body text stays within the ~720px reading width for legibility (full-width within margins on mobile).

Specific per-element mobile refinements beyond the above are **To be decided later** where the screens do not make them explicit.

---

# MVP Scope

This design system currently documents **only the MVP designs present in Stitch** — namely the **Homepage** in three responsive forms (Desktop, Tablet, Mobile), plus the shared elements they contain (header, navigation, hero, search, subject cards, topic cards, article cards, footer, quote and about sections).

Other MVP pages from the Blueprint (Subjects, Subject, Optional Category, Topic, Articles, About, Contact, Search Results) will **reuse the components and tokens defined here**. Their detailed per-page layouts are **To be decided later**, as they are designed/extended.

This document deliberately does **not** define designs for post-MVP features:

- Login
- Dashboard
- Notes
- Quizzes
- Premium features

Those belong to later phases. When they arrive, they will **extend** this design system — not replace it.

---

# Future Design Philosophy

As GKWorld360 grows, every new feature and page must preserve visual consistency by **reusing what already exists**:

- **Reuse the existing colours** — the "Academic Clarity" palette (Navy, Sapphire, Emerald, Slate, and the surface/text tokens). Do not introduce new brand colours without a deliberate update to this document.
- **Reuse the existing typography** — Source Serif 4 for headings, Inter for body, using the defined type scale.
- **Reuse the existing card styles** — 8px radius, hairline border, soft shadow, sapphire hover.
- **Preserve spacing and layout rules** — the 4px baseline grid, 1200px container, 720px reading column, and the documented breakpoints.

New components should feel like natural members of the same family. When something genuinely new is needed, **add it to this document** (with its real values) so the system stays the single, accurate source for every future AI session.

---

# Important Rules

1. **Reuse the existing tokens and components.** Every colour, font, size, and spacing value should come from the design tokens in `app/(frontend)/globals.css` (recorded in this document). Don't hard-code raw values in components.
2. **If a value isn't defined yet, decide it deliberately** — pick a value consistent with the system, add it to the tokens, and record it here. Don't scatter one-off values.
3. **The source of truth is the code + this document + the live site.** If they ever disagree, the implemented code wins; update this document to match.
4. **Keep this document current.** When the design evolves (new tokens, new components, restyles), update the affected sections here so future sessions stay accurate.
5. **Stitch is optional now.** Use it only to explore brand-new visually distinct pages or a future redesign; it is not kept in sync for everyday changes.

### Open items flagged for a decision ("To be decided later")
- Header **sticky** behaviour.
- Reconciling the **card border** value (`#E2E8F0`) with the `outline-variant` token (`#c6c6cd`).
- Detailed layouts for non-homepage MVP pages (Subject, Category, Topic, About, Contact, Search).
- Fine input/search-field visual details not specified in the screens.
- Hero image — exact image to use (AI-generated, stock, or illustration). Placeholder until decided.
- Popular Topics and Recently Added sections — placeholder content until real articles exist.

### Resolved items (Jun 2026)
- ✅ **Footer background:** Dark charcoal / `navy-dark` (`#131b2e`). Confirmed from Stitch mobile screen.
- ✅ **Hero background:** White (`#ffffff`) — NOT dark navy. Updated from incorrect earlier implementation.
- ✅ **Homepage sections order:** All 9 sections confirmed and documented above.
- ✅ **Subject cards:** Confirmed 6 subjects (History, Geography, Physics, Chemistry, Biology, Famous Personalities). Cards include thumbnail image + "View Curriculum" CTA.
- ✅ **Time-based content section name:** "Articles" site-wide.