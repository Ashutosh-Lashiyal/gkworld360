# GKWorld360 — Design System

> **📌 Updated 3 Nov 2026 to match the redesign (phases 1–5, Oct 2026) and the Hindi site.**
> The old "Academic Clarity" look (Source Serif 4 + Inter, navy/sapphire) is gone from the code.
> Everything below describes what is in the code today, on branch `feature/redesign`.

**What this doc is for (its one lane):** the design tokens and the visual rules — colours, fonts,
modes, shapes, components, motion, Hindi type, screen sizes. It is **not** a task list (that is
`TODO.md`) and not a status report (that is `PROJECT_CONTEXT.md`).

**Source of truth:** the code wins. The tokens live at the top of **`app/(frontend)/globals.css`**,
the fonts in **`app/(frontend)/layout.tsx`**, and the shared pieces in **`components/`**. If this
doc and the code ever disagree, trust the code and fix this doc.

**Stitch / design artifacts:** Stitch has not been the source of truth since 25 Jun 2026. The
redesign was chosen from a preview artifact (https://claude.ai/artifact/Dr36N1feThc8PfUFJ9J4HH);
that preview is a picture of the idea, the code is the real thing.

---

# Two words you'll see everywhere

- **Token** — a named design value, like `--accent` = `#047857`. Components say "use the accent
  colour" instead of writing the hex code. Change the token once and the whole site follows.
- **Mode** — one of the site's three looks (Light, Dark, Reading). Each mode gives the same tokens
  different values.

---

# Overview — "Playful + Cinematic"

Chosen by the owner on 30 Oct 2026, a mix of two concepts:

- **Playful** (think Duolingo / Brilliant): chunky buttons and cards that sit on a solid "edge"
  and press down like real keys, round corners, tilted quiz/fact cards, a floating pill header.
- **Cinematic** (think award-winning film sites): giant tall **Anton** capitals, one italic accent
  word in **Instrument Serif**, a near-black "stage" with the turning 3D Earth on the homepage.

Underneath, the content still comes first: articles are set in a warm bookish serif (**Fraunces**)
in a narrow reading column, and there is a special **Reading mode** for long reading at night.

**Motto (2 Nov 2026):** "From curiosity to knowledge" / "जिज्ञासा से ज्ञान तक" — used in the hero,
the moving band, the footer and link previews.

---

# Every screen matters (replaces "Desktop First")

The old "desktop first, then mobile, then tablet" order is **retired**. Desktop, laptop, tablet
and phone are all equally important — every page must look and work well on all of them. Phones
get their own touches (a bottom tab bar, a reading bar, bottom sheets), not a squeezed desktop.
See **Responsiveness** below.

---

# Modes — Light, Dark, Reading

The mode is an attribute on the `<html>` tag: `<html data-mode="light">`, `"dark"` or `"reading"`.
`globals.css` gives every colour token a different value per mode, so changing that one attribute
repaints the whole site.

| Mode | When | Feel |
|---|---|---|
| **Light** | default when the device is set to light | cool light grey-green page, white cards, green accent |
| **Dark** | default when the device is set to dark | near-black page, mint accent |
| **Reading** | **articles only**, switched on by the reader | warm dim "night paper": no pure white or black (~9:1 contrast), pictures dimmed, nothing moves |

How it works (`lib/mode.ts`):
- The sun/moon button (`components/ThemeToggle.tsx`) remembers Light/Dark in the browser under the
  key `gk-mode`. On article pages it steps Light → Dark → Reading.
- Reading mode is remembered separately (`gk-reading`), so it never darkens the homepage.
- A tiny script in `layout.tsx` sets the mode **before the page is drawn**, so the page never
  flashes the wrong colours.
- After 7 pm an article shows a one-time "Reading at night?" nudge.
- When the mode changes, the page colours glide for 0.5 s instead of snapping.

---

# Colours

### How the colour tokens are built (two layers)
1. **Raw values** — plain CSS variables (`--bg`, `--ink`, `--accent`…). Each mode block gives them
   different values. This is where you change the look.
2. **Tailwind names** — the `@theme inline` block maps the long-standing Tailwind names onto those
   variables (e.g. `--color-background` → `var(--bg)`). Components use classes like `bg-background`,
   `text-muted`, `border-hairline`, so they follow the mode without being edited one by one.

> **Old names, new meanings.** Names like `navy`, `sapphire`, `emerald` were kept so no component
> had to change — they are just names now. `text-sapphire` is green in Light, mint in Dark.

### Page colours per mode (raw variables)

| Variable | What it paints | Light | Dark | Reading |
|---|---|---|---|---|
| `--bg` | page background | `#f2f5f4` | `#0d0d0f` | `#17140f` |
| `--surface` | cards, menus, panels | `#ffffff` | `#161619` | `#1d1913` |
| `--surface-2` | hover tint, quiet fills | `#e8efec` | `#1e1e22` | `#241f18` |
| `--ink` | main text | `#13201c` | `#f3f1ed` | `#dccdb1` |
| `--muted` | captions, dates | `#536159` | `#aaa69f` | `#a8987d` |
| `--faint` | quietest small labels | `#84928c` | `#78756f` | `#7f725e` |
| `--line` | borders, dividers, card edge | `#dae3df` | `#27272c` | `#2f291f` |
| `--line-2` | stronger borders, hover edge | `#c6d4ce` | `#36363c` | `#3b3328` |
| `--accent` | links, active states | `#047857` | `#6ee7b7` | `#d9a55e` |
| `--accent-strong` | link hover | `#065f46` | `#a7f3d0` | `#e8c48c` |
| `--accent-soft` | soft pill behind the active item | `#e2f5ec` | `#13261f` | `#2a2216` |
| `--amber` | warm accent (Reading-mode button, dates) | `#b45309` | `#f2b56b` | `#d9a55e` |
| `--btn` | chunky button face | `#047857` | `#6ee7b7` | `#d9a55e` |
| `--btn-shadow` | the darker "edge" under the button | `#064e3b` | `#0f766e` | `#8a6430` |
| `--on-btn` | text on the button | `#ffffff` | `#04241b` | `#1a1206` |
| `--head-bg` | see-through header pill | white 86% | `#0d0d0f` 80% | `#17140f` 92% |
| `--img-filter` | picture dimming | none | none | `brightness(0.74) sepia(0.2) saturate(0.85)` |
| `--logo-edge` / `--logo-360` | logo edge line / "360" | `#10b981` / `#047857` | `#6ee7b7` | `#d9a55e` |

### The cinematic stage (dark in every mode)
The homepage hero, subject-page heads, the Atlas Earth panel and the footer sit on a dark "stage".
Text on it uses `--stage-ink`, not `--ink`.

| Variable | Value (Light & Dark) | Reading |
|---|---|---|
| `--stage` | `#0b0b0d` (with soft blue/violet glows in `.gk-stage`) | `#120f0b` |
| `--stage-ink` | `#f3f1ed` | `#dccdb1` |
| `--stage-muted` | `#b4b1aa` | `#a8987d` |
| `--stage-line` | `rgba(243,241,237,0.16)` | `rgba(220,205,177,0.14)` |
| `--mint` | `#6ee7b7` — the accent on the stage | `#d9a55e` |
| `--gold` | `#f2b56b` — city lights, Atlas dots, dates | `#d9a55e` |

### Tailwind colour names (what components type)

| Class name | Points to |
|---|---|
| `background`, `surface`, `surface-low`, `surface-high` | `--bg`, `--surface`, `--surface-2`, `--surface-2` |
| `surface-mid`, `border`, `border-subtle`, `hairline` | `--line` |
| `foreground`, `navy` | `--ink` |
| `muted`, `slate` | `--muted` |
| `sapphire`, `emerald`, `accent` / `sapphire-dark` | `--accent` / `--accent-strong` |
| `navy-dark` | `--stage` (as a background). As a **text** colour it is switched to `--ink` in Dark/Reading by a rule in globals.css ("TEXT THAT WAS DARK-ON-LIGHT"). |
| `on-dark`, `mint`, `gold` | `--stage-ink`, `--mint`, `--gold` |
| `faint`, `line-2`, `accent-soft`, `amber` | the matching variables |
| `error` / `error-bg` | `#dc2626` / `#fee2e2` (fixed, same in every mode) |

### Subject colours (`lib/subject-colors.ts`)
Each subject has its own colour family, used **small** (labels, pills, eyebrows) — e.g. History
`accent #92400e` / `bandAccent #f2b56b`, Geography `#075985` / `#7dd3fc`, Physics `#4c1d95` /
`#c4b5fd`. Pages pass them in as `--cl` (the dark shade, for light pages) and `--cd` (the light
shade, for dark pages); cards pass `--signal`. The label pill (`.gk-pill-signal`) mixes the subject
colour with `--ink` so it stays readable in every mode.

### Fixed colours outside the mode system
- **Page curtain / loader:** deep teal `#064e3b` with sky-blue water `#7dd3fc` (both Light and Dark).
- **Quiz answers:** right `#10b981`, wrong `#f87171`.
- **Danger button:** `#dc2626` on a `#991b1b` edge.

---

# Typography

Five fonts, each with one job, loaded by `next/font` in `app/(frontend)/layout.tsx` (downloaded at
build time and served from our own domain — no waiting on Google, no jumping text).

| Tailwind class | Font | Job |
|---|---|---|
| `font-display` | **Anton** (one weight, 400) | GIANT capital titles, the logo's name, drop caps |
| `font-accent` | **Instrument Serif** (italic) | the one italic accent word ("EXPLORE *subjects*"), eyebrows |
| `font-heading` | **Fraunces** (400/600/700) | headings, card titles, the article body |
| `font-body` | **Nunito** (400–900) | everything else: UI, buttons, captions, menus |
| `font-mono` | **Geist Mono** (400/500) | small capital labels ("QUOTE OF THE DAY") |
| (fallback) | **Noto Sans Devanagari** (400–700) | Hindi letters — see **Hindi typography** |

### Key sizes (from globals.css)
- **Section titles** (`.gk-big-title`, used by `SectionHead` and `PageTitle`): Anton, uppercase,
  `clamp(54px, 8.4vw, 128px)`, line-height 0.86. The accent word (`.gk-big-title__accent`) is
  Instrument Serif italic, 1.06em, in `--accent`.
- **Motto band words:** Anton `clamp(64px, 10vw, 150px)`, alternating outline / solid.
- **Article body** (`.prose`): Fraunces, **20px / line-height 1.8** by default (18px on phones).
  The reader can change size (18 / 20 / 22 / 24px), spacing (relaxed = 2) and switch the body to
  Nunito ("Sans"). These live in `--read-size` and `--read-lh`.
- **Article headings:** H2 1.6em Fraunces 600, left-aligned; H3 1.15em.
- **Drop cap:** the first letter of an English article is a big Anton letter in `--accent`.
- **Headings in general** (`h1`–`h6`): Fraunces, line-height 1.25, colour `--ink`.
- **Base body:** Nunito, line-height 1.6.

---

# Hindi typography

The whole site exists in Hindi at `/hi/...` (homepage, subjects, categories, topics, search,
saved, about, contact, news, headlines, Atlas). Owner's rule: **no English and Hindi mixed on one
page.**

- **The font:** none of the five English fonts has Devanagari letters, so **Noto Sans Devanagari**
  is added at the **end** of every font list (`--font-heading`, `--font-body`… in `@theme`). The
  browser draws English letters with the first font and falls through to Noto for Hindi letters.
  Noto must stay last, or it would take over the English letters too.
- **`.font-hindi`** — wraps Hindi article content; forces Noto for body and headings. No drop cap
  on Hindi articles (Devanagari letters join, so one letter can't be lifted out).
- **`.gk-hi-page`** — on every Hindi page body (`components/home/HomePage.tsx`, `components/pages/*`).
  It fits Hindi letters into the English layout:
  1. **More line height (~1.2)** — Hindi has marks above and below the line; Anton's 0.86 would
     make lines touch.
  2. **Bold 700 instead of Anton** — and `font-synthesis: none` so the browser never fakes a bold Anton.
  3. **Smaller giant titles** — e.g. section titles `clamp(40px, 5.6vw, 84px)`; Hindi letters are wider.
- **No letter-spacing in Hindi** — `:lang(hi) { letter-spacing: 0; }` site-wide; spacing pulls
  apart letters that should join. Small mono labels (`.gk-label`) switch to Noto, no capitals.
- **`.gk-fill-word--hi`** — the Hindi version of the picture-filled subject title (see PageTitle):
  Noto 800, line-height 1.2, extra padding so the curls of ि and इ stay filled with the picture.
- **Where the words live (not in components):** homepage words in `lib/home-text.ts`; header,
  footer, menus, loader, Gyaani in `lib/site-text.ts`; page bodies in `lib/page-text.ts`.
  Change wording there.
- **Language switch:** `EN | हिं` in the header (`components/LangSwitch.tsx`, `.gk-lang`); one round
  button on phones (`.gk-lang-one`). A first-visit strip (`HindiWelcome.tsx`) and an "also in
  Hindi" card on articles (`article/AlsoInHindi.tsx`) help people find the Hindi site.

---

# Layout

- **Page container:** `max-w-[1320px]`, centred, side padding **16px on phones, 32px from 768px**
  (`px-4 md:px-8`). This is the standard wrapper across pages.
- **Article reading column:** `max-w-[700px]` (in `ArticleLayout.tsx`), for comfortable line length.
- **Spacing:** there are no custom spacing tokens any more; components use Tailwind's standard
  spacing scale (steps of 4px). Sections are separated by generous whitespace.
- **The stage** (`.gk-stage-wrap` / `.gk-stage`) is pulled up behind the floating header (68px on
  phones, 74px from 768px) so the dark area starts at the very top. Bottom corners 28px (36px from 768px).

### Corners (`@theme`)
| Token | Value | Used for |
|---|---|---|
| `--radius-sm` | 10px | tags, badges |
| `--radius-button` | 16px | buttons, inputs |
| `--radius-card` | 24px | cards, panels |
| (fully round) | 999px | pills, chips, the language switch |

### Shadows — the "chunky edge"
Cards and buttons sit on a **solid edge** (a shadow with no blur, straight down), plus a soft glow
far below for depth.
| Token | Value |
|---|---|
| `--shadow-card` | `0 5px 0 var(--line), 0 24px 48px -30px var(--shadow-far)` |
| `--shadow-card-hover` | `0 8px 0 var(--line-2), 0 30px 60px -30px var(--shadow-far)` |
| `--shadow-button` | `0 4px 0 var(--btn-shadow)` |
| `--shadow-button-dark` | `0 4px 0 #0f766e` |

---

# Components

All shared pieces live in `components/` (homepage sections in `components/home/`, article tools in
`components/article/`, page bodies in `components/pages/`). Their CSS is in `globals.css` under
`gk-…` class names.

### Logo — "Day & Night" (`components/Logo.tsx`, `.gk-logo`)
G for Grow, K for Know. The **G is filled with the daylight Earth, the K with the night side and
its city lights**, with a mint edge, and the Earth turns slowly inside the letters (70 s per turn,
pure SVG, no JavaScript). Pictures: `/public/brand/earth-day-512.jpg`, `earth-night-512.jpg`. The
turning stops for reduced motion and in Reading mode. A new logo was explored and **parked
(2 Nov)** — Day & Night stays. Rule for any future logo: it must also work as a phone-app icon and
never look like a built-in tool (e.g. a compass).

### Header pill (`components/Header.tsx`, `.gk-head`, `.gk-head__pill`)
A floating, frosted-glass pill near the top (`--head-bg` + blur). Contains the logo, nav links
(Home · Subjects menu · Atlas · other links), search, Read Later, the sun/moon button and `EN | हिं`.
The active link gets a soft `--accent-soft` pill. It **hides when you scroll down and returns when
you scroll up.** On phones a full-screen numbered menu opens instead.

### Phone tab bar (`components/PhoneTabBar.tsx`, `.gk-tabbar`) — below 768px only
A floating frosted bar at the bottom: Home · Learn · **Gyaani (raised in the middle)** · News ·
Atlas. Hides on scroll down. On article pages it is replaced by the **reading bar** (`.gk-readbar`).

### Footer (`components/Footer.tsx` + `FooterBody.tsx`)
On the dark stage: the quote of the day with the author's photo, and the giant **GKWORLD360** word
filled with the turning Earth (`components/EarthWord.tsx`, `.gk-earth-word`). Speaks Hindi on /hi pages.

### Button (`components/Button.tsx`) — THE one button
Chunky: the face sits on a darker edge 4px below (`--btn-shadow`); pressing moves it down onto the
edge. At least 44px tall (comfortable tap size), 16px corners, Nunito extra-bold 14px.
| Variant | Look |
|---|---|
| `primary` | `--btn` face (green / mint / amber by mode), `--on-btn` text |
| `onDark` | on the stage: mint face, dark text, teal edge |
| `ghostOnDark` | on the stage: outline only (the "other" option of a toggle) |
| `ghost` | light page: white face, grey edge, accent border on hover |
| `disabled` | grey, not clickable (renders a `<span>`) |
| `danger` | red, for destructive actions only (Clear all, Remove) |

> Note: some comments at the top of `Button.tsx` still describe the older 16 Sep look (deep-teal
> fill, 10px corners). The code below them is the current chunky look.

### SectionHead (`components/SectionHead.tsx`)
The title at the top of a section: a small Instrument Serif italic **eyebrow**, a giant Anton title
with one italic **accent word**, an optional one-line lede and a "More →" link whose arrow slides
on hover. `onDark` for use on the stage. Words rise in one by one as they scroll into view.

### PageTitle (`components/PageTitle.tsx`) — two looks
1. **Page head** (default, listing pages): breadcrumb, eyebrow in the subject's colour, giant Anton
   title with the **last word in italic automatically** ("LATEST *headlines*"), one sentence.
2. **The stage** (pass `image`, subject pages): the dark stage with the subject's name in giant
   letters **filled with its own picture** (`.gk-fill-word` — `background-clip: text`, so the
   letters are a window onto the photo), the Hindi name in gold below. Long names shrink to fit
   one line. Hindi titles use `.gk-fill-word--hi`.

### Cards
- **`.gk-card`** — the chunky card: `--surface`, 2px `--line` border, 24px corners, `0 5px 0` edge.
  `.gk-card--lift` lifts 3px on hover and presses down on click. Used for Key Takeaways, Quick
  facts, prev/next, side cards.
- **ContentCard** (`components/ContentCard.tsx`) — the listing card: picture on top (slow zoom on
  hover, or a soft block in the subject colour when there's no picture), a round label pill in the
  subject colour (`.gk-pill-signal`), Fraunces 23px title, 2-line description, and the
  **English + हिन्दी buttons** (kept on purpose: Hindi must be one tap away on phones). Finished
  articles get a "✓ Read" badge (`ReadTick`).
- **Practice cards** (`.gk-pcard`, homepage "Today's practice"): quiz, fact and place-of-the-day
  cards, 28px corners, **tilted** on wide screens (−2.5°, 1.5°, 3°) and straightening on hover;
  swipeable on phones.

### Chips, inputs, small parts
- **`.gk-chip`** — round filter chips (e.g. /pulse); the chosen one is filled with `--ink`.
- **`.gk-input`** — search, contact form, dropdown: 16px corners, 2px border, edge shadow; accent
  border on focus.
- **`.gk-tbtn`** — article tool buttons (Save · Share · Text · Reading mode); the Reading one is amber.
- **Bottom sheets** (`components/article/Sheet.tsx`, `.gk-sheet`) — phones: Contents and Text
  settings rise from the bottom.
- **Keyboard focus** is always visible: a 2px `--accent` outline, 3px away.
- **Hand cursor** on everything clickable (owner's rule, 18 Sep).

### Article page (summary)
Left-aligned big title, subject pill, tools row, wide rounded cover, Contents on the left with
"N min left", ticking Key Takeaways, drop cap, Anton prev/next, a reading-progress line at the top.
**Reader settings** (`ReaderSettings.tsx`): text size, font, spacing, **warm light** (an orange
tint over the page, 10% or 20%, like Night Shift) and **spotlight** (dims every paragraph except
the one you're reading).

### Homepage order (`components/home/HomePage.tsx`, same for `/` and `/hi`)
1. **Hero on the stage** — giant motto words around the **3D Earth** (`HeroEarth.tsx`, three.js,
   loaded on demand; weak devices get a still photo), title + search, a Hindi/English button, the
   headlines ticker.
2. Today's practice (quiz · fact · place) → 3. Subjects bento → 4. Popular topic posters →
5. Motto band → 6. Latest headlines → 7. Atlas teaser ("Knowledge on the map", all subjects) →
8. Recently added + current affairs → Footer.

### Maps and the Atlas
The Atlas lives on the stage look but **follows Light/Dark**; only the Earth panel is always dark.
**Rule: no country borders on any map** — coastlines only — until India-compliant boundary data
exists.

---

# Pictures

- Every picture follows the **house style in `lib/image-style.ts`**: sepia pen-and-ink
  illustration on cream paper; real people are sketches, never photos; no text in images.
  **Do not change `lib/image-style.ts`** — it is the one source that keeps all pictures one family.
- In Reading mode, pictures in `main` are dimmed with `--img-filter`.

---

# Motion

Rules (from the 28 Oct motion work, still in force):
- **Quick:** menus open in 200 ms and close in 150 ms.
- **Small:** a fade plus a few pixels of movement; nothing bouncy.
- **Nothing inside an article's reading column animates.**
- **Everything switches off** for readers who asked their device for less motion
  (`prefers-reduced-motion`) — animations finish instantly instead.
- **Reading mode is calm:** no curtain, no cursor ring, the logo stops turning.
- The shared speed curve is `--ease-out-soft: cubic-bezier(0.2, 0.7, 0.2, 1)` (starts fast, settles gently).

What moves:
| Effect | Where | Notes |
|---|---|---|
| Menu / panel / toast / dialog animations | `.anim-menu-in`, `.anim-panel-in`… | 150–240 ms |
| **Page curtain + water loader** | `components/PageCurtain.tsx`, `lib/water-word.ts` | Clicking a link to another page sweeps up a deep-teal curtain; the next page's name is drawn as glass letters filling with sky-blue water, over a striped loading bar. Not for same-page filters, new tabs, Reading mode or reduced motion. Buttons that change page use `goWithLoader()`. |
| Scroll reveal | `components/ScrollReveal.tsx` | sections settle in as they scroll into view |
| Rising titles | `SectionHead` (`.gk-w`) | words rise one by one, 55 ms apart |
| Hero scroll effects | `components/home/HeroScrollFx.tsx` | the motto words part and the Earth turns as you scroll |
| Poster strip | `components/home/PosterPin.tsx` | moves sideways while you scroll (wide screens) |
| Motto band | `components/home/KnowMoreBand.tsx` | reacts to scroll speed and direction |
| Count-up numbers | `components/CountUp.tsx` | hero stats |
| **Card tilt + shine** | `components/PointerFx.tsx`, `.gk-tilt` | cards lean towards the mouse with a soft light under it — mouse only |
| **Cursor ring** | `PointerFx.tsx`, `.gk-cursor` | a faint ring follows the mouse; over a named thing it grows and shows the word — mouse only, never in Reading mode |
| Headlines ticker | `.gk-ticker` | scrolls slowly, pauses on hover |

---

# Responsiveness

Breakpoints actually used in the code (Tailwind defaults plus a few custom ones):

| Width | What changes |
|---|---|
| **up to 767px** (phones) | phone tab bar at the bottom, reading bar on articles, bottom sheets, full-screen menu, 16px side padding, article text 18px, swipeable practice cards, single round language button (below 640px) |
| **640px** (`sm`) | subjects bento goes to 2 columns, the `EN | हिं` switch appears |
| **768px** (`md`) | 32px side padding, header grows, the tab bar disappears |
| **1024px** (`lg`) | hero becomes the wide layout (giant words above and below the Earth), practice cards go side by side and tilt, bento 3 columns |
| **1280px** (`xl`) | the full search box appears in the header |
| **1400px** | the footer's Earth word stops growing |

Touch screens: no hover effects are relied on (tilt and cursor ring are mouse only; the bento's
"inside" list shows without hover), and the Earth can be dragged to spin.

---

# Design is separate from content

- **Design** = tokens (`globals.css`) + components (`components/`). **Content** = Payload CMS
  (articles, subjects, categories, news, quotes) and the MDX files.
- A redesign changes tokens and components only — it must never change content, slugs (the
  permanent page addresses), URLs or SEO fields.
- Words that belong to the layout (buttons, menus, headings of sections) live in
  `lib/home-text.ts`, `lib/site-text.ts`, `lib/page-text.ts`, not inside components.

---

# Scope

The redesign covers every current page (homepage, subjects, subject, category learning path,
topics, article, news, headlines, search, Read Later, about, contact, 404, Atlas, Gyaani) in
English and Hindi. A small daily quiz exists on the homepage and in Gyaani; a full quiz section,
accounts, notes and premium features are later work and will **extend** this system, not replace it.

---

# Important rules

1. **Use the tokens.** Colours, corners and shadows come from `globals.css`; don't hard-code hex
   values in components (the few fixed colours above are the exceptions).
2. **Add, don't scatter.** If a value is missing, add a token deliberately and record it here.
3. **Every new piece must work in all three modes** (Light, Dark, Reading) and in Hindi.
4. **Respect reduced motion** and keep article text still.
5. **No country borders on maps.** Coastlines only.
6. **Don't change `lib/image-style.ts`.**
7. **When a redesign changes something the owner approved earlier, say so and ask** (lesson from
   2 Nov, when the approved globe section had silently become a timeline).
8. **The code wins.** Update this doc whenever the design changes.

### Open items / to confirm
- **Phone designs:** owner said "every thing now seems to be good" (30 Oct); the TODO item is still
  open — to confirm it is finished.
- **Owner's full review** of the redesign happens once everything is built (not phase by phase).
- **Film grain** was part of the chosen Cinematic concept but I could not find it in the CSS — to
  confirm whether it was dropped.
- **Stale code comments** (comments only, no visual effect): the `.font-hindi` note in globals.css
  and the Noto note in layout.tsx still mention Source Serif 4 / Inter; `Button.tsx`'s header
  comment describes the 16 Sep look.

### History (for context only)
- **Jun–Sep 2026: "Academic Clarity"** — Source Serif 4 + Inter, navy/sapphire/emerald, 8px corners,
  1200px container, 720px reading column. Generated in Stitch, extracted into code 18–25 Jun.
- **16–17 Sep 2026:** one-button rule, serif article body, square corners (later reversed).
- **30–31 Oct 2026:** "Playful + Cinematic" redesign, phases 1–5, Atlas redesign.
- **2–3 Nov 2026:** water loader, new motto, whole site in Hindi (phases 1–4).
