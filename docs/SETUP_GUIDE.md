# GKWorld360 — Setup Guide

**Source of truth:** `docs/GKWORLD360_MASTER_BLUEPRINT.md`, `docs/GKWORLD360_TECH_FOUNDATION.md`, `docs/GKWORLD360_PROJECT_STRUCTURE.md`, `docs/GKWORLD360_DESIGN_SYSTEM.md`
**Audience:** a non-technical solo founder building with AI assistance
**Purpose:** a step-by-step, plain-language guide to set up the entire GKWorld360 project from an empty computer to a live website — so anyone (including a future you, or a future AI session) can recreate the foundation correctly.

> **Read this first:** This guide does **not** build the website's features. It builds the *workshop* — installing the tools, creating the empty project, and connecting everything so that building can begin. Think of it like setting up a kitchen before you cook: you install the oven, lay out the counters, and check the lights work. Once this guide is finished, the actual cooking — building pages and writing articles — starts. Follow it top to bottom, in order, and don't skip steps.

---

# 1. Purpose of the guide

GKWorld360 is being built by one non-technical founder, with AI as the developer and teacher. That means the setup has to be **repeatable, understandable, and impossible to get badly wrong.** This document is that safety net.

Its job is to take you from **nothing** to a **running, version-controlled, deployable project** — without assuming you already know what any of the tools are. Every piece of software is explained in everyday language before you install it, and every command is given exactly as you should type it.

By the end of this guide you will have:

- All required software installed and working.
- A fresh Next.js project created with the exact, approved settings.
- The correct starting folder structure (and *only* that — no clutter).
- The project running on your own computer, visible in your browser.
- Your code saved to Git and backed up on GitHub.
- Automatic deployment to the live internet via Vercel.
- A clear, short list of rules that keep the project simple as it grows.

> **Why a setup guide at all?** Because the single most common way solo founders lose weeks is a messy or half-finished foundation. A clean, documented setup means that if anything ever breaks — or you move to a new computer — you can rebuild the base in an hour, not a month. It also means the AI always knows exactly what world it's working in.

This guide reflects the **approved decisions** for the MVP:

| Decision | Choice |
|---|---|
| Framework | **Next.js** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Content system | **File-based MDX** (no database, no CMS) |
| Package manager | **npm** |
| Responsive priority | **Desktop-first**, fully responsive |
| Visual source of truth | **Stitch** ("Academic Clarity" theme) |
| Core principle | **Content is the product** — content stays separate from code |
| Development style | **AI-assisted** |

Everything below serves these decisions. Nothing here adds a database, a login system, or an admin panel — those belong to later phases, not the MVP.

---

# 2. Required software

These are the tools you need installed **before** you create the project. Install them in the order listed. Each one is explained in plain language first, so you know *what* you're installing and *why*.

> **A note on your operating system:** GKWorld360's owner is on a Mac (macOS). All instructions below work on Mac. They also work on Windows with tiny wording differences (for example, the terminal app is different). Where it matters, ask the AI for the Windows equivalent.

### Node.js

**What it is:** Node.js is the *engine* that runs your website's code on your computer (and later, on the internet). Next.js is built on top of Node — so without Node, nothing runs. You can think of Node as the "motor," and Next.js as the "car" built around it.

**Why you need it:** Every command in this guide (creating the project, running it, building it) is powered by Node.

**How to get it:** Download the **LTS** version (LTS means "Long-Term Support" — the stable, recommended one) from [nodejs.org](https://nodejs.org). Run the installer and accept the defaults.

**How to check it worked:** Open your terminal (on Mac: the **Terminal** app) and type:

```bash
node --version
```

If it prints a version number (for example `v20.x.x` or higher), Node is installed correctly.

### npm

**What it is:** npm ("Node Package Manager") is the tool that **downloads and installs the building-block libraries** your project depends on — for example Next.js, React, and Tailwind. When the project says "I need these 50 pieces," npm fetches them all.

**Why you need it:** It's how every external piece of code gets into your project, and how you run project commands like `npm run dev`.

**How to get it:** You don't install it separately — **npm comes bundled with Node.js automatically.** Installing Node in the step above already installed npm.

**How to check it worked:**

```bash
npm --version
```

A version number means you're set. (npm is the approved package manager for this project — not pnpm or Yarn — because it comes built-in and matches every tutorial you'll follow.)

### VS Code

**What it is:** Visual Studio Code (VS Code) is the **editor** where you'll read and write the project's files. It's a free, friendly text editor made by Microsoft, and it's the most widely used editor for web projects.

**Why you need it:** It's your window into the project — where you'll see the folders, open article files, and watch the AI's changes. It also has a built-in terminal, so you can run commands without leaving the editor.

**How to get it:** Download from [code.visualstudio.com](https://code.visualstudio.com) and install.

**How to check it worked:** It opens, and you can use **File → Open Folder** to open your project folder.

### Git

**What it is:** Git is a **time machine for your code.** Every time you "save a version" (called a *commit*), Git remembers exactly what the project looked like at that moment. If something breaks, you can travel back to a working version. It also tracks the history of every change.

**Why you need it:** It protects your work, records your progress, and is what connects your computer to GitHub and Vercel. It's also where your content's free "version history" comes from — a key benefit of the file-based MDX approach.

**How to get it:** On Mac, the easiest way is to type `git --version` in the terminal — if Git isn't installed, macOS will offer to install it for you. Otherwise download from [git-scm.com](https://git-scm.com).

**How to check it worked:**

```bash
git --version
```

### GitHub account

**What it is:** GitHub is a **website that stores your Git history online.** If Git is the time machine on your computer, GitHub is the safe, off-site backup in the cloud — and the place collaborators (and Vercel) can reach your code.

**Why you need it:** Two reasons. First, **backup**: if your laptop dies, your project is safe online. Second, **deployment**: Vercel watches your GitHub and publishes your site automatically every time you save changes there.

**How to get it:** Sign up for a free account at [github.com](https://github.com). Choose a username you're happy to keep.

> **GitHub vs Git — the one-line difference:** *Git* is the tool on your computer that records history; *GitHub* is the website that stores a copy of that history online. You use both, together.

### Claude Code

**What it is:** Claude Code is the **AI developer and teacher** you build with. It's an assistant (powered by Claude) that lives in your terminal and editor, reads your project, writes and explains code, and follows the rules in your documents. For GKWorld360, Claude Code is how the website actually gets built — you describe what you want, it implements it and teaches you along the way.

**Why you need it:** This is an AI-assisted project. Claude Code turns your book notes into MDX article files, builds the pages from the Stitch designs, and maintains the "engine room" code in `lib/` that you'll rarely touch yourself.

**How to get it:** Install Claude Code following the official instructions, then open it inside your project folder so it can see all your files and documents. (You appear to already be working with it — this section exists so the guide is complete for anyone setting up fresh.)

**How to check it worked:** It can read your `docs/` folder and answer a question about your Blueprint.

### Stitch MCP

**What it is:** Stitch is the **visual design tool** that holds your "Academic Clarity" design — it is the *visual source of truth* for GKWorld360 (your colours, fonts, spacing, and screen layouts live there). An **MCP** ("Model Context Protocol") is simply a **secure connection that lets Claude Code talk directly to another tool.** So "Stitch MCP" means *the bridge that lets Claude Code read your actual Stitch designs.*

**Why you need it:** Without it, the AI would have to *guess* what your design looks like. With it, Claude Code can pull the real colours, type sizes, and layouts straight from Stitch — so the website that gets built matches the design exactly, with no invention. This is exactly what your Design System document requires: *"Do not invent anything... Stitch is the visual source of truth."*

**How to get it:** Connect the Stitch MCP to Claude Code (one-time configuration). Once connected, Claude Code can view your Stitch project **"GKWorld360 MVP Final Designs"** and read its theme directly.

**How to check it worked:** Claude Code can describe a real value from your Stitch project (for example, that the primary brand colour is Deep Navy `#0f172a`).

> **You do not need anything else.** No database software, no separate backend tools, no CMS. The MVP deliberately avoids them. If a tutorial ever tells you to install a database for GKWorld360's MVP, that tutorial is solving a different problem than yours.

---

# 3. Recommended VS Code extensions

Extensions are small add-ons that make VS Code smarter for a specific job. Install **only** the few that genuinely help *this* project — resist the temptation to add dozens. Each one below earns its place.

To install an extension: open VS Code, click the **Extensions** icon in the left sidebar (it looks like four small squares), search for the name, and click **Install**.

| Extension | What it does | Why it helps GKWorld360 |
|---|---|---|
| **ESLint** (by Microsoft) | Underlines code mistakes as you type. | Catches errors early, before they become broken pages. Matches the ESLint setting you'll enable when creating the project. |
| **Prettier — Code formatter** | Automatically tidies the spacing and formatting of your code on save. | Keeps every file neat and consistent without you thinking about it. Pairs naturally with the AI-written code. |
| **Tailwind CSS IntelliSense** | Autocompletes Tailwind class names and shows you the colour/spacing each one produces. | Tailwind is your styling system; this makes it far easier to read and write, and shows your "Academic Clarity" colours inline. |
| **MDX** (by unified) | Understands `.mdx` files — your article format — with proper highlighting and error checking. | Your *entire content system is MDX*. This extension makes writing and reviewing articles comfortable. |
| **Error Lens** *(optional but recommended)* | Shows error messages right on the line where they happen, instead of hiding them. | Hugely helpful for a beginner — you see *what's wrong and where* at a glance. |

> **Why such a short list?** The same philosophy that governs your folders governs your tools: *add only what you need.* Five focused extensions keep VS Code fast and uncluttered. You can always add more later if a real need appears — but you rarely need to.

Skip, for now: anything that adds heavy features you won't use in the MVP (database explorers, Docker tools, framework-specific kits beyond the above). They add clutter and confusion with no payoff at this stage.

---

# 4. Create the Next.js project

This step creates the empty website project itself. You run **one command**, answer a few questions, and Next.js builds the entire starting skeleton for you.

> **Important — where you run this:** You already have a `gkworld360` folder containing your `docs/`. You want the new project created **inside that same folder**, so your docs and your code live together. In the command below, the `.` (a single dot) means *"create the project right here, in the current folder."* So first make sure your terminal is **inside** your `gkworld360` folder.

### The exact command

```bash
npx create-next-app@latest .
```

`npx` runs the official Next.js project creator (`create-next-app`) at its latest version. The `.` tells it to set up the project in your current folder. After you run it, it will ask you a short series of questions.

### The exact answers to give

Answer **exactly** as shown — these are the approved decisions for GKWorld360:

| Question it asks | Your answer | Why |
|---|---|---|
| Would you like to use **TypeScript**? | **Yes** | Catches mistakes as you type and makes AI assistance far more reliable. |
| Would you like to use **ESLint**? | **Yes** | Automatically flags code problems early. |
| Would you like to use **Tailwind CSS**? | **Yes** | Your approved styling system. |
| Would you like to use the **App Router**? | **Yes** | The modern Next.js routing that maps folders to URLs — perfect for your content hierarchy. |
| Would you like your code inside a **`src/` directory**? | **No** | Keeps the structure flatter and simpler — matches your Project Structure document. |
| Would you like to use **Turbopack**? | **Yes** | A faster build/development engine, so the site reloads quickly while you work. |
| Would you like to customize the **import alias**? | **No (keep the default)** | The default (`@/`) is standard and well-understood by the AI. No reason to change it. |

> **If you'd rather not be asked the questions one by one**, the same choices can be passed as a single command (the AI can run this for you):
>
> ```bash
> npx create-next-app@latest . --typescript --eslint --tailwind --app --no-src-dir --turbopack --import-alias "@/*"
> ```
>
> This produces an identical result, with no interactive prompts.

When it finishes, Next.js will have created the project's core files and folders for you — including the `app/` folder (your website's pages) and the `public/` folder (your images and static files), plus the root configuration files. You don't create those by hand; the command makes them.

> **If it warns about existing files:** Because your folder already contains `docs/` and your requirements document, the creator might mention them. That's fine — your docs do not conflict with Next.js's files, so it will proceed and leave your documents untouched.

---

# 5. Initial folder structure

After the project is created, your folder structure follows the plan in `GKWORLD360_PROJECT_STRUCTURE.md`. Some folders are made for you by the command above; a few you add by hand. The guiding rule from that document is permanent and absolute:

> **Create folders only when they are actually needed. Never leave an empty folder. When in doubt, choose the simpler option.**

### What you should have to begin

```
gkworld360/
│
├── docs/           ← ALREADY EXISTS — your blueprint and design documents
│
├── content/        ← ADD THIS — your articles (the product), written in .mdx files
│
├── app/            ← created by Next.js — the website's pages and layout
│
├── components/     ← ADD THIS — reusable design pieces (Header, Footer, Card…)
│
├── lib/            ← ADD THIS — behind-the-scenes helper code
│
├── public/         ← created by Next.js — images and static files
│
└── (root config files: package.json, tailwind, tsconfig, next.config — created by Next.js)
```

### Which folders you create, and which already exist

| Folder | Where it comes from | What it's for (in plain words) |
|---|---|---|
| `docs/` | **Already exists** | Your source-of-truth documents. Don't move or rename it. |
| `content/` | **You add it** | *Your* space — every article and topic lives here, kept separate from the code. |
| `app/` | Created by Next.js | The website itself. Each page a visitor sees is produced here. |
| `components/` | **You add it** | Build a piece once (e.g. the Header), reuse it everywhere. |
| `lib/` | **You add it** | The "engine room" — code that reads your articles, builds SEO tags, etc. The AI maintains it. |
| `public/` | Created by Next.js | Images, the site icon, and other files served exactly as-is. |

So in practice you only create **three** folders by hand: `content/`, `components/`, and `lib/`. The rest already exist (`docs/`) or are made for you (`app/`, `public/`).

> **Why these and nothing else?** This is the deliberate starting set from your Project Structure document — the minimum the project needs to begin. You will **not** create `about/`, `articles/`, `api/`, or any other folder yet. Following the philosophy: *a folder appears the day a real file needs a home — never "just in case."* When you write your first article, you'll create `content/history/` (and a file inside it). When you build the About page, you'll create `app/about/`. Not before.

> **Do not create empty folders to "prepare."** An empty folder is a question with no answer. If you (or the AI) ever create `content/`, `components/`, or `lib/` and they'd sit empty, it's fine to leave them as the agreed starting structure — but go no further. Every *additional* folder must be justified by a real file that needs a home.

---

# 6. First run

Now you'll start the project on your own computer and see it live in your browser. This is the satisfying "it works!" moment.

Make sure your terminal is inside the `gkworld360` folder, then run these two commands.

### Step 1 — Install the building blocks

```bash
npm install
```

This reads the project's list of required libraries (in a file called `package.json`) and downloads every one of them into a folder called `node_modules`. It can take a minute or two the first time. You usually only run this once at the start (and again whenever a new library is added).

> **What is `node_modules`?** It's the folder holding all the downloaded code your project depends on — often thousands of files. You never edit it, and it's automatically kept out of Git (see Section 7), because anyone can rebuild it by running `npm install` again.

### Step 2 — Start the development server

```bash
npm run dev
```

This starts a **local development server** — a temporary version of your website that runs only on your computer, just for you, while you build. Thanks to Turbopack, it starts fast and reloads instantly when files change.

When it's ready, the terminal will print a web address, usually:

```
http://localhost:3000
```

### How to verify the site is running

1. Open your web browser.
2. Go to **http://localhost:3000**.
3. You should see the default Next.js welcome page.

If you see that page, **congratulations — your foundation works.** The engine runs, the project is healthy, and you're ready to start building.

> **`localhost` means "this computer."** The site at `localhost:3000` is private to you — it is *not* on the internet yet, and no one else can see it. To stop the server, click in the terminal and press **Ctrl + C**. To start it again later, just run `npm run dev` again.

---

# 7. Git setup

Now you'll turn the project into a tracked, backed-up project using Git (your local time machine) and GitHub (your online backup). This protects your work from this point forward.

> **Good news:** When `create-next-app` built your project, it usually already started Git for you *and* added a `.gitignore` file (the list of things Git should ignore, like `node_modules` and `.env.local`). If so, you can skip the `git init` step. The steps below assume nothing, so they work either way.

### Step 1 — Start Git in the project (if it isn't already)

```bash
git init
```

This tells Git to begin watching this folder. From now on, Git can record snapshots of your work. (If Git is already started, this does no harm.)

### Step 2 — Make your first commit

A *commit* is a saved snapshot — a single point in your project's history you can always return to.

```bash
git add .
git commit -m "Initial project setup"
```

- `git add .` gathers up all your current files (the `.` means "everything"), ready to be saved.
- `git commit -m "..."` saves that snapshot with a short message describing it. "Initial project setup" is a clear first message.

> **What's a good commit message?** A short, plain description of what changed — written so future-you understands it at a glance. "Initial project setup", "Add History subject page", "Fix footer spacing". You'll make many commits as you build; each one is a safe point to return to.

### Step 3 — Connect to GitHub

First, on [github.com](https://github.com), create a **new, empty repository** (a "repo" is just a project on GitHub) named `gkworld360`. Do **not** let GitHub add a README or `.gitignore` for you — you want it empty, because your project already has files.

GitHub will then show you a web address for your repo. Connect your local project to it and upload your work:

```bash
git remote add origin https://github.com/YOUR-USERNAME/gkworld360.git
git branch -M main
git push -u origin main
```

- `git remote add origin ...` tells your computer where the online backup lives (replace `YOUR-USERNAME` with your real GitHub username).
- `git branch -M main` names your main line of work `main` (the standard name).
- `git push ...` uploads your commits to GitHub.

> **From now on, your routine is simple:** after making changes you're happy with, run `git add .`, then `git commit -m "describe what changed"`, then `git push`. Three commands, and your work is both versioned and safely backed up online. The AI can run these for you whenever you ask.

---

# 8. Vercel deployment

Vercel is the service that puts your website on the live internet. It's made by the same team as Next.js, so the two fit together perfectly. The magic of Vercel is **automatic deployment**: once connected, every time you push changes to GitHub, Vercel rebuilds and republishes your live site within about a minute — with no servers for you to manage.

### Step 1 — Connect GitHub to Vercel

1. Sign up for a free account at [vercel.com](https://vercel.com) — choose **"Continue with GitHub"** so the two are linked from the start.
2. In Vercel, click **"Add New… → Project."**
3. Vercel will show your GitHub repositories. Select **`gkworld360`** and click **Import.**
4. Vercel automatically recognises it as a Next.js project and fills in the correct settings. You usually don't need to change anything — just click **Deploy.**

After a minute, Vercel gives you a live web address (something like `gkworld360.vercel.app`). Open it — your site is now on the real internet. Later, you can connect your own custom domain name in Vercel's settings.

### Step 2 — Enjoy automatic deployments

This is the part that makes life easy:

> **From now on, "save → push → live."** Whenever you push new commits to GitHub (`git push`), Vercel notices automatically, rebuilds your site, and publishes the update. You never manually upload files or touch a server. Your job is simply to build and commit; Vercel handles publishing.

This is exactly the workflow your Tech Foundation describes — and it's what lets a solo founder publish ~2 articles a day without any DevOps work.

> **A gentle order-of-operations note:** It's normal to set up Vercel *after* your first real pages exist, not on day one. You can connect it now so it's ready, or wait until you have something worth showing. Either is fine — the steps are the same.

---

# 9. Environment variables

An **environment variable** is a private setting — usually a **secret key** — that your project needs but that must **never** be shown publicly in your code. The classic example for GKWorld360's MVP is the key for the email service that sends you the contact-form messages (Resend).

### `.env.local`

Secrets live in a special file named **`.env.local`** in the root of your project. The name matters:

- The `.env` part marks it as an environment file.
- The `.local` part is recognised by Next.js as *"this is private to my computer."*

Inside, secrets are written as simple `NAME=value` lines, for example:

```
RESEND_API_KEY=your-secret-key-here
```

Your code then reads the value by name — without the secret itself ever appearing in the code.

### Never commit secrets

This is a firm security rule:

> **Secrets go in `.env.local` and in Vercel's dashboard — never in your code, and never on GitHub.**

Two things keep you safe here:

1. **`.gitignore` already protects you.** `create-next-app` lists `.env*.local` in the `.gitignore` file, so Git automatically refuses to upload it. Your secret stays on your computer.
2. **A template, not the secret.** It's good practice to keep a file called **`.env.example`** that lists the *names* of the keys needed (e.g. `RESEND_API_KEY=`) but **not** their real values. This file *is* committed, so it documents which secrets the project expects — without revealing any of them.

For the live site, you don't put the secret file on the server. Instead you paste the key into **Vercel's dashboard** (Project → Settings → Environment Variables). Vercel keeps it secure and supplies it to your site at run time.

> **Why so strict?** A leaked secret key can be abused by anyone who finds it — running up bills or sending spam in your name. Because GitHub repos can be public and are permanent, a secret committed even once is considered compromised forever. The simple rule — *secrets only in `.env.local` and Vercel* — removes the risk entirely. The MVP has very few secrets (essentially just the email key), so this is easy to follow.

---

# 10. Important rules

These rules keep GKWorld360 simple, focused, and true to its plan as it grows. They are drawn directly from the Blueprint, Tech Foundation, and Project Structure documents. Treat them as permanent.

1. **Do not create unnecessary folders.**
   A folder appears only when a real file needs a home — never "just in case," and never left empty. Start with `content/`, `components/`, and `lib/` (plus the `app/`, `public/`, and `docs/` that already exist). Everything else waits for a genuine need.

2. **Do not add a database during the MVP.**
   The MVP has no logins, no user data, nothing that needs storing. Your content lives as MDX files, and the contact form sends an email instead of saving rows. A database (PostgreSQL) arrives only in Phase 2, when user features begin.

3. **Do not add authentication during the MVP.**
   There are no accounts, logins, or signups in the MVP. Building auth now would be effort with no payoff — and security is easy to get subtly wrong. It's added additively in Phase 2, alongside the database.

4. **Do not create extra architecture documents.**
   You already have four source-of-truth documents plus this setup guide. Adding more documents creates confusion about which one is correct. If something needs recording, update the *existing* relevant document — don't spawn new ones.

5. **Start building immediately after setup.**
   This guide ends the planning era. Once the foundation runs, move straight into building — the design system, the layout shell, then your most important page (the Topic page). Don't keep polishing the setup; the value is in the pages and the content.

6. **Content remains separate from code.**
   This is the principle that makes everything else possible. Your articles live in `content/`, completely apart from the website's code in `app/`, `components/`, and `lib/`. Because of this separation, you can redesign the site, change colours or fonts, or even swap how content is stored later — all **without disturbing your articles, URLs, or SEO.** Never mix content into the code, and never let code reach into and rewrite your content's meaning.

> **In one sentence:** Install the tools, create the project with the approved settings, add only the three starting folders, get it running and backed up and deploying — then stop setting up and start building, keeping content and code forever separate.

---

## You're ready

When you can tick all of these, setup is complete and building begins:

- [ ] Node, npm, Git installed and printing version numbers.
- [ ] VS Code installed with the five recommended extensions.
- [ ] Claude Code connected to the project; Stitch MCP connected to your designs.
- [ ] Project created with `create-next-app` using the exact approved answers.
- [ ] `content/`, `components/`, and `lib/` folders added (and nothing more).
- [ ] `npm run dev` shows the site at `http://localhost:3000`.
- [ ] First commit made and pushed to a GitHub repo named `gkworld360`.
- [ ] Vercel connected for automatic deployments.
- [ ] `.env.local` understood; secrets kept out of Git.

The workshop is built. Next stop: the **design system** and your **first real page** — the start of GKWorld360 itself.