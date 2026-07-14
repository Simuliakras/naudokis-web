# naudokis.lt

The public marketing site for **Naudokis** — a peer-to-peer item-rental app in Lithuania.
Browsing and search run on live backend data; transactional actions (reserve, favourite,
contact) are deliberately locked and open an app-install bridge instead.

Bilingual: Lithuanian is the default and is served unprefixed at `/`; English lives at `/en`.

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind 4 + the `--nk-*` design
tokens in `app/globals.css` · TanStack Query. See `CLAUDE.md` for the architecture and
conventions, and `AGENTS.md` before writing any Next.js code — this version has breaking
changes from older ones.

## Getting started

```bash
yarn dev         # dev server on http://localhost:3000
yarn build       # production build
yarn start       # serve the production build
yarn lint
yarn type-check
```

The site reads the production catalogue by default. Point it at dev from `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api-dev.naudokis.lt
```

## Release verification

Build and start the new site **with its production environment**, then audit that server
(never the legacy `www.naudokis.lt` deployment) before promoting it:

```bash
yarn build
yarn start
RELEASE_ORIGIN=https://new-site-preview.example \
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=naudokis.lt \
NEXT_PUBLIC_SENTRY_DSN=https://… \
yarn verify:release
```

The gate rejects a dev catalogue, missing RUM / error-monitoring configuration, bad
canonical or indexing output, missing listing sitemaps, and an unavailable Web Vitals
endpoint.

`NEXT_PUBLIC_*` values are inlined at **build** time, so run this with the same environment
the build used — otherwise the env checks pass while the served bundle still points
somewhere else. The robots/sitemap assertions inspect the actual response and will catch a
dev-API build regardless.

## Testing

```bash
yarn test:e2e          # Playwright — production-readiness + responsive sweeps
yarn verify:app-links  # App Links / Universal Links association files
```

Run Playwright against a production build (`yarn start`), not `next dev`, and never rebuild
while a server is live — it swaps the chunks out from under the running app.
