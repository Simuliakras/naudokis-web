import { defineConfig, devices } from "@playwright/test";

// The analytics consent surfaces only exist when NEXT_PUBLIC_GA_ID is set, and that
// is inlined at COMPILE time — so they cannot be tested on the default server, which
// is deliberately compiled without one (GA on everywhere would put a bottom-fixed
// banner into every other spec's way). Hence a second dev server, with its own
// NEXT_DIST_DIR so the two do not fight over .next. `reuseExistingServer` is off for
// this one on purpose: reusing a server started without the id looks exactly like
// the banner regressing.
const CONSENT_PORT = 3002;
const CONSENT_URL = `http://localhost:${CONSENT_PORT}`;
const CONSENT_GA_ID = "G-E2ETESTID0";

// Responsive/screenshot sweep for the bridge-site surfaces. Runs against
// `next dev`, which server-renders live backend data (api.naudokis.lt), so the
// runner needs network egress to the API for the feed/home captures.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    // The consent spec has its own server (see below); everything else runs
    // against the GA-less default one, where <ConsentBanner/> renders nothing.
    { name: "chromium", testIgnore: /consent-analytics\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    {
      name: "consent",
      testMatch: /consent-analytics\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: CONSENT_URL },
    },
    { name: "firefox-responsive", testMatch: /breakpoint-contracts\.spec\.ts/, use: { ...devices["Desktop Firefox"] } },
    // WEBKIT ONLY RUNS AGAINST `next dev` (the webServer below), never against a
    // plain-HTTP `next start`. The production CSP includes upgrade-insecure-requests
    // (next.config.ts drops it when isDev). WebKit applies that to localhost, so
    // every chunk, stylesheet and font is force-upgraded to https://127.0.0.1:<port>
    // and dies with "A TLS error caused the secure connection to fail" — the page
    // never hydrates and every test times out waiting on __nkNavReady. Chromium
    // exempts localhost from the upgrade, which is why it alone appears to work.
    // Point PLAYWRIGHT_BASE_URL at a `next start` and you will see six webkit
    // failures that are entirely an artifact of the transport.
    { name: "webkit-responsive", testMatch: /breakpoint-contracts\.spec\.ts/, use: { ...devices["Desktop Safari"] } },
  ],
  webServer: [
    {
      command: "node ./node_modules/next/dist/bin/next dev -p 3000 -H 127.0.0.1",
      url: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `node ./node_modules/next/dist/bin/next dev -p ${CONSENT_PORT} -H 127.0.0.1`,
      url: CONSENT_URL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: { NEXT_PUBLIC_GA_ID: CONSENT_GA_ID, NEXT_DIST_DIR: ".next-consent" },
    },
  ],
});
