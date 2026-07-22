import { after, NextResponse, userAgent, type NextRequest } from "next/server";
import { APP_STORE_URL, PLAY_STORE_URL, SITE_ORIGIN } from "@/app/lib/contact";
import { buildGenericInstallLink } from "@/app/lib/onelink";
import { GO_ATTRIBUTION_KEYS, cleanAttributionValue } from "@/app/lib/attribution";
import { listingIdFromAppPath } from "@/app/lib/app-links";
import { trackServerEvent } from "@/app/lib/server-analytics";
import { createHandoffToken } from "@/app/lib/handoff-token";
import { playStoreUrlWithReferrer } from "@/app/lib/play-referrer";
import { CONSENT_COOKIE, parseConsent } from "@/app/lib/consent";

// Smart install link. A single shareable URL (https://www.naudokis.lt/go) — the
// one the hero/CTA/modal QR encodes, and the ONLY place on the web that may hand a
// visitor to AppsFlyer.
//
// It fails CLOSED: without a current, explicit opt-in stored in the consent cookie
// it routes each visitor to the right store by sniffing the OS (phones → native
// store, desktop / unknown → marketing home). AppsFlyer is reached only when the
// visitor has affirmatively allowed it. Declining lands on exactly the same store —
// one fewer tracking step, never a worse install.
//
// Reads the UA and a cookie, so it's dynamic and must never be cached.
export const dynamic = "force-dynamic";

// Deferred deep-link targets we are willing to hand to AppsFlyer. Deliberately
// ONLY the public listing: a listing id is public, sitemapped content. Booking,
// chat, review, billing, profile and account paths carry transactional ids that
// must never reach an attribution processor — they keep their own first-party
// handoff pages instead, and any such ?target here is ignored.
function appTarget(request: NextRequest): string | undefined {
  const raw = request.nextUrl.searchParams.get("target");
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.length > 600) {
    return undefined;
  }
  const target = new URL(raw, request.nextUrl.origin);
  if (target.origin !== request.nextUrl.origin) {
    return undefined;
  }
  // Gate on the shared parser rather than a local regex. A bare "/listing" (no id)
  // used to pass: it minted a handoff token and set deep_link_sub10, but with no id
  // there is no deep_link_value, and the app early-returns when that is absent — so
  // the token was attached and then silently ignored. Requiring an id means "we
  // produced a target" and "the app can act on it" can no longer disagree.
  if (!listingIdFromAppPath(target.pathname)) {
    return undefined;
  }
  return `${target.pathname}${target.search}${target.hash}`;
}

export function GET(request: NextRequest) {
  const consent = parseConsent(request.cookies.get(CONSENT_COOKIE)?.value);
  // Everything below the OneLink branch is first-party. Campaign params are read
  // (and cleaned) regardless, but they only leave this origin on the granted path.
  const attribution = Object.fromEntries(
    GO_ATTRIBUTION_KEYS.flatMap((key) => {
      const value = cleanAttributionValue(request.nextUrl.searchParams.get(key));
      return value ? [[key, value]] : [];
    }),
  );
  const targetPath = appTarget(request);

  let oneLink: string | null = null;
  if (consent === "granted") {
    const handoffToken = createHandoffToken(targetPath);
    if (handoffToken) {
      attribution.deep_link_sub10 = handoffToken;
    }
    oneLink = buildGenericInstallLink(attribution, targetPath);
  }

  const { os } = userAgent(request);
  // Android keeps its deep-link target even without consent: the Play install
  // referrer is first-party and needs no SDK, so the declined path still resumes at
  // the listing. iOS has no equivalent, so it degrades to a bare store URL. Not
  // reached on the granted path — AppsFlyer builds its own Play URL and owns the
  // referrer there. See app/lib/play-referrer.ts.
  const playUrl = playStoreUrlWithReferrer(PLAY_STORE_URL, targetPath);
  // Desktop falls back to the marketing home at the CANONICAL origin, never one
  // derived from `request.url`. Hosts differ on whether they rewrite the request
  // host from X-Forwarded-Host: Amplify's SSR compute does not, so `request.url`
  // arrives as http://localhost:3000 and the fallback redirected visitors to a
  // dead URL. Every other absolute URL on the site already comes from SITE_ORIGIN.
  const destination =
    oneLink ??
    (os.name === "iOS" ? APP_STORE_URL
      : os.name === "Android" ? playUrl
        : `${SITE_ORIGIN}/`);
  const outcome =
    oneLink ? "onelink"
      : os.name === "iOS" ? "app_store"
        : os.name === "Android" ? "play_store"
          : "web_home";
  const handoff = cleanAttributionValue(request.nextUrl.searchParams.get("handoff"));
  const safeHandoff = handoff === "qr" || handoff === "smart" || handoff === "store" ? handoff : "direct";
  // Record the outcome only after the response is sent — the store/deep-link
  // redirect must never wait on the analytics round-trip. Plausible is first-party
  // and cookieless, so this is not gated on the attribution choice; `consent` is
  // recorded so the funnel stays readable once most visitors decline.
  after(() =>
    trackServerEvent(request, "App Redirect Outcome", {
      outcome,
      handoff: safeHandoff,
      consent,
      // True only where the target actually rides along: the consented OneLink, or
      // an Android referrer that was really attached. Reading this as "AppsFlyer
      // fired" would now be wrong — the two have come apart.
      contextPreserved: Boolean(
        targetPath && (oneLink || (os.name === "Android" && playUrl !== PLAY_STORE_URL)),
      ),
      os: os.name ?? "unknown",
    }),
  );
  return NextResponse.redirect(destination, {
    status: 302,
    // The response depends on the consent cookie and the UA; say so, even though
    // no-store already keeps it out of shared caches.
    headers: { "Cache-Control": "no-store", Vary: "Cookie, User-Agent" },
  });
}
