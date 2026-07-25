import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // The consent e2e project builds here (NEXT_DIST_DIR — see playwright.config.ts).
    // Not covered by the default ".next/**", so without this line every generated
    // chunk in it is linted as source: ~40 errors and 259 warnings from Turbopack's
    // own output the moment that project has been run.
    ".next-consent/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
