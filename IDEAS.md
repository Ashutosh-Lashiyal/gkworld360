# GKWorld360 — Ideas Backlog

> A **parking lot** for ideas as they come up — captured *before* they're committed
> to the plan. Raw and half-formed is fine here.
>
> When an idea is **decided**, it graduates to `docs/GKWORLD360_MASTER_BLUEPRINT.md`
> (roadmap) or `PROJECT_CONTEXT.md` (near-term task). This file stays messy on purpose,
> so the Blueprint stays clean and trustworthy.
>
> **Status legend:** 💡 raw idea · 🤔 considering · ✅ decided (moved to the plan) · ❌ dropped

---

## 💡 Donation feature (keep the site free + running)
**Added:** 14 Jul 2026 · **Status:** 💡 raw idea (future)

Let readers **donate** to cover the site's running costs (server, database, image storage, domain,
any paid APIs). Framing: the site is free because of donations — and if donations aren't enough,
**some features may have to become paid** in the future. Honest, transparent ask.

**The counter idea:** a visible meter showing:
- **Total needed** this period = site running costs **+ a small amount for the founder's own purpose**
  (clearly *not* used for the site)
- **Total received** so far
- **Resets every month** (fresh goal each month).

**Implementation notes (for when we build it):**
- Needs a **payment gateway** — for India, **Razorpay** or **UPI** (or a simple "Buy me a coffee"-style
  service); Stripe for international. All charge a small per-transaction fee.
- The counter needs to **store donations** (a small table/collection) and total them; ideally updated
  automatically via the gateway's **webhooks**, or manually entered to start.
- **Monthly reset** = show the current calendar month's total vs goal.
- **Trust matters:** showing goal-vs-received transparently builds donor confidence. One honest
  consideration — publicly listing a "founder's personal cut" alongside "site costs" is unusual and
  *could* dent donor trust; worth deciding how to frame that (e.g. a modest "supports the creator" line)
  before launch.
- Likely a **post-MVP** feature (needs real traffic first — donations follow an audience).

---

## 🤔 User accounts / login (unlocks synced "Read Later" + more)
**Added:** 14 Jul 2026 · **Status:** 🤔 planned for a later phase

The "Read Later" feature (built 14 Jul 2026) currently uses **browser localStorage** — no login
needed, but it has two limits we must accept for now:
1. The saved list is **per-device** (a user's phone list ≠ their laptop list).
2. If the user **clears their browser storage**, the list is gone.

**Adding user accounts (login/signup) fixes BOTH** — the saved list would live on the server tied to
the account, so it syncs across devices and survives browser clears. When we build accounts:
- Migrate "Read Later" from localStorage → per-user server storage (Neon), syncing across devices.
- This also unlocks other account features (bookmarks, notes, progress) already in the Blueprint's
  post-MVP roadmap.
Until then, the UI must clearly tell users about the two localStorage limits (device-specific + lost
on browser-clear) and that login (coming later) will solve them.

---

## 💡 Listen to the article (text-to-speech audio)
**Added:** 8 Jul 2026 · **Status:** 💡 raw idea

Let users **listen** to a full article instead of reading it — a "Play / Listen" button
that reads the whole article aloud. Good for accessibility (visually impaired readers),
commuters, and people who prefer audio over reading.

**Rough approaches to explore later:**
- **Free — browser built-in (Web Speech API):** the visitor's browser reads the text aloud.
  No cost, works instantly, but voices are robotic and Hindi quality varies by device/OS.
  A good *first experiment*.
- **Paid — cloud text-to-speech (Google Cloud TTS / Amazon Polly / ElevenLabs):** natural,
  human-like voices with solid Hindi support, but costs per character. Audio could be
  pre-generated when an article is published and stored in **Cloudflare R2** (so it's
  generated once, not every play).

**Key considerations:**
- Must work for **both English and Hindi** (Hindi voice quality is the main deciding factor).
- Start free (browser) to prove people use it; upgrade to cloud voices later if worth the cost.

---

## ✅ Auto-updating "Latest News" feed — Zerodha Pulse model (RSS aggregation)
**Added:** 13 Jul 2026 · **Status:** ✅ BUILT (v1, 14 Jul 2026) — homepage "Latest Headlines" section + `/pulse` page

**BUILT:** `lib/pulse.ts` (fetch/parse/normalize/cache via rss-parser, 30-min revalidate, + `diversify()`
round-robin so no category floods), `components/LatestHeadlines.tsx` (CARD grid matching SubjectCard —
image on top, text below, source badge, 📰 fallback when no image), `components/LatestHeadlinesSection.tsx`
(homepage teaser, 6 items, placed after Explore Subjects), `app/(frontend)/pulse/page.tsx` (full feed, 40).
**10 feeds across 5 categories (2 each):** National, International, Sci-Tech, Business, Sports — from
**The Hindu, Indian Express, LiveMint**. Balanced so homepage 6 shows all 5 categories. Links out with
nofollow + source attribution. **TODO v2:** add PIB (English + Hindi feeds), category filter tabs on
/pulse, "Daily GK fact" complement. Original plan below (kept for reference).

A section that **auto-refreshes with the latest news** so the site always has something fresh,
even on days the founder doesn't post. IN ADDITION to the manually-written Payload news (which
stays — original, exam-focused articles). **Model to copy: Zerodha Pulse.**

**How it works (Pulse model):**
- Pull from news sites' **RSS feeds** (free, no API key): PIB, The Hindu, Indian Express, LiveMint, etc.
- Combine + sort by time; show **headline + short excerpt + source name + timestamp**.
- Click → **redirects to the original source** (we host nothing, just link out).

**Why it's copyright-safe (validated):** RSS feeds are published *specifically* to be syndicated —
the site is inviting aggregation, and the link-out sends them traffic. The safe boundaries:
- ✅ Use only the **excerpt the RSS feed provides**; ❌ never scrape the full article body.
- ✅ Always show **source name + link**; ❌ never strip attribution or pass it off as ours.
- ✅ Only sites that **offer public RSS**; ❌ no paywalled/no-RSS sources.

**Relevance filter:** exam-relevant sources only (national, polity, economy) — skip sports/entertainment.
**Cost:** free (RSS, no API).

**What news to show (categories, decided 13 Jul 2026):** exam-relevant current affairs ONLY —
National, Polity & Governance (bills/schemes/appointments), Economy (RBI/budget), International Affairs,
Science & Tech (ISRO/defence), Environment, Defence & Security, Awards/Govt schemes, major Sports
*achievements*. EXCLUDE: entertainment/celebrity, gossip/lifestyle, stock tips, sensational crime,
clickbait, detailed sports scores. Test: "would this be in a current-affairs exam book?"
Filtering mechanism: (1) subscribe to **category-specific feeds** (e.g. The Hindu's National / Business /
Sci-Tech feeds), not the "everything" feed — does ~90% of the work; (2) optional keyword filter as a
light second pass.

**Sources (starter set, decided 13 Jul 2026):** quality > quantity — 4-5 trusted, exam-respected feeds.
- **PIB** (Press Information Bureau) — official govt releases, exam gold (schemes/policy/appointments)
- **The Hindu** — the aspirant's paper (national/international/sci-tech)
- **The Indian Express** — governance + "Explained"
- **LiveMint / Business Standard** — economy (RBI/budget)
- Optional: News On AIR, PRS Legislative, Down To Earth (environment)
**Start with ~3** (PIB + The Hindu + one economy source), expand later. **Caveat:** confirm each
source's CURRENT RSS feed URL works at build time (feed URLs change).

**Auto-update:** the homepage feed refreshes itself — we re-fetch the RSS every ~15-30 min (via
caching / revalidation), so new headlines appear automatically; the founder never touches it.

**Design requirement — must look NATIVE, not a bolted-on widget:** do NOT use a third-party
embed/iframe/widget (those bring foreign styling). Instead **fetch the raw RSS data ourselves and
render it with OUR OWN components** (site fonts Source Serif/Inter, navy/sapphire palette, same card
style). Keep a **subtle "via [source] ↗" attribution + external-link cue** — legally required
(attribution) and honest UX; done tastefully it reads as polished, not foreign. Because we control
fetch + render, we control every pixel — the native look is the natural outcome of the RSS approach.

**Homepage section design (decided 13 Jul 2026):**
- **Layout = compact headline LIST (Pulse-style), with a small thumbnail ONLY when the feed provides
  a good image, else clean text-only.** Chosen because RSS images are UNRELIABLE (some feeds have them
  via media:content/media:thumbnail/enclosure, many don't, quality varies) — a pure image-grid would
  leave broken/placeholder cards. Zerodha Pulse itself is mostly text for this exact reason.
- **Naming:** "**Latest Headlines**" (this aggregated feed) vs "**Current Affairs**" (the founder's own
  written Payload news) — distinct names so users know depth vs quick-headlines.
- **Placement:** high on the homepage (after Hero or after Explore Subjects) — it's the freshness engine.
- **Access:** homepage shows a **teaser (top ~5-6)** + "**View all headlines →**" link to a **dedicated
  feed page** (`/pulse` or `/latest`) with the full continuously-updating feed; optional header nav link.

**On-brand alternative / complement:** a **"Daily GK fact" / "This day in history"** rotating from
OUR OWN content — daily freshness, zero external dependency, 100% ours. Consider building too/first.

---

## 🤔 Month-wise sections for news (May 2026, June 2026, …)
**Added:** 13 Jul 2026 · **Status:** 🤔 considering — fold into the `/news` listing build

Organise the manually-written CMS news into **month sections** by `eventDate` (a May-dated item →
"May 2026" section, June → "June 2026", etc.). Matches how exam aspirants study current affairs.
**No schema change needed** — News already has an `eventDate`. Likely also add month archive pages
(e.g. `/news/2026/05`). This is really part of building the `/news` listing page (a Phase 4 follow-up),
so build that listing grouped-by-month from the start.

---

## 🐛 /contact page — duplicate React key warning
**Added:** 16 Jul 2026 · **Status:** 🐛 minor bug — fix when convenient

The browser console logs *"Encountered two children with the same key"* on **/contact**. Something on
that page renders a list (a `.map()`) with **non-unique `key` props** (likely using a repeated value
or a hard-coded key). Harmless visually, but React keys must be unique. Fix: find the `.map()` on the
contact page and give each item a unique `key`. Spotted 16 Jul 2026 while debugging the headlines feed.
