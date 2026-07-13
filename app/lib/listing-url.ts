// SEO-friendly public listing URLs. Old opaque UUID URLs keep working because
// the route accepts either the raw id or a slug ending in the id.
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
// A slug carries the id as its suffix ("bosch-gsr-18v-<uuid>"); a bare id is the
// whole param. One definition of what a listing id looks like, two anchorings.
const UUID_SUFFIX_RE = new RegExp(`${UUID}$`, "i");
const UUID_ONLY_RE = new RegExp(`^${UUID}$`, "i");

// One slug serves BOTH locales: the lt/en hreflang alternates and the sitemap
// point at the same path, so the slug must be locale-invariant. Listing titles
// are owner-authored (mostly Lithuanian), hence the LT "ir" for "&".
function slugPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ir ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");
}

export function listingIdFromParam(param: string): string {
  const match = param.match(UUID_SUFFIX_RE);
  return match?.[0] ?? param;
}

// Is this param a bare listing id (rather than a slug, or junk)? Used by the
// /listing/:id app-link route to reject a bad link before it reaches the feed.
export function isListingId(param: string): boolean {
  return UUID_ONLY_RE.test(param);
}

export function listingDetailPath({
  id,
  title,
  city,
}: {
  id: string;
  title?: string;
  city?: string;
}): string {
  const prefix = [title, city].map((part) => slugPart(part ?? "")).filter(Boolean).join("-");
  return `/skelbimai/${prefix ? `${prefix}-` : ""}${id}`;
}
