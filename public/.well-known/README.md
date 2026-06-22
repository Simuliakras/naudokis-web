# `/.well-known/` — app deep-link association files

These two files let the native Naudokis app claim the deep-link paths declared in
`next.config.ts` (`appLinkPaths`). They are served verbatim from `public/`.

## `apple-app-site-association` (iOS universal links)

- Extensionless on purpose — iOS fetches `/.well-known/apple-app-site-association`.
- Must be served as `application/json` (enforced by the `headers()` rule in `next.config.ts`).
- `appID` is `<TeamID>.<bundleID>`; `paths` mirrors `appLinkPaths` in `next.config.ts`.

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
