// Single source of truth for the listings-feed URL. The feed reads `q`
// (free-text search), `city` (exact city name) and `cat` (category id) — see
// app/[lang]/skelbimai. Only non-empty params are emitted and `q` is trimmed,
// so callers can pass raw input without pre-cleaning it.
export function listingSearchHref({ q, city, cat }: { q?: string; city?: string; cat?: string }): string {
  const params = new URLSearchParams();
  const query = q?.trim();
  if (query) {
    params.set("q", query);
  }
  if (city) {
    params.set("city", city);
  }
  if (cat) {
    params.set("cat", cat);
  }
  const qs = params.toString();
  return qs ? `/skelbimai?${qs}` : "/skelbimai";
}
