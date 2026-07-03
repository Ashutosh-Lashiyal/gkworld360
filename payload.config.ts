// payload.config.ts — the master configuration file for Payload CMS.
// This single file tells Payload everything: which database to use,
// where to store images, what content types exist, and how the admin panel works.
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor, BlocksFeature } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { fileURLToPath } from "url";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Subjects } from "./collections/Subjects";
import { Categories } from "./collections/Categories";
import { Articles } from "./collections/Articles";
import { News } from "./collections/News";
import { KeyTakeaways } from "./blocks/KeyTakeaways";
import { TopicImage } from "./blocks/TopicImage";

// __dirname equivalent for ES modules (Next.js uses ES modules by default)
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // ── ADMIN PANEL ──────────────────────────────────────────────────────────────
  // Tells Payload which collection handles admin login (our Users collection).
  // The admin panel itself is available at http://localhost:3000/admin
  admin: {
    user: Users.slug,
    importMap: {
      // baseDir tells Payload where to look when it generates its import map.
      // The import map is a list of all custom React components used in the admin.
      baseDir: path.resolve(dirname),
    },
  },

  // ── COLLECTIONS ───────────────────────────────────────────────────────────────
  // Collections are like database tables. Each one is a content type.
  // Users (admin login) + Media (images) + the four content collections.
  collections: [Users, Media, Subjects, Categories, Articles, News],

  // ── LOCALIZATION (Hindi support) ────────────────────────────────────────────────
  // Turns on per-field English/Hindi versions. Any field marked `localized: true`
  // (titles, descriptions, bodies) stores a separate value per language, and the
  // admin panel shows an EN/HI toggle. This replaces the old paired-file approach
  // (x.mdx + x.hi.mdx) with one document that holds both languages.
  localization: {
    locales: [
      { label: "English", code: "en" },
      { label: "हिन्दी", code: "hi" },
    ],
    defaultLocale: "en",
    // fallback: if a Hindi value is missing, show the English one rather than blank.
    fallback: true,
  },

  // ── RICH TEXT EDITOR ──────────────────────────────────────────────────────────
  // Lexical is the article editor — works like Google Docs. Setting it here makes
  // it the DEFAULT for every richText field (article body, news body, category
  // overview). We extend the default features with our custom blocks so authors
  // can insert Key Takeaways and Images inside the body.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({ blocks: [KeyTakeaways, TopicImage] }),
    ],
  }),

  // ── SECRET KEY ────────────────────────────────────────────────────────────────
  // Used to encrypt admin login sessions. Comes from .env.local.
  // Never hardcode this — always keep it in the environment file.
  secret: process.env.PAYLOAD_SECRET || "",

  // ── TYPESCRIPT ────────────────────────────────────────────────────────────────
  // Payload auto-generates TypeScript types from your collections.
  // This makes your code smarter — VS Code will know what fields an Article has.
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  // ── DATABASE — NEON POSTGRESQL ────────────────────────────────────────────────
  // Uses the pooled connection string from .env.local (DATABASE_URL).
  // "Pooled" means multiple requests share database connections efficiently —
  // important for a serverless host like Vercel where each page request is fresh.
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),

  // ── PLUGINS ───────────────────────────────────────────────────────────────────
  plugins: [
    // s3Storage — sends every uploaded image to Cloudflare R2 automatically.
    // When you upload an image in the admin panel, it goes to R2, not your server.
    // R2 is S3-compatible, so we use the @payloadcms/storage-s3 package.
    s3Storage({
      collections: {
        // "media" matches our Media collection's slug above.
        media: {
          prefix: "media", // images are stored in an /media/ folder inside R2
        },
      },
      bucket: process.env.R2_BUCKET_NAME || "",
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
        },
        // Cloudflare R2 always uses "auto" as the region name.
        region: "auto",
        // The R2 endpoint URL — unique to your Cloudflare account.
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        // forcePathStyle is required for R2's S3 compatibility mode.
        forcePathStyle: true,
      },
    }),
  ],
});
