@AGENTS.md

# CLAUDE.md

This document gives Claude (AI assistant) context and guidelines for working in this codebase.

> ⚠️ See `AGENTS.md`: this is Next.js 16, which has breaking changes from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code.

## Project Overview

**naudokis.lt** is the marketing site for **Naudokis** — a peer-to-peer item-rental app in Lithuania, where people rent tools, vehicles, electronics, sports and leisure gear from trusted neighbours. This repository is the public multi-page "bridge" site (home, listings feed + detail, categories, how-it-works, legal/policy center) that drives App Store / Google Play installs of the mobile app; it is **not** the rental platform itself. Browsing and search are real (live backend data), but transactional actions (reserve / favorite / contact) are **Locked** — they open an app-redirect modal ("Rezervuoti programėlėje", store badges, install QR code).

The site is **bilingual (Lithuanian + English)** with no external i18n library — there's a small hand-rolled system: a typed dictionary per locale and locale-aware routing. Lithuanian is the default, served unprefixed at `/`; English lives at `/en`. See **Internationalization** below. (Historically the site was Lithuanian-only with inline copy; that is no longer the case — all user-facing strings now live in the dictionaries.)

### Key Technologies

- **Framework**: Next.js 16.2.7 (App Router)
- **Runtime**: React 19.2.4
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/postcss`) **plus a custom `--nk-*` design-token system** in `app/globals.css` (see Styling below)
- **Fonts**: `Archivo` (display) and `Sora` (body) loaded via `next/font/google` in `app/[lang]/layout.tsx`
- **Icons**: [`lucide-react`](https://lucide.dev) via a thin `Icon` wrapper in `app/components/visual.tsx`; a few inline-SVG glyphs (brand marks + the solid Play triangle) stay hand-rolled
- **Data fetching**: [TanStack Query](https://tanstack.com/query) (`@tanstack/react-query`) against the Naudokis backend REST API (see **Data fetching** below)
- **i18n**: hand-rolled typed dictionaries + `proxy.ts` locale routing — no i18n library (see **Internationalization** below)
- **Code Quality**: ESLint 9 (`eslint-config-next`), TypeScript strict

The runtime dependency surface is deliberately tiny: `package.json` lists only `next`, `react`, `react-dom`, **`@tanstack/react-query`**, **`@sentry/nextjs`** (observability; inert without a DSN) and **`lucide-react`** (icons). Do not reach for next-intl, i18next, aws-amplify, react-icons, an image optimizer, axios, or similar without discussing it first.

### Scripts

```bash
yarn dev      # next dev — local dev server at http://localhost:3000
yarn build    # next build
yarn start    # next start — serve a production build
yarn lint     # eslint
```

There is no separate type-check script; `tsc` runs with `noEmit: true` and types are validated during `next build`. `next.config.ts` sets security headers, image config (`formats`, per-host CloudFront `remotePatterns`) and wraps the config in `withSentryConfig` — read it before assuming defaults. `typedRoutes` is deliberately off (public URLs are the proxy-rewritten unprefixed forms, which don't exist in the typed `/[lang]/...` route tree).

## Project Structure

The app lives at the repo root in `app/` — there is **no `src/` directory**. Components are grouped into a few files by kind (a small "UI kit"), not one-file-per-component.

```
proxy.ts                    # Next.js 16 middleware ("proxy"): locale routing (/ → lt, /en → en)
instrumentation*.ts         # Sentry per-runtime init (inert without a DSN)
app/
├── [lang]/                 # Locale segment ("lt" | "en")
│   ├── layout.tsx          # Root layout: fonts, <html lang={lang}>, generateMetadata + generateStaticParams,
│   │                       #   viewport, Plausible script, wraps children in <Providers> then <I18nProvider>
│   ├── page.tsx            # Home: server-prefetches listings/categories into a HydrationBoundary,
│   │                       #   emits JSON-LD, composes the sections (ISR, revalidate 300)
│   ├── error.tsx / not-found.tsx   # Localized route-level boundaries (→ StatusScreen)
│   ├── opengraph-image.tsx # 1200×630 OG card
│   ├── kaip-tai-veikia/    # How-it-works page
│   ├── kategorijos/        # All-categories page
│   ├── skelbimai/          # Listings feed (+ [id]/ detail with own metadata, JSON-LD, ISR)
│   ├── teisine/            # Policy center hub + [slug] docs (data in lib/legal/data/)
│   └── naudojimo-taisykles/, privatumo-politika/  # Legal pages
├── global-error.tsx        # Last-resort boundary (own <html>/<body>, bilingual fallback)
├── manifest.ts / robots.ts / sitemap.ts   # PWA manifest + SEO metadata routes
├── providers.tsx           # "use client" QueryClientProvider (TanStack Query)
├── globals.css             # Design tokens (--nk-*) + nk- component classes
├── components/
│   ├── I18nProvider.tsx    # "use client" locale context + useI18n() / useI18nOptional()
│   ├── sections.tsx        # "use client" interactive sections: Nav (+ search/locale pickers),
│   │                       #   SearchBar, Categories, Offers, Faq
│   ├── sections-home.tsx   # Shared (no directive) presentational sections: Hero, Features,
│   │                       #   Testimonials, CtaBanner, HomeSeo, Footer — take a `locale` prop
│   │                       #   and call getDictionary() so the home page renders them server-side
│   ├── ScrollReveal.tsx    # Client leaf mounting the .nk-reveal IntersectionObserver
│   ├── cards.tsx           # Cards: OfferCard, CategoryTile/Card, FeatureCard, Testimonial,
│   │                       #   FaqRow, skeletons, EmptyState/SectionEmpty, InterruptionBanner
│   ├── ui.tsx              # Primitives: Icon (re-exported from visual.tsx, lucide-react), Logo, buttons, SectionHead, Breadcrumb,
│   │                       #   FilterSelect, StoreBadge, AppBadges, QR, openRedirect()
│   ├── FeedScreen.tsx / CategoriesScreen.tsx / HowItWorksScreen.tsx   # Page orchestrators
│   ├── ListingScreen.tsx / ListingDetail.tsx   # Detail orchestrator + presentational pieces
│   ├── Chrome.tsx          # Page shell: children + AppRedirect modal
│   ├── StatusScreen.tsx    # Shared error/404 screen (Nav + Footer chrome)
│   ├── AppRedirect.tsx     # "Locked-mode" app-install bridge modal (real QR + store links)
│   └── legal/              # Policy-center components
└── lib/
    ├── api.ts              # API_BASE (defaults to prod) + USE_MOCK gate
    ├── query.ts            # Shared TanStack Query config + makeQueryClient() (Sentry onError)
    ├── categories.ts / listings.ts   # Data layer: fetchers + useCategories/useListings/useListing
    ├── seo.ts              # pageMetadata helper + JSON-LD builders
    ├── search.ts / cities.ts / contact.ts      # Feed URL helper, city list, contact constants
    ├── mock.ts / mock-data.ts                  # Mock layer (non-production only)
    ├── use-debounced-value.ts / use-scroll-reveal.ts / use-online-status.ts
    ├── legal/              # Legal-doc manifest, loader, types + data/ JSON
    └── i18n/
        ├── config.ts       # locales ["lt","en"], defaultLocale "lt", isLocale(), path helpers
        ├── types.ts        # the `Dict` translation contract (both locales must satisfy it)
        ├── lt.ts / en.ts   # the two dictionaries
        └── dictionaries.ts # getDictionary(locale)

public/
└── naudokis/               # Brand imagery (logos, hero phone/pattern, store badges,
                            #   payment marks, PWA icons) referenced by absolute /naudokis/... paths
```

- **Path alias**: `@/*` maps to `./*` (the repo root), not `src/*`.
- **Client/server split**: pages under `app/[lang]/` are server components that prefetch data and emit metadata/JSON-LD; the interactive UI lives in `"use client"` screen orchestrators (`FeedScreen`, `ListingScreen`, …). The home page composes server-rendered presentational sections (`sections-home.tsx`, which take `locale` and resolve the dictionary themselves) with client sections (`sections.tsx`: Nav, Categories, Offers, Faq). Keep new presentational homepage sections in `sections-home.tsx` so they stay out of the client bundle; anything with hooks/handlers goes in `sections.tsx`. Never pass function props (or the `Dict`, which holds functions) from a server component to a client one.

## Styling

This is the biggest thing to get right.

The visual system is **not** built from Tailwind utility classes. It's a bespoke design-token system ported from the Figma bundle:

- **Design tokens** live in `:root` in `app/globals.css` as CSS custom properties prefixed `--nk-` — brand colors (`--nk-purple`, `--nk-yellow`, `--nk-green`), dark surfaces (`--nk-bg`, `--nk-surface`, glass values), text colors (`--nk-text`, `--nk-text-2`, `--nk-text-muted`), borders, radii (`--nk-r-card`, `--nk-r-pill`, …), elevation/blur, a spacing scale, and the font families (`--nk-font-display`, `--nk-font-body`).
- **Component classes** are prefixed `nk-` (e.g. `nk-btn`, `nk-offer`, `nk-faq`, `nk-container`, `nk-reveal`) and defined in `globals.css`.
- Components use a mix of these `nk-` classes and **inline `style={{ ... }}`** referencing the tokens via `var(--nk-…)`. Inline styles are normal and expected here — do not try to convert them to Tailwind utilities.

When adding or changing UI:

1. Reuse existing `--nk-*` tokens; add a new token to `:root` rather than hardcoding a one-off hex.
2. Match the existing pattern in the file you're editing (inline styles with `var(--nk-…)`, `nk-` classes for shared/animated behaviour).
3. The dark charcoal theme (`--nk-bg` / `--nk-surface`) is the primary identity; light tokens (`--nk-light-*`) exist for light surfaces.
4. Use the two font families consistently: `--nk-font-display` (Archivo) for headings/UI labels/buttons, `--nk-font-body` (Sora) for body/prices/meta.

### Icons & images

- **Icons**: use the `Icon` component (`<Icon name="Search" size={…} stroke={…} color="var(--nk-…)" />`) re-exported from `ui.tsx` and defined in `app/components/visual.tsx`. It's a thin wrapper over `lucide-react`: to add an icon, named-import it from `lucide-react` and add a `lucide(Name)` entry to the `ICONS` registry — the `IconName` type stays the source of truth. Brand marks (`Apple`/`Facebook`/`Instagram`/`Linkedin`) and the solid `Play` triangle are kept as inline-SVG `glyph({…})` entries because Lucide doesn't ship them (its `Apple` is a fruit). Color flows through `currentColor` via `style.color` — never pass a `--nk-*` token to Lucide's `color` prop (CSS vars don't resolve in SVG presentation attributes).
- **Images**: large brand imagery (hero/CTA phones) uses `next/image`; small static brand assets (logos, payment marks) are plain `<img>` with absolute `/naudokis/...` paths and an inline `@next/next/no-img-element` disable. Remote content images from the backend (listing photos, owner avatars) use `next/image` against the CloudFront hosts allowlisted in `next.config.ts` `remotePatterns`, with the inline `Icon name="Image"` placeholder on `nk-imgph` containers when no image is present.

## Internationalization (i18n)

Hand-rolled, no library. Two locales: `lt` (default) and `en`.

- **Routing** (`proxy.ts`, Next.js 16's renamed middleware): Lithuanian is canonical and **unprefixed** (`/`), English is at `/en`. The proxy rewrites unprefixed paths to the internal `/lt` segment, passes `/en` through, and redirects any explicit `/lt` URL back to the bare path. The matcher skips `_next` internals, `/naudokis` brand assets, and the unlocalized SEO routes (`sitemap.xml`, `robots.txt`).
- **Pages** live under `app/[lang]/`. The layout calls `generateStaticParams()` over `locales` (so both `/` and `/en` are statically generated), builds per-locale SEO via `generateMetadata` from the dictionary's `meta`, validates the segment with `isLocale` (else `notFound()`), and wraps children in `<Providers>` → `<I18nProvider locale={lang}>`.
- **Dictionaries** live in `app/lib/i18n/`. `types.ts` defines the `Dict` contract; **both `lt.ts` and `en.ts` must satisfy it**, so adding a key forces a translation in both locales (compile-time safety). Values can be functions (e.g. `emptySubtitle: (q) => …`, `reviewCount: (n) => …` with proper Lithuanian pluralization) — these run on the client, which is why `I18nProvider` derives the dict from `locale` rather than passing it across the server→client boundary.
- **Usage**: in any client component call `const { locale, dict } = useI18n()`. Never hardcode user-facing strings — add them to the `Dict` and read them from `dict`. Pass `locale` into data hooks that return localized content.

## Data fetching

The marketing site reads live data from the **Naudokis backend REST API** (separate repo, eu-north-1) via TanStack Query.

- **Provider**: `app/providers.tsx` (`"use client"`) creates the `QueryClient` once (in `useState`) and is mounted in `app/[lang]/layout.tsx`. The layout stays a server component.
- **Base URL**: a single source of truth in `app/lib/api.ts` (`API_BASE`), read from `process.env.NEXT_PUBLIC_API_BASE_URL` and **defaulting to prod `https://api.naudokis.lt`** so a misconfigured build never silently hits dev. Point at dev (`https://api-dev.naudokis.lt`) locally via `.env.local`.
- **Hooks** live in `app/lib/`, one file per domain, each owning its backend types, a fetcher, locale-aware formatting, and a `useQuery` hook:
  - `categories.ts` → `useCategories(locale)` — `GET /listings/categories` (top-level categories; filtered client-side).
  - `listings.ts` → `useListings(locale, q)` — `GET /listings?q=` (browse/search; `q` debounced via `use-debounced-value.ts`, `keepPreviousData` to avoid flicker) and `useListing(id, locale)` — `GET /listings/{id}` (detail; `enabled: !!id`).
- **Conventions**: keep `locale` in the `queryKey`; format prices (`*_cents` → `"15 €"` / `"€15"`) and ratings in the lib, not the component; surface `isLoading` → skeletons, `isError` → a localized `EmptyState` with a `refetch` retry, empty → empty state. No `any` — type the wire shape (the backend `RentalListing` has an open index signature, so model only the fields you read).
- The public read endpoints are unauthenticated. Full endpoint/shape notes live in the assistant memory file `backend-api`.

## Code Conventions

### TypeScript (critical)

- Strict mode is on; type safety is non-negotiable.
- ❌ No `any` — use `unknown` and narrow.
- ❌ Avoid `as` casts and `!` non-null assertions; fix the types upstream instead.
- ✅ Define interfaces/types for props and data structures (e.g. the `Offer` / `ListingDetail` view models in `app/lib/listings.ts`).
- ✅ Prefer inference where it's clear; be explicit where it improves readability.

### Components

- Functional components, `const`/`function` exports. Define a typed props object for every component (inline object types are used throughout the UI kit — match that style).
- Mark interactive components with `"use client"` at the top.
- Keep components small and composable; the `ui.tsx` → `cards.tsx` → `sections.tsx` layering (primitives → cards → sections) is the intended dependency direction.

### Function parameters

- Functions/components with more than 2 parameters take a single typed object parameter (the codebase uses destructured object props everywhere).

### Control flow

- **Always use curly braces for `if` statements** — no inline `if (x) return y;`. Ternaries are fine.
- Prefer early returns / guard clauses over `else` / `else if`; keep the main path at the lowest indentation.

### Comments

- Prefer self-explanatory code. The grouped UI-kit files use **short section-banner comments** (e.g. `/* ---------------- Buttons ---------------- */`) and a one-line file header to navigate the bundled components — keep that convention. Avoid JSDoc; let types document shape.

### Performance

- Memoize genuinely expensive components with `memo()` (prefix the export `Memoized…`); use `useMemo`/`useCallback` where it matters. Don't over-memoize trivial components.

### File naming

- Components / component-bundle files: PascalCase or the existing kebab/lowercase bundle names (`ui.tsx`, `cards.tsx`, `sections.tsx`, `sections-home.tsx`, `FeedScreen.tsx`, `ListingScreen.tsx`). Follow the existing names rather than introducing a new scheme.

## SEO & Metadata

Site-wide metadata lives in `app/[lang]/layout.tsx` via `generateMetadata`, built per-locale from the dictionary's `meta` (title, description, keywords, OG/Twitter cards, and `alternates.languages` hreflang for `lt`/`en`); per-page metadata uses the `pageMetadata` helper in `app/lib/seo.ts`, and the listing detail page builds its own from a raw backend fetch. `app/sitemap.ts`, `app/robots.ts` and `app/manifest.ts` (Next.js 16 metadata route conventions) emit `/sitemap.xml`, `/robots.txt` and `/manifest.webmanifest`, derived from `locales`/`defaultLocale` in `app/lib/i18n/config.ts` — keep them sourced from that config, not hardcoded, and note that the `proxy.ts` matcher must exclude these unlocalized root routes. Structured data: JSON-LD builders live in `app/lib/seo.ts` (Organization, WebSite, FAQ, Breadcrumb, Product) rendered via `<JsonLd>` — only emit fields that actually exist on the wire; never fabricate values. The OG card is generated by `app/[lang]/opengraph-image.tsx`. For further SEO work, use Next.js 16's built-in Metadata API and keep copy in the dictionaries — check `node_modules/next/dist/docs/` for the current API.

## Working in This Codebase

### Adding a section to the homepage

1. Presentational (no hooks/handlers)? Add it to `app/components/sections-home.tsx` with a `locale` prop (resolve copy via `getDictionary(locale)`) so it renders server-side. Interactive? Add it to `sections.tsx` (`"use client"`, copy via `useI18n()`). Cards go in `cards.tsx`, primitives in `ui.tsx` — follow the existing inline-style + `nk-` token pattern.
2. Wire it into the render order in `app/[lang]/page.tsx`.
3. Add any needed CSS classes/tokens to `app/globals.css`.
4. Add every user-facing string to the `Dict` contract (`app/lib/i18n/types.ts`) and both dictionaries (`lt.ts`, `en.ts`). Do not hardcode copy.
5. If the section shows backend data, add a hook under `app/lib/` (see **Data fetching**) rather than fetching inline, and prefetch it in `page.tsx` if it should be in the initial HTML.

### Adding a new page

1. Create `app/[lang]/<route>/page.tsx` — pages live **under the `[lang]` locale segment**, not at the app root.
2. Add metadata via the page's `generateMetadata` (pull copy from the dictionary, like the root layout).
3. Reuse the `nk-` design system and primitives from `ui.tsx`, and `useI18n()` for copy.

### Before writing Next.js code

Read the relevant guide under `node_modules/next/dist/docs/` — APIs in Next.js 16 may differ from older versions and from training data (see `AGENTS.md`).

## Best Practices

1. **Reuse the design system** — `--nk-*` tokens and `nk-` classes before any new styling.
2. **Type safety first** — no `any`, no unsafe casts.
3. **No new dependencies without discussion** — the dependency surface is deliberately tiny.
4. **Localize all copy** — no hardcoded user-facing strings; add them to the `Dict` and both dictionaries, read via `useI18n()`.
5. **Accessibility** — keep semantic HTML and ARIA where the existing components already use it (`aria-label`, `aria-pressed`, keyboard handlers on clickable non-buttons).
6. **Match local style** — when editing a file, mirror its existing conventions (inline styles, section banners, prop shapes).

## Troubleshooting

- **Build issues**: clear `.next/` if the build behaves unexpectedly.
- **Type errors**: run `yarn lint`; types are also checked during `yarn build`.
- **Styling looks off**: confirm you're using `--nk-*` tokens and `nk-` classes consistently and that any new token was added to `:root` in `globals.css`.

## Links & Resources

- Next.js docs (local, authoritative for this version): `node_modules/next/dist/docs/`
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Last Updated**: 2026-06-12
**Project Version**: 0.1.0
