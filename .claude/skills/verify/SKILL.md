---
name: verify
description: Runtime-verify changes to this site by driving it with Playwright against a controllable local mock of the Naudokis backend.
---

# Verifying naudokis-web changes at runtime

Live backends (prod + dev) hold only ~3-4 listings, which cannot exercise pagination,
infinite-scroll page appends, ranking, or most edge states. Stand up a local
mock API and drive the real app with Playwright (`playwright` is in devDependencies;
browsers are installed).

## Recipe

1. **Mock backend** (plain `node:http`, e.g. on :4141) implementing the wire shapes in
   `app/lib/listings.ts` / `app/lib/categories.ts`:
   - `GET /listings` → `{ success, data: { items, count, has_more, next_token } }`;
     the feed paginates with `limit=12` + opaque `next_token`.
   - `GET /listings/categories` → `{ success, data: { categories } }` (level-1 nodes).
   - `GET /listings/:id`, `/listings/:id/review-stats` for the detail page.
   - Send `access-control-allow-origin: *` on everything.
   - A `GET /__mode?set=...` toggle is handy for empty/delay/failure states.

2. **Dev server**: `NEXT_PUBLIC_API_BASE_URL=http://localhost:4141 yarn dev -p 3100`.

3. **Playwright**: `createRequire(<repo>/package.json)` → `require("playwright")`.
   **Must pass `bypassCSP: true` to `browser.newContext()`** — the site ships an
   ENFORCED `connect-src` CSP that only allows the real API hosts, so browser fetches
   to the mock are refused otherwise (they hang in React Query retries and the feed
   then swaps to its error state).

### Mock response shapes that are easy to get wrong

Verified 2026-07-21 against `app/lib/listings.ts` / `availability.ts`:

- `GET /listings/:id` → **`{ success, data: <listing> }`** — `fetchListingDetailRaw` returns
  `body.data` *directly*. Wrapping it as `data: { listing }` yields a detail page stuck on its
  route-level loading shell forever, with no console error: the query resolves to an object
  whose every field is `undefined`.
- `GET /listings/:id/review-stats` → `data: { rating_average, rating_count, rating_distribution }`
  — the per-star map is `rating_distribution`, **not** `breakdown`.
- `GET /listings/:id/availability` → `data: { listing_id, start_date, end_date, booked_dates: [] }`.
  The blocked-day array key must be one of `UNAVAILABLE_KEYS` (`availability.ts:51`); any *other*
  non-empty array makes the parser bail to "unknown availability" on purpose, since it cannot know
  the array's polarity.
- Categories can be served straight from a live `curl https://api.naudokis.lt/listings/categories`
  dump — that keeps the real taxonomy ids, which is what `POPULAR_SUB_IDS` and the `[data-cat]`
  accent map key on.

### Which calendars actually mount an Apply button

`showApplyBtn = showApply ?? !commitCloses` (`Calendar.tsx:87`). The desktop booking popover and
the feed's date popover both pass `commitCloses`, so they render **only** the ghost Clear —
`.nk-cal__foot .nk-btn--primary` exists solely in the **mobile** booking sheet. Asserting on it at
a desktop viewport looks like a regression and is not one. Reaching it needs `.nk-cal-trigger`;
at ≤980px `.nk-lfield` resolves to the header's Share/Save buttons instead.

## Gotchas (each cost a debugging round)

- **Mock listing ids MUST be UUID-shaped.** `listingIdFromParam()` (`app/lib/listing-url.ts`)
  anchors on a UUID *suffix*, so a friendly id like `mock-1` is never recognised: the detail
  route re-canonicalises the whole slug as if it were the id, and the URL grows a copy of the
  slug on every redirect (`…-mock-1` → `…-testinis-…-testinis-…-mock-1` → …) until Playwright
  times out. It looks exactly like a redirect-loop bug in the app; it is not.
- **A stale `.next` 404s every route**, including `/`. If the whole site suddenly 404s while
  the dev server reports "Ready" and only compiles `/_not-found`, `rm -rf .next` and restart —
  don't go hunting in `proxy.ts`.
- **next/image allowlist**: mock image URLs must be on an allowlisted CDN host
  (`next.config.ts` → `imageCdnHosts`; both the dev `d720uc9idaijs.cloudfront.net` and the prod
  `d1fr6so5096lsg.cloudfront.net` are allowed). Harvest real URLs from
  `https://api.naudokis.lt/listings?limit=50`. A non-allowlisted host 500s SSR.
- **Catching a route-level `loading.tsx` needs a slow SERVER fetch AND a cold fetch cache.**
  Playwright's `page.route()` only stalls the *browser's* requests — it cannot slow the RSC
  render, which is what the loading shell is waiting on. Make the *mock* stall, and
  `rm -rf .next/cache/fetch-cache` **from inside the script, immediately before the goto**:
  any earlier request (even a `curl`) re-warms it and the shell is gone in 100ms.
  When even that races, skip the browser — `curl` the route and read the streamed HTML: the
  fallback `<main aria-busy="true" style="…">` is right there, and its inline style is directly
  comparable to the real screen's.
- **`getComputedStyle(table).borderSpacing` reports `2px` even under `border-collapse:collapse`**
  — that is Chromium's UA default for `<table>`, not a leftover declaration. Assert on the
  *rendered* gap between cells, never on the property.
- **Next server-side fetch cache**: data fetchers use `next: { revalidate: 300 }`, so
  the dev server caches mock responses **per URL** across requests — mode toggles do
  NOT invalidate it. To force a fresh SSR prefetch, vary the query (`/skelbimai?q=<unique>`
  → different backend URL). `rm -rf .next` + restart is the nuclear option.
- **Exercising the feed's loading→loaded mount** (no hydrated data): make the mock
  return 500 to the SSR prefetch only — SSR requests have no `Origin`/`Referer` header
  and the infinite-feed prefetch is the one with `limit=12`. `prefetchInfiniteQuery`
  swallows the failure, so the client mounts in `isLoading` and fetches itself.
- **Hydration race on click-driven scenarios**: a click right after `waitForSelector`
  can land before React attaches handlers; `waitForLoadState("networkidle")` + retry
  the click until the expected dialog appears.
- Home (`/`) 500s if a cached listings response contains a non-allowlisted image host —
  clear `.next` after changing mock image URLs.

## Flows worth driving

- Feed `/skelbimai` at 1440/1100/700: banner split = whole rows (8 at 4-up, 6 at 3-up);
  card order (photo-first per page on "recommended"); infinite scroll appends without
  reshuffling loaded cards.
- Skeleton vs loaded card height (CLS): hold the response with a delay mode, measure
  `article` boxes before/after.
- Home categories/offers empty bands (`empty-cats` mode), the app-redirect modal
  (grabber is mobile-only ≤560), listing detail at `/en/...` for locale parity.
