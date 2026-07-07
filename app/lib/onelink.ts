// AppsFlyer OneLink install-link builder for the /invite referral bridge and the
// generic /go smart link. The web attaches the referral context to a OneLink URL;
// the native app reads it on first launch (deferred deep linking) and, after
// in-app KYC, applies the 8-char code via the backend `apply-code`.
//
// The referral code travels as OneLink's `deep_link_value` param — keep this
// verbatim with the app's UDL handler and the dashboard OneLink template
// (cross-team contract), and identical to the backend's `share_link` builder so
// there is a single link contract. Verify the exact param name against the
// AppsFlyer dashboard template + backend `share_link` builder before launch — a
// silent mismatch drops referral attribution without any error. OneLink long-form
// URLs are pure string construction: no SDK, no async init, and no consent gate
// on the web (the AppsFlyer SDK and its consent live in the app).
//
// Inert until configured: with NEXT_PUBLIC_ONELINK_URL unset, install links
// degrade to the /go smart link exactly as the (now-removed) Branch path did.

const ONELINK_URL = process.env.NEXT_PUBLIC_ONELINK_URL ?? "";

// Relative smart-link fallback used when OneLink is unconfigured or no code is
// present. Its relativeness is load-bearing: InviteScreen gates the reward copy
// on `installLink.startsWith("http")`, so a "/go" fallback never advertises
// attribution it can't deliver.
const INSTALL_FALLBACK = "/go";

// Build an absolute OneLink URL from the configured template plus the given
// params. Callers only reach here once ONELINK_URL is known non-empty.
function oneLink(params: Record<string, string>): string {
  const url = new URL(ONELINK_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

// Per-code referral install link: an absolute OneLink URL carrying the 8-char
// code when configured, or the /go fallback otherwise.
export function buildInstallLink(code: string | null): string {
  if (!code || !ONELINK_URL) {
    return INSTALL_FALLBACK;
  }
  return oneLink({
    // The app's UDL reads the 8-char referral code from deep_link_value (backend
    // contract / referralShareLinkCodeParam) — keep this param name identical to
    // the backend `share_link` builder and the dashboard OneLink template.
    deep_link_value: code,
    pid: "web_invite",
    c: "invite",
  });
}

// Generic (codeless) install smart link for /go: an absolute OneLink URL when
// configured, or null so the caller falls back to its OS-sniff store redirect.
export function buildGenericInstallLink(): string | null {
  if (!ONELINK_URL) {
    return null;
  }
  return oneLink({ pid: "web", c: "install" });
}
