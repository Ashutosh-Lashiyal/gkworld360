// lib/use-site-text.ts — useSiteText(): the header, footer and other pieces
// shared by every page ask this for "my language and my words".
//
// It's a React HOOK (a function whose name starts with "use", called at the top
// of a component): it reads the page's address with usePathname(), so it only
// works in client components ("use client" files). Server code uses
// pageLang() and SITE_TEXT from lib/site-text.ts directly.
//
// Why from the address: the header and footer live in the layout, which every
// page shares and which doesn't know which page it's showing. The address
// always does: /hi… = Hindi.

import { usePathname } from "next/navigation";
import { SITE_TEXT, pageLang, localHref } from "@/lib/site-text";

export function useSiteText() {
  const pathname = usePathname();
  const lang = pageLang(pathname);
  return {
    lang, //                                   "en" or "hi"
    t: SITE_TEXT[lang], //                     this language's words
    href: (path: string) => localHref(lang, path), // a link to the Hindi twin when there is one
    pathname,
  };
}
