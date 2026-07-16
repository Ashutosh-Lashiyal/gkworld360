import { NotFoundPage } from "@payloadcms/next/views";
import { importMap } from "@/app/(payload)/admin/importMap";
import { configPromise as config } from "@/app/(payload)/config";

export default async function NotFound() {
  return NotFoundPage({
    config,
    importMap,
    params: Promise.resolve({ segments: [] }),
    searchParams: Promise.resolve({}),
  });
}
