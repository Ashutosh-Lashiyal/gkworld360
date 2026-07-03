# GKWorld360 — Third-Party Services

> Keep this file updated whenever a new service is added or a card is added to a service.

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
- **Free tier:** 3 GB storage (enough for hundreds of thousands of text articles)
- **Paid plan:** $19/month for more storage and compute
- **Card added:** No
- **Note:** Data is in standard PostgreSQL format — can be moved to any other PostgreSQL host if needed

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

## Environment Variables Reference

All secret keys and connection strings are stored in `.env.local` in the project root.
This file is never committed to Git — your keys stay private on your machine only.

| Variable | Service | What it is |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio | API key for Gyaani chatbot |
| `DATABASE_URL` | Neon | Pooled PostgreSQL connection string (used by the website) |
| `DATABASE_URL_DIRECT` | Neon | Direct PostgreSQL connection string (used for migrations) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare | Your Cloudflare account identifier |
| `R2_BUCKET_NAME` | Cloudflare R2 | Name of the image storage bucket (`gkworld360-media`) |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 | R2 API secret key |
| `PAYLOAD_SECRET` | Payload CMS | Random secret string for encrypting Payload sessions |
