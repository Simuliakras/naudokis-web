// SEO-friendly public listing URLs. Old opaque UUID URLs keep working because
// the route accepts either the raw id or a slug ending in the id.
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  const match = param.match(UUID_RE);
  return match?.[0] ?? param;
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
