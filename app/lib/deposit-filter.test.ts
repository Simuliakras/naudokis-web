import { describe, expect, it } from "vitest";
import { DEPOSIT_CEIL, depositToParams, parseDepositParam, serializeDepositParam } from "./deposit-filter";

describe("depositToParams", () => {
  it("sends nothing for the unfiltered state", () => {
    expect(depositToParams({ kind: "any" })).toEqual({});
  });
  // "none" is deposit_required=false alone — a depositMaxCents alongside it could
  // never bind (false already pins the deposit to zero).
  it("maps 'none' to deposit_required=false and nothing else", () => {
    expect(depositToParams({ kind: "none" })).toEqual({ depositRequired: false });
  });
  it("maps a bound ceiling to cents", () => {
    expect(depositToParams({ kind: "max", euros: 50 })).toEqual({ depositMaxCents: 5000 });
  });
  // A ceiling never pins deposit_required=true: no-deposit listings satisfy every
  // ceiling, and requiring a deposit would silently drop them — the exact bug the
  // backend fixed on 2026-07-16.
  it("never pairs a ceiling with deposit_required", () => {
    expect(depositToParams({ kind: "max", euros: 50 })).not.toHaveProperty("depositRequired");
  });
  it("treats a ceiling at (or past) €500 as open and omits the bound", () => {
    expect(depositToParams({ kind: "max", euros: DEPOSIT_CEIL })).toEqual({});
    expect(depositToParams({ kind: "max", euros: 900 })).toEqual({});
  });
  it("rounds euros to integer cents", () => {
    expect(depositToParams({ kind: "max", euros: 50.1 })).toEqual({ depositMaxCents: 5010 });
  });
});

describe("parseDepositParam", () => {
  it("reads an absent or empty token as unfiltered", () => {
    expect(parseDepositParam(null)).toEqual({ kind: "any" });
    expect(parseDepositParam(undefined)).toEqual({ kind: "any" });
    expect(parseDepositParam("")).toEqual({ kind: "any" });
  });
  it("reads the 'none' token", () => {
    expect(parseDepositParam("none")).toEqual({ kind: "none" });
  });
  it("reads a euro ceiling", () => {
    expect(parseDepositParam("50")).toEqual({ kind: "max", euros: 50 });
    expect(parseDepositParam(String(DEPOSIT_CEIL - 1))).toEqual({ kind: "max", euros: DEPOSIT_CEIL - 1 });
  });
  // At/over the ceiling the filter admits everything, so the token collapses to
  // "any" rather than badging an active filter that sends nothing on the wire.
  it("collapses an at-or-over-ceiling token to unfiltered", () => {
    expect(parseDepositParam(String(DEPOSIT_CEIL))).toEqual({ kind: "any" });
    expect(parseDepositParam("501")).toEqual({ kind: "any" });
  });
  it("falls back to unfiltered on junk, zero, negatives and fractions", () => {
    expect(parseDepositParam("abc")).toEqual({ kind: "any" });
    expect(parseDepositParam("0")).toEqual({ kind: "any" });
    expect(parseDepositParam("-5")).toEqual({ kind: "any" });
    // Fractions: a float chip label, and sub-€1 dips under the backend's
    // 100-cent deposit floor ("up to €0.5" would behave as "none").
    expect(parseDepositParam("49.5")).toEqual({ kind: "any" });
    expect(parseDepositParam("0.5")).toEqual({ kind: "any" });
    expect(parseDepositParam("Infinity")).toEqual({ kind: "any" });
  });
});

describe("serializeDepositParam", () => {
  it("drops the unfiltered state to an empty token", () => {
    expect(serializeDepositParam({ kind: "any" })).toBe("");
  });
  it("writes the two active states", () => {
    expect(serializeDepositParam({ kind: "none" })).toBe("none");
    expect(serializeDepositParam({ kind: "max", euros: 50 })).toBe("50");
  });
  it("round-trips through parseDepositParam", () => {
    for (const f of [
      { kind: "any" } as const,
      { kind: "none" } as const,
      { kind: "max", euros: 50 } as const,
      { kind: "max", euros: DEPOSIT_CEIL - 1 } as const,
    ]) {
      expect(parseDepositParam(serializeDepositParam(f))).toEqual(f);
    }
  });
  // A ceiling at rest is not representable in the URL: its token parses back to
  // "any", so canonicalization (serialize ∘ parse) drops ?deposit=500 entirely.
  it("canonicalizes an at-ceiling max away", () => {
    expect(parseDepositParam(serializeDepositParam({ kind: "max", euros: DEPOSIT_CEIL }))).toEqual({ kind: "any" });
  });
});
