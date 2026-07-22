// Google Play Install Referrer — deferred deep linking with no attribution SDK.
//
// A `referrer` string on a Play Store URL is handed to the app on first launch via
// the Play Install Referrer Library. It is first-party (Google Play → our app,
// never a third party), it survives the install, and it works on organic installs.
// That makes it the one deferred mechanism available to visitors who DECLINED
// attribution, which is exactly who /go sends to a bare store URL today.
//
// iOS has no equivalent. Apple ships no install-referrer API, and the alternative —
// probabilistic IP/UA fingerprint matching — is not something this site will do. So
// deferred deep linking is Android-only outside the consented AppsFlyer path, and
// that asymmetry is deliberate rather than an oversight.
//
// Only the deep-link TARGET travels here, never campaign/utm data. The target is
// functional — it is the navigation the visitor asked for by tapping "reserve" on a
// specific listing — whereas attribution is analytics and stays behind consent. That
// split is what makes this safe to send on the declined path at all.
//
// Keys mirror the app's confirmed UDL contract (deep_link_value + deep_link_sub1) so
// the app has ONE payload shape to parse, whether it arrived via AppsFlyer or here.
// Confirm with the app team before adding keys — same silent-failure rules apply.
import { listingIdFromAppPath } from "./app-links";

// Play truncates long referrers; the real ceiling has moved around, so stay well
// under it. A dropped referrer is silent, and our payload is two short keys.
const REFERRER_MAX = 700;

// The Play Store URL for a store fallback, carrying the install referrer when there
// is a listing target to resume at. Returns `base` untouched when there is nothing
// to say — an empty referrer is worse than none, it just looks like a bug later.
export function playStoreUrlWithReferrer(base: string, appPath?: string): string {
  const id = appPath ? listingIdFromAppPath(appPath) : undefined;
  if (!id) {
    return base;
  }
  // The referrer is conventionally a query string in its own right, so the app can
  // parse it with the same tools it parses a URL with.
  const referrer = new URLSearchParams({ deep_link_value: "listing", deep_link_sub1: id }).toString();
  if (referrer.length > REFERRER_MAX) {
    return base;
  }
  const url = new URL(base);
  url.searchParams.set("referrer", referrer);
  return url.toString();
}
