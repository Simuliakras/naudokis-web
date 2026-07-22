// Vitest stand-in for the `server-only` package, which throws on import outside a
// React Server Component. Aliased in vitest.config.ts so server modules (onelink.ts,
// handoff-token.ts, …) can be unit-tested. Empty on purpose: the real package's only
// job is to fail the build, and the build still enforces that.
export {};
