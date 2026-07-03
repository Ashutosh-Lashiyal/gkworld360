import type { Metadata } from "next";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "@/app/(payload)/importMap";
// configPromise is the sanitized version of payload.config.ts — required by Payload's admin UI
import { configPromise as config } from "@/app/(payload)/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export default async function Page({ params, searchParams }: Args) {
  return RootPage({ config, importMap, params, searchParams });
}

export async function generateMetadata({
  params,
  searchParams,
}: Args): Promise<Metadata> {
  return generatePageMetadata({ config, params, searchParams });
}
