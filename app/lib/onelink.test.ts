import { beforeAll, describe, expect, it, vi } from "vitest";

// The UDL contract the app team confirmed on 2026-07-21 (see the header in
// onelink.ts). Every failure mode here is SILENT in production — a wrong
// `deep_link_value` is read as a referral code and dropped with no error anywhere,
// on either side — so these assertions are the only thing standing between a typo
// and an install funnel that quietly stops resuming at the listing.
const TEMPLATE = "https://link.naudokis.lt/LNBm";
const LISTING = "/listing/abc123";

// onelink.ts snapshots NEXT_PUBLIC_ONELINK_URL at module scope, so the env has to be
// set before the module is first evaluated — hence the dynamic import.
let buildGenericInstallLink: typeof import("./onelink").buildGenericInstallLink;

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_ONELINK_URL", TEMPLATE);
  ({ buildGenericInstallLink } = await import("./onelink"));
});

const params = (link: string | null) => {
  expect(link).not.toBeNull();
  return new URL(link ?? "").searchParams;
};

describe("listing deep links", () => {
  it("sends the UDL keyword and the id in sub1", () => {
    const query = params(buildGenericInstallLink({}, LISTING));
    expect(query.get("deep_link_value")).toBe("listing");
    expect(query.get("deep_link_sub1")).toBe("abc123");
  });

  // The app reads neither, but other clients might, and dropping them was never
  // part of the change.
  it("keeps af_dp and af_web_dp", () => {
    const query = params(buildGenericInstallLink({}, LISTING));
    expect(query.get("af_dp")).toBe("naudokis://listing/abc123");
    expect(query.get("af_web_dp")).toBe("https://www.naudokis.lt/listing/abc123");
  });

  // Dates ride the path (APP_READS_DEEPLINK_DATES, currently off). If that flag is
  // ever flipped, the query must not end up inside the id.
  it("strips a date query off the id", () => {
    const query = params(buildGenericInstallLink({}, `${LISTING}?start_date=2026-07-18&end_date=2026-07-21`));
    expect(query.get("deep_link_sub1")).toBe("abc123");
    expect(query.get("deep_link_value")).toBe("listing");
  });

  // A keyword with no id routes the app to a screen it cannot populate — worse than
  // landing on home, because it looks like it worked.
  it("emits neither key when the path carries no id", () => {
    const query = params(buildGenericInstallLink({}, "/listing"));
    expect(query.has("deep_link_value")).toBe(false);
    expect(query.has("deep_link_sub1")).toBe(false);
  });

  // /go validates ?target; it does not validate ?deep_link_value. The validated one
  // has to win, or a crafted URL could point the keyword at the referral branch.
  it("lets the validated target beat a query-smuggled deep_link_value", () => {
    const query = params(buildGenericInstallLink({ deep_link_value: "SMUGGLED" }, LISTING));
    expect(query.get("deep_link_value")).toBe("listing");
    expect(query.get("deep_link_sub1")).toBe("abc123");
  });
});

describe("referral links", () => {
  // The regression that would hurt most: `invite` is NOT a reserved keyword, so the
  // code must arrive bare. Wrapping it in a keyword sends it to a route that does
  // not exist instead of the referral branch.
  it("passes the bare code through with no keyword", () => {
    const query = params(buildGenericInstallLink({ deep_link_value: "AB12CD34", pid: "web_invite", c: "invite" }));
    expect(query.get("deep_link_value")).toBe("AB12CD34");
    expect(query.get("deep_link_sub1")).toBeNull();
    expect(query.get("pid")).toBe("web_invite");
    expect(query.get("c")).toBe("invite");
  });

  it("never attaches a listing keyword when there is no target", () => {
    const query = params(buildGenericInstallLink({ utm_source: "newsletter" }));
    expect(query.has("deep_link_value")).toBe(false);
    expect(query.get("pid")).toBe("newsletter");
    expect(query.get("c")).toBe("install");
  });
});

describe("configuration", () => {
  it("returns null when no template is configured, so /go falls back to the store", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_ONELINK_URL", "");
    const unconfigured = await import("./onelink");
    expect(unconfigured.buildGenericInstallLink({}, LISTING)).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_ONELINK_URL", TEMPLATE);
  });
});
