# `/.well-known/` — app deep-link association files

These files let the native Naudokis app claim the deep-link paths declared in
`next.config.ts` (`appLinkPaths`). iOS AASA is served verbatim from `public/`;
Android Asset Links is served by `app/.well-known/assetlinks.json/route.ts` so
the real Play Console fingerprints can be injected by deployment environment.

## `apple-app-site-association` (iOS universal links)

- Extensionless on purpose — iOS fetches `/.well-known/apple-app-site-association`.
- Must be served as `application/json` (enforced by the `headers()` rule in `next.config.ts`).
- `appID` is `<TeamID>.<bundleID>`; `paths` mirrors `appLinkPaths` in `next.config.ts`.

### `/invite` and `/cancel-deletion` are dual-purpose paths — handle them differently

`/invite` (the referral bridge) and `/cancel-deletion` (the account-deletion cancel
bridge) are listed in `paths` here **but deliberately NOT** in `appLinkPaths`
(`next.config.ts`) **nor** in the `proxy.ts` matcher exclusion. That is intentional,
not an oversight:

- The other paths (`/listing/*`, `/booking-request/*`, …) are app-only and rewrite
  to the static `deep-link.html` interstitial. `/invite` and `/cancel-deletion`
  instead each have a **real localized web page** (`app/[lang]/invite/page.tsx`,
  `app/[lang]/cancel-deletion/page.tsx`) that **is** its own fallback — adding either
  to `appLinkPaths` would rewrite it to `deep-link.html` and the page would never
  render; excluding it from the proxy would break its `/lt` locale rewrite.
- So for both: app installed → the OS opens the app via this AASA entry; app not
  installed → the browser loads the real page. `/cancel-deletion` is special — it is
  the desktop / no-app path for a **GDPR-critical** action and completes the cancel
  on the web (public signed-token endpoint, no login), so it must work standalone.
- The app handles `/invite` (primary) via its intent filter; `/ref/*` remains a
  legacy universal-link fallback the app still routes (`app/ref/[code].tsx`).
- Apex and www must both serve this file with `200` and no redirect. The host
  redirect in `next.config.ts` deliberately excludes `/.well-known/*`.

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
