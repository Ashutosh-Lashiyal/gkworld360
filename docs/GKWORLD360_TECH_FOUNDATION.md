# GKWorld360 — Recommended Technical Foundation

**Reviewed against:** `docs/GKWORLD360_MASTER_BLUEPRINT.md` (the source of truth)
**Role:** Senior Software Architect
**Lens:** one non-technical founder + AI, limited budget, content-is-the-product, minimal future rewrites
**Status:** Recommendation for founder approval — no application code generated.

> **📌 Doc status (updated 2 Jul 2026):** Reference doc. The **"Current Stack"** section just
> below states what we *actually* use today. The detailed 21 recommendations that follow are the
> **original architectural reasoning** — most still hold, but a few decisions have since changed
> (database, ORM, content storage). Where they differ, the "Current Stack" section and
> `PROJECT_CONTEXT.md` win.

---

## Current Stack (what we actually use today — 2 Jul 2026)

| Layer | Original recommendation | **What we use now** |
|---|---|---|
| Frontend framework | Next.js (App Router) | ✅ Next.js 16 (unchanged) |
| Separate backend | None (use Next.js) | ✅ None (unchanged) |
| Hosting | Vercel | ✅ Vercel (unchanged) |
| **Content storage** | MDX files (no DB in MVP) | 🔄 **Payload CMS** (migrating off MDX) |
| **Database** | None in MVP; PostgreSQL "in Phase 2" | 🔄 **Neon (PostgreSQL)** — added now, not later |
| **Database tooling / ORM** | Prisma (in Phase 2) | 🔄 **Payload's built-in layer (Drizzle under the hood)** — not Prisma |
| **Images** | Local `public/` folder | 🔄 **Cloudflare R2** (object storage, via Payload) |
| **Admin/CMS** | None in MVP | 🔄 **Payload CMS admin at `/admin`** |
| Styling | Tailwind CSS | ✅ Tailwind CSS v4 (unchanged) |
| AI chatbot (Gyaani) | — | Google Gemini 2.5 Flash |

**Why the database/CMS arrived earlier than the original plan:** the founder chose to move to a
proper CMS (Payload) while content was still small, rather than migrate hundreds of files later.
The architecture principle below — *content as data, separate from the website code* — is
**unchanged**; Payload + Neon is simply a more capable home for that data than flat files.
See `PROJECT_CONTEXT.md` for the full rationale and setup.

> **The single most important architectural idea for you:** treat **content as data, kept separate from the website code**. If your articles live in their own simple files (or later, a database), then the website that displays them, the search, the SEO, even a future login system — all become things you *add around* the content without ever disturbing the content itself. This one principle is what lets GKWorld360 grow from 10 pages to 10,000, and from "just reading" to "accounts and quizzes," **without rewrites**. Every recommendation below serves it.

---

## Part A — The 21 Recommendations

For each: **what**, then *why · solo-founder fit · AI-assisted fit · alternatives rejected*.

### 1. Frontend Framework → **Next.js (App Router, React)**
- **Why:** It renders pages on the server, so Google and AI crawlers receive fully-formed content (essential for your #1 and #2 priorities, SEO and AI SEO). Its folder = URL system maps perfectly onto your permanent hierarchy (Home → Subject → Category → Topic).
- **Solo-founder fit:** One tool covers pages *and* the little bit of backend you need (contact form, search). One thing to learn, one thing to deploy.
- **AI-assisted fit:** It's the most heavily documented React framework in existence, so I (and any AI) can generate, explain, and debug it extremely reliably.
- **Alternatives rejected:** **Astro** is genuinely *excellent* for a pure-content MVP (even faster, ships zero JavaScript by default) — but your roadmap explicitly heads toward dashboards, quizzes, and logins (Phase 2–4). Those are "app" features Next.js handles natively; choosing Astro now would risk a front-end rewrite later, violating your "minimal rewrites" rule. **WordPress** rejected: plugin-heavy, slower over time, harder to make truly custom, and you'd learn PHP/plugin-wrangling instead of transferable skills. **Plain React (Vite)** rejected: no built-in SEO rendering — the one thing you can't compromise on. **Gatsby** rejected: declining ecosystem.

### 2. Backend Framework → **None separate; use Next.js itself (Server Components + Route Handlers + Server Actions)**
- **Why:** A content MVP barely needs a backend. The few server tasks (handle the contact form, power search) live inside Next.js. No second server to build, host, or secure.
- **Solo-founder fit:** Avoids the classic trap of running two apps (frontend + backend) — half the things to break, half the cost.
- **AI-assisted fit:** Everything is in one codebase, so AI sees the whole picture when helping you.
- **Alternatives rejected:** **Express / NestJS / Django / FastAPI** as a separate service — all add a deployment, a language/runtime, and network plumbing (CORS) for zero MVP benefit. This is exactly the microservice-style complexity the Blueprint says to avoid.

### 3. Database → **None for the MVP. (Phase 2: PostgreSQL on a managed host such as Neon or Supabase.)**
- **Why:** Your MVP has no logins, no user data, no comments — nothing that *needs* a database. Your content can live as files (item #15). The contact form sends an email instead of storing rows. **No database = less cost, less to secure, less to break, faster pages.**
- **Solo-founder fit:** One of the biggest sources of complexity and bills, removed entirely until you actually need it.
- **AI-assisted fit:** Fewer moving parts to reason about while you're learning.
- **When it arrives:** The moment Phase 2 adds accounts, you add PostgreSQL. It's the industry-standard relational database, it models your future data (users, notes, quizzes, results) cleanly, and managed hosts (Neon/Supabase) run it for you with a free tier.
- **Alternatives rejected:** **MongoDB** — your data is highly relational (users↔notes↔quizzes), PostgreSQL fits better and is more future-proof. **Firebase/Firestore** — fast to start but proprietary lock-in and awkward for relational/SEO data. **SQLite** — fine for tiny/local, but doesn't suit serverless hosting well at scale.

### 4. ORM (the friendly translator between code and database) → **None for MVP. (Phase 2: Prisma.)**
- **Why:** No database in MVP means no ORM yet. When the DB arrives, Prisma lets you work with data in plain, readable code instead of raw database language, and it auto-completes and catches mistakes.
- **Solo-founder fit:** The most beginner-friendly, best-documented option; reads almost like English.
- **AI-assisted fit:** AI knows Prisma extremely well and its type-safety means AI-written queries are checked automatically.
- **Alternatives rejected:** **Drizzle** (great, but slightly more SQL knowledge expected — Prisma is gentler for you). **TypeORM/Sequelize** (clunkier, weaker AI support). Raw SQL (error-prone for a beginner).

### 5. Styling Framework → **Tailwind CSS**
- **Why:** You style by adding small, named classes directly to elements (`text-lg`, `p-4`) instead of maintaining separate stylesheets. Fast, consistent, and it makes a clean "Wikipedia/Britannica-calm" reading design easy to keep uniform.
- **Solo-founder fit:** No separate CSS files to organize or accidentally break; design tokens (colors, spacing, fonts) live in one config you change once.
- **AI-assisted fit:** The most common styling system in modern AI training data — AI produces correct Tailwind instantly and can restyle anything on request.
- **Alternatives rejected:** **Plain CSS / CSS Modules** (more files to manage, easy to create inconsistencies). **Styled-components** (extra runtime, more concepts). **MUI / Chakra / Bootstrap** (impose their own look; harder to achieve a distinctive editorial reading experience; heavier).

### 6. State Management → **Minimal: React's built-in tools (Server Components + `useState`/Context). No external library.**
- **Why:** A reading-focused content site has almost no "interactive state." Most pages are static content. Don't install machinery you won't use.
- **Solo-founder fit:** One fewer big concept to learn during MVP.
- **AI-assisted fit:** Built-in React patterns are the best-understood by AI.
- **Alternatives rejected:** **Redux** (heavy, ceremony-laden — massive overkill here). **Zustand/Jotai** (lightweight and good — but add them in Phase 2 *if* dashboards/notes actually need shared client state; not before).

### 7. Authentication → **None in MVP. (Phase 2: Auth.js (NextAuth) — or Clerk if you prefer fully-managed.)**
- **Why:** The Blueprint excludes login/signup from MVP, so there's nothing to authenticate yet. Building auth now would be effort with no MVP payoff.
- **Solo-founder fit:** Auth is one of the easiest things to get subtly wrong (security); deferring it until needed is the safe, simple choice.
- **AI-assisted fit:** When the time comes, Auth.js is purpose-built for Next.js and well-known to AI; **Clerk** is even simpler (a managed service — drop-in login UI) at the cost of a subscription as you grow.
- **Alternatives rejected (for later):** **Building your own auth** — never recommended; security risk. **Firebase Auth** — ties you to Firebase.

### 8. API Architecture → **Server Components fetch content directly; a few simple Route Handlers for contact + search. REST-style, minimal.**
- **Why:** Pages read content directly at build/render time (no API call needed for articles). Only genuinely dynamic actions (submitting the contact form, running a search) get a small endpoint.
- **Solo-founder fit:** The least possible API surface = least to maintain.
- **AI-assisted fit:** Standard, predictable patterns AI generates reliably.
- **Alternatives rejected:** **GraphQL** (powerful but heavy; pointless for a content MVP). **tRPC** (lovely with TypeScript — consider in Phase 2 when there's a real client↔server app; unnecessary now).

### 9. Folder Structure → *(see Part C below — a content-first Next.js layout)*

### 10. Deployment → **Vercel** (alternatives: Netlify, Cloudflare Pages)
- **Why:** You connect your code repository once; thereafter every saved change auto-publishes in ~a minute. Global CDN (fast in India), automatic HTTPS, free custom domain, generous free tier. Made by the Next.js team, so zero config friction.
- **Solo-founder fit:** No servers to manage, no DevOps. "Save → it's live."
- **AI-assisted fit:** The default deployment target in virtually all Next.js guidance.
- **Alternatives rejected:** **Netlify / Cloudflare Pages** (both excellent and viable; Cloudflare is cheapest at scale — but Vercel + Next.js is the smoothest pairing for a beginner). **VPS / AWS / DigitalOcean droplet** (you'd become a sysadmin — exactly what to avoid).

### 11. Environment Variables (where secrets live) → **`.env.local` on your computer (never uploaded) + Vercel dashboard for production + a committed `.env.example` template**
- **Why:** Secret keys (e.g., the email-sending key) must never sit in your public code. This standard split keeps them safe while documenting *which* keys are needed.
- **Solo-founder fit:** A simple, memorable rule: secrets go in `.env.local` and Vercel, never in the code.
- **AI-assisted fit:** A universal convention AI will set up and respect automatically.
- **Alternatives rejected:** Hard-coding keys in code (a security leak). Dedicated secret managers like Vault (enterprise overkill).

### 12. Image Handling → **Next.js `<Image>` component + images in the repo's `/public` for MVP; graduate to Cloudinary (free tier) if volume grows**
- **Why:** `next/image` auto-converts to modern formats (WebP), resizes per device, lazy-loads, and prevents layout "jump" — directly serving your performance and premium-quality goals. For ~2 images/day, simply keeping optimized files in the project is the simplest possible system.
- **Solo-founder fit:** No third-party account needed at first; alt-text is enforced as a required field so SEO/accessibility stay correct.
- **AI-assisted fit:** AI can wire up `next/image` and later Cloudinary in minutes.
- **Alternatives rejected:** Plain `<img>` tags (no optimization → slow). Self-hosting an image server (needless complexity). Starting with Cloudinary immediately (fine, but an extra account before you need it).

### 13. Package Manager (the tool that installs code libraries) → **npm**
- **Why:** It comes built-in with Node.js — nothing extra to install or understand. For a non-technical beginner, fewer concepts wins.
- **Solo-founder fit:** The default in nearly every tutorial you'll follow, so instructions "just match."
- **AI-assisted fit:** Universal; no ambiguity in AI instructions.
- **Alternatives rejected:** **pnpm** (faster and more disk-efficient — a great choice technically, and easy to switch to later — but it's one more thing to install/learn now). **Yarn** (no real advantage for you today).

### 14. TypeScript → **Yes, from day one — used gently**
- **Why:** TypeScript is JavaScript that labels what kind of data each thing is (text, number, an article). It catches mistakes *as you type* instead of as broken pages later. Counter-intuitively, it makes life **easier** for a beginner because the editor guides you.
- **Solo-founder fit:** Fewer silent bugs; your editor autocompletes and warns you.
- **AI-assisted fit:** This is the big one — types let AI write far more correct code, because the AI (and the compiler) can verify the data shapes. AI-assisted development is markedly more reliable in TypeScript.
- **Alternatives rejected:** **Plain JavaScript** — simpler on the surface, but you lose the safety net and the superior AI assistance exactly when you, a learner, need them most.

### 15. Content Management → **File-based MDX for the MVP (no database, no admin panel)** — *this is the pivotal decision; see note*
- **What it means:** Each article is a file written in **MDX** (Markdown — simple text with `#` for headings, `**bold**`, etc. — plus the ability to drop in rich components like tables, timelines, and maps when needed). The files live in a `/content` folder organized by your hierarchy. Next.js turns each file into a fast, SEO-perfect page automatically.
- **Why it fits the Blueprint precisely:** The Blueprint **excludes an Admin Panel and has no database in MVP**, and prizes simplicity, low cost, SEO, and scalability-to-thousands. File-based content needs *none* of those excluded things, produces the fastest possible pages, and scales to thousands of articles for free. Your content also gets free version history (every change is tracked).
- **Solo-founder + AI-assisted fit (this is the key insight):** Your workflow becomes **"paste your book notes to me → I format them into a correct MDX article file → you publish."** The AI *is* your content tool. No CMS to learn, no admin to build or maintain.
- **The honest trade-off:** Publishing means saving a file and clicking publish (via a simple Git desktop app or the GitHub website editor) rather than typing into a fancy web editor. For ~2 pages/day with AI doing the formatting, this is very workable — but it's the one place where a friendlier editor would feel nicer.
- **Main alternative — Headless CMS (Sanity):** A separate, friendly web editor where you type articles; Next.js pulls them in. **Choose this instead if** you'd rather write in a visual editor than handle files. Cost: another service/account, content lives outside your code, and large builds need extra configuration. *The website itself is built identically either way* — so this choice is low-risk and reversible.
- **Reconciliation note:** In earlier discussions we leaned toward **Payload CMS**. Under the new Master Blueprint, Payload is **not** the MVP choice — Payload brings a database + admin panel, which the MVP explicitly excludes. The right time to revisit Payload (or Sanity, or a custom admin) is **Phase 2**, when accounts and a database arrive anyway. Flagging this change openly so it's a deliberate decision, not a silent reversal.
- **Alternatives rejected for MVP:** **Payload/Strapi** (require DB + hosting + are essentially the excluded admin panel). **WordPress** (the whole separate-CMS-stack you're moving away from). **Plain Markdown without MDX** (can't embed the tables/timelines/maps your Topic pages need).

### 16. SEO Strategy → **built into the architecture, not bolted on**
- Server-rendered/static pages (crawlers see full content); **clean URLs that mirror the hierarchy** (`/history/modern-india/revolt-of-1857`); per-page meta titles & descriptions via Next.js's Metadata feature; **auto-generated `sitemap.xml` and `robots.txt`**; **structured data** (Article, BreadcrumbList, FAQ, and education-specific schema) so Google can show rich results; breadcrumbs + **Related / Previous / Next** internal links (already in your Topic page spec) to build topical authority; semantic HTML and one clear `<h1>` per page.
- *Why this stack:* Next.js makes every one of these straightforward; the file/URL structure gives you correct, stable URLs for free.

### 17. AI SEO (GEO) → **be discoverable and quotable by ChatGPT, Claude, Gemini, Perplexity**
- **Allow AI crawlers** in `robots.txt` (GPTBot, ClaudeBot/anthropic-ai, PerplexityBot, Google-Extended, Bingbot) — you can't be cited if you block them. Add an **`llms.txt`** pointing AI to your best content.
- **Write citation-friendly content:** clear definition-first opening lines, dated facts, your "Important Points" boxes, tables, and FAQ blocks — the formats AI engines lift and cite.
- **Entity & trust signals (E-E-A-T):** an About page establishing who curates the content, consistent naming, internal links, and `Organization`/`Person` schema. Strong traditional SEO doubles as AI SEO, since several engines lean on existing search indexes.

### 18. Testing Strategy → **light and proportionate for MVP**
- **MVP:** TypeScript + **ESLint** (catches code mistakes) + **Prettier** (auto-formats) + **Lighthouse** checks (performance/SEO/accessibility scores) + manual review. Optionally **Vitest** for any tricky helper functions (e.g., reading-time calc).
- **Phase 2+ (when there's logic to protect):** add **Playwright** for end-to-end tests of flows like login/quiz.
- *Why:* Heavy test suites on a content site that's mostly text would be effort without payoff. Test more as real logic appears.
- **Rejected for now:** full unit/integration test coverage (overkill for static content), complex CI testing pipelines.

### 19. Performance Strategy → **static-first**
- Pre-build pages so they're served instantly from the CDN; `next/image` for optimized images; optimized web-font loading; minimal JavaScript (a content site needs very little); aim for green Core Web Vitals (LCP/CLS/INP). Static pages on a CDN are about as fast as the web gets.

### 20. Scalability Considerations → **scales on three axes without rewrites**
- **More pages (→ thousands):** static generation + **Incremental Static Regeneration** (build/refresh pages on demand rather than all at once) + a **sitemap index** keep build times and crawlability healthy. The CDN serves any traffic volume.
- **More features (→ accounts, quizzes):** added *additively* in Phase 2 — drop in PostgreSQL + Auth.js + new routes; the existing content pages are untouched.
- **Bigger search:** start with a simple static/client-side index; upgrade to a dedicated search service (e.g., Algolia/Meilisearch) only when content volume demands it — the search box UI stays the same.

### 21. Future-Proofing → **the content/presentation split + stable hierarchy**
- Because content is separate data and the **Home → Subject → (Category) → Topic** hierarchy is fixed, you can later swap *how* content is stored (files → CMS → database) **without changing the pages that display it**, and add user features around it. This is the concrete mechanism that delivers the Blueprint's "future features without major rewrites" promise.

---

## Part B — Architecture Explanation (the big picture, plainly)

```
        You + AI                         A reader (or an AI crawler)
   write an MDX article  ───────────┐         opens a page
                                     ▼              │
                           ┌──────────────────┐     ▼
                           │  /content folder  │   ┌──────────────────────────┐
                           │  (your articles,  │   │   VERCEL (global CDN)     │
                           │   organized by    │   │  serves a pre-built,      │
                           │   the hierarchy)  │   │  fully-rendered page in   │
                           └─────────┬─────────┘   │  ~1 second, anywhere      │
                                     │             └─────────────┬────────────┘
                                     ▼                           │
                           ┌──────────────────────────────────────────────┐
                           │              NEXT.JS APP                       │
                           │  • reads content files                         │
                           │  • builds Subject / Category / Topic pages     │
                           │  • generates SEO tags, sitemap, schema         │
                           │  • handles Search + Contact form               │
                           └────────────────────────────────────────────────┘

   PHASE 2+ (added later, WITHOUT touching the above):
        + PostgreSQL (Neon/Supabase)  + Auth.js   + Dashboards / Notes / Quizzes
```

**In words:** Your articles are simple files. Next.js turns them into fast, search-optimized web pages and hosts the small extras (search, contact). Vercel serves it all worldwide. There is no database, no login system, and no admin panel to maintain in the MVP — those are *added around* this core later, when your roadmap reaches them.

---

## Part C — Suggested Folder Structure (simplified for a solo founder)

**Guiding rule:** start with the fewest folders possible, and create a new folder **only when you actually have something to put in it.** Nothing is set up "just in case."

### What you start with on day one

```
gkworld360/
│
├── content/                  ← YOUR ARTICLES LIVE HERE (the product)
│   └── history/
│       ├── overview.mdx               ← the "History" subject page
│       └── indus-valley-civilization.mdx  ← a topic inside History
│
├── app/                      ← THE WEBSITE
│   ├── page.tsx               ← Homepage
│   ├── [...slug]/page.tsx     ← shows EVERY subject, category & topic page (one file)
│   └── layout.tsx             ← shared header + footer wrapper
│
├── components/               ← reusable design pieces (Header, Footer, Card…)
│
├── lib/
│   └── content.ts             ← the helper that reads your article files
│
├── public/                   ← images, favicon
├── .env.local                ← your private keys (never uploaded)
└── (config files at the root: package.json, tailwind, tsconfig, next.config)
```

That is the whole thing to begin with: **four working folders** — `content`, `app`, `components`, `lib` — plus `public` for images. Nothing else exists until you need it.

### Two clarity improvements you asked for

1. **No more `_subject.mdx` / `_category.mdx`.** The landing page for any subject or category is simply **`overview.mdx`** inside that folder — it plainly means *"the intro page for this section."* Each article's title, description, and image are written in a small labelled block at the top of the file (called *frontmatter*); the AI fills that in for you.

2. **One file handles the whole hierarchy.** Instead of four separate routing files (subject, category, topic, no-category), a single **`app/[...slug]/page.tsx`** displays *every* content page by reading the web address. Fewer files, less to understand, nothing to keep in sync. You never edit this file — the AI maintains it.

### How a category appears — only when you want one

A category is simply **a folder you add inside a subject**, created *only* when it helps organise things. No category needed? Don't make the folder — topics can sit directly under the subject.

```
content/
└── history/
    ├── overview.mdx                    ← History subject page
    ├── indus-valley-civilization.mdx   ← a topic with NO category (sits here directly)
    └── modern-india/                   ← add this folder ONLY when you want the category
        ├── overview.mdx                 ← the "Modern India" category page
        └── revolt-of-1857.mdx           ← a topic inside the category
```

This is exactly your Blueprint hierarchy — **Home → Subject → (Optional Category) → Topic** — where "optional" is literal: the category is just a folder that exists only if you create it.

### How the structure grows later (add only when needed)

| When you… | …add this |
|---|---|
| build the Subjects-listing, About, Contact, or Search page | one folder per page inside `app/` (e.g. `app/about/page.tsx`) |
| start the Articles section | `app/articles/` for the pages + a `content/articles/` folder for the articles |
| add a second/third subject | another folder inside `content/` (e.g. `content/science/`) |
| collect many design pieces | optional subfolders inside `components/` (e.g. `components/content/`) |
| need more helper logic (SEO tags, search) | more files inside `lib/` (e.g. `lib/seo.ts`, `lib/search.ts`) |
| outgrow images-in-`public` | a Cloudinary account (no new folder in your project) |

None of these exist up front. Each one appears the day it earns its place — keeping the project small and understandable for as long as possible.

The shape still mirrors your Blueprint: `content/` is the product, the single `[...slug]` route renders the whole **Subject → Category → Topic** hierarchy, and everything else stays minimal until real growth asks for more.

---

## Part D — Development Roadmap (technical, aligned to the Blueprint's phases)

**Phase 1 — MVP (content platform)**
1. Project setup: Next.js + TypeScript + Tailwind + ESLint/Prettier (guided install of Node, the editor, and Git).
2. Design system: colors, fonts (a clean reading typeface), spacing — the calm Wikipedia/Britannica feel.
3. Layout shell: responsive header/nav/footer, breadcrumbs (desktop-first, tablet parity, mobile-friendly).
4. The MDX content pipeline + the Topic page (your most important page) with all its components.
5. Subject, Category, Homepage, Articles, About, Contact pages.
6. Search (static index) + Contact form (emails you via Resend).
7. SEO + AI SEO: metadata, sitemap, robots, schema, `llms.txt`, allow AI crawlers.
8. Deploy to Vercel + connect your domain. **Begin publishing ~2 articles/day.**

**Phase 2 — User Features** (additive): add PostgreSQL + Prisma + Auth.js → login/signup, dashboard, notes, bookmarks. *Reassess content tooling here (a CMS/admin can be introduced now that a DB exists).*

**Phase 3 — Advanced:** quizzes, results, progress tracking, richer search (Algolia/Meilisearch), newsletter.

**Phase 4 — Premium Ecosystem:** subscriptions + payments (Razorpay), tutor/group features, advanced admin & analytics.

---

## Part E — Technologies Intentionally Rejected (summary)

| Rejected | In favor of | Why rejected |
|---|---|---|
| WordPress | Next.js + MDX | Plugin sprawl, slows over time, less custom, off-path skills |
| Astro | Next.js | Better for pure content, but future app features (auth/quizzes) would force a rewrite |
| Plain React (Vite) / Gatsby | Next.js | No/weak built-in SEO rendering; Gatsby fading |
| Separate Express/Nest/Django backend | Next.js built-in | Two apps to run = needless complexity/cost (anti-microservice) |
| MongoDB / Firebase / SQLite | (none now) → PostgreSQL later | Relational data fits Postgres; avoid lock-in; no DB needed in MVP at all |
| Redux | React built-ins (+ Zustand later if needed) | Heavy ceremony for a near-stateless content site |
| GraphQL | Minimal REST + Server Components | Overkill for MVP |
| Payload/Strapi CMS **now** | File-based MDX **now** (revisit in Phase 2) | Require DB + admin panel that the MVP explicitly excludes |
| pnpm/Yarn | npm | One fewer tool to install/learn (switch later if desired) |
| Heavy test suites | TS + lint + Lighthouse + manual | Disproportionate for a text content MVP |

---

## Part F — Risks & Trade-offs

| Decision | Benefit | Disadvantage / Risk | Trade-off verdict |
|---|---|---|---|
| **File-based MDX (no CMS)** | Free, fastest, simplest, version-controlled, AI-formats it | Publishing via files/Git is less cozy than a web editor | Right for MVP; revisit a CMS in Phase 2 when a DB exists |
| **Next.js over Astro** | One foundation for content *and* future app features | Slightly more JS than Astro on a pure-content site | Worth it — avoids a Phase-2 rewrite (your stated priority) |
| **No database in MVP** | Less cost, less to secure/break, faster | Anything needing stored user data must wait for Phase 2 | Correct — MVP genuinely needs none |
| **Vercel hosting** | Effortless deploys, fast in India, free tier | Some vendor lock-in; costs rise at high traffic | Acceptable; Netlify/Cloudflare are escape hatches |
| **TypeScript** | Fewer bugs, much better AI help | A little more to learn upfront | Strongly net-positive for a learner + AI |
| **Tailwind** | Fast, consistent, AI-friendly | Class-heavy markup looks busy at first | Standard and worth it |
| **Defer auth/DB/admin** | Smaller, achievable, secure MVP | No personalization at launch | Exactly what the Blueprint mandates |
| **Single source = the Blueprint** | Clear direction, no contradictions | Earlier docs were removed; some past detail now lives only in this consolidation | Healthy — one source of truth |

---

## The one decision to confirm

Everything above is firm except the pivotal content fork:

> **Recommended: File-based MDX content for the MVP** (no database, no admin panel — you paste book notes, the AI turns them into article files, you publish). The main alternative is a **headless CMS like Sanity** (a friendlier web editor, at the cost of another service). The website is built identically either way, so this is low-risk and reversible.

**Question to resolve:** content approach — **file-based MDX**, or **headless CMS (Sanity)**?

---

## Final Recommended Tech Stack (at a glance)

| Layer | MVP choice | Phase 2+ addition |
|---|---|---|
| Frontend | Next.js (App Router, React) | — |
| Backend | Next.js built-in (Server Components / Route Handlers) | — |
| Language | TypeScript | — |
| Styling | Tailwind CSS | — |
| Content | File-based MDX *(or Sanity)* | CMS/admin reassessed |
| Database | none | PostgreSQL (Neon/Supabase) |
| ORM | none | Prisma |
| Auth | none | Auth.js (or Clerk) |
| State | React built-ins | Zustand *(only if needed)* |
| Search | static index | Algolia/Meilisearch *(when large)* |
| Images | next/image + `/public` | Cloudinary *(if volume grows)* |
| Email | Resend (contact form) | + newsletter tool |
| Analytics | Google Analytics + Search Console | advanced analytics |
| Hosting | Vercel | — |
| Package manager | npm | — |
| Testing | TS + ESLint + Prettier + Lighthouse | + Playwright |