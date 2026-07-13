// The app-link contract: the paths the native app claims as universal links and
// the backend puts into transactional email (EMAIL_WEB_FALLBACK_BASE + these).
//
// This list is the single source of truth. `proxy.ts` uses it to negotiate the
// locale for these unprefixed URLs, `components/Analytics.tsx` to keep the token
// pages script-free, and `scripts/verify-app-links.mjs` to check that every path
// claimed in the AASA still resolves to a real route.
//
// Deliberately dependency-free beyond i18n/config, because `proxy.ts` imports it and
// the proxy runs on every request: a path predicate has no business depending on the
// site's copy. (Turbopack does tree-shake an unused dictionary import back out of the
// proxy bundle — this is layering, not a bundle-size fix.) Anything that needs copy
// belongs in handoff-page.ts instead.
//
// Why real pages at all: opening one of these URLs must not disclose the click to
// an attribution processor before the user has made an analytics choice in the app.
// So each is a first-party screen that explains where the thing lives and offers a
// native deep link + direct store links — never an AppsFlyer redirect, and never the
// authenticated record itself (the web has no login, and a valid id must render
// exactly like a bogus one).
import { barePath } from "./i18n/config";
import type { HandoffKind } from "./i18n/types";

// First URL segment → dictionary key. `listing` and `ref` are absent: they have
// their own pages, which redirect to a real first-party screen rather than render a
// handoff card. They still need the locale negotiation, hence HANDOFF_SEGMENTS.
export const HANDOFF_KINDS: Record<string, HandoffKind> = {
  "booking-request": "bookingRequest",
  "chat": "chat",
  "review": "review",
  "billing-documents": "billingDocuments",
  "profile": "profile",
  "my-profile": "myProfile",
  "rewards": "rewards",
  "reset-password": "resetPassword",
  "verify-email": "verifyEmail",
};

// Every unprefixed path whose locale must be negotiated from Accept-Language: the
// handoff cards plus the two that redirect (/listing/:id → the public listing,
// /ref/:code → the invite bridge). Emails and app links use the unprefixed form, so
// there is no locale in the URL to read.
export const HANDOFF_SEGMENTS = [...Object.keys(HANDOFF_KINDS), "listing", "ref"];

export function isHandoffPath(pathname: string): boolean {
  return HANDOFF_SEGMENTS.includes(pathname.split("/")[1]);
}

// Paths whose query carries a single-use token (password reset, email verification,
// deletion cancel). The token authorizes a real account action, so it must not be
// forwarded to a third party — not to analytics, not to error reporting.
//
// Plausible only offers server-side page blocking, which would still mean shipping
// the URL to them first, so the analytics script is simply not loaded on these
// pages (see components/Analytics.tsx). The screens additionally strip the token
// from the address bar once they hold it (use-strip-sensitive-query.ts).
const TOKENIZED_PATHS = ["/cancel-deletion", "/reset-password", "/verify-email"];

export function isTokenizedPath(pathname: string): boolean {
  // Accepts either the public path or the proxy's internal /lt|/en form, since this
  // runs during the server render too.
  const bare = barePath(pathname);
  return TOKENIZED_PATHS.some((path) => bare === path || bare.startsWith(`${path}/`));
}
