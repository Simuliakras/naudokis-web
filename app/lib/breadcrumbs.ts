import { listingLandingPath } from "@/app/lib/landing-routes";

// One canonical breadcrumb trail for the listings feed and its category / city
// landing pages: Home › Skelbimai › [category] › [city]. Shared by the visible
// <Breadcrumb> (client, in FeedScreen) and the BreadcrumbList JSON-LD (server, in
// the page components) so the two representations never diverge. `path` is the
// bare, unprefixed route ("" = home); each consumer localizes it (JSON-LD via
// `absoluteUrl`, the visible nav via `localePath`).
export type Crumb = { name: string; path: string };

export function listingBreadcrumbTrail({
  homeLabel,
  feedLabel,
  categoryTitle,
  category,
  subcategoryTitle,
  subcategory,
  city,
}: {
  homeLabel: string;
  feedLabel: string;
  // The category's short display title (breadcrumb label) — NOT the genitive SEO
  // label used in the page heading. Undefined for a city-only or bare landing.
  categoryTitle?: string;
  category?: string; // backend category id (drives the landing path)
  subcategoryTitle?: string;
  subcategory?: string;
  city?: string;
}): Crumb[] {
  const trail: Crumb[] = [
    { name: homeLabel, path: "" },
    { name: feedLabel, path: "/skelbimai" },
  ];
  if (category && categoryTitle) {
    trail.push({ name: categoryTitle, path: listingLandingPath({ category }) });
  }
  // One crumb per URL segment, so the trail always names the page it is on and
  // every intermediate link is a real landing. A subcategory used to be folded
  // into a combined "Sub, City" leaf that only appeared when a city was present,
  // which left every city-less subcategory landing describing its PARENT as the
  // current page.
  if (category && subcategory && subcategoryTitle) {
    trail.push({ name: subcategoryTitle, path: listingLandingPath({ category, subcategory }) });
  }
  if (city) {
    trail.push({ name: city, path: listingLandingPath({ category, subcategory, city }) });
  }
  return trail;
}
