// The importMap lists every custom/client React component that Payload's admin
// panel needs to load in the browser. Normally `payload generate:importmap`
// creates this automatically, but that CLI currently fails on Node.js 26
// (a require/top-level-await interop issue), so we maintain it manually.
//
// For our setup the only client component is the Cloudflare R2 (S3) upload
// handler, registered by the s3Storage plugin in payload.config.ts.
// If we add more plugins/custom components later that need client code,
// add their entries here in the same "package/path#ExportName": Component form.
import { S3ClientUploadHandler as S3ClientUploadHandler_0 } from "@payloadcms/storage-s3/client";

export const importMap = {
  "@payloadcms/storage-s3/client#S3ClientUploadHandler": S3ClientUploadHandler_0,
};
