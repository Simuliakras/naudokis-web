import { NextResponse, userAgent, type NextRequest } from "next/server";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/contact";
import { buildGenericInstallLink } from "@/app/lib/onelink";

// Smart install link. A single shareable URL (https://www.naudokis.lt/go) — the
// one the hero/CTA/modal QR encodes. When AppsFlyer OneLink is configured it
// redirects there (attributed install + deferred deep linking); otherwise it
// routes each visitor to the right store by sniffing the OS (phones → native
// store, desktop / unknown → marketing home). Reads the UA, so it's dynamic and
// must never be cached.
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  // When OneLink is configured, route every /go visitor through it so all
  // installs (organic/direct as well as referral) are attributed — it does its
  // own OS detection + deferred deep linking.
  const oneLink = buildGenericInstallLink();
  if (oneLink) {
    return NextResponse.redirect(oneLink, {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }
  const { os } = userAgent(request);
  const target =
    os.name === "iOS" ? APP_STORE_URL
      : os.name === "Android" ? PLAY_STORE_URL
        : new URL("/", request.url).toString();
  return NextResponse.redirect(target, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
