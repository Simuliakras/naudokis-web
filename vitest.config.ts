import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for the pure lib modules (price-range math, etc.). Scoped to *.test.ts
// under app/ so it never collides with the Playwright specs in e2e/ (*.spec.ts).
// `@` mirrors the tsconfig path alias (repo root) so source imports resolve unchanged.
const root = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");

export default defineConfig({
  test: {
    include: ["app/**/*.test.{ts,tsx}"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": root,
      // `server-only` throws on import outside a React Server Component. That guard
      // is a build-time boundary, not a runtime one, so under Vitest it only blocks
      // server modules from being unit-tested at all — stub it out.
      "server-only": fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)),
    },
  },
});
