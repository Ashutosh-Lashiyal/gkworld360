// SearchPage — the Search page, in English (/search) or Hindi (/hi/search).
// (components/pages/ — see the folder note in AboutPage.tsx.)
//
// The big title, then the live search box + results (components/SearchResults.tsx,
// a client component — it reads the page's language itself and, on the Hindi
// page, lists Hindi results first). Server component.

import { getSearchIndex } from "@/lib/search";
import SearchResults from "@/components/SearchResults";
import PageTitle from "@/components/PageTitle";
import { PAGE_TEXT } from "@/lib/page-text";
import type { Lang } from "@/lib/lang";

export default async function SearchPage({ lang, query }: { lang: Lang; query: string }) {
  const t = PAGE_TEXT[lang].search;
  // Every subject, category, topic and write-up — in both languages (lib/search.ts)
  const index = await getSearchIndex();

  const body = (
    <>
      {/* PHASE 4 (30 Oct 2026): the big title (components/PageTitle.tsx) */}
      <PageTitle colors={null} label={t.label} title={t.title} />
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-8 pb-6">
        {/* The interactive search box + results (client component) */}
        <SearchResults index={index} initialQuery={query} />
      </div>
    </>
  );

  return lang === "hi" ? <div lang="hi" className="gk-hi-page">{body}</div> : body;
}
