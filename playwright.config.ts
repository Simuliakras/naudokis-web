import { defineConfig, devices } from "@playwright/test";

// Smoke suite for the critical bridge-site flows. Runs against `next dev` with
// the mock data layer (NEXT_PUBLIC_USE_MOCK) so CI never depends on the live
// backend; the mock gate is dev-only, which is exactly what we want here.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "yarn dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { NEXT_PUBLIC_USE_MOCK: "1" },
  },
});
