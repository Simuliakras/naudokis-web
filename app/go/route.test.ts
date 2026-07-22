import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLAY_STORE_URL, APP_STORE_URL } from "@/app/lib/contact";
import { CONSENT_COOKIE, CONSENT_POLICY_VERSION } from "@/app/lib/consent";

// `after()` needs an active request store, and trackServerEvent would fire real
// network calls. Both are side effects of the route, not the behaviour under test —
// the question here is only "where does /go send you, and what rides along".
const tracked: { event: string; payload: Record<string, unknown> }[] = [];

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return { ...actual, after: (callback: () => void) => callback() };
});

vi.mock("@/app/lib/server-analytics", () => ({
  trackServerEvent: (_request: unknown, event: string, payload: Record<string, unknown>) => {
    tracked.push({ event, payload });
  },
}));

// Both are read at module scope by onelink.ts / handoff-token.ts, so they must be
// in place before those modules are first imported.
process.env.NEXT_PUBLIC_ONELINK_URL = "https://link.naudokis.lt/LNBm";
process.env.HANDOFF_SIGNING_SECRET = "test-secret-at-least-32-characters-long";

const { NextRequest } = await import("next/server");
const { GET } = await import("./route");

const UA = {
  android: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1",
  desktop: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
};

// Cookie value is "<version>.<choice>.<unixSeconds>" and is age-checked, so it has
// to be minted fresh rather than pasted as a literal.
const consentCookie = (choice: "granted" | "denied") =>
  `${CONSENT_COOKIE}=${CONSENT_POLICY_VERSION}.${choice}.${Math.floor(Date.now() / 1000)}`;

function go({ target, ua = UA.android, consent, params }: {
  target?: string;
  ua?: string;
  consent?: "granted" | "denied";
  params?: Record<string, string>;
}) {
  const url = new URL("https://www.naudokis.lt/go");
  if (target) {
    url.searchParams.set("target", target);
  }
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }
  const headers = new Headers({ "user-agent": ua });
  if (consent) {
    headers.set("cookie", consentCookie(consent));
  }
  return GET(new NextRequest(url, { headers }));
}

const locationOf = (response: Response) => response.headers.get("location") ?? "";
const lastPayload = () => tracked[tracked.length - 1]?.payload ?? {};

beforeEach(() => {
  tracked.length = 0;
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("/go OS routing", () => {
  it("sends Android to Play, iOS to the App Store, desktop to the marketing home", () => {
    expect(locationOf(go({ ua: UA.android }))).toContain("play.google.com");
    expect(locationOf(go({ ua: UA.ios }))).toBe(APP_STORE_URL);
    expect(locationOf(go({ ua: UA.desktop }))).toBe("https://www.naudokis.lt/");
  });

  it("never caches — the response depends on UA and cookie", async () => {
    const mod = await import("./route");
    expect(mod.dynamic).toBe("force-dynamic");
  });
});

describe("Play install referrer on the declined path", () => {
  // The declined path is the one most visitors take, so it is the one that matters:
  // Android still resumes at the listing because the referrer is first-party.
  it("attaches the listing target to the Play URL without consent", () => {
    const location = locationOf(go({ target: "/listing/abc123", ua: UA.android }));
    expect(location).toContain("referrer=");
    expect(decodeURIComponent(location)).toContain("deep_link_value=listing");
    expect(decodeURIComponent(location)).toContain("deep_link_sub1=abc123");
  });

  it("carries only the navigational target, never campaign data", () => {
    const url = new URL("https://www.naudokis.lt/go");
    url.searchParams.set("target", "/listing/abc123");
    url.searchParams.set("af_c_id", "spring-sale");
    url.searchParams.set("utm_source", "newsletter");
    const response = GET(new NextRequest(url, { headers: new Headers({ "user-agent": UA.android }) }));
    const location = decodeURIComponent(locationOf(response));
    expect(location).toContain("deep_link_sub1=abc123");
    expect(location).not.toContain("spring-sale");
    expect(location).not.toContain("newsletter");
  });

  it("leaves iOS on a bare store URL — it has no referrer equivalent", () => {
    expect(locationOf(go({ target: "/listing/abc123", ua: UA.ios }))).toBe(APP_STORE_URL);
  });
});

describe("target validation", () => {
  it("ignores non-listing paths that carry transactional ids", () => {
    for (const target of ["/booking/9", "/chat/9", "/review/9", "/account", "/rewards"]) {
      expect(locationOf(go({ target, ua: UA.android }))).toBe(PLAY_STORE_URL);
    }
  });

  it("ignores protocol-relative and absolute off-origin targets", () => {
    for (const target of ["//evil.example/listing/x", "https://evil.example/listing/x"]) {
      expect(locationOf(go({ target, ua: UA.android }))).toBe(PLAY_STORE_URL);
    }
  });

  // A bare /listing used to pass the regex: it minted a handoff token and set
  // deep_link_sub10, but with no id there is no deep_link_value, and the app
  // early-returns when that is absent — so the token was attached then ignored.
  // Observable only on the CONSENTED path: on the declined path a bare /listing
  // produces the plain Play URL either way, so asserting there proves nothing.
  // With consent, the old regex emitted af_dp=naudokis://listing — a deep link to a
  // screen the app cannot populate — plus a handoff token, while never setting the
  // deep_link_value the app actually reads.
  it("rejects a bare /listing with no id", () => {
    for (const target of ["/listing", "/listing/"]) {
      const location = decodeURIComponent(locationOf(go({ target, consent: "granted" })));
      expect(location).toContain("link.naudokis.lt");
      expect(location).not.toContain("af_dp");
      expect(location).not.toContain("af_web_dp");
    }
    expect(lastPayload().contextPreserved).toBe(false);
  });
});

describe("consented OneLink path", () => {
  it("emits the UDL pair alongside the deep link for a real listing", () => {
    const location = decodeURIComponent(locationOf(go({ target: "/listing/abc123", consent: "granted" })));
    expect(location).toContain("af_dp=naudokis://listing/abc123");
    expect(location).toContain("deep_link_value=listing");
    expect(location).toContain("deep_link_sub1=abc123");
    expect(lastPayload()).toMatchObject({ outcome: "onelink", contextPreserved: true });
  });

  // /go validates ?target but does NOT validate deep_link_value, which
  // GO_ATTRIBUTION_KEYS forwards straight off the query string. The builder assigns
  // the validated pair last precisely so a smuggled value cannot win.
  it("lets a server-validated target override a smuggled deep_link_value", () => {
    const location = decodeURIComponent(
      locationOf(go({
        target: "/listing/abc123",
        consent: "granted",
        params: { deep_link_value: "REFERRALX", deep_link_sub1: "evil" },
      })),
    );
    expect(location).toContain("deep_link_value=listing");
    expect(location).toContain("deep_link_sub1=abc123");
    expect(location).not.toContain("REFERRALX");
    expect(location).not.toContain("evil");
  });

  it("declining consent never reaches AppsFlyer", () => {
    const location = locationOf(go({ target: "/listing/abc123", consent: "denied" }));
    expect(location).not.toContain("link.naudokis.lt");
    expect(location).toContain("play.google.com");
  });
});

describe("contextPreserved", () => {
  // This metric came apart from "AppsFlyer fired" when the Play referrer landed.
  // It now means "the target actually rode along", by either route.
  it("is true for an Android referrer even though no OneLink was built", () => {
    go({ target: "/listing/abc123", ua: UA.android });
    expect(lastPayload()).toMatchObject({ outcome: "play_store", contextPreserved: true });
  });

  it("is false when there is no target at all", () => {
    go({ ua: UA.android });
    expect(lastPayload().contextPreserved).toBe(false);
  });

  it("is false on iOS, where the target cannot travel", () => {
    go({ target: "/listing/abc123", ua: UA.ios });
    expect(lastPayload()).toMatchObject({ outcome: "app_store", contextPreserved: false });
  });
});

describe("consent", () => {
  it("records the consent state so the funnel stays readable", () => {
    go({ ua: UA.android });
    expect(lastPayload().consent).toBeDefined();
  });

  // Fails closed: OneLink is fully configured in this suite, so reaching the store
  // instead is the consent gate working, not a missing env var.
  it("stays off AppsFlyer with no cookie at all", () => {
    go({ target: "/listing/abc123", ua: UA.android });
    expect(lastPayload().outcome).toBe("play_store");
  });

  it("treats a malformed or stale cookie as unknown, not granted", () => {
    const stale = `${CONSENT_COOKIE}=${CONSENT_POLICY_VERSION}.granted.1`;
    const url = new URL("https://www.naudokis.lt/go?target=/listing/abc123");
    const response = GET(new NextRequest(url, {
      headers: new Headers({ "user-agent": UA.android, cookie: stale }),
    }));
    expect(locationOf(response)).not.toContain("link.naudokis.lt");
    expect(lastPayload().consent).toBe("unknown");
  });
});
