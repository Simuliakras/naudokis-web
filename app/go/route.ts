import { after, NextResponse, userAgent, type NextRequest } from "next/server";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/contact";
import { buildGenericInstallLink } from "@/app/lib/onelink";
import { GO_ATTRIBUTION_KEYS, cleanAttributionValue } from "@/app/lib/attribution";
import { trackServerEvent } from "@/app/lib/server-analytics";
import { createHandoffToken } from "@/app/lib/handoff-token";

// Smart install link. A single shareable URL (https://www.naudokis.lt/go) — the
// one the hero/CTA/modal QR encodes. When AppsFlyer OneLink is configured it
// redirects there (attributed install + deferred deep linking); otherwise it
// routes each visitor to the right store by sniffing the OS (phones → native
// store, desktop / unknown → marketing home). Reads the UA, so it's dynamic and
// must never be cached.
export const dynamic = "force-dynamic";

const APP_PATH = /^\/(?:listing|profile|booking-request|billing-documents|review|chat|ref)(?:\/|$)|^\/(?:my-profile|rewards|reset-password|verify-email)$/;

function appTarget(request: NextRequest): string | undefined {
  const raw = request.nextUrl.searchParams.get("target");
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.length > 600) {
    return undefined;
  }
  const target = new URL(raw, request.nextUrl.origin);
  if (target.origin !== request.nextUrl.origin || !APP_PATH.test(target.pathname)) {
    return undefined;
  }
  return `${target.pathname}${target.search}${target.hash}`;
}

export function GET(request: NextRequest) {
  // When OneLink is configured, route every /go visitor through it so all
  // installs (organic/direct as well as referral) are attributed — it does its
  // own OS detection + deferred deep linking.
  const attribution = Object.fromEntries(
    GO_ATTRIBUTION_KEYS.flatMap((key) => {
      const value = cleanAttributionValue(request.nextUrl.searchParams.get(key));
      return value ? [[key, value]] : [];
    }),
  );
  const targetPath = appTarget(request);
  const handoffToken = createHandoffToken(targetPath);
  if (handoffToken) {
    attribution.deep_link_sub10 = handoffToken;
  }
  const oneLink = buildGenericInstallLink(attribution, targetPath);
  const { os } = userAgent(request);
  const destination =
    oneLink ??
    (os.name === "iOS" ? APP_STORE_URL
      : os.name === "Android" ? PLAY_STORE_URL
        : new URL("/", request.url).toString());
  const outcome =
    oneLink ? "onelink"
      : os.name === "iOS" ? "app_store"
        : os.name === "Android" ? "play_store"
          : "web_home";
  const handoff = cleanAttributionValue(request.nextUrl.searchParams.get("handoff"));
  const safeHandoff = handoff === "qr" || handoff === "smart" || handoff === "store" ? handoff : "direct";
  // Record the outcome only after the response is sent — the store/deep-link
  // redirect must never wait on the analytics round-trip.
  after(() =>
    trackServerEvent(request, "App Redirect Outcome", {
      outcome,
      handoff: safeHandoff,
      contextPreserved: Boolean(targetPath),
      os: os.name ?? "unknown",
    }),
  );
  return NextResponse.redirect(destination, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
