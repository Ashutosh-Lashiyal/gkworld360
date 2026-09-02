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

# 🔴 START HERE — status as of 1 Sep 2026

**BLOCKED WAITING ON NEON SUPPORT. Nothing to fix in this codebase.**
Read this block before doing anything else. Full detail is in the
"⚠️ Incident — Neon data-transfer quota exhausted" section further down this file.

### ⛔ CURRENT BLOCKER (1 Sep 2026) — Neon quota block is STUCK

The August quota reset **did** happen, but the database is **still refusing every
connection**. This is a Neon-side fault, not ours:

- Neon dashboard shows `Usage since Sep 1, 2026`, Network transfer **0 / 5 GB**, status **All OK**
- Yet every connection — pooled AND direct, from Vercel AND from a local machine —
  fails with `53000 — Your project has exceeded the data transfer quota`
- The branch was **archived** after ~18 days idle. Unarchiving from the Neon SQL Editor
  stalls forever at *"Compute is starting up. Reconnecting automatically"*; the compute
  never becomes available.
- Neon's own AI assistant confirmed this is **"inconsistent with documented behavior"** —
  quota suspension is supposed to lift at the billing-cycle reset.

**Action taken 1 Sep 2026:** posted in the **Neon Discord #help channel**
(https://discord.gg/neon) asking them to clear the stuck quota block. Free tier has no
human ticket support, so Discord is the channel.

### 📅 AGREED PLAN (decided 2 Sep 2026)
- **Check once a day** whether the block has lifted. Quickest test — either open
  https://gkworld360.vercel.app/api/health (200 = back, 503 = still blocked), or run a
  direct connection test with `pg` using `DATABASE_URL` from `.env.local`.
- **Bump the Discord thread** if there is no reply after a day or two.
- **DEADLINE: 8 September 2026.** If Neon has still not fixed it by then,
  **abandon the stuck project and create a NEW Neon project** (see the fallback plan below).
  Do not wait longer than this.

**Status log:**
- 1 Sep — quota reset confirmed on the dashboard, but connections still fail. Discord posted.
- 2 Sep — re-checked, still `53000`. Both pooled and direct. No change.

### 🔄 FALLBACK PLAN — if Neon does not fix it by 8 Sep
Create a **new Neon project** (a new *branch* will NOT work — the block is project-level,
and Backup & Restore needs a working compute, which is the broken part).

1. New project in the Neon console → copy both connection strings
2. Update `DATABASE_URL` + `DATABASE_URL_DIRECT` in `.env.local` AND in Vercel
3. Redeploy — **Payload recreates all its tables automatically** on first boot
4. Create the admin user again
5. Re-enter the "Smart Border Project" news item (the ONLY unrecoverable content —
   everything else lives in `content/*.mdx`, which is in git)
6. Headlines refill automatically within ~30 minutes via the cron

Takes ~30–45 min. **Do NOT delete the old project** — if Neon fixes it later the data is
still there. Caveat: usage is metered per *organisation*, so there is a small chance a new
project inherits the block; we would know within five minutes. If so, the next option is a
different provider (Supabase free tier).

### ⚠️ BIGGEST LESSON FROM THIS INCIDENT — WE HAVE NO BACKUPS
We escaped lightly ONLY because all real content still lives in `content/*.mdx` in git.
**Once Phase 5 deletes those files, the database becomes the single copy of the whole site** —
and this exact situation would then mean total content loss with no way to export, because
you cannot connect to a suspended project.

Neon's own "Backup & Restore" does not help here: it lives *inside* Neon, and Neon is what
locked us out. **A backup only your provider can hand you is not a backup.**

**REQUIRED BEFORE PHASE 5:** a scheduled `pg_dump` export written somewhere OUTSIDE Neon
(Cloudflare R2 — already owned — or a private git repo). Weekly is enough at this scale.
Also consider upgrading to a paid plan once the content is large enough that retyping it
would be painful; paid plans do not suspend this way.

Identifiers for any follow-up:
`project orange-poetry-31408334` · `branch br-blue-rain-ao9w7vvg` · `endpoint ep-sweet-tree-ao0sqfwp` · AWS ap-southeast-1

**Do NOT try to fix this in code — there is nothing wrong with the code.** Also do not run
the Neon "reset quota via API" suggestion their bot offers: its sample *sets* new
`active_time_seconds`/`compute_time_seconds` quotas rather than clearing anything, and could
cause a second suspension. It also targets user-configured project quotas, which we never set.

### One-line summary of how we got here
Neon's free plan allows **5 GB/month network transfer**. We used 5.53 GB and the database
locked us out on **14 Aug 2026**. Code fixes are deployed; the public site is live and
serving readers, but `/admin` is down and the query fixes remain unverified.

### Data is safe
An archived branch is cold storage, not deletion. The dashboard reading `Storage 0 / 0.5 GB`
is the "not updated for inactive projects" artifact it warns about — the ~42 MB is intact.

### Current state (all code committed and deployed to `main`)

| Thing | State |
|---|---|
| Public site (`/`, `/pulse`, `/news`, articles) | ✅ Working — headlines served from live RSS via fallback |
| `/admin` | ❌ 500 — needs the database, expect recovery 1 Sep |
| `/api/health` | ✅ Working, returns **503** + the real Neon error |
| `/api/pulse/sync` | ✅ Locked with `CRON_SECRET` (401 without it) |
| UptimeRobot | ✅ Watching `/api/health` every 5 min, emails on state change |

### ▶️ DO THIS ONCE NEON UNBLOCKS THE PROJECT (not before — see the blocker above)
1. **Easiest signal:** wait for the UptimeRobot email *"GKWorld360 database is UP"*.
   It watches `/api/health` every 5 min and only emails on a state CHANGE, so silence
   means nothing has changed yet — that is correct behaviour, not a broken monitor.
2. Check `/api/health` → should be **200** `"database":"reachable"`.
3. Open `/admin` → should show the login screen, not a 500.
4. **⭐ THE IMPORTANT ONE — watch Neon usage for 2–3 days.**
   Target ≈ **25 MB/day**. August ran at ~390 MB/day.
   Check at [console.neon.tech](https://console.neon.tech) → project → Usage/Billing.
   **This is the ONLY fix from 28 Aug that is still UNVERIFIED** — no successful query has
   ever run through the new `select` code, because the database has been locked the whole
   time. The ~15× saving is arithmetic, not measurement. If usage climbs much faster than
   ~25 MB/day, the query fixes are not working and need re-investigation.
5. Check cron-job.org → **History** tab: runs should turn from `500` to `200`.
6. `/pulse` will look near-empty at first — expected. The 7-day prune deletes everything
   stored before the outage, and it refills over the following days.

### Then resume normal work
**Payload CMS migration, Phase 4** — the `/news` listing, subject/category pages, search and
Hindi still read from MDX and need wiring to the CMS. That work needs `/admin`, so it has
been blocked since 14 Aug.

### Three things that caused the outage (they were INDEPENDENT — this took hours to unpick)
1. **Neon transfer quota** — over-fetching queries (2,000 full rows to read one column;
   300 rows to show 6) plus **two crons running at once**.
2. **No error handling in `lib/cms.ts`** — a database error crashed `next build`, so the
   site could not be deployed at all while the DB was down.
3. **`sharp`/libvips missing from the Vercel bundle** — crashed Payload on boot,
   completely unrelated to the database. Fixing the DB alone would NOT have fixed `/admin`.

### Hard-won lessons (do not re-learn these)
- **A green `200` proves nothing.** The site looked healthy for two weeks while its database
  was dead — Vercel was serving 12-day-old cached HTML (`x-vercel-cache: STALE`). Check
  `/api/health`, not the homepage.
- **Every route touching one library failing with an HTML 500 in under a second** = a
  module-load/import crash, not a query or timeout. **Go to the Vercel runtime logs
  immediately** rather than probing from outside. That one log line named `sharp` and saved
  hours of wrong guesses.
- **Crons run 24/7 whether or not you are working.** If you replace one, DELETE the old one.

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
| Headlines stale for hours on PROD (low traffic → no visit-triggered refresh; Hobby cron is daily-only) | ✅ Fixed 20 Jul | **PRIMARY = cron-job.org** (free external cron) pings `GET /api/pulse/sync` every 15 min, 24/7 — verified firing automatically. We first tried a GitHub Actions cron (`.github/workflows/pulse-refresh.yml`, reads `vars.PULSE_SYNC_URL`) but GitHub's scheduler is best-effort and never fired the `*/15` on its own (it works when triggered manually) — kept only as a bonus backup. Custom-domain switch later = update the URL in cron-job.org (+ the GitHub variable) |
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
| **Neon** | PostgreSQL database (stores articles, metadata) | 0.5 GB storage · ~191 CU-hrs · **5 GB/month network transfer** | $19/month | No |
| **Cloudflare R2** | Stores image files | 10 GB storage, 1M requests/month | $0.015/GB | **YES** |
| **Google AI Studio** | Powers Gyaani chatbot (Gemini 2.5 Flash) | 15 RPM, limited daily | Pay-as-you-go | No |
| **GitHub** | Stores code (version control) | Unlimited public repos | Free | No |
| **cron-job.org** | Calls `/api/pulse/sync` every 30 min to refresh headlines | Free | Free | No |
| **UptimeRobot** | Checks `/api/health` every 5 min, emails on state change | 50 monitors, 5-min checks | Free | No |

⚠️ **Neon's limit that actually matters is NETWORK TRANSFER (5 GB/month), not storage.**
Storage has never gone above ~42 MB. Transfer is what caused the 14 Aug 2026 outage.
Full detail in `SERVICES.md`.

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

## ⚠️ Incident — Neon data-transfer quota exhausted (14 Aug 2026)

**Symptom:** `https://gkworld360.vercel.app/admin` returned HTTP 500. So did every Payload
API route (`/api/users/me`, `/api/articles`, `/api/media`). Public pages still returned 200
— but only because Vercel was serving **12-day-old stale HTML** (`x-vercel-cache: STALE`).
When an ISR background rebuild fails, Next.js keeps serving the last good copy, so the
outage was invisible on the front end for two weeks.

**Root cause:** Neon free plan allows **5 GB/month network transfer**. We used 5.53 GB
between 1–14 Aug and the database began refusing all connections
(`53000 ... exceeded the data transfer quota`). Compute (67.99 CU-hrs) and storage
(42 MB) were both well within limits — transfer alone was the problem.

**Why transfer was so high (~390 MB/day):**
- `lib/pulse.ts` fetched **2,000 full headline rows (~3 MB)** on every sync just to read
  the `link` column for de-duplication.
- Two crons were running: the GitHub Actions workflow (~35×/day) **and** cron-job.org
  (~96×/day, every 15 min). The GitHub one was never switched off when cron-job.org
  was added.
- The homepage teaser fetched **300 rows to display 6**.

**Timeline:** cron added 20 Jul → 414 successful runs → last success 14 Aug 23:52 UTC →
100% failures since. Quota window resets **1 Sep 2026**.

**Fixes applied (28 Aug 2026):**
- `lib/pulse.ts` de-dupe query → `select: { link: true }` (one column, not all)
- `getStoredHeadlines(limit)` → fetches only what the caller shows (6, not 300) + `select`
- `getHeadlinesPage` → `select` for displayed columns only
- Deleted `.github/workflows/pulse-refresh.yml` (the duplicate, permanently-failing cron)
- Added **`/api/health`** — hits the DB on every request, returns **503** when it's
  unreachable, so this can never hide behind a stale cache again

Estimated result: ~390 MB/day → **~25 MB/day**.

### Follow-on: the site was UNDEPLOYABLE during the outage — now fixed

Setting `CRON_SECRET` in Vercel needs a redeploy to take effect, but **the redeploy failed**:
`next build` prerenders the `revalidate = 60` pages, each one queried Payload, Neon threw,
and the whole deployment aborted (`Error occurred prerendering page /history/...`).
A failed build does not replace the live deployment, so nothing took effect.

**Cause:** `lib/cms.ts` had **no error handling at all**. It returned `null` for
"article not in CMS" (→ MDX fallback), but a thrown *database* error propagated and
crashed the render. "Not found" was handled; "broken" was not.

**Fix:** wrapped all five database read paths so an unreachable DB is treated like
"not found", falling back to MDX:
- `getCMSArticle`, `getCMSNews` → `null` on error
- `getCMSNewsList` → `[]` on error
- `lib/pulse.ts` `getStoredHeadlines` → `[]` on error (caller then uses live RSS feeds)
- `lib/pulse.ts` `getHeadlinesPage` → empty page on error

All log loudly via `console.error`; `/api/health` reports the real error. Nothing is
silently swallowed.

**Verified 28 Aug 2026 with the database still down:** `npm run build` **succeeds**
(29/29 static pages generated, `BUILD_ID` written, `physics.html` = 29 KB of real content,
zero error markers). This also closes pre-flight checklist item 2, which had never been
tested with Payload installed.

⚠️ **Note for Phase 5:** this safety net falls back to the MDX files. Once Phase 5 deletes
`content/`, there is nothing left to fall back to — a DB outage would then mean no articles.
`/api/health` + a real uptime monitor become the safeguard at that point.

### SECOND, UNRELATED BUG: `sharp` / libvips missing on Vercel (28 Aug 2026)

**This is a separate problem from the Neon quota** — they merely surfaced at the same time,
which made diagnosis confusing. Fixing the database would NOT have fixed this.

**Symptom:** every Payload route returned HTTP 500 as **HTML** (not JSON) — `/admin`,
`/api/articles`, `/api/users/me`, and even the new `/api/health`. Static prerendered pages
(`/about`, `/news`, `/physics`) were fine. Failures happened in <1s, so not a timeout.
Clearing Vercel's build cache changed nothing.

**Real error (from Vercel runtime logs — worth fetching early next time):**
```
Failed to load external module sharp-…: Could not load the "sharp" module using
the linux-x64 runtime. ERR_DLOPEN_FAILED: libvips-cpp.so.8.18.3: cannot open
shared object file: No such file or directory
```

**Cause:** `payload.config.ts` imports `sharp` for image resizing. Next.js auto-externalises
`sharp` (it's on Next's built-in external list), so it is `require`d from `node_modules`
inside the deployed function rather than bundled. Vercel's file tracer decides what to copy
by **reading import/require statements** — but sharp's platform package loads libvips via
**`dlopen`**, a runtime call static analysis cannot see. So libvips was never copied into the
function, and Payload crashed at *import* time — which is why no `try`/`catch` in any handler
could catch it, and why the response was Next's HTML error page instead of JSON.

Note this is a **bundling** problem, not an install problem: the lockfile correctly pins
`@img/sharp-linux-x64@0.35.3` and `@img/sharp-libvips-linux-x64@1.3.2`.

**Fix:** `outputFileTracingIncludes` in `next.config.ts` forces `./node_modules/@img/**`
into every function bundle. Verified locally by inspecting the build's trace file
(`.next/server/app/(frontend)/api/health/route.js.nft.json`): it now includes
`@img/sharp-libvips-darwin-arm64/lib/libvips-cpp.8.18.3.dylib` — the macOS twin of the
missing Linux `.so`, same version. On Vercel the glob resolves to the Linux binaries.

**Lesson:** when every route that touches one library fails with an HTML 500 in under a
second, suspect a **module-load/import crash**, not a query or timeout — and go to the
runtime logs immediately rather than probing from outside.

**VERIFIED LIVE after deploy (28 Aug 2026):**
| Route | Result |
|---|---|
| `/api/health` | **503 + JSON** with the real Neon quota message ✅ (was HTML 500) |
| `/` | **200**, fresh (`age: 0`), live RSS headlines via fallback ✅ |
| `/pulse` | **200** ✅ |
| `/api/pulse/sync` without secret | **401 `{"error":"unauthorized"}`** ✅ — `CRON_SECRET` lock confirmed working |
| `/api/articles` | 500 `"error initializing Payload"` — Neon only, expected until 1 Sep |
| `/admin` | 500 — needs the DB; expected until 1 Sep |

Payload now boots correctly. Everything still failing is the Neon quota alone.

**Dashboard work — DONE 28 Aug 2026:**
- ✅ `CRON_SECRET` set in Vercel (Production) and as the `Authorization: Bearer …` header
  in cron-job.org. Verified live: no secret → `401`, wrong secret → `401`.
  (Before this, `/api/pulse/sync` was publicly callable by anyone, and each call cost
  ~10 outbound fetches plus a DB read.)
- ✅ cron-job.org slowed from every 15 min to every 30 min.

**Monitoring — set up 28 Aug 2026:**
- ✅ **UptimeRobot** watches `/api/health` every 5 minutes and emails on state change.
  This is now the early-warning system; it is what was missing when the 14 Aug outage
  hid behind a stale cache for two weeks. Verified working (correctly reporting DOWN).
- Note: a new/edited monitor starts in an "up" state before its first real check, which
  can produce a harmless **down → up → down** email burst. Confirmed on 28 Aug that the
  endpoint itself was rock-steady: 12/12 polls returned `503`, identical error,
  `x-vercel-cache: MISS` (never cached). The flapping was UptimeRobot bookkeeping.

**Still open — ON 1 SEPTEMBER 2026 (quota reset):**
0. **Easiest signal: wait for the UptimeRobot "GKWorld360 database is UP" email.**
   It should arrive on its own and then stay quiet.
1. Check `/api/health` → should flip from **503** to **200** `"database":"reachable"`.
2. Open `/admin` → should show the login screen instead of a 500.
3. **Watch the Neon usage graph for 2–3 days.** Target ≈ **25 MB/day**
   (August ran at ~390 MB/day). This is the ONLY part of the fix still unverified —
   no successful query has yet run through the new `select` code paths, so the
   15× saving is arithmetic, not measurement.
4. Check cron-job.org → **History** tab: runs should turn from `500` to `200`.

**`/pulse` LIVE-FEED FALLBACK (built 28 Aug 2026)**

Both reader paths now survive a database outage:
- Homepage teaser (`getLatestHeadlines`) — already had a live path.
- `/pulse` archive (`getHeadlinesPage`) — **added 28 Aug**. Previously it returned an empty
  page, so during the outage the homepage showed headlines while `/pulse` showed "0 headlines".

The fallback obeys **the same 7-day rule the page promises its readers** ("Headlines stay
here for about 1 week") — the fallback must follow the page's stated contract, just with a
different data source. It de-duplicates by `link`, sorts newest-first, paginates 50/page in
memory, and clamps out-of-range `?page=` values.

**Verified 28 Aug 2026 against the live outage** (production build, database refusing
connections): `/pulse` → **HTTP 200, 762 headlines, 16 pages, ~1s**. Page 1 and 2 each
showed 50 distinct articles; `?page=999` clamped to the last page (12 articles = 762−750).
Server log confirmed `[pulse] /pulse served from LIVE feeds: 762 headlines, 16 pages`.

**Measurement note:** the feeds carry ~1,120 items, ~760 within 7 days (Indian Express
serves 200 per feed). An old comment in `lib/pulse.ts` claimed RSS "only keeps the last day
or two" — that was outdated and has been corrected. The fallback is a genuinely full
archive, not a stub.

**Cost:** during an outage `/pulse` makes 10 RSS fetches per visit (it is `force-dynamic`,
so no caching). Acceptable for a rare fallback; it is not the normal path.

**⚠️ The fallback CANNOT guarantee the 7-day window — and this is why the database store
exists.** It filters to items *published* within 7 days, but nothing is stored, so you only
ever see what publishers currently list. Measured 28 Aug 2026:

| Feed | Items | Reaches back |
|---|---|---|
| **The Hindu / National** | 60 | **0.1 days (~2 hours)** |
| The Hindu / International | 60 | 1.5 days |
| The Hindu / Sci-Tech | 60 | 2.4 days |
| The Hindu / Sports | 60 | 2.9 days |
| The Hindu / Business | 60 | 3.0 days |
| Indian Express / Sports | 200 | 8.2 days |
| Indian Express / National | 200 | 8.3 days |
| LiveMint / Business | 35 | 10.3 days |
| Indian Express / International | 200 | 20.1 days |
| Indian Express / Sci-Tech | 200 | 29.5 days |

So in fallback mode headlines can vanish **before** 7 days (a Hindu National story rolls off
within hours), and the mix skews heavily towards Indian Express. **Do not conclude from the
healthy-looking ~760 count that the live feeds could replace the database** — they cannot.
Storing headlines is what converts "whatever the publisher still lists" into a guaranteed
7-day archive.

**Read Later is unaffected by all of this.** `ReadLaterButton` saves the WHOLE headline
object into browser `localStorage` (`{ ...headline, savedAt }`), not a database ID — so
bookmarking works identically on stored and live-fallback headlines, survives the outage,
and survives the 7-day prune. That is exactly what the page promises readers.

⚠️ **After any long outage, `/pulse` starts near-empty once the DB returns.** Each sync
prunes anything older than 7 days, so everything stored before the outage is deleted and the
window refills over the following days. Expected behaviour, not a fault.

**Note:** `/pulse` cannot be ISR-cached — it reads `searchParams` (`?page=N`), which is a
runtime API that forces dynamic rendering. Confirmed in `node_modules/next/dist/docs/`.
Its queries were made lean via `select` instead.

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
