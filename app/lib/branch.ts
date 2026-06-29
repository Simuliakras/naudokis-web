// Branch.io deferred-attribution integration for the /invite referral bridge.
//
// The web's job is to carry the referral code across the install boundary: it
// attaches { referral_code } to a Branch link; the app's react-native-branch SDK
// reads `params.referral_code` on first launch and passes it to
// POST /referrals/apply-code after signup + identity verification (KYC). The key
// MUST stay exactly "referral_code" on both sides — do not let it drift to
// `code` / `referralCode` / `invite_code` (cross-team contract).
//
// GDPR: Branch is a data sub-processor that sets identifiers. The site is
// otherwise cookieless, so Branch must NOT initialize until the user has
// consented. Init is gated on BOTH a configured key AND consent; with either
// missing, the page degrades to the existing /go smart-install link and no
// Branch code runs at all. Wire the real consent banner into hasBranchConsent()
// before launch (and add Branch to the privacy policy / sub-processor list).
import { APP_STORE_URL } from "./contact";
import { SITE_URL } from "./seo";

// Branch live/test key, client-readable. Empty by default so an unconfigured
// build ships inert Branch (mirrors Sentry-without-DSN and the Plausible gate).
export const BRANCH_KEY = process.env.NEXT_PUBLIC_BRANCH_KEY ?? "";

// THE cross-team contract key. The app reads params[REFERRAL_CODE_KEY] verbatim.
export const REFERRAL_CODE_KEY = "referral_code";

// Smart-install fallback when Branch is unavailable (no key / no consent / error).
// The existing /go route sniffs the OS and routes to the right store.
export const INSTALL_FALLBACK = "/go";

// Consent gate. No consent mechanism exists yet, so this returns false until one
// is wired (recording its decision under this key). Until then Branch never
// initializes and /invite uses the /go fallback — the GDPR-safe default.
export function hasBranchConsent(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem("nk_branch_consent") === "1";
  } catch {
    return false;
  }
}

export function branchEnabled(): boolean {
  return BRANCH_KEY !== "" && hasBranchConsent();
}

// The initialized SDK instance, cached after the first successful init so
// buildInstallLink reuses it rather than re-importing / re-initializing.
type BranchSdk = typeof import("branch-sdk").default;
let branch: BranchSdk | null = null;

// Lazy-init Branch once. Dynamically imported so the SDK only loads on /invite
// (and only after consent), never in the shared bundle. Resolves false when
// Branch is disabled or fails to load — callers then fall back to /go.
export async function initBranch(): Promise<boolean> {
  if (!branchEnabled()) {
    return false;
  }
  if (branch) {
    return true;
  }
  try {
    const { default: sdk } = await import("branch-sdk");
    await new Promise<void>((resolve) => {
      sdk.init(BRANCH_KEY, undefined, () => resolve());
    });
    branch = sdk;
    return true;
  } catch {
    return false;
  }
}

// Build a per-code Branch install link carrying { referral_code }. Returns the
// /go fallback when there's no code or Branch is disabled / unavailable, so the
// CTA always works.
export async function buildInstallLink(code: string | null): Promise<string> {
  // No code → no referral to attach; skip Branch and use the /go smart link.
  if (!code) {
    return INSTALL_FALLBACK;
  }
  const ready = await initBranch();
  if (!ready || !branch) {
    return INSTALL_FALLBACK;
  }
  const sdk = branch;
  try {
    return await new Promise<string>((resolve) => {
      sdk.link(
        {
          channel: "web",
          feature: "referral",
          campaign: "invite",
          data: {
            [REFERRAL_CODE_KEY]: code,
            $canonical_url: `${SITE_URL}/invite?code=${code}`,
            $desktop_url: APP_STORE_URL,
          },
        },
        (err, link) => resolve(err || !link ? INSTALL_FALLBACK : link),
      );
    });
  } catch {
    return INSTALL_FALLBACK;
  }
}
