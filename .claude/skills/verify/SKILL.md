---
name: verify
description: Runtime-verify changes to this site by driving it with Playwright against a controllable local mock of the Naudokis backend.
---

# Verifying naudokis-web changes at runtime

Live backends (prod + dev) hold only ~3-4 listings, which cannot exercise pagination,
the feed's interruption-banner split, ranking, or most edge states. Stand up a local
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

## Gotchas (each cost a debugging round)

- **next/image allowlist**: mock image URLs must be on an allowlisted CDN host
  (`next.config.ts` → `imageCdnHosts`; currently the dev CloudFront
  `d720uc9idaijs.cloudfront.net`). Harvest real URLs from
  `https://api-dev.naudokis.lt/listings?limit=50`. A non-allowlisted host 500s SSR.
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
