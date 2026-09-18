# GKWorld360 Content Pipeline

> **📌 How content gets onto the site** — the AI-assisted workflow that turns source
> material into published, bilingual articles, and every decision behind it.
> For the site's vision see `GKWORLD360_MASTER_BLUEPRINT.md`; for today's build status
> see `PROJECT_CONTEXT.md` in the project root.
>
> _Decided: 14 Sep 2026. Status: BEING BUILT — pieces 1, 6, P4-a, News parity, inbox and first article done (see §9). Last updated 16 Sep 2026._

---

## 1. The problem this solves

The site's product is its content. By September 2026 the platform had all its plumbing —
CMS, database, deployment, monitoring — but only ~13 articles, because **entering content
by hand through the admin panel takes 45–60 minutes per article** and the owner has
5–8 hours a week. Progress had stalled on data entry, not on code.

The pipeline removes the typing. It does **not** remove the reviewing — and must not,
because review is where wrong facts get caught.

---

## 2. The workflow (what a session looks like)

```
1. Owner photographs the pages for a topic or chapter on a phone
2. Photos land in a folder on the Mac (OUTSIDE the project) — or are dragged into chat
3. Owner tells Claude the subject and category  ← always, every time (see §4)
4. Claude extracts the FACTS from the pages and writes ORIGINAL articles,
   in English AND Hindi, in the site's standard shape (see §5, §6)
5. A script saves each article to Payload as a DRAFT, both languages, with
   a cover image and a private "facts to verify" note
6. Owner opens /admin, reads, checks the facts list, fixes anything, clicks PUBLISH
```

Nothing reaches the public site without step 6. The owner's effort per article is
one photo session and one review — roughly **8–15 minutes for both languages**, versus
45–60 minutes of typing.

**Where photos go (built 15 Sep 2026):** the owner sends them from the phone to the
Telegram bot **@Gkworld360_bot** — no laptop needed at that moment. `scripts/telegram-inbox.mjs`
later pulls them to `~/Desktop/gk-inbox/<batch>/` on the laptop, grouped per send with the
caption saved alongside. Claude reads them from there. Photos are **not** saved to the
project, the database, or R2 (once the webhook exists, only a ~200-byte "photo arrived"
record — Telegram file id + caption — is stored, never the image). **Never put source
photos inside the project folder** — they are copyrighted pages and must not enter git.
Tip: send pages upright, full width in frame, and "as file" where Telegram offers it
(skips compression, sharper text).

---

## 3. Copyright — the line, and why the pipeline is built where it is

The source books are **purchased, not authored** by the owner. That fixes the design:

- **Facts are not copyrightable.** Nobody owns "the Revolt began at Meerut on 10 May 1857."
- **Expression is.** An author's wording, structure, selection and sequence are protected.
  Rewriting a chapter in a friendlier tone is still a derivative of that chapter.

So the pipeline is **never** "here is a passage, rewrite it." It is:

```
extract the FACTS  →  write an ORIGINAL article from those facts,
                      in the site's own structure and voice
```

The book is a reference for *what to cover and in what depth* — the way any author uses
prior books. What lands on the site is new writing. This matches the site's own promise
("not copied, always original") and is also better web content than a transcribed textbook.
This rule is baked into the writing template (§5) so it does not depend on memory.

---

## 4. Subject and category — always asked, never assumed

**Claude asks the owner for the subject and category before creating anything, every
time.** It may *propose* one from the content ("this looks like History › Ancient India —
correct?") but never proceeds on its own guess.

Why: the first book maps neatly onto the blueprint's 18 subjects, but later books will not.
A book's chapter structure is the author's, not ours; only the owner can say where a topic
belongs on this site. One quick confirmation per chapter costs nothing; a mis-filed batch
of thirty articles costs an afternoon.

If the subject or category does not yet exist in Payload, Claude says so and asks before
creating it. (As of 14 Sep 2026 Payload holds **1 subject and 1 category** — `history` /
`modern-india` — so a one-time seed of all 18 blueprint subjects is a build item, §9.)

---

## 5. The writing template — rules every article follows

1. **Original text only.** Facts from the source; wording, structure and examples are new.
   Never paraphrase a passage.
2. **Both languages, always.** A topic is complete only when English and Hindi both exist.
   Hindi is written *from* the English draft — same facts, same headings in the same order,
   so a reader switching languages lands in the same place — but as **native Hindi in the
   competitive-exam register**, not translated English.
3. **Standard shape:**
   ```
   Title
   Description          (1–2 sentences — SEO and card previews)
   Introduction         (short)
   3–6 sections with headings
   Key Takeaways block  (5–7 bullets — the site's existing block)
   ```
   **Length follows the source** (decided 15 Sep 2026): a one-page section in the book gives a
   ~350-word article; a long chapter gives more. Never pad to hit a word target — padding means
   facts from memory, which is exactly what the grounding rule forbids. Hindi matched to English.
4. **Facts grounded in the source.** Dates, names and numbers come from the photographed
   pages, not from the model's memory. Most AI date errors come from writing without a
   source in front of it.
5. **A "facts to verify" list** accompanies every article: every date, number and name
   used, as a checklist — so the reviewer scans a table, not the prose. Stored in the
   private `reviewNotes` field (§7), together with which book and pages it came from.
6. **Reading `order`** set so the article slots into the right sequence in its category.

---

## 6. Image policy — everything is illustration

**Nothing on the site claims to be a photograph.** Decided 14 Sep 2026.

| Subject of image | Approach |
|---|---|
| **People** | **Always a sketch**, house style. No photographs of people, ever. |
| Concepts (cells, circuits, cycles) | AI-drawn diagrams (SVG — constructed, therefore accurate) |
| Events, places, monuments | Stylised illustration in the house style — not a photo-realistic recreation |
| Covers / decorative | AI-generated, house style |

**Why sketches for everyone, including Gandhi and Nehru who have photographs:** consistency
and honesty. A sketch never claims to be a photo, so there is nothing to "get wrong"; every
figure is treated identically; no licensing questions; fully automatable. Textbooks use
artist sketches for pre-photography figures (Mangal Pandey, Rani Lakshmibai) — every image
of them is an artist's guess — so an AI sketch is no different in kind. A sketch of a famous
figure should still be *recognisable*; if a portrait comes out looking like the wrong
person, that is a "regenerate" case, not a reason to abandon the rule.

**House style:** one consistent prompt (e.g. "pencil sketch, sepia tones, textbook
illustration style") so the whole site has one visual voice.

**Generation:** the pipeline requests **three candidates in one go** per article via the
Gemini API; the owner picks one in `/admin`. **If API image generation proves unavailable
or blocked, the fallback is manual:** the owner generates an image in the free Gemini /
ChatGPT app (or takes one from a free source) and uploads it in `/admin`. Rejected
candidates are deleted from both `/admin` and R2 so nothing accumulates.

**Storage is not a constraint.** The Media collection already resizes to 1600px and converts
to WebP at 80% (~150–300 KB per image). Even 3,000 images ≈ 900 MB against R2's 10 GB
free tier. The only real cost of extra candidates is generation calls, not storage.

**Cost:** whether Gemini image generation via the API is free-within-limits or paid changes
over time and is to be **verified at build time**, not assumed. The pipeline must work
either way: respect a daily quota, and never fail an article because an image did not
arrive — leave the draft without an image and pick it up next run.

---

## 7. Draft mode and the review step

- Payload `versions: { drafts: true }` on Articles. Every article has a status:
  **Draft** (visible only in `/admin`) or **Published** (live).
- The pipeline **only ever creates drafts.** The owner publishes.
- With localisation, one document holds both languages, so **one Publish click publishes
  both** — the "complete when both exist" rule, enforced by the system.
- The public site queries only `_status: published`.
- **`reviewNotes`** — a new admin-only field on Articles, never rendered publicly. Holds the
  facts-to-verify checklist and the source book/pages, giving a private provenance log
  per article for later fact-checks.

**Duplicates:** before creating, Claude checks Payload articles (by slug *and* similar
title), existing drafts, and the MDX folder. If anything matches, it explains **why** it
looks like a duplicate and asks: skip, or create anyway. It never overwrites and never
decides alone.

**Review pacing:** drafts wait. Photograph a chapter, get 5–10 drafts, review them across
the week in twenty-minute slots. Hindi review can be lighter than English — the facts were
already checked in English; Hindi review is mostly "does this read naturally?"

---

## 8. The honest numbers

AI removes the typing, not the reviewing.

| | Per topic (both languages) | One book (~300) | All books (~1,000) |
|---|---|---|---|
| Writing by hand | 90–120 min | never | never |
| **Reviewing AI drafts** | **8–15 min** | **40–75 h ≈ 2–3 months** | **130–250 h ≈ 6–10 months** |

At 5–8 hours a week. Roughly ten times faster than by hand, and — more importantly —
possible at all.

---

## 9. Build list (in order — each piece is useful on its own)

| # | Piece | Status |
|---|---|---|
| 1 | **Draft mode** on Articles + public site shows only published | ✅ **done 14 Sep** — verified: a test draft returned 404 publicly while the published article still rendered from the CMS. ⚠️ Enabling drafts set the existing article to `draft`; corrected to `published` via SQL. Any future collection getting drafts needs the same one-off check. |
| 2 | **Seed all 18 subjects** into Payload (names, slugs, colours) — one-time | ⬜ |
| — | **Telegram inbox** (`scripts/telegram-inbox.mjs`) — photos from phone → `~/Desktop/gk-inbox/` | ✅ **done 15 Sep**, tested end to end (polling; will move to the webhook once deployed) |
| — | **Current Affairs (News) parity** — draft mode, published-only queries, Hindi rendering, language toggle, Hindi links in `/news` + homepage listings. Decided 15 Sep: articles and news must work identically so both go through the same pipeline. Existing Smart Border item re-saved (versions) + set published on dev. | ✅ **done 15 Sep** |
| — | **First article by hand** — "The Portuguese in India", EN+HI, draft #3 on the dev branch | ✅ **done 15 Sep** — proved the flow before automating |
| 3 | **`reviewNotes`** admin-only field on Articles | ⬜ |
| 4 | **Writing template** — bilingual, original-not-paraphrase, standard shape, house style | ⬜ |
| 5 | **Ingestion script** — creates the draft in both locales, duplicate check, `order` | ✅ **done 17 Sep** — `lib/ingest.ts` (draft JSON → Lexical nodes → Payload draft, EN then HI on one document, duplicate-slug refusal) behind a **dev-only** route `POST /api/ingest` (404 in production; prints the DB host; production writes need `"production": true`). Thin clients: `node scripts/create-article-draft.mjs drafts/<slug>.json`, `node scripts/delete-article.mjs <id>`. Why a route, not a script: Payload's loader fails under Node 26 + tsx outside Next. Draft files live in `drafts/` (our original text only — never book scans). First use: "The Dutch in India" → draft #5 on dev. Also `add-hindi` action (`node scripts/add-hindi.mjs drafts/<slug>.hi.json`): adds Hindi to an EXISTING English article by walking its body and swapping each block's text from a `{ english: hindi }` map — images, tables and lists keep their place; refuses if any block is missing a translation. First use: Hindi for "The Revolt of 1857" (17 Sep, draft on #1). Also added: `publishedDate` auto-fills on first Publish (hook in `collections/Articles.ts`). |
| 6 | **Hindi rendering from the CMS** | ✅ **done 15 Sep** — `/hi/…` URLs now ask the CMS for the Hindi locale. `getCMSArticleLanguages()` checks which languages REALLY exist first (Payload's `fallback: true` would otherwise serve English on a Hindi URL). `CMSTopicView` gained the English\|हिन्दी toggle + Devanagari font. hreflang emitted when both exist. Verified on the Portuguese draft: Hindi title, Hindi headings, zero English leakage; Revolt of 1857 still falls back to its `.hi.mdx`. |
| 7 | **Image generation** — three candidates via Gemini, upload to R2, attach; manual fallback | ⬜ |
| 8 | **Topic tracker** — done / drafted / pending, once volume needs it | ⬜ |
| 9 | **Telegram "draft ready" ping + approve-from-phone** (for BOTH articles and news) — one bot (`@Gkworld360_bot`) via a webhook on Vercel: records incoming photos to a tiny DB table (file_id + caption only, ~200 bytes; the image never touches Neon/R2), sends the draft notification with the facts list + **[Publish]** button, and a confirmation tap before publishing. Only the owner's chat ID is accepted; Telegram's secret token verified. Real drafts must live on the PRODUCTION DB for this to work. | ⬜ **next** |
| P4-a | **Category + subject listings from CMS** — merged with MDX (CMS wins on a clash), sorted by `order` then title; Hindi link on the card comes from the CMS for CMS topics. `getCMSArticlesInCategory` now uses `locale:"all"` in one query to know whether Hindi exists. | ✅ **done 16 Sep** |

**Technical notes learned building this (15 Sep 2026):**
- Payload stores rich text as **Lexical JSON**. The exact node shapes (root / heading / paragraph / text / `keyTakeaways` block with `version: 2`) were copied from the existing Revolt of 1857 article and used directly — no converter needed for our own generated content.
- **Drafts live in the versions table** (`_articles_v` + `_articles_v_locales`), NOT the main `articles` table. The main table holds only the last *published* state. `payload.create({draft:true})` writes the main row (status draft) + a version; `payload.update({draft:true, locale:"hi"})` adds the Hindi to a new *version* only. Publishing promotes the latest version to the main table — both languages together.
- **⚠️ Enabling drafts HIDES pre-existing documents from the admin list.** The admin's list view reads the *versions* table, and documents created before drafts were enabled have no version rows — so they vanish from `/admin` (still in the DB, still on the public site). Fix: re-save each one through Payload (`update({ id, draft:false, data:{ _status:"published" } })`, or open its direct URL `/admin/collections/articles/<id>` and click Publish). **Done on dev 15 Sep for article #1 AND news #1; MUST be done on production after the draft-mode deploy** for both. Also: enabling drafts sets existing rows to `_status = draft` — they must be set to `published` (SQL or re-save) or the public site falls back to MDX / 404s them.
- **To unpublish via the Local API use `draft: false` + `_status: "draft"`.** `draft: true` merely saves another draft version and leaves the main row published (caught in testing).
- **Bilingual = one document, two locales.** Create with `locale: "en"`, then `update` the same id with `locale: "hi"` for the localized fields only.
- Length follows the source: a one-page section produced ~350 words per language. Do not pad with facts from memory. Facts the model adds for context (e.g. "Calicut is on the south-western coast") are listed separately in the verify list as **not from the book**.

---

## 9b. Dummy content removed (16 Sep 2026)

The site's only pre-pipeline content was **sample data built on 23–25 Jun 2026** while the
page templates were being designed — 3 history articles + 1 news item (with 2 Hindi twins),
NOT the "13 articles" mistakenly quoted earlier. The owner decided it was all dummy and
deleted it, so the site now carries only pipeline content. Order mattered: **P4-a was wired
first**, otherwise `/history/modern-india` would have listed nothing after the files went.

Still on disk: the 7 `overview.mdx` files (subject/category intro text). Subject and
category pages need them to render; they move into the Subjects/Categories collections
when the 18 subjects are seeded.

Still in the CMS from the June/July tests: article #1 "Revolt of 1857" (English only) and
news #1 "Smart Border Project". Whether those two also go is the owner's call — see chat.

## 9c. Where content is created (decided 18 Sep 2026)

**Content is created on the Vercel site's database (the Neon `production` branch), as drafts.**
Drafts are invisible to readers, so there is no risk; the owner reviews in `/admin` on the
Vercel site and presses Publish. The dev branch is for CODE work only — refresh it from
production in Neon ("Reset from parent") whenever a code change needs current data.

How, without editing `.env.local`: `npm run dev:prod` starts a SECOND local server on
**port 3001** pointed at production (`DATABASE_URL_PRODUCTION` in `.env.local`, own build folder
`.next-prod/`). It prints the host on start. Every ingest script takes `--production` → talks to
3001; without it → 3000 (dev). The route refuses production writes without the flag.

Tools (all `node scripts/…`): `create-article-draft.mjs <draft.json>` · `add-images.mjs
<images.json>` · `add-hindi.mjs <hi.json>` · `export-article.mjs <slug>` → `import-article.mjs
<export.json>` (whole article, images dropped) · `delete-article.mjs <id>`.

First run, 18 Sep: Portuguese (import), Dutch + English (drafts + images), Revolt Hindi — all
now drafts on the Vercel site, awaiting the owner's Publish.

## 10. Decisions log

| Date | Decision | Reason |
|---|---|---|
| 14 Sep | AI drafts, owner reviews and publishes; never auto-publish | Exam facts must be human-checked; a plausible wrong date is worse than no article |
| 14 Sep | Original writing from extracted facts — never paraphrase | Source books are purchased; facts are free, expression is not |
| 14 Sep | Both languages every time | A topic is complete only when a student can read it in either |
| 14 Sep | Everything is illustration; people are always sketches | Consistent, honest, automatable; textbooks do the same for pre-photo figures |
| 14 Sep | Three image candidates per article; manual upload as fallback | Choice without extra effort; storage is not a constraint |
| 14 Sep | Subject + category always confirmed with the owner | Later books will not match the blueprint's structure |
| 14 Sep | Duplicates: detect → explain → owner decides | Never silently overwrite reviewed work |
| 14 Sep | Review in `/admin`, not files | Edit in the real editor; simplest to build |
| 14 Sep | Photos never enter the project folder | Copyrighted pages must not reach git |
