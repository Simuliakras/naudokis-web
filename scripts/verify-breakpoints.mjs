#!/usr/bin/env node
// Enforces the responsive contract: app/lib/breakpoints.ts and the `@theme static`
// block in app/globals.css must agree, and no source file may re-spell a threshold
// as a literal instead of referencing the token.
//
// The literal `expected` table below is deliberately a THIRD copy (alongside the
// TS registry and the CSS theme). It is a tripwire: a table parsed from the file
// it is meant to police proves nothing. app/lib/breakpoints.test.ts holds a fourth
// for the same reason.
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const failures = [];
const expected = {
  xs: "22.5rem",
  sm: "35rem",
  md: "48rem",
  lg: "64rem",
  nav: "70rem",
  hero: "74.375rem",
  xl: "80rem",
};
// Layer sheets also swap on short viewports. This threshold used to be spelled
// three ways (32.5rem, min-height:521px, max-height:520px) — the last two disagree
// with the first at exactly 520px — so it is now checked like any other token.
const SHORT_LAYER_HEIGHT = "32.5rem";

const REM = 16;
const toPx = (value) => Number.parseFloat(value) * REM;
// Every spelling that means "the short-layer threshold". A height clause carrying
// one of these must use the canonical rem form.
const shortLayerAliases = new Set([`${toPx(SHORT_LAYER_HEIGHT)}px`, `${toPx(SHORT_LAYER_HEIGHT) + 1}px`, SHORT_LAYER_HEIGHT]);
// Reverse lookup: a raw length that happens to equal a tier must reference the token.
const tokenByLength = new Map();
for (const [name, value] of Object.entries(expected)) {
  tokenByLength.set(value, name);
  tokenByLength.set(`${toPx(value)}px`, name);
}

function fail(message) {
  failures.push(message);
}

async function filesUnder(directory, extensions) {
  const found = [];
  for (const entry of await readdir(path.join(rootDir, directory), { withFileTypes: true })) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await filesUnder(relative, extensions)));
    } else if (extensions.some((extension) => entry.name.endsWith(extension))) {
      found.push(relative);
    }
  }
  return found;
}

const cssFiles = await filesUnder("app", [".css"]);
const sourceFiles = await filesUnder("app", [".ts", ".tsx"]);

/* ---------------- 1. The two registries agree ---------------- */

const globals = await readFile(path.join(rootDir, "app/globals.css"), "utf8");
for (const [name, value] of Object.entries(expected)) {
  if (!globals.includes(`--breakpoint-${name}: ${value};`)) {
    fail(`globals.css is missing --breakpoint-${name}: ${value}`);
  }
}
for (const token of globals.matchAll(/--breakpoint-([a-z0-9-]+)\s*:/g)) {
  // Object.hasOwn, not `in`: `--breakpoint-constructor` would pass via the prototype.
  if (!Object.hasOwn(expected, token[1])) {
    fail(`globals.css contains undocumented breakpoint token --breakpoint-${token[1]}`);
  }
}

const ts = await readFile(path.join(rootDir, "app/lib/breakpoints.ts"), "utf8");
const escape = (value) => value.replaceAll(".", "\\.");
for (const [name, value] of Object.entries(expected)) {
  if (!new RegExp(`\\b${name}:\\s*["']${escape(value)}["']`).test(ts)) {
    fail(`breakpoints.ts is missing ${name}: ${value}`);
  }
}
if (!new RegExp(`SHORT_LAYER_HEIGHT\\s*=\\s*["']${escape(SHORT_LAYER_HEIGHT)}["']`).test(ts)) {
  fail(`breakpoints.ts is missing SHORT_LAYER_HEIGHT = ${SHORT_LAYER_HEIGHT}`);
}

/* ---------------- 2. The consumed layer is on the contract ----------------
   VIEWPORT_QUERIES and IMAGE_SIZES are what components actually import, so they
   need checking too — the tokens being right is no help if the queries built from
   them are not. */

const queryNames = new Set();
const viewportBlock = ts.match(/export const VIEWPORT_QUERIES = \{([\s\S]*?)\n\} as const;/);
if (!viewportBlock) {
  fail("breakpoints.ts: could not locate VIEWPORT_QUERIES");
} else {
  for (const entry of viewportBlock[1].matchAll(/^\s{2}([a-zA-Z]+):\s*`([^`]*)`/gm)) {
    queryNames.add(entry[1]);
    if (/(?:min|max)-(?:width|height)\s*:/.test(entry[2])) {
      fail(`VIEWPORT_QUERIES.${entry[1]} uses legacy syntax: ${entry[2]}`);
    }
    for (const length of entry[2].matchAll(/(\d+(?:\.\d+)?(?:px|rem))/g)) {
      if (tokenByLength.has(length[1]) || shortLayerAliases.has(length[1])) {
        fail(`VIEWPORT_QUERIES.${entry[1]} hardcodes ${length[1]} instead of referencing the token`);
      }
    }
  }
}

const sizesBlock = ts.match(/export const IMAGE_SIZES = \{([\s\S]*?)\n\} as const;/);
if (!sizesBlock) {
  fail("breakpoints.ts: could not locate IMAGE_SIZES");
} else if (/(?:min|max)-width\s*:/.test(sizesBlock[1])) {
  // `sizes` thresholds may be bespoke (they track slot changes, not tiers — see the
  // DETAIL_ONE_COLUMN note) but must still be range syntax.
  fail("IMAGE_SIZES uses legacy min/max-width syntax");
}

/* ---------------- 3. Stylesheets ---------------- */

// A container query's own thresholds are legitimately bespoke — a component asks
// about its own width, not the viewport's. Only flag a literal that exactly equals
// a viewport tier, which means the author meant the tier and spelled it by hand.
function checkParams(relative, line, kind, params) {
  const where = `${relative}:${line}`;
  if (/(?:min|max)-width\s*:/.test(params)) {
    fail(`${where} uses legacy min/max-width syntax: ${params}`);
  }
  for (const length of params.matchAll(/(?<![\w-])(\d+(?:\.\d+)?(?:px|rem))/g)) {
    const token = tokenByLength.get(length[1]);
    if (token) {
      fail(`${where} hardcodes ${length[1]} — use theme(--breakpoint-${token}): ${params}`);
    }
  }
  if (/height/.test(params)) {
    if (/(?:min|max)-height\s*:/.test(params)) {
      fail(`${where} uses legacy min/max-height syntax: ${params}`);
    }
    for (const length of params.matchAll(/(?<![\w-])(\d+(?:\.\d+)?(?:px|rem))/g)) {
      if (shortLayerAliases.has(length[1]) && length[1] !== SHORT_LAYER_HEIGHT) {
        fail(`${where} spells the short-layer height as ${length[1]} — use ${SHORT_LAYER_HEIGHT}: ${params}`);
      }
    }
  }
  // Viewport media queries must be on the ladder. Container queries need not be.
  if (kind === "media" && /width/.test(params) && !/theme\(--breakpoint-/.test(params)) {
    fail(`${where} does not use a breakpoint theme token: ${params}`);
  }
}

for (const relative of cssFiles) {
  const css = await readFile(path.join(rootDir, relative), "utf8");
  const ast = postcss.parse(css, { from: relative });
  for (const kind of ["media", "container"]) {
    ast.walkAtRules(kind, (rule) => {
      if (!/width|height/.test(rule.params)) {
        return;
      }
      checkParams(relative, rule.source.start.line, kind, rule.params);
    });
  }
}

/* ---------------- 4. TS/TSX ----------------
   These predicates used to be literal-only and one brace wide: `matchMedia(x)`,
   `media={expr}` and `sizes={expr}` all slipped past. They now match the call
   shape rather than the argument's quoting. */

for (const relative of sourceFiles) {
  const source = await readFile(path.join(rootDir, relative), "utf8");
  if (relative !== "app/lib/breakpoints.ts") {
    for (const call of source.matchAll(/matchMedia\(([^)]*)\)/g)) {
      const argument = call[1];
      const viaContract = /VIEWPORT_QUERIES|matchesViewport|observeViewport/.test(argument);
      if (!viaContract && /width|height|\bpx\b|rem/.test(argument)) {
        fail(`${relative} calls matchMedia with a raw query: ${argument.trim()}`);
      }
    }
    for (const attribute of source.matchAll(/\b(?:media|sizes)=(?:["'`]([^"'`]*)["'`]|\{([^}]*)\})/g)) {
      const value = attribute[1] ?? attribute[2] ?? "";
      const viaContract = /VIEWPORT_QUERIES|IMAGE_SIZES/.test(value);
      if (!viaContract && /(?:min-|max-)?(?:width|height)\s*[:<>]/.test(value)) {
        fail(`${relative} inlines a responsive media/sizes string: ${value.trim()}`);
      }
    }
  }
  for (const match of source.matchAll(/(?:closeAt|activeAt):\s*["'`]([^"'`]+)["'`]/g)) {
    if (!queryNames.has(match[1])) {
      fail(`${relative} passes unknown viewport query "${match[1]}"`);
    }
  }
}

/* ---------------- 5. Built output ----------------
   The weak link the old check could not see. legal.css uses theme(--breakpoint-*)
   but declares no @theme of its own and imports no Tailwind — it relies on
   globals.css's theme being in scope. If that scoping ever breaks, theme(
   --breakpoint-sm) silently resolves to Tailwind's OWN default of 40rem instead of
   our 35rem and emits a 640px breakpoint. `sm` is the only token where a custom and
   a default value both exist, so it is the only silent case — and it is the most
   used token in the codebase. Grepping for unresolved theme() calls would not catch
   a wrong-but-resolved value, so assert the resolved numbers directly. */

try {
  const builtCss = await filesUnder(".next/static", [".css"]);
  const seen = new Set();
  for (const relative of builtCss) {
    const output = await readFile(path.join(rootDir, relative), "utf8");
    if (/theme\(--breakpoint-/.test(output)) {
      fail(`${relative} contains an unresolved breakpoint theme() call`);
    }
    // @media only: every viewport width comes from a token and none is 40rem, so a
    // 40rem media query can only be the fallback. @container widths are legitimately
    // bespoke (nk-not-found and nk-directory-grid both genuinely want 40rem), so
    // including them here would be a false positive.
    for (const query of output.matchAll(/@media[^{]*/g)) {
      if (/(?:min-width|max-width|\bwidth\s*[<>]=?)\s*:?\s*40rem\b/.test(query[0])) {
        fail(`${relative} emits a 40rem width media query — theme(--breakpoint-sm) fell back to Tailwind's default: ${query[0].trim()}`);
      }
      for (const [value] of query[0].matchAll(/\d+(?:\.\d+)?rem/g)) {
        seen.add(value);
      }
    }
  }
  if (builtCss.length && !seen.has(expected.sm)) {
    fail(`built CSS emits no ${expected.sm} width query — --breakpoint-sm may not be resolving from globals.css`);
  }
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

if (failures.length) {
  console.error(`Breakpoint verification failed (${failures.length}):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Breakpoint verification passed");
