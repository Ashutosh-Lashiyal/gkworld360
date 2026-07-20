# GKWorld360 — Project Context for Claude

> Give this file to Claude at the start of any new session.
> Reference it with `@PROJECT_CONTEXT.md` in Claude Code.

> **📋 Documentation map (which doc does what):**
> - **`docs/GKWORLD360_MASTER_BLUEPRINT.md`** = ⭐ MAIN source of truth — vision, core decisions, future roadmap.
> - **`PROJECT_CONTEXT.md`** (this file) = the current-state handoff — what's built/in-progress right now. Updated after every task.
> - **`docs/GKWORLD360_TECH_FOUNDATION.md`** = tech-stack detail · **`GKWORLD360_PROJECT_STRUCTURE.md`** = folder/file guide · **`SETUP_GUIDE.md`** = how to set up & run · **`GKWORLD360_DESIGN_SYSTEM.md`** = design tokens.
> - **`SERVICES.md`** = third-party services & billing · **`GIT_NOTES.md`** = git learning notes.
> - **`IDEAS.md`** = parking lot for raw, undecided ideas (they graduate to the Blueprint or here when decided).
> Each doc has one lane; keep them in it so they don't drift.

---

## What is GKWorld360?

An Indian educational platform for students preparing for competitive exams (UPSC, SSC, Railways) and lifelong learners. Covers 18 subjects: History, Geography, Physics, Chemistry, Biology, Famous Personalities, Economy, Polity, Environment, Arts & Culture, Sports, Technology, Mathematics, Science, Current Affairs, World History, Indian History.

**Stack:** Next.js 16 (App Router, Turbopack), Tailwind CSS v4, TypeScript  
**Fonts:** Source Serif 4 (headings), Inter (body), Noto Sans Devanagari (Hindi)  
**Deployment:** Vercel  
**Dev server:** `npm run dev` → http://localhost:3000

### Confirmed Database & CMS Stack (decided Jul 1 2026)

| Layer | Service | Purpose | Cost |
|---|---|---|---|
| Database | Neon (PostgreSQL) | Stores article text, titles, dates, slugs, metadata | Free (3GB) |
| Image storage | Cloudflare R2 | Stores actual image files (JPG/PNG/WebP) | Free (10GB) |
| CMS admin panel | Payload CMS v3 | Browser UI to write/manage articles at `/admin` | Free (open source) |
| AI Chatbot | Google Gemini 2.5 Flash | Powers Gyaani | Free (limited) |
| Hosting | Vercel | Runs the Next.js website | Free |

**Total monthly cost = ₹0**

**Why these choices:**
- Neon chosen over MongoDB Atlas (3GB free vs 512MB) and CockroachDB (overkill for our scale). User also wants to learn SQL — PostgreSQL is the best database to learn SQL on.
- Cloudflare R2 chosen over AWS S3 — no egress fees, free tier never expires, S3-compatible so data is portable.
- Payload CMS v3 chosen because it is open source (MIT) — even if the company shuts down, the code keeps running. Data lives in standard PostgreSQL, not locked into any proprietary system.

**Migration plan:**
- ✅ Phase 1 (DONE): Create Neon + Cloudflare accounts, save credentials
- ✅ Phase 2 (DONE, 2 Jul 2026): Install Payload CMS v3, admin panel live at `/admin`, connected to Neon + R2, first admin user created
- ✅ Phase 3 (DONE, 2 Jul 2026): Content schema built — 4 collections + Hindi localization + editor blocks (see below). Tables auto-created in Neon.
- 🔄 Phase 4 (IN PROGRESS): Connect Payload to the pages. **Vertical slice DONE (7 Jul 2026):** English topic pages now render from the CMS when the article exists there, via a **"Payload-first, MDX-fallback"** check in `app/(frontend)/[...slug]/page.tsx`. The Revolt of 1857 article was created in `/admin` and renders live at `/history/modern-india/revolt-of-1857` with banner, meta bar (subject · reading time · updated date), rich-text body (headings/paragraphs + KeyTakeaways/TopicImage blocks), and an auto Table-of-Contents sidebar. Editing in `/admin` + refresh updates the page. **News wired too (13 Jul 2026):** CMS news items render at the flat URL `/news/<slug>` via `getCMSNews` + `CMSNewsView` (reuses `NewsArticleView`); the "Smart Border Project" item is live at `/news/smart-border-project-india`. Editor now also has **tables** (`EXPERIMENTAL_TableFeature`) and the Image block has an **align/wrap** option. Next in Phase 4: the `/news` listing + homepage "recent news" (still MDX), subject/category pages, search, and Hindi.
- ⬜ Phase 5: Migrate remaining articles into Payload, delete MDX files + `content/` folder

**Phase 4 files added:**
- `lib/cms.ts` — Payload Local API data layer: `getCMSArticle(slug[])`, plus helpers `estimateReadingTime`, `extractHeadingsFromLexical`, `slugifyHeading`, `lexicalToPlainText`.
- `components/cms/CMSRichText.tsx` — renders the Lexical body via Payload's `<RichText>`, with converters mapping `keyTakeaways`/`topicImage` blocks to the existing `KeyTakeaways`/`TopicImage` components, and a `heading` override that stamps `id`s (so the TOC can jump to them).
- `components/cms/CMSTopicView.tsx` — the topic page layout for CMS articles (banner, meta bar, body, TOC sidebar).
- `next.config.ts` — added `images.localPatterns` (allow `/images/**` AND `/api/media/**?prefix=media`; the R2 media URL carries a query string Next 16 blocks by default). **Gotcha:** defining `localPatterns` switches Next to whitelist-only mode, so ALL local image paths must be listed or they break.

URLs, SEO, design — all unchanged by migration. Only content storage layer changes.

### Payload CMS Setup — File Structure & Gotchas (Phase 2)

The app is now split into two Next.js **route groups** (the `( )` names are invisible in URLs):
```
app/
  (frontend)/          ← the public website
    layout.tsx         ← site <html> + Header + Footer + Gyaani + globals.css
    page.tsx, [...slug]/, about/, contact/, news/, search/, subjects/, topics/, not-found.tsx
  (payload)/           ← the CMS admin (Payload's own <html>)
    layout.tsx         ← RootLayout + serverFunction wiring (REQUIRED)
    config.ts          ← re-exports the built config promise from payload.config.ts
    importMap.js       ← hand-maintained (see gotcha #3)
    admin/[[...segments]]/page.tsx + not-found.tsx
    api/[...slug]/route.ts
  api/                 ← existing site APIs (gyaani) — route handlers, no layout needed
  robots.ts, sitemap.ts, llms.txt, icon.png  ← stay at app root (icon.png is the favicon; the default favicon.ico was removed 16 Jul so it wouldn't override our icon)
payload.config.ts      ← master config: Neon (db) + R2 (s3Storage plugin) + collections
collections/           ← Users.ts (admin login), Media.ts (image uploads to R2)
```
There is intentionally **no** `app/layout.tsx` — each route group is its own root layout (this is how you run two separate `<html>` shells in one Next.js app).

**Gotchas discovered (don't repeat these):**
1. **Turbopack needs the config alias set manually.** `next.config.ts` has `turbopack.resolveAlias["@payload-config"]` and `turbopack.root: __dirname` (the root fixes a stray `package.json`/`package-lock.json` in the home folder that confused workspace detection). `withPayload()` only sets up webpack aliases, not Turbopack.
2. **Do NOT call `sanitizeConfig()` yourself.** `buildConfig()` in `payload.config.ts` already returns a `Promise<SanitizedConfig>`. Re-sanitizing it caused a fake "missing secret key" error. `(payload)/config.ts` just re-exports the promise.
3. **The importMap must live at `app/(payload)/admin/importMap.js`** (Payload's convention) and list ALL admin client components (Lexical editor, blocks, S3 handler — ~50 entries). If it's missing the editor entries, richText/Body fields silently DON'T render → "field is required" on save with no visible editor. The `payload generate:importmap` CLI crashes on Node 26, and a standalone script fails on `@next/env` interop — so regenerate it by temporarily adding a Next route that calls `generateImportMap(await configPromise, {force:true,log:true})`, curling it, then deleting the route.
4. **The `(payload)/layout.tsx` is required** — without it the admin crashes with "Cannot destructure property 'config' of 'se(...)'".

**package.json scripts added:** `payload`, `generate:types`, `generate:importmap`.

**Admin login:** `/admin` — first user created 2 Jul 2026.

### Content Schema (Phase 3) — collections & fields

Localization is ON globally: `en` + `hi`, default `en`, fallback to `en`. Fields marked 🌐 store both languages (admin shows an EN/HI toggle). Slugs are never localized (Hindi served at `/hi/<slug>`, same slug). Reusable slug field: `fields/slug.ts` (validates lowercase-hyphen format; `unique` optional).

- **Subjects** (`collections/Subjects.ts`) — name🌐, slug(unique), icon(emoji), coverImage→media, description🌐, homepageOrder(number), colors group (accent/background/border hex). Replaces hard-coded `lib/subjects.ts` + `lib/subject-colors.ts`.
- **Categories** (`collections/Categories.ts`) — name🌐, slug, subject→relationship, overview🌐 (richText). The middle level (e.g. Modern India) with its own overview page.
- **Articles** (`collections/Articles.ts`) — title🌐, slug, subject→rel(req), category→rel(opt), description🌐, coverImage→media, coverImageCaption🌐, body🌐(richText, req), publishedDate.
- **News** (`collections/News.ts`) — title🌐, slug(unique), category🌐, description🌐, coverImage→media, coverImageCaption🌐, body🌐(richText, req), **eventDate(req)** — the Google-verified event date.

**Editor blocks** (`blocks/`) — custom pieces authors insert into any richText body, replacing the old MDX components:
- `KeyTakeaways.ts` (slug `keyTakeaways`) — array of points → the styled takeaways box.
- `TopicImage.ts` (slug `topicImage`) — image(→media) + caption + size(small/medium/full).
Registered globally via `BlocksFeature` on the default `lexicalEditor` in `payload.config.ts`.
The **Table of Contents sidebar stays auto-generated** from body headings (Phase 4 work), not a manual block.

All content collections have `access: { read: () => true }` so the public site can fetch them; writes still require admin login.

---

## Working Rules (ALWAYS follow these)

1. **Ask before coding.** Explain the plan → wait for "yes" → then implement. Never code without approval.
2. **This is a learning project.** Add comments explaining WHY (not what) in code. Explain changes in plain English in chat.
3. **Local first.** All recent changes are uncommitted. Test locally, get approval, then commit.
4. **Responsive.** Desktop, laptop, tablet, mobile all equally important.
5. **Verify news dates.** Every time a news article is added, search Google using Playwright to verify the actual event date. The `date:` field must show when the event happened — not when the article was written. Search: `[event] site:thehindu.com OR site:ndtv.com OR site:economictimes.com`. Use the date confirmed across multiple sources.

---

## Current State (as of 28–29 Jun 2026)

### What's built and working

**Design & Navigation**
- Sage & teal design system (navy `#1e3d38`, sapphire `#2d7a4f`) in `globals.css`
- Logo in header + footer (`public/images/logo.png` — transparent background PNG)
- Favicon at `app/icon.png`
- Header: centered nav (absolute positioning), search bar (click → goes to /search), bell notification
- Subjects dropdown: fixed hover bug (timer-based close), per-subject hover colors
- Footer: `#b0c4c0` background, logo with `mix-blend-mode: multiply`
- About section: dark navy background above footer (Vivekananda image at `public/images/about.png`)

**Subject Color Theming**
- Each subject has its own color scheme in `lib/subject-colors.ts`
- When inside a subject page: header gets a 3px colored bottom border, H1 headings use accent color
- All cards (SubjectCard, ContentCard, TopicCard, NewsCard) show subject-specific hover color
- Cards with Hindi versions **flip** on hover — front: English, back: Hindi title + two links

**Hindi Bilingual System**
- Paired MDX files: `topic.mdx` (English) + `topic.hi.mdx` (Hindi)
- Hindi served at `/hi/...` URLs
- `hasTranslation(slug, "hi")` checks if Hindi version exists
- Currently only `revolt-of-1857.hi.mdx` exists as Hindi content
- Language toggle on article pages (if `.hi.mdx` exists)
- Card flip animation shows "हिन्दी में पढ़ें →" and "Read in English →" links on back

**Content Cards & Flip Animation**
- `ContentCard.tsx` — "use client", flips on hover when `hindiHref` provided
- `TopicCard.tsx` — "use client", flips for both popular and recent variants
- `NewsCard.tsx` — "use client", flips for news with Hindi versions
- Back face: Hindi title (Devanagari) + two plain text links (no pill buttons — they overflow)

**Homepage Sections**
- Hero with search box
- Explore Subjects (6 cards, real data from content)
- Daily Quote (from `content/daily-quote.mdx`)
- Popular Topics (real data via `getRecentTopics(7).slice(0,4)`)
- Recently Added Topics (real data via `getRecentTopics(7).slice(0,3)`, grid layout, no scroll)
- Recently Added News (real news items)
- About section (dark navy, Vivekananda photo)

**Search**
- `/search` page with `autoFocus` — user can type immediately
- Results sorted: title matches first, then by type (Subject → Category → Topic → News)
- News correctly tagged as "News" not "Topic"
- Close button (router.back()) on search page
- Header has full search bar field (not just icon)

**All Topics Page** (`/topics`)
- Shows all topics across all subjects in a 3-column grid
- Sort toggle: Popular | Recently Added (URL param `?sort=popular` or `?sort=recent`)
- "View all topics →" from Popular Topics links to `/topics?sort=popular`
- "View all →" from Recently Added links to `/topics?sort=recent`

**Gyaani Chatbot**
- Floating widget, bottom-right, fixed on every page (in `app/layout.tsx`)
- Avatar: Swami Vivekananda photo (`public/images/vivekananda.png`)
- Named: Gyaani (ज्ञानी)
- 10-question daily limit (resets midnight, only counts SUCCESSFUL answers)
- 300-character cap per message
- Warnings shown at 5 remaining, 2 remaining, 1 remaining
- When limit hit: input replaced with friendly message
- Shows article card below answer when answering from site content
- **Files:** `components/Gyaani.tsx`, `app/api/gyaani/route.ts`

**Gyaani — AI Setup**
- Model: `gemini-2.5-flash` (only model available on this account's free tier)
- API key in `.env.local` as `GEMINI_API_KEY=...`
- Site content extracted from all MDX files and fed as context
- Answers from site content first; general knowledge as fallback
- Tags source article with `[SOURCE:Article Title]` in response; route parses this and returns `sourceArticle` to client
- Error handling: 429 = rate limit message, 503 = retry after 3s

---

## Known Issues / Blockers

| Issue | Status | Fix |
|---|---|---|
| Latest Headlines stuck ~12h old / only LiveMint refreshing | ✅ Fixed 16 Jul | `lib/pulse.ts`: switched the on-visit refresh from a bare `void` (Next 16 kills it after the response) to `after()` from `next/server`; added per-feed 8s timeout + logging, a shared in-flight sync guard, bounded-concurrency capped inserts, and a `/api/pulse/sync` route + `vercel.json` cron (daily on Hobby; */30 needs Vercel Pro) |
| News frozen at deploy time on PROD (headlines showed the deploy-time snapshot, aging; CMS content wouldn't appear without redeploy) | ✅ Fixed 16 Jul | Pages were statically rendered by default (frozen at build). Added `export const dynamic="force-dynamic"` to `/pulse` (always live) and `export const revalidate=60` to the homepage, `/news`, and the `[...slug]` catch-all so headlines + CMS content refresh within a minute. NOTE: `after()` in a static page only runs at build — so dynamic rendering is REQUIRED for the on-visit refresh to run in prod |
| Headlines stale for hours on PROD (low traffic → no visit-triggered refresh; Hobby cron is daily-only) | ✅ Fixed 20 Jul | GitHub Actions scheduler (`.github/workflows/pulse-refresh.yml`) pings `GET /api/pulse/sync` every 15 min, 24/7, independent of visitors/plan. Reads `vars.PULSE_SYNC_URL` (repo variable) so a custom domain is a one-value change later |
| Prod sync hitting Vercel 60s limit (FUNCTION_INVOCATION_TIMEOUT) | ✅ Fixed 20 Jul | Cross-region (Vercel Mumbai ↔ Neon Singapore) + slow free-tier writes. Lightened the sync: `MAX_INSERTS_PER_SYNC=20` (was 50), dedup find trimmed to newest 2000. Now ~11-17s |
| LiveMint cards showed broken-image icon | ✅ Fixed 20 Jul | LiveMint blocks image hotlinking. `components/HeadlineThumb.tsx` ("use client") swaps to the 📰 fallback on image `onError` |
| Neon DB password leaked into a session command's output | ✅ Rotated 20 Jul | Reset in Neon; updated `.env.local` + Vercel Production (DATABASE_URL + DATABASE_URL_DIRECT); prod verified read+write. GitHub holds no DB password. TODO: optional `CRON_SECRET` to lock `/api/pulse/sync` |
| Custom favicon not showing (default Next icon showed) | ✅ Fixed 16 Jul | Deleted the leftover default `app/favicon.ico` (it overrode `app/icon.png`) and shrank `icon.png` 974KB→21KB. Hard-refresh/incognito to bust the browser favicon cache |
| Gemini 20 RPM free tier limit | Active blocker | Enable billing at console.cloud.google.com (free, just adds payment method) |
| Deploying to prod | ✅ Live | Commit + push to GitHub → auto-deploys to Vercel. `.env.local` stays local (git-ignored). Local + prod share ONE Neon DB + R2, so content made in either admin shows on both — use the live Vercel admin for real content |
| Only 1 Hindi article exists | Content gap | Write more `.hi.mdx` files for other topics |
| `suppressHydrationWarning` in layout.tsx | Working fix | Needed due to browser extension injecting into `<body>` |

---

## Key Files Reference

```
app/
  layout.tsx          — Root layout: Header, Footer, Gyaani added here
  page.tsx            — Homepage (all 7 sections, real topic + news data)
  topics/page.tsx     — All Topics page with sort toggle
  search/page.tsx     — Search page
  [...]slug/page.tsx  — All content pages (subject/category/topic)
  api/gyaani/route.ts — Gyaani's Gemini API backend
  globals.css         — All design tokens + bell-ring animation
  icon.png            — Favicon

components/
  Gyaani.tsx          — Floating chatbot UI (10-question limit, flip cards, article card)
  Header.tsx          — Sticky nav with logo, subjects dropdown, search bar, bell
  Footer.tsx          — #b0c4c0 background, logo with mix-blend-mode
  ContentCard.tsx     — Flippable card for categories/topics (use client)
  TopicCard.tsx       — Homepage topic cards, popular + recent variants (use client)
  NewsCard.tsx        — News cards with flip animation (use client)
  SubjectCard.tsx     — Homepage subject cards with hover color (use client)
  BellNotification.tsx — Ringing bell popup announcing Hindi availability
  SortToggle.tsx      — Popular / Recently Added toggle for /topics page
  SearchResults.tsx   — Live search with sorting + close button

lib/
  subjects.ts         — Shared list of all 18 subjects (slug, label, icon)
  subject-colors.ts   — Per-subject color tokens (bg, accent, border)
  content.ts          — Content engine (getRecentTopics added here)
  date-utils.ts       — formatAddedTime() (safe for client components)
  search.ts           — Search index (News tagged as "News" not "Topic")

public/images/
  logo.png            — Site logo (transparent background)
  vivekananda.png     — Gyaani avatar
  about.png           — About section image

.env.local            — GEMINI_API_KEY (never committed to Git)
```

---

## Content Structure

```
content/
  history/
    overview.mdx                        → /history (subject page)
    modern-india/
      overview.mdx                      → /history/modern-india (category)
      revolt-of-1857.mdx               → /history/modern-india/revolt-of-1857
      revolt-of-1857.hi.mdx            → /hi/history/modern-india/revolt-of-1857
      the-east-india-company.mdx
      the-government-of-india-act-1858.mdx
  news/
    2026/06/
      india-china-direct-flights-sco-talks.mdx
      india-china-direct-flights-sco-talks.hi.mdx
  daily-quote.mdx
```

---

## Third-Party Services

### All Services We Use

| Service | What it does | Free Limit | Cost after free | Card added? |
|---|---|---|---|---|
| **Vercel** | Hosts the website | Generous free tier | ~$20/month | No |
| **Neon** | PostgreSQL database (stores articles, metadata) | 3 GB storage | $19/month | No |
| **Cloudflare R2** | Stores image files | 10 GB storage, 1M requests/month | $0.015/GB | **YES** |
| **Google AI Studio** | Powers Gyaani chatbot (Gemini 2.5 Flash) | 15 RPM, limited daily | Pay-as-you-go | No |
| **GitHub** | Stores code (version control) | Unlimited public repos | Free | No |

### Services With Card Added

| Service | Why | Actual charge |
|---|---|---|
| **Cloudflare R2** | Required to activate R2 even on free tier | ₹0 unless you exceed 10GB storage or 1M requests/month |

See `SERVICES.md` in the project root for the full details.

---

## Deployment — Pre-flight Checklist (before pushing the Payload work live)

⚠️ **GitHub is connected to Vercel → pushing to `main` auto-deploys.** Do NOT push `main` until
every box below is green. (To back up work to GitHub *without* deploying, push to a **branch**,
not `main` — Vercel only auto-deploys `main`.)

1. ☐ Payload migration functionally ready — Phase 4 done (site reads from the CMS) and ideally
   Phase 5 (content migrated). At minimum, the public site must still work.
2. ☐ **Production build passes locally:** `npm run build` (we've only tested dev mode so far —
   the production build with Payload/Turbopack has not been verified yet).
3. ☐ **Vercel environment variables set** (Vercel → Project → Settings → Environment Variables),
   because they currently live only in local `.env.local`:
   - `DATABASE_URL` (Neon pooled) and `DATABASE_URL_DIRECT` (Neon direct)
   - `PAYLOAD_SECRET`
   - `CLOUDFLARE_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
   - `GEMINI_API_KEY` (Gyaani)
   - Plus the go-live vars from the launch checklist (`NEXT_PUBLIC_SITE_URL`, `SITE_INDEXING_ENABLED`)
4. ☐ Site tested and working (QA pass).
5. ☐ Deliberate decision that these changes should be public.

**Do the deploy as a guided session:** build → set env vars → push → watch the Vercel deploy →
verify the live site. Milestone-based deploys (at phase completions), not on every change.

---

## Things to Do Next Session

1. **Enable billing** on Google Cloud → Gyaani will work reliably
2. **Commit everything** to Git (large batch of uncommitted changes)
3. **Test Gyaani** fully — ask about Mangal Pandey, check article card appears
4. **Add more Hindi articles** (`.hi.mdx` files) to more topics
5. **About section image** — `public/images/about.png` already placed, showing on site
6. **View all subjects page** (`/subjects`) — check if this page exists and works
7. **UI translation** (future) — interface text in Hindi is a future milestone

---

## Long-Term Vision — /admin as the single control center

The goal is for the Payload admin panel at `/admin` to eventually hold **everything** related to running the site, one login, one place. This grows step by step (content is built-in; the rest are custom pieces we add when the need is real):

- ✅ **Content** — articles, news, subjects, images (working now)
- ⬜ **Analytics dashboard** — a custom `/admin` view showing visitors, page views, most-read articles. (Data source: Vercel Analytics, already installed — currently viewed on the Vercel dashboard, not in `/admin`.)
- ⬜ **Team/users** — additional editors/contributors with roles
- ⬜ **Reader interactions** — comments/submissions, if added
- ⬜ **Site settings** — homepage layout, featured items, editable without code

Payload is a full framework (not just a CMS), so it can grow into this rather than needing a separate tool.

---

## Design Tokens (quick reference)

```css
--color-navy: #1e3d38         /* primary dark, headings, nav */
--color-sapphire: #2d7a4f     /* accent, links, buttons */
--color-navy-dark: #122a26    /* footer, hero, dark sections */
--color-background: #ffffff   /* page background */
--color-surface: #ffffff      /* cards */
--color-surface-low: #f5f5f5  /* subtle sections */
--color-muted: #4a6460        /* secondary text */
```

Footer background: `#b0c4c0` (set via inline style, not a token)
About section: `bg-navy-dark`
