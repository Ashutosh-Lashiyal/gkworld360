// This layout wraps the ENTIRE Payload admin panel and REST API.
// It is REQUIRED — without it, Payload's admin views (like "create first user")
// have no config context or server-functions wiring and crash with
// "Cannot destructure property 'config' of 'se(...)'".
//
// RootLayout sets up all the React context Payload's UI needs.
// serverFunction is a Next.js Server Action that lets client components in the
// admin call back into Payload on the server (e.g. to run queries, form actions).
import type { ServerFunctionClient } from "payload";
import React from "react";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
// Payload's admin panel stylesheet — without this the admin UI is unstyled.
import "@payloadcms/next/css";

import { configPromise as config } from "@/app/(payload)/config";
import { importMap } from "@/app/(payload)/admin/importMap";

// serverFunction is the bridge that admin client components use to run
// server-side Payload operations. The 'use server' directive makes it a
// Next.js Server Action.
const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
