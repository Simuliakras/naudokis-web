# Backend request: embed an owner summary on browse items

**From:** naudokis-web (the marketing/bridge site)
**Date:** 2026-07-14
**Status:** the card UI is merged and gated; it stays dark until this lands

## Why

Trust is the product, but a browse card cannot show *who* you would be renting from.
`GET /listings` carries **no owner data at all** — only an opaque `owner_id`. Owner
identity exists on `GET /listings/{id}` (the `owner` block) and on the public
`GET /users/{id}`, but neither helps a feed: a page renders 12 cards, and fanning out 12
extra round-trips per page to decorate them is not a trade we will make.

So the card ships with an owner row that renders **nothing** until the browse item
carries an owner. `app/lib/listings.ts` already models the field (`ApiListing.owner`,
typed with the same `ApiOwner` as the detail block) and maps it through `mapOfferOwner`.
The day the wire carries it, the row lights up with **zero web changes**.

Two asks below. **#2 is the urgent one**: it is a live data bug, it is not really about
this feature, and it will make somebody ship a false claim eventually.

---

## 1. Add an `owner` object to each item in `GET /listings`

Mirror the existing `GET /listings/{id}` → `data.owner` block field-for-field, plus
`initials` borrowed from `GET /users/{id}` → `data.identity.initials`. No new endpoint,
no new names — the web already reads `owner.name` / `owner.avatar` / `owner.verified`
under exactly these keys on the detail page.

```jsonc
// GET /listings → data.items[n]
{
  "id": "b38f717f-…",
  "owner_id": "90bcb94c-…",       // KEEP — unchanged, see below
  "deposit_amount_cents": 5000,   // KEEP — already shipping, incl. null
  "owner": {                      // NEW
    "id":       "90bcb94c-…",     // string          equals owner_id
    "name":     "Gvidas B.",      // string          already privacy-trimmed to "First L."
    "initials": "GB",             // string          same value as /users/{id}.identity.initials
    "avatar":   "https://d1fr6so…/profiles/….jpg",   // string | null
    "verified": true              // boolean | null  === identity_verified (see §2)
  }
}
```

`is_business` / `business_name` are welcome if they are free — the web maps them and lets
the business name win as the display name — but nothing on the card requires them.

### Requirements

- **Omit `owner` entirely (or send `null`) when no owner record resolves** — deleted or
  suspended user, orphaned listing. Never `{}` with a missing `name`. The web treats an
  absent owner as "render the card exactly as it does today", which is also the current
  behaviour, so this degrades cleanly rather than rendering a nameless ghost row.
- **`avatar`, not `avatar_url`.** The detail owner block already uses `avatar`. If the
  `/users` identity serializer gets reused here, rename on the way out. One name, one
  mapping.
- **The avatar must stay on the allowlisted CloudFront distribution.** The web hard-guards
  image hosts (`cdnImage()` in `app/lib/image-hosts.ts`), because `next/image` throws and
  500s the whole SSR render on an unconfigured host. An avatar served from anywhere else
  silently degrades to initials — no crash, but no photo either.
- **Keep `owner_id`.** `ListingScreen.tsx` groups the "more from this owner" rail on it,
  and it is the fallback for `owner.id`.
- **Do not embed the heavy fields.** Leave `about`, `listings[]`, `member_since`,
  `avg_response_time_hours`, `business_verified`, `is_trader`, `consumer_rights_apply` and
  `trader_registration_number` off the browse item. The card renders none of them and they
  multiply by 12 on your hottest endpoint. (Extra fields are harmless to the web's
  structural types — they are simply ignored — but they are wire weight.)

### Staleness is fine, with one exception

A denormalized summary may lag a name or avatar change. That is fine: the site caches
`/listings` for 300s anyway. The one thing to avoid is a stale `verified: true` outliving
a **revoked** verification. If that is a real risk in your pipeline, prefer `verified:
null` over a stale `true` — the web treats `null` as "unknown" and renders nothing, rather
than asserting a claim that is no longer true.

---

## 2. Two `verified` flags disagree in production, right now

For the same user (`90bcb94c-a061-70aa-2242-fbdc0dfcd597`), live prod returns:

| Endpoint | Field | Value |
|---|---|---|
| `GET /users/{id}` | `identity_verified` | **`true`** |
| `GET /users/{id}` | `identity.badges.verified` | **`false`** |
| `GET /listings/{id}` | `owner.verified` | **`true`** |

Two fields on the *same response* claim to mean "verified" and return opposite answers.

The site renders its green "Tapatybė patvirtinta" pill on the listing detail page off
`owner.verified`, so today it agrees with `identity_verified`. **The browse summary's
`verified` must be sourced from the same value.** If it were wired to `badges.verified`,
every verified owner on the feed would silently read as unverified — and the two surfaces
would contradict each other on the same person.

Regardless of this feature: **please reconcile or delete one of these fields.** Whichever
of them is wrong is a false claim about a real person's identity check, and it is exactly
the kind of thing that ends up in front of a user because a client picked the wrong one.
We would rather be told which is authoritative than guess correctly by luck.

(The web does not currently render a verified badge on the *card* — that was a deliberate
scope decision, not a data problem. But the field is modelled and ready, which is why the
source matters before it ships, not after.)

---

## 3. Nice-to-have, non-blocking

**Add `initials` to `GET /listings/{id}.owner` too.** The detail page's host card falls
through to a generic grey person glyph when an owner has no photo. `/users/{id}` already
computes `initials` ("GB"); exposing it on the detail owner block lets the host card share
the same fallback the browse card now uses, and costs you one field.

---

## What is already on the wire and needed no change

Worth stating, because it was invisible from the web side until we looked:
`deposit_amount_cents` **is already returned on every browse item** (`5000`, or `null`).
It was simply never modelled here. The card now surfaces it as a factual
"Užstatas 50 €" / "€50 deposit" chip. No backend work required — this half shipped
against real data.

---

## What we deliberately did **not** build, and why

Flagging these so nobody spends effort exposing them for us:

| Signal | Why it is not on the card |
|---|---|
| "X successful rentals" | `total_completed_rentals` is `0` or `1` for every owner in prod. The badge would read "0 sėkmingų nuomų" on nearly every card — worse than silence. |
| Response time | `avg_response_time_hours` is `null` for every owner. Nothing to render. |
| Protection / insurance badge | No such thing exists, and the Terms explicitly disclaim insurance. Fabricating it is out of the question. |

These become interesting the day the marketplace has real volume behind them. They are not
data we are missing; they are data that does not exist yet.

---

## There is a clock on this one

The card's owner row is dark until §1 lands, but the card **skeleton already reserves its
height** — so the two match the day you ship, with no web deploy. The cost of that choice is
that until then, every cold feed load shrinks each card by **21px** when the data arrives:
a measured ~0.05 CLS on `/skelbimai` and the category landings, which is about half the
"good" Core Web Vitals budget on our highest-traffic surface.

That is a deliberate, accepted trade — not a bug report. But it is the reason this is worth
doing sooner rather than later: the longer `owner` is missing, the longer we pay it.

## Web-side changes once §1 lands

**None.** Already merged, behind a graceful gate:

| File | State |
|---|---|
| `app/lib/listings.ts` | `ApiListing.owner?: ApiOwner`, `mapOfferOwner()`, `apiToOffer` wires it |
| `app/lib/listing-view.ts` | `OfferOwner` view type + `ownerInitials()` name-derived fallback |
| `app/components/cards.tsx` | `OfferCard` owner row (avatar → initials → glyph), skeleton reserves its height |
| `app/components/ui.tsx` | shared `Avatar` primitive |

Verified against a mock backend across every branch: owner absent, `avatar: null`,
`initials` absent (derived from the name), business name, non-allowlisted avatar host, and
an owner object with no name. In each case the card either renders correctly or falls back
to exactly what it renders today. Nothing 500s.
