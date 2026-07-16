// LatestHeadlinesSection — the homepage "Latest Headlines" block.
// It's an async Server Component: it fetches the aggregated headlines on the
// server (cached + auto-refreshed every 30 min via lib/pulse) and renders a
// teaser of the freshest few, with a "View all →" link to the full /pulse page.
//
// Matches the homepage's standard section layout (container, header with a
// title + subtitle + "View all" link) so it feels native.
import Link from 'next/link';
import { getLatestHeadlines } from '@/lib/pulse';
import LatestHeadlines from '@/components/LatestHeadlines';

export default async function LatestHeadlinesSection() {
  // Fetch the 6 freshest headlines for the homepage teaser.
  const items = await getLatestHeadlines(6);

  // If every feed happens to be unreachable, hide the section entirely rather
  // than showing an empty box (graceful degradation).
  if (!items.length) return null;

  return (
    <section className="bg-surface-low border-y border-hairline">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-16 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-bold text-navy tracking-tight">
              Latest Headlines
            </h2>
            <p className="font-body text-base text-muted mt-1">
              Fresh current affairs from trusted sources — updated through the
              day
            </p>
          </div>
          <div className="flex items-center gap-4 whitespace-nowrap">
            <Link
              href="/saved"
              className="flex items-center gap-1.5 font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Read Later
            </Link>
            <Link
              href="/pulse"
              className="font-body text-sm font-medium text-sapphire hover:text-sapphire-dark transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>

        {/* Discoverability hint — tells users what the bookmark icon does.
            The bookmark icon now sits inline, in ( ) right after the word. */}
        <p className="font-body text-sm text-muted mb-6">
          Tip: Tap the{' '}
          <strong className="font-semibold text-navy">bookmark</strong>{' '}(
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="text-sapphire inline-block align-text-bottom"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          ) on any headline to save it to your{' '}
          <strong className="font-semibold text-navy">Read Later</strong> list.
        </p>

        {/* Card grid (matches the Explore Subjects / Popular Topics sections) */}
        <LatestHeadlines items={items} />
      </div>
    </section>
  );
}
