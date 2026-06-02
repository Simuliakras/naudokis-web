@AGENTS.md

# CLAUDE.md

This document gives Claude (AI assistant) context and guidelines for working in this codebase.

> ⚠️ See `AGENTS.md`: this is Next.js 16, which has breaking changes from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code.

## Project Overview

**naudokis.lt** is the marketing landing page for **Naudokis** — a peer-to-peer item-rental app in Lithuania, where people rent tools, vehicles, electronics, sports and leisure gear from trusted neighbours. This repository is the public single-page marketing site that drives App Store / Google Play installs of the mobile app; it is **not** the rental platform itself. Calls to action point into the app ("Rezervuoti programėlėje", store badges, install QR code).

The site is **bilingual (Lithuanian + English)** with no external i18n library — there's a small hand-rolled system: a typed dictionary per locale and locale-aware routing. Lithuanian is the default, served unprefixed at `/`; English lives at `/en`. See **Internationalization** below. (Historically the site was Lithuanian-only with inline copy; that is no longer the case — all user-facing strings now live in the dictionaries.)

### Key Technologies

- **Framework**: Next.js 16.2.7 (App Router)
- **Runtime**: React 19.2.4
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/postcss`) **plus a custom `--nk-*` design-token system** in `app/globals.css` (see Styling below)
- **Fonts**: `Archivo` (display) and `Sora` (body) loaded via `next/font/google` in `app/[lang]/layout.tsx`
- **Icons**: self-contained inline SVG icon set in `app/components/ui.tsx` — no icon library
- **Data fetching**: [TanStack Query](https://tanstack.com/query) (`@tanstack/react-query`) against the Naudokis backend REST API (see **Data fetching** below)
- **i18n**: hand-rolled typed dictionaries + `proxy.ts` locale routing — no i18n library (see **Internationalization** below)
- **Code Quality**: ESLint 9 (`eslint-config-next`), TypeScript strict

The runtime dependency surface is deliberately tiny: `package.json` lists only `next`, `react`, `react-dom`, and **`@tanstack/react-query`**. Do not reach for next-intl, i18next, aws-amplify, react-icons, an image optimizer, axios, or similar without discussing it first.

### Scripts

```bash
yarn dev      # next dev — local dev server at http://localhost:3000
yarn build    # next build
yarn start    # next start — serve a production build
yarn lint     # eslint
```

There is no separate type-check script; `tsc` runs with `noEmit: true` and types are validated during `next build`. `next.config.ts` is currently empty (no static export, no custom image config).

## Project Structure

The app lives at the repo root in `app/` — there is **no `src/` directory**. Components are grouped into a few files by kind (a small "UI kit"), not one-file-per-component.

```
proxy.ts                    # Next.js 16 middleware ("proxy"): locale routing (/ → lt, /en → en)
app/
├── [lang]/                 # Locale segment ("lt" | "en")
│   ├── layout.tsx          # Root layout: fonts, <html lang={lang}>, generateMetadata + generateStaticParams,
│   │                       #   wraps children in <Providers> then <I18nProvider>
│   └── page.tsx            # Renders <HomeApp />
├── providers.tsx           # "use client" QueryClientProvider (TanStack Query)
├── globals.css             # Design tokens (--nk-*) + nk- component classes
├── favicon.ico
├── components/
│   ├── HomeApp.tsx         # "use client" root: page state, scroll-reveal, nav scroll state
│   ├── I18nProvider.tsx    # "use client" locale context + useI18n() hook
│   ├── sections.tsx        # Page sections: Nav, Hero, Categories, Offers, Features,
│   │                       #   Testimonials, CtaBanner, Faq, Footer + the `Listing` type
│   ├── cards.tsx           # Cards: OfferCard, CategoryCard, FeatureCard, Testimonial,
│   │                       #   FaqRow, OfferCardSkeleton, EmptyState
│   ├── ui.tsx              # Primitives: Icon, Logo, Button, GhostButton, RoundArrow,
│   │                       #   LocationChip, Tag, SectionHead, Rating, Dots,
│   │                       #   StoreBadge, AppBadges, QR
│   └── ListingSheet.tsx    # Listing-detail bottom-sheet modal (fetches GET /listings/{id})
└── lib/
    ├── categories.ts       # useCategories() — GET /listings/categories
    ├── listings.ts         # useListings() / useListing() — GET /listings[/{id}]
    ├── use-debounced-value.ts  # debounce hook (search input)
    └── i18n/
        ├── config.ts       # locales ["lt","en"], defaultLocale "lt", isLocale()
        ├── types.ts        # the `Dict` translation contract (both locales must satisfy it)
        ├── lt.ts / en.ts   # the two dictionaries
        └── dictionaries.ts # getDictionary(locale)

public/
└── naudokis/               # Brand imagery (logos, hero phone/pattern, store badges,
                            #   payment marks) referenced by absolute /naudokis/... paths
```

- **Path alias**: `@/*` maps to `./*` (the repo root), not `src/*`.
- The whole homepage is a **client app** (`"use client"`) because of search state, the listing sheet, scroll-reveal, and nav scroll behaviour. `app/[lang]/layout.tsx` and `app/[lang]/page.tsx` are the server components of note — the layout sets up fonts/metadata/providers and the page simply renders `HomeApp`.

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

- **Icons**: use the `Icon` component and its `NK_ICONS` set in `ui.tsx`. To add an icon, add an entry to `NK_ICONS` (Lucide-style geometry) — do not add an icon dependency.
- **Images**: brand assets are served from `public/naudokis/` via plain `<img>` with absolute paths (`/naudokis/...`); the `@next/next/no-img-element` lint rule is disabled inline at those sites on purpose. Remote content images from the backend (listing photos, owner avatars) are rendered as CSS `background-image` on `nk-imgph` containers, with the inline `Icon name="Image"` placeholder shown when no image is present.

## Internationalization (i18n)

Hand-rolled, no library. Two locales: `lt` (default) and `en`.

- **Routing** (`proxy.ts`, Next.js 16's renamed middleware): Lithuanian is canonical and **unprefixed** (`/`), English is at `/en`. The proxy rewrites unprefixed paths to the internal `/lt` segment, passes `/en` through, and redirects any explicit `/lt` URL back to the bare path. The matcher skips `_next` internals, `/naudokis` brand assets, and the unlocalized SEO routes (`sitemap.xml`, `robots.txt`).
- **Pages** live under `app/[lang]/`. The layout calls `generateStaticParams()` over `locales` (so both `/` and `/en` are statically generated), builds per-locale SEO via `generateMetadata` from the dictionary's `meta`, validates the segment with `isLocale` (else `notFound()`), and wraps children in `<Providers>` → `<I18nProvider locale={lang}>`.
- **Dictionaries** live in `app/lib/i18n/`. `types.ts` defines the `Dict` contract; **both `lt.ts` and `en.ts` must satisfy it**, so adding a key forces a translation in both locales (compile-time safety). Values can be functions (e.g. `emptySubtitle: (q) => …`, `reviewCount: (n) => …` with proper Lithuanian pluralization) — these run on the client, which is why `I18nProvider` derives the dict from `locale` rather than passing it across the server→client boundary.
- **Usage**: in any client component call `const { locale, dict } = useI18n()`. Never hardcode user-facing strings — add them to the `Dict` and read them from `dict`. Pass `locale` into data hooks that return localized content.

## Data fetching

The marketing site reads live data from the **Naudokis backend REST API** (separate repo, eu-north-1) via TanStack Query.

- **Provider**: `app/providers.tsx` (`"use client"`) creates the `QueryClient` once (in `useState`) and is mounted in `app/[lang]/layout.tsx`. The layout stays a server component.
- **Base URL**: `process.env.NEXT_PUBLIC_API_BASE_URL`, defaulting to `https://api-dev.naudokis.lt` (prod is `https://api.naudokis.lt`). Override locally via `.env.local`.
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
- ✅ Define interfaces/types for props and data structures (e.g. the `Listing` type in `sections.tsx`).
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

- Components / component-bundle files: PascalCase or the existing kebab/lowercase bundle names (`ui.tsx`, `cards.tsx`, `sections.tsx`, `HomeApp.tsx`, `ListingSheet.tsx`). Follow the existing names rather than introducing a new scheme.

## SEO & Metadata

Metadata lives in `app/[lang]/layout.tsx` via `generateMetadata`, built per-locale from the dictionary's `meta` (title, description, keywords, OG/Twitter cards, and `alternates.languages` hreflang for `lt`/`en`). `app/sitemap.ts` and `app/robots.ts` (Next.js 16 metadata route conventions) emit `/sitemap.xml` and `/robots.txt`, derived from `locales`/`defaultLocale` in `app/lib/i18n/config.ts` — keep them sourced from that config, not hardcoded, and note that the `proxy.ts` matcher must exclude these unlocalized root routes. There is no structured-data tooling yet, and the OpenGraph image is still the brand pattern (a dedicated 1200×630 card is a TODO). For further SEO work, use Next.js 16's built-in Metadata API and keep copy in the dictionaries — check `node_modules/next/dist/docs/` for the current API.

## Working in This Codebase

### Adding a section to the homepage

1. Add the section component to `app/components/sections.tsx` (or a card to `cards.tsx`, a primitive to `ui.tsx`) following the existing inline-style + `nk-` token pattern.
2. Wire it into the render order in `HomeApp.tsx`.
3. Add any needed CSS classes/tokens to `app/globals.css`.
4. Add every user-facing string to the `Dict` contract (`app/lib/i18n/types.ts`) and both dictionaries (`lt.ts`, `en.ts`); read them via `useI18n()`. Do not hardcode copy.
5. If the section shows backend data, add a hook under `app/lib/` (see **Data fetching**) rather than fetching inline.

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

**Last Updated**: 2026-06-02
**Project Version**: 0.1.0
