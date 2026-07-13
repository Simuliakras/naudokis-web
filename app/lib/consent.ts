// Install-attribution consent — the one gate between this site and AppsFlyer.
//
// The site is otherwise cookieless. This cookie is written ONLY after an explicit
// choice (allow or refuse), so a visitor who never touches an install CTA never
// gets one. Refusal is remembered on purpose: it is what stops the prompt from
// nagging on every subsequent install click.
//
// The value is deliberately minimal — policy version, the choice, and when it was
// made. No advertising identifier, no visitor id, nothing that could function as
// one. Anything malformed, expired, or written under an older policy version reads
// back as "unknown", which fails CLOSED: /go then sends the visitor straight to the
// store and AppsFlyer never sees the click.
//
// Client-safe (no node imports): `parseConsent` runs in app/go/route.ts on the
// server, the rest in the browser.

export const CONSENT_COOKIE = "nk_attr_consent";

// Bump when the disclosure the choice was made against changes materially. Every
// stored choice then reads as "unknown" and is asked again.
export const CONSENT_POLICY_VERSION = 1;

// Re-ask after six months even if nothing else changed.
const MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

// Tolerate client/server clock skew before calling a future timestamp tampered.
const CLOCK_SKEW_SECONDS = 24 * 60 * 60;

export type ConsentStatus = "granted" | "denied" | "unknown";
// What the prompt returns. "dismissed" is not a choice — it aborts the action and
// stores nothing, so the next install click asks again.
export type ConsentDecision = "granted" | "denied" | "dismissed";

// Cookie value: "<version>.<choice>.<unixSeconds>".
function serialize(choice: "granted" | "denied"): string {
  return `${CONSENT_POLICY_VERSION}.${choice}.${Math.floor(Date.now() / 1000)}`;
}

// The single validation rule, shared by the server (/go) and the client. Every
// rejection path returns "unknown" — never a silent "granted".
export function parseConsent(raw: string | undefined): ConsentStatus {
  const [version, choice, stamp] = (raw ?? "").split(".");
  if (Number(version) !== CONSENT_POLICY_VERSION) {
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

function cookieValue(): string | undefined {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
}

export function readConsent(): ConsentStatus {
  if (typeof document === "undefined") {
    return "unknown";
  }
  return parseConsent(cookieValue());
}

// Not HttpOnly: the client owns this preference — it must be readable to render the
// current status and writable to withdraw. SameSite=Lax is enough; the cookie only
// ever gates our own /go redirect.
//
// Withdrawal writes "denied" rather than deleting: /go treats it exactly like a
// missing cookie (straight to the store), and it takes effect on the very next
// request with no server round-trip — but the visitor isn't re-asked afterwards.
export function writeConsent(choice: "granted" | "denied"): void {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${serialize(choice)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(NK_CONSENT_CHANGE_EVENT));
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
