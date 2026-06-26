import { NextResponse, userAgent, type NextRequest } from "next/server";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/app/lib/contact";

// Smart install link. A single shareable URL (https://www.naudokis.lt/go) — the
// one the hero/CTA/modal QR encodes — that routes each visitor to the right
// store by sniffing the OS. Phones scanning the QR land on their native store;
// desktop / unknown agents fall through to the marketing home, where both store
// badges are visible. Reads the UA, so it's dynamic and must never be cached.
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
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
