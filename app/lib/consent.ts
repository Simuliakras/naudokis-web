// Consent state for the two optional processings on this site, one cookie each:
//   - install attribution (AppsFlyer)        → nk_attr_consent, asked contextually
//     from install CTAs (ConsentSheet), gates /go's OneLink redirect.
//   - website analytics (Google Analytics)   → nk_ga_consent, asked once by the
//     site-wide banner (ConsentBanner), gates gtag's analytics_storage.
// Separate cookies because the purposes (and processors) are distinct — GDPR
// consent must be purpose-specific — and because each keeps its own policy
// version and re-ask clock. Both share one value format and one validation rule.
//
// A cookie is written ONLY after an explicit choice (allow or refuse). Refusal is
// remembered on purpose: it is what stops the prompt from re-asking.
//
// The value is deliberately minimal — policy version, the choice, and when it was
// made. No advertising identifier, no visitor id, nothing that could function as
// one. Anything malformed, expired, or written under an older policy version reads
// back as "unknown", which fails CLOSED: /go sends the visitor straight to the
// store and AppsFlyer never sees the click; gtag keeps analytics_storage denied.
//
// Client-safe (no node imports): `parseConsent` runs in app/go/route.ts on the
// server, the rest in the browser.

export const CONSENT_COOKIE = "nk_attr_consent";
export const ANALYTICS_CONSENT_COOKIE = "nk_ga_consent";

// Bump when the disclosure the choice was made against changes materially. Every
// stored choice then reads as "unknown" and is asked again.
export const CONSENT_POLICY_VERSION = 1;
export const ANALYTICS_CONSENT_POLICY_VERSION = 1;

// Re-ask after six months even if nothing else changed.
const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

// Tolerate client/server clock skew before calling a future timestamp tampered.
const CLOCK_SKEW_SECONDS = 24 * 60 * 60;

export type ConsentStatus = "granted" | "denied" | "unknown";
// What the prompt returns. "dismissed" is not a choice — it aborts the action and
// stores nothing, so the next install click asks again.
export type ConsentDecision = "granted" | "denied" | "dismissed";

// Cookie value: "<version>.<choice>.<unixSeconds>".
function serialize(policyVersion: number, choice: "granted" | "denied"): string {
  return `${policyVersion}.${choice}.${Math.floor(Date.now() / 1000)}`;
}

// The single validation rule, shared by the server (/go) and the client. Every
// rejection path returns "unknown" — never a silent "granted".
export function parseConsent(
  raw: string | undefined,
  policyVersion: number = CONSENT_POLICY_VERSION,
): ConsentStatus {
  const [version, choice, stamp] = (raw ?? "").split(".");
  if (Number(version) !== policyVersion) {
    return "unknown";
  }
  if (choice !== "granted" && choice !== "denied") {
    return "unknown";
  }
  const madeAt = Number(stamp);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(madeAt) || madeAt <= 0) {
    return "unknown";
  }
  if (madeAt > now + CLOCK_SKEW_SECONDS || now - madeAt > MAX_AGE_SECONDS) {
    return "unknown";
  }
  return choice;
}

/* ---------------- Client state ---------------- */

// Fired whenever the stored choice changes, so the footer panel and any open CTA
// stay in sync with a withdrawal made elsewhere on the page.
export const NK_CONSENT_CHANGE_EVENT = "nk:consent-change";

function cookieValue(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function readConsent(): ConsentStatus {
  if (typeof document === "undefined") {
    return "unknown";
  }
  return parseConsent(cookieValue(CONSENT_COOKIE));
}

export function readAnalyticsConsent(): ConsentStatus {
  if (typeof document === "undefined") {
    return "unknown";
  }
  return parseConsent(cookieValue(ANALYTICS_CONSENT_COOKIE), ANALYTICS_CONSENT_POLICY_VERSION);
}

// Not HttpOnly: the client owns these preferences — they must be readable to render
// the current status and writable to withdraw. SameSite=Lax is enough; the cookies
// only ever gate our own /go redirect and our own gtag consent state.
//
// Withdrawal writes "denied" rather than deleting: it takes effect immediately and
// the visitor isn't re-asked afterwards.
function writeChoiceCookie(name: string, policyVersion: number, choice: "granted" | "denied"): void {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${serialize(policyVersion, choice)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(NK_CONSENT_CHANGE_EVENT));
}

export function writeConsent(choice: "granted" | "denied"): void {
  writeChoiceCookie(CONSENT_COOKIE, CONSENT_POLICY_VERSION, choice);
}

export function writeAnalyticsConsent(choice: "granted" | "denied"): void {
  // Order matters: the change event (dispatched by writeChoiceCookie) flips gtag's
  // analytics_storage to denied first, so GA won't re-create the cookies we expire.
  writeChoiceCookie(ANALYTICS_CONSENT_COOKIE, ANALYTICS_CONSENT_POLICY_VERSION, choice);
  if (choice === "denied") {
    expireGaCookies();
  }
}

// Google Analytics sets _ga / _ga_<container> first-party cookies on the
// registrable domain. Best-effort deletion on withdrawal: expire each name with and
// without the apex Domain attribute (the "www." strip is a heuristic, not a public
// suffix list). Any survivor is inert once analytics_storage is denied.
function expireGaCookies(): void {
  const apex = location.hostname.replace(/^www\./, "");
  for (const entry of document.cookie.split("; ")) {
    const name = entry.split("=")[0];
    if (name !== "_ga" && !name.startsWith("_ga_")) {
      continue;
    }
    for (const domain of ["", `; Domain=.${apex}`]) {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain}`;
    }
  }
}

/* ---------------- The prompt ---------------- */

export const NK_CONSENT_ASK_EVENT = "nk:consent-ask";
export type ConsentAskDetail = { resolve: (decision: ConsentDecision) => void };

declare global {
  interface Window {
    // Set by <ConsentSheet/> once mounted. It loads via next/dynamic, so a click
    // can land before it exists.
    __nkConsentReady?: boolean;
  }
}

// Ask for a choice, resolving once the visitor makes one. Callers should only ask
// when `readConsent()` is "unknown".
//
// If the sheet isn't mounted yet we resolve "denied" WITHOUT storing anything: the
// install still proceeds (to the store, unattributed) and the next click asks
// properly. Never resolve "granted" by default — a missing prompt must not become
// silent consent.
export function askConsent(): Promise<ConsentDecision> {
  if (typeof window === "undefined" || !window.__nkConsentReady) {
    return Promise.resolve("denied");
  }
  return new Promise<ConsentDecision>((resolve) => {
    window.dispatchEvent(
      new CustomEvent<ConsentAskDetail>(NK_CONSENT_ASK_EVENT, { detail: { resolve } }),
    );
  });
}
