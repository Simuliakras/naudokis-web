// Deposit filter for the listings feed.
//
// The single source of truth for the deposit control's states and every conversion
// around it: the toggle, the `?deposit=` URL token and the backend params all pass
// through here, so none of them can drift. Pure and dependency-free — that is what
// lets app/lib/deposit-filter.test.ts exercise the whole state matrix as plain
// function calls, the same shape app/lib/price-range.ts takes.
//
// Deposit is NOT a price-style two-ended range: the backend has no
// deposit_min_cents, and "no deposit" is a distinct state, not `min === 0`. The
// three states are modelled honestly as a union. The UI today exposes only "none"
// (a toggle); "max" exists for deep links and is what a future ceiling control
// would produce — the token grammar and wire mapping already cover it.

// Euros. The backend's own listing schema caps a deposit at 50 000 cents, so €500
// is the highest deposit that can exist — a ceiling resting here is an OPEN "any
// deposit". parseDepositParam() collapses such a token to "any" (like a fully-open
// price range) and depositToParams() keeps its own omit-the-bound guard so a future
// ceiling control resting here never sends 50000 either.
export const DEPOSIT_CEIL = 500;

export type DepositFilter =
  | { kind: "any" } // send nothing
  | { kind: "none" } // deposit_required=false — absent / null / 0 all mean "takes none"
  | { kind: "max"; euros: number }; // deposit_max_cents — INCLUDES no-deposit listings

// → the backend's params. Note "max" deliberately does not also send
// deposit_required: a ceiling already admits the no-deposit listings (they satisfy
// every ceiling), and pinning deposit_required=true would silently drop them —
// the exact inversion the backend itself shipped until 2026-07-16.
export function depositToParams(f: DepositFilter): { depositMaxCents?: number; depositRequired?: boolean } {
  switch (f.kind) {
    case "any":
      return {};
    case "none":
      return { depositRequired: false };
    case "max":
      return f.euros >= DEPOSIT_CEIL ? {} : { depositMaxCents: Math.round(f.euros * 100) };
  }
}

// Filter → canonical `?deposit=` token; "" when it filters nothing (so setParams
// drops the param). Idempotent with parseDepositParam.
export function serializeDepositParam(f: DepositFilter): string {
  if (f.kind === "any") {
    return "";
  }
  return f.kind === "none" ? "none" : String(f.euros);
}

// `?deposit=` token → filter. Grammar: absent → any, "none" → no deposit,
// "50" → up to €50. A euro value must be a whole number of euros strictly below
// the ceiling (1–499): fractions would label a chip with a raw float and can dip
// under the backend's 100-cent deposit floor, and a token at/over the ceiling
// admits every listing, so it collapses to "any" instead of badging a filter that
// sends nothing. Anything else ("0", negatives, junk) falls back to "any" too —
// the URL never 400s the feed, mirroring the backend's leniency about unknown params.
export function parseDepositParam(raw: string | null | undefined): DepositFilter {
  if (!raw) {
    return { kind: "any" };
  }
  if (raw === "none") {
    return { kind: "none" };
  }
  const euros = Number(raw);
  if (!Number.isInteger(euros) || euros <= 0 || euros >= DEPOSIT_CEIL) {
    return { kind: "any" };
  }
  return { kind: "max", euros };
}
