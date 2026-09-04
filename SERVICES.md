# GKWorld360 — Third-Party Services

> Keep this file updated whenever: a service is added or removed · a card is added ·
> a new key/environment variable is introduced · or you learn a real usage limit.
>
> **Free tiers have several different limits, and the one that breaks you is rarely the
> obvious one.** On 14 Aug 2026 the site went down because of Neon's *network transfer*
> cap — while storage sat at under 2% of its allowance. Record every limit, not just the
> headline one.
>
> **Never write actual key values in this file — it is committed to Git.**

---

## Services With Card / Payment Method Added

| Service | Why card was added | Actual monthly charge |
|---|---|---|
| **Cloudflare R2** | Required to activate R2 even on free tier — identity verification by Cloudflare | ₹0 as long as storage stays under 10GB and requests stay under 1M/month |

**Safe limit reminder for Cloudflare R2:**
- 10 GB free storage = ~5,000 images at 2MB each
- 1 million requests/month = roughly 33,000 image loads per day
- At current scale (small site, few visitors) this will stay free for years.
- If you ever approach the limit, Cloudflare will notify you before charging.

---

## All Third-Party Services

### Vercel — Website Hosting
- **What it does:** Runs the Next.js website and makes it accessible on the internet 24/7
- **Free tier:** Generous — supports small to medium traffic easily
- **Paid plan:** ~$20/month when you need more bandwidth or team members
- **Card added:** No
- **Login:** Use GitHub to log in

---

### Neon — PostgreSQL Database
- **What it does:** Stores all article text, titles, dates, slugs, and metadata
- **Paid plan:** $19/month for more storage and compute
- **Card added:** No
- **Note:** Data is in standard PostgreSQL format — can be moved to any other PostgreSQL host if needed

**⚠️ Free tier has THREE separate limits — and the one that bites is NOT storage:**

| Limit | Allowance | Where we were on 28 Aug 2026 |
|---|---|---|
| Storage | 0.5 GB | **42 MB** — never a concern |
| Compute | ~191 CU-hours/month | 68 CU-hrs — fine |
| **Network transfer** | **5 GB/month** | **5.53 GB — EXCEEDED → total outage** |

**Network transfer is the number to watch.** It counts every byte the database sends to
the website. It has nothing to do with how much content we store — a tiny database can
blow through it easily if queries ask for more columns/rows than they need. This is what
took the site down on 14 Aug 2026 (see the incident write-up in `PROJECT_CONTEXT.md`).

- **Usage resets:** the 1st of every month. The dashboard shows "Usage since <date>".
- **When exceeded:** Neon refuses ALL connections with
  `53000 — Your project has exceeded the data transfer quota`. Nothing works until reset.
- **Where to check:** [console.neon.tech](https://console.neon.tech) → project → Usage/Billing.
- **Healthy target:** ~25 MB/day. At ~390 MB/day the monthly allowance is gone in two weeks.
- **Quick health check:** open `/api/health` on the live site — `200` = database reachable,
  `503` = unreachable, with the real reason in the JSON.

---

### Cloudflare R2 — Image Storage
- **What it does:** Stores all image files (JPG, PNG, WebP) uploaded through Payload CMS
- **Free tier:** 10 GB storage, 1 million Class A operations/month, 10 million Class B operations/month
- **Paid plan:** $0.015 per additional GB (very cheap)
- **Card added:** YES — required by Cloudflare even for free tier
- **No egress fees:** Unlike AWS S3, Cloudflare R2 does not charge when images are downloaded/viewed

---

### Google AI Studio — Gyaani Chatbot
- **What it does:** Powers the Gyaani AI chatbot using Gemini 2.5 Flash model
- **Free tier:** 15 requests per minute, limited daily quota
- **Paid plan:** Pay-as-you-go (very small cost per 1000 questions)
- **Card added:** No
- **API key location:** `.env.local` as `GEMINI_API_KEY` (never committed to Git)

---

### GitHub — Code Repository
- **What it does:** Stores all the website code with full version history (Git)
- **Free tier:** Unlimited for public and private repositories
- **Card added:** No

---

### cron-job.org — Scheduled Headlines Refresh
- **What it does:** Calls `https://gkworld360.vercel.app/api/pulse/sync` on a timer, which
  pulls fresh headlines from the news RSS feeds into the database. Without it the Pulse feed
  would only update when somebody happened to visit the site.
- **Free tier:** Free for this usage
- **Card added:** No
- **Schedule:** every 30 minutes (was every 15 — halved on 28 Aug 2026 to cut database usage)
- **Authentication:** sends header `Authorization: Bearer <CRON_SECRET>`. Without a valid
  secret the endpoint returns `401 {"error":"unauthorized"}`.
- **Where to see run history:** log in → **Cronjobs** → click the job → **History** tab.
  Shows each run's time and HTTP status. Free tier keeps only the most recent runs
  (~25), so it is a live view, not an archive.
  - `200` = worked (response lists how many headlines were added)
  - `500` = the site or database is failing — check `/api/health`
  - `401` = the Authorization header is missing or wrong

**⚠️ This runs 24/7 whether or not anyone is using the site.** A cron is a robot with a
calendar — it does not stop when you stop working. It was the main driver of the database
transfer that caused the 14 Aug 2026 outage. **If a cron is ever replaced, DELETE the old
one** — we were running two at once (this plus a GitHub Actions workflow, now removed),
doubling the load for no benefit.

**⚠️⚠️ cron-job.org AUTO-DISABLES a job after repeated failures — check this after ANY
outage (learned 4 Sep 2026).**

When the database went down on 14 Aug, this job started returning `500` on every run.
cron-job.org kept trying, then **silently switched the job off**. Last execution:
**25 Aug 2026 (Failed)**. It then did not run at all — for over a week after the database
recovered — and nothing warned us.

**How to spot it:** on the Cronjobs list, the **"Next execution"** column reads
**`Inactive`** instead of a future time. The History tab is blank because there is nothing
to show.

**How to fix it:** click **EDIT** on the job → turn the enable toggle back **ON** →
confirm the schedule and the `Authorization: Bearer <CRON_SECRET>` header are still
correct → **Save**. Then watch History for `200`s.

**How we detected it:** headlines had stopped arriving on schedule. Inserts in the database
showed 24-hour gaps instead of one batch every 30 minutes. What kept the feed alive at all
was the visit-triggered refresh (`after(() => ensureFresh())` in `lib/pulse.ts`), NOT the
cron — so the site looked fine while its scheduled job was dead.

**The general lesson: after any outage, verify your scheduled jobs are still ENABLED.**
Fixing the thing that broke does not automatically restart the robots that gave up on it.

---

### UptimeRobot — Site & Database Monitoring
- **What it does:** Checks `https://gkworld360.vercel.app/api/health` every 5 minutes and
  emails you when the result changes. That URL queries the database on every request, so
  this is effectively a live database alarm, not just a "is the website up" check.
- **Free tier:** 50 monitors, 5-minute checks, email alerts
- **Card added:** No
- **Added:** 28 Aug 2026
- **Monitor name:** `GKWorld360 database`

**Why it exists:** during the 14 Aug 2026 outage the site returned HTTP `200` and looked
completely healthy for **two weeks** while its database was dead — Vercel was serving
12-day-old cached HTML, because Next.js deliberately keeps serving the last good copy when
a background rebuild fails. Nothing alerted anyone. This monitor closes that blind spot.

**How to read the alerts:**
- Emails fire on **state CHANGES only**, not on every check — so a long outage does not spam you.
- A newly created (or edited, paused, or resumed) monitor starts in an "up" state before its
  first real check. That can produce a harmless **down → up → down** burst of emails.
  It does not mean the database recovered. Check the monitor's own log — every entry shows
  the real HTTP code (e.g. `HTTP 503 - Service Unavailable`).
- Genuine repeated flapping, each backed by real HTTP codes in the log, IS worth
  investigating — it would suggest connection-pool exhaustion or quota trouble.

**What the endpoint returns:**

| Response | Meaning |
|---|---|
| `200` `{"status":"ok","database":"reachable"}` | Everything healthy |
| `503` `{"status":"error","database":"unreachable", "error": …}` | Database unreachable — the JSON carries the real reason (e.g. Neon quota) |
| HTML error page instead of JSON | Payload itself failed to start — a code/deployment problem, not a database one (see the `sharp` incident in `PROJECT_CONTEXT.md`) |

---

## Environment Variables Reference

> **This table lists NAMES and LOCATIONS only — never the actual values.**
> This file IS committed to Git, so a real key written here would be public forever.

**A key usually lives in more than one place.** Local development reads `.env.local` on your
Mac; the live site reads Vercel's Environment Variables; and `CRON_SECRET` also has to be
known by cron-job.org. Changing a key means changing it in **every** place in the "Set in"
column, or something breaks.

| Variable | Service | What it is | Set in |
|---|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio | API key for Gyaani chatbot | `.env.local` + Vercel |
| `DATABASE_URL` | Neon | Pooled PostgreSQL connection string (used by the website) | `.env.local` + Vercel |
| `DATABASE_URL_DIRECT` | Neon | Direct PostgreSQL connection string (used for migrations) | `.env.local` + Vercel |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare | Your Cloudflare account identifier | `.env.local` + Vercel |
| `R2_BUCKET_NAME` | Cloudflare R2 | Name of the image storage bucket (`gkworld360-media`) | `.env.local` + Vercel |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 | R2 API access key | `.env.local` + Vercel |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 | R2 API secret key | `.env.local` + Vercel |
| `PAYLOAD_SECRET` | Payload CMS | Random secret string for encrypting Payload sessions | `.env.local` + Vercel |
| `CRON_SECRET` | cron-job.org | Password protecting `/api/pulse/sync` from public abuse | **Vercel (Production) + cron-job.org header** — deliberately NOT in `.env.local`, so local dev can trigger the sync freely |

### Where to keep the actual values

**Never in Git.** Code history is permanent — a key committed once is exposed forever.
That is why `.env.local` is listed in `.gitignore`.

Keep the real values in a **password manager** (1Password, or Bitwarden which is free) in a
single entry named *"GKWorld360 — keys"*. For each key record: the value, what it is for, and
**where it is set**. That last part is what future-you will actually need.

Bigger teams use dedicated secrets managers (HashiCorp Vault, AWS Secrets Manager, Doppler,
Infisical). Overkill at this size — a password manager is the right tool for now.

### If a key is lost or leaked

Most keys can simply be regenerated — generate a new one, update every place in the
"Set in" column, done. Two things to know:

- **`PAYLOAD_SECRET`** — changing it signs everyone out of `/admin`. Sessions are encrypted with it.
- **`DATABASE_URL` / R2 keys** — always re-copyable from the Neon and Cloudflare dashboards.

**Important:** environment variables in Vercel only take effect after a **redeploy** —
adding one changes nothing until the site is rebuilt.

Generate a fresh random secret with:
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```
