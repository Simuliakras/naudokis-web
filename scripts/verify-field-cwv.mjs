#!/usr/bin/env node

// Release evidence for the Core Web Vitals claim. This queries the Chrome UX
// Report's rolling 28-day PHONE dataset — real visits, not a Lighthouse simulation —
// and fails unless origin-level p75 LCP is at or below Google's 2.5 s "good" bar.
//
// A new or low-traffic origin can legitimately have no CrUX record. That is not a
// pass: the release claim says "proven", so missing field evidence must fail loudly.
//
// Deliberately NOT part of `yarn verify:release`: it needs network access and an API
// key, and it reports on what is already deployed rather than on the build at hand.
// Run it as its own step when making a performance claim.

const origin = process.env.CWV_ORIGIN ?? "https://www.naudokis.lt";
const apiKey = process.env.CRUX_API_KEY;
const maxLcpMs = 2_500;
const budget = `${(maxLcpMs / 1_000).toFixed(3)}s`;

if (!apiKey) {
  console.error("field CWV verification failed: CRUX_API_KEY is required");
  process.exit(1);
}

let normalizedOrigin;
try {
  normalizedOrigin = new URL(origin).origin;
} catch {
  console.error(`field CWV verification failed: invalid CWV_ORIGIN (${origin})`);
  process.exit(1);
}

const endpoint = new URL("https://chromeuxreport.googleapis.com/v1/records:queryRecord");
endpoint.searchParams.set("key", apiKey);

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    origin: normalizedOrigin,
    formFactor: "PHONE",
    metrics: ["largest_contentful_paint"],
  }),
  signal: AbortSignal.timeout(15_000),
});

const payload = await response.json().catch(() => null);
if (!response.ok) {
  const reason = payload?.error?.message ?? `HTTP ${response.status}`;
  console.error(`field CWV verification failed: CrUX query failed (${reason})`);
  process.exit(1);
}

const p75 = payload?.record?.metrics?.largest_contentful_paint?.percentiles?.p75;
if (!Number.isFinite(p75)) {
  console.error(`field CWV verification failed: no PHONE LCP field data for ${normalizedOrigin}`);
  process.exit(1);
}

const seconds = `${(p75 / 1_000).toFixed(3)}s`;
if (p75 > maxLcpMs) {
  console.error(`field CWV verification failed: PHONE p75 LCP is ${seconds} (budget: ${budget})`);
  process.exit(1);
}

console.log(`field CWV verified: ${normalizedOrigin} PHONE p75 LCP ${seconds} <= ${budget}`);
