# GKWorld360 — Project Structure

> **Updated 3 Nov 2026 to match the code.** (The previous version was from 2 Jul 2026, before
> the Hindi site, the redesign, the Atlas and the content pipeline.)

**Audience:** the owner — a beginner developer (moving from QA) who learns from these docs.
**Purpose:** a guide to the project's folders and files: what each one is **for**, and **why it
lives where it does**. It is not a task list (that is `TODO.md`) and not a status report (that is
`PROJECT_CONTEXT.md`).
**The code is the source of truth.** Every file starts with a plain-English comment saying what it
does — if this doc and a file's header comment ever disagree, trust the file and fix this doc.

> **Read this first:** a "folder structure" is just how the project's files are organised into
> folders — like rooms in a house. A good structure means you (and the AI) can always find things
> quickly. This document is the map of the house.

---

# 1. The big picture

GKWorld360 has three parts that live in this one project:

1. **The public website** — the pages visitors read (English at `/…`, Hindi at `/hi/…`).
2. **The admin panel** — `/admin`, where articles, subjects, news, quotes and Atlas entries are
   written and published. This is **Payload CMS**.
3. **Helper tools** — scripts, the content pipeline and small API endpoints that keep the site fed
   with content and fresh headlines.

Where the *content* lives changed a lot since the start:

- **Articles, news, subjects, categories, quotes, Atlas entries, images** → stored in the
  **database** (Neon, PostgreSQL) and edited through Payload at `/admin`. Images are stored in
  **Cloudflare R2** (an online file store).
- **Only a few MDX files remain** in `content/` (the subject and category overview pages). The
  old MDX articles were deleted once the real articles moved into Payload.

> **Jargon:**
> - **CMS** (Content Management System) — an admin website for writing and publishing content
>   without touching code. Ours is **Payload**.
> - **MDX** — a text file format: Markdown (simple formatted text) that can also contain small
>   React components. The site's first articles were MDX files.
> - **Database** — an organised, permanent store of data on a server. Ours is **Neon**, which runs
>   **PostgreSQL**. It has two "branches": `dev` (used by the laptop) and `production` (used by the
>   Vercel site).

---

# 2. The whole project at a glance

```
gkworld360/
│
├── app/                    ← THE ROUTES: every address (URL) the site answers
│   ├── (frontend)/             the public website (English + /hi Hindi)
│   ├── (payload)/              the /admin panel and Payload's own API
│   ├── api/                    site endpoints: Gyaani, ingest, link-preview card, search index
│   └── robots.ts, sitemap.ts, llms.txt/, icon.png, apple-icon.png
│
├── components/             ← THE BUILDING BLOCKS: pieces of the page (header, cards, homepage sections…)
│   ├── pages/                  one component per site page, shared by English + Hindi
│   ├── home/                   the homepage's sections
│   ├── article/                the article reading tools
│   ├── atlas/                  the World360 Atlas
│   ├── cms/                    turning Payload content into pages
│   └── (many single files)     shared pieces used everywhere
│
├── lib/                    ← THE ENGINE ROOM: helper code with no page of its own
│
├── collections/            ← PAYLOAD CONTENT TYPES (Articles, News, Subjects…)
├── blocks/                 ← special boxes an author can insert into an article body
├── fields/                 ← reusable field settings (the slug)
├── payload.config.ts       ← Payload's master settings (database, R2, collections, languages)
│
├── content/                ← the last MDX files (subject + category overview pages)
├── data/                   ← daily-quote.mdx (backup quote if the CMS has none)
├── drafts/                 ← JSON files the content pipeline sends into Payload
├── scripts/                ← small command-line tools (content pipeline, production console)
├── types/                  ← extra TypeScript type information
├── public/                 ← images and files served exactly as they are
├── docs/                   ← the project's long-form documentation
│
├── PROJECT_CONTEXT.md, TODO.md, SERVICES.md, GIT_NOTES.md, IDEAS.md, README.md
├── AGENTS.md / CLAUDE.md   ← instructions for AI assistants working in this repo
└── root config: package.json, next.config.ts, tsconfig.json, postcss.config.mjs,
    eslint.config.mjs, mdx-components.tsx, vercel.json, .gitignore, .env.local (private, never committed)
```

Folders you will see but should **never edit by hand**: `node_modules/` (downloaded packages),
`.next/` and `.next-prod/` (Next.js build output for port 3000 and port 3001), `.git/` (Git's
history). They are created by tools and are listed in `.gitignore` (except `.git/`, which Git
manages itself).

---

# 3. `app/` — the routes (every address the site answers)

**What it's for:** in Next.js's **App Router**, the folders inside `app/` *are* the website's
addresses. A folder called `about/` containing `page.tsx` becomes the page at `/about`. That's why
this folder is special: its layout is dictated by the URLs, not by our taste.

Three Next.js naming rules you'll see:

- **`page.tsx`** = "show a page at this address". **`route.ts`** = "answer this address with data,
  not a page" (an **API endpoint** — a URL that code calls, rather than a person reads).
- **`[slug]`** in square brackets = "any value here" (e.g. `/atlas/<any-slug>`).
  **`[...slug]`** = "any number of path pieces" (a **catch-all**). **`[[...segments]]`** = the same,
  but also matches nothing at all.
- **`(frontend)`** in round brackets = a **route group**. The brackets mean the folder name does
  **not** appear in the URL. Route groups let two areas of one site have completely separate page
  frames — here the public site and the Payload admin each get their own `<html>`. That is why
  there is intentionally **no** single `app/layout.tsx`.

## `app/(frontend)/` — the public website

```
app/(frontend)/
├── layout.tsx            the frame around every public page: fonts, header, footer, Gyaani,
│                         the Light/Dark/Reading mode script, the Hindi welcome strip
├── globals.css           the design tokens (colours, fonts, spacing) and site-wide styles
├── page.tsx              the homepage "/"   (body lives in components/home/HomePage.tsx)
├── [...slug]/page.tsx    THE CATCH-ALL: every subject, category, topic and news write-up,
│                         in English AND Hindi (/history, /history/modern-india/…, /hi/history/…,
│                         /news/<slug>, /hi/news/<slug>)
├── about/ contact/ news/ pulse/ saved/ search/ subjects/ topics/
│                         one folder per site page (each page.tsx is a short wrapper — see below)
├── atlas/page.tsx        /atlas — the World360 Atlas
├── atlas/[slug]/page.tsx /atlas/<slug> — the Atlas with one card open (the shareable link)
├── hi/                   THE HINDI TWINS of the pages above: /hi, /hi/about, /hi/atlas,
│                         /hi/atlas/<slug>, /hi/contact, /hi/news, /hi/pulse, /hi/saved,
│                         /hi/search, /hi/subjects, /hi/topics
├── not-found.tsx         the 404 page (answers in Hindi for a missing /hi/… address)
└── api/
    ├── health/route.ts      /api/health — "is the site really alive?" (checks the database)
    └── pulse/sync/route.ts  /api/pulse/sync — fetches fresh news headlines (called by the crons)
```

**Why the page files are so short.** Since 2 Nov 2026 each page exists in two languages. Instead
of writing every page twice, the page's body lives once in `components/pages/` (or
`components/home/`, `components/atlas/`) and takes a `lang` value (`"en"` or `"hi"`). The files in
`app/(frontend)/` and `app/(frontend)/hi/` are then tiny wrappers that say *which language* to show
plus the page's title and description for search engines.

**Why `hi/` only has some pages.** Hindi subject/category/article pages (`/hi/history/…`) are
handled by the catch-all `[...slug]`. A more specific folder (like `hi/atlas/`) wins over the
catch-all, so only the site's own pages need their own `hi/` folder.

**Why `api/health` and `api/pulse/sync` are inside `(frontend)`** rather than `app/api/`: they
live alongside the public site's routes (to confirm why they were placed here rather than in
`app/api/` — the URLs are the same either way, because `(frontend)` doesn't appear in the URL).

## `app/(payload)/` — the admin panel

```
app/(payload)/
├── layout.tsx                    Payload's own page frame (required by Payload's admin UI)
├── config.ts                     passes on the finished payload.config.ts
├── admin/[[...segments]]/        the /admin panel (page.tsx + not-found.tsx)
├── admin/importMap.js            list of admin-screen components (generated by `npm run generate:importmap`)
└── api/[...slug]/route.ts        Payload's REST API at /api/<collection>/…
```

These files are mostly Payload's standard setup. You rarely change them; you change
`collections/` and `payload.config.ts` instead.

## `app/api/` — the site's own endpoints

| Route | What it does |
|---|---|
| `api/gyaani/route.ts` | The brain of **Gyaani**, the chatbot: sends the question (and the page's article) to Google Gemini, returns the answer; also serves "Quiz me" questions |
| `api/ingest/route.ts` | **Dev-only** door for the content pipeline: the `scripts/` tools POST drafts here. Answers 404 on Vercel. Prints the database host in every reply |
| `api/og/route.tsx` | Draws the 1200×630 **link-preview card** WhatsApp/Telegram/X show when a link is pasted |
| `api/search-index/route.ts` | The full search list as JSON, fetched by the search box the first time it's used |

## Files directly in `app/`

- `robots.ts` → `/robots.txt` (tells crawlers what they may read; blocks everything while indexing is OFF — see `lib/site.ts`).
- `sitemap.ts` → `/sitemap.xml` (the list of every page, for search engines).
- `llms.txt/route.ts` → `/llms.txt` (a plain-text guide to the site for AI answer engines).
- `icon.png`, `apple-icon.png` → the browser-tab and phone home-screen icons.

---

# 4. `components/` — the building blocks

**What it's for:** a **component** is a reusable piece of a page (a header, a card, a button)
written once and used in many places. Keeping them here, apart from `app/`, means a page file only
has to *arrange* pieces, not build them.

Subfolders appeared only when a group of pieces got big enough to deserve a room of its own:

| Folder | What it holds |
|---|---|
| `components/pages/` | **One component per site page**: `AboutPage`, `ContactPage`, `NewsPage`, `PulsePage`, `SearchPage`, `SubjectsPage`, `TopicsPage`. Each takes `lang` and is shared by the English page and its `/hi` twin |
| `components/home/` | The homepage: `HomePage.tsx` (the whole page, takes `lang`) and its sections — `HeroEarth` (3D Earth), `HeroScrollFx`, `HeadlineTicker`, `SubjectBento`, `TopicPosters`, `PosterPin`, `TodaysPractice`, `QuickQuiz`, `PlaceMap`, `KnowMoreBand`, `RecentAndNews` |
| `components/article/` | The article reading tools: `ArticleTools`, `ReaderSettings`, `ReadingMode`, `PhoneReadingBar`, `Sheet` (phone slide-up panel), `AlsoInHindi` |
| `components/atlas/` | The World360 Atlas: `AtlasPage` (server side: data + page settings), `AtlasExplorer` (the interactive globe/timeline), `AtlasTeaser` (homepage section), `OnTheMap` (box at the end of an article), `atlas.css` |
| `components/cms/` | Turning Payload content into pages: `CMSTopicView` (an article), `CMSNewsView` (a news write-up), `CMSRichText` (turns Payload's stored rich text into HTML) |

The **single files directly in `components/`** are pieces shared across the whole site. Roughly:

- **Site frame:** `Header`, `Footer`, `FooterBody`, `PhoneTabBar`, `Logo`, `ThemeToggle`, `ModeFallback`, `LanguageToggle`, `LangSwitch`, `HindiWelcome`, `Gyaani` (the chatbot window).
- **Loading & effects:** `PageCurtain` (the water-word page loader), `NavigationLoader`, `BookLoader`, `ScrollReveal`, `PointerFx`, `CountUp`, `EarthWord`, `ReadingProgress`.
- **Cards & lists:** `ArticleCard`, `ContentCard`, `SubjectCard`, `TopicCard`, `NewsCard`, `CategoryPath`, `SavedList`, `SearchBox`, `SearchResults`, `LatestHeadlines`, `LatestHeadlinesSection`, `HeadlineRow`, `HeadlineThumb`.
- **Article pieces:** `ArticleLayout`, `ArticleHeader`, `Breadcrumb`, `TableOfContents`, `TopicNav`, `KeyTakeaways`, `QuickFacts`, `TopicImage`, `NewsArticleView`, `ShareButton`, `ReadLaterButton`, `ReadLaterPeek`, `ReadTick`.
- **Small UI parts:** `Button`, `Select`, `SortToggle`, `StatPill`, `Toast`, `ConfirmDialog`, `PageTitle`, `SectionHead`, `TimeAgo`, `NotFoundBody`, `JsonLd` (hidden structured data for search engines).

> The project rule is: split a crowded folder into subfolders only when it actually becomes hard to
> navigate. The flat root of `components/` is now large (~60 files), so grouping more of it may be
> a future tidy-up — but only if it starts to hurt.

---

# 5. `lib/` — the engine room

**What it's for:** helper code that does work but has no page of its own — reading the database,
fetching headlines, building SEO tags, holding the words for each language. Keeping it out of page
and component files keeps those files short and readable.

Two words that matter here:
- **Server only** — code that runs on the server, never in the visitor's browser (because it uses
  secrets or the database).
- **Browser only / client** — code that needs a real screen (canvas, localStorage).
  A file named `…-shared.ts` holds the parts both sides need, with no database imports.

| Group | Files | What they do |
|---|---|---|
| **Content from the CMS** | `cms.ts` | The bridge to Payload: queries the database directly from server code ("Local API") |
| | `topics.ts` | One list of every topic (for Popular / Recently Added and `/topics`) |
| | `refresh.ts` | When content is saved in `/admin`, throws away the cached copies so changes show at once |
| | `ingest.ts` | Turns a bilingual draft JSON (from `drafts/`) into a Payload **draft** article; also Hindi additions, images, Atlas entries, text fixes. Called by `app/api/ingest` |
| **Older MDX helpers** | `content.ts`, `news.ts` | Read MDX files in `content/`. `content.ts` still serves the overview pages; `news.ts` looks for `content/news/…`, which no longer exists — CMS news comes from `lib/cms.ts` and is merged in by the pages (e.g. `components/pages/NewsPage.tsx`). Whether `news.ts` can be retired is to confirm |
| **Headlines ("Pulse")** | `pulse.ts`, `pulse-sources.ts` | `pulse.ts` fetches trusted RSS news feeds (English + Hindi papers) and stores 7 days of headlines; `pulse-sources.ts` holds browser-safe source logos and colours |
| **AI** | `gemini.ts` | The one door to Google Gemini (server only — uses the secret key) |
| | `gyaani-guard.ts` | Gyaani's guardrails: what he may talk about, rate limits, mode switch |
| | `quiz.ts`, `quiz-shared.ts` | The **quiz maker**: `quiz.ts` asks Gemini to turn our own article text into questions; `quiz-shared.ts` is the one shape of a quiz question used everywhere |
| **Today's homepage pieces** | `daily.ts`, `quote.ts` | `daily.ts`: the quick quiz, fact and place of the day (from facts already on the site). `quote.ts`: picks today's quote |
| **Words in two languages** | `site-text.ts`, `use-site-text.ts`, `home-text.ts`, `page-text.ts`, `lang.ts` | "Word files": every word on the header/footer (`site-text`), homepage (`home-text`) and other pages (`page-text`), in English and Hindi. Layout lives in components; words live here. `lang.ts` remembers the reader's language choice |
| **World360 Atlas** | `atlas.ts`, `atlas-shared.ts`, `atlas-globe.ts`, `atlas-earth-layer.ts` | Reading entries from the database (`atlas.ts`), shared shapes and labels (`atlas-shared.ts`), the turning globe and the realistic Earth under it (browser only) |
| **3D Earth & loaders** | `earth-scene.ts`, `earth-support.ts`, `globe-loader.ts`, `water-word.ts` | The homepage 3D Earth (three.js), "can this device run it?", the Earth skeleton loader, the water-filling page-name loader |
| **Search** | `search.ts`, `search-rank.ts` | Building the search list (server) and ordering results (shared) |
| **SEO & site settings** | `site.ts`, `og.ts`, `site-stats.ts` | Site URL and the indexing ON/OFF switch (`site.ts`), link-preview card URLs (`og.ts`), the real live numbers shown on the site |
| **Look & subjects** | `mode.ts`, `use-mode.ts`, `subjects.ts`, `subject-colors.ts`, `image-style.ts` | Light/Dark/Reading mode, the subject list and colours, the house style for image prompts |
| **Small browser hooks** | `use-stored.ts`, `use-saved.ts`, `use-presence.ts`, `use-hide-on-scroll.ts`, `reading.ts`, `view-transition.ts` | A **hook** is a React function starting with `use…` that gives a component a piece of live state (saved items, scroll direction, closing animations, reader settings) |
| **Dates** | `date-utils.ts`, `time-ago.ts` | Formatting dates and "28m ago" in English or Hindi |

---

# 6. Payload CMS: `collections/`, `blocks/`, `fields/`, `payload.config.ts`

**What they're for:** together they describe *what kinds of content exist* and how the admin
panel edits them. Payload reads these files and builds both the database tables and the `/admin`
screens from them — so adding a field here adds it to the database and the admin form.

> **Jargon — collection:** a **collection** is one type of content, like a table in a spreadsheet
> where each row is one item. "Articles" is a collection; each article is one entry in it.

| File | Collection / purpose |
|---|---|
| `collections/Articles.ts` | The topic pages — the heart of the site. Belongs to a Subject and optionally a Category. English + Hindi, Draft/Publish |
| `collections/News.ts` | Current-affairs write-ups (dated; shown under `/news`) |
| `collections/Subjects.ts` | Top level: History, Geography… (name, icon, cover, colours, homepage order) |
| `collections/Categories.ts` | The optional middle level (e.g. Modern India under History) |
| `collections/AtlasEntries.ts` | The dots on the World360 Atlas — one event, one place, one date, linked to an article |
| `collections/Quotes.ts` | Quote of the day (can be pinned to a date) |
| `collections/Headlines.ts` | A **cache** of RSS news headlines (7 days). Filled automatically, hidden from the admin sidebar |
| `collections/Media.ts` | Uploaded images (files go to Cloudflare R2) |
| `collections/Users.ts` | Who can log in to `/admin` |
| `blocks/KeyTakeaways.ts`, `blocks/TopicImage.ts` | **Blocks**: special boxes an author inserts into an article body (a takeaways box, a captioned image) |
| `fields/slug.ts` | The shared **slug** field — the permanent, URL-safe part of an address, e.g. `revolt-of-1857`. Defined once so every collection follows the same rules |
| `payload.config.ts` | The master settings: which database, R2 image storage, the list of collections, English + Hindi |

**Why these live at the project root, not inside `app/`:** they are not pages or routes, so they
don't belong in `app/`. Payload's convention is to keep its config and collections at the top level,
where both the admin (`app/(payload)/`) and the site's helpers (`lib/cms.ts`) can import them.

---

# 7. Content, drafts and scripts

## `content/` — the last MDX files

```
content/
├── biology/overview.mdx
├── chemistry/overview.mdx
├── famous-personalities/overview.mdx
├── geography/overview.mdx
├── history/overview.mdx
├── history/modern-india/overview.mdx
└── physics/overview.mdx
```

Only subject and category **overview** pages remain here. All real articles now live in Payload.
`data/daily-quote.mdx` is the backup quote used if the Quotes collection is empty.

## `drafts/` — files waiting to go into Payload

JSON files written during the **content pipeline** (book photos → facts → original bilingual
article → JSON draft → `scripts/` sends it to Payload as a DRAFT → the owner reviews and publishes
in `/admin`). The file name tells you what it is:

- `<slug>.json` — a new article draft (English + Hindi)
- `<slug>.hi.json` — a Hindi version for an existing article
- `<slug>.images.json` — images to place in an article
- `<slug>.export.json` — an article exported from one database to import into the other
- `atlas-catch-up.json`, `quotes.json`, `ncert-fixes-2026-10-29.json` — Atlas entries, quotes, NCERT text corrections

The full pipeline and its rules are in `docs/GKWORLD360_CONTENT_PIPELINE.md`.

## `scripts/` — small command-line tools

Run with `node scripts/<name>.mjs …`. Almost all of them **need the dev server running**, because
they POST to `/api/ingest` inside it (Payload's loader doesn't work from a plain script under
Node 26 — see PROJECT_CONTEXT.md). Add `--production` to send to port 3001 (the production
database) instead of port 3000 (dev). Each one prints the database host so you can see which one
you touched.

| Script | What it does |
|---|---|
| `create-article-draft.mjs` | Sends a draft from `drafts/` into Payload as a DRAFT |
| `add-hindi.mjs` | Adds a Hindi version to an existing article |
| `add-images.mjs` | Uploads images and places them in an article |
| `create-atlas-entries.mjs` | Creates Atlas entries (skips ones that exist; `--replace` remakes drafts) |
| `add-quote.mjs` | Adds quotes |
| `fix-text.mjs` | Swaps exact sentences in existing articles (e.g. NCERT date fixes) |
| `write-prompts.mjs` | Fills the "Image prompts" box for articles |
| `export-article.mjs` / `import-article.mjs` | Copy an article from one database to the other |
| `publish-article.mjs` | Publishes an article by id (repairs only — publishing is normally the owner's click) |
| `delete-article.mjs` | Deletes one article by id |
| `telegram-inbox.mjs` | Downloads book-page photos sent to the Telegram bot into `~/Desktop/gk-inbox/` (outside the project) |
| `dev-prod.mjs` | Run by `npm run dev:prod`: starts a second dev server on **port 3001** pointed at the **PRODUCTION** database, with its own build folder `.next-prod/` |

---

# 8. Everything else

| Item | What it's for |
|---|---|
| `public/` | Files served exactly as they are. `public/brand/` = logos, app icons, share image, Earth pictures; `public/earth/` = Earth textures for the 3D globe; `public/images/` = subject, category, topic, news, quote-author and news-source images. (Stray screenshots / AI test images in `public/images/` are git-ignored and not used.) |
| `types/react-canary.d.ts` | Tells TypeScript about React's newest features (like `<ViewTransition>`). Only read by TypeScript, never sent to the browser |
| `docs/` | Long-form docs: Master Blueprint (vision), Tech Foundation, this file, Setup Guide, Design System, Content Pipeline, Paid Features Plan (3 Nov 2026 — planning only) |
| `PROJECT_CONTEXT.md` | Current status and handoff notes — read its START HERE block first |
| `TODO.md` | THE task list (Now / Next / Later / Done) |
| `SERVICES.md` | Third-party services and billing |
| `GIT_NOTES.md` | Git concepts learned, in plain English |
| `IDEAS.md` | Parking lot for undecided ideas |
| `README.md` | The short front-door summary |
| `AGENTS.md`, `CLAUDE.md` | Instructions for AI assistants (e.g. "this Next.js version has breaking changes — read its bundled docs") |
| `package.json` | The project's packages and its commands (`npm run dev`, `npm run dev:prod`, `npm run build`…) |
| `next.config.ts` | Next.js settings: MDX support, Payload connection, build folder (`.next` or `.next-prod`), image library fix for Vercel |
| `mdx-components.tsx` | Required by Next.js for MDX: maps Markdown headings/paragraphs to styled components |
| `tsconfig.json` | TypeScript settings (incl. the `@/` shortcut that means "project root" in imports) |
| `postcss.config.mjs`, `eslint.config.mjs` | Tailwind CSS processing and code-style checking |
| `vercel.json` | Vercel settings: a daily cron (scheduled job) that calls `/api/pulse/sync`. (A second, 2-hourly cron runs on cron-job.org — outside the repo) |
| `.env.local` | **Private** keys and database addresses. Never committed (`.gitignore` blocks all `.env*` files) and never pasted into docs |
| `.github/workflows/` | Exists but is empty (no GitHub Actions set up) |

---

# 9. Folder rules (still valid from the original plan)

The original MVP plan (June–July 2026) imagined a much smaller project: MDX articles in
`content/`, no database until "Login", a `prisma/` folder later. Reality changed — Payload and Neon
arrived early, the database layer is Payload's built-in one (Drizzle under the hood, no `prisma/`),
articles moved into the CMS, and the site became bilingual. The old file trees were removed from
this doc because they no longer matched the code. **The rules behind them still hold:**

1. **Create a folder only when a real file needs a home.** Never "just in case". No empty folders.
2. **Keep structures shallow.** Two or three levels beat five or six.
3. **One purpose per folder.** If you can't say in one sentence what a folder is for, it probably
   shouldn't exist.
4. **Use clear, plain names.** `pages/`, `home/`, `article/` — names a beginner can understand.
5. **Refactor only when complexity actually appears.** `components/pages/`, `components/home/`,
   `components/article/` were created exactly that way — when a group of files got big enough.
6. **Grow by adding beside, not rebuilding.** New features arrive as new folders next to the old
   ones (the Atlas, the Hindi `hi/` pages, the quiz maker in `lib/`) without moving what exists.
7. **Keep design separate from content.** Layout lives in components + `globals.css`; words live
   in the `lib/*-text.ts` word files; content lives in Payload. A redesign must never break content,
   slugs (URLs) or SEO. Slugs are permanent.

## In one sentence

**`app/` decides the addresses, `components/` builds the pieces, `lib/` does the background work,
Payload's `collections/` define the content, and the content itself lives in the database — with
small, clearly named folders that only appear when a real file needs them.**
