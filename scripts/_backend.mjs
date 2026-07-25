// Shared helper for the dev-only screenshot scripts: resolve real listing ids from
// the live backend at runtime so captures never depend on hardcoded ids (which rot
// as listings come and go). Used by screenshot-all.mjs and listing-howitworks-audit-shots.mjs.

// Backend base for the id lookup. Defaults to prod; override with --api <url> or
// NEXT_PUBLIC_API_BASE_URL so it matches the backend the dev server renders from.
export function resolveApiBase(argv = process.argv) {
  const i = argv.indexOf("--api");
  if (i !== -1 && argv[i + 1]) {
    return argv[i + 1];
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.naudokis.lt";
}

// Pick two representative active listing ids for the audit shots:
//   withPhotosReviews — has photos AND reviews (full gallery + reviews layout)
//   zeroReviews       — no reviews (empty-reviews state + "New" badge)
// Each falls back gracefully; returns null ids (with a warning) if the API is
// unreachable or returns nothing, so callers can skip the listing captures.
export async function pickListingIds(apiBase = resolveApiBase()) {
  const empty = { withPhotosReviews: null, zeroReviews: null };
  let items = [];
  try {
    const res = await fetch(`${apiBase}/listings?limit=50`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const body = await res.json();
    items = (body?.data?.items ?? []).filter((l) => l.status === "active");
  } catch (err) {
    console.warn(`⚠ Could not resolve listing ids from ${apiBase}: ${err.message}`);
    return empty;
  }
  if (!items.length) {
    console.warn(`⚠ No active listings returned from ${apiBase}; skipping listing shots.`);
    return empty;
  }

  // The site deliberately 404s synthetic listings (see isSyntheticListing in
  // app/lib/listing-url.ts) — picking one captures the status screen instead of
  // the detail page. Mirror the guard here; keep the regex in sync.
  const SYNTHETIC_RE = /(?:^|[\s./_-])(?:e2e[\s_-]?test|fixture|example)(?:[\s./_-]|$)/i;
  const synthetic = (l) =>
    [l.id, l.title, ...(l.images ?? []).map((image) => image.url)].some(
      (value) => !!value && SYNTHETIC_RE.test(value),
    );
  items = items.filter((l) => !synthetic(l));
  if (!items.length) {
    console.warn(`⚠ Only synthetic listings returned from ${apiBase}; skipping listing shots.`);
    return empty;
  }

  const hasPhotos = (l) => (l.images?.length ?? 0) > 0;
  const hasReviews = (l) => (l.rating_count ?? 0) > 0;

  // Among candidates, prefer the richest gallery so bento/lightbox states have
  // something to show; a 1-photo listing renders a degenerate gallery.
  const byPhotoCount = (a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0);
  const withPhotosReviews =
    items.filter((l) => hasPhotos(l) && hasReviews(l)).sort(byPhotoCount)[0] ??
    items.filter(hasPhotos).sort(byPhotoCount)[0] ??
    items[0];
  const zeroReviews = items.find((l) => !hasReviews(l)) ?? items[items.length - 1];

  return {
    withPhotosReviews: withPhotosReviews?.id ?? null,
    zeroReviews: zeroReviews?.id ?? null,
  };
}
