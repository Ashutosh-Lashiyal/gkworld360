// JsonLd — renders a block of structured data (schema.org JSON-LD) into the page.
//
// Structured data is invisible to humans but read by search engines and AI
// answer engines. It tells them, in a precise machine-readable format, what a
// page IS — e.g. "this is an Article titled X, part of GKWorld360, with these
// breadcrumbs." This powers Google rich results and helps AI engines cite us
// accurately (a core GEO goal).
//
// Usage: <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", ... }} />

type JsonLdProps = {
  data: Record<string, unknown>;
};

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // The JSON is serialised into the page. This is the standard, safe way to
      // embed JSON-LD; the content is our own structured data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
