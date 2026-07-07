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
  ],
  webServer: {
    command: "node ./node_modules/next/dist/bin/next dev -p 3000 -H 127.0.0.1",
    url: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
