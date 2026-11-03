# GKWorld360

**From curiosity to knowledge · जिज्ञासा से ज्ञान तक**

GKWorld360 is a bilingual (English + Hindi) general-knowledge learning website. It organises
evergreen topics by **Subject → (optional) Category → Topic** — History, Geography, Physics,
Chemistry, Biology, Famous Personalities and more — alongside current-affairs write-ups, a live
headlines feed, the World360 Atlas (events placed on a globe and a timeline), daily quizzes, and
Gyaani, an AI study helper that answers from the site's own articles. Every page exists in English
at `/…` and, where a Hindi version exists, in Hindi at `/hi/…`. Facts follow NCERT.

## Stack

| Part | What we use | What it does |
|---|---|---|
| Website framework | **Next.js 16** (App Router) + **React 19** + **TypeScript** | Builds the pages and the server code |
| Styling | **Tailwind CSS 4** + design tokens in `app/(frontend)/globals.css` | The look (Light / Dark / Reading modes) |
| Content (CMS) | **Payload CMS v3**, admin at `/admin` | Where articles, news, subjects, quotes and Atlas entries are written and published |
| Database | **Neon** (PostgreSQL) — branches `dev` and `production` | Stores all the content |
| Image storage | **Cloudflare R2** | Stores uploaded images |
| AI | **Google Gemini** | Gyaani's answers and the quiz maker |
| Hosting | **Vercel** | Builds and serves the site |

> **Note for AI assistants:** this Next.js version has breaking changes — read `AGENTS.md` and the
> guides in `node_modules/next/dist/docs/` before writing code.

## Running it locally

You need Node.js and a filled-in `.env.local` file (private keys and database addresses — never
committed, never shared). Then:

```bash
npm install        # download the project's packages (first time, or after package.json changes)
npm run dev        # start the site at http://localhost:3000
```

| Command | Port | Database | Use it for |
|---|---|---|---|
| `npm run dev` | **3000** | **dev** branch | Normal code work. Safe to break things |
| `npm run dev:prod` | **3001** | ⚠️ **PRODUCTION** branch | Content work on the Vercel site's real data |

> ⚠️ **`npm run dev:prod` is the PRODUCTION database console.** Anything you save, change or delete
> at `http://localhost:3001` (including `/admin` there, and any script run with `--production`)
> changes the **Vercel site's real content immediately**. It prints a warning with the database
> host when it starts — read it. If you only meant to work on code, stop it and use `npm run dev`.

Both servers can run at the same time (they use separate build folders, `.next` and `.next-prod`).

Other commands: `npm run build` (production build), `npm run start` (serve that build),
`npm run lint` (code-style check). The content-pipeline tools in `scripts/` are run with
`node scripts/<name>.mjs` while a dev server is running — see the folder guide below.

## Environment names (always use these words)

- **dev** = the laptop (`localhost:3000`, Neon `dev` branch).
- **Vercel site** = `gkworld360.vercel.app` (Neon `production` branch, search-engine indexing **OFF**).
- **live** = the purchased domain with indexing ON — **not bought yet**.

**Never call the Vercel site "live".**

## Where the docs are

- **`PROJECT_CONTEXT.md`** — current status and handoff notes; start with its 🟢 START HERE block.
- **`TODO.md`** — THE task list (Now / Next / Later / Done).
- **`docs/`** — the long-form docs:
  - `GKWORLD360_MASTER_BLUEPRINT.md` — the vision, core decisions and roadmap.
  - `GKWORLD360_TECH_FOUNDATION.md` — the tech stack in detail.
  - `GKWORLD360_PROJECT_STRUCTURE.md` — a guide to every folder and what it's for.
  - `SETUP_GUIDE.md` — setting the project up from scratch.
  - `GKWORLD360_DESIGN_SYSTEM.md` — design tokens and the look.
  - `GKWORLD360_CONTENT_PIPELINE.md` — how content gets from book photos to a published article.
  - `GKWORLD360_PAID_FEATURES_PLAN.md` — the plan for paid features (teachers, quizzes, notes, accounts) — planning only.

Also at the root: `SERVICES.md` (third-party services and billing), `GIT_NOTES.md` (git learning
notes), `IDEAS.md` (undecided ideas).
