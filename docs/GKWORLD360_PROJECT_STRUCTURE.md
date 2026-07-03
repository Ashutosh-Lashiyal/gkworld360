# GKWorld360 — Project Structure

**Source of truth:** `docs/GKWORLD360_MASTER_BLUEPRINT.md` and `docs/GKWORLD360_TECH_FOUNDATION.md`
**Audience:** a non-technical solo founder building with AI assistance
**Purpose:** define the project's folder structure, explain why each folder exists, and set rules that keep the project simple and clutter-free as it grows.

> **📌 Doc status (updated 2 Jul 2026):** Reference doc. The **"Current Structure"** section
> immediately below reflects the project as it is *today*. The diagrams further down (originally
> written for the MVP plan) predate the Payload migration — their **philosophy and folder rules
> are still valid**, but for the live layout trust the section below and `PROJECT_CONTEXT.md`.

---

# Current Structure (as of 2 Jul 2026)

Since the original plan, two big things changed: we adopted **Payload CMS** (so there's now a
database + admin panel) and split `app/` into two **route groups** — `(frontend)` for the public
site and `(payload)` for the admin. Route-group folders are wrapped in `( )`, which means **they
do NOT appear in the URL** — they only tell Next.js "these areas each get their own page shell."

```
gkworld360/
│
├── app/
│   ├── (frontend)/        ← THE PUBLIC WEBSITE (its own <html>: Header, Footer, Gyaani, globals.css)
│   │   ├── layout.tsx         (site frame)
│   │   ├── page.tsx           (Homepage)
│   │   ├── [...slug]/         (every subject / category / topic page)
│   │   ├── about/ contact/ news/ search/ subjects/ topics/
│   │   ├── not-found.tsx
│   │   └── globals.css        (design tokens — note: moved here from app/)
│   │
│   ├── (payload)/         ← THE CMS ADMIN (Payload's own <html>)
│   │   ├── layout.tsx
│   │   ├── config.ts         (re-exports the built Payload config)
│   │   ├── importMap.js       (admin client components)
│   │   ├── admin/[[...segments]]/   (the /admin panel UI)
│   │   └── api/[...slug]/          (Payload's REST API)
│   │
│   ├── api/               ← site APIs (e.g. the Gyaani chatbot)
│   └── robots.ts, sitemap.ts, llms.txt, favicon.ico, icon.png
│
├── payload.config.ts     ← Payload master config (connects Neon + Cloudflare R2 + collections)
├── collections/          ← CMS content types: Users, Media, Subjects, Categories, Articles, News
├── blocks/               ← rich-text editor blocks: KeyTakeaways, TopicImage
├── fields/               ← reusable field configs (e.g. slug.ts)
│
├── content/              ← LEGACY MDX articles — being migrated into Payload, then removed
├── components/           ← reusable UI (Header, Footer, cards, Gyaani…)
├── lib/                  ← helper code (content.ts, search.ts, date-utils.ts…)
├── public/               ← images, icons
├── docs/                 ← these documentation files
├── .env.local            ← private keys: Gemini + Neon (DATABASE_URL) + Cloudflare R2 + PAYLOAD_SECRET
└── root config: package.json, next.config.ts, tsconfig.json, tailwind
```

**What changed vs. the original plan below:**
- `app/` is now split into `(frontend)` and `(payload)` route groups (there is intentionally **no** single `app/layout.tsx` — each group is its own root layout).
- A **database arrived early**: Neon (PostgreSQL) via Payload — the original plan expected it "much later, with Login."
- New top-level folders: `collections/`, `blocks/`, `fields/`, plus `payload.config.ts`.
- The database tooling is **Payload's built-in layer (Drizzle under the hood)**, not `prisma/` as the old diagrams guessed.
- `globals.css` moved from `app/` to `app/(frontend)/`.
- The `content/` MDX folder still exists but is **legacy** — being migrated into the CMS, then it will be deleted.

Everything below this line is the **original MVP structure plan**. Its rules and philosophy
still guide us; just read its file trees as historical, not current.

> **Read this first:** A "folder structure" is just how your project's files are organised into folders — like rooms in a house. A good structure means you (and the AI) can always find things quickly, and the project stays tidy even after it grows to thousands of pages. This document is the rulebook for that tidiness.

---

# Overview

The philosophy behind this structure is simple: **start tiny, grow only when forced to.**

GKWorld360 is built by one person, helped by AI, on a limited budget. That shapes every decision here:

- **Simplicity over cleverness.** A structure you can understand at a glance beats a "professional" structure you need a manual to navigate.
- **Fewer folders, not more.** Every folder you add is one more place to look and one more thing to remember. We keep the count as low as possible.
- **Content is the product.** Your articles are the most important thing in the project, so they get their own clear home (`content/`), completely separate from the website's code.
- **AI-friendly.** A small, predictable, conventional layout is exactly what the AI assistant understands best — so it can write and fix code reliably for you.
- **Grows without reorganising.** New features are *added beside* what already exists, never *on top of* it. You should never have to tear the project apart to add something.

The result: on day one the project has just a handful of folders. Years later, after thousands of pages and several new features, it should *still* feel understandable — because folders only ever appeared when there was a real reason for them.

---

# Current Folder Structure

This is everything the project needs **to begin**. Nothing here is optional padding — each folder earns its place from day one.

```
gkworld360/
│
├── content/        ← YOUR ARTICLES (the product) — written in simple text files
│   └── history/
│       ├── overview.mdx                    ← the "History" subject page
│       └── indus-valley-civilization.mdx   ← a topic inside History
│
├── app/            ← THE WEBSITE ITSELF (the pages people visit)
│   ├── page.tsx            ← the Homepage
│   ├── [...slug]/page.tsx  ← shows EVERY subject, category & topic page (one single file)
│   └── layout.tsx          ← the shared frame (header + footer) wrapped around every page
│
├── components/     ← REUSABLE DESIGN PIECES (a Header, a Footer, a Card, a Button…)
│
├── lib/            ← BEHIND-THE-SCENES HELPERS
│   └── content.ts          ← the helper that reads your article files and turns them into pages
│
├── public/         ← STATIC FILES served as-is (images, the site icon)
│
├── .env.local      ← your private keys (e.g. email key) — never uploaded to the internet
└── (root config files: package.json, tailwind, tsconfig, next.config — set up once, rarely touched)
```

**What each folder is for:**

| Folder | What it holds | In plain words |
|---|---|---|
| `content/` | Your `.mdx` article files, organised by subject | This is *your* space. You and the AI add articles here. The product lives here. |
| `app/` | The website's pages and overall layout | This is the website. Each page the visitor sees comes from here. |
| `components/` | Small reusable building blocks of the design | Build something once (e.g. the Header), reuse it on every page. |
| `lib/` | Helper code that does background work | The "engine room" — code that reads files, builds SEO tags, etc. You rarely look here; the AI maintains it. |
| `public/` | Images and other files served directly | Where pictures and the favicon live. |

That's **four working folders** (`content`, `app`, `components`, `lib`) plus `public`. If a folder isn't in this list, it doesn't exist yet — and that's intentional.

---

# Folder Creation Philosophy

Three rules govern when a new folder is allowed to exist:

1. **Create a folder only when you have something real to put in it.**
   Don't make an `articles/` folder "for later." Make it the day you write your first article — not before.

2. **Never leave an empty folder.**
   An empty folder is a question with no answer ("what was this for?"). It adds confusion and zero value. If a folder has nothing in it, it shouldn't be there.

3. **When in doubt, choose the simpler option.**
   Fewer folders, shallower nesting, plainer names. You can always add structure later when a real need appears — but you can rarely remove clutter without effort. Starting simple is the safe default.

The test before creating any folder is one question: *"Do I have a file that needs a home right now?"* If the answer is no, don't create the folder.

---

# Content Structure

This is the most important section, because it protects the foundation of the whole platform. There are **two different kinds of content**, and they must never be mixed.

## 1. Subject Topics (educational, evergreen)

These are the core of GKWorld360 — in-depth educational pages that stay relevant for years. They follow the **permanent hierarchy** from the Blueprint:

```
Home → Subject → (Optional Category) → Topic
```

**Example with a category:**
```
History → Modern India → Revolt of 1857
```

**Example without a category:**
```
Science → Photosynthesis
```

Topics live inside their subject's folder in `content/`. A **category is simply an extra folder** you add inside a subject — and only when it genuinely helps organise things. A subject's own intro page is always called `overview.mdx`.

```
content/
└── history/
    ├── overview.mdx                    ← the History subject page
    ├── indus-valley-civilization.mdx   ← a topic directly under History (no category)
    └── modern-india/                   ← a CATEGORY (just a folder) — added only when wanted
        ├── overview.mdx                 ← the "Modern India" category page
        └── revolt-of-1857.mdx           ← a topic inside the category
```

## 2. Articles (timely, changing)

These are **separate** from topics. They are time-based content such as:

- **Current affairs** (timely updates relevant to exams)
- **Editorial posts** (study tips, opinion pieces)
- **Announcements** (platform updates)

Unlike topics, articles are tied to a date and lose relevance over time. They do **not** belong in the subject hierarchy. They get their **own home**, created the day you start publishing them:

```
content/
└── articles/              ← created ONLY when the Articles section begins
    └── 2026-budget-key-highlights.mdx
```

## ⚠️ The golden rule: Topic pages are NOT Articles

Keep these two worlds completely separate, in storage and in the reader's mind:

| | **Subject Topics** | **Articles** |
|---|---|---|
| Purpose | Deep, lasting education | Timely updates, opinion, announcements |
| Lifespan | Evergreen (relevant for years) | Time-sensitive (ages quickly) |
| Lives in | `content/<subject>/...` | `content/articles/` |
| Follows the hierarchy? | Yes (Subject → Category → Topic) | No |
| Shown by | the `app/[...slug]` page | its own `app/articles` pages (added later) |

Because they live in different folders and are shown by different pages, the two can never accidentally tangle together. A topic about "The Revolt of 1857" and an article about "this week's budget" are different *types* of things, and the structure keeps them that way forever. To separate different *kinds* of articles (for example Current Affairs vs Study Tips), use **categories or tags inside `content/articles/`** rather than new top-level folders.

---

# Future Expansion Philosophy

Every future feature from the Blueprint can be added **without reorganising anything that already exists.** The reason is the core design idea from the Tech Foundation: **your content is kept separate from the website's features.** Adding a feature means *placing a new folder beside the old ones* — not rebuilding the project.

Here is how each planned feature slots in cleanly:

| Future feature | How it's added | What it touches |
|---|---|---|
| **Login / Signup** | New pages `app/login/`, `app/signup/`, plus an auth helper in `lib/`. A database is introduced at this point. | Adds new folders only. Your `content/` and existing pages are untouched. |
| **Dashboard** | A new `app/dashboard/` folder. | Just a new page area beside the others. |
| **Notes** | A new `app/notes/` area + a place in the database to store notes. | Additive. No existing page changes. |
| **Quizzes** | A new `app/quizzes/` area + quiz data in the database. | Additive. |
| **Bookmarks** | A small addition to the database + a "saved" page. | Additive. |
| **Premium features / payments** | A `app/pricing/` page + a payment helper in `lib/`. | Additive. |

Notice the pattern: **every new feature is a new folder placed next to the existing ones.** The homepage, the subject pages, and the articles all keep working exactly as before. This is what "scalable without clutter" means in practice — the project grows outward in neat, separate pieces instead of becoming a tangled mess.

When the database arrives (with Login, in a later phase), it brings just one or two new folders of its own (for example, a small `prisma/` folder that describes the data) — again, sitting *beside* everything else, not replacing it.

---

# Folder Growth Rules

A short, permanent set of rules to keep GKWorld360 tidy for years:

1. **Create folders only when necessary.** A folder appears the moment a real file needs a home — never "just in case."
2. **Keep structures shallow.** Prefer two or three folder levels over five or six. Deep nesting makes things hard to find. The content hierarchy (Subject → Category → Topic) is the only place nesting is expected, and even there the category level is optional.
3. **Avoid unnecessary nesting.** If a folder would contain just one file, ask whether the folder is needed at all. Don't wrap single files in folders for no reason.
4. **Use clear, plain names.** `overview.mdx`, `components/`, `lib/` — names a non-technical person can understand. Avoid cryptic prefixes and abbreviations.
5. **Refactor only when complexity actually appears.** Don't tidy a folder that isn't messy yet. For example, only split `components/` into sub-folders once it holds *many* pieces and feels crowded — not before. Solve real clutter, not imagined clutter.
6. **One purpose per folder.** Each folder should have a single, obvious job. If you can't say in one sentence what a folder is for, it probably shouldn't exist.

---

# Final Approved Structure

This is the official structure for GKWorld360. The **left column shows what exists today**; the **"added later" rows show what appears only when a real need arrives.** For every folder: *why it exists*, and *when files go inside it.*

```
gkworld360/
│
├── content/        ← exists now
│   ├── history/                            (a subject)
│   │   ├── overview.mdx                     (subject intro page)
│   │   ├── indus-valley-civilization.mdx    (a topic)
│   │   └── modern-india/                    (a category — only when wanted)
│   │       ├── overview.mdx
│   │       └── revolt-of-1857.mdx
│   └── articles/                           ← added later (when Articles section starts)
│
├── app/            ← exists now
│   ├── page.tsx                 (Homepage)
│   ├── [...slug]/page.tsx       (every subject / category / topic page)
│   ├── layout.tsx               (shared header + footer)
│   ├── about/ contact/ search/  ← added later (one folder each, when built)
│   ├── articles/                ← added later (the Articles pages)
│   └── api/                     ← added later (small endpoints, e.g. contact form)
│
├── components/     ← exists now (flat; sub-folders only if it gets crowded)
│
├── lib/            ← exists now
│   ├── content.ts               (reads your articles)
│   ├── seo.ts                   ← added later (builds SEO tags)
│   └── search.ts                ← added later (powers search)
│
├── public/         ← exists now (images, favicon)
│
└── root files: package.json, tailwind.config, tsconfig, next.config, .env.local
```

**Folder-by-folder reference:**

### `content/` — *exists now*
- **Why it exists:** It is the home of the product — all your educational topics and, later, your articles. It is deliberately separate from the website code so your writing is never at risk when the code changes.
- **When files go here:** Every time you publish a topic (in a subject folder) or an article (in `articles/`). This is the folder you personally touch most.

### `app/` — *exists now*
- **Why it exists:** It *is* the website. Every page a visitor sees is produced here.
- **When files go here:** When you add a brand-new type of page. Note you'll rarely add content pages here — the single `[...slug]` file already handles all subjects and topics. New folders appear here only for distinct sections like About, Contact, Search, or Articles, and only when you build them.

### `components/` — *exists now*
- **Why it exists:** To hold reusable design pieces (Header, Footer, Card) so they're built once and used everywhere — keeping the look consistent and changes easy.
- **When files go here:** When you create a visual piece used on more than one page. Keep it flat at first; only split into sub-folders if it ever becomes crowded.

### `lib/` — *exists now*
- **Why it exists:** The "engine room" for background helper code (reading articles, building SEO tags, search). Separating it keeps the page files clean and readable.
- **When files go here:** When the AI needs a reusable piece of logic. You'll rarely open this folder yourself — the AI maintains it.

### `public/` — *exists now*
- **Why it exists:** For files served to visitors exactly as-is — images, the site icon, and special files like `robots.txt` later.
- **When files go here:** When you add an image or a static asset to the site.

### `content/articles/` — *added later*
- **Why it exists:** A dedicated, separate home for time-based Articles (current affairs, editorial posts, announcements) so they never mix with evergreen Topics.
- **When it's created:** The day you publish your first article — not before.

### `app/about/`, `app/contact/`, `app/search/`, `app/articles/` — *added later*
- **Why they exist:** Each is a distinct section of the site.
- **When they're created:** Each appears the day you build that specific page.

### `app/api/` — *added later*
- **Why it exists:** To hold tiny behind-the-scenes endpoints (for example, the one that receives the contact form and emails it to you).
- **When it's created:** When you build a feature that needs the server to *do* something rather than just *show* a page.

### `prisma/` (or similar) — *added much later, with Login*
- **Why it exists:** To describe the database that arrives in a later phase (for accounts, notes, quizzes).
- **When it's created:** Only when you reach the phase that introduces user accounts — never during the content-only MVP.

---

## In one sentence

**Start with five folders, add a new one only when a real file needs a home, keep Topics and Articles in separate places, and grow by adding folders beside the old ones — never by rebuilding.** Follow that, and GKWorld360 will stay simple and clear from its first page to its ten-thousandth.