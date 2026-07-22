import { defineConfig, devices } from "@playwright/test";

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
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
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
  webServer: {
    command: "node ./node_modules/next/dist/bin/next dev -p 3000 -H 127.0.0.1",
    url: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
