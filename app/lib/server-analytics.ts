import type { NextRequest } from "next/server";
import { isIP } from "node:net";

type EventProps = Record<string, string | number | boolean>;

// Plausible's Events API is intentionally cookieless and accepts server-side
// events. Redirect routes cannot rely on browser JavaScript, so this is the only
// reliable place to record their outcome. Failures never block the user journey.
export async function trackServerEvent(
  request: NextRequest,
  name: string,
  props: EventProps,
): Promise<void> {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) {
    return;
  }
  const endpoint = process.env.PLAUSIBLE_EVENTS_API ?? "https://plausible.io/api/event";
  try {
    const endpointUrl = new URL(endpoint);
    const allowInsecureLocal = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "::1"].includes(endpointUrl.hostname);
    if (endpointUrl.protocol !== "https:" && !allowInsecureLocal) return;
    const pageUrl = new URL(request.url);
    pageUrl.search = "";
    pageUrl.hash = "";
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "Naudokis web redirect",
        ...validatedClientIp(request.headers.get("x-forwarded-for")),
      },
      body: JSON.stringify({ name, domain, url: pageUrl.toString(), props }),
      cache: "no-store",
      signal: AbortSignal.timeout(800),
    });
  } catch {
    // Analytics must never delay or break a store/deep-link redirect.
  }
}

function validatedClientIp(forwardedFor: string | null): Record<string, string> {
  const first = forwardedFor?.split(",", 1)[0]?.trim();
  if (!first || !isIP(first)) return {};
  return { "X-Forwarded-For": first };
}
