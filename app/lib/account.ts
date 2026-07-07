// Account data layer — cancel a queued account deletion from a signed email link.
// Unlike the rest of the site (no login), this is a real state-changing action the
// web can complete on its own: the account-deletion email's OneLink `af_web_dp`
// lands the user on /cancel-deletion?token=<token>, and the token itself is the
// authorization for a public, no-auth backend endpoint. It is the desktop / no-app
// path for a GDPR-critical action (aborting a hard delete), so it must not dead-end
// on a transient error — the error state offers a retry and a support contact.
import { API_BASE } from "./api";

/* ---------------- Backend shapes ---------------- */
// POST /auth/cancel-deletion-by-token — public, no auth. 200 on success; the
// canonical error envelope carries an errorCode we branch on and a correlationId
// we surface for support. Only the fields we read are modelled.
type CancelErrorBody = {
  errorCode?: string;
  correlationId?: string;
};

/* ---------------- View model ---------------- */
// `invalid` = bad/expired/tampered token (400); `already` = the deletion was
// already processed or canceled (409); `error` = network / 5xx / unexpected — the
// only retryable kind. correlationId is threaded through so the error state can
// show it (copyable) for support tracing.
export type CancelResult =
  | { ok: true }
  | { ok: false; kind: "invalid" | "already" | "error"; correlationId?: string };

/* ---------------- Action ---------------- */
// Single POST — not a cached query, so a plain async function (no react-query hook).
// The token is a long HMAC-signed string: pass it verbatim, never decode/reformat.
export async function cancelDeletionByToken(token: string): Promise<CancelResult> {
  try {
    const res = await fetch(`${API_BASE}/auth/cancel-deletion-by-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      return { ok: true };
    }
    // Read the canonical error envelope; a body that isn't JSON shouldn't mask the
    // status → fall back to status-based mapping.
    const body = await res.json().catch((): CancelErrorBody => ({}));
    const correlationId = body.correlationId;
    if (res.status === 400 || body.errorCode === "DELETION_CANCEL_TOKEN_INVALID") {
      return { ok: false, kind: "invalid", correlationId };
    }
    if (res.status === 409 || body.errorCode === "DELETION_CANCEL_ALREADY_PROCESSED") {
      return { ok: false, kind: "already", correlationId };
    }
    return { ok: false, kind: "error", correlationId };
  } catch {
    return { ok: false, kind: "error" };
  }
}
