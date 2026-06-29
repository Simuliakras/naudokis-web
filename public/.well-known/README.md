# `/.well-known/` — app deep-link association files

These two files let the native Naudokis app claim the deep-link paths declared in
`next.config.ts` (`appLinkPaths`). They are served verbatim from `public/`.

## `apple-app-site-association` (iOS universal links)

- Extensionless on purpose — iOS fetches `/.well-known/apple-app-site-association`.
- Must be served as `application/json` (enforced by the `headers()` rule in `next.config.ts`).
- `appID` is `<TeamID>.<bundleID>`; `paths` mirrors `appLinkPaths` in `next.config.ts`.

### `/invite` is a dual-purpose path — handle it differently

`/invite` (the referral bridge) is listed in `paths` here **but deliberately NOT**
in `appLinkPaths` (`next.config.ts`) **nor** in the `proxy.ts` matcher exclusion.
That is intentional, not an oversight:

- The other paths (`/listing/*`, `/booking-request/*`, …) are app-only and rewrite
  to the static `deep-link.html` fallback. `/invite` instead has a **real localized
  web page** (`app/[lang]/invite/page.tsx`) that **is** its own fallback — adding it
  to `appLinkPaths` would rewrite it to `deep-link.html` and the bridge would never
  render; excluding it from the proxy would break its `/lt` locale rewrite.
- So for `/invite`: app installed → iOS opens the app via this AASA entry; app not
  installed → the browser loads the bridge. Both work without any other config.
- The app team must add an intent filter / route handler for `/invite` (confirm
  whether the app expects `/invite` or the existing `/ref/*`).
- **Apex caveat:** the backend emits apex `naudokis.lt/invite?code=…`, but
  `next.config.ts` 301-redirects apex→www for all paths (incl. `/.well-known`). iOS
  does not follow redirects for AASA, so **apex** invite links won't open the app
  (they fall through to the www bridge — acceptable; Branch still attributes). To
  make installed-app direct-open work from the shared link, have the backend emit
  `www.naudokis.lt/invite` or add a `/.well-known` exception to the apex redirect.

## `assetlinks.json` (Android App Links)

> ⚠️ **LAUNCH BLOCKER — placeholder fingerprints.**
> `sha256_cert_fingerprints` currently holds `PASTE_PLAY_APP_SIGNING_KEY_SHA256`
> and `PASTE_UPLOAD_KEY_SHA256`. Until both are replaced with the real values,
> Android App Links verification **fails** and `https://www.naudokis.lt/listing/…`
> links open the browser fallback instead of the app.

Get the two SHA256 values from the **Google Play Console → your app → Setup →
App integrity → App signing**:

1. **App signing key certificate** → "SHA-256 certificate fingerprint"
2. **Upload key certificate** → "SHA-256 certificate fingerprint"

Paste both (colon-separated hex, e.g. `AB:CD:…`) into the `sha256_cert_fingerprints`
array, replacing the placeholders. Both are needed so links verify whether Play
re-signs the app or not.

After updating, confirm the file is reachable at
`https://www.naudokis.lt/.well-known/assetlinks.json` and validates in the
[Statement List Tester](https://developers.google.com/digital-asset-links/tools/generator).
