# Backend request: availability filtering + a documented availability contract

> ## ⚠️ Ask #1 below is ANSWERED, and its premise was WRONG. Read [`backend-date-filter-contract.md`](./backend-date-filter-contract.md) first.
>
> **`GET /listings` has filtered by date all along** (`available_from` / `available_to`,
> since commit `30832a00`) — inclusive, applied before pagination, `minimum_rental_days`-aware,
> and it `400`s a lone bound / reversed range / over-long window. Section 1's claim that it
> "silently ignores date params" is **false**, and the evidence for it was a bad probe: a
> **2020** window matches every listing *because nothing has availability rows in 2020*, which
> is indistinguishable from the filter being ignored. **Prod holds zero availability rows**, so
> nothing can be excluded there either — test on **dev**, against a listing with a future owner
> block. Confirmed live 2026-07-16.
>
> The real ceiling is **60 days**, not the 90 requested below (it is pinned to
> `MAX_RENTAL_DAYS` — a longer span can never be booked).
>
> **Ask #2 (documenting `GET /listings/{id}/availability`) is still open** and still worth
> answering; section 2 stands.

**From:** naudokis-web (the marketing/bridge site)
**Date:** 2026-07-14 (§1 superseded 2026-07-16)
**Status:** §1 answered — see the banner above. §2 still open.

## Why

Rentals are date-driven. A renter thinks *"SUP board, Klaipėda, this Saturday"* — but the
site's hero search is item + city only, because **`GET /listings` cannot filter by date.**

We shipped what the current API *does* support: a real availability calendar on the
listing detail page, backed by `GET /listings/{id}/availability`. That is per-listing,
so it can only answer "is *this* item free?" *after* the user has already picked it.
Closing the loop — a date field in search, a "free this weekend" filter — needs the
browse endpoint to filter server-side.

Two asks below. **#2 is the urgent one**: it is a correctness risk in code that is
already live, and it costs you nothing but a paragraph.

---

## 1. Add `available_from` / `available_to` to `GET /listings`

```
GET /listings?available_from=2026-07-18&available_to=2026-07-20
```

Return only listings with **no** booked / blocked / reserved day overlapping
`[available_from, available_to]`, inclusive at both ends.

### Requirements

- **Both params or neither.** One without the other → `400`.
- **Validate.** `available_from > available_to` → `400`. Reject ranges longer than some
  sane ceiling (say 90 days) rather than scanning a year per listing.
- **Filter BEFORE pagination — this is the one that will break us if it is missed.**
  The site emulates `?page=N` by walking your opaque `next_token` cursors
  (`fetchListingsPage` in `app/lib/listings.ts`). If date filtering were applied to a
  page *after* it was cut, then `has_more`, the cursor chain and the result count would
  all be lies: a page of 12 would arrive holding 3 items, the pager would offer pages
  that don't exist, and the "N results" heading would be wrong. The filter has to be
  part of the query that produces the page.
- **Say whether `minimum_rental_days` interacts with it.** If a listing has
  `minimum_rental_days: 7` and the user asks for a 2-day window, is it a match?
  Our position: **exclude it** — it cannot actually be rented for those dates, and
  showing it is a dead end. But this is your call to make explicit, not ours to guess.

### Do not silently ignore unknown params

Right now `GET /listings?available_from=…` returns **`200` with the full, unfiltered
result set.** No error, no warning. That is the worst possible failure mode: a client
that *thinks* it is filtering by date gets a confident, complete, wrong answer. We only
found out by diffing result counts.

**An unrecognised query param should `400`, not no-op.** That single change would have
turned a silent correctness bug into a loud one.

---

## 2. Document `GET /listings/{id}/availability` — the shape is unknowable from prod

This endpoint is already live and public, and the site now depends on it. But **every
listing in production has an empty calendar** (nothing has ever been booked), so its
response tells us nothing about what a *non-empty* one looks like:

```json
{ "success": true, "data": {
  "listing_id": "…", "start_date": "2026-07-18", "end_date": "2026-07-25",
  "unavailable_slots": [], "blocked_dates": [], "booked_dates": [],
  "reserved_dates": [], "owner_blocked": [], "booked": [], "reserved": []
}}
```

Seven arrays, all empty, no docs. We cannot see their element types, and we cannot see
which of them is authoritative.

### Questions

1. **What is the element type of each array?** ISO date strings (`"2026-07-18"`), or
   objects? We guess `unavailable_slots` holds `{start_date, end_date}` spans and the
   rest hold bare dates — but that is a guess.
2. **Why seven?** `blocked_dates`/`owner_blocked`, `booked_dates`/`booked`,
   `reserved_dates`/`reserved` look like duplicate spellings of three concepts. Is one
   set legacy? Is `unavailable_slots` the union of the other six, or a separate thing?
3. **Are they Vilnius-local calendar dates?** If they are derived from UTC timestamps,
   boundary days will disagree with the site's Vilnius "today".
4. **Is a rental day-count inclusive?** Is `2026-07-18 → 2026-07-19` **one** day or
   **two**? We assume **two** (inclusive; the fields are `*_dates` and the limits are
   `minimum_rental_days`, not nights). This changes the price we show by a full day.
5. **Is a booking's end date reusable** as the next booking's start date, or is it
   consumed?
6. **Discount tiers:** with several qualifying tiers, does the app charge the deepest,
   or the one with the highest `min_days`? Ever cumulative? What is the rounding rule?
   The site now shows a rental subtotal with the tier applied, and it must match what
   the app actually charges.

### What we did in the meantime

The parser refuses rather than guesses. It takes the **union** of all seven arrays as
unavailable (conservative: showing a booked day as free is a broken promise, showing a
free day as booked is merely cautious), and **any element or array key it cannot
recognise downgrades the whole result to "unknown"** — which hides the calendar and
reports a PII-free shape fingerprint to Sentry, rather than rendering an empty calendar
that would silently imply every day is free.

So it is safe to ship today, and the day the first real booking lands we either parse it
or we find out immediately. Answering (1)–(3) removes the whole risk class.

---

## 3. Also worth knowing

**Is there any public endpoint for the service-fee schedule?** The site deliberately
shows no rental *total* — only a subtotal + the deposit — because it cannot see the fees
the app adds, and inventing a total would be a lie. If the fee schedule were readable,
the bridge could show a real, final number before the install, which is the single
biggest trust gap left on the page.

---

## Web-side changes once #1 lands

Small, and listed here so it can be estimated:

| File | Change |
|---|---|
| `app/lib/listings.ts` | `ListingFilters` gains `availableFrom`/`availableTo`; `buildListingsUrl` sends them; both query-key builders include them |
| `app/lib/search.ts` | `listingSearchHref` gains the two params |
| `app/lib/landing-params.ts` | `catalogueFiltersFromSearch` parses `?from=`/`?to=`; **`hasNonCanonicalLandingSearch` must mark dated URLs `noindex`**, exactly as `?q=` is today |
| `app/components/FeedScreen.tsx` | `setParams` gains the two keys; a date control in the toolbar + the mobile filter sheet |
| `app/components/HeroSearch.tsx` | the date field, and a "free this weekend" quick chip |

`app/lib/dates.ts` (TZ-safe, Intl-only, no dependency) and `DateRangePicker.tsx` already
exist from the detail-page work and are reused as-is.
