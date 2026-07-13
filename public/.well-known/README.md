# `/.well-known/` — app deep-link association files

These files let the native Naudokis app claim its universal-link paths. iOS AASA is
served verbatim from `public/`; Android Asset Links is served by
`app/.well-known/assetlinks.json/route.ts` so the real Play Console fingerprints can
be injected per deployment environment.

## `apple-app-site-association` (iOS universal links)

- Extensionless on purpose — iOS fetches `/.well-known/apple-app-site-association`.
- Must be served as `application/json` (enforced by the `headers()` rule in `next.config.ts`).
- `appID` is `<TeamID>.<bundleID>`.
- Apex and www must both serve this file with `200` and no redirect. The host
  redirect in `next.config.ts` deliberately excludes `/.well-known/*`.

## The one invariant: every claimed path must be a real page

There is no longer an `appLinkPaths` rewrite list, and no `deep-link.html`
interstitial. **Every** path in `paths` is now a real localized page under
`app/[lang]/` (see `app/lib/app-links.ts` for the canonical list), which means:

> A path claimed here **must** (1) resolve to a page under `app/[lang]/…`, (2) be
> *matched* by the `proxy.ts` matcher (it needs the locale rewrite — do **not** add
> it to the exclusion list), and (3) not be shadowed by a `next.config.ts` rewrite.

Break any of those and the path 404s **only for visitors without the app installed** —
i.e. for nobody who would notice while testing, since the OS opens the app first.
`yarn verify:app-links:static` checks all three and runs in CI on every PR.

Why real pages: the backend now puts these URLs directly into transactional emails,
and opening an email must not disclose the click to an attribution processor. So the
browser fallback is a first-party screen — an intent-matched app-handoff card
(`AppHandoffScreen`), or the real content where the content is public:

- `/listing/:id` → redirects to the public listing page.
- `/invite` → the referral bridge (validates the code, asks about attribution).
- `/cancel-deletion` → completes a **GDPR-critical** action on the web itself
  (public signed-token endpoint, no login), so it must work standalone, with no app.
- `/ref/:code` → legacy referral path; redirects to `/invite`.
- everything else → an app-handoff card. It never fetches the record behind the id:
  a real id must render exactly like a made-up one, or the page becomes an oracle
  for whether a booking / chat / document exists.

## `assetlinks.json` (Android App Links)

`/.well-known/assetlinks.json` is generated at runtime from
`ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS`. If the variable is missing, the route
returns `503` instead of a fake statement; this is an intentional release gate.

Get the two SHA256 values from the **Google Play Console → your app → Setup →
App integrity → App signing**:

1. **App signing key certificate** → "SHA-256 certificate fingerprint"
2. **Upload key certificate** → "SHA-256 certificate fingerprint"

Paste both (colon-separated hex, e.g. `AB:CD:…`) into
`ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS`, separated by commas, semicolons or
newlines. Both are needed so links verify whether Play re-signs the app or not.

After updating, confirm the file is reachable at
`https://www.naudokis.lt/.well-known/assetlinks.json` and validates in the
[Statement List Tester](https://developers.google.com/digital-asset-links/tools/generator).
