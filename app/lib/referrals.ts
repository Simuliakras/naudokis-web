// Referral data layer — validate a referral code from the Naudokis backend.
// The web NEVER redeems a code (apply-code is a JWT-gated, in-app action that
// runs only inside the mobile app); the one public referral call the site makes
// is validate-code. Everything here is fail-open: a bad / unknown / rate-limited
// code must never dead-end the install funnel.
import { useQuery, skipToken } from "@tanstack/react-query";
import { API_BASE } from "./api";

/* ---------------- Backend shapes ---------------- */
// POST /referrals/validate-code — public, no auth. Only the fields we read are
// modelled. Invalid / inactive / disabled codes still return HTTP 200 with
// valid:false (NOT an error); 429 means the per-IP rate limit was hit.
type ValidateCodeResponse = {
  success: boolean;
  data: {
    valid: boolean;
    referee_reward_cents?: number; // dynamic (admin-configurable) — render, don't hardcode
    reason?: string;
  };
};

/* ---------------- View model ---------------- */
// `unknown` (network / 429) renders optimistically and still lets the user
// install — a transient error must not cost them the reward path.
export type ValidateResult =
  | { valid: true; refereeRewardCents: number } // cents is 0 if the backend omits it
  | { valid: false; reason?: string }
  | { unknown: true };

/* ---------------- Code format ---------------- */
// Mirror of the backend format: exactly 8 chars from a charset that excludes the
// ambiguous 0 O 1 I L. Reject obvious garbage before hitting the API (and before
// it counts against the validate-code rate limit).
const CODE_RE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/;

// Normalize a raw ?code value to its canonical form, or null when it can't be a
// valid code. Uppercased + trimmed to match the server's own normalization.
export function normalizeCode(raw: string | null | undefined): string | null {
  const code = (raw ?? "").trim().toUpperCase();
  return CODE_RE.test(code) ? code : null;
}

/* ---------------- Fetcher + hook ---------------- */
// First (and only) POST in the data layer — the GET fetchers in listings.ts /
// categories.ts add `next: { revalidate }` for server-side ISR; this is a
// client-triggered, uncached request, so it omits it.
export async function fetchValidateCode(code: string): Promise<ValidateResult> {
  try {
    const res = await fetch(`${API_BASE}/referrals/validate-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    // 429 (10/min, 60/hr per IP) or any non-OK → optimistic, don't penalize.
    if (!res.ok) {
      return { unknown: true };
    }
    const body: ValidateCodeResponse = await res.json();
    const d = body.data;
    if (d?.valid) {
      return { valid: true, refereeRewardCents: d.referee_reward_cents ?? 0 };
    }
    return { valid: false, reason: d?.reason };
  } catch {
    return { unknown: true };
  }
}

// Keyed on the normalized code so server prefetch and the hook can't diverge.
export function validateCodeKey(code: string | null) {
  return ["referrals", "validate-code", code] as const;
}

// One call per code, cached for the session, never retried (the fetcher already
// fails open). skipToken keeps the query idle until a syntactically-valid code
// exists — no `enabled` flag, no `as` cast.
export function useValidateCode(code: string | null) {
  return useQuery({
    queryKey: validateCodeKey(code),
    queryFn: code ? () => fetchValidateCode(code) : skipToken,
    retry: false,
    staleTime: Infinity,
  });
}
