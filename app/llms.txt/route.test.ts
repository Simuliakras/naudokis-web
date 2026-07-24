import { describe, expect, it } from "vitest";
import { GET } from "./route";

// The file's failure mode is a silent one: a route rename would leave it
// linking 404s and nothing on the site would notice. The links go through
// localePath, so asserting on the resolved URLs makes a rename break here.
describe("llms.txt", () => {
  it("serves markdown with localized links resolved through localePath", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");

    const body = await res.text();
    expect(body.startsWith("# Naudokis")).toBe(true);
    // LT canonical (unprefixed) and EN (translated slug, not /en/skelbimai).
    expect(body).toContain("https://www.naudokis.lt/skelbimai");
    expect(body).toContain("https://www.naudokis.lt/en/listings");
    expect(body).not.toContain("/en/skelbimai");
  });
});
