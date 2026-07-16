# The feed date filter: backend contract + activation

**Audience:** naudokis-web. This is the web-side record of the `GET /listings` date-filter
contract, as answered by the backend team on 2026-07-16.
**Status:** web side built; **one env var** from live (see [Activation](#activation)).
**Supersedes** the "#1" ask in [`backend-availability-filter.md`](./backend-availability-filter.md),
which is now answered. Ask #2 (the per-day detail endpoint's shape) is still open — see the
bottom.

---

## Read this first: the filter already works, and the obvious probe cannot prove it

`GET /listings` has filtered by date since commit `30832a00` — `available_from` /
`available_to`, under exactly those names. **Nothing needed building.**

An earlier probe from this repo concluded the opposite and was **wrong**. It is worth
recording exactly how, because the mistake is easy to repeat:

- **The probe used a window in the past** (`available_from=2020-01-01&available_to=2020-01-02`)
  and expected 0 results. But the filter asks *"which listings have no booked day overlapping
  this window?"* — and no listing has **any** availability row in 2020, so the honest answer
  is **all of them**. A full result set was the filter working correctly, and it is
  **bit-for-bit identical** to the filter being ignored. The probe had no power to
  discriminate.
- **Prod holds zero availability rows.** Nothing has ever been booked or blocked, so *no*
  window can exclude anything in prod, today or ever — until real bookings exist.
  **Never test this filter against prod.**

**The discriminating test (dev only):** take a listing with a **future owner block**, then
compare a window that overlaps the block against one that doesn't. The overlapping window
must drop it.

**One-request tell:** items carry `available_for_requested_range` **only when both date
params are sent**. If that key is on the items, the filter ran.

---

## The contract

### Request

```
GET /listings?limit=12&available_from=2026-07-18&available_to=2026-07-20
```

- `YYYY-MM-DD`, **Europe/Vilnius** calendar dates (matches `app/lib/dates.ts`).
- **Inclusive both ends.** A single-day window is `X..X` (`rentalDays = 1`).
- **Both or neither.** Composes with `q` / `city` / `category_id` / price / delivery / `sort`
  and with cursor pagination.

### Already guaranteed (needed no change)

- **Filtered before pagination** — availability is applied inside the page-producing query,
  which refills across sharded cursors, so `count` / `has_more` / `next_token` describe the
  *filtered* set. Our walked-cursor pager (`fetchListingsPage`) is safe.
- **`minimum_rental_days`-aware** — a listing with a 7-day minimum is excluded from a 2-day
  window, folded into the same predicate before the row is returned.

### Validation → `400` (all live)

| Input | Response |
|---|---|
| Lone bound | `400` — "Both available_from and available_to must be provided together" |
| `from > to` | `400` — "available_from must be before or equal to available_to" |
| Window > **60** days | `400` — "Availability range cannot exceed 60 days" |
| Malformed / `2026-02-31` | `400` — "Must be a valid calendar date" |
| `available_from` before today | **`200` with an empty page** (`count: 0`) — well-formed, matches nothing |

**Unknown params stay lenient by design** (no `400`): the endpoint is unauthenticated and
serves shipped app binaries that cannot be force-upgraded, so a stray param must not break
discovery. Strictness would not have caught the probe error above anyway — `available_from`
was never unknown; it was always honored.

---

## The three things this costs the web client

### 1. `MAX_WINDOW_DAYS` is **60**, not 90 — *done*

The backend's ceiling is `AVAILABILITY_MAX_RANGE_DAYS`, pinned to
`BOOKING_LIMITS.MAX_RENTAL_DAYS`: a span longer than the longest bookable rental can never be
booked, so offering "available" listings for it is a dead end. **A 90-day selection would
have `400`ed every real user.** `app/lib/date-filter.ts` now caps at 60; the calendar's
`tooLong` rule and the "Up to N days" hint derive from that constant, so they moved with it.

### 2. `count` is the page length, not a total — *already safe*

`count === items.length` for the page just returned. It is **not** a match total and there is
no total in the response. Verified: nothing in this repo reads `data.count`. The feed's
heading is built from `list.length` of actually-loaded offers and renders
`resultCountAtLeast` ("N+") whenever `hasNextPage` — a lower bound, never a claimed total.
**Do not source an "N results" heading from `count`** — with `limit=12` it reads "12" on
every full page.

### 3. A short page is not the end — *already safe*

Search runs under budgets (250 availability probes, 4 refill rounds, ~500 rows, ~9s), so a
page can return **fewer than `limit` items while `has_more` is `true`** and a valid
`next_token` is present. Verified: `fetchListingsPage` returns `nextToken` straight from
`next_token` and the `?page=N` walk gates on `has_more` — page length is never used to infer
the end. A pager that assumed "short page ⇒ last page" would silently truncate exactly the
heavily-filtered searches this feature creates.

---

## Why the web clamps a past window instead of sending it

The backend answers a window whose start is already past with an empty page. So the client
clamps against the market's "today" **before** the wire (`clampRangeToToday`):

- fully past → the filter drops entirely (all listings, pill reads "Any dates");
- straddling ("this weekend", opened next week) → start pulled forward to today.

One range therefore drives the calendar, the pill/chip *and* the request. Sending the raw URL
window instead would strand a user on a blank feed while the pill claimed no filter was set
and offered nothing to clear.

### The clamp date has to cross the server→client boundary

"Today" is not a server fact (`use-market-today.ts`): `useMarketToday()` is `undefined` on the
server **and on the first client render**. But the clamped window is part of the React Query
key, so if the server prefetches a clamped window and the client's first render keys off the
raw one, the two disagree — the dehydrated page is discarded, the feed flashes a skeleton, and
a request goes out with a past `available_from` that this very contract says returns empty.

The two feed routes reach agreement differently, and both are load-bearing:

- **`/skelbimai`** reads its filters from the URL, so it is handed the date the prefetch
  clamped against: `<FeedScreen serverToday={...} />` → `useMarketToday(serverToday)`. Read
  only when a `?dates=` token is present, so an undated render bakes no "today".
- **The pretty-URL landings** pass `initialFilters`, whose `dates` token
  `catalogueFiltersFromSearch` has *already* clamped — so their first render clamps an
  already-clamped token, which is idempotent.

Either way the live value takes over on mount and self-corrects at midnight.

---

## Activation — done

- [x] `MAX_WINDOW_DAYS` → 60
- [x] Pager follows `next_token`, never a short page
- [x] No UI sources a match total from `count`
- [x] **Live, with no feature flag.** A `NEXT_PUBLIC_DATE_FILTER` gate briefly existed on the
      false premise that the backend ignored dates; it has been removed rather than switched
      on, since a flag whose rationale is void is just a second thing to keep in sync. The
      "Dates" pill is in the feed toolbar + mobile sheet, and `available_from`/`available_to`
      go out with every dated search.

Verify on **dev**, against a listing with a future owner block — not prod (no availability
rows there, so nothing can be excluded yet; that is truthful, not a bug — nothing *is* booked).

**Independent, later:** `APP_READS_DEEPLINK_DATES` (`app/lib/app-links.ts`, off) carries the
chosen dates into the native deep link. Unrelated to this filter; flip only once the app team
confirms `/listing/:id?start_date=…&end_date=…` is read on open.

---

## Backend-side fixes that landed with this (context, no web action)

Two data bugs were fixed on 2026-07-16 that would have made this filter report stale
availability. Neither can have corrupted prod (zero rows), but both would have bitten on the
first real booking:

- **A confirmed booking's blocked days self-deleted ~24.5h after checkout** — the row kept the
  payment hold's DynamoDB TTL after flipping to `booked`, so DynamoDB reaped it. The feed
  would have shown a **paid** listing as free for its booked dates. TTL is now cleared on
  confirmation.
- **Owner "unblock dates" deleted booked rows** — the delete was keyed only by date with no
  status check. It is now conditional on the row being an owner block.

## Still open (not a blocker)

`GET /listings/{id}/availability` — the per-day **detail-page** endpoint (ask #2 in
[`backend-availability-filter.md`](./backend-availability-filter.md)) — remains undocumented.
Confirmed shape: `unavailable_slots: [{ date, status: "blocked" | "booked" | "reserved" }]`,
with `blocked_dates == owner_blocked`, `booked_dates == booked`, `reserved_dates == reserved`
(legacy + new names carrying the same data); expired reservations are filtered server-side.
It currently has **no `start <= end` check and no max-range cap**, unlike the feed filter —
tracked backend-side as hardening. The feed does not need per-day data, so this is off the
activation path; `app/lib/availability.ts` keeps its conservative union-and-downgrade parser.
