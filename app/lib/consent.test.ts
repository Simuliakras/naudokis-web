import { describe, expect, it } from "vitest";
import {
  ANALYTICS_CONSENT_POLICY_VERSION,
  CONSENT_POLICY_VERSION,
  parseConsent,
} from "./consent";

const now = () => Math.floor(Date.now() / 1000);
const value = (version: number, choice: string, madeAt: number) => `${version}.${choice}.${madeAt}`;

describe("parseConsent", () => {
  it("reads back a current explicit choice", () => {
    expect(parseConsent(value(CONSENT_POLICY_VERSION, "granted", now()))).toBe("granted");
    expect(parseConsent(value(CONSENT_POLICY_VERSION, "denied", now()))).toBe("denied");
  });

  // Every rejection path must land on "unknown" — the fail-CLOSED state that /go
  // and gtag both read as "no consent". Never a silent "granted".
  it("rejects a missing or malformed value", () => {
    expect(parseConsent(undefined)).toBe("unknown");
    expect(parseConsent("")).toBe("unknown");
    expect(parseConsent("granted")).toBe("unknown");
    expect(parseConsent(`${CONSENT_POLICY_VERSION}.granted.`)).toBe("unknown");
    expect(parseConsent(`${CONSENT_POLICY_VERSION}.maybe.${now()}`)).toBe("unknown");
  });

  it("re-asks after a policy-version bump", () => {
    expect(parseConsent(value(CONSENT_POLICY_VERSION + 1, "granted", now()))).toBe("unknown");
  });

  // The attribution and analytics cookies each carry their own version clock;
  // a value valid under one must not leak through the other's default.
  it("validates against the caller's policy version, not a global one", () => {
    const bumped = CONSENT_POLICY_VERSION + 1;
    const stored = value(bumped, "granted", now());
    expect(parseConsent(stored, bumped)).toBe("granted");
    expect(parseConsent(stored)).toBe("unknown");
  });

  it("accepts the analytics cookie under the analytics policy version", () => {
    const stored = value(ANALYTICS_CONSENT_POLICY_VERSION, "granted", now());
    expect(parseConsent(stored, ANALYTICS_CONSENT_POLICY_VERSION)).toBe("granted");
  });

  it("expires a choice older than six months", () => {
    const old = now() - 181 * 24 * 60 * 60;
    expect(parseConsent(value(CONSENT_POLICY_VERSION, "granted", old))).toBe("unknown");
  });

  it("tolerates a day of clock skew but rejects a far-future stamp", () => {
    expect(parseConsent(value(CONSENT_POLICY_VERSION, "granted", now() + 60 * 60))).toBe("granted");
    expect(parseConsent(value(CONSENT_POLICY_VERSION, "granted", now() + 2 * 24 * 60 * 60))).toBe("unknown");
  });

  it("rejects a non-numeric or non-positive stamp", () => {
    expect(parseConsent(value(CONSENT_POLICY_VERSION, "granted", 0))).toBe("unknown");
    expect(parseConsent(`${CONSENT_POLICY_VERSION}.granted.soon`)).toBe("unknown");
  });
});
