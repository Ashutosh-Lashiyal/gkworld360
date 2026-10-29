// titleTransitionName — the shared name that links a topic card's title to
// the big heading on that topic's article page (28 Oct 2026).
//
// HOW THE "TITLE GLIDE" WORKS: React's <ViewTransition name="…"> gives an
// element a name. When you move to another page and an element with the SAME
// name is there too, the browser animates the first into the second — the
// small card title glides and grows into the article's heading. So the card
// and the heading must compute exactly the same name for the same article.
// Both build it from the article's path, through this one function.
//
// The browser only accepts letters, digits, "-" and "_" in these names, so
// every other character (the "/" in a path, for example) becomes "-".
//   "/history/modern-india/the-dutch-in-india" → "title-history-modern-india-the-dutch-in-india"

export function titleTransitionName(path: string): string {
  return "title" + path.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").replace(/-$/, "");
}
