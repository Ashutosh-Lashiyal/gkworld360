# GKWorld360 — THE task list

> **The one list.** Every task we agree to do goes here the moment we agree it, with the date
> and where it came from. Nothing is "remembered"; if it isn't here, it isn't planned.
> Claude adds items as decisions happen and moves them to Done when shipped; the owner
> reorders and cuts. Read this at the start of every session, after PROJECT_CONTEXT.md's
> START HERE block.
>
> Started 18 Sep 2026 after the Telegram piece (agreed 14 Sep) kept slipping unnoticed.
> Sections: **Now** (this week) · **Next** (queued, in order) · **Later** (agreed, no date) ·
> **Ideas** (not agreed — see IDEAS.md for the thinking) · **Done** (newest first, with date).

---

## 🔴 Now

- [ ] **Homepage not rebuilt after a sync — fix the "rebuild" step.** Found 9 Oct: the homepage
      was built at 01:33 UTC, the 02:00 and 04:00 UTC syncs both saved new headlines, and the
      homepage was rebuilt by NEITHER. It only rebuilds on its 6-hour timer or a deploy, so it drifts
      up to ~6 h behind `/pulse` (which is built per visit). Likely cause: since 7 Oct the
      `revalidatePath` calls run inside `after()` — after the reply to cron-job.org — and Next does
      not act on them that late (before 7 Oct they were never reached: the 30 s timeout killed the
      function first). So the cron's rebuild step has probably **never** worked in production.
      Also means the 8 Oct "unstable_cache tags don't work" diagnosis was the wrong layer.
      **Plan:** a tiny URL that only calls `revalidatePath` inline (<1 s, fits the 30 s limit),
      called by cron-job.org a few minutes after each sync. **Test that the homepage's `age` resets
      before calling it done.** Correct PROJECT_CONTEXT.md / SERVICES.md in the same change. *(9 Oct)*
- [ ] **Compute after removing the headline data cache (9 Oct):** `/pulse` now reads the database
      on every visit. Check Neon tomorrow — if well above ~0.7 CU-hrs/day, `/pulse` needs to become a
      static page with filtering/paging in the browser. *(9 Oct)*
- [ ] **Watch the compute meter for a few days.** 32.46 CU-hrs at 10:11 IST on 7 Oct. With the
      2-hourly cron running, expect **~0.7/day** → ~50 of 100 by 31 Oct. Much above that, dig again
      (first suspects: bot probes to `/admin` and `/api/*`, which talk to the database directly and
      cannot be cached). Neon → Usage; the Monitoring chart on **Last day** should now show grey
      "ENDPOINT INACTIVE" gaps. *(7 Oct)*
- [ ] **Republish #3, #4, #5 on the Vercel site** — turned back into drafts by `write-prompts`
      (tool since fixed); `node scripts/publish-article.mjs 3 4 5 --production` or Publish in /admin. *(18 Sep)*
- [ ] **Brainstorm: accounts → highlights → quiz** — design conversation first (who logs in,
      what a highlight is, where quiz questions come from, email vs Google), then a branch with
      the schema pushed via `npm run dev:prod` before deploying. *(agreed 18 Sep)*
- [ ] **Telegram "draft ready" ping + approve-from-phone** — pipeline piece 9, one bot
      (`@Gkworld360_bot`) via a webhook on Vercel; creates drafts on the Vercel site's database;
      both guards (facts list in the message + confirmation tap). Removes the laptop from the
      content loop. *(agreed 14 Sep — slipped three times; do not let it slip again)*
- [ ] **Before launch — make `/api/health` cheap** (a real database query at most every 6 hours,
      the last known result in between) so UptimeRobot can go back to frequent checks without
      pinning the compute awake. Blocks re-enabling fast alerting. *(6 Oct)*

## 🟠 Next (in order)

- [ ] `/topics` page restyle to board 9 (approved 16 Sep; data already fixed, look still old). *(16 Sep)*
- [ ] `/about` page onto the page system (still white/rounded/emoji cards). *(18 Sep)*
- [ ] Hindi names for Subjects and Categories in the CMS — labels on Hindi pages read English. *(17 Sep)*
- [ ] Seed the 18 subjects into the CMS (11 show "coming soon"); decide the 18th. *(pipeline piece 2, 14 Sep)*
- [ ] `reviewNotes` admin-only field on Articles (facts-to-verify list stored in the CMS, not in the
      draft file) — schema change, batch with the accounts schema. *(pipeline piece 3, 14 Sep)*
- [ ] More quotes: Claude drafts a verified pool (~60), owner skims, `add-quote.mjs --production`;
      owner generates portraits with the prompt in /admin. *(18 Sep)*
- [ ] Prev/next cards on the article page styled per board 2 (TopicNav still old). *(16 Sep)*
- [ ] Writing template as a checked document (pipeline piece 4 — the rules exist in the doc;
      turn them into the checklist Claude follows and the owner reviews against). *(14 Sep)*

## 🟡 Later (agreed, no date)

- [ ] **Going live:** buy domain → point at Vercel → `NEXT_PUBLIC_SITE_URL` →
      `SITE_INDEXING_ENABLED=true` → Search Console. Owner decides "enough content" first. *(Jul; env names 18 Sep)*
- [ ] Dev's own R2 bucket (dev and the Vercel site share one; same filename = same picture). *(17 Sep)*
- [ ] Automated image generation (3 candidates via Gemini, upload, attach) — **only if Gemini billing
      is enabled**; prompts are ready (`lib/image-style.ts`); set a budget alert in the same step. *(pipeline piece 7)*
- [ ] Topic tracker — done / drafted / pending per book section, once volume needs it. *(pipeline piece 8)*
- [ ] Gyaani: "search first, send only the top matches" once articles reach the hundreds
      (today the whole site's text goes to Gemini per question). *(17 Sep)*
- [ ] Gyaani rate limits to a real store (Upstash) if traffic grows — today in-memory, resets on cold start. *(17 Sep)*
- [ ] Search: smarter matching (typos, word stems) — today plain "contains" with the agreed ranking. *(16 Sep)*
- [ ] Month archive pages for news (`/news/2026/05`); listing already groups by month. *(IDEAS, 13 Jul)*
- [ ] Popular Topics = real view counts (today "popular" = recent). *(16 Sep)*
- [ ] Headlines search (RSS items aren't in the search index; would need its own lookup). *(16 Sep — owner said leave for now)*
- [ ] Revolt of 1857: delete stray empty paragraphs/heading at the end; Smart Border: shorten
      description to ≤220 chars. *(owner, in /admin)* *(17 Sep)*
- [ ] Payload `/admin/login` hydration warning in dev console (Payload's own; check after next Payload update). *(18 Sep)*
- [ ] Backups before Phase 5-style data work (a Neon branch snapshot before big content moves). *(14 Sep)*

## 💡 Ideas (not agreed — thinking lives in IDEAS.md)

- Donation feature with a monthly goal (IDEAS, 14 Jul)
- Listen to the article — text-to-speech (IDEAS, 14 Jul)
- Exam tags on topics (blueprint: "no exam tags yet")

## ✅ Done (newest first)

- 7 Oct (later) — Homepage and /pulse disagreed: the cron's "refresh the pages" step was being
  killed by the 30 s timeout, and tag revalidation used the longest stale window ("max" → "seconds").
  Headline times ("28m ago") were being cached too, so they froze and differed between pages — now
  computed in the browser (`components/TimeAgo.tsx`).
- 7 Oct — **Compute fix confirmed working: 32 → 32.46 in 24 h (+0.46/day vs ~6 before).**
  Separately found the headlines cron had been switched OFF since the September suspension
  (news only refreshed once a day by Vercel's cron); owner re-enabled it. `/api/pulse/sync` now
  replies immediately and syncs afterwards (cron-job.org's 30 s timeout was recording every
  successful run as a failure → auto-disable); `/api/health` now reports the newest headline's
  age and returns 503 when syncing stalls for over a day.
- 6 Oct — **Found the real cause of the compute burn: UptimeRobot was hitting `/api/health`
  (which queries the database) every 5 minutes, against Neon's 5-minute sleep timer — the compute
  never slept, ~180 CU-hrs/month.** Monitor moved to 24 hours. Lesson written into SERVICES.md.
- 5 Oct — Real cause of the compute burn found and fixed: `/`, `/pulse`, `/topics`, `/search`
  queried the database on every request (bot traffic kept the compute awake 24/7). Headlines no
  longer sync during page renders; the cron revalidates instead; all DB reads cached behind tags;
  safety timers 1 h → 6 h; **missing `tags:` on four `unstable_cache` calls fixed — the Sep
  refresh-on-save hooks had been doing nothing**.
- 21 Sep — Neon compute fix: pages cached 1 hour (was 60 s), refresh-on-save hooks on Articles/
  News/Subjects/Categories/Quotes (`lib/refresh.ts`), cron 30 min → 2 h (owner), SERVICES.md
  corrected (100 CU-hrs, not 191). New flat logo + favicons; OG card safe-zone + Devanagari fix;
  share-menu icons; R2 audit (13 files, 3 MB, one dead record).
- 18 Sep — Share button on articles + current affairs (phone share sheet on touch devices; Copy /
  WhatsApp / Telegram / X / Email menu with a mouse); branded link-preview cards (`/api/og`) on every
  page incl. Hindi; doubled " | GKWorld360" titles fixed.
- 18 Sep — Quotes collection + daily rotation + pinning; image prompts in /admin (articles, news,
  quotes); footer with quote; Read Later page rebuilt (red Clear all + confirmation); hand cursor;
  book loader (800 ms); headline tags with agency favicons; content workflow moved to the Vercel
  site (`npm run dev:prod`, `--production` scripts, export/import); four articles published on the
  Vercel site; Gemini key confirmed free tier (no budget alert needed).
- 17 Sep — Friend's review: square corners, bell in corner, subject-card counts, editorial article
  page (progress bar, takeaways first, contents rail), quiet title blocks everywhere; Gyaani reads
  the CMS + guardrails; real site stats; unified search ranking; ingestion route + scripts;
  Dutch + English articles; Revolt Hindi; add-hindi / add-images tools.
- 16 Sep — Redesign phases 1–6 on branch `redesign`; review round 1; sitemap/llms.txt from CMS.
- 15 Sep — Neon dev/production split; first bilingual CMS article by hand; Hindi from CMS.
- 14 Sep — Content pipeline designed; draft mode built.
- 4 Sep — Outage fully resolved; CMS-only articles render; SEO metadata fixed; prune bug fixed.
