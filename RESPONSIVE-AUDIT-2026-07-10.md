# Naudokis.lt — Wide-Viewport Responsiveness Audit (2026 release readiness)

*2026-07-10/11 · corpus: 1,584 captures / ~3,300 PNGs across 61 viewport widths (320→3840), 14 height/orientation combos, 26 interaction states, 8 mock stress scenarios, both locales · commit `da68568` + working tree · production build (`next start`) against api-dev, plus a controlled mock backend · 46 finder agents (vision, code, cross-page, transition, stress, a11y, height) + mechanical per-shot metrics on 100 % of captures · verification: automated code-anchor screen + orchestrator re-derivation of all HIGH findings · 458 active findings (4 rejected, 7 duplicate-folded, 28 filed as unproven)*

---

## Executive summary

This audit swept every page of naudokis.lt across a deliberately non-standard viewport matrix — foldables (344 px), every mainstream phone, ±1 px probes around all 17 CSS breakpoint cut-lines, tablets in both orientations, short-height laptops (1280×620), landscape phones (844×390), and desktop up to 4K (3840) — and stress-tested the layouts with a mock backend serving 161-character titles, 32-character unbreakable Lithuanian compounds, 9 999,99 €/d prices, five-digit review counts, photo counts 0–5, empty/error payloads and out-of-range pagination.

**The structural foundation is genuinely strong.** Across all 1,507 live captures at every width, the harness measured **zero horizontal overflow** on every page — a bar most production marketplaces fail. Content caps are deliberate and centered at ultrawide, the bento gallery is count-aware and dvh-clamped, the 980/981 booking-sidebar flip is clean, the nav drawer already uses `100dvh`, safe-area *bottom* insets are threaded through a token, and the empty/loading/error state system is comprehensive.

**The risk is not breakage — it is a layer of 2026-era technique debt plus a handful of sharp, user-visible defects.** The audit found **0 BLOCKING and 20 HIGH** findings. The HIGHs cluster into a dozen distinct defects, led by: the Lithuanian hero headline breaking **mid-word without a hyphen ("Išsinuomoki / te") across the entire 901–1120 px band** of the flagship home page; a site-wide `white-space:nowrap` on empty-state titles that clips long search-query echoes **off both screen edges**; the legal "where to find information" table **shattering sentences into separate grid rows** below 700 px; and an out-of-range `?page=2` URL rendering three simultaneous contradictions ("4 listings", an empty grid blamed on filters that aren't set, and "Page 2 of 1").

The systemic patterns behind the 430 substantiated findings:

1. **Zero container queries** (40 findings). The OfferCard renders in at least four container contexts (feed grid, home rail, similar-items rail, landing grids) but is skinned by *viewport* media queries — a 207 px card can get desktop type while a 240 px card gets the compact skin.
2. **The `!important` compact skin fights the fluid-type system** (62 type findings). The token-driven `clamp()` scale is undermined by stepped overrides, producing +18–50 % type cliffs at the 560/561 seam on cards, tiles and headings.
3. **Width-only breakpoints ignore the height axis** (fixed-chrome findings). On landscape phones the sticky nav + filter bar + booking bar consume **37–43 % of the viewport**; the hero's city field is toggled by a height query that iOS toolbar show/hide crosses mid-scroll.
4. **Raw `vh` in overlays** while the nav drawer already uses `dvh`: bottom sheets cap at `92vh` (top clips under the iOS dynamic toolbar), the desktop install dialog has **no max-height at all**, and the status screens centre with `62vh`.
5. **Safe-area is bottom-only.** `viewport-fit=cover` is set, but nav, drawers, FABs and the fixed reserve bar all lack `env(safe-area-inset-left/right)` for landscape notches.
6. **Snap rails are half-adopted**: three scroll-snap rails, none with `scroll-snap-stop`, `overscroll-behavior` or `scroll-padding-inline`; at 745–811 px the home category rail shows three clean tiles with **no visual cue that seven more exist**.
7. **Lithuanian-specific wrap fragility** (29 wrap findings): long compounds meet `nowrap`, line-clamps and missing `hyphens`/`overflow-wrap` policy — the stress corpus surfaced mid-word clips in review cards, breadcrumbs and card locations.

Sparse dev-backend inventory (4 listings) limited full-grid evidence on live pages; the mock scenarios closed most of that gap (87-item pagination, 12-card stress grids, photo-count series). Remaining evidence gaps are listed honestly in *Method & coverage* and the *Unproven observations* appendix.

**Bottom line:** the site ships with an unusually clean structural layer for launch, but to *read* as a leading 2026 marketplace across the full device spectrum it needs one focused typography/wrap pass (hero + LT text policy), one overlay-height pass (`svh`/`dvh` + max-heights + pinned sheet headers), the EmptyState nowrap removal, the legal-table mobile transform rebuilt, and a planned migration of card/tile skins to container queries.

---

## Verdict: 2026 responsive-readiness

**Overall: 7.3 / 10** — structurally launch-ready; below the flagship bar on typography seams, overlay height handling and modern-technique adoption.

| Dimension | Score | Justification |
|---|---|---|
| Overflow & structural integrity | **9.0** | Zero horizontal overflow in 1,507 live captures at 61 widths; stress-only clips (RSP-233, RSP-234); clean 344 px foldable renders |
| Seam / transition quality | **6.5** | Hero H1 ladder hole 1025–1120 (RSP-001), +18–50 % type cliffs at 560/561 (RSP-149, RSP-141), 1024→1025 card-width cliff −26/28 % (RSP-017, RSP-062), 1120/1121 triplet hit-box collision (RSP-066, RSP-230) |
| Fluid type & wrap quality | **6.0** | Strong clamp()/token ramp undermined by `!important` steps (RB-09 ×30); LT mid-word breaks (RSP-001, RSP-233), widowed H1s without `text-wrap:balance` (RSP-322) |
| Touch & pointer | **7.0** | Primary CTAs ≥44 px throughout; but 38 px chips (RSP-122), 34–36 px favourites/reset (RSP-015, RSP-151), ~20 px inline mailto (RSP-411), hover-gated affordances have touch paths |
| Viewport units & fixed chrome | **5.5** | `92vh` sheets (RSP-425), no-max-height desktop dialog (RSP-426), `62vh` status centering; nav+filterbar+mbar consume 37–43 % of landscape viewports (RSP-154, RSP-241) |
| Safe-area completeness | **6.0** | Bottom insets tokenised and applied well; left/right insets absent on nav, mbar, FABs, drawers under `viewport-fit=cover` (RSP-235, RSP-060) |
| Ultrawide & content-cap strategy | **8.0** | Deliberate, centered caps at 1920–3840; minor incoherence in the 1100–1920 cap family; footer link double-wrap band 1025–1300 (RSP-451) |
| Overlay geometry | **6.5** | Correct dialog↔sheet form flips; but unpinned sheet headers (RSP-427), scroll-lock scrollbar shift (RSP-437), drawer leaves background scrollable (RSP-099), lightbox desktop arrows on phones (RSP-429) |
| Accessibility-responsiveness | **6.0** | Reflow@320 passes broadly; WCAG 1.4.12 failures on clamped/nowrap text (RSP-005, RSP-281); `closeAt` auto-close drops keyboard focus to `<body>` (RSP-121); touch-target floor misses |
| 2026-technique adoption | **5.0** | Zero `@container`; `dvh` in 3 places, `svh` nowhere; `text-wrap` partial; snap rails lack stop/padding/overscroll; no `scrollbar-gutter`; image `sizes` drift on the detail bento |

---

## Top priority fixes

1. **RSP-001 · HIGH — Hero H1 breaks mid-word across 901–1120 px.** The flagship LT headline renders "Išsinuomoki / te, o ne pirkite." (verified at 1119×800) and orphans ", o ne pirkite." at 901–1024. The type ladder jumps +20 % at 1025 into a width band it doesn't fit. Fix: add the missing 1025–1120 step to the `--nk-fs-hero` ramp (or extend the ≤1024 size to ≤1120), and replace `overflow-wrap:anywhere` on display headings with `hyphens:auto` + `text-wrap:balance`. *(Also reported as RSP-002/003/004.)*
2. **RSP-107 · HIGH — Site-wide EmptyState title `white-space:nowrap` ≥561 px** (`globals.css:843`) clips long search-query echoes off **both** viewport edges (feed, landings, status pages; both locales) and hard-blocks WCAG 1.4.12 reflow. Fix: delete the nowrap rule; truncate the *query echo variable*, not the sentence — `overflow-wrap:anywhere` on the echoed `<q>` span + a ~40-char ellipsis in `emptySubtitle`. *(Also RSP-109/115/319.)*
3. **RSP-365 · HIGH — Legal stacked-table transform shatters sentences ≤700 px.** "Skaitykite **4** ir **6** skyriuose" renders as four separate grid rows with the link numbers floating alone (verified at 700 px). Fix: in the `data-label` card transform, wrap each cell's inline content in one flow container (`display:block` for the cell body) instead of promoting every inline node to a grid item.
4. **RSP-108 · HIGH — Out-of-range `?page=N` renders three contradictions** ("4 listings" + empty grid + "Try another city…" + "Page 2 of 1"). Fix: clamp `page` to `totalPages` in `landing-params.ts` (redirect or render last page), and never blame filters when none are active.
5. **Overlay height family — RSP-425/426/427/437.** `.nk-sheet`/`.nk-redirect-panel` cap at raw `92vh` (top clips under mobile URL bars); the desktop install dialog has no max-height/scroll (breaks at 844×390 landscape); the filter sheet pins its footer but its header scrolls away (RSP-427); scroll-lock removes the scrollbar without `scrollbar-gutter` compensation. Fix: `max-height:min(92dvh, 92svh)` (or plain `92svh`), `max-height+overflow:auto` on the dialog, `position:sticky;top:0` sheet headers, `scrollbar-gutter:stable` (or padding compensation) on lock.
6. **RSP-307 · HIGH — Category tiles ellipsize because the forced column ladder drops tracks below the system's own `--nk-cat-min:220px`** (320–380 px phones and at the 701/981 ladder entries), while the ≤400 px breathing-room rule is dead code. Fix: `repeat(auto-fill,minmax(min(100%,var(--nk-cat-min)),1fr))` and delete the dead rule.
7. **Legal reading experience on laptops — RSP-366/367.** The sidebar TOC is hidden across 981–1180 despite fitting (dead right margin; FAB+drawer instead), and the left-anchored "Turinys" FAB occludes line starts of the reading column (covers the SVARBU warning at 1024×768). Fix: lower the sidebar threshold to ~1024 px and dodge the FAB (right-anchor or auto-hide over content).
8. **Stress overflows in trust surfaces — RSP-233/234.** Review cards clip unbreakable tokens mid-word ≤360 px; the booking panel's nowrap price/rating row overflows at max price + 5-digit count at the 981 px sidebar minimum. Fix: `overflow-wrap:anywhere` on review/user-generated text; let the rating wrap under the price.
9. **Safe-area sides — RSP-235 + family.** `.nk-mbar`, back-to-top/TOC FABs, nav and drawers apply only `--nk-safe-bottom`; on notched landscape phones controls sit in the inset. Fix: add `env(safe-area-inset-left/right)` to the shared fixed-chrome padding (extend the token approach).
10. **Fixed-chrome height budget — RSP-154/165/241 family.** Width-only breakpoints keep nav + 2–3-row filter bar (+ mbar on detail) pinned at 37–43 % of landscape-phone viewports, and ~315 px of chrome at 561–1024. Fix: add `@media(max-height:520px)` rules that unstick the filter bar / collapse it to the mobile button, matching the short-phone token pattern that already exists.
11. **RSP-006 · HIGH — Home category snap rail gives no continuation cue at ~745–811 px** (3 tiles fit exactly; 7 of 10 invisible). Fix: `scroll-padding-inline` + a deliberate half-tile peek (e.g. tile basis `calc((100% - 2*gap)/2.5)`) and restore the mask fade in that band.
12. **RSP-005 · HIGH — Hero lead line-clamp swallows a full sentence at 320 px and clips under WCAG 1.4.12 spacing.** Fix: clamp by available height only on the short-phone query (as designed), never at base 320×568; or drop the clamp and shorten the copy (copy change already queued elsewhere).

## Quick wins

- **Delete one line** — `@media(min-width:561px){.nk-empty__title{white-space:nowrap}}` (`globals.css:843`): unlocks RSP-107 and three sibling findings.
- `text-wrap:balance` on `.nk-h-page`/hero H1; `text-wrap:pretty` is already on detail prose — extend to landing intros (RSP-322, RSP-077).
- `scroll-snap-stop:always` + `overscroll-behavior-x:contain` + `scroll-padding-inline:var(--nk-gutter)` on the three rails (RSP-024, RSP-042, RSP-236).
- `scrollbar-gutter:stable both-edges` on `html` when any overlay locks scroll (RSP-437).
- Clamp `?page` to the last page in `landing-params.ts` (RSP-108).
- Dead-rule cleanup, code-anchored: the ≤400 px `--nk-cat-h:150px` rule (shadowed), the ≤430 px `.nk-lhead__actions` rule (inline style wins), the ≥1200 px `--nk-stack-md` rule (token never defined) — three deletions that prevent future confusion (dead ≤400 rule — see RSP-307; RSP-275; RSP-010).
- `scrollIntoView` the active chip when the feed catrail mounts filtered (RSP-131).
- Raise the 10.5 px category eyebrow to ≥11.5 px or drop its letter-spacing at 4-col (RSP-078, RSP-014).
- `hyphens:auto` (with `lang="lt"` already set) on review bodies, card titles and breadcrumb labels — kills the whole unbreakable-token clip family cheaply.

## Larger improvements

- **Container-query migration** for the OfferCard skin, category tile and HIW phone mock (the 40 RB-03 findings; see the adoption map). This retires the `!important` compact skin and the 560/561 cliffs in one architecture move.
- **Overlay system pass**: one shared sheet primitive (svh-capped, pinned header, safe-area padded, focus-restoring, scrollbar-compensated) replacing the four ad-hoc implementations (filter sheet, redirect sheet/dialog, legal drawer, nav drawer).
- **Height-aware chrome**: a `(max-height:560px)` tier that unsticks/condenses nav + filter bar + mbar; pairs with the existing short-phone token retarget.
- **Intrinsic grids**: replace the `repeat(N)` ladders on `.nk-grid-feed`/`.nk-grid-4`/`.nk-grid-cats` with `auto-fill/minmax` so track width can never undercut card/tile minimums (kills the 1024/1025 −26 % cliff and RSP-307's class).
- **LT typography policy**: `hyphens:auto` defaults for UGC + display-heading wrap rules (`balance`, no `anywhere` on headings), documented in the token file.

---

## Method & coverage

**Capture.** A new harness (`scripts/wide-audit-shots.mjs` + `scripts/_shots-lib.mjs`, kept in-repo and reusable) produced 1,584 captures / ~3,300 PNGs: 30 TIER-1 device widths × all routes; ±1 px probes around all 17 CSS cut-lines (TIER-2) on primary routes; 11 ultrawide/parity widths (TIER-3) to 3840; a height matrix (short-phone ≤700 px trigger, bento ≤780 clamp, landscape phones, 1280×620 docked-bars laptops, ≤620 legal-drawer compress); 26 interaction-state recipes (drawers, sheets, pickers, lightbox at 4 orientations, popovers, FAB states, skeletons via delayed-API interception, reveal-integrity without animation kill, WCAG 1.4.12 text-spacing injection); and 8 mock-backend scenarios (bento photo counts 0–5, 161-char titles + unbreakable tokens, 9 999,99 € prices with 12 345 reviews, per-facet empties, SSR error states, 87-item pagination incl. `?page=999`, all cancel-deletion states incl. the in-flight spinner). DPR 2 ≤900 px, phone emulation (touch, coarse pointer) whenever the short edge ≤680 px. Every capture logs per-shot metrics: horizontal overflow + culprit elements, clipped text, sub-44/24 px targets, <8 px target spacing, minimum font size, prose measure, fixed-chrome viewport consumption, cap utilization, landmark burial, element overlaps, image distortion, dialog fit.

**Analysis.** 46 finder agents: 12 fine-grained page×band vision cells (home fully, feed mobile), 21 consolidated vision cells (every remaining page × mobile/desktop regime, overlays as first-class surfaces, chrome/footer), 3 transition cells reading ±1 px boundary pairs, 2 content-stress cells, 2 a11y cells (touch/reflow + text-spacing), 1 height/orientation cell, 3 code finders (full CSS layer, responsive JS/JSX logic, media-query seam adjudication + `next/image` sizes), 2 cross-page consistency finders — each with the 24-point 2026 rubric, capture-mechanics warnings (fixed-bar fullPage artifacts, DPR-2 halving, partial-last-row), and a per-rubric attestation contract. A separately extracted machine-readable lattice (113 media queries, 61 clamp() uses, all fixed/sticky/snap/`!important`/safe-area inventories, 10 pre-identified seams) grounded the code finders.

**Verification.** The planned per-finding adversarial fan-out was replaced mid-run (token-budget decision) with: (1) a mechanical code-anchor screen over all 469 merged findings — 212 anchors exact, 245 token-verified with line drift, 5 unresolvable (3 legitimate absence-claims); (2) orchestrator re-derivation of the full HIGH set — code greps for every code-inferred claim and direct screenshot re-reads for the six load-bearing visuals; this **rejected four findings** (the "OfferCard `sizes=92vw`" cluster — the shipped ladder at `cards.tsx:59` is correct), demoted one, and folded seven duplicates; (3) confidence gating — 28 findings below 0.65 confidence are quarantined in the *Unproven observations* appendix, not the main body. Findings therefore carry explicit basis labels (`measured` / `visual` / `code-inferred`, plus `verified (orchestrator)` where re-derived). Auto-metric leads that the finders identified as capture artifacts (closed-drawer "overlaps", fullPage fixed-bar ghosts) were attested as false positives, not filed.

**Coverage, honestly stated.** The coverage ledger tracks 690 route×band×state×locale cells: 243 strictly audited by direct shot-reads, 38 partially, the rest sampled — consolidated finders read the top-24 hot-ranked shots per cell (ranking = auto-metric leads + boundary widths first), so every route×band regime was examined but not every individual width shot was human/agent-viewed; 100 % of captures passed through the automated metric screen. Known evidence gaps: the live dev backend held only 4 listings (full-grid density on live pages comes from the mock corpus instead); both live detail fixtures had zero reviews and a broken CDN photo (loaded ReviewsBreakdown geometry is code-verified, gallery evidence comes from the bento mock series); the handover map iframe never paints in headless captures; headless Chromium reports safe-area insets as 0, so safe-area findings are structural (code) rather than visual; EN coverage ran at ~half the LT width set (per plan), with full EN coverage at the label-sensitive 559–561/1119–1121 seams.

---

# Findings by page

Severity scale: **BLOCKING** — core path unusable at a mainstream viewport (none found) · **HIGH** — clearly below the 2026 marketplace bar, visible to normal users · **MEDIUM** — a defect a design team fixes before a flagship release · **POLISH** — craft. Widths are CSS px; bands referenced as B1 ≤360 · B2 361–430 · B3 431–560 · B4 561–768 · B5 769–1024 · B6 1025–1280 · B7 1281–1536 · B8 ≥1537.

## 1. Home (/)

*Audited at all 61 widths + 8 fine-grained band cells (B1–B8), height matrix (short-phone 320×568…430×700, landscape 844×390/932×430/780×360, docked-bars 1280×620), both locales, plus overlay states (nav drawer, locale picker, city picker, search focus, install dialog/sheet) and the animation-integrity pass. 97 substantiated findings (6 HIGH · 55 MEDIUM · 36 POLISH).*

**Band walkthrough.** ≤360 (B1): the short-phone token retarget works — section rhythm compresses and the hero lead line-clamps, but the clamp is keyed to *height* ≤700, so a base 320×568 phone loses a full sentence of the value proposition (RSP-005), and the 4-line clamp clips under WCAG 1.4.12 spacing. 361–430 (B2): densest phone band is largely clean; the snap-rail and eyebrow issues below carry through. 431–560 (B3): hero media is hidden, panel stacks — solid. Seam 560/561: hero H1 steps +15.8 % (RSP-071), the nav CTA flips icon-only↔short-label cleanly in both locales. 561–768 (B4): the categories shelf becomes a snap rail — at ~745–811 px exactly three tiles fit with zero continuation cue (RSP-006). 769–1024 (B5): hero goes 2-col at 901; H1 orphans ", o ne pirkite." on its own display line (folded into RSP-001). Seam 1024/1025: H1 jumps ~+20 % into a band it cannot fit — 1025–1120 (B6) renders the flagship headline broken mid-word, "Išsinuomoki / te" (RSP-001, verified at 1119×800). Seam 1120/1121: nav flips burger→full; the locale trigger's hit-box abuts/overlaps the install CTA just above the seam (RSP-066). 1281–1536 (B7): search placeholder ellipsizes at 1281–1439 — the fix band stops 1 px early (RSP-008). ≥1537 (B8): panel caps and centers correctly to 3840; background pattern scales gracefully.

**What holds.** Zero overflow at every width; the stepper, features band, FAQ and CTA banner reflow cleanly across all bands; reveal animations never strand content hidden (integrity pass); the 10-tile shelf grid (5+5 at ≥1441, 4+4+2 at 981–1440) is intentional and reads fine.

**Concentrated risk:** hero typography (H1 ladder + wrap policy + lead clamp) and the city-picker family — hidden across 561–1024 by design (capability non-monotonic, RSP-019), toggled by a height query that live browser toolbars cross mid-scroll (RSP-007), and its dropdown slides under the sticky nav at ≤560 (RSP-009).

### All findings — Home

### hero

**RSP-001 · HIGH** — LT hero H1 breaks mid-word without a hyphen ('Issinuomoki / te') at 1025-1120px (1025–1120px)

- **What:** The flagship H1 'Reikia trumpam? Issinuomokite, o ne pirkite.' renders as 'Issinuomoki' + newline + 'te, o ne' at 1025, 1112 and 1119px (LT). `.nk-h-hero` has `overflow-wrap:anywhere` (globals.css:254) and `hyphens:auto` is only applied <=560px (globals.css:1926). In 1025-1120 no font-size override exists (the :lang(lt) downsize to clamp(44px,5.8vw,70px) is gated min-width:1121px; the 901-1024 clamp stops at 1024), so the H1 runs at the base 7.2vw = 73.8-80.6px, making the 13-char 'Issinuomokite,' too wide for the ~510px intro column and triggering a hyphen-less anywhere-break.
- **Why:** A mid-word, hyphen-less break in the hero headline at iPad Pro landscape / small-laptop widths (1024-1120 is a mainstream band) reads as a rendering bug and is far below the 2026 marketplace typography bar. EN at the same widths wraps cleanly, so LT users get a visibly worse brand moment.
- **Fix:** Change the :lang(lt) hero downsize gate from min-width:1121px to min-width:1025px (globals.css:1445) so LT runs clamp(44px,5.8vw,70px) across 1025-1280 ('Issinuomokite,' then fits, as proven by the 1121 shot), and add `hyphens:auto;-webkit-hyphens:auto` to the base .nk-h-hero rule (globals.css:250) as a safety net instead of relying on overflow-wrap:anywhere alone.
- **Evidence:** `home/base-lt-1119x0800-vp.png` · `home/base-lt-1112x0834-vp.png` · `home/base-lt-1025x0768-vp.png` · app/globals.css:254 .nk-h-hero (overflow-wrap: anywhere); app/globals.css:1445-1447 @media(min-width:1121px) :lang(lt) .nk-hero-panel .nk-h-hero
- *RB-10 · confidence 0.97 · measured · verified (orchestrator re-check: shot + code) · also reported as RSP-002, RSP-003, RSP-004*

**RSP-005 · HIGH** — Hero lead 4-line clamp swallows a full sentence at 320; fails WCAG 1.4.12 and clips at base (320–560px, state: base, textspacing; locales: en, lt; applies only when viewport height <=700 (short-phone skin))

- **What:** The short-phone skin puts -webkit-line-clamp:4 + overflow:hidden on the home hero lead (.nk-hero-panel .nk-body). At 320x568 the BASE state already ellipsizes mid-word ('...o datas, galutine sum...'), and under injected WCAG 1.4.12 text spacing the entire second sentence ('Palyginkite internete, o datas, galutine suma ir mokejima patvirtinkite programeleje.') is cut with no way to reveal it. At 768 the same copy renders in full, confirming content exists and is lost only by the clamp.
- **Why:** WCAG 1.4.12 requires no loss of content under injected text spacing; here core hero marketing copy is silently truncated. Worse, normal users on 320x568 phones (iPhone SE class) see a mid-word ellipsis in the hero -- below the bar for a flagship marketplace landing page.
- **Fix:** Remove -webkit-line-clamp from .nk-hero-panel .nk-body in the @media(max-width:560px) and (max-height:700px) block (app/globals.css:1820) -- the two-sentence lead costs ~2 extra lines -- or shorten the dict copy for the compact skin instead of clipping it.
- **Evidence:** `home/textspacing-lt-0320x0568-dpr2-fp.png` · `home/textspacing-lt-0768x1024-dpr2-fp.png` · `home/search-focus-lt-0320x0568-dpr2-vp.png` · app/globals.css:1820 .nk-hero-panel .nk-body (-webkit-line-clamp:4)
- *RB-11 · confidence 0.92 · measured*

**RSP-007 · HIGH** — Height media query (<=700px) deletes the hero City field; iOS toolbar toggles it mid-scroll (361–430px, locales: en, lt; fires at viewport height <=700px; most iPhones report innerHeight ~660-700 with browser chrome, ~740+ with it collapsed)

- **What:** At 375x667 and 430x700 the hero search renders only DAIKTAS + Ieskoti - the MIESTAS row and its divider are display:none!important under @media(max-width:560px) and (max-height:700px). At 361x800/390x844/430x932 the same widths show the full two-field form. On iOS Safari the visual viewport height crosses 700px as the toolbar collapses/expands (e.g. iPhone 12-14: ~664px with chrome, ~746px collapsed), so the city field and 1-2 body lines pop in/out and the Ieskoti button shifts ~70px vertically during normal scrolling.
- **Why:** A core search facet silently disappears for the majority mobile context (most iPhones report <=700px innerHeight on first paint), and geometry that re-flows with the dynamic browser toolbar is exactly what svh/dvh discipline exists to prevent. A leading 2026 marketplace would not gate a search input on viewport height.
- **Fix:** Remove .nk-citypick/.nk-search>span:nth-child(2) from the max-height:700px block (globals.css:1816-1817) - keep the padding/type compaction only. If above-the-fold height is the goal, compress rhythm further or gate on width, never on a boundary the mobile toolbar crosses; any remaining height gating should use the stable small-viewport metric (e.g. test against 100svh-derived layout), not max-height media queries.
- **Evidence:** `home/base-lt-0375x0667-dpr2-vp.png` · `home/base-lt-0430x0700-dpr2-vp.png` · `home/base-lt-0361x0800-dpr2-vp.png` · app/globals.css:1803 @media(max-width:560px) and (max-height:700px); app/globals.css:1816 .nk-hero-panel .nk-search .nk-citypick{display:none!important}
- *RB-06 · confidence 0.9 · measured*

**RSP-008 · HIGH** — Hero search placeholder ellipsizes at 1281-1439 — the fix band stops 1px too early (1281–1439px)

- **What:** The primary hero search prompt truncates: 'Ką norite išsinu...' at 1281 and 'Ką norite išsinuomo...' at 1366; it only fits from 1440 up. globals.css:1484-1489 deliberately frees ~70px of Ieškoti-button padding 'so the placeholder never ellipsizes' — but that media query is capped at max-width:1280, so the entire 1281-1439 range (including 1366x768, a top-3 laptop resolution) regresses to the wide padding (HeroSearch.tsx:193 '16px 36px') and the placeholder clips again.
- **Why:** The codebase's own comment (globals.css:793-795) states that above 560px the placeholder is the field's only visible hint — a cut-off prompt on the flagship conversion element at one of the most common desktop widths reads as broken to normal users and is below the 2026 marketplace bar. EN's longer placeholder ('What would you like to rent?') will truncate even harder in this range.
- **Fix:** Extend the compact-button rule to the truncation range: change globals.css:1484 to @media(min-width:1025px) and (max-width:1439px) (and keep :1486 .nk-body max-width scoped to 1280 if desired), or reduce HeroSearch.tsx:193 button padding to 16px 24px below 1440.
- **Evidence:** `home/base-lt-1281x0800-vp.png` · `home/base-lt-1366x0768-vp.png` · `home/base-lt-1440x0900-vp.png` · app/globals.css:1484 @media(min-width:1025px) and (max-width:1280px) — the anti-ellipsis fix stops at 1280; app/globals.css:790 .nk-search__input (text-overflow:ellipsis; min-width:110px)
- *RB-01 · confidence 0.9 · measured*

**RSP-010 · MEDIUM** — ≥1200px hero fold-economics rule is doubly dead: undefined --nk-stack-md loses to inline gap (1200–3840px, locales: en, lt; targets 1440x900 fold)

- **What:** Seam S5 CONFIRMED (real bug). globals.css:1456 sets gap:var(--nk-stack-md) for .nk-hero-intro at ≥1200px, but (a) --nk-stack-md is defined nowhere (grep hits only this usage; :root defines only --nk-stack-lg at line 211), and (b) sections-home.tsx:36 sets gap:"var(--nk-stack-lg)" as an inline style, which beats any non-!important stylesheet rule. The comment above the rule ('search bar + store badges sit inside a 1440x900 viewport in both locales') describes behavior that never applies.
- **Why:** The intended tightening that keeps the hero search + store badges above the fold on the most common desktop viewport (1440x900) silently never shipped; the CTA can sit below the fold, and the dead token invites copy-paste propagation.
- **Fix:** Define --nk-stack-md in :root (e.g. clamp(22px,2.6vw,30px)) and add !important to globals.css:1456 (matching the sibling hero-band !important overrides), or move the ≥1200 gap into the inline style logic in sections-home.tsx:36.
- **Evidence:** app/globals.css:1456 .nk-hero-panel .nk-hero-intro (min-width:1200px); app/globals.css:211 --nk-stack-lg (only stack token defined)
- *RB-09 · confidence 0.97 · code-inferred*

**RSP-011 · MEDIUM** — ≥1200px hero fold-economics rule is doubly dead: undefined token + loses to inline style (1200–3840px, locales: en, lt; authored for the 1440x900 fold)

- **What:** The rule sets gap:var(--nk-stack-md) but no --nk-stack-md is ever defined (only --nk-stack-lg at :211), so the declaration resolves to invalid-at-computed-value; and even with a valid token it loses to the inline style gap:"var(--nk-stack-lg)" set in sections-home.tsx (inline beats any non-!important rule). The comment's stated goal — 'search bar + store badges sit inside a 1440x900 viewport in both locales' — never applies.
- **Why:** The hero search + install badges (the two conversion actions) may sit below the fold at the most common desktop size, and the file asserts the opposite. Silent dead rules in the hero are exactly what a flagship pass must not carry.
- **Fix:** Define --nk-stack-md (e.g. clamp(22px,2.6vw,32px)) in :root AND make the rule win: either add !important like its sibling hero-band overrides (:1481, :1513) or remove the inline gap from sections-home.tsx and own it in CSS.
- **Evidence:** app/globals.css:1455-1457 @media(min-width:1200px) .nk-hero-panel .nk-hero-intro{gap:var(--nk-stack-md)}; app/globals.css:211 (only --nk-stack-lg exists)
- *RB-09 · confidence 0.95 · code-inferred*

**RSP-012 · MEDIUM** — Hero value-prop subtitle is line-clamped mid-sentence on short phones, worse under text-spacing (320–560px, state: base, textspacing; locales: en, lt; only when viewport height <=700px (320x568, 360x640 class devices))

- **What:** At 320x568 LT the hero subtitle renders 'Palyginkite internete, o datas, galutinę sum…' — the 4-line -webkit-line-clamp cuts the sentence mid-word; EN at 320x568 shows '…confirm dates, final amount and…'. In the textspacing state (WCAG 1.4.12 letter/word-spacing stress) an additional full sentence disappears ('…savininkų Lietuvoje.…'), i.e. content loss increases as text spacing grows. At 360x800 the full subtitle shows, confirming the clamp is the only cause.
- **Why:** The clamp is a fixed-line text container: under user text-spacing adjustments it hides content with no way to reveal it (WCAG 1.4.12 'no loss of content'), and on mainstream short phones (360x640) the marketing value prop ends in an ellipsis mid-word, which reads broken rather than deliberate.
- **Fix:** In app/globals.css:1815 drop the -webkit-line-clamp:4 and instead ship a shorter dictionary variant for the short-viewport hero (dict.hero.subtitleShort) or allow the block to grow; if a clamp must stay, clamp at a sentence boundary via shorter copy so no ellipsis appears at default spacing.
- **Evidence:** `home/base-lt-0320x0568-dpr2-vp.png` · `home/base-en-0320x0568-dpr2-vp.png` · `home/textspacing-lt-0320x0568-dpr2-fp.png` · app/globals.css:1803 @media(max-width:560px) and (max-height:700px); app/globals.css:1815 .nk-hero-panel .nk-body -webkit-line-clamp:4
- *RB-11 · confidence 0.95 · measured*

**RSP-013 · MEDIUM** — Hero value-prop copy truncates mid-sentence with ellipsis on short phones (361–430px, locales: en, lt; <=700px viewport height only)

- **What:** The same max-height:700 block line-clamps the hero body to 4 lines. At 375x667 the LT copy needs 5 lines, so it renders 'Palyginkite internete, o datas, galutine suma ir...' - the sentence's payoff ('mokejima patvirtinkite programeleje', the app-bridge value prop) is cut with no affordance to read it. At 430x700 the text happens to fit in exactly 4 lines, so truncation depends on width x locale.
- **Why:** Core marketing copy clipped mid-sentence on a mainstream device class (iPhone SE 375x667, plus any phone whose in-chrome viewport is <=700 tall). Also fails WCAG 1.4.12 text-spacing: increased line-height makes the fixed 4-line clamp swallow more content.
- **Fix:** Delete the -webkit-line-clamp from globals.css:1815 and shorten the mobile copy in the dictionaries instead, or clamp only when a truncation-safe shorter string is provided. Never line-clamp sentence copy without an expansion path.
- **Evidence:** `home/base-lt-0375x0667-dpr2-vp.png` · `home/base-lt-0430x0700-dpr2-vp.png` · app/globals.css:1815 .nk-hero-panel .nk-body{-webkit-line-clamp:4;overflow:hidden}
- *RB-11 · confidence 0.95 · measured*

**RSP-017 · MEDIUM** — Hero H1 type-size cliff of ~+20% across the 1024→1025 seam (1024–1025px, locales: en, lt)

- **What:** At 1024px the 901-1024 override sets the hero H1 to 6vw ≈ 61.4px; at 1025px that rule ends and the base --nk-fs-hero clamp gives 7.2vw ≈ 73.8px — a +20% jump in one pixel (rubric threshold >15%). The LT correction only re-enters at 1121px, leaving 1025-1120 as an oversized orphan window (which also causes the mid-word break reported separately).
- **Why:** Type cliffs at seams betray a stitched-together ladder; the same headline should scale continuously through the tablet/laptop transition.
- **Fix:** Make the 901-1024 and ≥1121 hero clamps one continuous clamp() covering 901-1920 (e.g. extend globals.css:1478 to max-width:1120px, or lower the 1446 breakpoint to 1025px).
- **Evidence:** `feed/filter-popover-p0-lt-1024x0768-vp.png` · `home/city-picker-lt-1025x0768-vp.png` · app/globals.css:1478 .nk-hero-panel .nk-h-hero (901-1024: clamp 6vw); app/globals.css:228 --nk-fs-hero clamp(44px,7.2vw,92px)
- *RB-05 · confidence 0.9 · code-inferred*

**RSP-018 · MEDIUM** — Hero city facet exists at ≤560 and ≥1025 but is display:none across 561-1024 (561–1024px, state: base, city-picker, search-focus; locales: en, lt; also hidden ≤560 wide when viewport ≤700px tall (e.g. 320x568, 360x640))

- **What:** The MIESTAS field of the hero search is shown at ≤560 (stacked form, confirmed at 390x844/560x900) and at ≥1025 (inline pill, confirmed at 1025/1280), but three media windows remove it entirely: 561-900 (globals.css:1494), 901-1024 (1481) and short phones ≤560&≤700h (1817 — confirmed missing at 320x568). The paradox: at 561-900 the stacked search bar is full container width (~500-850px), i.e. WIDER than the ~500px column that fits the picker at 1280, yet the facet is dropped.
- **Why:** RB-05: an element present at 560 and at 1025 but missing 561-1024 is a seam-integrity defect; tablet users (768x1024, 820x1180) and short-phone users lose the location facet of the primary search, and a scripted/city-picker deep link has nothing to open.
- **Fix:** At 561-900 keep the stacked ≤560 form (it has room); at 901-1024 keep the field and let the stacked variant apply instead of hiding (delete globals.css:1481-1482, 1494-1495 and gate the stacked layout at ≤1024 where the hero is 1-col).
- **Evidence:** `home/search-focus-lt-0320x0568-dpr2-vp.png` · `home/city-picker-lt-0320x0568-dpr2-vp.png` · `home/search-focus-lt-0560x0900-dpr2-vp.png` · app/globals.css:1481-1482 (901-1024 hides .nk-citypick); app/globals.css:1494-1495 (561-900 hides .nk-citypick)
- *RB-05 · confidence 0.9 · code-inferred*

**RSP-019 · MEDIUM** — Hero city picker exists at <=560 and >=1025 but vanishes across the whole 561-1024 band (561–1024px)

- **What:** The 'Visi miestai' city select is a stacked field in the <=560 compact search and an inline segment at >=1025, but two media blocks display:none it (plus its divider) for 561-900 and 901-1024. A control present on both sides of a band but missing inside it is the textbook seam-integrity failure: phone users who rotate to landscape (>=561) or tablet users lose the city pre-filter from the primary search, then get it back on desktop.
- **Why:** RB-05 explicitly flags element presence gaps; functionally, tablet visitors must run a nationwide search then re-filter on the feed - an extra step on the single most-used entry path.
- **Fix:** Keep the city picker in the 561-1024 hero as a second stacked row (reuse the <=560 stacked anatomy up to ~900px) instead of hiding it; if space is the concern at 901-1024, hide only the divider.
- **Evidence:** `home/base-lt-0560x0900-dpr2-vp.png` · `home/base-lt-0700x0900-dpr2-fp.png` · `home/base-lt-1440x0900-fp.png` · app/globals.css:1481 @media(901-1024) .nk-hero-panel .nk-search .nk-citypick{display:none!important}; app/globals.css:1494 @media(561-900) .nk-hero-panel .nk-search .nk-citypick{display:none!important}
- *RB-05 · confidence 0.9 · measured*

**RSP-023 · MEDIUM** — Hero city picker exists at <=560 and >=1025 but is removed for the whole 561-1024 range (431–560px, locales: en, lt; boundary at 560/561)

- **What:** At 560px the stacked hero search shows the MIESTAS/'Visi miestai' city field (verified in base-lt-0560x0900 and base-lt-0431x0932 shots). One CSS pixel wider, .nk-hero-panel .nk-search .nk-citypick{display:none!important} (globals.css:1493, repeated at :1480 for 901-1024) deletes it until 1025px. Capability is non-monotonic across width: phone has it, tablet loses it, desktop regains it.
- **Why:** Seam-integrity rule: an element present on both sides of a range must not vanish inside it without cause. A user rotating a phone (560-wide portrait to ~800-wide landscape) watches the city filter disappear from the flagship search; tablet users lose the location pre-filter entirely, which is core scent for a local rental marketplace.
- **Fix:** Keep the city picker in the 561-1024 hero search: reuse the <=560 stacked two-row form (query row + city row + submit) up to ~900px instead of display:none, or collapse it to an icon-trigger that opens the same listbox. Anchor: app/globals.css:1491-1495 and 1479-1482.
- **Evidence:** `home/base-lt-0560x0900-dpr2-vp.png` · `home/base-lt-0431x0932-dpr2-vp.png` · app/globals.css:1493 @media(min-width:561px) and (max-width:900px) .nk-hero-panel .nk-search .nk-citypick{display:none!important}; app/globals.css:1480 @media(min-width:901px) and (max-width:1024px) same rule
- *RB-05 · confidence 0.9 · code-inferred*

**RSP-026 · MEDIUM** — Hero search loses the city facet and field labels crossing 560→561; facet absent 561-1024 but present both below and above (561–768px, locales: en, lt)

- **What:** At ≤560 the hero search is a stacked form with DAIKTAS (query) + MIESTAS city listbox ('Visi miestai') + Ieškoti (verified at 560). At 561 the form snaps to a single row and .nk-citypick + its divider are display:none'd for the entire 561-1024 range (two separate media blocks), reappearing at ≥1025. The micro-labels also vanish. Growing the viewport by 1px removes a search facet.
- **Why:** Seam-integrity rule: an element present at 560 and ≥1025 should not vanish in between without cause. Concretely, rotating a large phone portrait→landscape, or browsing on any tablet, silently drops location filtering from the primary search — the H1's own promise is 'from owners nearby'. Tablet users must discover the city filter on the feed page instead.
- **Fix:** Keep the city picker in-band: at 561-1024 render the compact trigger (icon + current city, no label column) inside the pill instead of hiding it — delete the .nk-citypick hide from app/globals.css:1493-1494 and 1480-1481 and add a condensed trigger skin; or stack the ≤560 form up to ~700px.
- **Evidence:** `home/base-lt-0561x0900-dpr2-vp.png` · `home/base-lt-0560x0900-dpr2-fp.png` · `home/base-lt-0768x1024-dpr2-fp.png` · app/globals.css:1493 @media(561-900) .nk-hero-panel .nk-search .nk-citypick{display:none!important}; app/globals.css:1480 @media(901-1024) same hide
- *RB-05 · confidence 0.9 · measured*

**RSP-027 · MEDIUM** — Hero 'Where' city picker exists at ≤560 and ≥1025 but is removed across the whole 561-1024 band (561–1024px, locales: en, lt)

- **What:** SearchBar renders query + city + submit (HeroSearch.tsx:178-195), but `.nk-citypick` and its divider are display:none!important through 561-1024, then the ≤560 stacked skin deliberately restores the city field with its label. Every B5 shot shows the one-field pill; desktop and phones show two fields.
- **Why:** RB-05 seam integrity: a capability present on both sides of a band must not vanish in between. Tablet users (iPad portrait/landscape at 769-1024 is a mainstream browse context for a rental marketplace) lose the location pre-filter that phone and desktop users get, and there is visible room for it at e.g. 980-1024.
- **Fix:** Reinstate the compact city trigger in the 769-1024 range — e.g. keep the two-field pill but shorten the submit ('Ieškoti' already fits at padding-inline:24px per globals.css:1482), or move the city into a second row of the pill as the ≤560 skin does; if dropping it is deliberate, drop it ≤560 too for a consistent model.
- **Evidence:** `home/base-lt-1024x0768-vp.png` · `home/base-lt-0769x1024-dpr2-vp.png` · `home/base-lt-0901x1280-vp.png` · app/globals.css:1480-1481 .nk-hero-panel .nk-search .nk-citypick{display:none!important} (901-1024 block); app/globals.css:1493-1494 same hide in 561-900 block
- *RB-05 · confidence 0.9 · code-inferred*

**RSP-029 · MEDIUM** — Hero H1 has inverted >15% type-size cliffs at both the 1024/1025 and 1120/1121 seams (1024–1121px, locales: en, lt)

- **What:** The hero font-size ladder leaves a 1025-1120 gap where the base token (7.2vw, cap 92px) applies: 1024px -> 61.4px (6vw rule), 1025px -> 73.8px (+20%), then LT drops 80.6px at 1120 -> 65px at 1121 (-19%, :lang(lt) rule kicks in). The headline is LARGER on the narrower side of each seam. EN hits the 1024/1025 cliff too (its >=1121 size stays on the base token so the second seam is LT-only).
- **Why:** Resizing across 1024/1025 or 1120/1121 makes the page's biggest element jump ~20% in the wrong direction — a visible discontinuity that also directly causes the mid-word break defect. 2026 practice is one continuous fluid ramp per element.
- **Fix:** Collapse the four separate clamps (base 228, 901-1024 at 1477, 561-900 at 1492, :lang(lt)>=1121 at 1446) into a single continuous clamp per locale scope covering 561px upward, e.g. extend the 1477 rule to max-width:1120px or re-gate 1446 to min-width:1025px so adjacent bands meet at equal computed sizes.
- **Evidence:** `home/base-lt-1119x0800-vp.png` · `home/base-lt-1121x0800-vp.png` · `home/base-lt-1025x0768-vp.png` · app/globals.css:228 --nk-fs-hero: clamp(44px,7.2vw,92px); app/globals.css:1471-1477 @media(901-1024) .nk-hero-panel .nk-h-hero clamp(44px,6vw,64px)
- *RB-05 · confidence 0.9 · measured*

**RSP-030 · MEDIUM** — Hero search placeholder truncates to 'Ka norite issi...' at 1025-1280 despite the code's no-ellipsize fix (1025–1280px)

- **What:** At 1199 and 1200px (LT) the hero search input shows 'Ka norite issi...' — the placeholder 'Ka norite issinuomoti?' (lt.ts:74) is cut after 14 of 22 characters. The 1025-1280 block at globals.css:1484 exists specifically to 'free ~70px inside the search pill so the placeholder never ellipsizes' (comment at :1488), but the reclaimed space is insufficient: the input's flex basis still loses to the city picker + submit button inside the 662px-max pill sitting in the ~545px intro column.
- **Why:** The primary conversion prompt on the homepage is unreadable mid-word at standard laptop widths — the code comment itself declares this a bug. A leading 2026 marketplace shows its full search prompt at desktop.
- **Fix:** Either shorten the LT placeholder, or in the 1025-1280 block (globals.css:1484) also compact the city picker (reduce .nk-citypick--hero trigger padding/font at :623) and drop .nk-search left padding, giving .nk-search__input a min-width of ~200px; verify at 1120-1280 both locales.
- **Evidence:** `home/base-lt-1199x0800-vp.png` · `home/base-lt-1200x0800-vp.png` · app/globals.css:1484-1490 @media(1025-1280) '.nk-search .nk-btn--primary{padding:16px 24px!important}' with comment 'so the placeholder never ellipsizes'; app/globals.css:790 .nk-search__input
- *RB-10 · confidence 0.9 · visual*

**RSP-038 · MEDIUM** — .nk-search reshapes via 5 viewport windows though its width is set by the hero grid — CQ target (320–1280px, locales: en, lt)

- **What:** The hero search form (.nk-search) is restyled in five viewport @media windows (901-1024, 561-900, ≤560, ≤560&≤700h, 1025-1280 tweaks) but its actual available width is decided by the .nk-hero-panel grid (2-col 1.1fr column ≥901 vs stacked full-width ≤1024/≤900). The mismatch is visible in behavior: at 561-900 the form is at its widest (full container) yet gets the most amputated skin (city facet hidden), while at ≥1025 a narrower column shows the full form. Repo has zero @container.
- **Why:** RB-03: a component rendered at materially different container widths that self-sizes via viewport media is the canonical container-query migration target; CQ on .nk-hero-intro would make the stacked-vs-inline decision follow real available width and delete the 561-900 paradox.
- **Fix:** Declare container-type:inline-size on .nk-hero-intro and convert globals.css:1480-1533 .nk-search rules to @container (e.g. stack + show city field below ~620px container width, inline pill above).
- **Evidence:** `home/search-focus-lt-0560x0900-dpr2-vp.png` · `home/city-picker-lt-1025x0768-vp.png` · `home/city-picker-lt-1280x0800-vp.png` · app/globals.css:1480-1496 (.nk-search viewport windows); app/globals.css:1525-1533 (≤560 stacked .nk-search)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-043 · MEDIUM** — Hero H1 jumps 38px to 44px (+15.8%) across the 560/561 seam (431–560px, locales: en, lt)

- **What:** At 560px .nk-h-hero resolves to 38px/1.03 (clamp(32px,9.6vw,38px), 9.6vw=53.8 so the 38px cap wins). At 561px the 561-900 rule floors it at 44px (6vw=33.7, min 44 wins), base line-height 1.08. That is a +15.8% font-size step plus a line-height step at one CSS pixel of width.
- **Why:** Exceeds the 15% type-cliff budget for adjacent breakpoints; the two clamps do not meet (upper cap 38 vs lower floor 44), so no width exists where they agree, producing a visible snap on resize/rotation.
- **Fix:** Make the ranges meet: raise the <=560 cap to ~44px (clamp(34px,9.6vw,44px)) or lower the 561-900 floor to 38px (clamp(38px,6.5vw,56px)) so the seam is continuous. Anchor: app/globals.css:1514 and :1492.
- **Evidence:** `home/base-lt-0560x0900-dpr2-vp.png` · app/globals.css:1514 @media(max-width:560px) .nk-h-hero{font-size:clamp(32px,9.6vw,38px);line-height:1.03}; app/globals.css:1492 @media(min-width:561px) and (max-width:900px) .nk-hero-panel .nk-h-hero{font-size:clamp(44px,6vw,56px)}
- *RB-05 · confidence 0.85 · measured*

**RSP-049 · MEDIUM** — EN hero H1 renders 92px and wraps to 4 mid-clause lines; LT gets a 70px cap EN doesn't (1281–1536px, locales: en)

- **What:** At 1440 EN, 'Need it for a day? Rent it instead of buying.' sets at the 92px clamp max in the ~640px intro column and balances into 4 lines with mid-clause breaks: 'Need it for / a day? Rent / it instead / of buying.' — 'Rent' dangles at the end of line 2, splitting the verb from its object. LT gets a locale-specific 70px cap (globals.css:1446) and sets 3 clean lines at the same width; EN was left on the raw token. EN page is also ~237px taller than LT (scrollHeight 7583 vs 7346).
- **Why:** A dangling verb and 4 ragged display lines on the flagship headline is below display-typography craft for a 2026 marketplace; text-wrap:balance is already applied, so this is purely an over-size issue that only EN suffers.
- **Fix:** Apply the >=1121px size cap to both locales: drop the :lang(lt) scoping at globals.css:1446 (or add a matching :lang(en) rule ~clamp(44px,5.2vw,72px)) so EN sets 3 lines like LT.
- **Evidence:** `home/base-en-1440x0900-fp.png` · `home/base-lt-1440x0900-fp.png` · app/globals.css:228 --nk-fs-hero clamp(44px,7.2vw,92px); app/globals.css:1445-1447 :lang(lt) cap clamp(44px,5.8vw,70px) at min-width:1121 — LT only
- *RB-10 · confidence 0.85 · visual*

**RSP-053 · MEDIUM** — Preloaded LCP hero phone declares sizes 80vw at 561-1024 but renders ~36-46vw (height-driven) — ~2x oversized LCP fetch (561–768px, locales: en, lt)

- **What:** sections-home.tsx:62: sizes="(max-width:560px) 60px, (max-width:1024px) 80vw, 420px" with preload. In this band the phone's width is derived from height (height:118% of .nk-hero-media min-height clamp(300px,42vw,400px), width:auto, ratio 714/968): at 768 that's ≈280px wide (36vw); at 561 ≈261px (46vw). 80vw requests ≈1229px @dpr2 at 768 where ≈560px suffices (~2.2x linear, ~4.8x pixels) — and this image is the declared-preload LCP candidate.
- **Why:** Oversizing the preloaded LCP asset directly delays LCP on tablet-class devices; the ≤560 candidate shows the team already tuned this attribute per band, so the 561-1024 term is a miss, not a policy.
- **Fix:** Change the middle term in sections-home.tsx:62 to track the height-derived width, e.g. "(max-width:560px) 60px, (max-width:1024px) clamp(220px, 37vw, 310px), 420px" (or a plain 40vw).
- **Evidence:** `home/base-lt-0768x1024-dpr2-fp.png` · `home/base-lt-0561x0900-dpr2-fp.png` · app/globals.css:1466 @media(max-width:1024px) .nk-hero-media{min-height:clamp(300px,42vw,400px)}
- *RB-17 · confidence 0.8 · measured*

**RSP-054 · MEDIUM** — overflow-wrap:anywhere on the hero H1 orphans punctuation / splits words unhyphenated >560px (901–1120px)

- **What:** '.nk-h-hero' carries overflow-wrap:anywhere at every width, but hyphens:auto only <=560px. In the two-column hero band (901-1024) the token 'Issinuomokite,' is a hair wider than the text column, so 'anywhere' breaks between the 'e' and the comma - at 980/981 line 3 of the H1 starts with ', o ne pirkite.'. In the 1025-1120 band (see the ladder-hole finding) the same rule produces the bare mid-word split 'Issinuomoki|te'.
- **Why:** A leading comma / unhyphenated mid-word break on the brand headline is a typographic defect visible to every LT tablet/small-laptop visitor; 'anywhere' is an overflow escape hatch, not a wrap policy for display type.
- **Fix:** On .nk-h-hero (app/globals.css:254) replace overflow-wrap:anywhere with overflow-wrap:normal + hyphens:auto (move the :1927 hyphens rule out of the <=560 block, keep lang="lt" on <html> driving the hyphenation dictionary); keep 'anywhere' only as a last-resort on user-generated strings.
- **Evidence:** `home/base-lt-0980x0900-fp.png` · `home/base-lt-0981x0900-fp.png` · `home/base-lt-1119x0800-fp.png` · app/globals.css:254 .nk-h-hero{text-wrap:balance;overflow-wrap:anywhere}; app/globals.css:1927 @media(max-width:560px) .nk-h-hero{hyphens:auto}
- *RB-10 · confidence 0.75 · visual*

**RSP-057 · MEDIUM** — Hero LCP phone `sizes` claims 80vw across 561-1024 but renders at ~285-430 CSS px (561–1024px, locales: en, lt)

- **What:** sections-home.tsx:62 sets sizes="(max-width: 560px) 60px, (max-width: 1024px) 80vw, 420px" with `preload`. Measured in shots: stacked hero at 900 renders the phone ~285px wide; two-col at 1024 ~430px. 80vw resolves to 615-820px, so the preloaded LCP candidate is ~1.9-2.5x linear (≈4-6x bytes) larger than needed — worst exactly where it's preloaded on tablet radios; at dpr2 an iPad requests a ~1300-1640w candidate for a ~570-860 device-px slot.
- **Why:** RB-17: sizes must match rendered width per band; over-fetching the preloaded LCP asset directly inflates LCP on mid-tier tablets, a core 2026 CWV practice.
- **Fix:** Tighten the middle slot in sections-home.tsx:62 to the actual rendered widths, e.g. sizes="(max-width:560px) 60px, (max-width:900px) 360px, (max-width:1024px) 440px, 420px" (derive from height:112-118% of the .nk-hero-media clamp × the 714/968 aspect).
- **Evidence:** `home/base-lt-0900x1280-dpr2-vp.png` · `home/base-lt-1024x0768-vp.png` · app/globals.css:1466 .nk-hero-media{min-height:clamp(300px,42vw,400px)} (stacked band); app/globals.css:1474 .nk-hero-phone{height:112%!important} (901-1024)
- *RB-17 · confidence 0.75 · measured*

**RSP-061 · MEDIUM** — Hero city listbox (11 options, ~520px) opens upward with no max-height or internal scroll (361–430px, state: city-picker-open; locales: en, lt; visible only >=701px-tall viewports (picker hidden below that))

- **What:** The hero MIESTAS listbox renders 'All cities' + 10 LT_CITIES options at ~44px each plus heading (~520px total), positioned bottom:calc(100%+12px) above the trigger, with no max-height and no overflow:auto (globals.css:615/628). On an 800px-tall in-band viewport, if the user taps the trigger while it sits in the upper half of the screen, the top options extend past the viewport top; the page must be scrolled while the listbox is open (mousedown-outside closes it, so a stray tap during that recovery dismisses the picker).
- **Why:** Overlays taller than the viewport must scroll internally (RB-23); a keyboard/switch user arrowing to 'Vilnius' can move focus to an off-screen option with no scroll affordance.
- **Fix:** Add max-height:min(56dvh,480px);overflow:auto to .nk-citypick--hero .nk-citypick__panel (globals.css:628), or flip to below-trigger placement when space above is short.
- **Evidence:** `home/base-lt-0361x0800-dpr2-vp.png` · app/globals.css:628 .nk-citypick--hero .nk-citypick__panel{bottom:calc(100% + 12px)}; app/globals.css:615 .nk-citypick__panel (no max-height/overflow)
- *RB-23 · confidence 0.7 · code-inferred*

**RSP-062 · MEDIUM** — Hero H1 jumps ~20% (61.4px → 73.8px) crossing 1024→1025, exceeding the 15% seam budget (1024–1025px, locales: en, lt)

- **What:** The 901-1024 block caps the H1 at 6vw (61.4px at 1024); at 1025 the base --nk-fs-hero (7.2vw = 73.8px) resumes because the :lang(lt) tempering rule only applies ≥1121. Same cliff in both locales (the lang rule doesn't cover 1025-1120 and EN has no temper at all). Layout stays two-column across the seam, so the type jump is the only change — a +20.2% cliff.
- **Why:** RB-05: adjacent-breakpoint type deltas >15% read as a bug when a user resizes or rotates (iPad Pro portrait 1024 → just-wider laptop window); everything else in the hero is continuous.
- **Fix:** Extend the tempered clamp through 1120: change the :lang(lt) rule at globals.css:1445 to min-width:1025px with clamp(44px,6.2vw,70px), and give EN the same intermediate step (or retarget --nk-fs-hero to a single continuous clamp like clamp(44px,6vw,80px)).
- **Evidence:** `home/base-lt-1024x0768-vp.png` · app/globals.css:1477 .nk-hero-panel .nk-h-hero{font-size:clamp(44px,6vw,64px)} (901-1024); app/globals.css:228 --nk-fs-hero: clamp(44px,7.2vw,92px) (base, resumes at 1025)
- *RB-05 · confidence 0.7 · code-inferred*

**RSP-063 · MEDIUM** — Hero LCP phone declares sizes 420px but renders ~630px wide at desktop widths (≥1537px, locales: en, lt)

- **What:** sections-home.tsx:62 — <Image className="nk-hero-phone" … sizes="(max-width: 560px) 60px, (max-width: 1024px) 80vw, 420px">. The image is height-driven (height:118% of the hero panel; panel measured ~817px tall at 1920 → image ~851px tall → width = 851 × 714/968 ≈ 628 CSS px; similar at all B8 widths since the panel caps). The desktop slot is under-declared by ~50%.
- **Why:** next/image picks srcset candidates from sizes × DPR. At DPR1 the 640w candidate coincidentally covers 628px, but at DPR1.5 (scaled 4K Windows — mainstream) it requests 640w for a ~942px need (1.47x upscale) and at DPR2 1080w for ~1256px (1.16x upscale): the flagship hero/LCP render goes soft exactly on the highest-end screens this B8 band represents.
- **Fix:** Change the final sizes term to ~640px (measured rendered width, e.g. sizes="(max-width: 560px) 60px, (max-width: 1024px) 80vw, 640px") in app/components/sections-home.tsx:62.
- **Evidence:** `home/base-lt-1920x1080-vp.png` · `home/base-lt-3840x2160-vp.png` · app/globals.css:1441 .nk-hero-panel; app/globals.css:338 .nk-hero-pattern
- *RB-17 · confidence 0.7 · measured*

**RSP-064 · MEDIUM** — LT hero H1 has a 19% type-size cliff at the 1120→1121 seam (code-derived) (1025–1121px)

- **What:** For 1025-1120 no override reaches .nk-h-hero, so LT uses the raw token 7.2vw (80.6px at 1120); at 1121 the :lang(lt) rule (globals.css:1446) kicks in at 5.8vw = 65.0px. That is a 15.6px (19.4%) instant drop across 1px of viewport, LT only — EN stays continuous. Derived from the CSS cascade; my band's shots (1281+) sit safely inside the capped range, so this anchors just below B7.
- **Why:** RB-05 flags type cliffs >15% across adjacent widths; a resize or split-screen user sees the headline visibly snap sizes.
- **Fix:** Extend the :lang(lt) media query at globals.css:1445 down to min-width:1025px (the 901-1024 block already caps at 64px, keeping the ramp monotonic), or fold the LT cap into a single clamp on the token.
- **Evidence:** `home/base-lt-1281x0800-vp.png` · app/globals.css:1445-1447 :lang(lt) .nk-hero-panel .nk-h-hero at min-width:1121 → 5.8vw; app/globals.css:228 --nk-fs-hero 7.2vw applies at 1025-1120 (the 901-1024 block at :1477 doesn't cover it)
- *RB-05 · confidence 0.65 · code-inferred*

**RSP-067 · POLISH** — Hero H1 jumps 38px→44px across the 560/561 seam — the two clamp ranges don't meet (560–561px, locales: en, lt)

- **What:** At 560px the ≤560 rule caps the H1 at 38px (clamp(32px,9.6vw,38px), globals.css:1519); at 561px the 561-900 rule floors it at 44px (clamp(44px,6vw,56px) — 6vw=33.7px so the 44px min binds, globals.css:1497). A 6px (16%) discontinuity at 1px of width. Partially deliberate (the hero drops its device mock at the same cliff), but the clamp bounds could still meet.
- **Why:** clamp() ladders are meant to interpolate; a type pop at a resize/rotation boundary reads as a glitch (fold phones cross this exact line when unfolding).
- **Fix:** Raise the ≤560 cap toward 44px (e.g. clamp(32px,9.6vw,42px)) or lower the 561+ floor to ~40px so the curves nearly meet at the seam.
- **Evidence:** app/globals.css:1519 .nk-h-hero ≤560 clamp(32px,9.6vw,38px); app/globals.css:1497 561-900 clamp(44px,6vw,56px)
- *RB-09 · confidence 0.9 · code-inferred*

**RSP-070 · POLISH** — Punctuation orphans on display headings under injected word spacing (320–430px, state: textspacing)

- **What:** At 320 under text spacing the hero H1 wraps so a line begins with a bare comma (', o ne pirkite.') and the app-CTA banner title wraps its final period onto its own line ('programeleje' / '.'). Base-state renders are clean; only the stress state produces the orphans.
- **Why:** Craft-level: text-wrap:balance/pretty (or joining the punctuation to the preceding word with a no-break span) keeps display type presentable even under user-injected spacing.
- **Fix:** Add text-wrap:balance to the hero H1 / CTA banner title styles, or emit the trailing '.'/', ' joined via non-breaking space in the dict copy.
- **Evidence:** `home/textspacing-lt-0320x0568-dpr2-fp.png` · app/globals.css:1576 .nk-hero-band__lead (no text-wrap policy on display headings)
- *RB-10 · confidence 0.85 · visual*

**RSP-071 · POLISH** — Hero H1 steps 38px -> 44px (+15.8%) across the 560/561 seam (560–561px)

- **What:** At 560 the compact skin caps the H1 at 38px; at 561 the tablet rule's clamp() floor of 44px applies (6vw=33.7px < 44px min), so one pixel of width buys a +15.8% type jump - just over the 15% cliff bar. The simultaneous appearance of the phone mockup/QR at 561 is deliberate and documented, but the type floor makes the seam louder than it needs to be.
- **Why:** RB-05 type-cliff threshold; users resizing/rotating near this seam see the headline lurch.
- **Fix:** Lower the 561-900 clamp minimum to 40px (app/globals.css:1493) so the step lands ~5%.
- **Evidence:** `home/base-lt-0560x0900-dpr2-fp.png` · `home/base-lt-0561x0900-dpr2-fp.png` · app/globals.css:1515 @media(max-width:560px) .nk-h-hero clamp(32px,9.6vw,38px); app/globals.css:1493 @media(561-900) .nk-h-hero clamp(44px,6vw,56px)
- *RB-05 · confidence 0.85 · measured*

**RSP-073 · POLISH** — Stacked hero-search city trigger and Ieškoti button sit 4px apart (below the 8px touch-spacing floor) (320–560px, locales: en, lt; viewports taller than 700px (city row hidden on shorter ones))

- **What:** In the stacked <=560 search card, the full-width 'Visi miestai' city trigger and the 48px 'Ieškoti' submit are separated by only margin-top:4px (auto-metric tightPair gap=4 on 344/359/360 shots). Both targets meet the 44px size floor, but the spacing is under the preferred >=8px separation for adjacent touch targets.
- **Why:** A thumb aiming for the city picker's bottom half can hit the submit and fire a search with an empty query; 8px is the house/2026 spacing floor for stacked full-width controls.
- **Fix:** Bump margin-top to 8px at app/globals.css:1532 (rhythm tokens allow --nk-gap-xs if one exists).
- **Evidence:** `home/base-lt-0360x0800-dpr2-vp.png` · `home/base-lt-0344x0882-dpr2-vp.png` · app/globals.css:1532 .nk-search .nk-btn margin-top:4px
- *RB-12 · confidence 0.85 · measured*

**RSP-074 · POLISH** — Hero H1 carries 7 competing font-size rules on top of its fluid token (361–430px, locales: en, lt)

- **What:** .nk-h-hero has a fluid token (--nk-fs-hero, globals.css:228) plus stepped re-declarations at :1446 (LT-only), :1477, :1492, :1514 (<=560), :1542 (fixed 33px <=360), and :1814 (<=560 x <=700h) - a double type system where band-specific steps fight the clamp. The <=360 rule pins a FIXED 33px, abandoning fluidity right where headroom is scarcest (at 361 the clamp yields 34.7px, so a 1px width change jumps the H1 1.7px).
- **Why:** RB-09: stepped overrides on a clamp()-driven element make every future type change a 7-location edit and create micro-cliffs at seam widths.
- **Fix:** Collapse the <=560 ladder into one clamp with vw slope covering 320-560 (e.g. clamp(30px, 8.4vw + 3px, 38px)) and delete globals.css:1542; keep at most the LT-specific desktop override.
- **Evidence:** `home/base-lt-0361x0800-dpr2-vp.png` · `home/base-lt-0430x0932-dpr2-vp.png` · app/globals.css:228 --nk-fs-hero clamp; app/globals.css:1514 .nk-h-hero 32-38px
- *RB-09 · confidence 0.85 · code-inferred*

**RSP-075 · POLISH** — EN hero H1 dangles the article 'a' at a line end at 430px despite text-wrap:balance (400–430px, locales: en)

- **What:** At 430px EN the H1 wraps 'Need it for a / day? Rent it / instead of buying.' - the article 'a' dangles at the end of line 1, splitting the unit 'a day' across lines. balance equalizes line lengths but cannot respect the phrase boundary.
- **Why:** Display-heading wrap quality on the brand's first line; 2026 craft standard is no dangling articles/prepositions on hero type.
- **Fix:** Join the phrase with a non-breaking space in the EN dictionary ('for\u00A0a\u00A0day') or rephrase; LT title wraps cleanly.
- **Evidence:** `home/base-en-0430x0932-dpr2-fp.png` · app/globals.css:254 .nk-h-hero{text-wrap:balance}
- *RB-10 · confidence 0.85 · visual*

**RSP-076 · POLISH** — 4-5px inter-target gaps in stacked hero search and nav drawer, under the 8px touch-spacing floor (431–560px, locales: en, lt)

- **What:** Auto-metrics + shots: city-picker trigger to Ieskoti submit gap is 4px in the stacked <=560 search (button margin-top:4px, globals.css:1532); the drawer menu items sit 4px apart (drawer-inner gap:4px, globals.css:584); at 560 the submit-to-input pair measures 5px. All adjacent targets are themselves >=44-48px tall.
- **Why:** 8px minimum spacing between touch targets is the stated bar; 4px boundaries between the primary submit and the city listbox trigger make edge-taps ambiguous, though large target heights keep real-world risk low.
- **Fix:** Bump .nk-search .nk-btn margin-top to 8px and .nk-nav-drawer-inner gap to 8px (or add 2px transparent borders as spacing).
- **Evidence:** `home/base-lt-0431x0932-dpr2-vp.png` · `home/base-lt-0560x0900-dpr2-vp.png` · app/globals.css:1532 .nk-search .nk-btn{...margin-top:4px} (max-width:560px); app/globals.css:584 .nk-nav-drawer-inner{...gap:4px}
- *RB-12 · confidence 0.85 · measured*

**RSP-080 · POLISH** — Hero headline size is defined in six places (fluid token + five stepped band overrides) (344–1536px, locales: en, lt)

- **What:** --nk-fs-hero is a clamp() token, but .nk-h-hero's effective size is re-declared per band: :lang(lt) clamp at >=1121 (1446), clamp(44,6vw,64) at 901-1024 (1477), clamp(44,6vw,56) at 561-900 (1492), clamp(32,9.6vw,38) at <=560 (1514) and 33px at <=360 (1542). The token only actually governs 1025-1120 (and EN >=1121). This double system already produced the LT 19% cliff at 1121 and the EN/LT divergence reported separately.
- **Why:** RB-09: a fluid token fought by stepped per-band overrides is two competing sizing systems — every future tweak must be made in six places and seam regressions are easy to reintroduce.
- **Fix:** Collapse to one (or two locale-specific) clamp() expressions on --nk-fs-hero — e.g. clamp(33px, 3vw + 22px, 72px) tuned to pass through today's checkpoints — and delete the band overrides.
- **Evidence:** `home/base-lt-1281x0800-vp.png` · `home/base-en-1440x0900-fp.png` · app/globals.css:228 --nk-fs-hero token; app/globals.css:1446, :1477, :1492, :1514, :1542 — five band-scoped re-definitions of the hero size
- *RB-09 · confidence 0.85 · code-inferred*

**RSP-093 · POLISH** — Hero H1 snaps from a fluid clamp to a fixed 33px at the 360px seam (355–366px, locales: en, lt)

- **What:** At 361px the ≤560 clamp yields 34.66px; at 360px the tiny-phone rule pins 33px — a 1.7px downward jump that then stays constant to 320px (where the clamp itself would have given 32px anyway, making the fixed override nearly redundant but seam-creating).
- **Why:** The fixed value re-introduces the step the clamp exists to remove; crossing 360 (foldables, zoom) shows a small headline pop.
- **Fix:** Delete globals.css:1547's font-size (the ≤560 clamp already reaches 32px at 320px), or retune the ≤560 clamp floor if 33px at 360 was the goal.
- **Evidence:** app/globals.css:1547 ≤360 .nk-h-hero{font-size:33px} (fixed); app/globals.css:1519 ≤560 .nk-h-hero{font-size:clamp(32px,9.6vw,38px)}
- *RB-09 · confidence 0.75 · code-inferred*

**RSP-094 · POLISH** — Hero phone sizes claims 80vw on tablets; actual rendered width is ~36-41vw (561–1024px, locales: en, lt)

- **What:** sections-home.tsx:62 declares sizes="...(max-width: 1024px) 80vw, 420px" but the image's width is driven by height (height:118% of .nk-hero-media, width:auto, ratio 714/968): at 768px viewport the media is ~322px tall → image ~380px tall → ~280px wide (36vw); in the 901-1024 2-col band ~413px (41vw). 80vw roughly doubles the requested rendition width (~4x pixels). Impact is capped because the source is only 714px wide (Next.js will not upscale), so the realistic waste is fetching the 714w cap instead of a ~560w rendition on DPR2 tablets.
- **Why:** Wasted bytes on the LCP-adjacent asset for tablets; sizes should describe rendered width.
- **Fix:** Change the middle branch in sections-home.tsx:62 to ~44vw: sizes="(max-width: 560px) 60px, (max-width: 1024px) 44vw, 420px".
- **Evidence:** app/globals.css:1471 .nk-hero-media ≤1024 min-height clamp(300px,42vw,400px); app/globals.css:1478 901-1024 2-col band
- *RB-17 · confidence 0.75 · code-inferred*

**RSP-098 · POLISH** — EN home search placeholder truncates to 'What would you like to r…' just above the 560 seam (561–660px, locales: en; any)

- **What:** At 561px the single-row hero search pill (input + inline Search button) leaves too little width for the EN placeholder, which ellipsizes mid-word ('What would you like to r…'). LT ('Ką norite išsinuomoti?') fits. Below 561 the stacked two-field form takes over and the full placeholder shows again — so the truncation lives only in the 561-~660 window.
- **Why:** A truncated prompt in the primary conversion input looks unfinished; the seam should hand over before the copy degrades.
- **Fix:** Provide a short EN placeholder variant for the 561-660 window (dict-driven, like the existing nk-narrow-only pattern) or extend the stacked form up to ~660px.
- **Evidence:** `home/nav-cta-stage-en-0561x0900-dpr2-vp.png` · `home/nav-cta-stage-lt-0559x0900-dpr2-vp.png` · app/globals.css:1087 .nk-searchfield input
- *RB-01 · confidence 0.7 · visual*

### rail

**RSP-006 · HIGH** — Categories snap rail at ~745-811px shows 3 clean tiles with zero continuation cue — 7 of 10 categories undiscoverable (745–768px, locales: en, lt; any)

- **What:** The home categories shelf is a fixed-224px-tile snap rail below 980px. At 768 (iPad portrait): gutter = 6vw = 46px; 3 tiles + 2 gaps = 224*3 + 14*2 = 700px = exactly the content width, so tile 4 starts at x=760 and its 8px sliver falls entirely inside the 46px edge fade mask (mask-image fades the last var(--nk-gutter)). Result: the rail renders as a complete-looking 3-tile grid — no partial tile, no scrollbar (scrollbar-width:none), no arrows/dots. Solving 224x + 14(x-1) + gutter(v) = v shows the no-peek window spans roughly 745-811px. At 561 and 700 a cut tile peeks correctly (verified).
- **Why:** iPad portrait (768) is a mainstream viewport; a leading 2026 marketplace would not let its primary browse entry point silently hide 70% of its categories. Users see 'Popular rental categories' = Transport, Photo, Tools and assume that's the catalog; the only recovery is the small 'Visos kategorijos' link. The rail also has no overscroll-behavior-x containment and no scroll-snap-stop policy.
- **Fix:** Make the peek structural instead of coincidental: size rail tiles fractionally, e.g. .nk-cats-shelf > *{flex:0 0 min(224px, calc((100% - 2*14px)/3.4))} (app/globals.css:2061), or narrow the right fade to calc(var(--nk-gutter)/2) so a sliver survives (app/globals.css:2058). Add overscroll-behavior-x:contain to .nk-cats-shelf (app/globals.css:2054) and consider a tile-count/arrow affordance in the SectionHead.
- **Evidence:** `home/base-lt-0768x1024-dpr2-fp.png` · `home/base-lt-0561x0900-dpr2-fp.png` · `home/base-en-0768x1024-dpr2-fp.png` · app/globals.css:2054 .nk-cats-shelf (snap rail ≤980); app/globals.css:2058 .nk-cats-shelf mask-image gutter fade
- *RB-14 · confidence 0.92 · measured*

**RSP-024 · MEDIUM** — Home category snap rail has no overscroll-behavior containment and no scroll-snap-stop policy (431–560px, locales: en, lt)

- **What:** The 10-tile categories shelf is a mandatory x-snap scroller (globals.css:2054-2061, phone card width min(46vw,180px)). It declares neither overscroll-behavior-x:contain (horizontal overscroll at either end chains to the page / can trigger browser swipe-navigation gestures) nor scroll-snap-stop on children (a hard fling can skip most of the 10 tiles). The drawer got overscroll-behavior:contain (globals.css:584) but none of the three snap rails did.
- **Why:** 2026 snap-rail ergonomics require end containment and a deliberate snap-stop decision; on iOS/Android an end-of-rail swipe bleeding into history navigation on the install-funnel home page is a real cost.
- **Fix:** Add overscroll-behavior-x:contain to .nk-cats-shelf (and the sibling rails .nk-catrail:1136, .nk-grid-4--rail:1950); consider scroll-snap-stop:always on the first/last tile or normal-with-proximity if skipping is intended.
- **Evidence:** `home/base-lt-0431x0932-dpr2-fp.png` · `home/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:2054 .nk-cats-shelf{overflow-x:auto;scroll-snap-type:x mandatory;...} (max-width:980px); app/globals.css:2061 .nk-cats-shelf > *{flex:0 0 224px;scroll-snap-align:start}
- *RB-14 · confidence 0.9 · code-inferred*

**RSP-042 · MEDIUM** — Home category snap rail lacks overscroll containment and a scroll-snap-stop policy (361–430px, locales: en, lt)

- **What:** Both edge-bleed rails (.nk-cats-shelf on home, .nk-grid-4--rail on detail) declare scroll-snap-type:x mandatory with hidden scrollbars but no overscroll-behavior-x:contain and no scroll-snap-stop. Grep confirms zero occurrences of either property on the rails (the only overscroll-behavior in the file is the nav drawer's, line 584).
- **Why:** Without overscroll-behavior-x:contain, a swipe past the rail's start edge chains into the browser's horizontal back-gesture on iOS/Android - a navigation-loss trap on a 10-card rail users will flick hard. Without scroll-snap-stop:always (or a deliberate 'normal' decision), momentum flicks skip 3-4 tiles at 46vw tile widths.
- **Fix:** Add overscroll-behavior-x:contain to .nk-cats-shelf (globals.css:2054) and .nk-grid-4--rail (globals.css:1950); decide scroll-snap-stop per rail (always for the 46vw category tiles). The code comment at globals.css:2047 already flags the shared-utility cleanup - fold this in.
- **Evidence:** `home/base-lt-0390x0844-dpr2-fp.png` · `home/base-lt-0361x0800-dpr2-fp.png` · app/globals.css:2054 .nk-cats-shelf (snap rail); app/globals.css:1950 .nk-grid-4--rail (snap rail)
- *RB-14 · confidence 0.85 · code-inferred*

**RSP-047 · MEDIUM** — Home categories snap rail: hidden scrollbar, no overscroll containment, no scroll-snap-stop (769–980px, locales: en, lt)

- **What:** At ≤980 the 10-tile categories shelf becomes an edge-bleed snap rail with `scrollbar-width:none` / hidden webkit scrollbar (globals.css:2059-2060). It sets `scroll-snap-type:x mandatory` but no `scroll-snap-stop` policy and no `overscroll-behavior-x:contain`. Continuation affordance is only the mask-fade + a clipped 4th tile; there is no scrollbar, arrows, or index for mouse users in a 769-980px window, and horizontal overscroll at the rail start can chain into browser back-swipe navigation on trackpads.
- **Why:** RB-14: snap rails need a snap-stop policy, overscroll containment and an operable affordance. 6 of 10 categories are invisible without a gesture; a mouse user in a narrow window has no visible way to reach them other than the 'Visos kategorijos' link.
- **Fix:** Add `overscroll-behavior-x:contain` and `scroll-snap-stop:always` (or document normal) to .nk-cats-shelf (globals.css:2054); consider showing a thin scrollbar under `@media (hover:hover) and (pointer:fine)` or adding prev/next chevrons like 2026 marketplace shelf idioms.
- **Evidence:** `home/base-lt-0901x1280-fp.png` · `home/base-lt-0980x0900-fp.png` · `home/base-lt-0912x1368-fp.png` · app/globals.css:2054-2061 .nk-cats-shelf (≤980 rail: scroll-snap-type:x mandatory; scrollbar-width:none; no overscroll-behavior; no scroll-snap-stop)
- *RB-14 · confidence 0.85 · code-inferred*

**RSP-050 · MEDIUM** — Home category shelf at 561-980px hides its scrollbar with no prev/next affordance — mouse users can't discover or easily reach cards 5-10 (561–980px, state: base, mouse-input; locales: en, lt)

- **What:** ≤980px the home Categories band becomes a horizontal snap rail (.nk-cats-shelf) with the scrollbar hidden (scrollbar-width:none + ::-webkit-scrollbar{display:none}, globals.css:2062-2063) and no arrow/paddle buttons rendered by the Categories component (sections.tsx:498-525). The 561-980 range is not touch-only: it includes half-screen desktop windows and mouse-driven small laptops, where the only ways to scroll are Tab-through-links or shift+wheel — neither discoverable. Only ~3-4 of the 10 curated tiles are visible; the mask fade is the sole hint more exist.
- **Why:** Hover/touch parity (hidden-scrollbar rails are a touch idiom) applied to a width band that mainstream mouse users occupy; 6 of 10 categories become effectively unreachable content for them — below the 2026 marketplace bar for a primary nav surface.
- **Fix:** Either keep the scrollbar visible on non-touch (@media(hover:hover) and (pointer:fine){.nk-cats-shelf{scrollbar-width:thin}}) or add prev/next paddle buttons to the shelf (the SectionHead action slot already fits the pattern); alternatively wrap the rail to a 2-row grid for 701-980.
- **Evidence:** app/globals.css:2059 .nk-cats-shelf (≤980: overflow-x:auto; scrollbar-width:none; ::-webkit-scrollbar display:none)
- *RB-14 · confidence 0.8 · code-inferred*

**RSP-051 · MEDIUM** — Category tile skin is viewport-gated but tiles render at 3 container sizes — 224px rail cards get the desktop skin (561–980px)

- **What:** The same .nk-catv2 tile renders in the all-categories grid (~250-330px wide), the home shelf rail (fixed 224px at 561-980, min(46vw,180px) ≤560) and the phone 2-up grid (~160px). Its compact anatomy (smaller chip, hidden examples line, tighter watermark) is keyed to the VIEWPORT (≤560), not the tile's own width, so at 561-980 the 224×192px rail cards carry the full desktop padding clamp(16px,1.5vw,22px), 48px chip, 20px/25px 2-line title AND the 13.5px examples line inside a shorter (192px vs 208px) fixed-height tile with overflow:hidden — the meta block can clip against the chip row.
- **Why:** Classic RB-03: one component, three container contexts, one viewport switch. Tablet users see the most crowded version of the tile. @container is baseline-stable in 2026 and this component already has clean anatomy hooks.
- **Fix:** Make .nk-grid-cats/.nk-cats-shelf container-type:inline-size on the tile wrapper and move the :2026-2033 compact rules into @container (max-width:200px) (keeping the viewport block as fallback), or at minimum extend the compact skin to .nk-cats-shelf .nk-catv2 at ≤980.
- **Evidence:** app/globals.css:2059-2068 .nk-cats-shelf ≤980 (224px rail cards, desktop tile skin); app/globals.css:2026-2033 .nk-catv2 compact skin (viewport-gated ≤560 only)
- *RB-03 · confidence 0.8 · code-inferred*

**RSP-072 · POLISH** — Home category snap rail lacks overscroll-behavior-x containment and an explicit scroll-snap-stop policy (320–980px, locales: en, lt)

- **What:** The 10-tile category shelf is a mandatory x-snap rail bleeding to the viewport edge. It has good peek (partial tile + fade mask visible at 320-360) but no overscroll-behavior-x:contain — swiping past either end can chain into browser back/forward navigation gestures — and no scroll-snap-stop declaration, so fast flicks can skip most of the 10 tiles. The same idiom repeats in .nk-catrail and .nk-grid-4--rail (already noted in-code as a shared-utility candidate).
- **Why:** 2026 snap-rail ergonomics expect deliberate containment + snap-stop policy on edge-bleed rails, especially on iOS where horizontal overscroll near the screen edge triggers history navigation.
- **Fix:** Add overscroll-behavior-x:contain to .nk-cats-shelf (app/globals.css:2054), .nk-catrail (1136) and .nk-grid-4--rail (1950); decide scroll-snap-stop:normal (documented) or always on the first/last child.
- **Evidence:** `home/base-lt-0320x0568-dpr2-fp.png` · `home/base-lt-0360x0800-dpr2-fp.png` · app/globals.css:2054 .nk-cats-shelf (scroll-snap-type:x mandatory, no overscroll-behavior-x, no scroll-snap-stop); app/globals.css:1950 .nk-grid-4--rail same idiom
- *RB-14 · confidence 0.85 · code-inferred*

**RSP-086 · POLISH** — Edge-bleed rails and container gutter omit env(safe-area-inset-left/right) (361–430px, locales: en, lt)

- **What:** The edge-to-edge snap rails (.nk-cats-shelf, .nk-grid-4--rail) and .nk-container pad their edges with --nk-gutter alone; no max(gutter, env(safe-area-inset-left/right)) anywhere except the lightbox (globals.css:1278-1279). Today it holds only by coincidence: 6vw of an 844px landscape viewport (~50px) happens to exceed the ~44px notch inset.
- **Why:** RB-08 requires safe-area completeness on every snap-rail edge and fixed bar; relying on a vw-derived gutter incidentally clearing the notch is fragile (any future gutter compaction under 44px puts rail content under the housing in landscape).
- **Fix:** Define --nk-gutter-safe:max(var(--nk-gutter),env(safe-area-inset-left),env(safe-area-inset-right)) and use it in .nk-container (337) and both rails' margin/padding/scroll-padding-inline (2055-2056, 1950).
- **Evidence:** app/globals.css:203 --nk-gutter:clamp(20px,6vw,82px); app/globals.css:2055 .nk-cats-shelf margin/padding-inline gutter
- *RB-08 · confidence 0.8 · code-inferred*

**RSP-087 · POLISH** — Edge-bleed rails and container gutter omit env(safe-area-inset-left/right) (431–560px, locales: en, lt)

- **What:** --nk-gutter (globals.css:203) is pure clamp() with no max(..., env(safe-area-inset-left/right)) term. The category shelf bleeds to the physical viewport edge (negative gutter margins, mask fade, scroll-padding = gutter), as do .nk-catrail and .nk-grid-4--rail. Bottom insets are handled everywhere (--nk-safe-bottom, drawer, sheets, mbar) but horizontal insets only inside the lightbox (:1278-1279).
- **Why:** On notched phones in landscape the rail's first/last snapped card and the page gutter can sit under the sensor housing; safe-area completeness requires left/right on every edge-bleed scroller, not just bottom on bars.
- **Fix:** Redefine --nk-gutter as max(clamp(20px,6vw,82px), env(safe-area-inset-left), env(safe-area-inset-right)) or add scroll-padding-inline:max(var(--nk-gutter), env(safe-area-inset-left)) to the three rails.
- **Evidence:** `home/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:203 --nk-gutter:clamp(20px,6vw,82px) (no safe-area term); app/globals.css:2055 .nk-cats-shelf margin-inline:calc(var(--nk-gutter)*-1);scroll-padding-inline:var(--nk-gutter)
- *RB-08 · confidence 0.8 · code-inferred*

**RSP-095 · POLISH** — Horizontal snap rails lack overscroll-behavior-x containment and a scroll-snap-stop policy (320–560px, locales: en, lt)

- **What:** All three phone rails — .nk-grid-4--rail (similar items, snap-type x mandatory), .nk-cats-shelf (home categories, snap mandatory) and .nk-catrail (filter chips, no snap) — omit overscroll-behavior-x:contain and scroll-snap-stop. End-of-rail swipes chain into the page's horizontal gesture space (browser back/forward swipe on iOS/Android), and fast flings on mandatory snap can skip multiple cards.
- **Why:** Rail end-traps and accidental history-swipe are the classic touch-carousel papercuts; 2026 practice is contain + snap-stop:always on mandatory-snap card rails.
- **Fix:** Add overscroll-behavior-x:contain to all three rail rules and scroll-snap-stop:always to .nk-grid-4--rail>* and .nk-cats-shelf>* (globals.css:1951-1953, 2057-2062, 1137).
- **Evidence:** `detail-full/base-lt-0320x0568-dpr2-fp.png` · `hub-sveikata/base-lt-0360x0800-dpr2-fp.png` · app/globals.css:1951 .nk-grid-4--rail (snap mandatory, no overscroll/snap-stop); app/globals.css:2057 .nk-cats-shelf
- *RB-14 · confidence 0.75 · code-inferred*

### city-picker-overlay

**RSP-009 · HIGH** — Hero city dropdown slides under sticky nav, hiding the active 'Visi miestai' option (430–560px, state: city-picker; clearly failing at 560x900; tangent (0px clearance) at 390x844)

- **What:** The hero city listbox always opens upward (bottom:calc(100%+12px)) with no max-height, no internal scroll and no collision handling. At 560x900 the ~490px-tall panel extends above the hero into the sticky nav zone: the 'PASIRINKITE MIESTĄ' heading and the active 'Visi miestai' option are rendered behind the nav bar (auto-metrics measured nk-nav-cta x citypick__opt.is-active overlap 820px², nk-nav-burger overlap 275px²) — the nav paints on top, so that option is invisible and untappable. At 390x844 the panel top is exactly tangent to the nav bottom (0px slack), so any slightly shorter hero (e.g. 400-560px widths where the H1 wraps to fewer lines) clips. HeroSearch.tsx:110-142 renders the panel; unlike the sibling FilterSelect (ui.tsx:494, maxHeight:min(60vh,480px) + overflowY:auto), this panel has neither.
- **Why:** A picker whose currently-selected option disappears under the header — and whose taps in that zone hit nav buttons instead — is broken overlay geometry on portrait phones/zoomed viewports; RB-23 requires overlays to fit or scroll internally.
- **Fix:** In globals.css:629 give .nk-citypick--hero .nk-citypick__panel max-height:min(56dvh, calc(100dvh - var(--nk-nav-h, 76px) - 90px)) plus overflow-y:auto; overscroll-behavior:contain (mirroring FilterSelect ui.tsx:494), or flip to direction:down when space above is insufficient.
- **Evidence:** `home/city-picker-lt-0560x0900-dpr2-vp.png` · `home/city-picker-lt-0390x0844-dpr2-vp.png` · app/globals.css:629 .nk-citypick--hero .nk-citypick__panel (bottom:calc(100% + 12px), no max-height); app/globals.css:616 .nk-citypick__panel z-index:60
- *RB-23 · confidence 0.85 · measured*

### cards

**RSP-014 · MEDIUM** — Offer-card category eyebrow is 9.5px uppercase and still truncates at 2-up widths (361–430px, locales: en, lt)

- **What:** The compact card skin forces the category eyebrow to 9.5px (from 10.5px base) with .14em tracking. At 361-430px the 2-up cards render 'ELEKTRONIKA IR TEC...' / 'ELECTRONICS & TECH' - sub-10px, letter-spaced, all-caps text that STILL ellipsizes for common LT category names. 9.5px is below any 2026 mobile legibility floor and the value is fixed px, so it does not respond to user font scaling (WCAG 1.4.4 via narrow-band equivalence).
- **Why:** Unreadable-and-truncated metadata on the flagship product cards reads as a rendering bug to users; shrinking below 10px to 'fit' and then ellipsizing anyway delivers the worst of both.
- **Fix:** In globals.css:1902 keep >=10.5-11px, drop tracking to .08em, or replace the text eyebrow with the category icon-only treatment on compact cards; long-term this is width-keyed (see the @container finding).
- **Evidence:** `home/base-lt-0390x0844-dpr2-fp.png` · `home/loading-detail-lt-0390x0844-dpr2-vp.png` · `home/base-lt-0361x0800-dpr2-fp.png` · app/globals.css:1902 .nk-offer__eyebrow{font-size:9.5px!important;letter-spacing:.14em!important}
- *RB-11 · confidence 0.95 · measured*

**RSP-015 · MEDIUM** — Favorite button on offer cards is 36x36 CSS px on phones, below the 44px target floor (431–560px, locales: en, lt)

- **What:** The heart button over each card photo is 42x42 at base (already under the house --nk-tap:44px token) and is further shrunk to 36x36!important in the <=560 compact skin, with no padding/pseudo-element hit-area expansion. Visible on every offer card in the 431/560 shots.
- **Why:** WCAG 2.5.8 / house token demands >=44px; this is a real tap target on the touchiest band (it opens the app-bridge modal). 36px invites mis-taps onto the card's stretched link, navigating instead of favoriting.
- **Fix:** Keep the visual disk 36px but expand the hit area to 44px, e.g. add ::after{content:"";position:absolute;inset:-4px} on .nk-fav (globals.css:1866/1915), or bump min sizes to var(--nk-tap).
- **Evidence:** `home/base-lt-0431x0932-dpr2-fp.png` · `home/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1915 .nk-offer .nk-fav{width:36px!important;height:36px!important} (max-width:560px); app/globals.css:1866 .nk-fav{width:42px;height:42px} (base)
- *RB-12 · confidence 0.95 · measured*

**RSP-016 · MEDIUM** — OfferCard image sizes="92vw" below 760px but the grid renders cards at ~46vw (2-up) (431–1280px, locales: en, lt)

- **What:** cards.tsx:59 declares sizes="(max-width: 760px) 92vw, (max-width:1100px) 46vw, 416px". Since the Quiet Luxe mobile layer (globals.css:1898) made phones a 2-up grid, the rendered card at 431px is ~186px wide and at 560px ~250px, yet the browser is told 92vw (397-515px). At DPR2 it fetches ~794-1030px-wide candidates where ~380-500px suffice: roughly 2x linear, ~4x pixel payload per photo in the flagship offers band.
- **Why:** The sizes attribute predates the 1-up-to-2-up mobile grid change and now systematically over-fetches on the slowest devices; wasted bytes on every home/feed card photo is below the 2026 image-art-direction bar.
- **Fix:** Update cards.tsx:59 to match the real ladder, e.g. sizes="(max-width: 560px) 46vw, (max-width: 700px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 24vw, 18vw" (or simply 46vw below 760).
- **Evidence:** `home/base-lt-0431x0932-dpr2-fp.png` · `home/base-lt-0560x0900-dpr2-fp.png` · `home/base-lt-1280x0800-fp.png` · app/globals.css:1898 @media(max-width:560px) .nk-grid-feed,.nk-grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}; app/globals.css:1461 561-700 .nk-grid-4 2-up
- *RB-17 · confidence 0.92 · measured*

**RSP-020 · MEDIUM** — OfferCard next/image sizes='92vw' is stale: phones render 2-up (~45vw) cards, ~4x pixel over-download (320–560px, locales: en, lt)

- **What:** app/components/cards.tsx:59 declares sizes="(max-width: 760px) 92vw, …", written for the old 1-up mobile column. Since the Quiet Luxe 2-up grid (globals.css:1898) a card at 360px viewport is ~155px wide (~43vw), but the browser selects a ~331px-CSS (662px at dpr2) source — roughly 2x linear / 4x pixel oversize for every card image on every phone.
- **Why:** Home renders 4+ listing photos above the fold region on mobile; 4x wasted image bytes on the highest-traffic band directly hurts LCP/data cost — sizes must match rendered width per band (2026 baseline).
- **Fix:** Update app/components/cards.tsx:59 to reflect the 2-up phone grid, e.g. sizes="(max-width: 560px) 46vw, (max-width: 760px) 92vw, (max-width: 1100px) 46vw, 416px" (and audit the 561-760 single/2-col case).
- **Evidence:** `home/base-lt-0320x0568-dpr2-fp.png` · `home/base-lt-0360x0800-dpr2-fp.png` · app/globals.css:1898 .nk-grid-feed,.nk-grid-4 2-up at <=560
- *RB-17 · confidence 0.9 · code-inferred*

**RSP-021 · MEDIUM** — Card category eyebrow drops to 9.5px (!important) on phones — sub-10px UI text, triple-defined (320–560px, locales: en, lt)

- **What:** The category eyebrow ('ELEKTRONIKA I…', 'TRANSPORTAS') is set 11.5px at :root scope (globals.css:704), re-stepped to 10.5px in the Quiet Luxe layer (1849), then forced to 9.5px!important with .14em tracking in the <=560 compact skin (1902). Auto-metric minFontPx=9.5 on every phone shot confirms it is the smallest text on the page; the design system's fluid --nk-fs-* tokens are bypassed for this element.
- **Why:** 9.5px uppercase letterspaced text is below the ~10px practical legibility floor on mobile and below the site's own token system; three competing step definitions with !important is the double-system anti-pattern RB-09 targets.
- **Fix:** Raise the compact eyebrow to >=10.5px (delete app/globals.css:1902 and let 1849 apply), or define a --nk-fs-eyebrow-card clamp() token and use it at all three sites.
- **Evidence:** `home/base-lt-0320x0568-dpr2-fp.png` · `home/base-lt-0360x0800-dpr2-fp.png` · app/globals.css:1902 .nk-offer__eyebrow 9.5px!important; app/globals.css:704 base 11.5px
- *RB-09 · confidence 0.9 · measured*

**RSP-022 · MEDIUM** — Offer photos request 92vw candidates while cards render ~46vw - ~4x pixel waste on phones (361–430px, locales: en, lt)

- **What:** OfferCard's next/image declares sizes="(max-width:760px) 92vw", but every grid the card lives in is 2-up at <=700px (globals.css:1898 and 1461): at 390px viewport a card slot is ~166 CSS px, yet the browser is told the image is ~359 CSS px and fetches a ~718px-wide candidate on dpr2 - roughly 4x the pixels needed, for 4-5 above-the-fold-adjacent images on the home band.
- **Why:** Doubles LCP-adjacent transfer and decode cost on the exact band (mobile) where the marketing site's install funnel lives; sizes must match rendered width per 2026 responsive-images practice.
- **Fix:** Change cards.tsx:59 to reflect the 2-up reality, e.g. sizes="(max-width: 700px) 46vw, (max-width: 1100px) 33vw, 416px" (and keep the rail context in mind: 68vw there - another argument for the container-query refactor or an explicit rail-specific sizes prop).
- **Evidence:** `home/base-lt-0390x0844-dpr2-fp.png` · app/components/cards.tsx:59 sizes="(max-width: 760px) 92vw, ..."; app/globals.css:1898 .nk-grid-4 2-up <=560
- *RB-17 · confidence 0.9 · measured*

**RSP-025 · MEDIUM** — Card category eyebrow drops to 9.5px uppercase tracked text on phones (page minimum font) (431–560px, locales: en, lt)

- **What:** The category eyebrow (e.g. 'ELEKTRONIKA IR TECHNOLOGIJOS', 'TRANSPORTAS') renders at 9.5px, uppercase, +.14em tracking at <=560 (auto-metric minFontPx=9.5 on all six shots). Long LT labels already truncate ('ELEKTRONIKA IR TECHN...' at 431).
- **Why:** Sub-10px uppercase micro-type on handheld screens is below any 2026 marketplace floor (peers keep metadata >=11-12px); it is the only scent line telling users what a card is when the photo is ambiguous.
- **Fix:** Raise the <=560 override to >=11px (globals.css:1902) and reclaim room by dropping letter-spacing to .08em, or replace the uppercase eyebrow with sentence-case 12px on phones.
- **Evidence:** `home/base-lt-0431x0932-dpr2-fp.png` · `home/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1902 .nk-offer__eyebrow{font-size:9.5px!important;letter-spacing:.14em!important} (max-width:560px); app/globals.css:1849 base .nk-offer__eyebrow 10.5px
- *RB-24 · confidence 0.9 · measured*

**RSP-028 · MEDIUM** — OfferCard and CategoryCard live in 3+ container contexts but size via viewport ladders; zero @container in repo (769–1024px, locales: en, lt)

- **What:** grep confirms no @container/container-type anywhere in globals.css. OfferCard renders in the home shelf (.nk-grid-4, 3-up at 701-1024), the feed grid (.nk-grid-feed) and the listing-detail similar rail (.nk-grid-4--rail); CategoryCard renders in the home snap rail (fixed 224px tiles ≤980), the home grid (981+) and the Kategorijos page grid. Each context re-tunes card internals via viewport media (e.g. the ≤560 offer-card compaction block globals.css:1898-1918 with per-element !important font sizes) even though card width — not viewport — is the real driver.
- **Why:** RB-03: components rendered at 224-330px in one context and 180-260px in another at the same viewport width get mismatched internal density; container queries would collapse the ladder blocks, remove the 980/981 and 1024/1025 seam special-casing, and make the card skins self-governing per the 2026 CQ baseline (all evergreen browsers).
- **Fix:** Add `container-type:inline-size` to the grid/rail wrappers and migrate the card-internal media blocks (globals.css:1898-1918, 2062-2068) to @container width steps; keep viewport media only for the grid column counts or replace those with repeat(auto-fill,minmax(var(--nk-card-min),1fr)).
- **Evidence:** `home/base-lt-0980x0900-fp.png` · `home/base-lt-0981x0900-fp.png` · `home/base-lt-1024x0768-fp.png` · app/globals.css:1458-1462 .nk-grid-4 5→4→3→2→1 viewport ladder; app/globals.css:1946-1952 .nk-grid-4--rail (same OfferCard, listing-page rail context)
- *RB-03 · confidence 0.9 · code-inferred*

**RSP-031 · MEDIUM** — OfferCard/CategoryCard render in multiple container contexts but size via viewport ladders (zero @container) (1281–1536px, locales: en, lt)

- **What:** OfferCard renders in at least three contexts — home 'Naujausi daiktai' shelf (.nk-grid-4, 5-up here, cards 199-247px), the /skelbimai feed grid (.nk-grid-feed, different ladder: 4-up at 1025-1280), and the listing-detail similar rail — all sized by viewport media queries. CategoryCard renders in the home curated shelf (.nk-grid-cats + .nk-cats-shelf, which flips to a snap rail <=700) and the /kategorijos full grid. The repo has zero @container rules, so each context needs its own parallel width ladder and the ladders have already diverged (offers go 5-up at 1281 while categories wait until 1441).
- **Why:** Duplicate per-context ladders are the root cause of seam divergence between identical cards on sibling pages; container queries (baseline since 2023) would size the card once by its actual slot width — the 2026-standard approach for a multi-surface card system.
- **Fix:** Add container-type:inline-size to .nk-grid-4/.nk-grid-feed/.nk-grid-cats cells (or the grids) and migrate the card-internal compact rules (e.g. globals.css:1907-1917 badge/pricebar steps) from viewport @media to @container width steps.
- **Evidence:** `home/base-lt-1281x0800-fp.png` · `home/base-lt-1441x0900-fp.png` · app/globals.css:1458-1462 .nk-grid-4 viewport ladder (5/4/3/2/1); app/globals.css:1096-1103 .nk-grid-cats viewport ladder (5/4/3/2)
- *RB-03 · confidence 0.9 · code-inferred*

**RSP-032 · MEDIUM** — OfferCard and CategoryCard render in 3+ container contexts but are sized only by viewport media (≥1537px, locales: en, lt)

- **What:** Repo has zero @container (grep confirmed). OfferCard renders in (a) home .nk-grid-4 — 5 cols under the 1920px .nk-container, card ~332px at cap; (b) feed .nk-grid-feed — 5 cols under the 1480px --nk-content-cap, card ~272px; (c) listing-detail .nk-grid-4--rail — 4 cols desktop / horizontal snap rail with 240px cards ≤560. CategoryCard renders in the home shelf (.nk-cats-shelf flex rail ≤980 / .nk-grid-cats grid above) and the categories-page .nk-grid-cats ladder. Every per-slot size/typography override (e.g. globals.css:1898-1917 compact card skin, :2054-2068 shelf sizes) keys off viewport width, so the same card gets different geometry only when the viewport — not its actual column — changes.
- **Why:** 2026 practice is component-level @container sizing for cards reused across grids/rails/shelves; the current viewport-media approach forces triplicated rail idioms (self-flagged in the CSS at :2048) and makes card internals wrong whenever a context narrows without the viewport narrowing (e.g. home 5-col slot at 332px vs feed 272px gets identical type despite 22% width delta).
- **Fix:** Add container-type: inline-size to the grid/rail wrappers (.nk-grid-4, .nk-grid-feed, .nk-grid-4--rail, .nk-cats-shelf, .nk-grid-cats) and migrate the card-internal width overrides (offer eyebrow/pricebar/badge compact skin, catv2 chip/sub rules) from @media to @container steps keyed on card width.
- **Evidence:** `home/base-lt-1920x1080-fp.png` · `home/base-lt-2560x1440-fp.png` · `home/base-lt-3840x2160-fp.png` · app/globals.css:1458 .nk-grid-4; app/globals.css:1182 .nk-grid-feed
- *RB-03 · confidence 0.9 · code-inferred*

**RSP-033 · MEDIUM** — OfferCard image sizes claims 92vw below 760px while cards render 2-3 per row (~28-43vw) — 2-4.6x oversized fetches (561–1536px, locales: en, lt)

- **What:** cards.tsx:59 sets sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 416px". In this band the home grid is 2-col at 561-700 and 3-col at 701-1024: at 700 a card is ~300px (43vw) but the browser is told 92vw → picks a ~1288px source at dpr2 vs ~600px needed; at 768 (3-col, ~205px card) 92vw…46vw seam sits at 760/761, so 701-760 gets 92vw for a 28vw card (3.2x linear, ~10x pixels). The sizes breakpoints (760, 1100) do not match the actual grid seams (560/700/1024/1280).
- **Why:** Four-plus-times the image bytes on tablet-class connections for the flagship 'Naujausi daiktai' band; RB-17 requires sizes to match rendered widths per band. Also the mismatch will silently worsen whenever the grid ladder changes, because the two ladders live in different files with different numbers.
- **Fix:** Align sizes to the grid ladder in cards.tsx:59, e.g. "(max-width:560px) 46vw, (max-width:700px) 44vw, (max-width:1024px) 30vw, (max-width:1280px) 23vw, 280px" (home/feed shares 2-col ≤560 via globals.css:1898).
- **Evidence:** `home/base-lt-0768x1024-dpr2-fp.png` · `home/base-lt-0700x0900-dpr2-vp.png` · `home/base-lt-1536x0826-fp.png` · app/globals.css:1461 .nk-grid-4 2-col 561-700; app/globals.css:1460 .nk-grid-4 3-col 701-1024
- *RB-17 · confidence 0.88 · measured*

**RSP-039 · MEDIUM** — Offer-card 'Pristatymas' delivery badge hard-clips (no ellipsis) on 2-up cards at <=344px (320–344px, state: base, textspacing)

- **What:** The delivery badge has white-space:nowrap and max-width:calc(100% - 52px) in the <=560 compact skin, but no overflow:hidden/text-overflow:ellipsis. At 320px the 2-up card is ~135px wide, badge max-width ~83px while 'Pristatymas' + icon needs ~91px, so the label is cut hard at the border edge (auto-metric flagged the badge clipped on 3 cards in base and textspacing at 320; it fits from ~350px up).
- **Why:** A trust signal that ends in a sheared glyph at iPhone SE / small-Android widths reads as a rendering bug on a flagship marketplace card; nowrap text in a max-width box must have an ellipsis policy.
- **Fix:** Add overflow:hidden;text-overflow:ellipsis to .nk-offer__badge (app/globals.css:730), or swap to an icon-only badge below ~360px.
- **Evidence:** `home/base-lt-0320x0568-dpr2-fp.png` · `home/textspacing-lt-0320x0568-dpr2-fp.png` · app/globals.css:730 .nk-offer__badge (white-space:nowrap, max-width:calc(100% - 76px), no overflow handling); app/globals.css:1917 .nk-offer__badge compact max-width:calc(100% - 52px)
- *RB-01 · confidence 0.85 · measured*

**RSP-040 · MEDIUM** — OfferCard/CategoryCard render in 3+ container contexts but size type via viewport @media — CQ migration target (320–1024px, locales: en, lt)

- **What:** OfferCard appears in the home 'Naujausi daiktai' shelf (.nk-grid-4), the feed grid (.nk-grid-feed) and the listing-detail similar rail (.nk-grid-4--rail, fixed 240px columns); CategoryCard appears in the home snap shelf (.nk-cats-shelf, 224px/180px tiles) and the categories-page grid. All card typography/geometry is switched by viewport width (@media max-width:560px compact skin with ~18 !important declarations), so a 240px rail card at a 900px viewport gets desktop-scale type while the same-width card at 360px gets the compact skin. The repo has zero @container rules.
- **Why:** Same component, same rendered width, different skin depending on page width — the exact inconsistency container queries eliminate; the !important layer also makes every future card change fight two systems.
- **Fix:** Make .nk-offer/.nk-cat containers (container-type:inline-size on grid/rail wrappers) and move the compact skin from @media(max-width:560px) (app/globals.css:1895) to @container (max-width:~200px) rules keyed on card width; this also retires most !important overrides.
- **Evidence:** `home/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1895-1930 @media(max-width:560px) compact card skin (!important); app/globals.css:1950 .nk-grid-4--rail auto-columns min(68%,240px)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-041 · MEDIUM** — OfferCard is sized by viewport @media across 3 container contexts - prime @container target (361–1280px, locales: en, lt)

- **What:** The repo has zero @container rules. OfferCard renders in (a) the home .nk-grid-4 2-up (~165px cards at 390), (b) the feed .nk-grid-feed 2-up, and (c) the listing-detail .nk-grid-4--rail carousel (~240px cards, min(68%,240px)). One viewport-gated compact skin (globals.css:1895-1920, ~20 !important declarations fighting the card's inline styles) restyles all three: the 240px rail card gets 9.5px eyebrows and 15px titles tuned for 165px grid cells, while a 561-700px viewport's 2-up cards (~260px) keep the full desktop type.
- **Why:** Card typography tracks the viewport, not the card's actual width, so identical card widths get different skins depending on page context - the seam bugs and the !important pile are the textbook cost that container queries remove.
- **Fix:** Declare container-type:inline-size on the grid/rail cells and convert the globals.css:1895-1920 block to @container (max-width:200px) style steps keyed to card width; drop the !important war by moving OfferCard's inline type styles into classes.
- **Evidence:** `home/base-lt-0390x0844-dpr2-fp.png` · `home/loading-detail-lt-0390x0844-dpr2-vp.png` · `home/base-lt-1280x0800-fp.png` · app/globals.css:1895 @media(max-width:560px) offer compact skin; app/globals.css:1898 .nk-grid-feed,.nk-grid-4{repeat(2,minmax(0,1fr))}
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-044 · MEDIUM** — OfferCard and CategoryCard size themselves via viewport media across >=3 container contexts each (431–560px, locales: en, lt)

- **What:** OfferCard renders in (a) the home offers grid .nk-grid-4 (5-up desktop to 2-up phone), (b) the feed grid .nk-grid-feed, (c) the listing-detail similar rail .nk-grid-4--rail (68%/240px carousel cells). CategoryCard renders in (a) the home shelf rail .nk-cats-shelf (224px/180px fixed cells) and (b) the kategorijos page grid .nk-grid-cats. Yet all their compact skins (title 15px, eyebrow 9.5px, fav 36px, chip 40px, sub hidden) key off @media(max-width:560px) with !important (globals.css:1895-1929, 2021-2028). The repo has zero @container rules. A 240px rail cell at 700px viewport gets the desktop skin; a 250px grid cell at 560px gets the compact skin - same rendered width, different skin.
- **Why:** Cards whose internal type/chrome depends on their slot width, not viewport width, are the canonical container-query migration target; the current double-keying is why the !important layer exists at all.
- **Fix:** Declare container-type:inline-size on .nk-grid-4/.nk-grid-feed/.nk-grid-4--rail/.nk-cats-shelf cells (or the card root) and move the <=560 card-skin block to @container (max-width:~260px); delete the !important overrides by moving inline card type styles into classes.
- **Evidence:** `home/base-lt-0560x0900-dpr2-fp.png` · `home/base-lt-0431x0932-dpr2-fp.png` · app/globals.css:1895 Quiet Luxe mobile layer @media(max-width:560px) card skin with !important; app/globals.css:2051 .nk-cats-shelf rail sizing @media(max-width:980px)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-045 · MEDIUM** — OfferCard and CategoryCard render in 3+ container contexts but size their skins via viewport media — CQ migration targets (561–768px, locales: en, lt)

- **What:** Repo has zero @container. OfferCard renders in (a) home .nk-grid-4 (2-col at 561-700 ≈ 220-290px slots, 3-col at 701-1024 ≈ 190-300px), (b) feed .nk-grid-feed (own ladder), (c) listing-detail .nk-grid-4--rail (min(68%,240px) carousel). Its compact skin (smaller h3, eyebrow, pricebar, 36px fav) is gated on viewport ≤560 (globals.css:1895-1919), so a ~200px card in the 768 3-col grid keeps the full-size skin while a wider 260px card at 560 gets the compact one — skin selection tracks window width, not card width. CategoryCard likewise: fixed 224px rail tile at 561-980 on home vs auto-fit grid tile on /kategorijos, with its v2 compaction also viewport-gated.
- **Why:** This is the canonical container-query case: identical components at identical rendered widths get different typography depending on page/viewport, producing the densest-looking cards at tablet 3-col where the compact skin does NOT apply. CQ would collapse the ladder+!important override system (2026 baseline, universally supported).
- **Fix:** Declare container-type:inline-size on .nk-grid-4/.nk-grid-feed/.nk-grid-4--rail/.nk-cats-shelf items' wrapper and move the ≤560 compact card skin (app/globals.css:1895-1919) to @container (max-width:240px); same for the category tile v2 compaction.
- **Evidence:** `home/base-lt-0768x1024-dpr2-fp.png` · `home/base-lt-0561x0900-dpr2-fp.png` · app/globals.css:1458 .nk-grid-4 ladder; app/globals.css:1895 ≤560 compact card skin (!important)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-046 · MEDIUM** — Card favorite button is 42x42px across the 561-1024 touch band — below the 44px minimum (561–768px, locales: en, lt)

- **What:** The base .nk-fav is 48x48 (globals.css:720) but the Quiet Luxe finish layer overrides it to 42x42 at all widths (globals.css:1866). In the 561-768 touch band the heart (which opens the app-bridge modal — a conversion action) is therefore 42px, under the 44px WCAG 2.5.8/AAA-2.5.5-informed floor the project itself encodes as --nk-tap:44px (globals.css:149). At ≤560 a further override drops it to 36px (adjacent band).
- **Why:** Sub-44px floating targets over image content are the classic mis-tap case on tablets; the repo's own token says 44 is the floor, so this is a finish-layer regression, not a design decision.
- **Fix:** In app/globals.css:1866 keep the visual 42px circle but restore the hit area: min-width/min-height var(--nk-tap) with a transparent hit inset, or simply revert to 44px (width:var(--nk-tap);height:var(--nk-tap)).
- **Evidence:** `home/base-lt-0768x1024-dpr2-fp.png` · `home/base-lt-0561x0900-dpr2-fp.png` · app/globals.css:1866 .nk-fav{width:42px;height:42px} (Quiet Luxe override); app/globals.css:720 .nk-fav base 48px
- *RB-12 · confidence 0.85 · code-inferred*

**RSP-059 · MEDIUM** — Offer-card 'Pristatymas' badge clips mid-glyph on 2-up mobile cards under text spacing (320–430px, state: textspacing)

- **What:** The delivery badge is nowrap with max-width:calc(100% - 52px) but no overflow:hidden/text-overflow. On 320px 2-up cards (~138px card, ~86px badge budget) injected letter spacing makes 'Pristatymas' overflow the pill; the text paints past the pill and is cut by the card media's overflow:hidden (auto-metric flags 3 cards clipped; the Dodge RAM card badge is visibly cut at the media edge).
- **Why:** WCAG 1.4.12: the delivery trust signal becomes partially unreadable. A nowrap badge without an ellipsis fallback has no graceful degradation path.
- **Fix:** Add overflow:hidden;text-overflow:ellipsis to .nk-offer__badge (app/globals.css:735-739) so constrained widths degrade to an ellipsis instead of a raw glyph cut.
- **Evidence:** `home/textspacing-lt-0320x0568-dpr2-fp.png` · app/globals.css:735 .nk-offer__badge (white-space:nowrap, max-width:calc(100% - 76px), no text-overflow); app/globals.css:1922 mobile override max-width:calc(100% - 52px)!important font-size:10.5px!important
- *RB-11 · confidence 0.7 · measured*

**RSP-078 · POLISH** — Offer-card category eyebrow renders at 10.5px uppercase — the smallest text on the page (769–1024px, locales: en, lt)

- **What:** The Quiet Luxe finish layer retunes .nk-offer__eyebrow from 11.5px to 10.5px with .17em tracking at every width; the auto-metric minFontPx=10.5 in all 15 B5 shots traces to it. Long LT category names ('ELEKTRONIKA IR TECHNOLOGIJOS…') render sub-11px in the flagship 'Naujausi daiktai' band.
- **Why:** 10.5px uppercase letterspaced text is below the ~11-12px legibility floor most 2026 design systems enforce, and at 200% zoom (RB-11 1.4.4 lens) it's the first element to fall behind. It's duplicated metadata (color accent + tile category), so the harm is craft-level.
- **Fix:** Raise globals.css:1849 to 11px+ (or keep 10.5px only ≥1281 where cards are large, letting the base 11.5px stand on touch bands).
- **Evidence:** `home/base-lt-0901x1280-fp.png` · `home/base-lt-1024x0768-fp.png` · app/globals.css:1849 .nk-offer__eyebrow{font-size:10.5px;letter-spacing:.17em} (Quiet Luxe layer, all widths); app/globals.css:704 base .nk-offer__eyebrow 11.5px
- *RB-11 · confidence 0.85 · measured*

**RSP-081 · POLISH** — 10.5px tracked-out card eyebrow truncates long LT category names at every B7 width (1281–1536px)

- **What:** The Aperture card's category eyebrow ('ELEKTRONIKA IR TECHNOLO…') ellipsizes on the 199-247px 5-up cards at all widths in this band — even at 1536 the widest card can't fit 'Elektronika ir technologijos' at 10.5px with .17em tracking. It is also the smallest text on the page (auto-metric minFontPx 10.5 across all 7 shots).
- **Why:** The category label is the card's scent-of-information cue; permanently truncating it for the most common LT categories at flagship desktop widths (and at 10.5px, below the ~11-12px comfortable floor) is a craft miss.
- **Fix:** Use the short-form category names for the eyebrow (a compact label map alongside category-style.ts), or reduce tracking to .08em and allow the eyebrow to take 2 lines / drop to a slightly larger 11.5px un-tracked style like the base rule at globals.css:704.
- **Evidence:** `home/base-lt-1536x0826-fp.png` · app/globals.css:1849 .nk-offer__eyebrow font-size:10.5px;letter-spacing:.17em
- *RB-01 · confidence 0.85 · measured*

**RSP-082 · POLISH** — Offer-card category eyebrow is 10.5px — smallest text on the page at every width (≥1537px, locales: en, lt)

- **What:** The Quiet Luxe finish layer (globals.css:1849) drops .nk-offer__eyebrow from its 11.5px base (:704) to 10.5px with .17em tracking; the capture harness reports minFontPx 10.5 on all nine B8 shots. On ~332px-wide home cards ('ELEKTRONIKA IR TECHNOLOGIJOS', 'TRANSPORTAS') the label reads as near-decorative.
- **Why:** 10.5px uppercase informational text sits below the ~11–12px craft floor for flagship marketplaces; it is the categorization scent the Aperture card design relies on, and it is also the double-definition smell (base 11.5px + later unconditional 10.5px override) rather than one sized rule.
- **Fix:** Raise the finish-layer size to ≥11.5px (or delete the :1849 size override and keep the :704 base), consolidating to a single .nk-offer__eyebrow size.
- **Evidence:** `home/base-lt-1920x1080-fp.png` · `home/base-lt-1680x1050-vp.png` · app/globals.css:1849 .nk-offer__eyebrow (10.5px override); app/globals.css:704 .nk-offer__eyebrow (11.5px base)
- *RB-24 · confidence 0.85 · measured*

**RSP-085 · POLISH** — Offer-card eyebrow forced to 9.5px!important on phones — sub-10px text fighting the token system (320–560px, locales: en, lt)

- **What:** The ≤560 compact skin steps .nk-offer__eyebrow down to 9.5px with !important (globals.css:1903), alongside a dozen sibling !important font steps (1900-1917). 9.5px uppercase+.14em tracking is the smallest text on the site (auto-metric minFontPx 9.5 on all ≤560 home shots) and the stepped !important overrides sit on top of the fluid --nk-fs-* system rather than in it.
- **Why:** RB-09: double type systems (clamp tokens + banded !important steps) drift apart over time; sub-10px labels are below the 2026 mobile readability floor even for eyebrows.
- **Fix:** Fold the compact card type into fluid tokens (e.g. --nk-fs-eyebrow: clamp(10px,2.6vw,12px)) and remove the !important steps at globals.css:1900-1917; floor at 10px.
- **Evidence:** `home/search-focus-lt-0320x0568-dpr2-vp.png` · app/globals.css:1903 .nk-offer__eyebrow font-size:9.5px!important
- *RB-09 · confidence 0.8 · code-inferred*

**RSP-088 · POLISH** — Offer-card category eyebrow is 10.5px letterspaced uppercase — smallest text on the page and it truncates (ELEKTRONIKA IR TECHN…) (561–768px, locales: en, lt)

- **What:** The Quiet Luxe layer sets .nk-offer__eyebrow to 10.5px with .17em tracking (down from 11.5px at globals.css:704); it is the page's minimum font (auto-metric minFontPx 10.5 on every base shot) and long LT category names ellipsize ('ELEKTRONIKA IR TECHNOL…' at 561 and 768). At ≤560 it drops further to 9.5px.
- **Why:** 10.5px uppercase with heavy tracking is below the ~11px comfortable floor for meaningful labels (this is the card's category, information users act on), and truncation makes two categories read identically.
- **Fix:** Raise to 11px and reduce tracking to .12em in app/globals.css:1849, or drop the eyebrow to the icon+short-name form the compact skin uses.
- **Evidence:** `home/base-lt-0561x0900-dpr2-fp.png` · `home/base-lt-0768x1024-dpr2-fp.png` · app/globals.css:1849 .nk-offer__eyebrow{font-size:10.5px;letter-spacing:.17em}
- *RB-24 · confidence 0.8 · measured*

### cta-banner

**RSP-034 · MEDIUM** — App-CTA phone sizes says 480px but renders 563-790px; its ≤980 branch describes a hidden image (1121–3840px, locales: en, lt)

- **What:** AppCtaBanner.tsx:12 sets sizes="(max-width: 980px) 60vw, 480px" on download-phone.png (899x705). CSS renders it at height:620px, width auto → 620*899/705 = 790px, clamped by max-width:50% of the banner: ~563px at 1280 up to 790px at 1920 (globals.css:1705). So the fallback underestimates by 17-65%: DPR2 fetches 960→1080w vs up to 1580px needed (~1.46x upscale on retina desktops); DPR1 at 1920 fetches 640w vs 790 needed. Meanwhile the (max-width:980px) 60vw branch can never be seen — the image is display:none for the whole ≤1120 range (globals.css:1738; lazy-loaded so at least it is not fetched).
- **Why:** A soft, upscaled device mock on the site's install-conversion banner at flagship desktop sizes; the phantom mobile branch misleads maintainers.
- **Fix:** In AppCtaBanner.tsx:12 use sizes="(max-width: 1120px) 1vw, (max-width: 1600px) 44vw, 790px" (or simply "(max-width:1120px) 1vw, 50vw").
- **Evidence:** app/globals.css:1705 .nk-appcta__phone (height:620px;max-width:50%); app/globals.css:1738 .nk-appcta__phone display:none ≤1120
- *RB-17 · confidence 0.85 · code-inferred*

**RSP-100 · POLISH** — Stacked CTA banner (≤1120) leaves the right ~60% of the gradient card empty below the copy (769–1024px, locales: en, lt)

- **What:** With the bleed phone and spark dots hidden at ≤1120, the banner becomes copy → badges → a lone left-aligned 148px QR card, leaving a large empty gradient field to the right of the QR and below the copy at 769-1024 (visible in every fp shot). Desktop balances this area with the device render.
- **Why:** RB-24: the compact skin should compress proportionally; a half-empty full-width conversion band reads under-designed on exactly the tablet widths where the banner is the last pre-FAQ conversion moment.
- **Fix:** In the ≤1120 block, either center the copy+QR as a two-column row (QR right, copy left) since ≥769 has the width for it, or reduce .nk-appcta padding/min-height so the card hugs its content; alternatively keep the phone visible down to ~900 (it fit at 1024 width).
- **Evidence:** `home/base-lt-1024x0768-fp.png` · `home/base-lt-0901x1280-fp.png` · `home/base-lt-0912x1368-fp.png` · app/globals.css:1732-1736 @media(max-width:1120px) .nk-appcta stacked: phone+spark hidden, copy max-width:none, QR order 2 flex-start
- *RB-24 · confidence 0.7 · visual*

### footer

**RSP-035 · MEDIUM** — Install QR gets three different treatments; the CTA-banner one is a bare unlabeled tile over artwork (981–1920px, state: app-redirect, base)

- **What:** Same job (scan to install) rendered three ways: AppRedirect modal = 152px QR in a scanner-viewfinder frame + bold title + hint copy; invite hero = 172px QR in a bordered panel + 'Nuskenuokite telefonu' caption; AppCtaBanner (home, categories, HIW) = bare 148px white QR floating over the phone photo at right:72px/bottom with no frame, no caption, no label (AppCtaBanner.tsx:28-30 renders <QR size={148}/> alone; .nk-appcta__qr is a flex column clearly built to hold a caption that is never passed). At 1920 on categories the tile sits over the dark phone bezel looking like a stray image.
- **Why:** The highest-traffic install surface (home + categories CTA banner) is the only QR with zero affordance text - users who don't recognize a naked QR get no cue, while the modal/invite variants set a labeled expectation. Component-level (container-scoped) styling would keep one QR anatomy across contexts.
- **Fix:** Give AppCtaBanner's QR the same labeled anatomy: render a caption (reuse dict key used by invite's 'Nuskenuokite telefonu') inside .nk-appcta__qr (app/components/AppCtaBanner.tsx:28-30), and consider sharing the invite panel treatment so QR = tile + caption everywhere; keep the viewfinder frame as the modal-only accent.
- **Evidence:** `home/app-redirect-lt-1280x0800-vp.png` · `invite-code/base-lt-1280x0800-vp.png` · app/globals.css:1711 .nk-appcta__qr; app/globals.css:1016 .nk-qr-frame
- *RB-03 · confidence 0.85 · measured*

**RSP-052 · MEDIUM** — Footer category links clip at the right viewport edge at 320 under text spacing (320–360px, state: textspacing)

- **What:** The footer 'Kategorijos' list renders in two flex columns (min-width:0, flex:1). Under injected letter spacing long Lithuanian words in the second column ('Elektronika ir technologijos') exceed the ~137px column and the viewport; .nk-footer's overflow:hidden cuts them, rendering 'Elektronika technologijo' with trailing glyphs lost. No horizontal scroll exists to reveal the rest.
- **Why:** WCAG 1.4.12: navigation link text is truncated, and the affected links are the footer's SEO/browse entry points.
- **Fix:** Add overflow-wrap:anywhere (or hyphens:auto) to .nk-footer__catcol links, or collapse the catgrid to one column below ~360px (app/globals.css:874-879).
- **Evidence:** `home/textspacing-lt-0320x0568-dpr2-fp.png` · app/globals.css:867 .nk-footer overflow:hidden; app/globals.css:874 .nk-footer__catgrid
- *RB-11 · confidence 0.8 · visual*

### grid

**RSP-036 · MEDIUM** — OfferCard sized by viewport ladders across >=3 container contexts — prime @container target (320–1920px, locales: en, lt)

- **What:** The repo has zero @container rules. OfferCard renders in at least three different container contexts — the home 'Popular items' band (.nk-grid-4, sections.tsx:594), the feed results grid (.nk-grid-feed, shares the <=560 override at globals.css:1899), and the listing-detail similar rail (.nk-grid-4--rail, globals.css:1947-1951) — yet all sizing (column count, the <=560 compact skin, eyebrow/badge steps) is keyed to viewport @media widths (1459-1463). The card cannot adapt to its actual slot: a rail card at 68% width and a 5-up grid cell at ~19% width get identical viewport-driven type/spacing.
- **Why:** Viewport-keyed sizing of a multi-context card is the canonical container-query migration case in 2026; it is also why seam bugs need per-context override blocks (1899, 1947) instead of one intrinsic rule.
- **Fix:** Make each card grid a container (container-type:inline-size on .nk-grid-4/.nk-grid-feed/.nk-grid-4--rail) and move the card's compact-skin steps from @media(max-width:560px) to @container (max-width:~200px) card queries.
- **Evidence:** `feed/base-lt-1119x0800-fp.png` · `feed/base-lt-0320x0568-dpr2-fp.png` · `home/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1459 .nk-grid-4; app/globals.css:1460-1463 width ladder
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-068 · POLISH** — Mobile layer double-writes earlier rules: two dead <=560 declarations and stepped px replacing fluid tokens (431–560px, locales: en, lt)

- **What:** Two same-specificity rule pairs fight at the same breakpoint and the earlier one silently loses: (a) .nk-grid-4 1fr at :1462 vs 2-up at :1898 - the visible 2-up layout depends purely on source order of the Quiet Luxe layer; (b) .nk-eyebrow 17px at :1536 vs the later Quiet Luxe 16px at :1844, which wins at every width, so the mobile bump never applies. Meanwhile the <=560 block replaces fluid tokens (--nk-fs-body etc.) with fixed steps (.nk-body/.nk-body-sm/.nk-meta all 15.5px), a second type system layered over the clamp() tokens.
- **Why:** Dead same-breakpoint rules are seam landmines: any refactor that reorders globals.css flips the phone offers grid from 2-up to 1-up with no diff to the rules themselves; the double type system makes future token retunes silently not apply on phones.
- **Fix:** Delete globals.css:1462 and :1536 (or merge them into the :1895 block as the single source); express the phone body sizes by re-clamping the --nk-fs-* tokens in the <=560 :root scope instead of per-class fixed px.
- **Evidence:** `home/base-lt-0431x0932-dpr2-fp.png` · app/globals.css:1462 @media(max-width:560px) .nk-grid-4{grid-template-columns:1fr} (dead - overridden); app/globals.css:1898 later @media(max-width:560px) .nk-grid-4 2-up (wins)
- *RB-09 · confidence 0.9 · code-inferred*

**RSP-079 · POLISH** — Intrinsic auto-fit categories grid is immediately pinned by four fixed-column ladder overrides (769–1024px, locales: en, lt)

- **What:** The base .nk-grid-cats is already intrinsic (auto-fit/minmax) but 1097-1100 override it with fixed repeat(5/4/3/2) at width ladders, so the intrinsic rule never runs; the .nk-grid-4 offers grid is a pure ladder (1458-1462). Within B5 this yields the 980/981 (rail→4-col) and 1024/1025 (3→4-col) steps.
- **Why:** RB-02: the double system means every future card-min change needs five edits, and the ladders are what force the seam special-cases; letting minmax(var(--nk-cat-min),1fr) drive would give continuous column counts without seam risk (partial last rows are fine).
- **Fix:** Delete the fixed-column overrides at globals.css:1097-1100 and tune --nk-cat-min per band instead (a max-column cap can be kept with max() math or a single ≥1441 override); same approach for .nk-grid-4 with a --nk-offer-min token.
- **Evidence:** `home/base-lt-0981x0900-fp.png` · `home/base-lt-1024x0768-fp.png` · app/globals.css:1096 .nk-grid-cats base repeat(auto-fit,minmax(min(100%,var(--nk-cat-min)),1fr)); app/globals.css:1097-1100 four width-ladder overrides pinning 5/4/3/2 columns
- *RB-02 · confidence 0.85 · code-inferred*

**RSP-083 · POLISH** — Category grid's intrinsic auto-fit base rule is fully shadowed by a width ladder — dead intent (≥320px, locales: en, lt)

- **What:** .nk-grid-cats declares grid-template-columns:repeat(auto-fit,minmax(min(100%,var(--nk-cat-min)),1fr)) but the four media overrides at :1097-1100 cover 100% of viewport widths, so the intrinsic rule (and the --nk-cat-min token) never determines column count anywhere. In B8 the ≥1441 5-col ladder step is what renders.
- **Why:** The intrinsic minmax approach the base rule intends would remove the ladder's seam maintenance for free (the 1920 container cap already bounds tile width); keeping both means future tweaks to --nk-cat-min silently do nothing — the exact ladder-vs-intrinsic confusion RB-02 targets.
- **Fix:** Either delete the dead base declaration or (better) delete the ladder steps ≥701px and let auto-fit/minmax(220px,1fr) drive columns under the container cap, keeping only the deliberate 2-col phone step.
- **Evidence:** `home/base-lt-1920x1080-fp.png` · `home/base-lt-2560x1440-fp.png` · app/globals.css:1096 .nk-grid-cats (auto-fit/minmax base); app/globals.css:1097 @media(min-width:1441px) 5-col
- *RB-02 · confidence 0.85 · code-inferred*

**RSP-089 · POLISH** — Section 'view all' links (~28px tall) get the 44px tap floor only ≤560, not on the tablet touch band (769–1024px, locales: en, lt)

- **What:** 'Visos kategorijos', 'Visi daiktai' and 'Visas procesas' are bare inline-flex links (clamp 18-22px text + 24px icon, ≈26-28px effective height, no padding). The house --nk-tap min-height is applied to .nk-head__action only in the ≤560 block, so on iPads (769-1024, coarse pointer) these secondary navigation targets sit under the 44px floor the rest of the site honors (e.g. HeroOwnerCta sets min-height:var(--nk-tap) explicitly, HeroSearch.tsx:31).
- **Why:** RB-12: touch bands extend to 1024; ~28px is above the WCAG 2.5.8 24px minimum but below the 44-48px 2026 marketplace norm and the codebase's own --nk-tap convention. Surrounding whitespace mitigates but doesn't grow the hit area.
- **Fix:** Move the min-height:var(--nk-tap) rule for .nk-head__action out of the ≤560 block (apply it unconditionally, or under @media(pointer:coarse)); add padding-block to .nk-cats-all at globals.css:414.
- **Evidence:** `home/base-lt-0901x1280-fp.png` · `home/base-lt-1024x0768-fp.png` · app/globals.css:414-416 .nk-cats-all (no padding/min-height); app/globals.css:748-754 tap-floor treatment (.nk-head__action{min-height:var(--nk-tap)}) only inside @media(max-width:560px)
- *RB-12 · confidence 0.8 · code-inferred*

**RSP-091 · POLISH** — Curated 10-tile categories shelf sits at 4/4/2 through 1281-1440 while offers below run 5-up (1281–1440px, locales: en, lt)

- **What:** The home shelf is a curated, fixed 10-item set (sections.tsx:464 HOME_SHELF_IDS), yet .nk-grid-cats stays 4 columns until 1441, producing a 4/4/2 layout with a two-tile stranded row for the whole 981-1440 range — while the adjacent 'Naujausi daiktai' band is already 5-up from 1281, so the two stacked card grids have mismatched column seams at every B7 width below 1441. At 1441 the shelf snaps to a clean 5/5.
- **Why:** A partial last row is normal for arbitrary data, but this list is hand-curated to exactly 10 — 4/4/2 for a 160px-wide band range reads unresolved next to the perfectly aligned 5/5 one pixel later, and the misaligned seams between neighbouring sections weaken the grid rhythm.
- **Fix:** Align the ladders: move the .nk-grid-cats 5-up breakpoint from 1441 to 1281 (globals.css:1097-1098) to match .nk-grid-4 — tiles would be ~199-247px, close to the <=700px rail's 224px basis, and the shelf sets 5/5 across all of B7.
- **Evidence:** `home/base-lt-1440x0900-fp.png` · `home/base-lt-1441x0900-fp.png` · `home/base-lt-1281x0800-fp.png` · app/globals.css:1097-1098 .nk-grid-cats 4-up 981-1440, 5-up >=1441; app/globals.css:1458 .nk-grid-4 5-up from 1281
- *RB-02 · confidence 0.8 · visual*

**RSP-102 · POLISH** — Same OfferCard grid caps at 1920 on home but 1480 on the feed — 22% card-size jump between siblings (≥2084px, locales: en, lt)

- **What:** The home 'Naujausi daiktai nuomai' band uses .nk-grid-4 (5 cols, bounded only by the 1920px container → ~332px cards at ≥2084px viewports) while /skelbimai renders the identical OfferCard in .nk-grid-feed capped at --nk-content-cap:1480 (~272px cards). Navigating home → feed at 2560+ shrinks the very same cards ~22% and narrows the whole browse surface relative to the page the user just left. A CSS comment marks the feed-only cap as deliberate, but the two surfaces present one card system.
- **Why:** RB-20 asks for one coherent cap system; a marketing band being wider is defensible, but applying the 'ultrawide guardrail for marketplace surfaces' to only one of two surfaces showing the same listing cards reads as an inconsistency at 1920+ monitors rather than a hierarchy.
- **Fix:** Apply max-width:var(--nk-content-cap) (with margin-inline:auto) to the home .nk-grid-4 offers band too, or promote the home width as the system and raise the feed cap — either way, unify.
- **Evidence:** `home/base-lt-2560x1440-fp.png` · `home/base-lt-3440x1440-fp.png` · app/globals.css:1458 .nk-grid-4 (no cap); app/globals.css:1182 .nk-grid-feed{…max-width:var(--nk-content-cap)}
- *RB-20 · confidence 0.7 · code-inferred*

### app-redirect-sheet

**RSP-037 · MEDIUM** — Mobile redirect sheet's Google Play / App Store text links are 24px-tall touch targets (320–560px, state: app-redirect; locales: en, lt)

- **What:** The mobile-only 'Taip pat: Google Play . App Store' row renders two underlined inline links with an explicit min-height of 24px (globals.css:534) at 13.5px font, separated only by a middot — flagged as small targets by the harness at both 320x568 and 390x700. These are real store-navigation links (the fallback when the /go smart CTA is not wanted), shown only on touch devices.
- **Why:** WCAG 2.5.8 (24px is the bare AA floor with spacing, but the two links nearly abut around the middot) and Apple HIG 44px; on the conversion-critical install sheet, mis-taps between the two stores are plausible.
- **Fix:** Give the links padding to reach >=44px hit area (padding-block:10px, negative margin to keep visual rhythm) and >=8px separation, app/globals.css:534.
- **Evidence:** `home/app-redirect-lt-0320x0568-dpr2-vp.png` · `home/app-redirect-lt-0390x0700-dpr2-vp.png` · `home/app-redirect-lt-0390x0844-dpr2-vp.png` · app/globals.css:534 .nk-redirect-storestext a{min-height:24px}; app/globals.css:1061 .nk-redirect-storestext{display:block} (mobile)
- *RB-12 · confidence 0.85 · measured*

**RSP-096 · POLISH** — Redirect sheet close button is absolute inside the scrollable panel, so it scrolls away when content overflows (320–560px, state: app-redirect; locales: en, lt; only when panel content exceeds the height cap (short viewports + large text / text-spacing))

- **What:** On mobile the redirect panel becomes an overflow:auto sheet; .nk-redirect-close is positioned absolute against the panel, not a pinned header, so once the sheet actually scrolls (92vh cap + user text zoom or text-spacing) the close control leaves the viewport. At default settings the sheet fits (dialogFit lastControlInViewport:true at 320x568), hence polish severity.
- **Why:** Same pinned-dismiss principle as the filter sheet; becomes user-visible under WCAG 1.4.4 zoom.
- **Fix:** Wrap the close in a sticky header row inside .nk-redirect-panel for the max-width:560 variant (or make .nk-redirect-close position:sticky within a header).
- **Evidence:** `home/app-redirect-lt-0320x0568-dpr2-vp.png` · app/globals.css:1036 .nk-redirect-close{position:absolute;top:16px;right:16px}; app/globals.css:1050 .nk-redirect-panel{overflow:auto}
- *RB-23 · confidence 0.75 · code-inferred*

### nav

**RSP-048 · MEDIUM** — Route loading states drop the entire site nav — chrome flashes out on home -> feed/detail navigation (1025–1280px, state: loading-detail, loading-feed)

- **What:** Clicking through from home renders skelbimai (and [id]) loading.tsx with no header at all: the capture shows a bare skeleton page (scrollHeight 1252px) whose top 76px is an empty spacer div (height:var(--nk-nav-h)) where the logo, links, locale switcher and install CTA were a frame earlier. Content geometry is preserved by the spacer, but the whole brand chrome (including the site's single conversion CTA) disappears for the duration of the load and pops back when the client screen hydrates.
- **Why:** Persistent chrome during route transitions is table stakes for a 2026 marketplace; a navless dark page mid-navigation reads as a broken load on slow connections, and the install CTA vanishes on the highest-intent path (home -> listings).
- **Fix:** Move <Nav> (sections.tsx) into a shared server-safe position — e.g. render it from app/[lang]/layout.tsx or include it at the top of each loading.tsx instead of the aria-hidden spacer (app/[lang]/skelbimai/loading.tsx:10) — so sticky chrome survives Suspense fallbacks.
- **Evidence:** `home/loading-feed-lt-1280x0800-vp.png` · `home/loading-detail-lt-1280x0800-vp.png` · app/globals.css:542 .nk-nav-bar (position:sticky, lives inside the client screen, not the layout)
- *RB-19 · confidence 0.85 · measured*

**RSP-060 · MEDIUM** — Safe-area handling is bottom-only: gutter, fixed nav, drawer and edge-bleed rails ignore env(safe-area-inset-left/right) (320–1024px, state: base, menu-open; locales: en, lt; landscape phones with notch/Dynamic Island)

- **What:** --nk-safe-bottom exists (globals.css:220) and the drawer/back-to-top/sheets pad the bottom, but --nk-gutter is a plain clamp(20px,6vw,82px) with no max(..., env(safe-area-inset-left/right)) term. In landscape on notched phones the ~44-59px inset exceeds the 20px gutter, so the fixed nav's logo/burger, drawer items, and the first/last tiles of the edge-bleed snap rails (.nk-cats-shelf bleeds via negative gutter margins) sit under the sensor housing / rounded corners. Only the redirect modal handles left/right insets (1278-1279).
- **Why:** RB-08 requires left/right safe-area completeness on every fixed bar, drawer and snap-rail edge; the redirect modal proves the codebase knows the pattern but the rest of the chrome omits it.
- **Fix:** Redefine --nk-gutter as max(clamp(20px,6vw,82px), env(safe-area-inset-left), env(safe-area-inset-right)) (app/globals.css:203) or add scoped max() padding to .nk-nav, .nk-nav-drawer-inner and the three rails' padding-inline.
- **Evidence:** app/globals.css:203 --nk-gutter (no safe-area term); app/globals.css:584 .nk-nav-drawer-inner (bottom-only safe padding)
- *RB-08 · confidence 0.7 · code-inferred*

**RSP-090 · POLISH** — Open drawer items sit 4px apart on touch tablets (1025-1120), below the 8px spacing guideline (1025–1120px, state: menu-open; locales: en, lt)

- **What:** The burger drawer persists up to 1120px, so iPad Pro landscape (1112) is a touch context. Drawer items meet the 48px height floor, but .nk-nav-drawer-inner uses gap:4px (auto-lead confirmed 4px between consecutive .nk-drawer-item boxes at 1025/1112/1119).
- **Why:** 48px targets make 4px gaps tolerable, but the house guideline (>=8px separation on touch bands) and the drawer's stakes (adjacent items navigate vs open the install modal) favor the full spacing.
- **Fix:** Raise gap to 8px in .nk-nav-drawer-inner (app/globals.css:584); the 480px dvh cap still fits six 48px rows + locale block.
- **Evidence:** `home/base-lt-1112x0834-vp.png` · app/globals.css:584 .nk-nav-drawer-inner{gap:4px}; app/globals.css:585 .nk-drawer-item{min-height:48px}
- *RB-12 · confidence 0.8 · measured*

**RSP-097 · POLISH** — 4px spacing between stacked touch targets in drawer and hero form (8px preferred) (361–430px, state: base, menu-open; locales: en, lt)

- **What:** Auto-metrics flag 4px gaps between consecutive 48px-tall .nk-drawer-item rows and between the hero city trigger and the Ieskoti submit (4px at 390-430; 3px at 375x667 between input row and submit where the city row is dropped). Targets meet the 44/48px size floor, but inter-target spacing sits under the 8px guideline on a touch-first band.
- **Why:** Adjacent full-width rows with <8px separation raise mis-tap odds between 'Skelbimai' and 'Kaip tai veikia', and between refining the city and firing the search.
- **Fix:** Bump .nk-nav-drawer-inner gap to 8px (globals.css:584) and .nk-search .nk-btn margin-top to 8px in the stacked skin (globals.css:1536).
- **Evidence:** `home/base-lt-0390x0844-dpr2-vp.png` · `home/base-lt-0375x0667-dpr2-vp.png` · app/globals.css:584 .nk-nav-drawer-inner{gap:4px}; app/globals.css:1536 .nk-search .nk-btn{margin-top:4px}
- *RB-12 · confidence 0.75 · measured*

### overlay-appredirect

**RSP-055 · MEDIUM** — App-redirect bottom sheet caps at raw 92vh — overflows the visible viewport when mobile URL bar is expanded (320–700px, state: redirect-open; locales: en, lt; mobile browsers with dynamic URL bar)

- **What:** The Locked-mode install sheet (.nk-redirect-panel mobile variant, globals.css:1045) and the shared .nk-sheet (933) use max-height:92vh. On mobile Safari/Chrome with the URL bar expanded, 100vh > visible height, so 92vh can exceed the actual viewport and push the sheet's lower content (store badges / install CTA) below the fold of the core conversion overlay. The codebase already uses 100dvh correctly for the nav drawer (583) and bento (1214), so this is an inconsistency, not a policy.
- **Why:** This modal is the site's single conversion action (Rezervuoti programėlėje); dvh/svh on overlay heights is the 2026 baseline and the repo applies it elsewhere.
- **Fix:** Change max-height:92vh to max-height:92dvh (or min(92dvh,92vh) for old-engine fallback) at app/globals.css:1045 and :933.
- **Evidence:** app/globals.css:1045 .nk-redirect-panel max-height:92vh; app/globals.css:933 .nk-sheet max-height:92vh
- *RB-06 · confidence 0.75 · code-inferred*

### overlay-app-redirect

**RSP-056 · MEDIUM** — Bottom sheets cap at raw 92vh - taller than the visible viewport under mobile browser chrome (361–430px, state: app-redirect; locales: en, lt; hurts most at <=700px real viewports)

- **What:** The app-redirect conversion sheet (.nk-redirect-panel, globals.css:1045) and the generic .nk-sheet (933) use max-height:92vh. On iOS Safari vh equals the LARGE viewport, so with the toolbar visible 92vh ~= 683px on a 664px-visible viewport (390-wide iPhones): a content-tall sheet's top edge and close affordance can sit above the visible area until the user scrolls the sheet's internals. Every other fixed element in the file already migrated to dvh/safe-area (drawer at :583 uses 100dvh).
- **Why:** The install-bridge modal is the site's single conversion action; a top-clipped sheet on default Safari chrome is a direct funnel defect, and mixing vh here against dvh elsewhere breaks the deliberate viewport-unit policy RB-06 requires.
- **Fix:** Change both to max-height:92dvh (or min(92dvh, 640px)) at globals.css:933 and 1045.
- **Evidence:** app/globals.css:933 .nk-sheet{max-height:92vh}; app/globals.css:1045 .nk-redirect-panel{max-height:92vh}
- *RB-06 · confidence 0.75 · code-inferred*

### faq

**RSP-058 · MEDIUM** — Open FAQ answer runs ~110–115ch per line at wide — no prose measure cap (≥1537px, locales: en, lt)

- **What:** FaqRow's answer paragraph (app/components/cards.tsx:202) has no max-width; inside the 1320px-capped FAQ column the open answer spans ~1109px at 18px Sora (measured on the default-open first row at 1920: text block x≈382→1491), ≈110–115 characters per line. Same at 2560–3840 since the column is capped.
- **Why:** Comfortable reading measure is 45–75ch; the site already encodes this (.nk-prose 65ch, .nk-head__sub 60ch) but the FAQ answer — the longest body copy on the home page — ignores it, hurting readability of exactly the trust/pricing answers the section exists for.
- **Fix:** Add maxWidth: "75ch" (or className nk-prose) to the answer <p> in app/components/cards.tsx:202.
- **Evidence:** `home/base-lt-1920x1080-fp.png` · `home/base-lt-3840x2160-fp.png` · `home/base-en-1920x1080-fp.png` · app/globals.css:276 .nk-prose (existing 65ch utility, unused here)
- *RB-04 · confidence 0.75 · measured*

**RSP-077 · POLISH** — Section H2s lack text-wrap:balance; FAQ heading strands 'nuomojantis' alone at 431px (431–560px)

- **What:** At 431px the FAQ band heading wraps 'Ka verta zinoti pries / nuomojantis' - a single dangling word on line 2. The hero H1 has text-wrap:balance (globals.css:254) but .nk-h-section/.nk-head h2 (globals.css:256-259, 399) do not, so every section heading is exposed to widows as LT/EN copy lengths shift.
- **Why:** Widowed display headings read as untended typography; balance is a zero-risk one-liner already used elsewhere in the same file.
- **Fix:** Add text-wrap:balance to .nk-h-section and .nk-head h2 (globals.css:256, 399).
- **Evidence:** `home/base-lt-0431x0932-dpr2-fp.png` · app/globals.css:256 .nk-h-section (no text-wrap:balance); app/globals.css:399 .nk-head h2 (no text-wrap:balance)
- *RB-10 · confidence 0.85 · visual*

**RSP-092 · POLISH** — FAQ section head sits ~300px inboard of every other home section's left rail at wide (≥1537px, locales: en, lt)

- **What:** Faq wraps its Section in maxWidth:1320 (sections.tsx:717) while all other home sections use the full 1920 .nk-container, so at 1920 the FAQ eyebrow/H2 left edge lands at ≈382px vs the shared ≈82px rail of 'Populiarios nuomos kategorijos' / 'Naujausi daiktai nuomai' / 'Kaip vyksta nuoma' (at 3840: ≈1344 vs ≈1042). The code comment claims the head is 'left-aligned to match them'.
- **Why:** One continuous scroll page reads best with a consistent left rail for section heads; the lone indented head reads as a layout wobble rather than a deliberate centered block, especially at 1537–2100 where the 300px offset is a large fraction of the gutter.
- **Fix:** Either keep the accordion list at 1320 but let the SectionHead span the full container (align to the shared rail), or drop the maxWidth and cap only the FaqRow list width.
- **Evidence:** `home/base-lt-1920x1080-fp.png` · `home/base-lt-3840x2160-fp.png` · app/globals.css:337 .nk-container (1920 cap)
- *RB-24 · confidence 0.8 · measured*

### section-heads

**RSP-069 · POLISH** — Eyebrow type token (18px) is dead: later flat 16px override also kills the ≤560 17px rule (≥320px, locales: en, lt)

- **What:** --nk-fs-eyebrow is declared 18px and consumed by .nk-eyebrow (:244), but the Quiet Luxe layer re-declares .nk-eyebrow{font-size:16px} unconditionally at :1844. Because it comes later at equal (0,1,0) specificity, it also overrides the earlier ≤560px compact rule .nk-eyebrow{font-size:17px} (:1536), making that media rule dead code. Rendered eyebrows are 16px at every band while the token contract says 18px.
- **Why:** Two systems fight on the same element (token ramp vs stepped finish overrides) — the RB-09 double-system pattern. Anyone tuning --nk-fs-eyebrow sees no effect, and the intended compact-skin step silently never applies.
- **Fix:** Update the token to the real value (--nk-fs-eyebrow: 16px), delete the :1844 size declaration (keep its tracking/color), and remove or re-order the dead :1536 rule.
- **Evidence:** `home/base-lt-1920x1080-fp.png` · app/globals.css:234 --nk-fs-eyebrow: 18px; app/globals.css:244 .nk-eyebrow (uses token)
- *RB-09 · confidence 0.9 · code-inferred*

### hero (compact skin)

**RSP-084 · POLISH** — Short-phone compact skin fights the token system with !important overrides and a second h1 clamp (320–560px, locales: en, lt; <=700px)

- **What:** The (max-width:560)+(max-height:700) block redefines --nk-section-y/--nk-page-top (good, token-level) but then also applies per-component !important overrides — padding-block:4px 10px!important, gap:10px!important, padding:6px!important, display:none!important — and re-clamps .nk-h-hero with a parallel clamp(30px,9.4vw,37px) on top of the fluid --nk-fs system. Two sizing systems now own the same elements.
- **Why:** RB-09/RB-24: the double system makes future token changes silently no-op on short phones; !important escalation is the classic smell the rubric flags. Compression should flow through the rhythm tokens the repo already has.
- **Fix:** Move the hero compaction into token overrides in the same :root block (e.g. a --nk-hero-gap, --nk-search-pad token) and drop the !important flags; express the h1 size via the existing --nk-fs-* token override rather than a second clamp (globals.css:1816-1824).
- **Evidence:** `home/app-redirect-lt-0320x0568-dpr2-vp.png` · app/globals.css:1808-1827 @media(max-width:560px) and (max-height:700px) — !important overrides (#top>.nk-container padding-block!important, .nk-hero-intro gap!important, .nk-search padding!important, citypick display:none!important) and a re-declared h1 clamp
- *RB-09 · confidence 0.8 · code-inferred*

### nav-drawer

**RSP-099 · POLISH** — Open nav drawer dims the page with a scrim but deliberately leaves the background scrollable (561–768px, state: drawer-open; locales: en, lt; matters most ≤700px tall)

- **What:** sections.tsx:86-89 passes lockScroll:false to useDismissableLayer (code comment: 'the drawer deliberately leaves the page scrollable behind it'). With the .nk-nav-scrim visibly dimming the page, the layer reads as modal, yet a scroll/trackpad gesture over the scrim scrolls the dimmed page underneath while the drawer stays open at the top.
- **Why:** 2026 overlay practice is: either lock background scroll (without layout shift) or auto-dismiss on background scroll; a dimmed-but-live background is uncanny and lets the user scroll to content they cannot interact with (scrim intercepts clicks).
- **Fix:** Either enable lockScroll with scrollbar-gutter compensation, or add a scroll listener that closes the drawer on background scroll (matching the click-outside behavior in sections.tsx:112-118).
- **Evidence:** `home/faq-open-lt-0768x1024-dpr2-fp.png` · app/globals.css:583 .nk-nav-drawer.open max-height dvh; app/globals.css:584 .nk-nav-drawer-inner overscroll-behavior:contain
- *RB-23 · confidence 0.7 · code-inferred*

### how-it-works

**RSP-101 · POLISH** — How-it-works connector line trails ~350-500px past the third step node at wide widths (1281–1536px, locales: en, lt)

- **What:** The purple→yellow→green connector (.nk-hiw-line) spans the full track (left:44/right:44), but the three step nodes sit at the starts of three 1fr columns, so the last node's centre is at ~68-70% of the track and the line continues to the container edge through empty space. The gradient's green endpoint (100%) also lands in that empty tail rather than under the green step-3 node, so node 3's icon accent doesn't match the line colour beneath it. The trailing run grows with viewport width (~350px at 1281, ~500px at 1536).
- **Why:** A connector implies sequence between nodes; a long tail into whitespace reads as an unfinished fourth step and breaks the deliberate purple/yellow/green node-to-gradient mapping the component was designed around (STEP_ACCENTS, sections.tsx:641).
- **Fix:** End the line at the last node: e.g. .nk-hiw-line{right:calc((100% - 88px)/3 + 44px)} or give it width:calc(66.666% + 44px), and set the gradient stops so green lands at the new 100%.
- **Evidence:** `home/base-lt-1441x0900-fp.png` · `home/base-lt-1536x0826-fp.png` · app/globals.css:1427 .nk-hiw-line left:44px;right:44px; app/globals.css:1428 .nk-hiw-grid repeat(3,1fr)
- *RB-24 · confidence 0.7 · code-inferred*


---

## 2. Listings feed (/skelbimai)

*Audited at all widths incl. boundary pairs, in 7 URL states (search, category, city, filtered, page 2, empty, long query) live + 4 pagination and 3 empty/error mock scenarios, filter popovers/sheet, catrail, skeletons, offline strip. 117 substantiated findings (4 HIGH · 76 MEDIUM · 37 POLISH) — the largest chapter, mostly MEDIUM density/consistency work.*

**Band walkthrough.** ≤560: 2-up dense grid holds; card compact skin issues (9.5 px eyebrow RSP-021, 36 px favourite RSP-015, delivery badge colliding with the heart at 320–350 on stress titles RSP-112). Catrail chips are 38 px (RSP-122) and the active chip is never scrolled into view (RSP-131). Seam 560/561: filter UI flips sheet↔popovers cleanly, but card type steps +50 % on the price line (RSP-149). 561–700: the *desktop* toolbar renders in the sticky bar as 3 wrapped rows ≈ 250 px pinned (RSP-321-class, filed under landings; same component). 701–1024: 3-up grid clean; sticky nav+filterbar ≈ 32–35 % of short viewports (RSP-165). Seam 1024/1025: 3-up→4-up card-width cliff. 1025–1536: clean; LT category eyebrows ellipsize at 4-col (RSP-137-class). ≥1537: 5-up full-width band reads deliberate; count/sort row alignment holds to 3840.

**States.** The empty state is the feed's weak spot: `white-space:nowrap` ≥561 clips long query echoes off both edges (RSP-107, verified); out-of-range pages triple-contradict (RSP-108, verified at `?page=2` with 4 listings); beyond-end and filter-blame copy fire without filters set. Skeleton geometry mismatches the loaded compact skin ≤560 (RSP-shape family), and the hydration-measured interruption banner defaults to a 6-card split pre-measure, causing an SSR mid-row break + post-hydration row jump on 2-/3-col bands (RSP-114). Pagination at 87 mock items works at first/mid/last; the pager is honest except beyond-end.

### All findings — Listings feed

### empty-state

**RSP-107 · HIGH** — Empty-state headline with a long search query is nowrap-clipped off BOTH screen edges >=561px (561–1500px, state: empty-search; locales: en, lt)

- **What:** globals.css:828 forces white-space:nowrap on .nk-empty__title at min-width:561px, but the title interpolates the raw user query (en.ts:613 `No listings found for “${q}”`, lt.ts:695). With the captured 60+-char query the single line renders wider than the viewport and is clipped at both left and right edges: at 673px only '...r “profesionali fotografijos ir apsvietimo iranga renginia...' is visible; same at 700, 744 and 768px in both locales. The head and tail of the sentence (including 'No listings found') are unreadable.
- **Why:** The zero-results explanation is the core message of this state; a headline bleeding off both edges at every tablet/small-desktop width is far below the 2026 marketplace bar and reads as broken. Long queries are exactly the ones that produce zero results, so this fires on the mainstream path.
- **Fix:** Delete the nowrap rule at app/globals.css:828 (or scope it to a max-width:0 never); instead give .nk-empty__title text-wrap:balance and overflow-wrap:anywhere, and consider truncating the echoed query to ~40 chars with an ellipsis in searchTitle() in both dictionaries.
- **Evidence:** `feed-q-long/base-en-0673x0841-dpr2-fp.png` · `feed-q-long/base-lt-0700x0900-dpr2-vp.png` · `feed-q-long/base-en-0768x1024-dpr2-fp.png` · app/globals.css:828 @media(min-width:561px){.nk-empty__title{white-space:nowrap}}; app/globals.css:826 .nk-empty__title
- *RB-01 · confidence 0.97 · measured · verified (orchestrator re-check: shot + code) · also reported as RSP-109, RSP-115, RSP-319*

### pager

**RSP-108 · HIGH** — Out-of-range ?page=2 renders three contradictions: 'Page 2 of 1', '4 listings' over an empty grid, and a filters-blame empty state (561–1920px, state: page-out-of-range; locales: en, lt)

- **What:** With totalCount=4 (1 page of 12) and ?page=2, the feed simultaneously shows: (a) result meta '4 listings' (FeedScreen.tsx:205-210 uses backend totalCount even when the loaded page is empty), (b) the L3 filter empty state 'No listings match these filters / Clear filters' although the user set no filters — renderEmpty() at FeedScreen.tsx:392-394 falls through to the filter branch for an empty page, and (c) the SEO pager status 'Page 2 of 1' (FeedScreen.tsx:632 pageStatus(params.page, totalPages) with no clamp; showPager at :410 stays true because params.page > 1). Verified at 900 and 1120 px.
- **Why:** These are indexable SEO pagination URLs — stale search-engine links land real users here. Three mutually contradicting claims on one screen ('4 listings', 'no listings', 'page 2 of 1') would embarrass any leading marketplace and erodes trust in every other count on the site.
- **Fix:** In FeedScreen.tsx: when data resolves and params.page > totalPages, treat it as an out-of-range state — show a dedicated 'This page no longer exists' empty variant with a link to page 1 (not the filter-blame copy), suppress countLabel (extend the countKnown guard at :214 to loaded-page emptiness), and clamp/hide pageStatus at :632 so 'Page N of M' never shows N > M (or 301 to the last page server-side for landing routes).
- **Evidence:** `feed-page2/base-en-0900x1280-dpr2-fp.png` · `feed-page2/base-en-1120x0800-fp.png` · app/globals.css:1180 .nk-seopager
- *RB-19 · confidence 0.95 · measured · verified (orchestrator re-check: shot + code)*

### cards

**RSP-112 · HIGH** — 'Pristatymas' delivery badge runs under the favorite button on 2-up cards at 320–350px (320–350px)

- **What:** At ≤560 the feed is 2-up (globals.css:1899). The badge is white-space:nowrap with max-width:calc(100% - 52px) but NO overflow:hidden/text-overflow, so the real LT label 'Pristatymas' (icon 11 + gap 6 + text ~61px @10.5px + 16px padding ≈ 94–100px from left:10) paints past its own pill and under the 36px fav button (right:10) whenever the card is narrower than ~150px — i.e. viewports ≤~350px (320: card ~139px, overlap ~15–17px; 344 Fold cover: card ~147px, overlap ~4px). Confirmed in the 320 crop: the badge text's last glyphs sit under the heart circle.
- **Why:** Every delivery-flagged listing shows this label — not synthetic content — so iPhone SE/Fold-cover users see text/button collision on the primary browse surface (also fattens the fav mis-tap zone). RB-21 foldable width is directly hit.
- **Fix:** Add overflow:hidden;text-overflow:ellipsis to .nk-offer__badge (globals.css:731) and correct the ≤560 reserve to clear the fav: max-width:calc(100% - 56px) with the fav occupying right:10+36 (globals.css:1918); or swap to an icon-only badge below ~380px.
- **Evidence:** `mock-stress-feed/base-lt-0320x0568-dpr2-fp.png` · `mock-pag-last/base-lt-0320x0568-dpr2-fp.png` · `mock-stress-feed/base-lt-0344x0882-dpr2-fp.png` · app/globals.css:1918 .nk-offer__badge (≤560 override); app/globals.css:731 .nk-offer__badge
- *RB-01 · confidence 0.9 · measured*

**RSP-118 · MEDIUM** — Card type/geometry is a double system: inline px styles fought by 20+ !important compact overrides (320–560px, locales: en, lt; any)

- **What:** OfferCard hardcodes inline sizes (cards.tsx:83 h3 fontSize:20/minHeight:50; :96 price 27px; :86/:107 meta 14.5px) and the ≤560 layer re-declares every one with !important (globals.css:1900-1919: h3 15px!important, eyebrow 9.5px!important, price 18px!important, fav 36px!important, badge 10.5px!important…). The CSS comment (globals.css:1892) documents that !important exists only because the card carries inline styles.
- **Why:** Two competing sizing systems on the same elements is the exact RB-09 defect: any future inline tweak silently wins on desktop and is dead on mobile, and the compact skin can never be tuned per container (rail vs grid). Fragile selectors like .nk-offer__pricebar>span:first-child>span:first-child (globals.css:1906) break on markup reorder.
- **Fix:** Move OfferCard's type/geometry from inline style={} to nk- classes with clamp()/--nk-fs-* tokens (or container-query units, see the RB-03 finding), then delete the !important block at globals.css:1899-1919.
- **Evidence:** `feed/base-lt-0360x0800-dpr2-vp.png` · `feed/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1895-1929 @media(max-width:560px) compact card skin; app/globals.css:1892 comment admitting !important is required
- *RB-09 · confidence 0.95 · measured*

**RSP-119 · MEDIUM** — Compact card skin is a stepped !important layer fighting inline card styles (double type system) (431–560px, locales: en, lt)

- **What:** OfferCard carries fixed inline type/geometry (cards.tsx:83 h3 fontSize:20/lineHeight:25/minHeight:50, :96 price 27px, :86 location 14.5px, fav 48px at :720). globals.css:1895-1929 then re-specifies ~16 of those values with !important at <=560 (h3 15px!important, price 18px!important, fav 36px!important, .o-new>span padding!important...). The block's own comment admits "!important is required where the card carries inline styles".
- **Why:** Two sources of truth for one component's type: any card edit must be made twice, selectors like .nk-offer__pricebar>span:first-child>span:first-child are structure-coupled and silently break on markup changes, and the stepped overrides preclude fluid scaling — this is exactly the RB-09 double-system anti-pattern and the root cause of the 560px type cliff.
- **Fix:** Move OfferCard type/geometry out of inline styles into nk- classes driven by tokens (or container-query units), letting one declaration per property scale across bands; delete the !important layer at globals.css:1900-1919.
- **Evidence:** `feed/base-lt-0431x0932-dpr2-vp.png` · app/globals.css:1895 @media(max-width:560px) compact skin; app/globals.css:1900-1919 16 !important declarations
- *RB-09 · confidence 0.95 · measured*

**RSP-120 · MEDIUM** — "Pristatymas" badge text overflows its pill and runs under the favorite heart at ≤343px (320–343px, any)

- **What:** .nk-offer__badge sets white-space:nowrap + max-width:calc(100% - 52px) (≤560 override, globals.css:1917) but has NO overflow:hidden/text-overflow, so the nowrap label paints past the pill edge. At 320px the 2-up card is ~135 CSS px wide, badge max-width ~83px, while icon(11)+gap(6)+text(~68 at 10.5px)+padding(16) ≈ 101px — the text escapes the pill background and collides with the 36px .nk-fav disk (heart occupies x≈89–125 on the card). Auto-metric leads flag the same clip on all three LT 320 shots; 344px and EN ("Delivery") are clean.
- **Why:** Card text visually crashing into a control on the core browse surface reads as broken; a leading 2026 marketplace never lets a trust badge collide with an action. Affects the DEFAULT locale (LT) on 320-class devices.
- **Fix:** Add overflow:hidden;text-overflow:ellipsis to .nk-offer__badge (app/globals.css:730-734) so the max-width actually truncates with an ellipsis instead of letting nowrap text escape the pill.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · `feed/skeleton-feed-lt-0320x0568-dpr2-vp.png` · `feed/base-lt-0344x0882-dpr2-vp.png` · app/globals.css:730 .nk-offer__badge; app/globals.css:1917 .nk-offer__badge (≤560 compact)
- *RB-01 · confidence 0.92 · measured*

**RSP-125 · MEDIUM** — Compact card skin is a stepped !important type ladder bottoming out at 9.5px (320–560px, locales: en, lt)

- **What:** The ≤560 skin overrides the OfferCard's inline-styled type with ~14 !important declarations (globals.css:1896-1922), stepping the category eyebrow to 9.5px letter-spaced uppercase and the delivery badge to 10.5px. Manifest minFontPx confirms 9.5px rendered text on feed and detail (similar-items rail) at 320-390.
- **Why:** 9.5px tracked uppercase is below any practical legibility floor for body-distance reading, and the !important-vs-inline-style double system is exactly the fluid-type anti-pattern RB-09 targets: two sources of truth fighting per breakpoint instead of one fluid scale.
- **Fix:** Raise the floor to ≥11px and replace the !important ladder by moving OfferCard type onto --nk-fs-* clamp() tokens (or container-query units) in cards.tsx so no per-band override layer is needed.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · `detail-full/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1903 .nk-offer__eyebrow{font-size:9.5px!important}; app/globals.css:1918 .nk-offer__badge{font-size:10.5px!important}
- *RB-09 · confidence 0.9 · measured*

**RSP-127 · MEDIUM** — OfferCard renders in 3+ container contexts but sizes its type via viewport media only (769–1920px, locales: en, lt)

- **What:** OfferCard is used in the feed grid (.nk-grid-feed, 5/4/3/2/1-up), the home shelf (.nk-grid-4) and the listing-detail similar rail (.nk-grid-4--rail, max 4-up + <=560 snap carousel) — different tile widths at the same viewport. Its type is fixed inline px (h3 20px/25px at cards.tsx:83, price 27px at cards.tsx:96) and the only responsive skin is a viewport @media(max-width:560px) block of !important overrides (globals.css:1899-1916). The repo has zero @container. So a 205px feed tile at 1025px viewport and a ~340px rail tile at the same viewport get identical type.
- **Why:** Per-context sizing via viewport queries is the exact case container queries solve; the current !important override layer is fragile (memory notes already document selector-coupling pain) and any new card context inherits the wrong skin. 2026 practice: size card anatomy to the tile, not the viewport.
- **Fix:** Add container-type:inline-size to the grid item wrapper (the display:grid div at FeedScreen.tsx:350) or the grids, move the <=560 compact skin plus the title/price sizes into @container (max-width:230px)-style rules, and drop the !important layer.
- **Evidence:** `feed/base-lt-1025x0768-fp.png` · `feed/base-lt-1024x0768-fp.png` · app/globals.css:1898 .nk-grid-feed,.nk-grid-4 (<=560 2-up); app/globals.css:1899-1916 compact card skin !important overrides
- *RB-03 · confidence 0.9 · code-inferred*

**RSP-128 · MEDIUM** — OfferCard next/image sizes declares 46vw where the grid renders ~28vw (3-/4-up bands) (769–1280px, locales: en, lt)

- **What:** cards.tsx:59 sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 416px" does not match the grid ladder: at 761-1024 the feed renders 3-up (~27-30vw, 210-285px) but declares 46vw — ~1.6x linear / ~2.5x byte oversize at dpr2; at 1101-1280 it renders 4-up (~205-280px) but declares 416px (~1.5x). The 92vw arm also assumes the old 1-up phone grid although <=560 is now 2-up (~46vw) since the Quiet Luxe layer (globals.css:1898).
- **Why:** Every card photo on tablets/small desktops downloads ~2-2.5x the needed bytes — LCP and data cost on the core browse surface; the sizes string fossilized a previous grid.
- **Fix:** Sync sizes to the actual ladder, e.g. "(max-width:560px) 46vw, (max-width:700px) 46vw, (max-width:1024px) 31vw, (max-width:1280px) 24vw, 300px" (or derive from auto-fill minmax if the RB-02 fix lands) at cards.tsx:59.
- **Evidence:** `feed/base-lt-0900x1280-dpr2-fp.png` · `feed/base-lt-1119x0800-vp.png` · app/globals.css:1184 .nk-grid-feed 3-up band; app/globals.css:1183 4-up band
- *RB-17 · confidence 0.9 · code-inferred*

**RSP-129 · MEDIUM** — LT category eyebrow ellipsizes ('ELEKTRONIKA IR TECHN…') on 4-col desktop cards; also 10.5px is below the legibility floor (1025–1280px)

- **What:** The card eyebrow is white-space:nowrap + text-overflow:ellipsis (globals.css:704-707) at 10.5px/.17em letter-spacing (the Quiet-Luxe override at :1849). In the 4-col band (1025-1280) card inner width is ~185-200px, so the Lithuanian label 'ELEKTRONIKA IR TECHNOLOGIJOS' truncates to 'ELEKTRONIKA IR TECHN…' (verified at 1112px). Longer LT labels ('GARSAS, MUZIKA IR RENGINIŲ TECHNIKA') will truncate even earlier. EN labels mostly fit ('ELECTRONICS & TECH' at 900px).
- **Why:** The eyebrow is the card's category scent; cutting the localized label mid-word on the default-locale desktop band looks unfinished, and 10.5px uppercase with wide tracking sits below the ~11px legibility floor for meta text (WCAG 1.4.12 spacing bumps make it truncate further).
- **Fix:** Allow the eyebrow to shrink gracefully instead of ellipsizing: shorten LT display labels for card context, or drop letter-spacing to .1em and raise font-size back to 11.5px at globals.css:1849, and prefer clipping via max-width with title attr; ideally make it container-driven (see the CQ finding).
- **Evidence:** `feed-filtered/base-lt-1112x0834-vp.png` · `feed-filtered/base-en-0900x1280-dpr2-fp.png` · app/globals.css:704 .nk-offer__eyebrow (nowrap+ellipsis); app/globals.css:1849 .nk-offer__eyebrow{font-size:10.5px;letter-spacing:.17em}
- *RB-10 · confidence 0.9 · measured*

**RSP-130 · MEDIUM** — OfferCard next/image sizes attr over-requests 1.5-3x the rendered width across the 561-1100 bands (561–1100px, locales: en, lt)

- **What:** cards.tsx:59 declares sizes="(max-width:760px) 92vw, (max-width:1100px) 46vw, 416px", but the grid ladder renders: 2 columns at 561-700 (card ~46vw, requested 92vw = 2x), 3 columns at 701-760 (card ~30vw, requested 92vw = 3x), 3 columns at 761-1024 (card ~30vw, requested 46vw = 1.5x), 4 columns at 1025-1100 (card ~23vw, requested 46vw = 2x). Only the <=560 single-column band matches 92vw.
- **Why:** At DPR2 a 3x width overshoot is ~9x the pixels per thumbnail — wasted bytes and slower LCP on exactly the tablet band, violating the sizes-must-match-rendered-width practice (RB-17).
- **Fix:** Align breakpoints with the grid ladder in cards.tsx:59, e.g. sizes="(max-width:560px) 92vw, (max-width:700px) 46vw, (max-width:1024px) 31vw, (max-width:1280px) 24vw, 300px".
- **Evidence:** `feed-filtered/base-en-0900x1280-dpr2-fp.png` · `feed-filtered/base-lt-1112x0834-vp.png` · app/globals.css:1182 .nk-grid-feed column ladder
- *RB-17 · confidence 0.9 · code-inferred*

**RSP-132 · MEDIUM** — OfferCard renders in ≥3 container contexts but is skinned only by viewport @media (320–560px, locales: en, lt)

- **What:** The same OfferCard renders at ~158px (2-up feed at 360), ~250px (2-up at 561-700), ~230px (5-up desktop feed), ~240px (detail 'similar items' snap rail, globals.css:1950 grid-auto-columns:min(68%,240px)) and ~416px (home shelf). All sizing/typography is inline px plus one viewport media block (globals.css:1896-1915) — the repo has zero @container. A 240px rail card at 800px viewport gets the 416px-card type scale (20px h3, 27px price) while a 265px feed card at 560px gets the compact scale.
- **Why:** Identical card widths receive different anatomies depending on page context; container queries would collapse the !important skin and the 560/561 cliff in one move — this is the flagship CQ migration target for the site.
- **Fix:** Give .nk-grid-feed/.nk-grid-4/.nk-grid-4--rail container-type:inline-size and move the compact skin to @container (max-width:200px)/(max-width:280px) buckets keyed on the card's own slot; drop the inline px type on cards.tsx:83/96 in favour of tokens.
- **Evidence:** `feed-filtered/base-lt-0360x0800-dpr2-fp.png` · `feed-filtered/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1182 .nk-grid-feed; app/globals.css:1950 .nk-grid-4--rail
- *RB-03 · confidence 0.9 · code-inferred*

**RSP-134 · MEDIUM** — Card location line hard-clips an unbreakable token flush at the card edge, no ellipsis (320–1920px)

- **What:** The location span (cards.tsx:86–88) is a flex row with no overflow-wrap/hyphens/text-overflow. The stress subdivision 'Nepertraukiamožodžiotestasr…' wraps to its own line (after 'Marijampolė,') then overflows horizontally and is hard-cut by the card's overflow:hidden — the glyphs run through the 14–20px card padding and end flush at the card border at every band read (320, 430, 560, 768, 1280); the auto-metric flags the same clipped span at all widths. Normal multi-word locations wrap fine; only unbroken tokens longer than the card column fail.
- **Why:** Truncation quality: text bleeding through padding to the card edge with a raw glyph cut reads broken; the sibling h3 already has overflow-wrap:anywhere so the omission is an inconsistency a flagship release would catch.
- **Fix:** On the location span in cards.tsx:86 add minWidth:0 and overflowWrap:'anywhere' (matching globals.css:701), or single-line it with overflow:hidden;text-overflow:ellipsis;white-space:nowrap.
- **Evidence:** `mock-stress-feed/base-lt-0430x0932-dpr2-fp.png` · `mock-stress-feed/base-lt-0768x1024-dpr2-fp.png` · `mock-stress-feed/base-lt-1280x0800-fp.png` · app/globals.css:701 .nk-offer h3{overflow-wrap:anywhere} (location span lacks the equivalent); app/globals.css:702 .nk-offer__body{min-width:0}
- *RB-10 · confidence 0.9 · visual*

**RSP-135 · MEDIUM** — Favorite disk shrinks to 36x36px on phones — under the 44px touch floor (320–1024px, locales: en, lt)

- **What:** The compact skin reduces the card's favorite button to 36x36px at <=560 (globals.css:1915; base is 48px at :720, 42px in the Quiet Luxe layer at :1866). Measured ~36px CSS in the 431/432 shots. It sits over the card's stretched link, so a missed tap navigates to the listing instead of opening the save-to-app bridge.
- **Why:** A sub-44px overlay control whose miss triggers a DIFFERENT action (navigation) is the worst-case small target; 44px min (48 preferred) is the 2026 touch bar and the codebase's own --nk-tap token.
- **Fix:** Keep the 36px visual disk but restore a >=44px hit area: e.g. give .nk-fav a ::after{content:'';position:absolute;inset:-5px} or padding+background-clip, at app/globals.css:1915.
- **Evidence:** `feed/base-lt-0431x0932-dpr2-vp.png` · `feed/base-lt-0432x0932-dpr2-vp.png` · `mock-stress-feed/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1915 .nk-offer .nk-fav{width:36px!important;height:36px!important}
- *RB-12 · confidence 0.9 · measured*

**RSP-137 · MEDIUM** — Compact card skin drops category eyebrow to 9.5px (uppercase, .14em tracked) — below mobile floor (320–560px, locales: en, lt; any)

- **What:** At ≤560 .nk-offer__eyebrow becomes 9.5px!important uppercase with .14em tracking (globals.css:1902; the auto-metric minFontPx=9.5 on every shot in this band) and .nk-offer__badge drops to 10.5px (:1917). 11.5→9.5px is a 17% step (RB-05-scale cliff) applied ad-hoc per element rather than via the fluid --nk-fs-* system. LT category names ("ELEKTRONIKA IR T…") are long, so users get tiny AND truncated labels.
- **Why:** Sub-10px uppercase tracked text is below the ~11px 2026 mobile readability floor used by leading marketplaces; the category eyebrow is the card's only category context in the feed.
- **Fix:** Raise the compact eyebrow to ≥10.5-11px (globals.css:1902) and the badge to ≥11px, or scale via clamp() so the step from the 11.5px base stays <15%.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · `feed/base-lt-0344x0882-dpr2-vp.png` · `feed/base-en-0360x0800-dpr2-vp.png` · app/globals.css:1902 .nk-offer__eyebrow 9.5px!important; app/globals.css:1917 .nk-offer__badge 10.5px!important
- *RB-24 · confidence 0.9 · measured*

**RSP-138 · MEDIUM** — OfferCard renders in 3 container contexts, all sized by viewport MQ ladders; zero @container in repo (344–1920px, locales: en, lt)

- **What:** The same OfferCard is laid out by (1) the feed grid .nk-grid-feed (uncapped ultrawide, max-width:none at :1942), (2) the home shelf .nk-grid-4 (capped container), and (3) the listing-detail similar rail .nk-grid-4--rail (4-up desktop, 68%-wide snap carousel <=560). All three size the card via duplicated viewport media ladders (560/700/1024/1280) plus a <=560 !important type skin, so identical viewport width yields different card widths per context, and the feed needs a JS ResizeObserver hook (useMeasuredColumns) just to learn its own column count for the banner split.
- **Why:** This is the canonical container-query migration target: with container-type:inline-size on the three wrappers, card type/geometry would respond to actual card width, the triplicated ladders collapse to one @container ruleset, and the JS column measurement plus splitAt guesswork become unnecessary.
- **Fix:** Add container-type:inline-size to .nk-grid-feed/.nk-grid-4/.nk-grid-4--rail (or a shared wrapper), move the <=560 compact card skin (globals.css:1899-1918) into @container (max-width:~230px) rules keyed on the card's own container.
- **Evidence:** `feed/base-lt-0701x0900-dpr2-fp.png` · `feed/base-lt-1025x0768-fp.png` · `home/base-lt-1440x0900-fp.png` · app/globals.css:1183 .nk-grid-feed repeat(5) + 1184-1187 MQ ladder; app/globals.css:1460 .nk-grid-4 repeat(5) + same ladder
- *RB-03 · confidence 0.9 · code-inferred*

**RSP-139 · MEDIUM** — Compact card skin re-types OfferCard via ~20 !important fixed-px rules over inline styles (344–560px, locales: en, lt)

- **What:** OfferCard's type/geometry is authored as inline styles in cards.tsx, so the <=560 'Quiet Luxe mobile layer' must override it with a block of !important stepped pixel rules (h3 15px/19px/min-height:38px, eyebrow 9.5px, meta 12.5px, price 18px, fav 36px, etc. - the CSS comment itself concedes '!important is required where the card carries inline styles'). Two competing type systems now own the same element: fluid --nk-fs-* tokens plus a brittle selector-shape-dependent override stack (.nk-offer__body>span:not(...), .o-new>span).
- **Why:** RB-09 double-system: any markup reorder in cards.tsx silently breaks the mobile skin; the !important wall also blocks the container-query migration and makes zoom/text-spacing behaviour unpredictable.
- **Fix:** Move OfferCard font-size/gap/geometry values from inline styles to nk- classes driven by custom properties (--offer-title-fs etc.), then have the <=560 (or @container) skin retarget the properties - deleting the !important stack.
- **Evidence:** `feed/base-lt-0560x0900-dpr2-fp.png` · `home/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1899-1918 <=560 compact card skin (!important stack)
- *RB-09 · confidence 0.9 · code-inferred*

**RSP-140 · MEDIUM** — Card category eyebrow drops to 9.5px uppercase tracked type on phones - below the 10px floor (344–560px, locales: en, lt)

- **What:** The <=560 compact skin sets .nk-offer__eyebrow to 9.5px with .14em letter-spacing and uppercase. This is the smallest text on the site (auto-metric minFontPx 9.5 on both home and feed at 560) and it carries real information (the listing's category). LT category names are long ('ELEKTRONIKA IR TECHNOLOGIJOS'), so at 9.5px they both strain legibility and still truncate.
- **Why:** Sub-10px uppercase tracked type on the primary browse surface fails the practical mobile legibility floor (and reads as cramped rather than 'dense') - a flagship marketplace keeps micro-labels >=10.5-11px.
- **Fix:** Raise to 10.5px (match the desktop value at globals.css:1850) and reclaim space by tightening letter-spacing to .1em, or drop the eyebrow on the compact skin like the category tiles drop their example line (globals.css .nk-catv2__sub display:none pattern).
- **Evidence:** `home/base-lt-0560x0900-dpr2-fp.png` · `feed/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1903 .nk-offer__eyebrow{font-size:9.5px!important;letter-spacing:.14em!important}
- *RB-24 · confidence 0.9 · measured*

**RSP-141 · MEDIUM** — OfferCard renders in ≥3 container contexts but sizes itself via viewport @media — CQ migration target (320–560px, locales: en, lt; any)

- **What:** The same OfferCard renders in: (1) the feed grid .nk-grid-feed (1fr→5-up by viewport ladder, 2-up compact at ≤560 where a card is ~135-160px), (2) the listing-detail similar rail .nk-grid-4--rail whose snap columns are min(68%,240px) at ≤560 and 4-up ≥1281, and (3) the home offers shelf (.nk-grid-4). Its compact skin keys on @media(max-width:560px) only: a 240px-wide rail card at a 561px viewport gets the FULL desktop skin (20px h3, 27px price, 48px fav) while a 270px feed card at 559px gets the compact skin — same rendered width, two opposite skins.
- **Why:** The repo has zero @container; per-context card width, not viewport, is what should drive the compact skin. This is the canonical container-query candidate and would also delete the RB-09 !important layer.
- **Fix:** Declare container-type:inline-size on the grid/rail wrappers and convert the compact skin (globals.css:1899-1919) to @container (max-width:~200px) rules keyed on the card's own width.
- **Evidence:** `feed/base-lt-0360x0800-dpr2-vp.png` · `feed/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1182-1186 .nk-grid-feed ladder; app/globals.css:1898 2-up override
- *RB-03 · confidence 0.9 · code-inferred*

**RSP-142 · MEDIUM** — Card next/image sizes claims 92vw on phones but the grid is 2-up (~44vw) — ~4x pixel over-fetch (320–760px, locales: en, lt; any)

- **What:** cards.tsx:59 sets sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 416px", written for the old 1-up mobile column. Since the Quiet Luxe 2-up mobile grid (globals.css:1898) a card renders ≈(100vw − 2·gutter − 10px)/2 ≈ 42-45vw at ≤560, and the 561-700 grid is also 2-up. On a 360px dpr2 phone the browser selects a ≈662px-wide source for a ≈160px slot (~320 device px needed) — ≈4x the pixels/bytes per photo across the infinite-scroll feed.
- **Why:** Mobile data waste and slower LCP on the most image-heavy core surface; sizes must match rendered widths per band (RB-17).
- **Fix:** Update cards.tsx:59 to reflect the 2-up bands, e.g. sizes="(max-width: 700px) 46vw, (max-width: 1100px) 33vw, 416px" (tune per .nk-grid-feed ladder at globals.css:1182-1186/1898).
- **Evidence:** `feed/base-lt-0360x0800-dpr2-vp.png` · `feed/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1898 .nk-grid-feed 2-up ≤560
- *RB-17 · confidence 0.9 · measured*

**RSP-143 · MEDIUM** — Favorite heart shrinks to a 36×36px touch target on phones, below the site's own 44px --nk-tap (320–560px, locales: en, lt; any)

- **What:** The compact skin sets .nk-offer .nk-fav to 36×36px (globals.css:1915) with no padding/pseudo-element hit extension; the button is the entire target. The repo's own token --nk-tap:44px is documented as "minimum interactive target (WCAG 2.5.8)" (globals.css:149). At ≤560 every card carries this sub-44 control, sitting inside the card's stretched link so misses trigger navigation instead.
- **Why:** 36px is below the project's stated 44px floor and the 2026 48px preference; a missed tap on the heart navigates to the listing (destructive mis-tap on the core browse loop).
- **Fix:** Keep the 36px visual disk but restore the hit area: add `.nk-offer .nk-fav::after{content:"";position:absolute;inset:-6px}` (or padding+background-clip) so the effective target is ≥44px, z-index already above the stretch link.
- **Evidence:** `feed/base-lt-0344x0882-dpr2-vp.png` · `feed/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1915 .nk-offer .nk-fav 36px; app/globals.css:720 .nk-fav base 48px
- *RB-12 · confidence 0.9 · measured*

**RSP-144 · MEDIUM** — Card category eyebrow is 9.5px uppercase letterspaced on phones — below legibility floor (361–430px, locales: en, lt)

- **What:** The <=560px compact card skin sets .nk-offer__eyebrow to font-size:9.5px with .14em letter-spacing on an all-caps label (globals.css:1902). Auto-metrics confirm minFontPx 9.5 on every B2 shot; visually the eyebrow ('ELEKTRONIKA IR TEC...', 'TRANSPORTAS') is the smallest text on the page and also truncates with ellipsis at 361-430.
- **Why:** 9.5px uppercase is below the ~11px practical floor for body-adjacent UI text (and browsers with a 10-11px minimum-font-size setting will re-layout it, breaking the card rhythm). WCAG 1.4.4 zoom equivalence degrades further: at 200% this is the informational category scent for image-less cards.
- **Fix:** Raise the compact eyebrow to >=10.5-11px (and reduce letter-spacing to ~.10em) in globals.css:1902; the 2-up card has vertical room since the h3 already reserves 38px.
- **Evidence:** `feed/base-lt-0390x0844-dpr2-vp.png` · `feed/base-lt-0361x0800-dpr2-fp.png` · `feed/base-en-0430x0932-dpr2-fp.png` · app/globals.css:1902 .nk-offer__eyebrow{font-size:9.5px!important;letter-spacing:.14em!important}
- *RB-11 · confidence 0.9 · measured*

**RSP-145 · MEDIUM** — Card category eyebrow renders at 9.5px letterspaced uppercase on phones (431–560px, locales: en, lt)

- **What:** The compact skin drops .nk-offer__eyebrow to 9.5px with .14em tracking (globals.css:1902) — the auto-metric's page-wide minFontPx is exactly 9.5. In the 431px shots the eyebrow ("ELEKTRONIKA IR TECHN...") is the smallest text on screen and also ellipsizes in a ~156px text box.
- **Why:** 9.5px is below the ~10-11px floor flagship marketplaces hold for informative text; uppercase + tracking + truncation makes the category scent barely legible on the highest-traffic surface. It is informative content (category), not decoration.
- **Fix:** Raise the compact eyebrow to >=10.5px (matching the base 1849 rule) and win specificity without !important once the inline-style double system is removed; if space is tight, drop tracking to .1em instead of shrinking the glyphs.
- **Evidence:** `feed/base-lt-0431x0932-dpr2-vp.png` · `feed/base-lt-0432x0932-dpr2-vp.png` · app/globals.css:1902 .nk-offer__eyebrow{font-size:9.5px!important}
- *RB-24 · confidence 0.9 · measured*

**RSP-147 · MEDIUM** — OfferCard next/image sizes declares 92vw while cards render 190-297px (2.4-3.4x over-fetch) (561–768px, locales: en, lt)

- **What:** cards.tsx:59 sets sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 416px". In this band the grid is 2-up (561-700, card ~253-297px) and 3-up (701-768, card ~190-213px), so the browser is told to fetch 516-700px-wide candidates (92vw) - and at dpr2 that doubles - for slots one third that size. Even the 761-768 rung resolves 46vw (~353px) vs a ~210px slot.
- **Why:** 3x linear over-fetch = ~9-11x wasted image bytes per card on the single most image-heavy surface, on the mobile/tablet band where bandwidth matters most - directly against next/image best practice (sizes must match rendered width per band).
- **Fix:** Align sizes with the real grid ladder in cards.tsx:59, e.g. "(max-width:560px) 46vw, (max-width:700px) 44vw, (max-width:1024px) 30vw, (max-width:1280px) 23vw, 288px" (2-up compact skin at <=560 makes 92vw wrong there too); regenerate after any grid change - or migrate the grid to container queries and use fixed slot widths.
- **Evidence:** `feed/base-lt-0701x0900-dpr2-vp.png` · `feed/base-lt-0673x0841-dpr2-fp.png` · app/globals.css:1182-1185 .nk-grid-feed
- *RB-17 · confidence 0.9 · code-inferred*

**RSP-149 · MEDIUM** — Compact card skin cliff at 560/561: card width is ~equal on both sides but type drops 25-33% (540–580px, locales: en, lt)

- **What:** Both 560 and 561px render 2-up cards of nearly identical width (at 560: (560-2*33.6-10)/2 = 241px; at 561: (561-2*33.7-22)/2 = 236px), yet the ≤560 !important skin (globals.css:1906-1913) drops the h3 from the card's inline 20px to 15px, price 27px to 18px, and pads 20px to 14px — a hard 1px discontinuity while the actual card geometry is continuous. The px-!important skin also fights the house fluid-type direction (--nk-fs-* clamp system): the card type is fixed px at every width with one cliff instead of scaling with the card.
- **Why:** Users near the cliff (fold phones, tablet split-view, browser resize) see the whole product grid re-set its type scale with no layout reason; a fluid or width-aligned skin is the 2026 norm.
- **Fix:** Either align the compact-skin query with the card-width ladder (apply it to the whole 2-up range, ≤700px) or replace the fixed px pairs with clamp() so 15px→20px interpolates across 360-700px; anchor at app/globals.css:1901-1913.
- **Evidence:** app/globals.css:1903 .nk-grid-feed/.nk-grid-4 2-up ≤560; app/globals.css:1906-1913 compact !important type skin
- *RB-09 · confidence 0.85 · code-inferred*

**RSP-152 · MEDIUM** — Card favorite button shrinks to 36x36 on phones and sits on the card's stretched link (320–560px, locales: en, lt)

- **What:** The ≤560 compact skin forces .nk-fav to 36x36px (from 44). The button floats over the card image whose entire surface is the listing link (.nk-stretch, cards.tsx:135), so any miss on the 36px circle immediately navigates to the detail page instead of opening the favorite (app-redirect) action.
- **Why:** 36px is below the 44px minimum precisely on the band where fingers, not cursors, hit it, and the miss-cost is maximal (page navigation, not a dead tap). 2026 marketplaces keep overlay actions ≥44px or expand the hit area invisibly.
- **Fix:** globals.css:1916 — keep the visual disk 36px but restore the hit area: add ::after{content:'';position:absolute;inset:-6px} (or keep width/height 44px and shrink only the icon).
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1916 .nk-offer .nk-fav{width:36px!important;height:36px!important}
- *RB-12 · confidence 0.85 · measured*

**RSP-153 · MEDIUM** — 'Pristatymas' delivery badge text clips mid-word on 2-up cards at ≤360px (320–375px)

- **What:** .nk-offer__badge is white-space:nowrap with max-width:calc(100% - 52px) and no overflow:hidden/text-overflow. On the 2-up feed grid at 320px (cards ~140px wide, badge cap ~88px) the label 'Pristatymas' (needs ~100px at 10.5px + icon + padding) is cut with a hard edge — the capture metric flags 3 clipped badge instances and the fp shot shows truncated pills on 3 of 4 cards.
- **Why:** A hard mid-word clip on a trust badge looks broken, not truncated — exactly the kind of detail that reads as un-QA'd on small Androids (360px is still the LT market's most common width).
- **Fix:** globals.css:731 — add overflow:hidden;text-overflow:ellipsis to .nk-offer__badge; better: below 380px render the badge icon-only with an aria-label (cards.tsx hasDelivery branch).
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:731 .nk-offer__badge (white-space:nowrap, no overflow handling); app/globals.css:1918 compact override max-width:calc(100% - 52px)
- *RB-01 · confidence 0.85 · measured*

**RSP-155 · MEDIUM** — <=560 compact skin fights the token system with !important steps and drops text to 9.5px (320–560px, locales: en, lt)

- **What:** The compact-skin block overrides card type with stepped !important rules: .nk-offer__eyebrow{font-size:9.5px!important;letter-spacing:.14em!important} (globals.css:1903) and .nk-offer__badge{...font-size:10.5px!important...} (globals.css:1918), on top of the base 10.5px eyebrow (globals.css:1850). This is the source of the auto-metric minFontPx 9.5 at 320-361px. It's a double system — hard steps with !important instead of the clamp()/--nk-fs-* fluid tokens the rest of the site uses — and 9.5px letterspaced uppercase is below the ~10px legibility floor on the band where most users are.
- **Why:** 9.5px microcopy on phones fails the 2026 mobile-legibility bar and the !important step layer makes future fluid-type tuning silently no-op on these elements (RB-09 double-system defect).
- **Fix:** Replace the !important steps at globals.css:1903/1918 with fluid sizes on the base rules, e.g. .nk-offer__eyebrow{font-size:clamp(10px,2.6vw,10.5px)} — and delete the !important overrides from the <=560 block.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · `home/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1903 .nk-offer__eyebrow (<=560 override); app/globals.css:1918 .nk-offer__badge (<=560 override)
- *RB-09 · confidence 0.85 · measured*

**RSP-158 · MEDIUM** — OfferCard renders in 3+ container contexts (feed grid, similar rail, home shelf) but all sizing is viewport-media driven — prime @container migration target (561–1920px, locales: en, lt)

- **What:** The repo has zero @container rules. OfferCard is placed in .nk-grid-feed (5/4/3/2/1 viewport ladder, globals.css:1182-1186), .nk-grid-4--rail on listing detail (different 4-up cap at :1946), and the home offers shelf — yet its internal type (20px title, 27px price, 10.5px eyebrow) and the eyebrow's truncation behaviour are fixed per viewport, not per card width. The eyebrow truncation defect at 4-col and the sizes-attr mismatch are both symptoms: the card cannot adapt to the ~185-300px width range its containers actually give it.
- **Why:** Container queries are baseline-stable and the 2026 norm for marketplace card systems; keying card anatomy to viewport width guarantees seam bugs every time a new container context is added.
- **Fix:** Declare container-type:inline-size on the grid wrappers (.nk-grid-feed > div, .nk-grid-4--rail children) and move the card's type scale + eyebrow visibility into @container (min-width) steps; replace the .nk-grid-feed repeat-N ladder with repeat(auto-fill,minmax(240px,1fr)) so column count derives from available space.
- **Evidence:** `feed-filtered/base-lt-1112x0834-vp.png` · `feed-filtered/base-en-0900x1280-dpr2-fp.png` · app/globals.css:1182 .nk-grid-feed viewport ladder; app/globals.css:1946 .nk-grid-4--rail
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-159 · MEDIUM** — 560→561 seam: card title +33% and price +50% type jump with no layout change (500–620px, locales: en, lt)

- **What:** Both sides of the 560/561 seam render the same 2-column feed grid (globals.css:1898 vs :1185), but the compact skin ends at 560: h3 15px→20px (cards.tsx:83 inline), price 18px→27px (cards.tsx:96), eyebrow 9.5px→10.5px, fav disk 36px→42px. Card width barely changes (≈265px→≈250px) while every type size cliffs well past the 15% seam budget.
- **Why:** Resizing across the seam (or rotating a large phone) visibly 'pops' the entire card anatomy; the cliff exists because card type is viewport-stepped rather than container- or token-driven.
- **Fix:** Extend the compact skin to the 2-up range (change globals.css:1896 media to max-width:700px) or interpolate with clamp()/container-query units so the two 2-up bands share one card scale.
- **Evidence:** `feed-filtered/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1901 .nk-offer h3 (15px!important); app/globals.css:1906 pricebar 18px!important
- *RB-05 · confidence 0.85 · code-inferred*

**RSP-161 · MEDIUM** — Offer-card category eyebrow drops to 9.5px (!important) on phones — below any legible-type floor (320–560px, locales: en, lt; any)

- **What:** The card eyebrow (e.g. 'ELEKTRONIKA IR TECHNOL…') is 10.5px letterspaced uppercase at base and is stepped down to 9.5px with !important at ≤560px (globals.css:1903), the page-wide minimum font the auto-metric flags (minFontPx 9.5 on every ≤560 shot). LT labels additionally truncate ('ELEKTRONIKA IR TECHNOL…' at 561).
- **Why:** Sub-10px letterspaced uppercase on a dark theme is illegible for many users and fails the spirit of WCAG 1.4.4 (200% zoom = mobile band shows the smallest type of the whole site); an !important stepped override also fights the token type system (RB-09).
- **Fix:** Raise the eyebrow to ≥11px on phones and drop the !important step at app/globals.css:1903 (tokenize as an --nk-fs-eyebrow clamp instead); let long LT category names ellipsize as they already do.
- **Evidence:** `feed/nav-cta-stage-lt-0561x0900-dpr2-vp.png` · `feed/nav-cta-stage-en-0560x0900-dpr2-vp.png` · app/globals.css:1850 .nk-offer__eyebrow (10.5px); app/globals.css:1903 .nk-offer__eyebrow 9.5px!important @≤560
- *RB-11 · confidence 0.85 · measured*

**RSP-163 · MEDIUM** — 560→561 seam: card stays 2-up but title jumps 15→20px (+33%) and price 18→27px (+50%) (540–700px)

- **What:** Both sides of the 560/561 boundary render the identical 2-up feed grid (card ~251px at 560 vs ~252px at 561), but the ≤560 compact skin's !important overrides lapse: h3 15px→20px inline, price 18px→27px, eyebrow 9.5→11.5px, meta 12.5→14.5px, fav 36→42px, gaps 5px→token. One CSS pixel of viewport growth makes every card ~25% taller with no layout cause — a type-size cliff far beyond the 15% seam budget.
- **Why:** Users resizing/rotating across the seam see the whole browse surface reflow; it exposes that the card is skinned per-viewport instead of scaling with its container (the 2-up band actually spans 320–700).
- **Fix:** Key the compact skin to the same boundary as the 2-up grid's card width: either extend the compact overrides to ≤700 (align globals.css:1899 block with :1186), or replace the stepped px with clamp()/cqi-driven sizes on the card so 560/561 renders identically.
- **Evidence:** `mock-stress-feed/base-lt-0560x0900-dpr2-fp.png` · `feed-q-long/base-lt-0673x0841-dpr2-fp.png` · app/globals.css:1899 .nk-grid-feed 2-up ≤560; app/globals.css:1186 .nk-grid-feed 2-up 561–700
- *RB-05 · confidence 0.85 · code-inferred*

**RSP-164 · MEDIUM** — OfferCard is rendered in 3+ container contexts but skinned by viewport @media + !important; zero @container in repo (320–1920px, locales: en, lt)

- **What:** The same OfferCard renders in (a) .nk-grid-feed at 1–5 columns via a five-step viewport ladder, (b) the home offers shelf (.nk-grid-4), and (c) the listing-detail similar rail — yet its type/geometry is set by inline px styles fought by a ≤560 viewport-media !important skin (22 declarations, globals.css:1899–1920). The repo has zero @container rules. Symptoms already emitted separately: the 560/561 type cliff and the badge/fav collision, both of which are card-width problems, not viewport problems (a 2-up 320px-viewport card is ~139px while a 5-up 1480px-viewport card is ~240px — the narrow card gets the LARGER type).
- **Why:** This is the canonical container-query migration target: card density depends on its column width, and the current viewport proxy inverts (5-up desktop cards are narrower than the 561px 2-up cards that get full-size type). CQ + fluid clamp() would delete the !important layer and both seam bugs.
- **Fix:** Add container-type:inline-size to the card wrapper (the display:grid div in FeedScreen.tsx:350) or .nk-grid-feed items, move the compact skin to @container (max-width:~200px) rules, and replace stepped px with clamp() over cqi.
- **Evidence:** `mock-stress-feed/base-lt-0320x0568-dpr2-fp.png` · `mock-stress-feed/base-lt-1280x0800-fp.png` · app/globals.css:1183–1187 .nk-grid-feed width ladder; app/globals.css:1899–1920 ≤560 !important card skin
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-169 · MEDIUM** — OfferCard is viewport-media sized but rendered in 3+ container contexts — prime @container migration target (361–430px, locales: en, lt)

- **What:** OfferCard renders in (a) the feed grid at ~166px columns (2-up <=560), (b) the listing-detail similar rail at min(68%,240px) snap cells, (c) the home offers shelf, and (d) 3-5-up desktop grids — yet its compact skin keys off @media(max-width:560px) (globals.css:1896). The repo has zero @container rules. A 240px rail cell at a 700px viewport gets the full-size 20px/27px card type meant for ~416px columns, while a 166px feed cell at 560px gets the compact skin only because the viewport happens to be narrow.
- **Why:** Card density/type should follow the cell it lives in, not the window; this is exactly the case container queries were shipped for and the 2026 baseline (all evergreen browsers) supports them. It would also delete the seam where the same physical card width renders two different skins on either side of 560px.
- **Fix:** Declare container-type:inline-size on the grid/rail cells and move the globals.css:1896-1918 card overrides to @container (max-width:220px)-style rules keyed on card width; this also removes the !important layer.
- **Evidence:** `feed/base-lt-0390x0844-dpr2-vp.png` · `feed/base-lt-0430x0932-dpr2-vp.png` · app/globals.css:1896-1918 @media(max-width:560px) compact card skin; app/globals.css:1948-1952 .nk-grid-4--rail phone snap rail
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-170 · MEDIUM** — 560->561 seam: card type jumps +33-50% while the grid stays 2-up on both sides (431–700px, locales: en, lt)

- **What:** The compact card skin ends at exactly 560px, but the column count does NOT change at that seam (2-up at <=560 via globals.css:1898 AND 2-up at 561-700 via :1185). Crossing 560->561: h3 15px->20px (+33%), price 18px->27px (+50%), location 12.5px->14.5px, eyebrow 9.5px->10.5px, fav disk 36->42px, card pad 14px->clamp(20..26px) — in cards whose width barely changes (~241px at 560 vs ~243px at 561).
- **Why:** RB-05 caps type cliffs at 15% across adjacent breakpoints without a layout cause; here identical 2-up cards render two entirely different type scales 1px apart. Users see it on rotation/resize, and 561-700px devices get card type sized for 5-up desktop cards squeezed into ~250px columns.
- **Fix:** Extend the compact skin's boundary to match the 2-up range (apply globals.css:1895 block to max-width:700px), or better, make card type fluid (clamp()/cqi) so the 560 cliff disappears entirely.
- **Evidence:** `feed/base-lt-0560x0900-dpr2-vp.png` · `feed/base-lt-0540x0720-dpr2-vp.png` · app/globals.css:1901 .nk-offer h3 (15px!important); app/globals.css:1906 .nk-offer__pricebar price (18px!important)
- *RB-05 · confidence 0.85 · code-inferred*

**RSP-171 · MEDIUM** — OfferCard is rendered in 3+ container contexts but its compact skin is viewport-gated (431–560px, locales: en, lt)

- **What:** OfferCard renders in (1) the feed grid .nk-grid-feed (1-5 columns, ~185-416px slots), (2) the listing-detail similar rail .nk-grid-4--rail (min(68%,240px) snap columns at <=560, 4-up above), and (3) the home Offers grid — yet its compact skin keys on @media(max-width:560px). A 240px rail card at a 561px viewport gets the desktop skin (20px h3, 27px price, 48px fav) while a 241px feed card at 560px gets the compact skin; identical card widths, different anatomies. The repo has zero @container rules.
- **Why:** Container-size-driven components are the 2026 baseline for card systems reused across grids and rails; viewport gating guarantees mismatched skins whenever slot width and viewport width diverge, and forces the seam-cliff and !important layering reported separately.
- **Fix:** Make .nk-grid-feed / .nk-grid-4--rail / the home grid container-type:inline-size and convert the globals.css:1895 card rules to @container (max-width:~230px), sizing the card by its slot.
- **Evidence:** `feed/base-lt-0431x0932-dpr2-vp.png` · app/globals.css:1895 @media(max-width:560px) compact skin; app/globals.css:1950 .nk-grid-4--rail (240px snap columns)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-172 · MEDIUM** — OfferCard renders in >=2 container contexts but is sized entirely by viewport media - CQ migration target (561–768px, locales: en, lt)

- **What:** The same OfferCard renders in the feed grid (.nk-grid-feed: 190-297px slots in this band), the home offers grid (.nk-grid-4, different ladder: 5-up base per globals.css:1458), and landing rails - yet all its responsive behaviour (eyebrow size, compact skin, badge max-width, price/type steps) hangs off viewport @media (incl. the <=560 !important layer at globals.css:1896-1918). At 701-768 the card gets its 'wide' skin inside a 190px column - the mismatch behind the eyebrow truncation and badge crowding; the repo has zero @container rules.
- **Why:** Container queries are the 2026-standard fix: the card should adapt to its slot (190px slot gets the compact skin regardless of viewport), eliminating per-grid ladder coupling and the whole class of seam bugs found in this band.
- **Fix:** Declare container-type:inline-size on the grid item wrapper (FeedScreen.tsx:350 card wrapper div) and convert the <=560 compact-card overrides (globals.css:1896-1918) plus badge/eyebrow steps to @container (max-width:230px) rules; keeps one card skin per slot width across feed/home/rails.
- **Evidence:** `feed/base-lt-0701x0900-dpr2-vp.png` · `feed/base-lt-0700x0900-dpr2-vp.png` · app/globals.css:1182 .nk-grid-feed; app/globals.css:1458 .nk-grid-4
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-180 · MEDIUM** — LT 'Pristatymas' badge abuts the favorite heart (~2-5px gap) on 3-up cards, reads as collision (701–768px)

- **What:** At 701-768px the feed is 3-up and cards render ~190-213 CSS px wide. The glass 'Pristatymas' delivery badge (natural width ~111px, left:16) extends to its max-width cap calc(100% - 76px) while the 42px heart button sits at right:16 - leaving a computed 2-5px gap. In the 701 and 768 shots (Dodge RAM, Apple Macbook cards) the two translucent glass pills visually merge/collide. The badge also has white-space:nowrap + max-width but NO overflow:hidden/text-overflow, so any locale string longer than the cap would spill text outside the pill.
- **Why:** Two chrome elements fusing on the primary browse card at mainstream tablet widths reads as broken craft for a 2026 marketplace; the badge also crowds the 42px touch target below the 8px spacing minimum (RB-12). EN 'Delivery' is short enough that only LT users see it.
- **Fix:** In globals.css:730 raise the reserve to max-width:calc(100% - 84px) and add overflow:hidden;text-overflow:ellipsis to .nk-offer__badge (mirror the ≤560 override at globals.css:1917); alternatively shrink badge padding/font at 3-up widths.
- **Evidence:** `feed/base-lt-0701x0900-dpr2-vp.png` · `feed/base-lt-0768x1024-dpr2-vp.png` · `feed/base-lt-0744x1133-dpr2-fp.png` · app/globals.css:730 .nk-offer__badge; app/globals.css:720 .nk-fav
- *RB-01 · confidence 0.8 · measured*

**RSP-185 · MEDIUM** — 'Pristatymas' delivery badge truncates on 2-up cards at <=360px (320–360px)

- **What:** In the <=560 2-up card grid, the image badge is capped at max-width:calc(100% - 52px) (globals.css:1918) to clear the favourite button. At 320px the card image is ~130px wide, so the cap is ~78px and the LT label 'Pristatymas' (needs ~85-95px at 10.5px + icon + padding) is clipped — the auto-metric flags span.nk-offer__badge clipped 3x at 320 on both feed and home shelf. EN 'Delivery' fits.
- **Why:** The delivery badge is a decision-driving trust signal; a chopped Lithuanian label on the default locale at a mainstream small-phone width looks broken.
- **Fix:** In the <=560 block (globals.css:1918) either swap the badge to icon-only below ~380px card widths, or use a shorter LT compact string via a narrower breakpoint class, rather than letting text clip.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · `home/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:731 .nk-offer__badge; app/globals.css:1918 .nk-offer__badge max-width override
- *RB-01 · confidence 0.7 · measured*

**RSP-197 · POLISH** — Card typography is a double stepped system (inline px + !important media overrides); eyebrow hits 9.5px (320–560px, locales: en, lt)

- **What:** OfferCard sets every type size as inline px (cards.tsx:83,86,96,97,107) and the ≤560 skin re-steps them with 11 !important rules (globals.css:1900-1915) — the block's own comment concedes '!important is required where the card carries inline styles'. The site's fluid --nk-fs-* token system is bypassed entirely, and the compact eyebrow lands at 9.5px uppercase (globals.css:1902), below the ~10.5px craft floor.
- **Why:** Two parallel stepped systems on one element is the anti-pattern RB-09 targets: it created the 560/561 cliff, blocks container-query migration, and makes every future card tweak a two-place edit.
- **Fix:** Move card type to CSS classes with clamp()/token values (extend --nk-fs-*) so the media layer only adjusts tokens; raise the eyebrow floor to 10px.
- **Evidence:** `feed-filtered/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1893 compact-skin comment; app/globals.css:1902 .nk-offer__eyebrow 9.5px!important
- *RB-09 · confidence 0.9 · code-inferred*

**RSP-199 · POLISH** — Card typography is a double system: inline fixed px in JSX fought by 14 !important media overrides (361–430px, locales: en, lt)

- **What:** OfferCard sets fixed inline sizes (h3 20px/25px, price 27px, meta 14.5px in cards.tsx:84-105) which the <=560 layer then rewrites with !important (h3 15px/19px, price 18px, meta 12.5px, globals.css:1899-1913). The stylesheet's own banner comment admits '!important is required where the card carries inline styles'. Type steps 27px->18px (-33%) and 20px->15px (-25%) across the 560/561 seam, exceeding the 15% cliff guideline.
- **Why:** Two competing sources of truth make every future card change a two-file edit and guarantee specificity bugs; a clamp()/token scale (or container-query units per RB-03) would give one fluid system and remove the >15% seam cliff.
- **Fix:** Move the card's font sizes out of inline style into .nk-offer__* classes using clamp() or cqi-based values; delete the !important block at globals.css:1899-1913.
- **Evidence:** `feed/base-lt-0430x0932-dpr2-vp.png` · app/globals.css:1899-1913 !important compact type overrides
- *RB-09 · confidence 0.9 · code-inferred*

**RSP-201 · POLISH** — Fixed-size icon/logo images declare intrinsic width 287-409 for 32-64px renders — 4-10x fetches (320–3840px, locales: en, lt)

- **What:** InterruptionBanner (cards.tsx:157) gives icon.png width={409} height={409} but styles it to 64px; without sizes, next/image emits x-descriptor srcset from the width prop, so browsers fetch the ~640w rendition (1x) / 828w (2x) for a 64px box (~10x linear). AppRedirect (AppRedirect.tsx:132) similarly declares the logo at 287w for a 32px-high (~143px) render (~2.7x). Files are small (icon.png 13.7KB source) so this is bytes-polish, not UX.
- **Why:** Needless decode/transfer on the feed's mid-scroll banner and the conversion modal; trivially fixed by declaring rendered dimensions.
- **Fix:** cards.tsx:157: width={64} height={64} (serve 128w on retina); AppRedirect.tsx:132: width={144} height={32}.
- **Evidence:** app/globals.css:1206 .nk-interrupt img ≤560 (64px !important)
- *RB-17 · confidence 0.85 · code-inferred*

**RSP-203 · POLISH** — OfferCard is sized by viewport media in 3+ container contexts — prime container-query migration (320–1024px, locales: en, lt)

- **What:** The same OfferCard renders in the feed grid (2-up ~145px-wide cells at 320), the detail 'Panašūs daiktai' snap rail (min(68%,240px) columns), and the home shelf, but its compact skin keys off @media(max-width:560px). A 240px rail card and a 145px grid card get identical type; a 300px card at viewport 561px gets the full desktop skin. The repo has zero @container rules.
- **Why:** This is exactly why the !important ladder exists (finding on RB-09): the card can't know its own width. One @container (inline-size) skin would size all three contexts correctly and delete the per-viewport override layer.
- **Fix:** Make card containers container-type:inline-size and convert globals.css:1896-1922 offer-card overrides to @container (max-width:200px)/(max-width:260px) steps.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · `detail-full/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1896 @media(max-width:560px) compact card skin; app/globals.css:1951 .nk-grid-4--rail auto-columns min(68%,240px)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-204 · POLISH** — Category eyebrow is 10.5px and ellipsis-truncates ('ELEKTRONIKA IR TECHNO...') at most band widths (769–1280px, locales: en, lt)

- **What:** The card eyebrow is 10.5px uppercase with .17em tracking (globals.css:1849 — the page-wide minimum font size in every capture). The long LT label 'Elektronika ir technologijos' truncates to 'ELEKTRONIKA IR TECHNO...' on 3-up tiles at 769-834 and on 4-up tiles at 1025-1280 (EN 'ELECTRONICS & TECH...' at 1120), rendering fully only in the roomy 900-1024 window — so the most common desktop band shows a chopped label.
- **Why:** A 10.5px truncated label is at the legibility floor and reads unfinished next to 2026 marketplace card craft; the category scent the eyebrow exists for is exactly what gets cut.
- **Fix:** Allow the eyebrow to wrap to 2 lines (remove the truncation) or use the shorter chip label ('Elektronika') for tile eyebrows; consider 11-11.5px at >=769 (revert toward the globals.css:704 base).
- **Evidence:** `feed/base-lt-0769x1024-dpr2-vp.png` · `feed/base-lt-1025x0768-fp.png` · `feed/base-en-1120x0800-vp.png` · app/globals.css:1849 .nk-offer__eyebrow; app/globals.css:704 .nk-offer__eyebrow base
- *RB-10 · confidence 0.85 · visual*

**RSP-205 · POLISH** — Card favorite disk shrinks to 36×36 on phones and sits over the stretched card link (320–560px, locales: en, lt)

- **What:** The ≤560 compact skin forces .nk-fav to 36×36 (globals.css:1915) from 42/48px. It floats over the full-card <Link> (cards.tsx:47-52), so a missed tap doesn't fail silently — it navigates to the listing instead of opening the favorite bridge modal.
- **Why:** Sub-44px target whose miss-behaviour is a page navigation; 2026 guidance is ≥44px for overlaid toggles on imagery.
- **Fix:** Keep the 36px visual disk but restore the hit area: add ::after{content:'';position:absolute;inset:-6px} to .nk-fav, or keep width/height 44px with a smaller inner glyph at globals.css:1915.
- **Evidence:** `feed-filtered/base-lt-0360x0800-dpr2-vp.png` · app/globals.css:1915 .nk-offer .nk-fav (36px ≤560)
- *RB-12 · confidence 0.85 · code-inferred*

**RSP-212 · POLISH** — Favorite heart is 42x42px on touch-band cards - 2px under the 44px minimum (561–768px, locales: en, lt)

- **What:** The Quiet Luxe layer overrides .nk-fav from 48x48 (globals.css:720) to 42x42 (globals.css:1866) at all widths >560; this band (561-768) is a touch band, so the only interactive control layered on the card photo sits just below the 44px floor, and the delivery badge crowds it to a 2-5px gap at 3-up.
- **Why:** 44x44 is the rubric floor (48 preferred) for touch targets; a favorite tap that misses opens the card link instead - an annoying misfire on the core browse action.
- **Fix:** Keep the 42px visual circle but restore the hit area: add ::after{content:'';position:absolute;inset:-4px} to .nk-fav, or revert the override to 44px at <=1024px.
- **Evidence:** `feed/base-lt-0768x1024-dpr2-vp.png` · app/globals.css:1866 .nk-fav override
- *RB-12 · confidence 0.85 · code-inferred*

**RSP-213 · POLISH** — Card category eyebrow is 10.5px uppercase tracked type - the band's smallest text, borderline legible (561–768px, locales: en, lt)

- **What:** The Quiet Luxe layer (globals.css:1849) steps the offer-card eyebrow down from 11.5px to 10.5px with .17em tracking and a 42%-mixed accent color; the auto-metric confirms 10.5px as minFontPx in every shot of this band. Combined with LT's long category names it also ellipsizes at 3-up ('ELEKTRONIKA IR TE...').
- **Why:** 10.5px uppercase low-contrast-mix type is below the ~11px comfortable floor at standard density; as the card's category scent it carries real information, not decoration.
- **Fix:** Hold the eyebrow at 11.5px (drop the globals.css:1849 size override, keep the tracking/color retune), or switch it to a --nk-fs-* fluid token with an 11px floor.
- **Evidence:** `feed/base-lt-0701x0900-dpr2-vp.png` · `feed/base-lt-0768x1024-dpr2-vp.png` · app/globals.css:1849 .nk-offer__eyebrow (Quiet Luxe 10.5px); app/globals.css:704 .nk-offer__eyebrow base
- *RB-24 · confidence 0.85 · measured*

**RSP-224 · POLISH** — Compact-skin favorite heart is 36px on phones, under the 44px house floor (320–560px, locales: en, lt)

- **What:** The ≤560 compact card skin shrinks .nk-fav to 36×36 (!important). It is the only inner control on the card (z-index above the stretched link) and opens the install bridge; 36px is above WCAG 2.5.8's 24px minimum but below the codebase's own --nk-tap:44px contract, with the card link surface directly adjacent on all sides.
- **Why:** Mis-taps on the heart navigate to the listing instead of opening the bridge — a small conversion leak on the densest surface.
- **Fix:** Keep the 36px visual but extend the hit area: add a ::before{inset:-4px} hit-slop or padding+background-clip so the target is ≥44px (globals.css:1920).
- **Evidence:** app/globals.css:1920 .nk-offer .nk-fav{width:36px!important;height:36px!important}; app/globals.css:149 --nk-tap:44px
- *RB-11 · confidence 0.7 · code-inferred*

### grid

**RSP-114 · HIGH** — Interruption-banner split re-shuffles the feed after hydration: columns measured post-paint, default 6 (1025–3840px, state: base, post-hydration; locales: en, lt)

- **What:** useMeasuredColumns seeds cols=1 in useState (useMeasuredColumns.ts:10) and reads gridTemplateColumns inside a plain useEffect (line 12-25), i.e. after first paint. FeedScreen.tsx:344 computes splitAt = Math.max(columns, Math.round(6/columns)*columns): with the pre-measure value (columns=1) splitAt=6 — this is what SSR HTML and the first client paint show. On a 5-column desktop (≥1281px) the real measure yields splitAt=5, so card #6 visibly jumps from above the banner to below it; on 4-column (1025-1280) splitAt becomes 8, so the banner drops a full row and every tail card shifts up. The reshuffle happens on every feed load, right in the primary browse surface.
- **Why:** Post-load layout shift on the core browse grid — a card and a full-width banner visibly relocating after content has painted is exactly the CLS class of defect 2026 marketplace UIs are expected to have eliminated; SSR'd markup makes the wrong split real pixels, not a skeleton.
- **Fix:** Seed the column count synchronously from a matchMedia ladder mirroring the .nk-grid-feed breakpoints (560/700/1024/1280) in useMeasuredColumns's useState initializer (SSR-safe fallback 4), and switch the measuring effect to useLayoutEffect so the correction lands before paint. FeedScreen.tsx:344 then computes the right split on first client render, and SSR can be aligned by rendering the banner between grids only after N=whole-row counts for the ladder value.
- **Evidence:** app/globals.css:1183 .nk-grid-feed (4-up 1025-1280); app/globals.css:1182 .nk-grid-feed (5-up base ≥1281 after cap revoked at 1941)
- *RB-18 · confidence 0.85 · code-inferred*

**RSP-116 · MEDIUM** — Phone grid columns defined twice at equal specificity — 2-up survives by source order alone (320–560px, locales: en, lt)

- **What:** The ≤560 feed/offer grids are declared 1fr at :1191/:1467 and re-declared repeat(2,minmax(0,1fr)) in the Quiet Luxe layer at :1903. Both selectors and media conditions are identical, so the 2-up mobile browsing grid — a headline feature of the mobile upgrade — depends purely on the later block staying later in the file. The same order-fragility governs .nk-hero-panel 1fr at :1470 vs the 901-1024 2-col re-establishment at :1477.
- **Why:** Any refactor that splits globals.css, reorders layers, or extracts the Quiet Luxe block silently reverts phones to a 1-up column (a documented regression class). Latent but the failure mode is a full mobile-layout regression.
- **Fix:** Delete the dead 1fr declarations at globals.css:1191 and :1467 (the 2-up rule at :1903 is the intended value), or move the mobile value into the original ladder block.
- **Evidence:** app/globals.css:1191 .nk-grid-feed ≤560 {grid-template-columns:1fr} (dead); app/globals.css:1467 .nk-grid-4 ≤560 {grid-template-columns:1fr} (dead)
- *RB-01 · confidence 0.95 · code-inferred*

**RSP-117 · MEDIUM** — Page beyond end renders 'Page 2 of 1', a filter-blaming empty state, and a contradictory count (320–560px, locales: en, lt)

- **What:** feed-page2 (?page=2 with totalCount=4, 1 real page) shows: count row '4 listings / 4 pasiūlūymai' directly above an empty grid; empty state 'No listings match these filters / Pagal šiuos filtrus...' though the user set no filters (FeedScreen.tsx:392-394 fallback branch); pager status 'Page 2 of 1 / 2 puslapis iš 1' (FeedScreen.tsx:631-633, totalPages computed at :409 without clamping params.page).
- **Why:** Indexed ?page=N URLs outlive shrinking inventory, so real Google visitors land here; three mutually contradictory claims on one screen is below the truthfulness bar the rest of this feed carefully holds.
- **Fix:** In app/components/FeedScreen.tsx: clamp params.page to totalPages once known (or add an out-of-range empty variant with 'Back to page 1'), suppress the totalCount label when the current page resolved empty, and never emit pageStatus when params.page > totalPages.
- **Evidence:** `feed-page2/base-lt-0360x0800-dpr2-fp.png` · `feed-page2/base-en-0560x0900-dpr2-fp.png` · app/globals.css:1180 .nk-seopager
- *RB-19 · confidence 0.95 · measured*

**RSP-126 · MEDIUM** — Feed grid is a fixed repeat() width ladder; 1024->1025 drops card width ~28% in 1px (769–1280px, locales: en, lt)

- **What:** grid-template-columns steps 5/4/3/2/1 via viewport media queries (1281+/1025-1280/701-1024/561-700/<=560). Crossing 1024->1025 the column count jumps 3->4: card width goes ~283px -> ~205px (-28%) and full-page height drops 3189px -> 2353px in a 1px resize. At 1025 the fixed 20px title / 27px price type sits in a 205px column (tightest of the whole band) while a 1024px viewport gets a roomy 283px card.
- **Why:** Width ladders create seam discontinuities auto-fill/minmax would remove, and every card-anatomy tweak must be re-validated against 5 hardcoded bands; 205px is at the awkward edge for the card's fixed type scale. The rubric flags exactly this ladder pattern as the migration target.
- **Fix:** Replace the ladder with grid-template-columns:repeat(auto-fill,minmax(240px,1fr)) on .nk-grid-feed (globals.css:1182), keeping the <=560 2-up override; this also removes the 1183/1184/1185 media blocks and makes useMeasuredColumns' value stable across seams.
- **Evidence:** `feed/base-lt-1024x0768-fp.png` · `feed/base-lt-1025x0768-fp.png` · app/globals.css:1182 .nk-grid-feed; app/globals.css:1183 @media(min-width:1025px) and (max-width:1280px)
- *RB-02 · confidence 0.9 · measured*

**RSP-133 · MEDIUM** — Zero-result title echoes the unbounded search query — 7-line display heading at 320px (320–560px, locales: en, lt)

- **What:** empty.searchTitle(params.q) (FeedScreen.tsx:368) interpolates the raw query into the 26px display heading. The captured 71-char query renders as 7 centered lines at 320 (LT), 6 at 344, 5 at 360, 4 at 430 — the heading dwarfs the guidance and actions below it, and nothing bounds a longer or unbroken-token query.
- **Why:** An empty state should lead with recovery, not a wall of echoed input; every leading marketplace truncates the echo (~40-60 chars + ellipsis).
- **Fix:** Truncate before interpolating: searchTitle(q.length > 48 ? q.slice(0,48).trimEnd() + '…' : q) at the FeedScreen.tsx:368 call site (locale-neutral), and add overflow-wrap:anywhere to .nk-empty__title for unbroken tokens.
- **Evidence:** `feed-q-long/base-lt-0320x0568-dpr2-fp.png` · `feed-q-long/base-en-0430x0932-dpr2-vp.png` · `feed-q-long/base-lt-0360x0800-dpr2-fp.png` · app/globals.css:826 .nk-empty__title
- *RB-10 · confidence 0.9 · visual*

**RSP-146 · MEDIUM** — Width-ladder grid forces 190px cards at 701px - below the system's own 230px card minimum (561–768px, locales: en, lt)

- **What:** nk-grid-feed steps 2-up (561-700) -> 3-up (701-1024) via a media ladder. At the 700->701 seam the card width cliffs from ~297px to ~190px (-36%); 190px is under the design system's own --nk-offer-min 230px token (used by other offer grids). Consequences visible in shots: LT eyebrow truncates to 'ELEKTRONIKA IR TE...', the delivery badge crowds the heart, and the 4:3 photo shrinks 36% in one pixel of viewport growth.
- **Why:** An auto-fit/minmax(230px,1fr) intrinsic grid would never produce a column narrower than the card's design minimum and removes the seam cliff entirely - the exact seam-bug class RB-02 targets; the codebase already uses this pattern for .nk-grid-cats (globals.css:1096).
- **Fix:** Replace the 561-1024 ladder rungs in globals.css:1182-1185 with grid-template-columns:repeat(auto-fit,minmax(min(100%,var(--nk-offer-min)),1fr)) (keep an explicit cap at the widest tier if 5-up must be exact), or move the 3-up threshold up to ~790px.
- **Evidence:** `feed/base-lt-0700x0900-dpr2-vp.png` · `feed/base-lt-0701x0900-dpr2-vp.png` · `feed/base-lt-0701x0900-dpr2-fp.png` · app/globals.css:1182-1185 .nk-grid-feed ladder; app/globals.css:217 --nk-offer-min:230px
- *RB-02 · confidence 0.9 · measured*

**RSP-150 · MEDIUM** — Ultrawide 5-up cards render up to 324px but sizes falls back to 240px — upscaled photos (1440–3840px, locales: en, lt)

- **What:** Since the 1480px --nk-content-cap was revoked (globals.css:1946 max-width:none), the 5-up feed/home grids track the full 1920px container: at 1920 viewport a card is (1920-2*82-4*34)/5 = 324px wide. OfferCard's sizes fallback is 240px (cards.tsx:59), so a DPR1 desktop fetches the 256w rendition and upscales ~27%; DPR2 fetches 480→640w vs 648 needed (near-exact, so retina is fine — the defect is DPR1/1.25 ultrawide monitors, the standard desktop case).
- **Why:** Softened product photos across the entire first screen on large desktop — exactly the surface the 5-up 'inventory density' redesign was meant to flatter.
- **Fix:** Bump the fallback in cards.tsx:59 to ~330px (or restore the content cap; if the cap stays revoked also delete the dead --nk-content-cap token, globals.css:219).
- **Evidence:** app/globals.css:1946 .nk-grid-feed{max-width:none}; app/globals.css:337 .nk-container max-width 1920
- *RB-17 · confidence 0.85 · code-inferred*

**RSP-157 · MEDIUM** — Interruption-banner split defaults to 6 pre-measurement: mid-row break + post-hydration row jump on 4-/5-up grids (769–1920px, locales: en, lt)

- **What:** FeedScreen.tsx:344 computes splitAt from useMeasuredColumns, which is 1 until the ResizeObserver's first read (useMeasuredColumns.ts:10), so SSR HTML and the first client paint always split head/tail at 6 cards. On a 4-up grid (1025-1280) the correct split is 8 and on 5-up (1281+) it is 5 or 10: with >=7 results the server-rendered page shows a ragged 2-card partial row above the banner, then 2 cards jump across the banner once the measurement lands. The code comment at FeedScreen.tsx:341-344 acknowledges the shift. Not visible in current captures only because the live API returns 4 listings (< splitAt).
- **Why:** A visible layout jump right at/below the first viewport of results is CLS on the core browse path, and on slow connections the ragged pre-hydration state persists for seconds — the exact 'JS-measured layout must not jump on first paint' failure RB-18 names.
- **Fix:** Derive the initial column count from the same breakpoints CSS uses (e.g. matchMedia in a useSyncExternalStore snapshot, or SSR-safe CSS: render the banner as a grid child with grid-column:1/-1 placed via nth-child per band) instead of defaulting columns to 1; alternatively seed useMeasuredColumns with a width->columns map matching globals.css:1182-1186.
- **Evidence:** `feed/base-lt-1025x0768-fp.png` · app/globals.css:1182 .nk-grid-feed
- *RB-18 · confidence 0.85 · code-inferred*

**RSP-166 · MEDIUM** — Feed grid column ladder sawtooths card width 320->205px at 700/701; 3-up band starts too narrow (701–1024px)

- **What:** grid-template-columns steps 2->3 at 701 and 3->4 at 1025 via fixed repeat() counts. At 700 a 2-up card is ~320px; one pixel later a 3-up card is ~205px (-36%). At 701-768 these are the narrowest cards anywhere on the site: the category eyebrow truncates ('ELEKTRONIKA IR TE...') and titles ellipsize harder than in either neighbouring band, then card width climbs back to ~300px by 1024 and drops to ~216px at 1025.
- **Why:** An auto-fit/minmax(~220px,1fr) (or container-query) grid would keep card width inside a designed min/max envelope with no seam cliffs, and would also remove the need for the JS column measurement that exists only because CSS owns the count.
- **Fix:** Replace the ladder at app/globals.css:1183-1187 with grid-template-columns:repeat(auto-fill,minmax(215px,1fr)) (keep the <=560 2-up override), or move the ladder into @container steps per the CQ finding.
- **Evidence:** `feed/base-lt-0700x0900-dpr2-fp.png` · `feed/base-lt-0701x0900-dpr2-fp.png` · `feed/base-lt-1024x0768-fp.png` · app/globals.css:1183-1187 .nk-grid-feed fixed repeat() ladder
- *RB-02 · confidence 0.85 · measured*

**RSP-177 · MEDIUM** — Card image sizes ends at '240px' but the uncapped 5-up grid renders ~324px cards at 1920 (1281–1920px, locales: en, lt)

- **What:** OfferCard's sizes attribute (cards.tsx:59) closes with a fixed 240px slug for >1280px — sized for the old 1480px --nk-content-cap — but the design-review override .nk-grid-feed{max-width:none} (globals.css:1942) lets the 5-up grid span the full 1920px container: card = (1920 − 2×82 gutter − 4×34 gap)/5 ≈ 324px. next/image therefore requests a 240w-based candidate (480 at dpr2) for a 324px slot — ~26% linear under-resolution, so listing photos upscale soft on exactly the widest, most photo-forward layout.
- **Why:** RB-17: sizes must match rendered width per band; blurry inventory photos at desktop is a direct product-quality hit for a marketplace.
- **Fix:** cards.tsx:59: change the final slug to ~'(max-width:1560px) 260px, 340px' (or compute 20vw for the uncapped band).
- **Evidence:** `feed-q-long/base-lt-1920x1080-fp.png` · `mock-stress-feed/base-lt-1280x0800-fp.png` · app/globals.css:1942 .nk-grid-feed{max-width:none}; app/globals.css:1183 .nk-grid-feed 5-up default
- *RB-17 · confidence 0.8 · code-inferred*

**RSP-178 · MEDIUM** — Interruption banner shifts rows after hydration at 4/5-col widths (splitAt 6 -> 8 or 5) (1025–1920px, locales: en, lt)

- **What:** FeedScreen.tsx:344 computes the banner split as Math.max(columns, Math.round(6/columns)*columns) with columns initialised to 1 (useMeasuredColumns.ts:10), so first paint always splits after card 6. Once ResizeObserver reads the real track count, splitAt becomes 8 at 4 columns and 5 at 5 columns - the banner and every card after it jump one to two grid cells (a full row height, ~300px+) shortly after load. The code comment acknowledges 'the banner may shift one row once the real count is read'.
- **Why:** A visible layout shift on every desktop feed load (CLS on the core browse surface) - content the user is reading moves under the cursor; 2026 practice is dimension-stable first paint.
- **Fix:** Derive the initial column count from CSS instead of 1: SSR-safe default of 5 with matchMedia-based initial value, or render the banner between grids using CSS order/grid-row so it always occupies its own full-width row without JS-dependent slicing.
- **Evidence:** `feed/base-lt-1025x0768-fp.png` · app/globals.css:1183 .nk-grid-feed repeat(5)/repeat(4)
- *RB-18 · confidence 0.8 · code-inferred*

**RSP-186 · MEDIUM** — Interruption-banner split defaults to 6 cards until ResizeObserver measures columns, shifting the banner a row post-hydration on 4/5-col desktops (1025–1920px, locales: en, lt)

- **What:** FeedScreen.tsx:344 computes splitAt = max(columns, round(6/columns)*columns) from useMeasuredColumns, which returns 1 until the effect runs (useMeasuredColumns.ts:12-25); SSR/first paint therefore splits after 6 cards, then re-splits after 8 on 4-col (1025-1280) and after 5 on 5-col (>1280) — the banner and every card after it jump one grid row once hydration measures the real track count.
- **Why:** A visible mid-page reflow after first paint is exactly the CLS class RB-18 targets; on a feed landing page the banner sits near the first scroll depth, so returning visitors see content jump under their pointer.
- **Fix:** Seed the column count from the same width ladder the CSS uses (matchMedia over the four .nk-grid-feed breakpoints) so SSR default matches the final value, or derive splitAt purely in CSS by making the banner a grid item spanning a full row (grid-column:1/-1) so no JS split is needed.
- **Evidence:** `feed-filtered/base-en-1120x0800-fp.png` · app/globals.css:1182 .nk-grid-feed
- *RB-18 · confidence 0.7 · code-inferred*

**RSP-187 · MEDIUM** — OfferCardSkeleton misses the ≤560 compact skin — skeleton cards taller than loaded cards (320–560px, state: loading; locales: en, lt)

- **What:** The ≤560 skin compresses the real card via .nk-offer selectors (globals.css:1900-1915: title 2×19px lines min-height 38, price 18px, gaps 5px). OfferCardSkeleton (cards.tsx:212-236) is a bare <article> with inline-styled bars mirroring the DESKTOP card (2×20px title bars + 8px gap = 48px vs 38px, 24px price bar vs ~22px, --nk-gap-xs vs 5px) and no .nk-offer class, so none of the compact overrides apply. Per card the skeleton runs ~12-18px taller; over a 4-row 2-up loading grid the page shortens ~50-70px when content lands.
- **Why:** Skeletons exist to reserve exact geometry; on phones every feed load ends with the grid and everything below it (banner, SEO block) shifting up — visible jank on the highest-traffic path.
- **Fix:** Give the skeleton the real card's classes (className="nk-offer" + nk-offer__body structure) so the compact skin applies, or replicate the ≤560 dimensions in a .nk-offer-skel rule beside globals.css:1900.
- **Evidence:** `feed-filtered/base-lt-0360x0800-dpr2-fp.png` · app/globals.css:1900 compact card skin (!important); app/globals.css:814 .nk-skel
- *RB-19 · confidence 0.7 · code-inferred*

**RSP-191 · MEDIUM** — OfferCardSkeleton misses the compact skin, so phone skeletons are ~10-14px taller than loaded cards (431–560px, state: loading; locales: en, lt)

- **What:** The compact skin's selectors all require .nk-offer (globals.css:1900-1919), but OfferCardSkeleton renders a bare <article> without that class (cards.tsx:215). At <=560 the real card gets h3 min-height:38px, body gap 5px, pricebar padding-top 8px; the skeleton keeps the base geometry it was built to mirror (two 20px title bars + 8px gap = 48px, gap var(--nk-gap-xs), padding-top var(--nk-gap-sm)). Net: each skeleton is ~10-14px taller than the card that replaces it; the initial 8-skeleton grid (FeedScreen.tsx:568-569, 4 rows at 2-up) shifts content up ~40-56px when results land.
- **Why:** The skeleton's whole purpose (its own comment says "avoids CLS") is dimension parity; on the highest-traffic phone band it silently lost parity when the compact skin shipped, causing a visible collapse jump on every cold load and infinite-scroll append (4-skeleton row, FeedScreen.tsx:588).
- **Fix:** Give the skeleton the same compact metrics: either add the nk-offer class-equivalent hooks (e.g. a .nk-offer-skel class covered by the 1895 block) or, once the card moves to class-based fluid type, reuse those classes in OfferCardSkeleton (cards.tsx:212-231).
- **Evidence:** `feed/base-lt-0431x0932-dpr2-fp.png` · app/globals.css:1900-1901 compact .nk-offer overrides (skip the skeleton); app/globals.css:1898 2-up grid
- *RB-19 · confidence 0.7 · code-inferred*

**RSP-192 · POLISH** — --nk-content-cap is applied then revoked — the 'ultrawide guardrail' token is dead (1481–3840px, locales: en, lt)

- **What:** The design-review layer sets .nk-grid-feed{max-width:none} (:1946), removing the only consumer of --nk-content-cap. The token and its comment now describe a guardrail that doesn't exist; the feed runs the full 1920px container (5-up cards up to ~350px — acceptable, but no longer by the mechanism the tokens claim).
- **Why:** Stale load-bearing-looking tokens misdirect future ultrawide work (someone tuning --nk-content-cap sees no effect).
- **Fix:** Delete the token + the max-width at :1187 and the revocation at :1946 (net zero behavior change), or re-point the token at a real consumer.
- **Evidence:** app/globals.css:219 --nk-content-cap:1480px ('ultrawide guardrail'); app/globals.css:1187 .nk-grid-feed{…max-width:var(--nk-content-cap)}
- *RB-19 · confidence 0.95 · code-inferred*

**RSP-193 · POLISH** — Feed grid carries a dead conflicting ≤560 rule (1fr) shadowed by the later 2-up rule (320–560px, locales: en, lt)

- **What:** globals.css:1186 declares .nk-grid-feed 1-column at ≤560; globals.css:1898 (same specificity, later) re-declares 2-up with different gaps. The 1186 rule is dead code, and the 5-step width ladder (1186/1185/1184/1183/1182) plus the second layer is exactly the seam-fragile pattern auto-fit/minmax or container queries would collapse.
- **Why:** The next editor of line 1186 gets a silent no-op; two sources of truth for the same breakpoint invites regressions.
- **Fix:** Delete the 1fr rule at globals.css:1186 (or fold the 2-up declaration from 1898 into it) and note the compact-skin layer owns ≤560.
- **Evidence:** `feed-filtered/base-lt-0360x0800-dpr2-fp.png` · app/globals.css:1186 .nk-grid-feed ≤560 (1fr, dead); app/globals.css:1898 .nk-grid-feed ≤560 (2-up, wins)
- *RB-02 · confidence 0.95 · code-inferred*

**RSP-194 · POLISH** — Dead conflicting rule: .nk-grid-feed declared 1fr at ≤560 then overridden to 2-up 700 lines later (320–560px, state: base, skeleton-feed; locales: en, lt; any)

- **What:** globals.css:1186 sets .nk-grid-feed to 1 column at ≤560; the Quiet Luxe layer at :1898 re-declares repeat(2,minmax(0,1fr)) for the identical media condition and only wins by source order. The feed ladder is 5 hand-stepped ranges (1182-1186) plus this override plus the ultrawide un-cap (:1941) — three scattered declarations for one grid.
- **Why:** Source-order-dependent duplicate rules are exactly how seam bugs ship (any refactor/reorder silently reverts phones to the 1-up column); RB-02 flags width ladders where a single intrinsic/consolidated definition would be safer.
- **Fix:** Delete the ≤560 1fr rule at globals.css:1186 and fold the 2-up + gap into the ladder (or migrate the ladder to auto-fit/minmax with a card min-width token).
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1186 .nk-grid-feed 1fr ≤560; app/globals.css:1898 .nk-grid-feed 2-up ≤560
- *RB-02 · confidence 0.95 · measured*

**RSP-200 · POLISH** — Feed grid's <=560 column rule is declared twice with opposite values; 2-up wins only by source order (431–560px, locales: en, lt)

- **What:** globals.css:1186 sets .nk-grid-feed to 1fr at max-width:560px; the Quiet Luxe layer at :1898 re-declares the same selector+condition as repeat(2,minmax(0,1fr)) with different gaps (18px 10px vs token gaps). Equal specificity — the later block wins purely by cascade order. The 5-step width ladder (1182-1186 + 1898 + the :1941 max-width:none override) is spread across three sections of the file.
- **Why:** A stylesheet reorder, layer introduction, or refactor that touches either block silently flips phones back to the abandoned 1-up feed; ladder fragmentation is exactly the seam-bug surface RB-02 warns about (auto-fit/minmax or one consolidated ladder would remove it).
- **Fix:** Delete the dead 1fr declaration at app/globals.css:1186 and fold the 2-up rule + its gaps into the main .nk-grid-feed ladder (or replace the ladder with repeat(auto-fill,minmax(~180px,1fr)) after verifying the banner-split logic in FeedScreen.tsx:344).
- **Evidence:** `feed/base-lt-0431x0932-dpr2-vp.png` · app/globals.css:1186 .nk-grid-feed{1fr} (dead); app/globals.css:1898 .nk-grid-feed repeat(2) (winner by source order)
- *RB-02 · confidence 0.9 · measured*

**RSP-207 · POLISH** — Back-to-top FAB anchors right without env(safe-area-inset-right) (320–560px, state: scrolled; locales: en, lt)

- **What:** .nk-backtotop uses bottom:calc(20px + env(safe-area-inset-bottom)) — good — but right:clamp(16px,4vw,32px) with no safe-area-inset-right term, so in phone landscape (notch right) the 48px disk can sit inside the inset region.
- **Why:** RB-08 requires side insets on every fixed element, not just bottom; partial safe-area handling on the same element shows the gap is an oversight, not a decision.
- **Fix:** globals.css:960 → right:calc(clamp(16px,4vw,32px) + env(safe-area-inset-right)).
- **Evidence:** `feed-q-long/base-lt-0360x0800-dpr2-vp.png` · app/globals.css:960 .nk-backtotop
- *RB-08 · confidence 0.85 · code-inferred*

**RSP-214 · POLISH** — Interruption banner position and eager-image count assume 1 column until first ResizeObserver read (1025–3840px, state: hydration; locales: en, lt)

- **What:** useMeasuredColumns initializes cols=1 and measures in useEffect (after first paint; useMeasuredColumns.ts:10-27). FeedScreen derives splitAt = max(columns, round(6/columns)*columns) (FeedScreen.tsx:344): SSR/first paint uses columns=1 → banner after 6 cards; after measure it moves to after 5 (5-up) or after 8 (4-up, 1025-1280) — a visible one-frame banner jump on desktop feeds near the fold. Likewise imageLoading is eager only for index < columns (FeedScreen.tsx:354), so the server HTML marks cards 2-5 of the first desktop row loading="lazy", surrendering their fetch priority until hydration flips them.
- **Why:** Post-hydration reflow and delayed first-row image fetches are exactly what measured-layout JS should avoid (RB-18); a matchMedia-seeded initial value or CSS-order solution removes both.
- **Fix:** Seed useMeasuredColumns from matchMedia against the known grid ladder (5/4/3/2) before first paint (useLayoutEffect + initial guess), or compute splitAt in CSS via grid-column placement.
- **Evidence:** app/globals.css:1187 .nk-grid-feed 5-up; app/globals.css:1188 4-up 1025-1280
- *RB-18 · confidence 0.8 · code-inferred*

**RSP-219 · POLISH** — Back-to-top FAB guards safe-area bottom but not right - can sit in the landscape notch zone (344–1024px, state: scrolled; locales: en, lt; landscape phones)

- **What:** The fixed .nk-backtotop button adds env(safe-area-inset-bottom) to its bottom offset but its right offset is a plain clamp(16px,4vw,32px). In landscape on notched phones env(safe-area-inset-right) is ~47px, so the FAB can sit partially inside the sensor-housing inset / home-indicator corner zone.
- **Why:** RB-08 requires left/right safe-area completeness on every fixed element, not just bottom; partial coverage reads as an oversight on exactly the devices the 44px target work targets.
- **Fix:** app/globals.css:961: right:max(clamp(16px,4vw,32px),env(safe-area-inset-right)).
- **Evidence:** `feed/base-lt-0560x0900-dpr2-vp.png` · app/globals.css:961 .nk-backtotop{right:clamp(16px,4vw,32px);bottom:calc(20px + env(safe-area-inset-bottom))}
- *RB-08 · confidence 0.8 · code-inferred*

**RSP-226 · POLISH** — Fixed 3-col step fires at 701px, squeezing cards to ~185-200px while 700px shows ~290px cards — auto-fill/minmax would remove the cliff (701–780px, locales: en, lt)

- **What:** The .nk-grid-feed ladder jumps 2→3 columns at exactly 701px: card width drops from ~290px (700px viewport, 2-col) to ~190px (701px, 3-col) — a 34% instant shrink — then grows back to ~265px by 1024. The card's fixed 27px price + 20px 2-line title + eyebrow are tight at the low end of the band, and the same repeat(N) pattern is duplicated across four breakpoints.
- **Why:** An intrinsic repeat(auto-fill,minmax(240px,1fr)) keeps card width continuous, deletes four ladder rules, and eliminates the seam-cliff class of bugs (RB-02/RB-05).
- **Fix:** Replace the ladder at globals.css:1182-1186 with grid-template-columns:repeat(auto-fill,minmax(240px,1fr)) (keep the <=560 single-column override if the compact skin needs it); useMeasuredColumns already reads resolved tracks so the banner split keeps working.
- **Evidence:** `feed-q-long/base-lt-0700x0900-dpr2-vp.png` · `feed-q-long/base-lt-0744x1133-dpr2-fp.png` · app/globals.css:1184 @media(min-width:701px) and (max-width:1024px){.nk-grid-feed{repeat(3,...)}}
- *RB-02 · confidence 0.7 · code-inferred*

**RSP-228 · POLISH** — Column-aware interruption banner can paint one frame at cols=1 before ResizeObserver measures (561–3840px, state: loaded-with-banner; locales: en, lt)

- **What:** useMeasuredColumns initializes cols to 1 and reads gridTemplateColumns in useEffect (post-paint). On a 4/5-column desktop feed the banner's row-span math renders one frame with the 1-column assumption before snapping to the real count — a brief layout jump when results mount.
- **Why:** RB-18: JS-measured layout should not have a wrong-first-frame; the jump is small but on slow devices (long effect queues) it is visible.
- **Fix:** Measure synchronously in the callback ref / useLayoutEffect before paint, or default cols from the same breakpoint map as the CSS ladder.
- **Evidence:** app/components/useMeasuredColumns.ts:10 (useState(1) initial); app/components/useMeasuredColumns.ts:12-25 (measure in useEffect, after paint)
- *RB-18 · confidence 0.65 · code-inferred*

### overlay-filter-sheet+nav-drawer

**RSP-121 · MEDIUM** — closeAt auto-close restores focus to a now-display:none opener — keyboard focus drops to <body> (561–3840px, state: overlay-open, resize/rotation across breakpoint; locales: en, lt)

- **What:** useDismissableLayer captures the opener at open time and calls opener?.focus() in the effect cleanup (use-dismissable-layer.ts:37,65). When the layer is dismissed by the closeAt media query (filter sheet: "(min-width: 561px)" at FeedScreen.tsx:811; nav drawer: "(min-width: 1121px)" at sections.tsx:86-89), the opener is by definition hidden at the new width — .nk-filters-mobilebtn is display:none ≥561px and .nk-nav-burger is display:none ≥1121px — so focus() on it silently no-ops and document focus falls back to <body>. A tablet rotation (e.g. 1024→1366 landscape, or 560→744) with the sheet/drawer open strands keyboard and screen-reader users at the top of the document.
- **Why:** WCAG 2.4.3-adjacent focus management: auto-dismissal must land focus on a visible, meaningful control; dropping to body loses reading position and, for SR users, announces nothing about why the dialog vanished.
- **Fix:** In use-dismissable-layer.ts, on breakpoint dismissal check the opener is still focusable (opener.offsetParent !== null or checkVisibility()) and otherwise focus a caller-provided fallback ref (e.g. the desktop sort FilterSelect trigger for the sheet, the first .nk-nav-links link for the drawer); pass the fallback via a new option at the two call sites.
- **Evidence:** app/globals.css:1121 .nk-filters-mobilebtn (display:none base, shown ≤560); app/globals.css:573 .nk-nav-burger (shown only ≤1120)
- *RB-15 · confidence 0.9 · code-inferred*

### filters

**RSP-122 · MEDIUM** — Category rail chips are 38px tall — under the 44px touch floor on a touch-only band (320–560px, locales: en, lt)

- **What:** The mobile-only category chip rail (.nk-catrail, <=560px, FeedScreen.tsx:485-493) sets min-height:38px on its chips (globals.css:1141; padding 9px 14px, 14px text). Measured in the 432px shot: chip height ~37.5 CSS px. The rest of the system honors --nk-tap:44px (globals.css:149) — e.g. .nk-fchip:1164 and .nk-filtersheet__opt:948 both use min-height:var(--nk-tap).
- **Why:** These chips are the primary browse control on phones and exist ONLY on the touch band; 38px misses the project's own 44px token and the 44px (48 preferred) 2026 target guidance. The 8px gap partially mitigates mis-taps but the vertical hit area is what fingers miss.
- **Fix:** Set .nk-catrail__chip min-height:var(--nk-tap) (globals.css:1141) and bump the rail's block padding to keep the mask/margins aligned; visual pill can stay 38px with a transparent hit-area extension if the density is wanted.
- **Evidence:** `feed/base-lt-0432x0932-dpr2-vp.png` · `feed/base-lt-0560x0900-dpr2-vp.png` · `feed/base-lt-0390x0844-dpr2-vp.png` · app/globals.css:1141 .nk-catrail__chip{min-height:38px}
- *RB-12 · confidence 0.9 · measured*

**RSP-123 · MEDIUM** — Mobile category chip rail targets are 38px — below the house 44px tap floor (320–560px, locales: en, lt)

- **What:** The ≤560 category chip rail — described in-file as 'the browse dimension on the page itself' — sets min-height:38px on its chips, under the codebase's own --nk-tap:44px floor (cited as WCAG 2.5.8 at :149). Adjacent chips sit 8px apart with no vertical padding compensation, so the effective touch target is 38px against the 44px contract every other mobile control keeps (fchips :1169 are 44px).
- **Why:** These are the primary one-thumb browse controls on the mobile feed; sub-floor targets on exactly this row contradicts the system's stated accessibility contract.
- **Fix:** globals.css:1146 — min-height:var(--nk-tap) (visual height can stay 38px via a reduced-padding inner if the compact look matters; extend the hit area with padding-block on the button).
- **Evidence:** app/globals.css:1146 .nk-catrail__chip{min-height:38px}; app/globals.css:149 --nk-tap:44px
- *RB-11 · confidence 0.9 · code-inferred*

**RSP-124 · MEDIUM** — Mobile category chips are 38px tall — below the 44px touch minimum on the touch-only band (320–560px, locales: en, lt)

- **What:** .nk-catrail__chip sets min-height:38px (padding 9px 14px, 14px font) for the horizontally scrollable category chip rail that only exists ≤560px — a touch-primary band. 38px is 6px under the repo's own --nk-tap:44px token and 10px under the 48px preferred size. The rail also sits 4px above the '0 pasiūlymų / × Išvalyti' row (manifest tightPair chip↔nk-clear gap 4).
- **Why:** These chips are the primary browse dimension on phones (per the CSS comment) and live inside a swipe rail, where undersized targets plus 4px spacing to the row below multiply mis-taps. Violates the 44x44 CSS px touch bar (WCAG 2.5.5 AAA / 2026 marketplace norm) the codebase itself encodes as --nk-tap.
- **Fix:** globals.css:1142 — min-height:var(--nk-tap) (44px) with padding 12px 16px, and raise the vertical gap between the rail and the meta row to ≥8px.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · `hub-sveikata/base-lt-0359x0800-dpr2-fp.png` · `hub-sveikata/base-lt-0360x0800-dpr2-fp.png` · app/globals.css:1142 .nk-catrail__chip{min-height:38px}
- *RB-12 · confidence 0.9 · measured*

**RSP-131 · MEDIUM** — Category rail never scrolls the active chip into view — selection is invisible on landings (320–560px, locales: en, lt)

- **What:** On the Fotografija-ir-video × Vilnius landing at 360, the rail shows 'Visos kategorijos | Įrankiai ir statyba | Nam…' with no highlighted chip — the active 'Fotografija ir video' chip sits off-screen mid-rail (confirmed by catrail-end shots where it is also not at the end). FeedScreen.tsx:485-493 renders the chips with no mount-time scrollIntoView. The rail also lacks overscroll-behavior-x containment and any scroll-snap (globals.css:1136-1141).
- **Why:** The one on-page browse control appears unselected while a category filter is silently active — users can't see or clear their context without discovering the chip by scrolling; edge-swipes can also chain into browser back-navigation without overscroll containment.
- **Fix:** In FeedScreen.tsx add an effect: on mount / params.cat change, querySelector('.nk-catrail .is-active')?.scrollIntoView({inline:'center', block:'nearest', behavior:'instant'}); add overscroll-behavior-x:contain and scroll-snap-type:x proximity with snap-align on chips at globals.css:1136.
- **Evidence:** `feed-cat-city/base-lt-0360x0800-dpr2-fp.png` · `feed-cat-city/catrail-end-lt-0390x0844-dpr2-vp.png` · `feed-cat-city/catrail-end-lt-0560x0900-dpr2-vp.png` · app/globals.css:1134 .nk-catrail; app/globals.css:1136 .nk-catrail (≤560)
- *RB-14 · confidence 0.9 · visual*

**RSP-151 · MEDIUM** — 'Išvalyti' clear-filters button is ~34px tall with 4px clearance to the chip rail (320–1024px, state: base, filtered; locales: en, lt)

- **What:** The reset control (FeedScreen.tsx:500) is styled inline with padding '8px 12px' and fontSize 15 and no min-height → ~34px hit target. Manifest reports a 4px gap between it and the active-filter chip rail at 359-361px widths. It is the only way to clear an applied category/city/price filter set on the results page.
- **Why:** A one-tap-recovery control at 34px with 4px spacing on the touch band is below the 44px minimum and easy to fat-finger into the adjacent chip, which changes the filter instead of clearing it — a frustrating, opposite-intent mis-tap.
- **Fix:** FeedScreen.tsx:500 — add minHeight:'var(--nk-tap)' and alignItems:'center' (padding '10px 14px'), and give the meta row ≥8px vertical margin from the chip rail.
- **Evidence:** `hub-sveikata/base-lt-0359x0800-dpr2-fp.png` · `hub-sveikata/base-lt-0673x0841-dpr2-fp.png` · app/components/FeedScreen.tsx:500 .nk-clear inline styles; app/globals.css:1188 .nk-clear
- *RB-12 · confidence 0.85 · measured*

**RSP-156 · MEDIUM** — Two-row sticky filter bar + nav consume 41-43% of landscape-phone viewports (561–1280px, state: back-to-top, base; locales: en, lt; fails on <=620px-tall viewports; worst at 390-412 (landscape phones))

- **What:** The filter bar (search row + full category/city/price/delivery pill row, ~180px incl. padding) is position:sticky under the 68px nav and stays pinned for the whole page (back-to-top-lt-1280x0800-vp shows it pinned over the footer, ~248px of chrome). The compact single-row treatment only kicks in at width<=560px, so landscape phones (844x390, 915x412) fall into the full desktop two-row treatment: auto-metric stickyPct = 41% (160px/390) and 43% (177px/412); 1280x620 = 40% (248px/620). Content left: 57-60%, below the >=60% floor on landscape phones.
- **Why:** On landscape phones and short desktop windows barely half the screen scrolls; with the on-screen keyboard open while typing into the pinned search field, almost no results remain visible. 2026 marketplaces pin only the primary control row (or unpin on scroll-down) on short viewports.
- **Fix:** Add a height gate, e.g. @media (max-height: 520px){ .nk-filterbar{position:static} } or pin only the first .nk-filter-row (make the second row non-sticky) — the breakpoint choice in globals.css:1120 keys on width only; add a max-height companion.
- **Evidence:** `feed/base-lt-0844x0390-dpr2-vp.png` · `feed/base-lt-0915x0412-vp.png` · `feed/back-to-top-lt-1280x0800-vp.png` · app/globals.css:1109 .nk-filterbar; app/globals.css:1120 @media(max-width:560px) .nk-filterbar
- *RB-07 · confidence 0.85 · measured*

**RSP-160 · MEDIUM** — 'Išvalyti / Clear' reset control is ~34px tall on the touch band (<44px) (320–560px, locales: en, lt)

- **What:** The global reset button (FeedScreen.tsx:500) is styled inline with padding:'8px 12px' and font-size:15 → ≈34px total height, with only ~8px separation from the count text and the chip row below. Every other filter control on the page (chips, sheet options, crumbs) gets min-height:var(--nk-tap) (44px); this one — the most consequential (clears ALL filters) — does not.
- **Why:** Fails the 44px touch floor on the band where it is the primary recovery control; adjacent small text invites mis-taps that read as 'nothing happened'.
- **Fix:** Add minHeight:'var(--nk-tap)' (and alignItems center) to the nk-clear inline style at app/components/FeedScreen.tsx:500, or move the sizing into .nk-clear in globals.css:1187.
- **Evidence:** `feed-q-long/base-lt-0360x0800-dpr2-vp.png` · `feed-cat-city/catrail-end-lt-0560x0900-dpr2-vp.png` · app/globals.css:1187 .nk-clear
- *RB-12 · confidence 0.85 · code-inferred*

**RSP-165 · MEDIUM** — Sticky filter bar + nav consume 32-35% of viewport at 561-1024; breaks 60% budget under 700px tall (561–1024px, 35% sticky at 561-701x900, 32% at 1024x768 (auto-metric); worse on shorter viewports)

- **What:** The filter-sheet collapse only kicks in <=560px; from 561-1024 the full three-row toolbar (search+sort / category+city+price / delivery toggle) stays position:sticky under the sticky nav. Measured sticky consumption: 35% at 561-701x900, 32% at 1024x768 (~245-315px of pinned chrome). On any <=700px-tall viewport in this width band - landscape phones (844x390), tablets with browser chrome - pinned chrome exceeds 40-50%, leaving well under the 60% content floor, and with the keyboard open the search input plus results are almost fully occluded.
- **Why:** 2026 marketplace pattern (Airbnb/Vinted) pins at most one slim row while scrolling; a third of the screen frozen on the core browse surface directly cuts cards-per-screen on tablets and makes landscape-phone browsing claustrophobic.
- **Fix:** Either extend the sheet-collapse breakpoint to ~768px, or pin only the first .nk-filter-row (search + sort) and let row 2/toggle scroll, and add @media(max-height:700px){.nk-filterbar{position:static}} as a height guard (app/globals.css:1110).
- **Evidence:** `feed/base-lt-0561x0900-dpr2-vp.png` · `feed/base-lt-0700x0900-dpr2-fp.png` · `feed/base-lt-1024x0768-fp.png` · app/globals.css:1110 .nk-filterbar{position:sticky;top:var(--nk-nav-h-scrolled)}; app/globals.css:1122 @media(max-width:560px) .nk-filters-desktop{display:none}
- *RB-07 · confidence 0.85 · measured*

**RSP-167 · MEDIUM** — Feed search shows two clear (✕) controls: native WebKit cancel button plus custom InputClear (320–360px, state: base with query, skeleton-feed; locales: en, lt; any)

- **What:** FeedScreen.tsx:455 renders <input type="search"> and :459 adds the custom 44px InputClear when a query exists, but nothing suppresses ::-webkit-search-cancel-button, so Chromium paints its own bold ✕ immediately after the text "drona" AND the custom thin ✕ sits at the field's right edge — two visually different clear affordances ~70px apart in one 240px-wide field. The native glyph is a ~16px target (fails the 44px --nk-tap contract) and doesn't match the design system.
- **Why:** Duplicate, visually inconsistent controls for one action confuse users and read as unpolished; the native ✕ is also a sub-24px touch target on the touch band. FeedScreen's own comment (line 320) argues against parallel clear affordances.
- **Fix:** Add `.nk-searchfield input[type="search"]::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none;display:none}` to app/globals.css near :1082 (also covers the categories page search which shares .nk-searchfield).
- **Evidence:** `feed/skeleton-feed-lt-0320x0568-dpr2-vp.png` · app/globals.css:1191 .nk-input-clear; app/globals.css:1082 .nk-searchfield
- *RB-12 · confidence 0.85 · visual*

**RSP-168 · MEDIUM** — Search field shows two clear-X controls: native webkit cancel button plus custom InputClear (361–430px, state: skeleton-feed (query present); locales: en, lt)

- **What:** FeedScreen.tsx:455 uses <input type="search"> and also renders a custom InputClear (FeedScreen.tsx:459, ui.tsx:337) when the field has a value. Nothing in globals.css resets ::-webkit-search-cancel-button (grep: no 'appearance' / 'search-cancel' rules), so Chromium/WebKit render their own small native X next to the 44px custom one. The skeleton-feed shot with q='dronas' shows both X glyphs ~20 CSS px apart inside the pill.
- **Why:** Two adjacent clear affordances for one action read as a rendering glitch; the native one is a ~14px tap target that fails the 44px touch bar and can steal the tap intended for the custom control. The code comment at FeedScreen.tsx:321 explicitly designs against duplicate clear affordances.
- **Fix:** Add `.nk-searchfield input[type="search"]::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}` (and ::-webkit-search-decoration) next to .nk-searchfield in globals.css:1082, or switch the input to type="text" with role=searchbox semantics.
- **Evidence:** `feed/skeleton-feed-lt-0390x0844-dpr2-vp.png` · app/globals.css:1082 .nk-searchfield; app/globals.css:1191 .nk-input-clear
- *RB-12 · confidence 0.85 · visual*

**RSP-173 · MEDIUM** — Feed landscape: sticky nav + sticky filter bar hold 41-43% of a 390-412px-tall viewport (561–1024px, fails at ≤~412px-tall landscape phones)

- **What:** The feed keeps .nk-filterbar sticky at top:var(--nk-nav-h-scrolled) at all widths. On landscape phones (844x390, 915x412) the stacked sticky region (nav 68 + filter bar with search+sort row ~92px incl. padding-block 16px and border) measures ~160-168px = 41-43% of the viewport (manifest stickyPct 41/43), leaving <60% for results.
- **Why:** While browsing results in landscape, barely 2 card rows' worth of pixels scroll under two pinned bars; the sticky search adds little value in landscape where the keyboard would cover everything anyway.
- **Fix:** In @media (orientation:landscape) and (max-height:480px){ .nk-filterbar{position:static} } or make the filter bar hide-on-scroll-down like a 2026 marketplace app bar (globals.css:1110).
- **Evidence:** `feed/base-lt-0844x0390-dpr2-vp.png` · `feed/base-lt-0915x0412-vp.png` · app/globals.css:1110 .nk-filterbar; app/globals.css:543 .nk-nav-bar
- *RB-07 · confidence 0.8 · measured*

**RSP-174 · MEDIUM** — Sticky filter bar + nav pin ~310px of chrome at 561-760px width; fails the 60% content budget on short/landscape viewports (561–1024px, locales: en, lt; worst on <=760px-wide (controls wrap to 3 rows) and any <=700px-tall / landscape-phone viewport)

- **What:** The whole .nk-filterbar (search row + category/city/price pill row + delivery-toggle row once controls wrap below ~760px) is position:sticky under the sticky nav. Measured sticky consumption: 37% at 673x841, 35% at 700x900 (~316px total: nav 68 + bar ~248), 30-32% at 768-1120 widths. There is no height-based fallback, so on a 700px-tall window content gets ~55% and on a landscape phone (e.g. 844x390, still in this 561+ band) pinned chrome would consume ~80% of the viewport (RB-22).
- **Why:** 2026 practice pins at most one slim control row while results scroll; 300+px of permanently pinned chrome makes browsing on small-height windows and landscape phones claustrophobic and pushes results almost entirely off-screen.
- **Fix:** Pin only the first row (search + Filters/sort) and let the pill rows scroll, or add @media(max-height:700px){.nk-filterbar{position:static}} near app/globals.css:1109; the 561-760px band should collapse pills into the existing sheet pattern instead of wrapping to three sticky rows.
- **Evidence:** `feed-q-long/base-en-0673x0841-dpr2-vp.png` · `feed-cat-city/base-lt-0700x0900-dpr2-vp.png` · `feed-q-long/base-en-0768x1024-dpr2-vp.png` · app/globals.css:1109 .nk-filterbar{position:sticky;top:var(--nk-nav-h-scrolled)}
- *RB-07 · confidence 0.8 · measured*

**RSP-175 · MEDIUM** — Result-meta 'Clear'/'Išvalyti' reset button is ~34px tall on the tablet touch band (no min-height) (561–1024px, locales: en, lt)

- **What:** The global reset button (FeedScreen.tsx:500) is styled inline with padding '8px 12px' and 15px text and .nk-clear adds no min-height — rendered height ~34 CSS px, below the 44px floor the rest of the toolbar honours (search field, pills and .nk-fchip all use var(--nk-tap)/--nk-control-h). It is the only way to clear all filters at 561-1024 where it renders as a small text button beside the count.
- **Why:** WCAG 2.5.8 / platform HIG require ~44px targets on touch surfaces; 561-1024 is the iPad/split-screen band where this is tapped with a finger.
- **Fix:** Add minHeight:'var(--nk-tap)' (and alignItems center) to the reset button style at FeedScreen.tsx:500, or move min-height into .nk-clear in globals.css.
- **Evidence:** `feed-empty/base-lt-1024x0768-vp.png` · `feed-q-long/base-en-0768x1024-dpr2-vp.png` · app/globals.css:1187 .nk-clear
- *RB-12 · confidence 0.8 · code-inferred*

**RSP-183 · MEDIUM** — Sticky filter bar wraps to 3 control rows in LT, pinning ~310px of chrome (30-37% of viewport) (561–768px, state: back-to-top, base; locales: en, lt; captured 841-1136 tall: 30-37% pinned; fails budget on <=700px-tall (landscape) viewports)

- **What:** The whole .nk-filterbar (search+sort row, category/city/price pill row, and - because LT 'Pristatymas galimas' doesn't fit - a third toggle row with ~55% dead width) is position:sticky under the nav. Measured pinned chrome: 30% at 768x1024, 35-37% at 561-700 x 841-900 (auto-metric stickyPct; visually confirmed in the scrolled back-to-top shot). EN at 768 fits the toggle inline (2 rows), so LT pays ~50px more pinned height. On an in-band landscape phone (e.g. 740x360) the same ~310px would consume ~86% of the viewport, far past the 60%-content floor.
- **Why:** 2026 marketplace practice pins at most a slim search/filters strip while scrolling results; three rows of pinned controls (one mostly empty) tax every scroll on tablets and would make landscape phones unusable. Keyboard-open on the search input shrinks the visible results to a sliver.
- **Fix:** Keep only the first row (search + sort) sticky: move rows 2-3 outside the sticky wrapper in FeedScreen.tsx:450-481, or add @media(max-height:700px){.nk-filterbar{position:static}}; compress LT pill labels or allow the toggle onto row 2 (it fits if pill padding tightens ~10%) to reclaim the dead third row.
- **Evidence:** `feed/back-to-top-lt-0768x1024-dpr2-vp.png` · `feed/base-lt-0673x0841-dpr2-vp.png` · `feed/base-en-0768x1024-dpr2-vp.png` · app/globals.css:1109 .nk-filterbar (position:sticky); app/globals.css:1114 .nk-filters-desktop
- *RB-07 · confidence 0.75 · measured*

**RSP-184 · MEDIUM** — Search field shows two clear buttons: native WebKit search-cancel × next to the custom InputClear × (561–768px, state: search-active)

- **What:** The feed search input is type="search" (FeedScreen.tsx:455) and Chromium renders its native ~20px search-cancel × whenever the field has a value, immediately beside the custom 44px InputClear × - the 768px search-state shot shows both glyphs side by side inside the pill. The native control is unstyled, off-brand, and a sub-44px touch target ~7px from its twin.
- **Why:** Duplicate adjacent affordances for one action confuse users and AT, and the native tiny × violates the 44px target rule the custom control was built to satisfy; every flagship marketplace suppresses the UA cancel button when shipping its own.
- **Fix:** Add to globals.css near .nk-searchfield: .nk-searchfield input[type="search"]::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none;display:none} (and ::-webkit-search-decoration).
- **Evidence:** `feed/skeleton-feed-lt-0768x1024-dpr2-vp.png` · app/globals.css:1082 .nk-searchfield; app/globals.css:1190 .nk-input-clear
- *RB-12 · confidence 0.75 · visual*

**RSP-190 · MEDIUM** — 561–700px band keeps the full two-row filter toolbar sticky: ~270–280px pinned, >55% of a landscape phone (561–700px, locales: en, lt; ≤700px-tall viewports fail the 60% budget; 841px-tall measured at 63%)

- **What:** The collapse-to-sheet breakpoint is ≤560 (globals.css:1131) but the 'phone' 2-up grid runs to 700. In 561–700 the sticky stack is nav (68px) + filterbar (search row ~50 + wrapped pill rows: Kategorija/Miestas/Kaina + Pristatymas toggle on a second line, ~140–150 + 32 padding) ≈ 270–280px — the harness measures 37% consumed at 673×841 (63% content, barely passing). Any 561–700-wide viewport shorter than ~700px (landscape phones 667×375, 640×360; split-screen tablets) drops content share to ~25–45%, far under the 60% budget, and the keyboard would erase the rest while typing in the pinned search field.
- **Why:** RB-07 fixed-bar budget: a browse feed where pinned chrome outweighs results on short viewports; the band also awkwardly straddles the mobile/desktop filter paradigms (sheet+chips ≤560 vs inline pills 561+).
- **Fix:** Either extend the mobile Filters-button/sheet mode to ≤700 (align with the 2-up grid band), or unpin on short viewports: @media(max-height:520px){.nk-filterbar{position:static}}; at minimum make only the search row sticky in 561–700.
- **Evidence:** `feed-q-long/base-lt-0673x0841-dpr2-fp.png` · `feed-q-long/base-en-0673x0841-dpr2-vp.png` · app/globals.css:1110 .nk-filterbar{position:sticky}; app/globals.css:1131 .nk-filter-row--desktop hidden ≤560 only
- *RB-07 · confidence 0.7 · code-inferred*

**RSP-195 · POLISH** — Category rail chips are 38px tall (below the 44px touch floor) (320–560px, locales: en, lt)

- **What:** .nk-catrail__chip sets min-height:38px with 8px gaps; these are primary filter toggles on the ≤560 band. 38px passes WCAG 2.5.8 (24px) but misses the 44px flagship floor the rest of the page's controls use (--nk-tap).
- **Why:** Inconsistent with the site's own 44px token and the 2026 preferred 48px for repeated-use rail controls.
- **Fix:** globals.css:1141 → min-height:var(--nk-tap) (visual weight can stay: keep padding 9px 14px and let the pill grow to 44px).
- **Evidence:** `feed-cat-city/catrail-end-lt-0390x0844-dpr2-vp.png` · app/globals.css:1141 .nk-catrail__chip{min-height:38px}
- *RB-12 · confidence 0.9 · measured*

**RSP-198 · POLISH** — Search placeholder clips mid-word ("Ką norite išsinu") with no ellipsis at ≤400px (320–400px, any)

- **What:** The LT placeholder (t.searchPlaceholder, likely "Ką norite išsinuomoti?") is longer than the ≤560 search field; the input has no text-overflow, so the placeholder hard-clips mid-word: "Ką norite iš" @320, "Ką norite išsir" @344, "Ką norite išsinu" @360. EN "What do you ne…" also clips at 360.
- **Why:** A mid-word chopped prompt on the first interactive control of the page reads as unfinished; ellipsis or a short mobile string is the expected craft.
- **Fix:** Add text-overflow:ellipsis to the input (inline style in FeedScreen.tsx:458 or on .nk-searchfield input) — Blink/WebKit apply it to placeholders — or provide a shorter placeholder for narrow widths via the dictionaries.
- **Evidence:** `feed/base-lt-0360x0800-dpr2-vp.png` · `feed/base-lt-0344x0882-dpr2-vp.png` · `feed/base-en-0360x0800-dpr2-vp.png` · app/globals.css:1129 .nk-filter-row > .nk-searchfield ≤560
- *RB-01 · confidence 0.9 · visual*

**RSP-202 · POLISH** — Search placeholder 'Ką norite išsinuomoti?' hard-clips mid-word ('Ką norite išs') ≤360px (320–400px)

- **What:** The feed/hub search input placeholder is cut without ellipsis at 320-360px next to the Filtrai button ('Ką norite iš' at 320, 'Ką norite išs' at 359/360). Input placeholders don't ellipsize by default.
- **Why:** A mid-word chop in the very first interactive element reads as a layout bug; a width-swapped short placeholder is a two-line fix and this codebase already has a width-swapped copy pattern (.nk-offline-strip comment mentions width-swapped variants).
- **Fix:** Add a short mobile placeholder to the Dict (e.g. 'Ko ieškote?') swapped ≤400px, or set .nk-searchfield input::placeholder{text-overflow:ellipsis} (WebKit honors it) in globals.css.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-vp.png` · `hub-sveikata/base-lt-0359x0800-dpr2-fp.png` · app/globals.css:1132 .nk-filter-row > .nk-searchfield (≤560 basis)
- *RB-01 · confidence 0.85 · visual*

**RSP-206 · POLISH** — Search placeholder hard-clips mid-word at ≤430 ('Ką norite išs', 'What c' at 320) (320–430px, locales: en, lt)

- **What:** The sticky bar gives the search input flex:1 1 120px next to the Filters pill; the placeholder 'Ką norite išsinuomoti?' / 'What do you need to rent?' clips with no ellipsis at every ≤430 width — down to 'What c' at 320 (input ≈110px) and 'profesiona' for the active long query.
- **Why:** A chopped prompt on the primary control reads unfinished; leading marketplaces ship a short mobile placeholder ('Paieška' / 'Search').
- **Fix:** Add a short placeholder variant to the Dict (e.g. feed.searchPlaceholderShort) and swap it under a matchMedia/(max-width:560px) or use the existing nk-narrow-only pattern conceptually — set via JS in FeedScreen.tsx:457.
- **Evidence:** `feed-q-long/base-en-0320x0568-dpr2-vp.png` · `feed-cat-city/base-en-0320x0568-dpr2-fp.png` · `feed-filtered/base-lt-0360x0800-dpr2-vp.png` · app/globals.css:1129 .nk-filter-row > .nk-searchfield (≤560)
- *RB-01 · confidence 0.85 · visual*

**RSP-209 · POLISH** — Category rail chips are 38px tall on the touch band (44px preferred) (320–560px, locales: en, lt; any)

- **What:** .nk-catrail__chip sets min-height:38px with padding 9px 14px (globals.css:1141); the horizontally-scrolling category chips (FeedScreen.tsx:485-493) are therefore ~38px targets with 8px gaps, below the --nk-tap 44px contract used by the neighbouring Filters button (FeedScreen.tsx:466 minHeight var(--nk-tap)).
- **Why:** Primary browse-dimension controls on phones should meet the 44px floor the codebase itself standardises; 38px + horizontal scrolling makes precise taps harder mid-swipe.
- **Fix:** Bump .nk-catrail__chip to min-height:var(--nk-tap) (or add invisible block padding) at globals.css:1141; the rail's 4px block padding can absorb the extra height.
- **Evidence:** `feed/base-lt-0360x0800-dpr2-vp.png` · `feed/base-en-0320x0568-dpr2-vp.png` · app/globals.css:1141 .nk-catrail__chip min-height:38px
- *RB-12 · confidence 0.85 · measured*

**RSP-210 · POLISH** — Category chip rail lacks overscroll-behavior-x containment (320–560px, locales: en, lt; any)

- **What:** .nk-catrail (globals.css:1136-1139) is an edge-to-edge overflow-x:auto rail with hidden scrollbar and mask-fade affordance, but sets no overscroll-behavior-x:contain — reaching either end chains the overscroll to the page/browser (can trigger the back-swipe navigation gesture on iOS/Android while the user is still flicking chips).
- **Why:** 2026 rail ergonomics (RB-14) call for overscroll containment on every horizontal scroller; an accidental history-back from the feed loses filter state scroll position.
- **Fix:** Add overscroll-behavior-x:contain to .nk-catrail at globals.css:1136 (same for .nk-grid-4--rail at :1950 if not already handled in its own cell).
- **Evidence:** `feed/base-lt-0360x0800-dpr2-vp.png` · `feed/base-lt-0430x0932-dpr2-vp.png` · `feed/base-lt-0480x0854-dpr2-vp.png` · app/globals.css:1136 .nk-catrail ≤560
- *RB-14 · confidence 0.85 · code-inferred*

**RSP-211 · POLISH** — Search placeholder clips mid-word at every B2 width (LT 'Ką norite išsinuom', EN 'What do you need to n') (361–430px, locales: en, lt)

- **What:** The full placeholder 'Ką norite išsinuomoti?' / 'What do you need to rent?' (FeedScreen.tsx:457, t.searchPlaceholder) never fits next to the Filtrai button in this band: LT renders 'Ką norite išsinu' at 361-375, 'Ką norite išsinuom' at 390-412, and EN shows 'What do you need to n' even at 430 — a hard mid-word cut with no ellipsis.
- **Why:** A chopped question mark-less prompt reads as a truncation bug to users and is worse in EN (longer string); leading marketplaces ship a short mobile placeholder ('Ko ieškote?' / 'Search rentals').
- **Fix:** Add a short narrow-band placeholder key to the Dict and swap it under the existing <=560 layer (or via matchMedia in FeedScreen), or add text-overflow:ellipsis on the input's placeholder styling as a stopgap.
- **Evidence:** `feed/base-lt-0390x0844-dpr2-vp.png` · `feed/base-en-0430x0932-dpr2-fp.png` · `feed/base-lt-0375x0667-dpr2-vp.png` · app/globals.css:1129 .nk-filter-row > .nk-searchfield (mobile)
- *RB-10 · confidence 0.85 · visual*

**RSP-216 · POLISH** — Inventory-count readout placement diverges: feed right-aligns above grid, categories left-aligns under search (390–1920px)

- **What:** Both discovery screens print a count in the same micro type ('4 pasiūlymai' / '12 kategorijų'), but the feed places it right-aligned on its own row above the grid (paired with 'Išvalyti' when filtered) while the categories page places it left-aligned directly under the search input. Verified at 1280 and 1920 on both pages.
- **Why:** Sibling discovery screens sharing PageHead + search anatomy present the same data point in two different positions/alignments; users scanning for 'how many results' re-learn the location per page. Small, but it is exactly the RowHead/PageHead-level convergence the shared headers system was built for.
- **Fix:** Pick one convention (the feed's right-aligned count row above the grid generalises better since it hosts the clear-filters affordance) and move the categories count into the same slot in CategoriesScreen.tsx.
- **Evidence:** `feed/base-lt-1280x0800-fp.png` · `categories/base-lt-1280x0800-fp.png` · `feed/base-lt-1920x1080-fp.png` · app/globals.css:407 .nk-pagehead
- *RB-24 · confidence 0.8 · visual*

**RSP-217 · POLISH** — Search placeholder clips mid-word ('Ką norite iššinu') at <=360px (320–400px)

- **What:** The feed search input placeholder 'Ką norite išsinuomoti?' is cut mid-word with no ellipsis at 320-361px viewports — shots show 'Ką norite iš' (320) and 'Ką norite iššinu' (359/361) next to the Filtrai button.
- **Why:** A chopped placeholder on the page's primary input reads as sloppy on the default locale's most common phone widths; EN ('What do you need to rent?') is longer and clips too.
- **Fix:** Add a compact placeholder dictionary key (e.g. searchPlaceholderShort: 'Ko ieškote?') swapped in below ~400px, or let CSS text-overflow:ellipsis apply via input::placeholder{text-overflow:ellipsis}.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-vp.png` · `feed/base-lt-0359x0800-dpr2-vp.png` · `feed/base-lt-0361x0800-dpr2-vp.png` · app/globals.css:1110 .nk-filterbar
- *RB-10 · confidence 0.8 · visual*

**RSP-218 · POLISH** — Delivery toggle wraps to a lone third row in the sticky filter bar at 769-~860px (769–860px)

- **What:** At 769px the second filter row wraps: Kategorija/Miestas/Kaina fit on one line and the wide 'Pristatymas galimas' toggle drops to its own row with ~430px of dead space beside it, adding ~62px to the sticky bar (which is pinned on every scroll). By 900px everything fits one line. EN labels are shorter and may wrap at a different width, making the LT/EN bars different heights at the same viewport.
- **Why:** A lone wrapped control with a mostly-empty row inside pinned chrome is un-tuned rhythm exactly where the sticky budget is most expensive (this band includes portrait tablets).
- **Fix:** Let the toggle shrink (it currently keeps a long label + pill at full width) or shorten the label at <=860 (e.g. 'Pristatymas'), or set the second .nk-filter-row's pills to flex:1 1 auto so four controls share the row.
- **Evidence:** `feed/base-lt-0769x1024-dpr2-vp.png` · `feed/base-lt-0820x1180-dpr2-vp.png` · `feed/base-lt-0900x1280-dpr2-fp.png` · app/globals.css:1109 .nk-filterbar
- *RB-24 · confidence 0.8 · visual*

**RSP-221 · POLISH** — Full-bleed catrail edges and back-to-top FAB ignore env(safe-area-inset-left/right) (361–430px, state: back-to-top, base; locales: en, lt)

- **What:** --nk-gutter (globals.css:203) is a bare clamp with no safe-area term; .nk-catrail bleeds to the physical viewport edge via margin:-gutter and its chips scroll under the display edge in landscape/notched contexts. .nk-backtotop pins bottom with env(safe-area-inset-bottom) (good) but its right offset (clamp(16px,4vw,32px), globals.css:960) has no safe-area-inset-right for landscape notches.
- **Why:** Safe-area completeness (RB-08) requires left/right insets on every full-bleed rail and fixed element, not just bottom; on landscape phones with camera cutouts the first/last chip and the FAB sit in the unsafe strip.
- **Fix:** Define --nk-gutter as max(clamp(20px,6vw,82px), env(safe-area-inset-left), env(safe-area-inset-right)) or add safe-area padding inside .nk-catrail; add env(safe-area-inset-right) to the .nk-backtotop right offset.
- **Evidence:** `feed/back-to-top-lt-0390x0844-dpr2-vp.png` · `feed/base-lt-0430x0932-dpr2-vp.png` · app/globals.css:1136 .nk-catrail full-bleed margin; app/globals.css:960 .nk-backtotop{right:clamp(16px,4vw,32px)}
- *RB-08 · confidence 0.75 · code-inferred*

**RSP-222 · POLISH** — Edge-bleed chip rail and back-to-top FAB ignore horizontal safe-area insets (431–560px, locales: en, lt; landscape phones with display cutouts)

- **What:** The .nk-catrail bleeds to the viewport edge via margin:calc(-1*var(--nk-gutter)) and pads back only var(--nk-gutter) (globals.css:1137) — no env(safe-area-inset-left/right) term, so in notch-landscape the first/last chips and the fade mask sit inside the cutout zone. .nk-backtotop (globals.css:960) offsets bottom with env(safe-area-inset-bottom) but its right offset has no inset term. Bottom insets elsewhere show the codebase already handles safe areas (:955, :1046).
- **Why:** RB-08 requires horizontal inset completeness for every edge-bleed rail and fixed control, not just bottom; on cutout devices in landscape the rail's tap targets start under the camera housing.
- **Fix:** Use padding-inline:max(var(--nk-gutter), env(safe-area-inset-left)) / right on .nk-catrail (globals.css:1137) and right:max(clamp(16px,4vw,32px), env(safe-area-inset-right)) on .nk-backtotop (globals.css:960).
- **Evidence:** `feed/base-lt-0560x0900-dpr2-vp.png` · app/globals.css:1137 .nk-catrail margin/padding var(--nk-gutter); app/globals.css:960 .nk-backtotop right:clamp(16px,4vw,32px)
- *RB-08 · confidence 0.75 · code-inferred*

**RSP-223 · POLISH** — Sticky filter bar pins at the condensed nav height while the nav is still 76px (320–3840px, state: scroll-transition; locales: en, lt)

- **What:** The filter bar sticks at top:68px (--nk-nav-h-scrolled) but the nav is 76px tall until the .nk-scrolled class lands and its height transition (.3s) finishes. During the condense transition (and at any scroll offset where the bar is pinned but the class threshold hasn't fired) up to 8px of the filter bar sits under the translucent nav.
- **Why:** A brief 8px tuck behind blurred glass — subtle, but it is exactly the kind of chrome-seam judder a flagship scroll should not show.
- **Fix:** Either pin at var(--nk-nav-h) and let the condensed state open a 8px reveal, or drive one shared custom property from the scroll state so both heights move together.
- **Evidence:** app/globals.css:1114 .nk-filterbar{top:var(--nk-nav-h-scrolled)}; app/globals.css:153-154 --nk-nav-h:76px / --nk-nav-h-scrolled:68px
- *RB-02 · confidence 0.7 · code-inferred*

### pagination

**RSP-136 · MEDIUM** — Out-of-range ?page=20 (of 8) shows '87 pasiūlymų' + a filter-blaming empty state + '20 puslapis iš 8' (320–1920px, state: pagination-overflow)

- **What:** On mock-pag-overflow the screen simultaneously asserts three contradictions: the count row says '87 pasiūlymai' (countLabel uses backend totalCount, FeedScreen.tsx:205–210) above an empty grid; renderEmpty falls through to the filter branch (FeedScreen.tsx:392–394) — 'Pagal šiuos filtrus nuomos pasiūlymų neradome' + 'Išvalyti filtrus' — though the user set no filters; and the pager status renders the impossible '20 puslapis iš 8' with an 'Ankstesnis puslapis' link to page 19 (also empty). There is no path to page ≤8 except decrementing 12 times.
- **Why:** Stale bookmarked/crawled page URLs land here; a leading marketplace clamps or redirects and never emits self-contradictory counts — also thin-content/SEO noise since these URLs render 200 with a pseudo-error body.
- **Fix:** In FeedScreen.tsx clamp params.page to totalPages once pages[0].totalCount resolves (replace-state to the last page), or add an explicit out-of-range branch in renderEmpty ('Šio puslapio nėra' + link to page 1/last) and suppress countLabel + pageStatus when page > totalPages.
- **Evidence:** `mock-pag-overflow/base-lt-0390x0844-dpr2-fp.png` · app/globals.css:1181 .nk-seopager; app/globals.css:1182 .nk-seopager__status
- *RB-19 · confidence 0.9 · visual*

### overlay-filtersheet

**RSP-148 · MEDIUM** — Mobile filter bottom sheet caps at raw 92vh — larger than the visible viewport under mobile toolbars (320–560px, state: filters-open, filtersheet-open; locales: en, lt; mobile browsers with dynamic toolbars)

- **What:** .nk-sheet (the base the <=560-only filter sheet builds on, opened by .nk-filters-mobilebtn) uses max-height:92vh (globals.css:933). On iOS/Android with the URL bar expanded, 1vh tracks the LARGE viewport, so 92vh can exceed the visible (small) viewport height (~85-90% of large); the sheet's grabber/header can sit above the visible area and the internal scroll budget is miscalculated.
- **Why:** RB-06: overlays must use svh/dvh deliberately. Raw vh on a bottom sheet is the canonical mobile-toolbar bug; with the long city radio list (12+ options) this sheet routinely hits its max-height on phones.
- **Fix:** Change max-height to 92dvh (or min(92svh,92dvh) if you want stability during toolbar collapse) at app/globals.css:933; audit the other .nk-sheet consumers at the same time.
- **Evidence:** `feed/base-lt-0431x0932-dpr2-vp.png` · app/globals.css:933 .nk-sheet{max-height:92vh}; app/globals.css:939 .nk-filtersheet
- *RB-06 · confidence 0.85 · code-inferred*

**RSP-179 · MEDIUM** — Mobile filter sheet caps height with raw 92vh instead of dvh/svh (320–560px, state: filtersheet-open; locales: en, lt; short/dynamic-chrome viewports most affected)

- **What:** .nk-sheet{max-height:92vh} (globals.css:933) governs the mobile-only filter sheet (.nk-filtersheet extends it). On mobile browsers vh resolves against the LARGE viewport, so with the URL bar expanded 92vh can exceed the visible (small) viewport; the bottom-anchored sheet then pushes its grabber/header band above the visible top edge while the long city/category radio lists are open. The sheet's own sticky footer mitigates the apply button, but the title row + close button (the focused element on open, FeedScreen.tsx:811) can sit off-screen.
- **Why:** 2026 practice is svh/dvh for any mobile-affected overlay cap; raw 100vh/92vh on sheets is a known dynamic-URL-bar defect class (RB-06 explicitly names it).
- **Fix:** Change app/globals.css:933 to `max-height:92svh` (or `min(92svh,92dvh)`), or scope an override on .nk-filtersheet.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:933 .nk-sheet; app/globals.css:939 .nk-filtersheet
- *RB-06 · confidence 0.8 · code-inferred*

**RSP-182 · MEDIUM** — Bottom sheets cap at 92vh (large-viewport vh) - header/grabber can sit above the visible viewport on iOS (344–560px, state: app-redirect-open, filters-sheet-open, filtersheet-open; locales: en, lt; mobile Safari dynamic toolbar)

- **What:** .nk-sheet (shared by the mobile filter sheet and the app-redirect sheet) uses max-height:92vh. On iOS Safari/Chrome with the URL bar expanded, 100vh is the LARGE viewport (~8-12% taller than what's visible), so a full sheet's 92vh exceeds the visible height: the grab-zone and sheet header render under/behind the browser chrome while the sticky footer stays pinned. Everything else in the system already uses the modern units (nav drawer 100dvh at :584, bento 100dvh at :1215), so this is the one legacy vh left on a mobile-affected overlay.
- **Why:** RB-06: overlays must size against svh/dvh; a filter sheet whose close affordance and title are clipped on the world's default mobile browser is a real usability defect on the core filter path.
- **Fix:** app/globals.css:934: max-height:min(92dvh,92vh) - or simply 88svh - keeping the safe-area bottom padding at :1500.
- **Evidence:** `feed/base-lt-0560x0900-dpr2-vp.png` · `feed/base-lt-0390x0844-dpr2-vp.png` · app/globals.css:934 .nk-sheet{max-height:92vh}
- *RB-06 · confidence 0.75 · code-inferred*

**RSP-189 · MEDIUM** — Filter bottom sheet caps at raw 92vh — on iOS with the URL bar shown its header/grabber sits off-screen (320–560px, state: filters-open; locales: en, lt; mobile, browser-UI-dependent)

- **What:** .nk-sheet (the base for .nk-filtersheet, FeedScreen.tsx FeedFilterSheet) uses max-height:92vh. On mobile Safari/Chrome 100vh = the LARGE viewport, so with browser chrome visible the usable height is ~85–90% of that; a content-full sheet (category+city+price+delivery+sort groups easily exceed it) grows to 92vh from the bottom edge and its top — grabber, title, close button — lands above the visible viewport. The footer stays pinned (sticky bottom) but dismissal via the close button/grabber requires the toolbar to collapse first. The nav drawer nearby already uses 100dvh correctly (globals.css:584), so this is an inconsistency, not a system choice.
- **Why:** 2026 practice is svh/dvh for any mobile overlay cap; a sheet whose close affordance can be off-screen at open time is a direct RB-06/RB-23 defect on the primary mobile filtering flow.
- **Fix:** globals.css:934: max-height:min(92dvh, 92vh) (or 88svh for a stable cap); keep the sticky foot as-is.
- **Evidence:** `mock-stress-feed/base-lt-0390x0844-dpr2-vp.png` · app/globals.css:934 .nk-sheet{max-height:92vh}; app/globals.css:940 .nk-filtersheet
- *RB-06 · confidence 0.7 · code-inferred*

### nav

**RSP-154 · MEDIUM** — Feed sticky nav + sticky filterbar consume 41-43% of landscape-phone viewport (320–950px, locales: en, lt; viewports <=520px tall (landscape phones: 844x390, 915x412))

- **What:** On the feed, .nk-nav-bar (sticky, 68px condensed) plus .nk-filterbar (position:sticky; top:var(--nk-nav-h-scrolled), globals.css:1110) stack as permanent chrome. Auto-metric stickyPct = 41% at 844x390 and 43% at 915x412 (~160-177 CSS px of a 390-412px viewport), leaving only 57-59% for listings — below the >=60% budget for <=700px-tall viewports. There is no max-height media query anywhere in globals.css to unstick the filterbar on short viewports.
- **Why:** A renter browsing in landscape (or with the keyboard open in the search field, which shrinks the visual viewport further) sees barely half a card row at a time; 2026 marketplace practice caps persistent chrome at ~40% and unsticks secondary bars on short viewports.
- **Fix:** Add @media (max-height: 520px) { .nk-filterbar { position: static } } (or top:0 and let the nav scroll away) near globals.css:1110; keep only one sticky layer on short viewports.
- **Evidence:** `feed/base-lt-0844x0390-dpr2-vp.png` · `feed/base-lt-0915x0412-vp.png` · app/globals.css:543 .nk-nav-bar; app/globals.css:1110 .nk-filterbar
- *RB-07 · confidence 0.85 · measured*

**RSP-196 · POLISH** — Wrapping breadcrumb leaves a dangling '>' at line end (trail is 2 rows despite one-row intent) (320–430px, locales: en, lt)

- **What:** Each crumb segment carries its TRAILING chevron (ui.tsx:324-328, whiteSpace:nowrap per segment), so when the trail wraps — at ≤430 for 'Pagrindinis > Nuomojami daiktai > Fotografija ir video', and even the 2-crumb feed trail at 344 — line 1 ends in an orphaned '>' and line 2 starts with a bare label. The globals.css:1069 comment says hiding the current-page chip keeps 'the trail one row', but 3-segment landing trails still wrap at ≤430.
- **Why:** Dangling separators read as broken markup on the very first content row of every landing page.
- **Fix:** Move the chevron to precede each non-first crumb inside its nowrap segment (ui.tsx:324-328) so wrapped lines start with '> Label', or truncate middle crumbs at ≤430.
- **Evidence:** `feed-q-long/base-lt-0344x0882-dpr2-vp.png` · `feed-cat-city/catrail-end-lt-0390x0844-dpr2-vp.png` · `feed-cat-city/base-en-0320x0568-dpr2-fp.png` · app/globals.css:1071 .nk-crumbs ≤680 current-page rule
- *RB-10 · confidence 0.9 · visual*

**RSP-215 · POLISH** — Root feed (and other single-level pages) spend a full breadcrumb row on a lone 'Pagrindinis' link <=680 (320–680px)

- **What:** On /skelbimai with no category the trail is Home > [current]; hiding the current chip <=680 leaves a row containing only the home crumb (feed 390 vp). Deep pages (subcat-city, detail) keep 2-3 segment trails at the same width, so the crumb row's information value is inconsistent across pages while its vertical cost (~44px + 22px margin) is constant.
- **Why:** Wasted above-the-fold space on the highest-traffic browse page at mobile widths; inconsistent with the trail-bearing pages, so the chrome reads accidental rather than systematic.
- **Fix:** For 1-item trails keep the current-page chip visible <=680 (scope the hide rule to trails with >=2 items, e.g. :has() count guard or a modifier class from Breadcrumb when items.length===1), or drop the breadcrumb entirely on root feed mobile.
- **Evidence:** `feed/base-lt-0390x0844-dpr2-vp.png` · `subcat-city-deep/base-lt-0390x0844-dpr2-vp.png` · app/globals.css:1077 @media(max-width:680px) .nk-crumbs [aria-current="page"]{display:none}
- *RB-24 · confidence 0.8 · measured*

### filter-popovers

**RSP-162 · MEDIUM** — FilterSelect dropdown overflows the fold on short viewports; scrollbar click dismisses it (561–1920px, state: filter-popover; ≤700px-tall desktop/tablet windows (1280x620 evidenced))

- **What:** At 1280x620 the open Kategorija listbox shows only ~2.5 of 10+ options above the fold: the panel is absolutely positioned below the trigger (ui.tsx:470-471) with maxHeight:min(60vh,480px)=372px, but only ~120px remain under the trigger, so ~250px of panel sits below the viewport. Reaching lower options needs page scroll while the popover is open — and FilterSelect closes on any outside mousedown (ui.tsx:455), so grabbing the scrollbar dismisses it; wheel/keyboard are the only working paths.
- **Why:** RB-23: overlays must fit short viewports or scroll internally from a visible position. 2026 popover practice (anchor-positioning/floating-ui) flips or shrinks to available space; a filter menu you must fight to read is below the flagship bar on 13" laptops with docked browsers.
- **Fix:** Clamp panel height to the space below the trigger (maxHeight:min(60vh,480px, calc(100dvh - triggerBottom - 16px)) via a measured style or CSS anchor positioning), or auto-flip direction to 'up' when below-space < panel height (ui.tsx:469).
- **Evidence:** `feed/filter-popover-p2-lt-1280x0620-vp.png` · `feed/filter-popover-p2-lt-1024x0768-vp.png` · app/components/ui.tsx:469-471 panelPos (static up/down, no collision logic); app/components/ui.tsx:493-495 maxHeight:min(60vh,480px)
- *RB-23 · confidence 0.85 · measured*

### filter-sheet

**RSP-176 · MEDIUM** — Filter bottom sheet caps at raw 92vh — exceeds the visible viewport under iOS dynamic toolbar (320–560px, state: filters-open; locales: en, lt; dynamic-toolbar viewports)

- **What:** .nk-sheet (shared by the mobile filter sheet, FeedScreen.tsx:832) uses max-height:92vh. vh resolves to the LARGE viewport on mobile; with the Safari toolbar expanded the visible height is ~11% smaller, so a content-full sheet (the filter sheet's category+city+price+sort groups exceed it) is taller than the fixed scrim and its top — the title + close button row — pushes above the visible viewport by ~20-30px.
- **Why:** Sheets sized in raw vh are the canonical 2026 dvh/svh defect; the dismiss affordance is the part that gets clipped.
- **Fix:** app/globals.css:933 → max-height:min(92vh, calc(100dvh - 24px)) (keeps behaviour in browsers without dvh via the 92vh term).
- **Evidence:** `feed-filtered/base-lt-0360x0800-dpr2-vp.png` · app/globals.css:933 .nk-sheet{max-height:92vh}
- *RB-06 · confidence 0.8 · code-inferred*

### footer

**RSP-181 · MEDIUM** — Back-to-top FAB ignores env(safe-area-inset-right); sits in the notch zone in landscape (769–1024px, state: back-to-top; locales: en, lt; landscape phones (notched iPhones, 844x390 / 932x430))

- **What:** The site sets viewport-fit:cover (app/[lang]/layout.tsx:93), so landscape notched iPhones report safe-area-inset-left/right ~47-59px and the page paints edge-to-edge. .nk-backtotop (globals.css:960) offsets bottom with env(safe-area-inset-bottom) but right is only clamp(16px,4vw,32px) — 33.8px at 844x390, i.e. ~13px of the 48px FAB extends into the right sensor-housing/curved-corner zone when the notch is on the right.
- **Why:** A fixed control partially under the housing/curve is hard to see and tap — RB-08 requires left/right safe-area on every fixed element in landscape, not just bottom.
- **Fix:** globals.css:960 → right:calc(clamp(16px,4vw,32px) + env(safe-area-inset-right)); audit the sticky .nk-filterbar/.nk-nav padding the same way (container gutter 6vw=50.6px at 844 clears the 47px inset only coincidentally).
- **Evidence:** `feed/back-to-top-lt-1280x0800-vp.png` · `feed/base-lt-0844x0390-dpr2-vp.png` · app/globals.css:960 .nk-backtotop
- *RB-08 · confidence 0.75 · code-inferred*

### filtersheet-overlay

**RSP-188 · MEDIUM** — Mobile filter sheet and bridge sheet cap height with raw 92vh instead of dvh/svh (320–560px, state: filter-sheet, redirect-modal; locales: en, lt; worst on short phones with expanded browser chrome (e.g. 667lvh/~553 visible svh))

- **What:** .nk-sheet (mobile filter bottom sheet, FeedScreen.tsx:832) and .nk-redirect-panel's mobile form both use max-height:92vh. On mobile, vh resolves to the large viewport; with the URL bar expanded the visible height is svh (~10-15% smaller), so a content-full sheet can extend ~40-80px below the visible edge — the sticky .nk-filtersheet__foot with the apply ('Rodyti') button sits behind the browser toolbar until the user scrolls the sheet.
- **Why:** RB-06 explicitly classes raw 92vh on mobile-affected overlays as a defect; the apply button of the primary filtering UI must be visible when the sheet opens. (The nav drawer at globals.css:584 already uses 100dvh correctly — the sheets are the stragglers.)
- **Fix:** Change max-height:92vh to max-height:min(92dvh, 92svh + env(safe-area-inset-bottom)) — practically: 88svh — at globals.css:934 and 1046.
- **Evidence:** app/globals.css:934 .nk-sheet max-height:92vh; app/globals.css:1046 .nk-redirect-panel max-height:92vh (mobile)
- *RB-06 · confidence 0.7 · code-inferred*

### rail

**RSP-208 · POLISH** — All three snap rails lack overscroll-behavior-x containment (idiom triplicated, no shared utility) (344–980px, locales: en, lt)

- **What:** The three edge-bleed horizontal rails (.nk-catrail, .nk-cats-shelf, .nk-grid-4--rail) hide scrollbars and (for two of them) use scroll-snap-type:x mandatory, but none sets overscroll-behavior-x:contain, so end-of-rail momentum chains into the page/browser (horizontal swipe-back gesture on trackpads). The CSS comment at :2049 already flags the triplication as 'candidate for a shared utility'. Continuation affordances are otherwise good (gutter mask fades on .nk-cats-shelf, chip peek on .nk-catrail).
- **Why:** RB-14: rails need overscroll containment; on macOS trackpads and Android an end-of-rail flick can trigger history-back navigation, losing the browse session.
- **Fix:** Add overscroll-behavior-x:contain to the three rail rules (or extract the shared rail utility the comment proposes and set it there once).
- **Evidence:** `home/base-lt-0980x0900-fp.png` · `feed/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1137 .nk-catrail (feed chip rail <=560); app/globals.css:2056 .nk-cats-shelf (home category rail <=980)
- *RB-14 · confidence 0.85 · code-inferred*

### back-to-top

**RSP-220 · POLISH** — Back-to-top FAB handles safe-area bottom but not right - landscape notch can encroach (561–768px, state: back-to-top; locales: en, lt)

- **What:** .nk-backtotop (globals.css:960) offsets bottom with calc(20px + env(safe-area-inset-bottom)) but its right offset is a bare clamp(16px,4vw,32px) with no env(safe-area-inset-right); in-band widths 640-768 are exactly landscape-phone widths where the notch sits on a side edge.
- **Why:** RB-08 requires safe-area completeness on every fixed element's left/right in landscape, not just bottom; a notch-side FAB loses part of its 44px target under the sensor housing.
- **Fix:** globals.css:960: right:calc(clamp(16px,4vw,32px) + env(safe-area-inset-right)).
- **Evidence:** `feed/back-to-top-lt-0768x1024-dpr2-vp.png` · app/globals.css:960 .nk-backtotop
- *RB-08 · confidence 0.8 · code-inferred*

**RSP-227 · POLISH** — Back-to-top FAB honours only the bottom safe-area inset — no env(safe-area-inset-right) for landscape notches (561–1024px, state: scrolled; locales: en, lt; landscape phones/tablets with a right-side sensor housing)

- **What:** globals.css:960 offsets .nk-backtotop with bottom:calc(20px + env(safe-area-inset-bottom)) but right:clamp(16px,4vw,32px) has no safe-area term. In landscape on notched phones (viewport widths 640-932, inside this band) safe-area-inset-right is ~44-59px, so the FAB can sit partly inside the sensor-housing/rounded-corner zone.
- **Why:** RB-08 requires safe-area completeness on every fixed element, not just the bottom edge; a partially occluded FAB is a classic landscape regression.
- **Fix:** right:calc(clamp(16px,4vw,32px) + env(safe-area-inset-right)) at globals.css:960.
- **Evidence:** app/globals.css:960 .nk-backtotop{right:clamp(16px,4vw,32px);bottom:calc(20px + env(safe-area-inset-bottom))}
- *RB-08 · confidence 0.7 · code-inferred*

### chrome

**RSP-225 · POLISH** — Back-to-top FAB right offset ignores env(safe-area-inset-right) in landscape (568–980px, state: scrolled; locales: en, lt; landscape phones)

- **What:** .nk-backtotop (globals.css:965) offsets bottom with env(safe-area-inset-bottom) but right only with clamp(16px,4vw,32px); in landscape with a ~47px right inset the 48px FAB can overlap the curved-corner/notch region. The legal page's equivalents already do this right (legal.css:273/275 pattern with safe-area).
- **Why:** Minor reach/visibility issue in landscape; inconsistent with the site's own legal-page FABs.
- **Fix:** right:max(clamp(16px,4vw,32px), env(safe-area-inset-right)) at app/globals.css:965.
- **Evidence:** app/globals.css:965 .nk-backtotop right:clamp(16px,4vw,32px)
- *RB-08 · confidence 0.7 · code-inferred*


---

## 3. Listing detail (/skelbimai/[id])

*Audited 0–980 and 981+ regimes, boundary pairs (980/981, 1119/1121, 1280/1281, 1440/1441), height matrix (bento ≤780 clamp at 1280/1920, landscape, 620-tall laptops), bento photo-count series 0–5 (mock), stress titles/prices/owner, lightbox at 4 orientations, reserve/mbar scroll states, desc expansion. 72 substantiated findings (3 HIGH · 46 MEDIUM · 23 POLISH).*

**Band walkthrough.** ≤360: LT breadcrumb stacks three 44 px rows (~150 px) above the H1 (RSP-266); review cards clip unbreakable tokens mid-word (RSP-233, stress-verified). 361–560: bento 2-up mosaic + hero tile solid at all counts; compact skin cliffs at 560/561 (H1 −18 % via `!important`, RSP-class). 561–980: inline booking facts + fixed mbar work; 1–2-photo listings render non-hero tiles as ~5:1 slivers on tablets (RSP-268). Seam 980/981: the flip to sticky sidebar is clean — but the 981–993 px min-content squeeze (874 px vs ~863 px container) clips ~11 px, masked by `overflow-x:clip` (RSP-seams, code-adjudicated); at the 981 minimum the booking panel's nowrap price/rating row overflows at stress numbers (RSP-234). 981–1280: prose measure runs 93ch ≥1025 — the 62ch cap ends at 1024 (RSP-class); rail cards drop −26 % at the 1024/1025 ladder step. ≥1281: rail caps 4-up so the 5th similar item wraps to a lone row (RAIL_MAX=5 vs the 4-up cap); 1340 cap deliberate and centered to 3840; bento `sizes` (60vw big tile) ignores the 1340 cap — oversized fetches at wide (RSP-class).

**Height axis.** Landscape phones: nav + mbar consume 37–43 % (RSP-241) and the mbar lacks side insets (RSP-235); the bento ≤780 clamp works at 1280/1920×780 (verified good). Lightbox uses 48 px desktop arrows on phones, shrinking the photo to ~65 % width (RSP-429) and ~56 % height in landscape (RSP-445).

### All findings — Listing detail

### reviews

**RSP-233 · HIGH** — Review card body and reviewer name clip mid-word at <=360px when a long token appears (320–360px)

- **What:** At 320 and 344 CSS px, every review-card body line and the reviewer-name row run past the card's right padding to the viewport edge and are hard-clipped: line-end words lose their endings ('Rekomendu[oju]', 'ira[ngos]', 'smugin[is]'), and the name 'Nebeprisikiskiakopusteliaudavome Vardenis-Pavardenis' is cut to 'Nebeprisikiskiakopusteliaudav'. The unbreakable 33-char token (~267px at 15px Sora) exceeds the card content width (~230px at 320), the 1fr grid track grows to the item's min-content width, and an ancestor clip hides ~20-40px of every line. At 390 the same content fits (name wraps to 2 lines).
- **Why:** Review text is core trust content on a rental marketplace; readers lose word endings on every line at iPhone SE/Fold-cover widths (RB-21: 344 breaks). Long unbroken tokens (company names, URLs, LT compounds) are realistic UGC.
- **Fix:** Add minWidth:0 + overflowWrap:'anywhere' to the review card container (app/components/ListingDetail.tsx:748) or set overflow-wrap:anywhere on the name span (:755) and body p (:761); alternatively add .nk-rev-grid>*{min-width:0} next to app/globals.css:1364.
- **Evidence:** `mock-stress-title/base-lt-0320x0568-dpr2-fp.png` · `mock-stress-title/base-lt-0344x0882-dpr2-fp.png` · `mock-stress-title/base-lt-0390x0844-dpr2-fp.png` · app/globals.css:1364 .nk-rev-grid (max-width:980px override)
- *RB-01 · confidence 0.9 · measured*

### booking

**RSP-234 · HIGH** — BookingPanel price row: nowrap rating overflows the card at max price + 5-digit review count (320–1120px)

- **What:** The price row (ListingDetail.tsx:822-829) is a flex row of three nowrap spans: price '9999,99 EUR' (33px), unit '/ diena', and marginLeft:auto rating '5,0 - 12345'. Under stress content the rating span paints OUTSIDE the card: at 981px (sidebar ~300px wide) '12345' visibly extends past the card border onto the page background; at 320-344 (inline card) it is clipped at the card/viewport edge ('5,0 - 123'). Additionally at 320-390 the unit wraps AFTER the slash, leaving a dangling '/' on line 1 and 'diena' alone on line 2. Fits cleanly at 430-980 and >=1121.
- **Why:** Text painted outside its card border reads as broken UI on the primary conversion panel; the affected bands include the first desktop two-column band (981-1120, common ~1024 tablets-landscape/small laptops) and the smallest phones.
- **Fix:** In ListingDetail.tsx:822 add flexWrap:'wrap' to the row and drop whiteSpace:'nowrap' from the rating span (or render rating on its own line when it doesn't fit); wrap price+unit in a single nowrap span so '/ diena' can never split after the slash.
- **Evidence:** `mock-stress-numbers/base-lt-0981x0900-fp.png` · `mock-stress-numbers/base-lt-0320x0568-dpr2-fp.png` · `mock-stress-title/base-lt-0390x0844-dpr2-fp.png` · app/globals.css:1242 .nk-detail-grid (sidebar clamp(300px,30vw,372px)); app/globals.css:1354 .nk-booking-inline
- *RB-01 · confidence 0.9 · measured · verified (orchestrator re-check: shot + code)*

**RSP-235 · HIGH** — Fixed mobile Reserve bar ignores left/right safe-area insets in landscape (320–980px, locales: en, lt; landscape phones (viewport-fit=cover, safe-area-inset-left/right ≈ 47-59px))

- **What:** viewport-fit=cover is set, so on notched iPhones in landscape env(safe-area-inset-left/right) ≈ 47-59px. .nk-mbar spans left:0..right:0 and pads only the bottom with var(--nk-safe-bottom); horizontal padding is a flat 20px (12px ≤560). The bar shows at every width ≤980 — which includes ALL landscape phones (844×390, 932×430) — so the price text (left) and the Reserve button (right) sit inside the notch / rounded-corner exclusion zones.
- **Why:** The Reserve CTA is the page's primary action; in landscape its label/edge is visually clipped by the sensor housing and corner radius. Every 2026 marketplace with a fixed bottom bar pads it with max(padding, env(safe-area-inset-left/right)).
- **Fix:** globals.css:1337 — padding:14px max(20px,env(safe-area-inset-right)) calc(14px + var(--nk-safe-bottom)) max(20px,env(safe-area-inset-left)); mirror in the ≤560 override at :1383.
- **Evidence:** app/globals.css:1335-1337 .nk-mbar (fixed left:0;right:0;bottom:0; padding 14px 20px …); app/globals.css:1383 .nk-mbar ≤560 (padding 10px 12px …)
- *RB-08 · confidence 0.85 · code-inferred · verified (orchestrator re-check: shot + code)*

**RSP-238 · MEDIUM** — Detail grid min-content exceeds the container in the 981-~995px band, clipping the booking sidebar (981–996px, locales: en, lt)

- **What:** In the 981-1120 band the grid minimum is 560+286+28 = 874px, but the .nk-container inner width at 981px is 981 − 2×(6vw=58.9) ≈ 863px. The grid overflows by ~11px; body overflow-x:clip means no scrollbar — the booking sidebar's right edge (border, padding) is clipped at the viewport edge until ~996px, right after the sidebar re-appears at 981.
- **Why:** The booking card is the conversion element on the page; a clipped card edge at window widths just under 1000px reads as broken. It appears exactly at the breakpoint where the layout 'upgrades' to two columns — the worst place for an overflow.
- **Fix:** globals.css:1346 — lower the content minimum for this band (minmax(0,1fr) or minmax(520px,1fr)) or reduce to minmax(280px,300px) + gap 24 so 981px clears: 520+280+24 = 824 < 863.
- **Evidence:** app/globals.css:1345-1347 .nk-detail-grid 981-1120 {minmax(560px,1fr) minmax(286px,320px); gap:28px}; app/globals.css:337 .nk-container + :203 --nk-gutter (6vw)
- *RB-01 · confidence 0.9 · code-inferred*

**RSP-240 · MEDIUM** — HostCard stat label 'Atsiliepimai' clips to 'Atsiliep' at 320 under text spacing (320–375px, state: textspacing)

- **What:** The owner trust card's 3-up stat grid gives each cell ~88 CSS px at 320. The single-word label 'Atsiliepimai' cannot wrap (no hyphens/overflow-wrap) and under injected letter spacing exceeds the cell; the grid wrapper's overflow:hidden (borderRadius 14) cuts it mid-word to 'Atsiliep' with no ellipsis.
- **Why:** WCAG 1.4.12: the reviews-count label loses meaning when clipped. Lithuanian's long single words make fixed 1/3 cells fragile at 320-375.
- **Fix:** On the stat label span (app/components/ListingDetail.tsx:911) add overflowWrap:'anywhere' (or hyphens:'auto' with lang) so long LT labels break instead of clipping; alternatively use dict short-forms for stat labels.
- **Evidence:** `detail-full/textspacing-lt-0320x0568-dpr2-fp.png` · app/components/ListingDetail.tsx:905 stat grid (gridTemplateColumns:'1fr 1fr 1fr', overflow:hidden); app/components/ListingDetail.tsx:911 label span fontSize:12 (no overflow-wrap/hyphens)
- *RB-11 · confidence 0.9 · measured*

**RSP-241 · MEDIUM** — Landscape phones: sticky nav + fixed booking bar consume 37-43% of viewport on detail (320–980px, fails at ≤~430px-tall landscape phones (780x360, 844x390, 915x412))

- **What:** On the listing detail page the sticky .nk-nav-bar (76px at rest, 68px scrolled) and the fixed bottom .nk-mbar (min-height 72px + safe-area) are both always present ≤980px. At 780x360 the two bars total ~150px CSS = 42% of viewport (manifest stickyPct 43); at 844x390 = 39%; at 915x412 = 37%. Content budget drops below the 60% floor on 360-390-tall landscape phones.
- **Why:** Landscape phone readers get a letterbox of ~210px of actual content between two chrome bars; every scroll gesture moves less than one card of content. 2026 practice is to auto-hide or slim fixed chrome under a max-height media query.
- **Fix:** Add @media (orientation:landscape) and (max-height:480px){ .nk-nav-bar{position:static} } (or auto-hide nav on scroll-down), and slim .nk-mbar to a single-row 56px variant in the same query (globals.css:1331,1379).
- **Evidence:** `detail-full/base-lt-0780x0360-dpr2-vp.png` · `detail-full/base-lt-0915x0412-vp.png` · `detail-full/base-lt-0932x0430-vp.png` · app/globals.css:1331 .nk-mbar; app/globals.css:543 .nk-nav-bar
- *RB-07 · confidence 0.9 · measured*

**RSP-251 · MEDIUM** — Fixed reserve bar (.nk-mbar) has no safe-area left/right — price/CTA collide with the notch in landscape (320–980px, state: base, landscape; locales: en, lt; landscape phones (≤980w includes 932×430, 852×393))

- **What:** The fixed mobile reserve bar spans left:0;right:0 with only 20px horizontal padding (12px at ≤560, globals.css:1387) and handles only the bottom inset (--nk-safe-bottom). The ≤980px activation range fully includes landscape notched phones (e.g. iPhone 15 Pro Max landscape 932×430, safe-area-inset-left/right ≈ 59px), where the price block or the "Rezervuoti" CTA sits inside the sensor-housing inset / curved-corner zone. The floating back-to-top button (globals.css:960) similarly offsets right by clamp(16px,4vw,32px) with no env(safe-area-inset-right). The lightbox, by contrast, guards all three insets (globals.css:1277-1279) — the pattern exists in the codebase but wasn't applied to the highest-value fixed CTA.
- **Why:** The reserve bar is the page's persistent conversion CTA; content under the landscape notch/corner radius is partially occluded and hard to tap — a 2026 baseline requirement for edge-pinned chrome.
- **Fix:** globals.css:1330 — padding-inline:max(20px, env(safe-area-inset-left)) max(20px, env(safe-area-inset-right)) (and max(12px,…) in the ≤560 block at :1387); globals.css:960 — right:max(clamp(16px,4vw,32px), env(safe-area-inset-right)).
- **Evidence:** app/globals.css:1330 .nk-mbar (fixed;left:0;right:0;padding:14px 20px calc(14px + var(--nk-safe-bottom))); app/globals.css:960 .nk-backtotop (right:clamp(16px,4vw,32px), no safe-area-right)
- *RB-08 · confidence 0.85 · code-inferred*

**RSP-253 · MEDIUM** — 981-996px: detail grid min-content (874px) exceeds the container (~863px) — booking sidebar edge clipped ~11px (981–996px, locales: en, lt)

- **What:** In the 981-1120 band the detail grid needs at least 560+286+28 = 874px (globals.css:1346), but .nk-container at a 981px viewport provides 981 − 2×clamp(20px,6vw,82px)=2×58.9 ≈ 863px. The 1-column collapse only starts at ≤980 (globals.css:1352), so from 981 to ~996px the grid overflows its container by up to ~11px; body/page overflow-x:clip (globals.css:328,336) hides the scrollbar and instead clips the right edge of the sticky booking panel — the card border/shadow and part of its padding vanish exactly at the width where the sidebar reappears. (Rubric id approximated: horizontal-overflow class.)
- **Why:** The reserve/booking card is the conversion surface; a visibly amputated card edge right after the layout 'upgrades' from mobile to desktop reads as broken, and clip-masked overflow is worse than a scrollbar because nothing signals the missing pixels.
- **Fix:** globals.css:1346 — reduce the band's main column to minmax(546px,1fr) or the gap to 16px (546+286+16 = 848 ≤ 863), or move the 2-column start to min-width:996px to match the actual fit.
- **Evidence:** app/globals.css:1345-1347 .nk-detail-grid (981-1120: minmax(560px,1fr) minmax(286px,320px) gap 28); app/globals.css:337+203 .nk-container gutter
- *RB-01 · confidence 0.85 · code-inferred*

**RSP-257 · MEDIUM** — Handover 'Nemokamai' pill pushed past the 320 viewport edge and clipped under text spacing (320–400px, state: textspacing)

- **What:** In the 'Daikto perdavimas' section the pickup HandoverRow is a non-wrapping flex row: icon + label/value column (flex:1) + trailing Pill. Under injected letter/word spacing the widened 'Vilnius, Senamiestis' value pushes the nowrap pill so it starts at ~212 CSS px and runs off the 320px viewport; rendered text reads 'Nemokama' with the trailing glyphs and pill edge cut (no ellipsis).
- **Why:** WCAG 1.4.12 failure: the free-pickup trust signal is visually truncated. nowrap pills placed at the end of flexible rows are a classic reflow trap at narrow widths.
- **Fix:** Add flexWrap:'wrap' to the HandoverRow root (app/components/ListingDetail.tsx:650) so the pill drops below the value on overflow, and/or give Pill a max-width:100% + overflow guard instead of bare whiteSpace:nowrap (app/components/ui.tsx:305).
- **Evidence:** `detail-full/textspacing-lt-0320x0568-dpr2-fp.png` · app/components/ListingDetail.tsx:650 HandoverRow flex row (no wrap); app/components/ListingDetail.tsx:691 pill={<Pill tone="green">{t.pickupFree}}
- *RB-11 · confidence 0.85 · measured*

**RSP-261 · MEDIUM** — Fixed reserve bar has bottom safe-area inset but no left/right insets for landscape notches (320–980px, locales: en, lt; landscape most affected)

- **What:** .nk-mbar spans left:0;right:0 with fixed 20px (12px at <=560) horizontal padding and only var(--nk-safe-bottom) handling. env(safe-area-inset-left/right) is never applied, so in landscape on notched phones (insets ~48-59px) the price block or the Rezervuoti button sits under the sensor housing / display corner radius.
- **Why:** RB-08 requires safe-area completeness on every fixed bar, not just bottom. The bar carries the page's primary CTA; a partially occluded CTA in landscape is a conversion-path defect on iPhones in landscape Safari.
- **Fix:** In app/globals.css:1332 change horizontal padding to padding:14px max(20px, env(safe-area-inset-right)) calc(14px + var(--nk-safe-bottom)) max(20px, env(safe-area-inset-left)); mirror in the <=560 override at :1378.
- **Evidence:** `detail-full/base-lt-0915x0412-vp.png` · `detail-full/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:1330-1332 .nk-mbar padding:14px 20px calc(14px + var(--nk-safe-bottom))
- *RB-08 · confidence 0.85 · code-inferred*

**RSP-269 · MEDIUM** — BookingPanel and OfferCard render in 2+ container contexts but size via viewport media (zero @container) (320–1920px)

- **What:** BookingPanel renders full-width inline (<=980, 280-940px wide) and in a 300-372px sticky sidebar (>980) with identical fixed type (33px price, nowrap rating) - the 981-1120 overflow (see booking finding) is a direct symptom of viewport-based sizing in a narrow container. OfferCard renders in the detail similar rail (min(68%,240px) columns <=560, 4-col grid >980), the feed grid, and the home shelf; its eyebrow steps 10.5px -> 9.5px via viewport <=560 (globals.css:1903), so a 240px rail card at 561px viewport gets the larger type than a 400px card at 559px.
- **Why:** The repo has zero @container; these are the textbook migration targets - per-container sizing would remove the sidebar overflow class of bugs and the eyebrow's viewport/card-width mismatch.
- **Fix:** Add container-type:inline-size to .nk-reserve/.nk-booking-inline and to the offer-card grid cells; move the price-row layout and .nk-offer__eyebrow steps into @container (cqw-based) rules.
- **Evidence:** `mock-stress-numbers/base-lt-0981x0900-fp.png` · `mock-stress-title/base-lt-0768x1024-dpr2-fp.png` · `mock-stress-title/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1242 .nk-detail-grid; app/globals.css:1903 .nk-offer__eyebrow (<=560)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-271 · MEDIUM** — Fixed reserve bar handles safe-area bottom but not left/right; it shows through landscape (≤980) (320–980px, landscape phones (390-430px tall))

- **What:** The fixed .nk-mbar (price + Rezervuoti CTA) spans left:0;right:0 with plain 20px/12px horizontal padding. It is displayed for all viewports ≤980px, which includes every landscape phone (844x390, 932x430), where env(safe-area-inset-left/right) is ~47-59px for the notch/Dynamic Island. The price text or CTA edge falls into the sensor housing / home-indicator corner radius zone. Only the lightbox (globals.css:1279-1280) pads left/right safe areas.
- **Why:** RB-08 requires safe-area completeness on every fixed bar, not just bottom; the reserve CTA is the page's primary action and landscape browsing on phones is a mainstream orientation for photo-heavy listing pages.
- **Fix:** At globals.css:1333/1379 use padding-left:max(20px,env(safe-area-inset-left)); padding-right:max(20px,env(safe-area-inset-right)) (12px variant at ≤560).
- **Evidence:** `detail-full/base-lt-0980x0900-vp.png` · `detail-full/base-lt-0560x0900-dpr2-vp.png` · app/globals.css:1331-1333 .nk-mbar{left:0;right:0;padding:14px 20px calc(14px + var(--nk-safe-bottom))}; app/globals.css:1379 ≤560 .nk-mbar{padding:10px 12px calc(10px + var(--nk-safe-bottom))}
- *RB-08 · confidence 0.85 · code-inferred*

**RSP-273 · MEDIUM** — Fixed reserve bar has no safe-area-inset-left/right — CTA sits under the notch in landscape (568–980px, locales: en, lt; landscape phones (notch on left/right))

- **What:** viewportFit:"cover" is set (layout.tsx:93), so in landscape on notched phones env(safe-area-inset-left/right) is ~47px and page content extends into it. .nk-mbar (fixed, left:0;right:0, shown ≤980 — all landscape phones) pads only 20px horizontally (globals.css:1337) plus safe-bottom; the price block or Reserve button can sit partially under the sensor housing / within the curved corner region. The lightbox handles this correctly (globals.css:1282-1284 pad left/right with env()); the mbar does not.
- **Why:** The Reserve CTA is the core conversion path on the listing page; landscape browsing of a photo-heavy listing page is a mainstream orientation.
- **Fix:** At app/globals.css:1337 use padding:14px max(20px, env(safe-area-inset-right)) calc(14px + var(--nk-safe-bottom)) max(20px, env(safe-area-inset-left)) (and mirror in the ≤560 override at 1383).
- **Evidence:** app/globals.css:1335-1337 .nk-mbar (padding 14px 20px + safe-bottom only); app/globals.css:1383 .nk-mbar ≤560 (padding 10px 12px)
- *RB-08 · confidence 0.8 · code-inferred*

**RSP-278 · MEDIUM** — Fixed booking bar has bottom safe-area only — no env(safe-area-inset-left/right) for landscape (320–980px, locales: en, lt; landscape notched phones)

- **What:** .nk-mbar spans left:0;right:0 with fixed 20px (12px ≤560) horizontal padding and only pads the bottom inset via --nk-safe-bottom. In landscape on notched phones (env left/right up to ~59px) the price block or the Rezervuoti CTA sits inside the notch/rounded-corner exclusion zone. The lightbox already does this correctly (globals.css:1278-1280), so the system is inconsistent.
- **Why:** The Rezervuoti button is the page's single conversion action; in landscape it can be partially under the corner radius/notch shadow. Safe-area completeness on every fixed bar is table stakes for 2026 mobile web.
- **Fix:** globals.css:1331 — padding:14px max(20px,env(safe-area-inset-right)) calc(14px + var(--nk-safe-bottom)) max(20px,env(safe-area-inset-left)); mirror in the ≤560 override at :1379.
- **Evidence:** `detail-full/base-lt-0780x0360-dpr2-vp.png` · `detail-full/base-lt-0915x0412-vp.png` · app/globals.css:1331 .nk-mbar{left:0;right:0;padding:14px 20px calc(14px + var(--nk-safe-bottom))}; app/globals.css:220 --nk-safe-bottom
- *RB-08 · confidence 0.75 · code-inferred*

**RSP-284 · POLISH** — Reserve-bar reassurance line truncates mid-word below ~350px ('Galutine suma programel...') (320–350px)

- **What:** The .nk-mbar note is capped at min(52vw,340px) with ellipsis; at 320px that is 166px and 'Galutine suma programeleje' truncates to 'Galutine suma progra...' (320) / 'programel...' (344). The truncated line no longer communicates 'final amount in the app'.
- **Why:** A trust/reassurance string that never renders whole on 320-350px devices is dead copy; better to drop it than show half of it.
- **Fix:** At <=360 either hide the note (display:none) keeping the price prominent, or let it wrap to two 11-12px lines instead of ellipsizing (remove white-space:nowrap for the note span only).
- **Evidence:** `detail-full/base-lt-0320x0568-dpr2-vp.png` · `detail-full/base-lt-0344x0882-dpr2-vp.png` · app/globals.css:1339 .nk-mbar > span span{max-width:min(52vw,340px);text-overflow:ellipsis}
- *RB-01 · confidence 0.9 · measured*

**RSP-285 · POLISH** — Reserve-bar hide/show slide animation is not gated by prefers-reduced-motion (320–980px, locales: en, lt)

- **What:** The fixed .nk-mbar animates transform/opacity (.22s) every time the footer IntersectionObserver toggles .is-hidden. Unlike .nk-cat, .nk-fadecontent, skeletons etc., this transition has no prefers-reduced-motion:reduce override, so reduced-motion users still get a sliding bar on every scroll past the footer boundary.
- **Why:** Every other animation in the file is gated; a fixed element that repeatedly slides at a viewport edge is among the more vestibular-hostile motions to leave ungated (RB-16).
- **Fix:** Add @media(prefers-reduced-motion:reduce){.nk-mbar{transition:none}} near globals.css:1337.
- **Evidence:** `detail-full/base-lt-0430x0932-dpr2-fp.png` · app/globals.css:1333-1337 .nk-mbar transition + .is-hidden slide
- *RB-16 · confidence 0.9 · code-inferred*

**RSP-295 · POLISH** — Booking bar subtext ellipsizes to 'Galutinė suma progra…' at 320, dropping the key word (320–360px)

- **What:** The .nk-mbar price subtext is capped at 52vw; at 320px that's 166px, truncating 'Galutinė suma programėlėje' right before 'programėlėje' — the word that explains where the final sum lives (the app).
- **Why:** The truncated string is exactly the app-bridge value proposition; cutting the noun makes the line meaningless on the smallest phones.
- **Fix:** Provide a short variant in the Dict for ≤360 (e.g. 'Suma programėlėje') or allow two lines at ≤360 instead of nowrap (globals.css:1340).
- **Evidence:** `detail-full/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:1340 .nk-mbar > span span{max-width:min(52vw,340px);text-overflow:ellipsis}
- *RB-01 · confidence 0.8 · visual*

### grid

**RSP-232 · MEDIUM** — Feed/offer grid ladder has 1px range gaps where the base 5-up leaks through (560–1281px, locales: en, lt)

- **What:** The desktop base for .nk-grid-feed and .nk-grid-4 is repeat(5,minmax(0,1fr)); the step-downs are exclusive integer ranges (max-width:560 / 561-700 / 701-1024 / 1025-1280). At any fractional viewport width inside the seams (560,561), (700,701), (1024,1025), (1280,1281) — which occur under browser zoom, OS display scaling, and non-integer DPR — NO range matches and the base 5-up applies. At ~560.5px that renders five ~64px-wide listing cards.
- **Why:** Browser zoom (Ctrl+/-) and 125%/150% OS scaling produce fractional CSS viewport widths constantly; a user zooming the feed at ~700px lands on a 5-column micro-card layout that is unreadable. 2026 practice is overlapping ranges (media (width < 561px)) or a mobile-first max-only cascade so the base can never leak.
- **Fix:** Make the ladder mobile-first (base = 2-up, min-width steps up) or use range syntax `@media (561px <= width <= 700px)` with the base defined as the SMALLEST layout; alternatively change each min-width:N+1 to min-width:N.02px-style overlap. Apply the same to .nk-grid-cats (globals.css:1102-1105) whose auto-fit base degrades gracefully but still flips at seams.
- **Evidence:** app/globals.css:1187 .nk-grid-feed (base repeat(5)); app/globals.css:1188-1191 .nk-grid-feed range ladder
- *RB-01 · confidence 0.95 · code-inferred · verified, rescoped*

### rail

**RSP-236 · MEDIUM** — Similar-items snap rail lacks scroll-padding-inline — cards snap flush to the viewport edge (320–560px, locales: en, lt)

- **What:** The ≤560 'Panašūs daiktai' carousel bleeds to the viewport edge (negative gutter margins) and pads content by var(--nk-gutter), but sets no scroll-padding-inline. scroll-snap-align:start therefore aligns each card to the scrollport's raw left edge (x=0), not the gutter, so after the first swipe every snapped card sits flush against the screen edge, out of alignment with the page's 20px+ gutter grid. The cats shelf at :2061 does this correctly.
- **Why:** Cards hugging the physical edge breaks the page's alignment rhythm and is the visible tell of a missing snap contract — precisely the RB-14 pattern; the two rails behave differently for no reason.
- **Fix:** globals.css:1955 — add scroll-padding-inline:var(--nk-gutter) (match .nk-cats-shelf).
- **Evidence:** app/globals.css:1955 .nk-grid-4--rail ≤560 (snap mandatory, padding-inline:var(--nk-gutter), NO scroll-padding-inline); app/globals.css:2061 .nk-cats-shelf (the sibling rail DOES set scroll-padding-inline)
- *RB-14 · confidence 0.92 · code-inferred*

**RSP-239 · MEDIUM** — Similar-items snap rail lacks scroll-padding-inline — cards snap flush to the screen edge (320–560px, locales: en, lt)

- **What:** Seam S7 CONFIRMED (real inconsistency). .nk-grid-4--rail (globals.css:1955) sets scroll-snap-type:x mandatory with margin-inline:-gutter / padding-inline:gutter but NO scroll-padding-inline, so the snapport is the full padding box: after any swipe, mandatory snap pulls the active card's left edge to x=0 (viewport edge), abandoning the gutter alignment the padding establishes at rest. The sibling rail .nk-cats-shelf (globals.css:2061) correctly sets scroll-padding-inline:var(--nk-gutter), so the two rails snap to different alignments on the same site.
- **Why:** Cards resting flush against the screen edge break the page's gutter grid mid-scroll and look like a layout bug; sibling rails behaving differently reads as unpolished at the 2026 marketplace bar.
- **Fix:** Add scroll-padding-inline:var(--nk-gutter) to .nk-grid-4--rail at app/globals.css:1955.
- **Evidence:** app/globals.css:1955 .nk-grid-4--rail (≤560 snap carousel, no scroll-padding-inline); app/globals.css:2061 .nk-cats-shelf (has scroll-padding-inline:var(--nk-gutter))
- *RB-14 · confidence 0.9 · code-inferred*

**RSP-242 · MEDIUM** — Similar-rail card shrinks ~26% across the 1024->1025 seam as the column ladder steps 3->4 (981–1280px, locales: en, lt)

- **What:** The similar-items rail uses the viewport-width column ladder of .nk-grid-4: 3 columns at 701-1024, 4 at 1025-1280. Growing the window 1px (1024->1025) shrinks each OfferCard from ~310px to ~230px - the card, its photo, and its 10.5px category eyebrow all step DOWN as the viewport gets bigger; the eyebrow truncation visibly worsens ('ELEKTRONIKA IR TECHNOLOGIJOS' -> 'ELEKTRONIKA IR TECH...') across the seam.
- **Why:** Inverse-scaling cards across a 1px resize is the classic ladder seam bug; intrinsic sizing (auto-fit/minmax or a container query on the rail) removes the cliff entirely and keeps card anatomy stable.
- **Fix:** Give the rail intrinsic columns, e.g. .nk-grid-4--rail{grid-template-columns:repeat(auto-fill,minmax(240px,1fr))} (app/globals.css:1458-1462, 1946), or migrate .nk-grid-4 to a container query on its wrapper.
- **Evidence:** `detail-full/base-lt-1024x0768-fp.png` · `detail-full/base-lt-1025x0768-fp.png` · app/globals.css:1458 .nk-grid-4{grid-template-columns:repeat(5,minmax(0,1fr))}; app/globals.css:1459 @media(min-width:1025px) and (max-width:1280px){.nk-grid-4{...repeat(4...)}}
- *RB-02 · confidence 0.9 · measured*

**RSP-249 · MEDIUM** — Offer-card category eyebrow renders at 9.5px uppercase tracked text on phones (320–560px)

- **What:** The card eyebrow is declared three times in the same stylesheet (11.5px base → 10.5px Quiet Luxe retheme → 9.5px!important in the ≤560 mobile layer). On every phone band the eyebrow is 9.5px UPPERCASE with .14em tracking - the auto-metric's site-wide minimum font (minFontPx 9.5 at detail 560; 10.5 everywhere else). Affects the related-items rail here plus the feed and home cards.
- **Why:** 9.5px is below the ~10-11px legibility floor for uppercase tracked text on mobile; at 200% zoom equivalence (WCAG 1.4.4 via the narrow band) it is the first text to become unreadable. Leading marketplaces keep card eyebrows/meta at ≥11px on phones.
- **Fix:** Raise the ≤560 override at globals.css:1903 to 10.5px (matching the Quiet Luxe base) or drop the override entirely; the compact card has room since the eyebrow is a single ellipsized line.
- **Evidence:** `detail-full/base-lt-0560x0900-dpr2-fp.png` · `detail-full/base-lt-0560x0900-dpr2-vp.png` · app/globals.css:1903 .nk-offer__eyebrow{font-size:9.5px!important;letter-spacing:.14em!important} (≤560); app/globals.css:1850 .nk-offer__eyebrow{font-size:10.5px} (Quiet Luxe)
- *RB-11 · confidence 0.9 · measured*

**RSP-252 · MEDIUM** — Three horizontal rails, three snap contracts: --rail snaps flush under the gutter mask; none set scroll-snap-stop or overscroll-behavior-x (320–980px, state: base, swipe; locales: en, lt)

- **What:** (1) .nk-grid-4--rail (similar-items carousel, ≤560, globals.css:1955) declares scroll-snap-type:x mandatory with padding-inline:var(--nk-gutter) but no scroll-padding-inline, so snap positions align card starts to the scrollport edge — the snapped first card rests under the container's edge fade mask instead of at the gutter like .nk-cats-shelf (which does set scroll-padding-inline at :2060). (2) None of the three rails (--rail :1955, cats-shelf :2059, catrail :1141) sets scroll-snap-stop:always, so a fast flick on mandatory snap can skip several cards; none sets overscroll-behavior-x:contain, so an end-of-rail swipe chains into the page / triggers browser back-swipe navigation (the only overscroll-behavior in the file is the nav drawer, :584). (3) .nk-catrail has no snap at all — a third behaviour for the same edge-bleed idiom (the CSS itself flags this at :2051-2053).
- **Why:** Inconsistent snap physics across sibling rails reads as unfinished; overscroll chaining into browser back-navigation on a category rail is a genuine loss-of-context bug on iOS/Android; skipping cards on mandatory snap defeats the carousel.
- **Fix:** Add scroll-padding-inline:var(--nk-gutter) to .nk-grid-4--rail (globals.css:1955); add overscroll-behavior-x:contain and scroll-snap-stop:always (on children) to all three rails; give .nk-catrail proximity snap for parity — ideally extract the shared rail utility the comment at :2051 already proposes.
- **Evidence:** app/globals.css:1955 .nk-grid-4--rail (snap mandatory, NO scroll-padding-inline); app/globals.css:2059 .nk-cats-shelf (snap + scroll-padding)
- *RB-14 · confidence 0.85 · code-inferred*

**RSP-254 · MEDIUM** — Three horizontal rails, three snap contracts; none guard overscroll chaining or fling-skips (320–980px, locales: en, lt)

- **What:** The similar-items rail and cats shelf use scroll-snap-type:x mandatory but no scroll-snap-stop:always on children, so a fast fling can skip many cards; the feed category chip rail (.nk-catrail) has no snap at all. None of the three set overscroll-behavior-x:contain, so hitting a rail's end chains the gesture into vertical page scroll and — on iOS/Android edge swipes at the leading end — into browser back navigation.
- **Why:** Inconsistent rail physics across one page (home has both the shelf and offers) reads as unpolished; accidental back-navigation from an edge-bleed rail is a known 2026 mobile-web footgun.
- **Fix:** Create the shared rail utility the :2053 comment already calls for: scroll-snap-type:x mandatory; scroll-padding-inline:var(--nk-gutter); overscroll-behavior-x:contain; and scroll-snap-stop:always on the first/last children (or all, for card-width items).
- **Evidence:** app/globals.css:1955 .nk-grid-4--rail (snap mandatory, no scroll-snap-stop, no overscroll-behavior-x); app/globals.css:2059-2061 .nk-cats-shelf (same omissions)
- *RB-14 · confidence 0.85 · code-inferred*

**RSP-255 · MEDIUM** — OfferCard sizes assumes the 2-up grid; in the ≤560 snap rail cards are 240px but fetch 46vw renditions (353–560px, locales: en, lt)

- **What:** OfferCard hardcodes sizes="(max-width: 560px) 46vw, ..." (cards.tsx:59), which matches the 2-up feed grid. But the same component renders inside .nk-grid-4--rail, whose ≤560 carousel makes cards min(68%,240px) wide (globals.css:1955) — 240px on any phone ≥353px. At 390px viewport the browser computes 46vw = 179px and (at DPR2) fetches a ~384w rendition for a 480px need: ~25% linear upscale on every similar-items card. Classic container-context defect: one viewport-keyed sizes for two container widths (RB-03 candidacy — the card is styled per-viewport but lives in two containers).
- **Why:** The similar-items carousel — a prime cross-sell surface — renders visibly softer photos than the identical card one scroll above in the feed.
- **Fix:** Pass a sizes override prop from SimilarRail (e.g. sizes="(max-width:560px) 240px, ...") or set sizes="(max-width:560px) min(68vw,240px), ..."; longer-term, container queries + auto sizes.
- **Evidence:** app/globals.css:1955 .nk-grid-4--rail grid-auto-columns:min(68%,240px)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-259 · MEDIUM** — OfferCard renders in >=3 container contexts but is sized only by viewport media; zero @container in repo (981–1920px, locales: en, lt)

- **What:** The same OfferCard component is laid out in (1) the feed grid .nk-grid-feed (full-width, cap dropped on ultrawide), (2) the detail similar rail .nk-grid-4--rail (1340px-capped, 4-up >=1281, snap carousel <=560), and (3) the home shelf rail - yet all of its size steps (eyebrow px, badge compaction at globals.css:1898-1917, column counts) key off viewport width. On the detail page at 1281+, a rail card is ~310px wide while a feed card at the same viewport is a different width, so the shared breakpoints fit neither context exactly (the rail eyebrow truncates at widths where the feed card's does not).
- **Why:** This is precisely the component-in-multiple-containers case container queries solve; a 2026-grade codebase sizes the card off its own inline size so every context gets correct anatomy without per-context viewport ladders.
- **Fix:** Add container-type:inline-size to the card grid wrappers (.nk-grid-feed, .nk-grid-4, home shelf) and convert the card's compaction rules (globals.css:1849, 1898-1917) plus the column ladders to @container widths.
- **Evidence:** `detail-full/base-lt-1440x0900-fp.png` · `detail-full/base-lt-1024x0768-fp.png` · app/globals.css:1458 .nk-grid-4; app/globals.css:1946 .nk-grid-4--rail (>=1281 4-up)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-262 · MEDIUM** — Offer-card favorite button shrinks to 36x36px in the <=560 compact skin (below 44px floor) (320–560px, locales: en, lt)

- **What:** The compact card skin forces the .nk-fav heart button on similar-rail (and all) offer cards to 36x36 CSS px at <=560, below the 44x44 touch floor (48 preferred). It sits 10px from the card corner over the tappable stretch-link, so a miss opens the listing instead of the favorite redirect.
- **Why:** RB-12: sub-44px targets over a competing full-card link produce mis-taps on exactly the band where all input is touch.
- **Fix:** In app/globals.css:1915 keep the visual disk at 36px but restore the hit area: give .nk-fav a transparent padding/::after extending to 44x44 (e.g. remove the width/height override and shrink only the icon), keeping >=8px clearance from the card edge.
- **Evidence:** `detail-full/base-lt-0430x0932-dpr2-fp.png` · `detail-full/base-lt-0360x0800-dpr2-fp.png` · app/globals.css:1915 .nk-offer .nk-fav{width:36px!important;height:36px!important}
- *RB-12 · confidence 0.85 · measured*

**RSP-263 · MEDIUM** — Offer-card category eyebrow drops to 9.5px on phones (three competing size definitions) (320–560px, locales: en, lt)

- **What:** The card eyebrow ('ELEKTRONIKA IR TECHNOLOGIJ...') renders at 9.5px uppercase letterspaced at <=560 (auto-metric minFontPx 9.5 across all mobile shots). The selector is defined three times (11.5px at :704, 10.5px at :1849, 9.5px!important at :1902) - a stepped ladder rather than one fluid token, ending below the ~10px legibility floor. The LT string also truncates to an ellipsis at rail-card width.
- **Why:** Sub-10px uppercase text on the exact band read at arm's length is below the 2026 marketplace bar for legibility, and the triple definition shows the token system being fought per-breakpoint.
- **Fix:** Consolidate to one declaration using a fluid size with an 10.5-11px floor (e.g. font-size:clamp(10.5px,1.9vw,11.5px)) and remove the :1902 !important step; consider hiding the eyebrow instead of shrinking it if space is the driver.
- **Evidence:** `detail-full/base-lt-0360x0800-dpr2-fp.png` · `detail-full/base-lt-0430x0932-dpr2-fp.png` · app/globals.css:1902 .nk-offer__eyebrow{font-size:9.5px!important}; app/globals.css:704 .nk-offer__eyebrow (11.5px)
- *RB-09 · confidence 0.85 · measured*

**RSP-264 · MEDIUM** — OfferCard sizes itself via viewport media in >=3 container contexts - prime @container migration target (320–980px, locales: en, lt)

- **What:** The same OfferCard renders in the feed grid (5->4->3->2->2-up ladder), the home shelf, and the detail similar-items rail (4-up desktop / min(68%,240px) carousel at <=560). All its responsive behaviour (the ~20-rule !important compact skin at <=560, grid ladders) keys off viewport width, not slot width. A rail card at 561px (~250px slot) gets full desktop type while a 560px rail card of near-identical width gets the 9.5px compact skin.
- **Why:** RB-03: the repo has zero @container; a component rendered in multiple container contexts that skins itself per-viewport guarantees seam mismatches (same card width, different skin) and forces the !important override pile documented at globals.css:1892.
- **Fix:** Make .nk-offer a container (container-type:inline-size on the grid cell) and move the compact skin to @container (max-width:~250px), deleting the viewport-keyed !important block at globals.css:1895-1919.
- **Evidence:** `detail-full/base-lt-0915x0412-fp.png` · `detail-full/base-lt-0430x0932-dpr2-fp.png` · app/globals.css:1895-1919 <=560 compact card skin; app/globals.css:1946 .nk-grid-4--rail
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-265 · MEDIUM** — Offer-card images declare sizes=92vw on phones but render at <=240px in the detail rail (~2x overfetch) (320–760px, locales: en, lt)

- **What:** OfferCard's next/image uses sizes="(max-width:760px) 92vw". In the detail similar-rail at <=560 the card is min(68%,240px) wide, and in the 2-up grids at 561-700 it is ~46vw. On a 430px DPR2 phone the browser picks a ~792px-wide candidate for a 240px slot - roughly 2x the needed bytes per card, multiplied across the rail and every 2-up grid the card appears in.
- **Why:** RB-17: sizes must match rendered width per band; mobile data waste and slower LCP on the re-engagement rail.
- **Fix:** In app/components/cards.tsx:59 change to something like sizes="(max-width:560px) 46vw, (max-width:760px) 46vw, (max-width:1100px) 30vw, 416px" - or pass a sizes prop per context (rail: 240px) once the card is containerized.
- **Evidence:** `detail-full/base-lt-0430x0932-dpr2-fp.png` · app/components/cards.tsx:59 sizes="(max-width: 760px) 92vw, ..."; app/globals.css:1898 .nk-grid-4 2-up at <=560
- *RB-17 · confidence 0.85 · code-inferred*

**RSP-270 · MEDIUM** — OfferCard skin keyed to viewport, not container: 207px card gets desktop type, 240px card gets compact (344–1280px)

- **What:** OfferCard renders in at least three container contexts (feed .nk-grid-feed 1-5 col, detail related .nk-grid-4--rail grid/carousel, home shelf) but its type/geometry switches via viewport @media only. Inversion visible in this cell: at 701px viewport the related card is ~207px wide yet keeps the desktop skin (20px h3, 27px price, 11.5px eyebrow → eyebrow ellipsizes 'ELEKTRONIKA IR TE...'), while at 560px viewport the rail card is 240px wide (min(68%,240px)) yet gets the compact skin (15px h3, 18px price, 9.5px eyebrow). Wider card, smaller type.
- **Why:** The repo has zero @container; this component is the textbook migration target the rubric names. Viewport gating guarantees the skin is wrong in at least one context at any given width, and every new placement multiplies the !important override matrix (globals.css:1894-1922).
- **Fix:** Wrap each grid/rail in container-type:inline-size and move the compact card skin from @media(max-width:560px) to @container (max-width:~230px) rules on the card; the inline-style type in cards.tsx OfferCard should move to classes so the !important layer can be dropped.
- **Evidence:** `detail-full/base-lt-0700x0900-dpr2-fp.png` · `detail-full/base-lt-0701x0900-dpr2-fp.png` · `detail-full/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1897-1922 Quiet Luxe ≤560 compact card skin (!important); app/globals.css:1459-1463 .nk-grid-4 viewport ladder
- *RB-03 · confidence 0.85 · measured*

**RSP-274 · MEDIUM** — Similar-items snap carousel lacks overscroll containment and a scroll-snap-stop policy (320–560px, locales: en, lt)

- **What:** The <=560 rail sets scroll-snap-type:x mandatory and snap-align:start but declares neither overscroll-behavior-x:contain (horizontal overscroll chains to the page / can trigger browser back-swipe at the rail's left edge, which bleeds to the viewport edge via the negative margin-inline) nor scroll-snap-stop (a fling can skip all intermediate cards).
- **Why:** RB-14 requires snap rails to define overscroll containment and a snap-stop policy; an edge-to-edge rail without containment is the classic accidental-back-navigation trap on iOS.
- **Fix:** At app/globals.css:1950 add overscroll-behavior-x:contain; and .nk-grid-4--rail>*{scroll-snap-stop:always} (or normal deliberately, documented). Peek affordance (68% slides) is already good.
- **Evidence:** `detail-full/base-lt-0430x0932-dpr2-fp.png` · `detail-full/base-lt-0360x0800-dpr2-fp.png` · `detail-full/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1950 .nk-grid-4--rail (<=560 carousel)
- *RB-14 · confidence 0.8 · code-inferred*

**RSP-277 · MEDIUM** — Similar-items snap rail lacks scroll-padding-inline and overscroll containment (320–560px)

- **What:** The <=560 rail (globals.css:1955) sets scroll-snap-type:x mandatory with negative margin-inline + padding-inline for the edge-to-edge gutter, but no scroll-padding-inline - so after a swipe, snapped cards align flush to the physical viewport edge (x=0) instead of the gutter, unlike the home categories shelf which sets scroll-padding-inline:var(--nk-gutter) (:2061). It also lacks overscroll-behavior-x:contain, so an end-of-rail swipe can trigger browser back/forward navigation gestures.
- **Why:** Inconsistent snap alignment between the two rails breaks the site's spacing rhythm mid-scroll, and uncontained overscroll on a horizontal rail is a classic 2026 mobile-web defect (accidental history navigation).
- **Fix:** Add scroll-padding-inline:var(--nk-gutter) and overscroll-behavior-x:contain to .nk-grid-4--rail in globals.css:1955.
- **Evidence:** `mock-stress-title/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1955-1957 .nk-grid-4--rail (max-width:560); app/globals.css:2061 .nk-cats-shelf scroll-padding-inline (contrast)
- *RB-14 · confidence 0.8 · code-inferred*

**RSP-289 · POLISH** — Offer-card category eyebrow drops to 9.5px on phones (rail cards) (320–560px)

- **What:** The 'IRANKIAI IR STATYBA' eyebrow on similar-rail cards is 9.5px!important letter-spaced uppercase at <=560 (globals.css:1903; matches the harness minFontPx=9.5 on all phone shots). Base is already only 10.5px.
- **Why:** Sub-10px uppercase micro-type is below the practical legibility floor on phones and is the smallest text on the page; it also relies on a stepped !important override rather than a fluid size.
- **Fix:** Raise the <=560 step to 10.5px (or clamp(10.5px,3cqw,11.5px) once cards are containerized) in globals.css:1903.
- **Evidence:** `mock-stress-title/base-lt-0320x0568-dpr2-fp.png` · `mock-stress-title/base-lt-0768x1024-dpr2-fp.png` · app/globals.css:1903 .nk-offer__eyebrow 9.5px!important (<=560); app/globals.css:1850 .nk-offer__eyebrow 10.5px
- *RB-11 · confidence 0.85 · measured*

**RSP-292 · POLISH** — Related-items grid 3-col rung starts at 701, putting cards below the --nk-offer-min token (701–780px)

- **What:** The .nk-grid-4 ladder switches to 3 columns at 701px, where cards are ~207px - below the declared --nk-offer-min:230px ('compact marketing/related offer grids'). The card eyebrow visibly truncates ('ELEKTRONIKA IR TE...') and the title wraps to 2 lines, while at 700 (2-col, ~310px) both fit.
- **Why:** Same ladder-vs-token drift as the category grid: the width token documents the intended minimum but no rule enforces it, so the rung edge ships cards the design says are too narrow.
- **Fix:** Start the 3-col rung at ~760px (or use auto-fit minmax(var(--nk-offer-min),1fr)) at globals.css:1461.
- **Evidence:** `detail-full/base-lt-0701x0900-dpr2-fp.png` · `detail-full/base-lt-0700x0900-dpr2-fp.png` · app/globals.css:1461 .nk-grid-4 3-col at 701-1024; app/globals.css:217 --nk-offer-min:230px
- *RB-02 · confidence 0.85 · measured*

**RSP-296 · POLISH** — Rail card category eyebrow is the page's smallest text (10.5px) and truncates at 981-1280 card widths (981–1280px)

- **What:** The OfferCard eyebrow renders at 10.5px with .17em tracking (the auto-metric's site-wide minFontPx on every detail shot) and ellipsizes long LT category names ('ELEKTRONIKA IR TECHNOLOGIJ...') in the ~230-310px rail cards of this band; the wider 1440 card shows it in full.
- **Why:** 10.5px uppercase-tracked text sits below comfortable legibility and the truncation hides the one piece of information the eyebrow exists to convey; under WCAG 1.4.4 200% zoom it becomes the weakest link on the page.
- **Fix:** Bump the eyebrow to >=11.5px and/or reduce tracking at narrow card widths (ties into the RB-03 container-query migration: let the eyebrow compact off card width, app/globals.css:1849).
- **Evidence:** `detail-full/base-lt-1025x0768-fp.png` · `detail-full/base-lt-1119x0800-fp.png` · `detail-full/base-lt-1440x0900-fp.png` · app/globals.css:1849 .nk-offer__eyebrow{font-size:10.5px;letter-spacing:.17em}
- *RB-11 · confidence 0.8 · measured*

**RSP-299 · POLISH** — Same 'header + row of cards + view-all' pattern splits mobile behaviour: snap rail on detail/categories, static 2-up grid on home offers (320–560px)

- **What:** On <=560px the site has two mobile treatments for a horizontal card row: home categories and the detail 'Daugiau daiktų nuomai' rail become edge-to-edge scroll-snap carousels (240px cards, bleed into gutters), while the home 'Naujausi daiktai nuomai' band — same OfferCard, same SectionHead-with-view-all anatomy — renders as a static 2-up grid of ~170px compact cards. globals.css:2053's own comment flags the accumulating rail variants (.nk-catrail, .nk-grid-4--rail, .nk-cats-shelf) as needing a shared abstraction.
- **Why:** Users get two different interaction models (swipe vs scroll-past) for visually identical sections; the swipeable card is also 40% larger than its grid twin one scroll away on the same phone. 2026 marketplace systems normalise one mobile row idiom per card type.
- **Fix:** Decide per pattern: either give the home offers band the .nk-grid-4--rail class (swipe parity, larger cards) or accept the grid and document it; longer-term fold .nk-catrail/.nk-grid-4--rail/.nk-cats-shelf into one shared rail primitive as the globals.css:2053 comment already proposes.
- **Evidence:** `home/base-lt-0390x0844-dpr2-fp.png` · `detail-full/similar-rail-start-lt-0560x0900-dpr2-vp.png` · `feed/base-lt-0390x0844-dpr2-fp.png` · app/globals.css:1903 .nk-grid-feed,.nk-grid-4 2-up at <=560; app/globals.css:1955 .nk-grid-4--rail snap carousel at <=560
- *RB-24 · confidence 0.75 · visual*

**RSP-301 · POLISH** — Curated similar-items rail wraps to an orphan second row (3+1) on tablets (561–980px)

- **What:** At 768 the 4-item rail renders as a 3-column grid with the 4th card alone on a second row beside two empty cells. Partial last rows are normal for feeds, but this is a curated cross-sell rail whose item count (RAIL_MAX=5, ListingScreen.tsx:192) is not coordinated with the column count per band (known sibling issue: 5th-card wrap at wide desktop).
- **Why:** An orphan card with a two-cell hole under a curated 'Similar items' heading reads as accidental; leading marketplaces cap rail items to the visible column count or keep the rail swipeable.
- **Fix:** Slice items to the current column count on grid bands (reuse the feed's column-count measurement) or extend the <=560 swipe-rail treatment up to 980 in globals.css:1954.
- **Evidence:** `mock-stress-title/base-lt-0768x1024-dpr2-fp.png` · app/globals.css:1951 .nk-grid-4--rail (4-col >=?)
- *RB-02 · confidence 0.75 · visual*

### cards+booking

**RSP-237 · MEDIUM** — !important compact skin snaps fluid clamp() type at the 560/561 seam: detail H1 jumps 33.9px → 28px in one CSS pixel (320–561px, locales: en, lt)

- **What:** ListingDetail.tsx:266 sets the H1 inline as clamp(34px,4vw,44px) — at 561px that resolves to 34px (clamp floor). The ≤560 compact layer overrides it with 28px!important (globals.css:1921), so crossing 561→560 discontinuously drops the H1 by 6px (18%) while every clamp-based --nk-fs-* heading elsewhere degrades continuously. The same fixed-px-vs-inline-style !important pattern hits .nk-fact padding/disk (globals.css:1376-1377 vs the inline var(--nk-card-pad-sim)/46px in ListingDetail.tsx:37-38) and the whole OfferCard type ramp (:1901-1919). Because the base sizes live as inline styles, every mobile retune is forced into !important, and none of it can interpolate.
- **Why:** Single-pixel type cliffs are visible during tablet split-screen resizing and rotation, and the !important-vs-inline architecture guarantees the two size systems (fluid tokens vs fixed compact skin) keep fighting — the exact RB-09 anti-pattern.
- **Fix:** Move the H1 to a fluid token that already encodes the mobile floor — e.g. font-size:clamp(28px,3.4vw+15px,44px) inline (28px at 382px, 34px at ~560, 44px cap) and delete globals.css:1921; medium-term, migrate OfferCard/FactCard geometry from inline styles to nk- classes so mobile skins drop !important.
- **Evidence:** app/globals.css:1921 .nk-detail h1{font-size:28px!important} (≤560); app/globals.css:1901 .nk-offer h3{font-size:15px!important} (≤560)
- *RB-09 · confidence 0.9 · code-inferred*

### fixed-chrome

**RSP-243 · MEDIUM** — Landscape phones: sticky nav + fixed reserve bar consume up to 43% of a 360px viewport (700–980px, landscape phones 360-430px tall)

- **What:** At 780x360 the sticky nav (~78px) plus the fixed .nk-mbar (~76px incl. note line) leave ~206px (57%) for content (auto-metric stickyPct 43). 844x390 leaves 61%, 915x412 63%, 932x430 64%. The .nk-mbar is shown at all widths <=980 with no height gate, so the shortest landscape band dips below the 60% content floor.
- **Why:** On a landscape phone the user sees roughly two lines of description between two chrome bars; RB-07 requires >=60% content on <=700px-tall viewports. Leading marketplaces collapse or slim the persistent CTA bar in short-landscape.
- **Fix:** Add a short-viewport variant, e.g. @media(max-width:980px) and (max-height:420px){ .nk-mbar{min-height:56px;padding:8px 16px} .nk-mbar > span > span:last-child{display:none} } (drop the note line, tighten padding), or hide the bar in landscape and rely on the inline booking card's CTA.
- **Evidence:** `detail-full/base-lt-0780x0360-dpr2-vp.png` · `detail-full/base-lt-0915x0412-vp.png` · app/globals.css:1330 .nk-mbar; app/globals.css:1354 @media(max-width:980px) .nk-mbar{display:flex}
- *RB-07 · confidence 0.9 · measured*

**RSP-300 · POLISH** — Mobile reserve-bar subline ellipsizes to 'Galutine suma ...' under text spacing (320–1120px, state: textspacing)

- **What:** The fixed booking bar's secondary line is single-line nowrap+ellipsis capped at min(52vw,340px); under injected spacing it truncates to 'Galutine suma ...' at 320. The identical disclosure ('Datas, mokescius, uzstata ir galutine suma matysite pries mokejima programeleje.') is fully visible in the price card above, so no unique content is lost -- but the fixed-height single-line pattern is the classic 1.4.12 tell.
- **Why:** Strict 1.4.12 reviewers flag ellipsized helper text even when duplicated; letting it wrap to two lines makes the bar audit-proof.
- **Fix:** Allow the mbar subline to wrap to 2 lines (remove white-space:nowrap, add -webkit-line-clamp:2) at app/globals.css:1344, or drop the subline under the compact skin.
- **Evidence:** `detail-full/textspacing-lt-0320x0568-dpr2-fp.png` · app/globals.css:1344 .nk-mbar > span span (nowrap + text-overflow:ellipsis + max-width:min(52vw,340px))
- *RB-11 · confidence 0.75 · measured*

### hero

**RSP-244 · MEDIUM** — Detail H1: fluid clamp() fought by a stepped 28px !important override, causing an 18% cliff at 560/561 (320–700px, locales: en, lt)

- **What:** The H1 is inline-styled clamp(34px,4vw,44px) (floor 34px), but the <=560 compact skin overrides it to 28px!important. At 561px the title renders 34px; at 560px it snaps to 28px - a 17.6% type-size step across a 1px seam, and two competing sizing systems on the same element.
- **Why:** RB-09 flags exactly this double system, and RB-05 caps seam type cliffs at 15%. The abrupt snap is visible when rotating a ~560-590px phone.
- **Fix:** Delete the override at app/globals.css:1921 and lower the clamp floor at app/components/ListingDetail.tsx:266 to clamp(28px, 6vw, 44px) so one fluid system covers all bands.
- **Evidence:** `detail-full/base-lt-0430x0932-dpr2-fp.png` · `detail-full/base-lt-0915x0412-fp.png` · app/globals.css:1921 .nk-detail h1{font-size:28px!important}; app/components/ListingDetail.tsx:266 clamp(34px, 4vw, 44px)
- *RB-09 · confidence 0.9 · measured*

**RSP-275 · MEDIUM** — The <=430 full-width Share/Save row rule is dead: inline flex:"none" overrides .nk-lhead__actions (320–430px, locales: en, lt)

- **What:** globals.css:1248 intends the header actions to become a full-width 50/50 row on narrow phones (.nk-lhead__actions{flex:1 1 100%}), but the element carries an inline style flex:"none" (ListingDetail.tsx:289) which wins over the class rule. Measured at 344 and 430: Dalintis/Isiminti stay content-width (~111px each), leaving a ~48-120px ragged right gap instead of the designed balanced row.
- **Why:** A shipped design decision (from the F-058/F-059-era mobile pass) is silently inert; the compact band renders an unintended layout and the CSS is dead weight.
- **Fix:** Remove flex:"none" from the inline style at app/components/ListingDetail.tsx:289 (flex-wrap already prevents growth on wide rows since the default is flex:0 1 auto - or set flex:"none" via a base class the media query can override).
- **Evidence:** `detail-full/base-lt-0344x0882-dpr2-vp.png` · `detail-full/base-lt-0430x0700-dpr2-vp.png` · `detail-full/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:1247-1250 @media(max-width:430px) .nk-lhead__actions{flex:1 1 100%}; app/components/ListingDetail.tsx:289 style={{...flex:"none"}}
- *RB-24 · confidence 0.8 · measured*

**RSP-298 · POLISH** — Header review-count inline link is ~22px tall on touch bands (320–1024px)

- **What:** The underlined '12345 atsiliepimai' anchor in the title meta row (ListingDetail.tsx:272) is a bare inline link at 15.5px body size with no min-height - ~22px effective target, matching the harness smallTargets lead ('a') at every width. Crumbs and header buttons all carry min-height:var(--nk-tap) but this link does not.
- **Why:** WCAG 2.5.8 wants >=24px targets (44px preferred on touch); this is the jump-to-reviews affordance on every listing.
- **Fix:** Add display:'inline-flex', alignItems:'center', minHeight:'var(--nk-tap)', margin '-11px 0' (to keep visual rhythm) or padding to the anchor at ListingDetail.tsx:272.
- **Evidence:** `mock-long-owner/base-lt-0320x0568-dpr2-fp.png` · `mock-stress-title/base-lt-0430x0932-dpr2-fp.png`
- *RB-12 · confidence 0.8 · code-inferred*

**RSP-304 · POLISH** — H1 breaks the 34-char compound mid-word with no hyphen on phones (320–560px)

- **What:** The stress title's long token renders as 'Nebeprisikiskiakopusteliau' / 'davome' with no hyphen at the break (430 and 320 shots). The H1 sets hyphens:'auto' + overflowWrap:'anywhere' (ListingDetail.tsx:265), but Chromium has no Lithuanian hyphenation dictionary, so overflow-wrap wins and breaks bare.
- **Why:** A bare mid-word break in the page's largest type is a visible craft miss; readers momentarily parse 'davome' as a word.
- **Fix:** Prefer overflowWrap:'break-word' with hyphens retained (bare break then only happens when a single word exceeds the line) and accept a ragged line, or inject &shy; opportunities server-side for tokens >20 chars.
- **Evidence:** `mock-stress-title/base-lt-0430x0932-dpr2-fp.png` · `mock-stress-title/base-lt-0320x0568-dpr2-vp.png`
- *RB-10 · confidence 0.7 · visual*

### nav + booking mbar

**RSP-245 · MEDIUM** — Landscape-phone listing detail: sticky nav + fixed booking bar eat 41% of a 360px viewport (660–980px, <=390px tall (landscape phones); fails hardest at 360h)

- **What:** At 780x360 the sticky nav (76px at rest, 68px condensed) plus the fixed .nk-mbar (72px + safe-bottom) consume ~148px = 41% of viewport height, leaving 212px (59%) for content — under the 60% budget; real mobile browser chrome shrinks this further. At 915x412 it is ~36% (borderline pass). The site's short-viewport compaction (@media max-width:560 and max-height:700, globals.css:1808) is gated on width <=560, so landscape phones (660-980px wide, 320-412px tall) get zero height adaptation: full-height nav, full-height mbar.
- **Why:** On a landscape phone the user sees roughly one breadcrumb row and half the H1 between two chrome bars; every scroll interaction happens through a letterbox. 2026 practice is to condense or auto-hide chrome under a max-height media/interaction query.
- **Fix:** Add @media(max-height:480px){ .nk-nav-inner{height:var(--nk-nav-h-scrolled)} } (or auto-hide the nav on scroll-down), and slim .nk-mbar padding to 8px block at max-height:480px; alternatively re-gate the 1808 compact skin on (max-height:700px) alone for the chrome tokens.
- **Evidence:** `detail-full/base-lt-0780x0360-dpr2-vp.png` · `detail-full/base-lt-0915x0412-vp.png` · app/globals.css:547 .nk-nav-bar (sticky, 76px at rest); app/globals.css:1335 .nk-mbar (fixed, min-height 72px+safe)
- *RB-07 · confidence 0.9 · measured*

### nav

**RSP-246 · MEDIUM** — Long category breadcrumb link hard-clips at the viewport edge with no ellipsis <=430px (320–430px)

- **What:** The category crumb 'Profesionali statybine ir matavimo iranga' renders on its own wrapped row and is cut mid-word at the right viewport edge ('...matavimo iran|') at 320-344 with no ellipsis or fade. Only the [aria-current=page] leaf gets max-width/overflow-wrap treatment (globals.css:1078); linked segments inherit whiteSpace:'nowrap' from .nk-crumbs__seg (ui.tsx:331) with no truncation. The trail also stacks to 3 full-width rows (~180px tall) at 320. Fits at 430.
- **Why:** A nav link whose label is cut mid-word with no truncation affordance looks broken and hides where the link goes; 2026 marketplaces ellipsize crumb segments.
- **Fix:** In ui.tsx:331-332 give the crumb link maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis' (keep nowrap), and minWidth:0 on the segment, so long category names ellipsize instead of clipping.
- **Evidence:** `mock-stress-title/base-lt-0320x0568-dpr2-vp.png` · `mock-stress-numbers/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1070 .nk-crumbs; app/globals.css:1078 .nk-crumbs [aria-current=page]
- *RB-01 · confidence 0.9 · measured*

**RSP-266 · MEDIUM** — LT breadcrumb stacks into three 44px rows (~150px) above the H1 on narrow phones (320–400px)

- **What:** At 320-360 (LT) the trail 'Pagrindinis > Nuomojami daiktai > Elektronika ir technologijos' wraps into three rows; each nowrap segment carries min-height:var(--nk-tap) (44px), so the breadcrumb block consumes ~140-150px of the first screen before the title. EN fits in two rows; LT's longer labels make three the common case for long category names.
- **Why:** RB-24: on a 568px-tall phone the crumb block plus nav eats ~40% of the first paint with secondary navigation - leading marketplaces collapse the mobile trail to a single back-style link or a scrollable one-liner.
- **Fix:** For <=560, render the trail as one horizontally scrollable row (white-space:nowrap; overflow-x:auto on .nk-crumbs) or collapse middle segments to '...' keeping only the category parent, alongside the existing <=680 leaf-drop rule.
- **Evidence:** `detail-full/base-lt-0344x0882-dpr2-vp.png` · `detail-full/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:1067 .nk-crumb{min-height:var(--nk-tap)}; app/globals.css:1072-1075 <=680 current-page drop
- *RB-24 · confidence 0.85 · measured*

**RSP-267 · MEDIUM** — Leaf breadcrumb repeats the full 150+ char title as a 3-line block right above the identical H1 (681-980px) (681–980px)

- **What:** At 768 the current-page crumb chip wraps the entire stress title to 3 full lines (~72px), immediately followed by the same title as a 5-line H1. The <=680 rule that hides the duplicate leaf (globals.css:1073-1075) stops exactly where the duplication is still glaring; [aria-current=page] only gets overflow-wrap:anywhere, no line cap.
- **Why:** Duplicated multi-line title costs ~70px of prime above-the-fold space on tablets and reads as unpolished; leading marketplaces single-line-ellipsize the leaf crumb.
- **Fix:** In globals.css:1078 constrain the leaf: white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:min(100%,48ch) (drop overflow-wrap), or extend the hide rule to <=980.
- **Evidence:** `mock-stress-title/base-lt-0768x1024-dpr2-fp.png` · app/globals.css:1073-1078 .nk-crumbs media 680 + [aria-current=page]
- *RB-10 · confidence 0.85 · visual*

**RSP-283 · POLISH** — Breadcrumb leaves a dangling '>' separator at end-of-line when the long leaf chip wraps (981–1119px)

- **What:** With a long listing title, the current-page chip wraps to its own second row (981-1025 LT shots) but its preceding '>' separator stays stranded at the end of line 1 after 'Elektronika ir technologijos >', pointing at nothing.
- **Why:** An orphaned separator reads as a rendering glitch on an otherwise polished trail; keeping separator+item as an unbreakable unit is standard breadcrumb craft.
- **Fix:** Wrap each separator with its following item in an inline-flex white-space:nowrap segment (the .nk-crumbs__seg structure already exists - move the sep inside the following segment), or hide a line-trailing sep via the existing :has() pattern at app/globals.css:1074.
- **Evidence:** `detail-full/base-lt-0981x0900-fp.png` · `detail-full/base-lt-1024x0768-vp.png` · `detail-full/base-lt-1025x0768-fp.png` · app/globals.css:1067 .nk-crumb; app/globals.css:1076 .nk-crumbs > *{min-width:0}
- *RB-10 · confidence 0.9 · visual*

**RSP-287 · POLISH** — Breadcrumb chevron dangles at line end when the trail wraps (401–680px)

- **What:** At 430 the trail wraps as 'Pagrindinis > Nuomojami daiktai >' / 'Elektronika ir technologijos' - the trailing '>' separator hangs at the end of row 1 pointing at nothing, instead of leading row 2.
- **Why:** Wrap-quality craft: the separator should stay attached to the segment it introduces (or the trail shouldn't wrap; see the density finding).
- **Fix:** Move the chevron into the FOLLOWING segment's nowrap span (prefix separator) so a wrap breaks before the chevron, or keep the trail on one scrollable row.
- **Evidence:** `detail-full/base-lt-0430x0700-dpr2-vp.png` · app/components/ui.tsx:324 .nk-crumbs__seg (chevron inside nowrap segment)
- *RB-10 · confidence 0.85 · visual*

**RSP-288 · POLISH** — Breadcrumb leaf chip duplicates the identical H1 directly beneath it at 681-980 (landscape phones) (681–980px, locales: en, lt; landscape phones)

- **What:** The current-page chip (full listing title) is dropped <=680 precisely because it repeats the H1, but landscape phones (780x360, 844x390, 915x412) fall in 681-980 and show the title twice within ~60px vertically - in an orientation where every row of chrome is expensive.
- **Why:** The rationale encoded in the <=680 rule ('repeats the H1 directly below it') applies equally to short-landscape; the seam is keyed to width when the trigger is really the stacked single-column layout (<=980).
- **Fix:** Extend the leaf-drop rule to the same boundary as the single-column collapse: change @media(max-width:680px) at globals.css:1072 to max-width:980px (or add an orientation:landscape clause).
- **Evidence:** `detail-full/base-lt-0915x0412-vp.png` · `detail-full/base-lt-0780x0360-dpr2-vp.png` · app/globals.css:1072-1075 @media(max-width:680px) crumbs leaf drop
- *RB-05 · confidence 0.85 · visual*

**RSP-294 · POLISH** — Detail breadcrumb stacks into ~3 full 44px rows (~270px) before the H1 at 320px (320–374px, locales: en, lt)

- **What:** At 320px the trail 'Pagrindinis › Nuomojami daiktai › Elektronika ir technologijos' wraps into three stacked rows, each crumb honoring min-height:44px, consuming roughly 270px (about half the 568px viewport) between the nav and the listing title. LT category genitives make this the common case, not the edge case.
- **Why:** Half a viewport of wayfinding before the product name inverts the content hierarchy on the site's conversion page; mobile marketplaces collapse to a single '‹ parent-category' back crumb.
- **Fix:** ≤400px, render only the last ancestor as a single back-style crumb (ListingDetail breadcrumb) or reduce wrapped-row height by trimming crumb padding when .nk-crumbs wraps (row-gap:0, min-height 36px on wrap).
- **Evidence:** `detail-full/base-lt-0320x0568-dpr2-vp.png` · `detail-full/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1068 .nk-crumb{min-height:var(--nk-tap)}; app/globals.css:1073 @media(max-width:680px) current-page crumb hidden
- *RB-24 · confidence 0.8 · visual*

### mbar

**RSP-247 · MEDIUM** — Fixed reserve bar ellipsizes the price unit and note at 320: '9999,99 EUR / di...'  (320–359px)

- **What:** In the fixed MobileBar at 320px with the max stress price, the price line truncates to '9999,99 EUR / di...' (unit cut mid-word) and the note to 'Galutine suma progra...'. Cause: .nk-mbar>span span max-width:min(52vw,340px)=166px at 320 while dict.detail.perDayShort is the full '/ diena' (lt.ts:492 - identical to perDay, not actually short). Clean at 390+.
- **Why:** The persistent conversion bar is the last thing a phone user reads before tapping Reserve; a chopped unit ('di...') and chopped disclaimer look careless and lose the per-day framing on exactly the listings where price anxiety is highest.
- **Fix:** Make perDayShort genuinely short ('/ d.') in lt.ts/en.ts, and/or relax the span max-width at <=360 (the Reserve button already shrinks via globals.css:1380).
- **Evidence:** `mock-stress-title/base-lt-0320x0568-dpr2-vp.png` · `mock-stress-numbers/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1340 .nk-mbar > span span (max-width:min(52vw,340px))
- *RB-01 · confidence 0.9 · measured*

**RSP-276 · MEDIUM** — Fixed mobile reserve bar has no env(safe-area-inset-left/right) for landscape phones (320–980px, landscape phones)

- **What:** code-inferred from the selectors visible in shots: .nk-mbar spans left:0;right:0 with padding '14px 20px calc(14px + var(--nk-safe-bottom))' (globals.css:1333) and '10px 12px ...' <=560 (1379). Bottom inset is handled but horizontal insets are not, while the sibling overlay .nk-lightbox does guard left/right (globals.css:1279-1280). On a notched phone in landscape (mbar shows up to 980px wide), the price text and Reserve button sit inside the ~44-59px sensor-housing inset.
- **Why:** RB-08 requires horizontal safe-area on every fixed bar; the reserve CTA is the page's primary conversion control and can be partially obscured/hard to tap in landscape.
- **Fix:** In globals.css:1333 use padding-left:max(20px, env(safe-area-inset-left)); padding-right:max(20px, env(safe-area-inset-right)) (and the 12px equivalents in the <=560 block at :1379).
- **Evidence:** `mock-stress-title/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:1331-1333 .nk-mbar; app/globals.css:1379 .nk-mbar (max-width:560)
- *RB-08 · confidence 0.8 · code-inferred*

### gallery

**RSP-248 · MEDIUM** — 4-photo mosaic strands a lonely half-width tile beside an empty cell on phones (320–980px)

- **What:** data-count='4' on <=980 renders hero full-width + 3 thumbs in the 2-col mosaic: the 4th photo occupies only the left half of its row and the right half is a dead gap (mock-bento-4 at 390). Counts 0-2 have explicit full-width rules (globals.css:1362) and 3/5 tile evenly, but the odd remainder of count=4 has no rule.
- **Why:** An empty grid cell inside the hero gallery reads as a loading failure, not a layout; the CSS's own comment ('no lonely half-width tile') states the intended standard that count=4 violates.
- **Fix:** Add .nk-bento[data-count='4'] > :last-child{grid-column:1/-1} inside the <=980 block (globals.css:~1362), mirroring the count 0-2 treatment.
- **Evidence:** `mock-bento-4/base-lt-0390x0844-dpr2-fp.png` · app/globals.css:1359-1360 .nk-bento mobile mosaic
- *RB-02 · confidence 0.9 · visual*

**RSP-260 · MEDIUM** — Bento tile next/image sizes ignore the 1340px detail cap: big tile over-fetches ~1.5-2x, small tiles under-declare (1281–1920px, locales: en, lt)

- **What:** GalleryTile declares sizes big ? '(max-width: 980px) 100vw, 60vw' : '(max-width: 980px) 50vw, 20vw' (app/components/ListingDetail.tsx:68). But .nk-detail caps at 1340px, so the big tile renders at most ~576px CSS (1.55fr of 3.55fr) - 40vw at 1440 and only 33vw at 1728 - while 60vw tells the optimizer 864-1037px (~1.5-1.8x over-fetch per DPR). Conversely small tiles render ~372px (~26vw at 1440) but declare 20vw=288px, so DPR1 desktops can be served an upscaled ~29%-undersized rendition.
- **Why:** Over-fetching the LCP hero wastes bandwidth/LCP budget on every desktop detail view; under-declaring the small tiles risks visibly soft photos - both are exactly what per-band sizes auditing is meant to catch.
- **Fix:** Use cap-aware slots at ListingDetail.tsx:68, e.g. big: '(max-width:980px) 100vw, (min-width:1400px) 576px, 42vw'; small: '(max-width:980px) 50vw, (min-width:1400px) 376px, 27vw' (keep LB_UNDERLAY_SIZES in sync, ListingDetail.tsx:389).
- **Evidence:** `detail-full/base-lt-1440x0900-fp.png` · `detail-full/base-lt-1728x1000-fp.png` · app/globals.css:1209 .nk-detail{max-width:1340px}; app/globals.css:1214 .nk-bento{grid-template-columns:1.55fr 1fr 1fr}
- *RB-17 · confidence 0.85 · code-inferred*

**RSP-268 · MEDIUM** — 1-2-photo listings render non-hero tiles as ~5:1 full-width slivers on tablets (561-980px) (561–980px)

- **What:** For data-count<=2 the <=980 rules stack tiles full width (globals.css:1362) with grid-auto-rows clamp(150px,22vw,190px). At 980 the second photo renders ~932x190 CSS (~4.9:1) - the truck photo becomes an unrecognizable letterbox sliver (visible at the 980 shot; at 768 thumbs are ~460x190, 2.4:1). At 981 the same two photos flip to comfortable ~430x500 side-by-side tiles.
- **Why:** Object-fit:cover at 5:1 destroys the photo's subject on the most common tablet widths; two-photo listings are a frequent real inventory case, and photos are the top conversion driver on a rental marketplace.
- **Fix:** In the <=980 block, render data-count='2' side-by-side above ~700px (keep the stack only <=~560), or give stacked non-hero tiles aspect-ratio:16/9 with height:auto instead of the 150-190px fixed row.
- **Evidence:** `mock-stress-numbers/base-lt-0980x0900-fp.png` · `mock-stress-title/base-lt-0768x1024-dpr2-fp.png` · `mock-stress-numbers/base-lt-0981x0900-fp.png` · app/globals.css:1359-1362 .nk-bento mobile mosaic + data-count 0-2 stack
- *RB-17 · confidence 0.85 · measured*

**RSP-302 · POLISH** — Bento hero sizes='60vw' ignores the 1340px page cap (over-fetch at ultrawide) (1537–1920px)

- **What:** GalleryTile big uses sizes='(max-width: 980px) 100vw, 60vw' (ListingDetail.tsx:67) but .nk-detail caps at 1340px, so the hero's real slot is ~750px (1.55fr of 1320 minus gaps). At 1920 the browser computes a 1152px slot -> DPR2 picks a ~2048-2304 rendition instead of ~1536; small tiles' '20vw' (384px at 1920) similarly overstate their ~290px slot.
- **Why:** The hero is the LCP image on the detail page; a ~1.5x oversized fetch at ultrawide wastes bandwidth against the deliberate care taken elsewhere (lightbox LB_SIZES comment documents exactly this discipline).
- **Fix:** Change big sizes to '(max-width: 980px) 100vw, min(60vw, 760px)' and small to '(max-width: 980px) 50vw, min(20vw, 300px)' in ListingDetail.tsx:67.
- **Evidence:** `mock-stress-numbers/base-lt-0981x0900-fp.png` · app/globals.css:1210 .nk-detail max-width:1340px
- *RB-17 · confidence 0.75 · code-inferred*

### description

**RSP-250 · MEDIUM** — Listing description prose runs ~93ch at desktop; the 62ch cap only exists for 561-1024 (1025–1920px)

- **What:** The auto-metric measures div.nk-prose.nk-desc-clamp at 93 chars/line at 1440 and 1441. The comfortable-measure rule .nk-detail .nk-prose{max-width:62ch} is scoped to @media(min-width:561px) and (max-width:1024px) only, so exactly where the two-column layout gives the left column its widest run (~912-930px inside the 1340px detail cap) the cap disappears.
- **Why:** 93ch is well past the ≤75ch readable-measure bar for wide viewports (RB-04); real listing descriptions are multi-paragraph and this is the page's core reading content. The fix already exists in the file - it is just fenced to the wrong band.
- **Fix:** Move max-width:62ch (or ~70ch) out of the 561-1024 media block at globals.css:1932-1934 and apply it to .nk-detail .nk-prose unconditionally.
- **Evidence:** `detail-full/base-lt-1440x0900-fp.png` · app/globals.css:1932-1934 @media(561-1024) .nk-detail .nk-prose{max-width:62ch}; app/globals.css:1242 .nk-detail-grid columns
- *RB-04 · confidence 0.9 · measured*

**RSP-258 · MEDIUM** — Description prose measure reaches ~93ch on desktop; the 62ch cap ends at 1024px (1025–1920px, locales: en, lt)

- **What:** The .nk-prose reading-measure cap (max-width:62ch) is scoped to 561-1024px only. From 1025px up the description fills the full focus column: at 1440-1728 the column is ~912px at 17px Sora, and the auto-metric measured 93ch line capacity on every 1440+ shot (section#aprasymas div.nk-prose.nk-desc-clamp). The test listing's copy is short so lines don't visually hit 93ch, but any real multi-paragraph owner description will.
- **Why:** Lines beyond ~75ch measurably hurt reading comprehension and look untended next to the page's otherwise careful typography; leading marketplaces cap detail-page prose at 65-75ch at every width.
- **Fix:** Extend the measure cap to desktop: change the app/globals.css:1931 rule to @media(min-width:561px){.nk-detail .nk-prose{max-width:72ch}} (or add max-width:'72ch' to the prose div inline style at app/components/ListingDetail.tsx:594). This also reconciles the 720px-capped skeleton (see RB-19 finding).
- **Evidence:** `detail-full/base-lt-1440x0900-fp.png` · `detail-full/base-lt-1728x1000-fp.png` · `detail-full/base-lt-1025x0768-fp.png` · app/globals.css:1931 @media(min-width:561px) and (max-width:1024px){.nk-detail .nk-prose{max-width:62ch}}; app/globals.css:1241 .nk-detail-grid
- *RB-04 · confidence 0.85 · measured*

**RSP-297 · POLISH** — Loading skeleton caps description lines at 720px while loaded prose spans the ~912px column (1281–1920px, state: loading; locales: en, lt)

- **What:** ListingSkeleton wraps its description lines in maxWidth:720 (app/components/ListingDetail.tsx:160) but the loaded description has no desktop width cap, so at 1440+ the text region widens from 720px to ~912px when data lands - the one geometry the skeleton doesn't mirror despite the file's explicit parity intent.
- **Why:** State-geometry parity is the skeleton's whole job here; the width pop is a small but visible reflow cue on fast-scrolling desktops.
- **Fix:** Resolve together with the RB-04 measure finding: cap loaded prose at ~72ch (~720px at 17px) so skeleton and content match; otherwise set the skeleton wrapper to the real column width.
- **Evidence:** `detail-full/base-lt-1440x0900-fp.png` · app/globals.css:1241 .nk-detail-grid
- *RB-19 · confidence 0.8 · code-inferred*

**RSP-305 · POLISH** — Description 'Show more' overflow check listens only to window resize — misses web-font swap reflow (320–560px, state: base, font-swap; locales: en, lt)

- **What:** DescriptionSection (ListingDetail.tsx:574-586) decides whether to render the Show-more toggle by comparing scrollHeight to clientHeight, re-measuring only on window resize. The Sora web font loading after first measure can push a borderline description past the 6-line clamp (or pull it under), leaving clipped text with no toggle (or a dead toggle) until the user resizes/rotates. The neighbouring StepList solved the same class of problem with a ResizeObserver.
- **Why:** Silently clipped owner content with no expansion affordance is a content-loss state, if a narrow one (borderline-length descriptions + slow font load).
- **Fix:** Replace the resize listener with a ResizeObserver on bodyRef (mirrors HowItWorksScreen.tsx:199-212), or additionally re-measure on document.fonts.ready.
- **Evidence:** app/globals.css:1386-1388 .nk-desc-clamp (≤560 6-line clamp)
- *RB-18 · confidence 0.65 · code-inferred*

### cards

**RSP-256 · MEDIUM** — OfferCard compact skin is viewport-gated (<=560px), so card width vs type scale inverts across contexts (320–1024px)

- **What:** The compact card skin (h3 15px, eyebrow 9.5px, price 18px, 36px fav disk — globals.css:1901-1924) fires on viewport width, not card width. Result: a ~210px-wide card in the 768px 3-up feed grid renders the FULL desktop skin (17px h3, 20px price), while a wider 240px card in the detail similar-items snap rail at 560px and ~246px cards in the 2-up feed at 560px render the compact skin. Across the 560/561 seam the feed's 2-up card stays ~243-246px wide but swaps its entire type scale. The same .nk-offer component thus shows three different width-to-typescale mappings depending on which page/rail hosts it.
- **Why:** The system reads inconsistent: the narrowest cards on the site (768px 3-up) carry the largest card type while wider phone/rail cards carry the smallest. This is the textbook container-query candidate — the skin describes card width, not viewport width — and per-context viewport styling of a shared component is what CQ (baseline since 2023) exists to remove.
- **Fix:** Add `container-type:inline-size` on the grid/rail wrappers (.nk-grid-feed, .nk-grid-4, .nk-grid-4--rail) and convert the globals.css:1901-1924 block from @media(max-width:560px) to @container(max-width:~230px) on .nk-offer; the !important inline-style overrides carry over unchanged.
- **Evidence:** `feed/base-lt-0768x1024-dpr2-fp.png` · `feed/base-lt-0390x0844-dpr2-fp.png` · `detail-full/similar-rail-start-lt-0560x0900-dpr2-vp.png` · app/globals.css:1901-1924 @media(max-width:560px) compact .nk-offer skin; app/globals.css:1189 .nk-grid-feed 3-up 701-1024
- *RB-03 · confidence 0.85 · measured*

**RSP-272 · MEDIUM** — OfferCard is skinned by viewport width but renders in 4 container contexts — same card width gets different skins (320–3840px, locales: en, lt)

- **What:** The OfferCard compact skin (globals.css:1895-1919) keys on @media(max-width:560px), but the card renders at wildly different track widths per context: ~166px in the 2-up phone feed, min(68%,240px) in the ≤560 similar-items rail (globals.css:1955), ~228px in the 5-up desktop feed at 1281px, ~260px+ in the rail's 4-up desktop cap. Result: a 240px-wide rail card at 559px viewport gets the compact 15px/9.5px type, while a narrower 228px card at 1281px viewport keeps the full-size skin — identical (or inverted) available width, different densities. The bento gallery's count-aware rules (:1220 vs :1358) carry the same viewport-vs-container duplication across the 980/981 boundary, which the CSS comment itself flags as needing two-sided maintenance.
- **Why:** This is the canonical container-query use case (Chrome/Safari/Firefox all shipped @container by 2023); viewport-keyed card skins guarantee density mismatches whenever a grid's track count changes, and every new context (rails, future sidebars) multiplies the media-query matrix.
- **Fix:** Declare container-type:inline-size on the grid/rail item wrappers (the div.nk-reveal wrappers in FeedScreen.tsx:350 and ListingScreen.tsx:234 and the .nk-cats-shelf children) and convert the ≤560 compact-skin block to @container (max-width:200px)-style rules; lattice confirms zero @container usage today, so this is additive.
- **Evidence:** app/globals.css:1895-1919 (compact card skin keyed to viewport ≤560); app/globals.css:1945 .nk-grid-4--rail 4-up ≥1281
- *RB-03 · confidence 0.8 · code-inferred*

**RSP-286 · POLISH** — Mobile card typography is a second system of ~20 stepped !important overrides fighting inline styles (320–560px)

- **What:** Because OfferCard carries its type/geometry as inline styles (cards.tsx:83-112), the ≤560 skin is implemented as a block of ~20 !important selectors keyed to DOM position (.nk-offer__pricebar>span:first-child>span:last-child, .o-new>span, .nk-offer__body>span:not(.nk-offer__eyebrow)...). The stylesheet itself documents the constraint: '!important is required where the card carries inline styles'. The eyebrow alone is declared 3 times (11.5 → 10.5 → 9.5!important). None of it rides the --nk-fs-* fluid token ramp.
- **Why:** This double system is exactly what RB-09 flags: the fluid token ramp exists (globals.css:229-241) but the highest-traffic component bypasses it, so every card tweak must be made twice and structural selectors break on any JSX reorder.
- **Fix:** Move OfferCard type/spacing from inline styles to nk- classes (or CSS vars set on .nk-offer) so the ≤560 layer can drop !important; ideally sizes become clamp()/container-query driven, deleting the block at globals.css:1894-1922.
- **Evidence:** `detail-full/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:1894-1922 ≤560 !important card override block; app/globals.css:757 .nk-cat h3 15px!important
- *RB-09 · confidence 0.9 · code-inferred*

### overlay-lightbox

**RSP-279 · MEDIUM** — Overlay scroll lock removes the scrollbar with no gutter compensation - centered page shifts ~15px (981–1920px, state: overlay-open; locales: en, lt)

- **What:** Opening the gallery lightbox (document.body.style.overflow='hidden', app/components/ListingDetail.tsx:456) or the app-redirect layer (app/lib/use-dismissable-layer.ts:39) hides the document scrollbar. html/body set no scrollbar-gutter and no padding-right compensation exists, so on desktop browsers with classic scrollbars (Windows Chrome/Edge/Firefox) the viewport widens ~15px and the 1340px-centered page plus the fixed nav jump horizontally on every open/close.
- **Why:** Visible full-page shift on overlay open is below the 2026 marketplace bar ('lock background scroll without layout shift'); it is most obvious exactly on this band where the page is centered with symmetric margins.
- **Fix:** Add html{scrollbar-gutter:stable} in app/globals.css (near line 322), or compensate with body{padding-right:var(--removed-scrollbar-w)} in the three lock sites.
- **Evidence:** app/globals.css:322 html{scroll-behavior:smooth;...} (no scrollbar-gutter); app/globals.css:1273 .nk-lightbox
- *RB-23 · confidence 0.75 · code-inferred*

### overlay-app-redirect

**RSP-280 · MEDIUM** — App-redirect bottom sheet and listing sheet cap height with raw 92vh instead of dvh/svh (320–980px, state: overlay; mobile Safari dynamic toolbar band)

- **What:** The Locked-mode conversion sheet (.nk-redirect-panel, opened by every Rezervuoti/Isiminti/Paklausti tap on the detail page) and .nk-sheet use max-height:92vh. On iOS/Android, vh resolves to the large viewport, so with the browser toolbar expanded 92vh can exceed the visible height by ~6-10% - the sheet's top edge (close affordance) can sit under browser chrome while its internal scroll hides content. The nav drawer in the same file already uses 100dvh, so the correct unit is available and proven.
- **Why:** This is the site's single conversion surface (install bridge); a sheet that overshoots the visible viewport on default mobile Safari is exactly the raw-vh defect RB-06 names. Inconsistent with the drawer's dvh usage.
- **Fix:** Change max-height to 92dvh (or min(92dvh,92vh) for old engines) at globals.css:1046 and :934.
- **Evidence:** app/globals.css:1046 .nk-redirect-panel{max-height:92vh} (mobile sheet); app/globals.css:934 .nk-sheet{max-height:92vh}
- *RB-06 · confidence 0.7 · code-inferred*

### breadcrumb

**RSP-290 · POLISH** — Breadcrumb separator dangles at end of line when the trail wraps on phones (320–680px)

- **What:** At ≤~600px the detail trail wraps as 'Pagrindinis > Nuomojami daiktai >' / newline / 'Elektronika ir technologijos' - the chevron separating the last two crumbs is stranded at the end of line 1 instead of leading line 2, because the separator is grouped with the preceding segment.
- **Why:** A dangling separator reads as a truncated trail ('...daiktai >' looks like something failed to render); flagship breadcrumbs keep the separator glued to the crumb that follows it or prevent the wrap.
- **Fix:** In the Breadcrumb component, wrap each (separator + label) pair in an inline-flex white-space:nowrap segment so the chevron travels with the next crumb, or allow the whole trail to scroll on one row on phones.
- **Evidence:** `detail-full/base-lt-0560x0900-dpr2-vp.png` · `detail-full/base-lt-0561x0900-dpr2-fp.png` · app/globals.css:1070-1078 .nk-crumbs wrap rules
- *RB-10 · confidence 0.85 · visual*

### footer

**RSP-291 · POLISH** — Footer at 561-700 packs a 2-sub-column category list into a half-width track, wrapping most labels (561–700px)

- **What:** In the 561-1024 footer layout the Kategorijos column (itself a 2-sub-column link list) shares a 1fr/1fr grid with Miestai. At 561-700 each category link gets ~120-140px, so most labels wrap 2-3 lines ('Fotografija ir video', 'Sportas ir laisvalaikis', 'Garsas, muzika ir renginiu technika' at 3 lines). One px lower, the ≤560 single-column stack gives every label a full row - the narrower viewport is the cleaner one (inverted density across the seam).
- **Why:** Ragged 3-line link labels in a footer read as neglect against the otherwise composed Quiet Luxe finish; the seam inversion means tablets in narrow split-view get the worst footer on the site.
- **Fix:** Between 561-760px collapse the Kategorijos list to one sub-column (or extend the ≤560 stacked footer up to ~700) at globals.css:910-915.
- **Evidence:** `categories/base-lt-0561x0900-dpr2-fp.png` · `detail-full/base-lt-0700x0900-dpr2-fp.png` · app/globals.css:910-915 @media(max-width:1024px) .nk-footer__top{grid-template-columns:1fr 1fr}; app/globals.css:916-922 ≤560 single column
- *RB-24 · confidence 0.85 · visual*

### terms

**RSP-293 · POLISH** — 359px is the file's only non-ladder cutline — at exactly 360 the terms grid stays 2-up while all 360 rules fire (360–360px, locales: en, lt)

- **What:** Seam S2 CONFIRMED as intentional-but-inconsistent. The comment above globals.css:1387 says 'runs out of room only below ~360px' and uses max-width:359px, while the three sibling tiny-phone rules use max-width:360px (inclusive at 360). At exactly 360px viewport the footer/button/HIW compressions apply but .nk-hl-grid stays 2-up (~166px columns — tight but per comment sufficient). Mixed inclusivity conventions on the same ladder step.
- **Why:** Benign today; single-px semantic drift is how future edits create real gaps (a rule copied from the 359 block into a 360 block flips behavior at one width).
- **Fix:** Standardize: use max-width:359.98px nowhere — pick 360-inclusive everywhere and make the terms rule @media(max-width:360px) if 2-up truly fits at 361 (it does: columns grow monotonically).
- **Evidence:** app/globals.css:1387 @media(max-width:359px) .nk-hl-grid; app/globals.css:928/1544/1754 max-width:360px siblings
- *RB-01 · confidence 0.8 · code-inferred*

### terms-grid

**RSP-303 · POLISH** — 359px is the file's only off-ladder cutline (everything else uses 360) (359–360px)

- **What:** The terms/highlights grid drops to 1-col at max-width:359px while the documented xs ladder step (and three sibling rules) fire at max-width:360px. At exactly 360px the tiny-phone tighten rules apply but the terms grid stays 2-up at ~160px columns.
- **Why:** Single-px private cutlines erode the ladder the file itself documents at :1404-1410; at 360 (a mainstream compact-Android width) the two systems disagree.
- **Fix:** globals.css:1387 — use max-width:360px, or add a ladder comment justifying 359 if the 2-up truly fits at exactly 360.
- **Evidence:** app/globals.css:1387 @media(max-width:359px) .nk-hl-grid 1-col; app/globals.css:928/1544/1754 (the 360 ladder steps)
- *RB-01 · confidence 0.7 · code-inferred*


---

## 4. Categories (/kategorijos)

*All widths + boundary pairs; 9 substantiated findings (1 HIGH · 7 MEDIUM · 1 POLISH) — a small, structurally sound page with one systemic grid defect.*

The forced `repeat()` column ladder drops tile tracks below the system's own `--nk-cat-min:220px` at 320–380 px and at the 701/981 ladder entries, ellipsizing LT titles (RSP-307, measured); the ≤400 px `--nk-cat-h:150px` breathing-room rule is dead code (later ≤560 rule wins — tiles measure 138 px). The 560/561 seam carries a +33 % type / +51 % height cliff via the compact skin, and tiles lose their examples line crossing it. Ultrawide verified centered at 1920 (283/285 px margins) with the 1520 cap; 5-col engages correctly at 1441. Zero overflow at all 73 shots.

### All findings — Categories

### grid

**RSP-307 · HIGH** — Category tile titles ellipsized by 2-line clamp at 320-380px and at 3-up/4-up band entries (320–1080px, locales: en, lt; affects three disjoint bands: ~320-380 (2-up compact), ~701-770 (3-up entry), ~981-1080 (4-up entry); fits at 393-700, 771-980, 1081+)

- **What:** The tile <h3> is clamped to 2 lines (globals.css:2003). At 320/344/360 the 2-up compact tiles (~126-140px text width, 15px font) truncate 'Garsas, muzika ir renginių…' and 'Sveikata ir medicininė…'; EN truncates 'Health & Medical…' at 360. The same titles re-truncate when the forced 3-col ladder enters at 701px (~205px tiles, 20px font: both titles ellipsized) and the 4-col ladder at 981px ('Sveikata ir medicininė…' ellipsized). At 393/430/560/700/980/1440 all titles fit fully — going WIDER across the 700→701 and 980→981 seams makes labels less readable.
- **Why:** Category names are the primary labels of the core discovery surface on an install-bridge site; ellipsizing them on mainstream 360/375-class phones and at tablet/laptop band entries is below the 2026 marketplace bar and is also the WCAG 1.4.4 experience of 200% zoom on ~720-760px windows.
- **Fix:** Allow 3 clamp lines on the compact skin (add -webkit-line-clamp:3 inside the ≤560 block near globals.css:756 — the 138px tile has vertical room since examples are hidden), and stop entering 3/4-col ladders below the width the LT titles need: either honor --nk-cat-min (220px, globals.css:218) by moving the repeat(3) entry from 701 to ~760 and repeat(4) from 981 to ~1080, or keep the intrinsic auto-fit minmax base (globals.css:1096) up to 1440.
- **Evidence:** `categories/base-lt-0360x0800-dpr2-fp.png` · `categories/base-lt-0320x0568-dpr2-fp.png` · `categories/base-en-0360x0800-dpr2-fp.png` · app/globals.css:2002 .nk-catv2__meta h3 (-webkit-line-clamp:2); app/globals.css:756 .nk-cat h3{font-size:15px!important} (≤560 compact skin)
- *RB-01 · confidence 0.9 · measured*

**RSP-308 · MEDIUM** — Category grid width-ladder drops tiles below --nk-cat-min, truncating LT category names (701–1015px)

- **What:** .nk-grid-cats declares repeat(auto-fit,minmax(min(100%,var(--nk-cat-min)),1fr)) with --nk-cat-min:220px ('tiles stay readable before adding a column'), but explicit viewport ladders override it: 3-col at 701-980, 4-col at 981-1440. At the lower edge of each rung the tile falls below the 220px minimum the token promises: ~207px at 701 and ~221px at 981. The 2-line title clamp then ellipsizes real category names: at 701 'Garsas, muzika ir renginiu...' and 'Sveikata ir medicinine...' truncate; at 981 'Sveikata ir medicinine...' truncates. At 700 (2-col) and 1025 the same names fit fully.
- **Why:** Category names are the page's primary content; ellipsized names ('Sveikata ir medicinine...') lose the noun that carries meaning. The dead auto-fit rule would have prevented exactly this - the ladder reintroduces the seam bug the minmax token was written to avoid.
- **Fix:** Delete the fixed-column overrides at globals.css:1098-1101 and let the auto-fit minmax(220px,1fr) base rule govern >560px (keep the ≤560 2-up skin), or raise the rung edges (3-col from ~740, 4-col from ~1020) so tiles never drop below 220px.
- **Evidence:** `categories/base-lt-0701x0900-dpr2-fp.png` · `categories/base-lt-0700x0900-dpr2-fp.png` · `categories/base-lt-0981x0900-fp.png` · app/globals.css:1097 .nk-grid-cats (auto-fit minmax base); app/globals.css:1098-1101 fixed column ladder overrides
- *RB-02 · confidence 0.95 · measured*

**RSP-309 · MEDIUM** — Dead rule: the ≤400px 150px tile-height bump is silently overridden by the later ≤560px 138px rule (320–400px, locales: en, lt)

- **What:** globals.css:761 sets --nk-cat-h:150px at ≤400px, with a comment saying it exists so long LT names 'keep breathing room at 320px'. But globals.css:1103 declares --nk-cat-h:138px at ≤560px on the same selector with equal specificity LATER in the file, so at every width ≤400 the 138px value wins. Measured tile height at 320px is ~137-138 CSS px, not 150. The intended smallest-phone accommodation never ships, and the very truncation the comment worries about occurs (see RB-01 finding).
- **Why:** A documented design intention is silently inert — the custom-property cascade is order-dependent, so the earlier narrow-band rule can never beat the later broad-band one; anyone tuning line 761 sees no effect on device.
- **Fix:** Move the @media(max-width:400px) block after the ≤560 grid rule (below globals.css:1103), or set the 150px value inside the ≤560 block with a nested ≤400 override; then re-check whether 150px + 3-line clamp resolves the 320-380px truncation.
- **Evidence:** `categories/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:761 @media(max-width:400px){.nk-grid-cats{--nk-cat-h:150px}} (dead); app/globals.css:1103 @media(max-width:560px){.nk-grid-cats{--nk-cat-h:138px;...}} (wins by source order)
- *RB-24 · confidence 0.92 · measured*

**RSP-312 · MEDIUM** — Width-ladder column overrides defeat the intrinsic 220px tile minimum they sit on top of (701–1440px, locales: en, lt)

- **What:** The base grid is intrinsic — repeat(auto-fit,minmax(220px,1fr)) with --nk-cat-min documented as 'category tiles stay readable before adding a column' — but four stacked @media ladders (globals.css:1097-1100) force repeat(3) from 701px and repeat(4) from 981px, where the resulting tracks are ~204-215px, i.e. below the system's own declared 220px readability floor. The intrinsic rule effectively never runs above 700px. Consequence is visible as the band-entry title truncation (see RB-01 finding).
- **Why:** This is exactly the ladder-vs-intrinsic seam bug class: the token that encodes the design's min tile width is dead above 700px, so every future title/locale change re-breaks at ladder entries instead of the grid self-correcting.
- **Fix:** Delete the 701-980 and 981-1440 ladder rules and let the auto-fit minmax(220px,1fr) base govern 561-1440 (it naturally gives 3-up from ~760 and 4-up from ~1010 under the 1520 cap), keeping only the ≥1441 repeat(5) cap and ≤560 2-up skin; or raise the ladder entry widths so tracks never drop under var(--nk-cat-min).
- **Evidence:** `categories/base-lt-0701x0900-dpr2-fp.png` · `categories/base-lt-0700x0900-dpr2-fp.png` · `categories/base-lt-0981x0900-fp.png` · app/globals.css:1096 .nk-grid-cats base auto-fit minmax(min(100%,var(--nk-cat-min)),1fr); app/globals.css:1097-1100 forced repeat(5/4/3/2) width ladder
- *RB-02 · confidence 0.85 · measured*

**RSP-317 · POLISH** — 5-up tier turns the invariant 12-category catalog into a permanent 5+5+2 ragged grid at ≥1441px (1441–3840px, locales: en, lt)

- **What:** The backend always returns exactly 12 top-level categories (CategoriesScreen.tsx:16-18 relies on this). At 981-1440 the 4-up grid renders three perfectly balanced rows; crossing 1441 the 5-up tier produces 5+5+2 with a permanently half-empty last row — not a data-dependent partial row but a designed-in one for every desktop visitor. At 1440 the page reads more composed than at 1441.
- **Why:** A partial last row from variable data is normal; a hard-coded catalog size that can never fill the chosen column count is a composition choice a flagship marketplace would revisit (4-up/6-up, or a 2-col-span feature tile for 'Kita').
- **Fix:** Either keep 4-up through ultrawide (delete globals.css:1097 — the 1520 cap keeps 4-up tiles a fine ~330px), or make the last two tiles span consciously (e.g. .nk-grid-cats > :nth-last-child(-n+2){grid-column:span 1} → feature the 11th/12th at 2.5-col each), or drop the cap tier to 6-up (12%6=0).
- **Evidence:** `categories/base-lt-1441x0900-fp.png` · `categories/base-lt-1440x0900-fp.png` · `categories/base-lt-1920x1080-fp.png` · app/globals.css:1097 @media(min-width:1441px){.nk-grid-cats{grid-template-columns:repeat(5,minmax(0,1fr))}}
- *RB-20 · confidence 0.75 · visual*

### cards

**RSP-310 · MEDIUM** — 560→561 seam: +33% title size, +51% tile height, examples line appears — all at one CSS pixel (560–561px, locales: en, lt)

- **What:** Crossing 560→561px the tile title jumps 15px→20px (+33%, well over the 15% cliff budget), tile height jumps 138px→208px (+51%), the examples subline pops into existence, the chip grows 40→48px and the arrow appears — while the column count stays 2-up, so the page's scroll length and rhythm change abruptly with no layout cause. The 15px value is applied with !important (globals.css:756), a stepped hard override fighting the component's own 20px declaration on the same element (RB-09 double-system pattern).
- **Why:** A 1px window resize or device rotation across 560 produces a jarring re-skin of 12 tiles; fluid type/height (or a container query, see RB-03 finding) would make the transition continuous. The !important step also makes the type system unauditable — the token pipeline says 20px, devices render 15px.
- **Fix:** Replace the fixed 15px/20px pair with one fluid declaration on .nk-catv2__meta h3, e.g. font-size:clamp(15px,1.5vw + 8px,20px) (kills the !important at globals.css:756), and tween --nk-cat-h with clamp(138px,…,208px) between 400-700px; reveal the examples line at the same threshold the height passes ~180px.
- **Evidence:** `categories/base-lt-0560x0900-dpr2-fp.png` · `categories/base-lt-0561x0900-dpr2-fp.png` · app/globals.css:756 .nk-cat h3{font-size:15px!important;line-height:18px!important}; app/globals.css:2002 .nk-catv2__meta h3{font-size:20px;line-height:25px}
- *RB-05 · confidence 0.9 · measured*

**RSP-311 · MEDIUM** — Category tile crosses a 25% type cliff and loses its examples line at the 560/561 seam (560–561px)

- **What:** Crossing 561→560 the tile title drops 20px/25lh → 15px/18lh (-25% font, beyond the 15% seam budget), the one-line examples scent ('Greztuvai, pjuklai, perforatoriai' etc.) disappears (display:none), tile height jumps 208px→138px, and page scrollHeight steps 3907→3649 (-258px) - all in 1 CSS px. The two sides of the seam read as different designs.
- **Why:** A 1px resize (or rotation on a small tablet) reskins the entire primary grid at once. The compact skin itself is a deliberate phone pattern, but the transition is a cliff, not a ramp - 2026 practice is fluid type (clamp) plus a gradual removal of secondary content, and 560 covers the majority phone band while 561-700 phones keep the roomy skin.
- **Fix:** Make the tile title fluid, e.g. font-size:clamp(15px,1.2vw + 10px,20px) on .nk-catv2__meta h3 (drop the !important step at globals.css:757), and consider keeping a 1-line clamped examples row on phones or removing it below a container-width threshold instead of a viewport one.
- **Evidence:** `categories/base-lt-0560x0900-dpr2-fp.png` · `categories/base-lt-0561x0900-dpr2-fp.png` · app/globals.css:757 .nk-cat h3{font-size:15px!important;line-height:18px!important} (≤560); app/globals.css:1999 .nk-catv2__meta h3{font-size:20px;line-height:25px}
- *RB-05 · confidence 0.9 · measured*

**RSP-313 · MEDIUM** — CategoryCard skins by viewport width in ≥3 container contexts — prime @container migration target (320–1440px, locales: en, lt)

- **What:** The same .nk-cat.nk-catv2 tile renders in at least three container contexts — (1) the categories-page grid under a 1520px cap (2/3/4/5-up), (2) the home category snap-rail shelf ≤980px, (3) the home grid ≥981px — but its anatomy (compact 15px title, hidden examples line, 40px chip, hidden arrow) is selected by viewport @media(max-width:560px)/(400px). The mapping inverts: a ~205-210px-wide tile at a 981px viewport gets the FULL skin (20px title + examples → truncation), while a ~264px-wide tile at 560px gets the COMPACT skin. The repo has zero @container rules.
- **Why:** Tile anatomy depends on tile width, not window width; container queries (widely supported baseline since 2023) would make the compact skin fire exactly when the tile is narrow, eliminating both the band-entry truncation and the 560/561 cliff in one move.
- **Fix:** Declare container-type:inline-size on the grid/rail cells (or a wrapper div in CategoryCard, cards.tsx:134) and convert the ≤560/≤400 tile rules (globals.css:755-756, 2022-2032) to @container (max-width:~200px)/(max-width:~160px) blocks; keep viewport @media only for the grid's column templates.
- **Evidence:** `categories/base-lt-0981x0900-fp.png` · `categories/base-lt-0560x0900-dpr2-fp.png` · `categories/base-lt-0430x0932-dpr2-fp.png` · app/globals.css:2022-2029 @media(max-width:560px) catv2 compact skin; app/globals.css:2030-2032 @media(max-width:400px) hide __go
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-314 · MEDIUM** — CategoryTile renders in page grid and home 224px snap rail but is skinned by viewport media (344–1440px)

- **What:** The v2 category tile renders in .nk-grid-cats (categories page, 207-360px tiles) and the home .nk-cats-shelf snap rail (fixed 224px cards ≤980, 180px ≤560). All its sizing (title 20px vs 15px!important, examples on/off, chip 48 vs 40px, heights 208/192/158/138) switches on viewport width, so a 224px rail card at a 900px viewport keeps the full desktop skin while a ~250px page tile at 560px gets the compact skin.
- **Why:** Same zero-@container gap as the offer card: the tile cannot know it is in a narrow rail vs a wide grid, so the height/type matrix is maintained as four parallel viewport blocks (globals.css:756, 1104, 2064, 2069) that must be kept in sync by hand.
- **Fix:** Give .nk-grid-cats and .nk-cats-shelf container-type:inline-size and express tile height, title size, chip size and .nk-catv2__sub visibility as @container rules keyed to tile width (~<190px = compact).
- **Evidence:** `categories/base-lt-0560x0900-dpr2-fp.png` · `categories/base-lt-0701x0900-dpr2-fp.png` · `categories/base-lt-0981x0900-fp.png` · app/globals.css:750-757 ≤560 .nk-cat compact rules; app/globals.css:2046-2069 .nk-cats-shelf rail (home, ≤980, 224px/180px cards)
- *RB-03 · confidence 0.75 · code-inferred*


---

## 5. SEO landings (/nuoma/…, /miestai/…)

*13 representative routes (longest/shortest slugs, deepest subcat+city path) at mobile/desktop regimes; 22 substantiated findings (1 HIGH · 11 MEDIUM · 10 POLISH). These pages share FeedScreen — feed findings apply; this chapter covers the deltas.*

The landing-specific surface (eyebrow + H1 + intro + chip rows) is solid to 3840 with deliberate caps. Deltas: at 561–700 the sticky bar keeps the full desktop toolbar as ~3 wrapped rows ≈ 250 px pinned (RSP-321, verified at 673 px) — the worst fixed-chrome case on the site; long landing H1s widow single words for want of `text-wrap:balance` (RSP-322); the intro clamp triggers only >200 chars so ~150-char city intros render 5 unclamped lines on phones (RSP-330); "Pristatymas" badges collide with the favourite heart at 320–343 (RSP-112 family); breadcrumbs on the deepest path (`/nuoma/namai-sodas/auksto-slegio-plovimo-iranga/marijampole`) survive ≤680 via the current-page chip hide — deliberate and verified.

### All findings — SEO landings

### filters

**RSP-321 · HIGH** — 561-700px band keeps full desktop toolbar in the sticky bar: 3 wrapped rows ≈ 250px pinned (561–700px, locales: en, lt; measured at 673x841: sticky nav+toolbar ≈ 311px (37%); on ≤700px-tall in-band viewports (e.g. 667x375 landscape phone) same chrome ≈ 80%+)

- **What:** The mobile filter-sheet collapse ends at 560px (globals.css:1121-1130). From 561-700px the sticky .nk-filterbar carries the full desktop control set which wraps into three rows (search+sort / category+city+price / delivery toggle). At 673x841 the pinned chrome (nav 64px + bar ~247px) is 37% of the viewport. The bar height is fixed in px, so on any in-band viewport ≤700px tall — landscape phones at 561-700px width, small split-screen windows — pinned chrome consumes far more than the 40% budget (≈84% at 375px tall).
- **Why:** RB-07: fixed/sticky chrome must leave ≥60% of viewport on short viewports. A landscape-phone visitor scrolling a landing sees almost no content under the pinned toolbar; keyboard-open (search focus) makes it worse.
- **Fix:** Extend the mobile collapse (search + Filters button + sheet) up to 700px width, or add @media(max-height:700px){.nk-filterbar{position:static}} alongside the width rule at globals.css:1119.
- **Evidence:** `hub-sveikata/base-lt-0673x0841-dpr2-fp.png` · `subcat-longest/base-lt-0673x0841-dpr2-fp.png` · app/globals.css:1109 .nk-filterbar (position:sticky); app/globals.css:1119-1131 (sheet collapse only ≤560)
- *RB-07 · confidence 0.85 · measured*

**RSP-325 · MEDIUM** — Category rail chips are 38px tall — under the 44px touch minimum on the touch-only band (320–560px, locales: en, lt)

- **What:** The ≤560 mobile category chip rail (.nk-catrail__chip) sets min-height:38px with 9px vertical padding. These chips are the primary browse dimension on phones (the reason the rail exists per the code comment) and render only on touch viewports. The repo's own --nk-tap token is 44px (globals.css:149) and is applied to crumbs, fchips and the search input, but not here.
- **Why:** RB-12: interactive targets on touch bands need ≥44px (48 preferred). 38px chips in a horizontally scrollable rail invite mis-taps between adjacent chips (8px gap).
- **Fix:** globals.css:1141: min-height:var(--nk-tap) (padding 11px 14px), or keep visual 38px but add ::after hit-area padding to 44px.
- **Evidence:** `city-vilnius/base-en-0360x0800-dpr2-fp.png` · `hub-sveikata/base-lt-0344x0882-dpr2-fp.png` · app/globals.css:1141 .nk-catrail__chip{min-height:38px}
- *RB-12 · confidence 0.9 · measured*

**RSP-335 · POLISH** — Search placeholder hard-clips mid-word ("Ką norite išs", "What do yo") with no ellipsis (320–390px, locales: en, lt)

- **What:** The feed search input's placeholder (dict feed.searchPlaceholder, 'Ką norite išsinuomoti?' / 'What do you want to rent?') is longer than the ≤390px field and Chromium clips it mid-word with no ellipsis — LT shows 'Ką norite išs', EN 'What do yo' at 360. Both look accidental on the page's primary input.
- **Why:** Clipped placeholder text on the hero-adjacent search box reads as a rendering bug to users; 2026 pattern is a short mobile placeholder or ellipsized overflow.
- **Fix:** Add input::placeholder{text-overflow:ellipsis} to .nk-searchfield input, or add a shorter mobile placeholder key (e.g. 'Ko ieškote?' / 'Search rentals') in both dictionaries.
- **Evidence:** `city-vilnius/base-en-0360x0800-dpr2-fp.png` · `city-vilnius/base-lt-0375x0667-dpr2-vp.png` · `hub-sveikata/base-lt-0344x0882-dpr2-fp.png` · app/globals.css:1081-1086 .nk-searchfield
- *RB-01 · confidence 0.9 · visual*

**RSP-340 · POLISH** — Search input grows unbounded to ~1330px wide at the 1920px cap (1537–3440px, locales: en, lt)

- **What:** The searchfield flexes to fill the row (flex:1 1 320px with no max-width), so at 1920+ it renders ~1330px wide with only the sort pill beside it, while the H1/intro above are capped at 65ch and the SEO prose below at ~65ch. The single stretched control is the only element consuming the full cap width in the upper half of the page (city-palanga 1920, city-vilnius 1920/3440).
- **Why:** A 1300px text input is far past any useful measure and reads as an unfinished stretch next to the deliberately capped text blocks - the one utilization wobble on an otherwise coherent 1920 cap.
- **Fix:** Add a max-width (e.g. 720-880px) to .nk-filter-row > .nk-searchfield at globals.css:1089 and let the row's remaining space stay as gap, or right-align the sort pill via margin-left:auto.
- **Evidence:** `city-palanga/base-lt-1920x1080-fp.png` · `city-vilnius/base-lt-1920x1080-fp.png` · `city-vilnius/base-lt-3440x1440-fp.png` · app/globals.css:1089 .nk-filter-row > .nk-searchfield{flex:1 1 320px}; app/globals.css:337 .nk-container max-width 1920px
- *RB-04 · confidence 0.75 · visual*

**RSP-343 · POLISH** — 'Isvalyti' clear control is ~35px tall on the 769-1024 touch band (769–1024px, locales: en, lt)

- **What:** The reset button next to the result count (FeedScreen.tsx:500) uses inline padding 8px 12px with 15px text, yielding a ~35x100px target on tablet viewports where every neighbouring filter control honours --nk-tap (>=44px). Spacing to the count text is 8px, so it is not a tight pair, but the target itself is below the 44px touch minimum (48 preferred).
- **Why:** Tablets 769-1024 are touch-first; a sub-44px destructive-ish control (clears all filters) beside 44px pills is an inconsistency users feel as a miss-tap.
- **Fix:** Give .nk-clear min-height:var(--nk-tap) and vertically center it (FeedScreen.tsx:500 style or a globals.css rule).
- **Evidence:** `hub-sveikata/base-lt-0769x1024-dpr2-vp.png` · `subcat-longest/base-lt-1024x0768-vp.png` · app/globals.css:1109 .nk-filterbar
- *RB-12 · confidence 0.7 · code-inferred*

### hero

**RSP-322 · MEDIUM** — .nk-h-page has no text-wrap:balance, so long landing H1s widow a single word (769–1440px, locales: en, lt)

- **What:** The programmatic landing H1s are long genitive phrases that wrap to two lines with a one-word second line: at 1024 the LT subcategory H1 renders "Aukšto slėgio plovimo įrangos" / "nuoma" (widowed 'nuoma'); at 1280 cat-city-branch renders "Įrankių ir statybos įrangos" / "nuoma Vilniuje"; EN 1024 subcat-city-deep renders "Pressure washers rental in" / "Marijampolė". .nk-h-hero (globals.css:254) already has text-wrap:balance + overflow-wrap:anywhere but .nk-h-page (globals.css:260) - the H1 style used by every /nuoma and /miestai landing - has neither.
- **Why:** A widowed single word on the primary H1 of the ~100-page programmatic SEO family is exactly the wrap-quality defect text-wrap:balance exists to fix; it reads sloppy against 2026 marketplace typography.
- **Fix:** Add text-wrap:balance (and overflow-wrap:anywhere for parity with .nk-h-hero) to .nk-h-page at app/globals.css:260.
- **Evidence:** `subcat-longest/base-lt-1024x0768-vp.png` · `cat-city-branch/base-lt-1280x0800-fp.png` · `subcat-city-deep/base-en-1024x0768-fp.png` · app/globals.css:260 .nk-h-page; app/globals.css:250-255 .nk-h-hero (has text-wrap:balance)
- *RB-10 · confidence 0.92 · visual*

**RSP-329 · MEDIUM** — "Rodyti daugiau" intro toggle (~31px) and "Išvalyti" clear (~38px) miss the 44px touch minimum (320–560px, locales: en, lt)

- **What:** Two text-buttons in the landing header are under 44px on the touch band: (1) the intro expand toggle, FeedScreen.tsx:437-440, inline style padding:'8px 0' + fontSize 15 ≈ 31px tall — it is mobile-only (.nk-narrow-only) so it exists exclusively on touch screens; (2) the result-row clear button, FeedScreen.tsx:500, padding '8px 12px' + 15px text ≈ 36-38px, adjacent to the result count.
- **Why:** RB-12: both are recovery/disclosure controls a phone user actually taps (expanding the SEO intro, resetting filters). Sub-44px text links are below the 2026 marketplace bar the rest of the page already meets via --nk-tap.
- **Fix:** Add minHeight:'var(--nk-tap)' + display:inline-flex/alignItems:center to the intro toggle (FeedScreen.tsx:439) and min-height:var(--nk-tap) to .nk-clear.
- **Evidence:** `hub-transportas/base-lt-0320x0568-dpr2-fp.png` · `subcat-longest/base-lt-0360x0800-dpr2-vp.png` · app/globals.css:495-504 .nk-clear (no min-height)
- *RB-12 · confidence 0.85 · measured*

**RSP-330 · MEDIUM** — Intro clamp triggers only >200 chars, so ~150-char city intros render 5 uncalmped lines on phones (320–560px, locales: en, lt; 375x667: first listing ~1.5 viewports down)

- **What:** FeedScreen.tsx:433-436 applies .nk-intro-clamp (3-line clamp + toggle) only when subtitle.length > 200. The Vilnius city intro (~150 chars) escapes the threshold and renders 5 full lines at 320-390px, while the longer Transportas intro clamps to 3 lines + 'Rodyti daugiau'. Density is inconsistent between sibling landings, and on 375x667 the header stack (eyebrow+H1+5-line lede) pushes the first card ~1.5 viewports down.
- **Why:** RB-24: the compact skin should compress proportionally — the clamp was added precisely because 'long authored SEO intros pushed the results ~13 lines down' (comment at FeedScreen.tsx:86), but the char heuristic leaves a 4-5-line hole. Landing visitors from Google want inventory above the fold.
- **Fix:** Clamp by rendered lines, not chars: always add .nk-intro-clamp on landings ≤560 and show the toggle only when scrollHeight > clientHeight (one measure in an effect), or lower the threshold to ~120 chars.
- **Evidence:** `city-vilnius/base-lt-0375x0667-dpr2-vp.png` · `city-vilnius/base-lt-0320x0568-dpr2-vp.png` · `hub-transportas/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1155 .nk-intro-clamp (3-line clamp)
- *RB-24 · confidence 0.85 · measured*

**RSP-334 · POLISH** — Landing H1s strand a lone word ("nuoma") on their last line at 320-360px (320–400px)

- **What:** "Transporto nuoma" wraps to 'Transporto / nuoma' at 320; "Aukšto slėgio plovimo įrangos nuoma" wraps to '... įrangos / nuoma' at 360 and '... / nuoma / Marijampolėje' at 320 — the generic suffix 'nuoma' repeatedly ends up as a widow line on the page's largest text. .nk-h-page has no text-wrap policy.
- **Why:** RB-10: widowed single words on display headings are the classic balance-candidate; every LT category/subcategory landing H1 ends in 'nuoma' so the pattern is systematic.
- **Fix:** Add text-wrap:balance to .nk-h-page (globals.css:260); verify against the longest subcat H1 at 320.
- **Evidence:** `hub-transportas/base-lt-0320x0568-dpr2-fp.png` · `subcat-longest/base-lt-0360x0800-dpr2-vp.png` · `subcat-city-deep/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:260 .nk-h-page
- *RB-10 · confidence 0.9 · visual*

### cards

**RSP-323 · MEDIUM** — OfferCard next/image sizes ladder does not match the 3/4/5-column feed grid ladder (769–1920px, locales: en, lt)

- **What:** cards.tsx:59 declares sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 416px", but .nk-grid-feed renders 3 columns at 701-1024 (card ~28vw), 4 columns at 1025-1280 (card ~211-265px) and 5 columns at 1281+ (card ~211-330px). In-band mismatches: 769-1024 gets 46vw served for ~28vw rendered (~1.6x linear, ~2.7x pixels); 1025-1100 gets 46vw for ~22vw (~2.1x); 1101-1536 gets a fixed 416px for 211-280px cards (~1.6-2x). Only near 1920 (card ~330px) is 416px close. On dpr2 tablets (769-1024 shots are dpr2) the overshoot doubles again in device pixels.
- **Why:** Every landing grid card downloads roughly 2x the linear pixels it needs at the most common desktop/tablet widths - wasted LCP bytes on image-heavy marketplace pages; 2026 practice is sizes that track the actual column ladder.
- **Fix:** Align the sizes attribute with the grid ladder in cards.tsx:59, e.g. "(max-width: 560px) 92vw, (max-width: 700px) 46vw, (max-width: 1024px) 30vw, (max-width: 1280px) 24vw, 340px" (or migrate the grid to auto-fit/minmax and use one container-derived size).
- **Evidence:** `city-vilnius/base-lt-1440x0900-fp.png` · `city-vilnius/base-lt-1920x1080-fp.png` · `hub-transportas/base-lt-1280x0800-fp.png` · app/globals.css:1182 .nk-grid-feed; app/globals.css:1183-1186 .nk-grid-feed column ladder
- *RB-17 · confidence 0.9 · code-inferred*

**RSP-324 · MEDIUM** — "Pristatymas" delivery badge collides with the favorite heart and clips without ellipsis at 320-343px (320–343px)

- **What:** At 320px the 2-up card is ~135 CSS px wide. The badge (icon 11px + gap 6 + "Pristatymas" at 10.5px + 16px padding ≈ 95px) exceeds its max-width (135-52=83px), and because .nk-offer__badge sets white-space:nowrap with no overflow:hidden/text-overflow, the label paints past the pill edge and runs under the 36px favorite disk (fav left edge at x≈89, badge text reaches x≈100+). Auto-metrics flag 2-3 clipped badges per page at 320; at ≥344px it just barely fits (verified clean at 344/360).
- **Why:** A trust badge overlapping the primary favorite control reads as broken and makes the heart's hit area visually ambiguous — visible on every photo card with delivery on 320-343px devices (iPhone SE gen1 band, LT locale only; EN "Delivery" fits).
- **Fix:** In globals.css:1917 add overflow:hidden;text-overflow:ellipsis;min-width:0 to the ≤560 badge (and set max-width:calc(100% - 56px)); or swap to an icon-only badge below ~360px card containers.
- **Evidence:** `city-vilnius/base-lt-0320x0568-dpr2-fp.png` · `hub-transportas/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1917 .nk-offer__badge (≤560 max-width:calc(100% - 52px)); app/globals.css:730 .nk-offer__badge (white-space:nowrap, no overflow handling)
- *RB-01 · confidence 0.9 · measured*

**RSP-326 · MEDIUM** — Card eyebrow is defined three times (11.5 → 10.5 → 9.5px !important) and lands below a 10px floor on phones (320–560px, locales: en, lt)

- **What:** The category eyebrow's size is set in three stacked layers: base 11.5px (globals.css:704), Quiet Luxe finish 10.5px (1849), and the ≤560 mobile layer 9.5px!important with re-tracked letter-spacing (1902). The whole ≤560 block (1896-1918) is a parallel stepped system of !important overrides fighting the card's inline styles — the code comment admits '!important is required where the card carries inline styles'. Result: 9.5px uppercase tracked text (auto-metric minFontPx 9.5) as the card's only category signal on phones.
- **Why:** RB-09: two competing sizing systems on one element make every future change a specificity fight; 9.5px is below the practical 10px legibility floor for meaningful text on mobile, and the auto-metrics flag it as the page-wide minimum font.
- **Fix:** Move card typography out of inline styles into the .nk-offer__* classes (or CQ units per the container-query finding) so one declaration per property wins; keep the phone eyebrow ≥10px.
- **Evidence:** `city-vilnius/base-lt-0320x0568-dpr2-fp.png` · `city-vilnius/base-en-0360x0800-dpr2-fp.png` · app/globals.css:704 .nk-offer__eyebrow (11.5px base); app/globals.css:1849 (10.5px Quiet Luxe)
- *RB-09 · confidence 0.9 · measured*

**RSP-327 · MEDIUM** — OfferCard is rendered in 3+ container contexts but sizes itself via viewport @media only (zero @container in repo) (769–3440px, locales: en, lt)

- **What:** The same OfferCard renders in (1) the landing/feed grid .nk-grid-feed (5/4/3/2/1 viewport ladder, uncapped to the 1920 container), (2) the home offers shelf .nk-grid-4 (5/4/3/2/1 ladder inside the 1480px --nk-content-cap), and (3) the listing-detail similar rail .nk-grid-4--rail (max 4-up, snap carousel <=560). Its internal anatomy (eyebrow size/letter-spacing globals.css:1849, title skin, <=560 compact overrides at 1898-1902) is keyed to viewport width, so a card that is 330px wide in the rail and 230px wide in the 5-up feed at the same viewport gets identical type - producing the eyebrow ellipsis in one context and not the other. The repo has zero @container rules.
- **Why:** Per-context card width already diverges by ~100px at the same viewport; viewport-keyed skins can only be tuned for one context. Container queries are the 2026-baseline mechanism for exactly this component.
- **Fix:** Declare container-type:inline-size on the grid wrappers (.nk-grid-feed, .nk-grid-4, .nk-grid-4--rail item) and move the card's eyebrow/title/pricebar sizing from viewport @media to @container steps in globals.css.
- **Evidence:** `city-vilnius/base-lt-1440x0900-fp.png` · `city-vilnius/base-lt-1920x1080-fp.png` · app/globals.css:1182-1186 .nk-grid-feed ladder; app/globals.css:1458-1462 .nk-grid-4 ladder
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-328 · MEDIUM** — OfferCard compact skin is viewport-gated at 560px, so a same-width card cliffs 15px→20px h3 at 560/561 (320–768px, locales: en, lt)

- **What:** The card renders in ≥3 container contexts (feed grid 2-up ≤560, feed grid 2-up 561-700, feed grid 3-up 701-1024; plus the detail-page .nk-grid-4--rail min(68%,240px) columns and home shelf) but its compact skin is a viewport @media(max-width:560px) block of !important overrides. At the 560→561 seam the card stays ~250px wide while its type/chrome jump: h3 15px→20px (+33%), delivery badge 10.5px→13px (+24%), fav disk 36→42px, eyebrow 9.5→10.5px — all >15% cliffs with no width change. Conversely a 240px rail card at 768px viewport gets the full desktop skin.
- **Why:** RB-03/RB-05: component sized by viewport rather than its container produces seam cliffs and inconsistent density; the repo has zero @container. 2026 practice is a container query on the card wrapper choosing the compact skin by card width.
- **Fix:** Add container-type:inline-size to the .nk-grid-feed item wrapper (FeedScreen.tsx:350 div) and convert the globals.css:1896-1918 block to @container (max-width:300px), removing the !important war with inline styles.
- **Evidence:** `cat-city-branch/base-lt-0560x0900-dpr2-fp.png` · `cat-city-branch/base-lt-0561x0900-dpr2-fp.png` · `city-vilnius/base-lt-0673x0841-dpr2-fp.png` · app/globals.css:1896-1918 @media(max-width:560px) compact card skin; app/globals.css:1185 .nk-grid-feed 2-up 561-700
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-336 · POLISH** — LT category eyebrow ellipsizes on 5-up feed cards between ~1281 and ~1500px (1281–1536px)

- **What:** On the 5-column band the card eyebrow truncates the longest LT category names: at 1440 city-vilnius shows "ELEKTRONIKA IR TECHNO..." on two of four cards (card ~230px). The full label fits at 1920 (card ~330px) and on the 4-up band at 1280. There is no tooltip or other affordance recovering the truncated text; the fixed repeat(5) ladder (not auto-fit/minmax) is what pushes cards below the width the LT eyebrow needs.
- **Why:** Mid-word ellipsis on visible metadata at a mainstream desktop width (1440x900 is a default laptop) is below flagship craft; the category is the card's only taxonomy cue.
- **Fix:** Either let the eyebrow wrap to 2 lines with a fixed 2-line slot, shorten the display label for cards, or switch .nk-grid-feed to repeat(auto-fit,minmax(240px,1fr)) so cards never drop below the label's measure.
- **Evidence:** `city-vilnius/base-lt-1440x0900-fp.png` · `city-vilnius/base-lt-1920x1080-fp.png` · app/globals.css:704 .nk-offer__eyebrow; app/globals.css:1849 .nk-offer__eyebrow skin
- *RB-02 · confidence 0.85 · visual*

**RSP-341 · POLISH** — OfferCardSkeleton keeps desktop bar geometry on phones — compact skin never applies to it (320–560px, state: infinite-append, loading; locales: en, lt)

- **What:** The ≤560 compact skin shrinks the real card (h3 minHeight 50→38, body gap 5px, pricebar type) via .nk-offer-scoped selectors, but OfferCardSkeleton (cards.tsx:212-235) is a bare <article> without .nk-offer: its two 20px title bars + 8px gap (48px) mirror the desktop 50px title block, and its body keeps the desktop gap token. Each skeleton is ~12-18px taller than the loaded compact card, so the initial 8-skeleton grid and every infinite-scroll 4-skeleton append settle upward slightly when content arrives.
- **Why:** RB-19: skeletons must mirror loaded geometry per band; small systematic mismatch × 4 rows = visible settle on phones.
- **Fix:** Give the skeleton article the .nk-offer class-scoped dimensions too (or drive both from shared tokens: bar heights 15/19px and gap 5px inside @media(max-width:560px)).
- **Evidence:** app/globals.css:1899-1903 (compact skin targets .nk-offer only)
- *RB-19 · confidence 0.75 · code-inferred*

### catrail

**RSP-331 · MEDIUM** — Category-rail chips are 38px tall — below the house 44px touch floor on the phone-only band (320–560px, state: base, catrail-end; locales: en, lt)

- **What:** The horizontally scrollable category chip rail only exists ≤560px (globals.css:1135-1142), i.e. exclusively on touch devices, yet its chips are min-height:38px (9px block padding + ~14px type), visually ~38-40px in the 560x900 shot. The design system's own --nk-tap token (44px) is applied to crumbs, search fields and buttons but not here.
- **Why:** RB-12 requires ≥44x44 CSS px (48 preferred) on touch bands; 38px chips on a swipeable rail invite mis-taps between horizontal panning and tapping.
- **Fix:** Set .nk-catrail__chip{min-height:var(--nk-tap)} (globals.css:1142) and bump rail padding to keep the mask fade covering the taller chips.
- **Evidence:** `feed-cat-city/catrail-end-lt-0560x0900-dpr2-vp.png` · app/globals.css:1142 .nk-catrail__chip min-height:38px
- *RB-12 · confidence 0.8 · measured*

**RSP-342 · POLISH** — Category rail lacks overscroll-behavior-x containment at its ends (320–560px, state: catrail-end; locales: en, lt)

- **What:** The ≤560 chip rail scrolls horizontally with hidden scrollbars and a nice gutter mask fade (good peek affordance), but sets no overscroll-behavior-x:contain — swiping past the rail end chains into the page/browser (potential back-gesture on Android Chrome edge overlap since the rail bleeds full-bleed via negative gutters).
- **Why:** RB-14: rails need overscroll containment so an end-of-rail swipe doesn't turn into an accidental navigation.
- **Fix:** Add overscroll-behavior-x:contain to .nk-catrail (globals.css:1137).
- **Evidence:** `feed-cat-city/catrail-end-lt-0560x0900-dpr2-vp.png` · app/globals.css:1137-1140 .nk-catrail (overflow-x:auto, no overscroll-behavior)
- *RB-14 · confidence 0.7 · code-inferred*

### empty-state

**RSP-332 · MEDIUM** — Empty-state title is white-space:nowrap >=561px while its copy interpolates unbounded strings (769–3440px, locales: en, lt)

- **What:** globals.css:828 forces .nk-empty__title to one line on every viewport >=561px. The title text is dynamic: empty.searchTitle interpolates the raw user query (lt.ts:695 `Pagal „${q}“ nuomos pasiūlymų neradome`), and the static LT category title ("Šioje kategorijoje dar nėra nuomos pasiūlymų", ~555px at 26px) already spans ~72% of a 769px viewport (hub-sveikata 769 shot). A long search query typed into any landing's search box makes the nowrap title wider than the viewport (horizontal overflow), and under WCAG 1.4.12 text-spacing overrides (+0.12em letter / +0.16em word) even the static LT title exceeds the available width at the 769-830px end of the band. cards.tsx:292 applies the class to all EmptyState variants.
- **Why:** A one-line guarantee on variable-length, user-interpolated text is a reflow/text-spacing failure mode (WCAG 1.4.4/1.4.12); the comment 'wraps only on narrow screens' assumes lengths the copy does not guarantee.
- **Fix:** Drop the nowrap rule at globals.css:828 (add text-wrap:balance instead), or scope nowrap to the known-short titles and clamp/ellipsize the interpolated query in searchTitle.
- **Evidence:** `hub-sveikata/base-lt-0769x1024-dpr2-fp.png` · app/globals.css:828 @media(min-width:561px) .nk-empty__title{white-space:nowrap}
- *RB-11 · confidence 0.65 · code-inferred*

### grid

**RSP-337 · POLISH** — Feed grid width-ladder cliffs card width -35% at the 700/701 seam (561–768px, locales: en, lt)

- **What:** The feed grid is a five-band width ladder (5/4/3/2/2 columns). At 700px a 2-up card is ~318px; at 701px the 3-up band makes it ~206px — a 35% card-size drop for a 1px viewport change, with image crop, type measure and badge fit all shifting at once. An auto-fit minmax(~220px,1fr) (or container-query columns) would step columns where cards actually need it.
- **Why:** RB-02: ladder seams create the largest single-pixel visual discontinuity in the band and are the root cause of per-band sizes/skins drifting (see the sizes and CQ findings).
- **Fix:** Replace the 561-1024 rungs with grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr)) and re-verify the interruption-banner splitAt logic (it already measures live columns).
- **Evidence:** `city-vilnius/base-lt-0673x0841-dpr2-fp.png` · app/globals.css:1184 .nk-grid-feed 3-up 701-1024; app/globals.css:1185 .nk-grid-feed 2-up 561-700
- *RB-02 · confidence 0.8 · code-inferred*

### overlay-backtotop

**RSP-338 · POLISH** — Back-to-top FAB and filter sheet handle bottom safe-area but not left/right insets (320–768px, state: filters-open, scrolled; locales: en, lt; landscape / notched devices)

- **What:** .nk-backtotop offsets bottom by env(safe-area-inset-bottom) but its right offset is a bare clamp(16px,4vw,32px); the filter sheet gets padding-bottom:env(safe-area-inset-bottom) (globals.css:1499) but its 20px side padding ignores safe-area-inset-left/right. In landscape on notched phones the FAB and the sheet's edge controls can sit inside the inset region.
- **Why:** RB-08 requires left/right env() completeness on every fixed bar/sheet/FAB, not just bottom.
- **Fix:** right:calc(clamp(16px,4vw,32px) + env(safe-area-inset-right)) on .nk-backtotop; padding-inline:calc(20px + env(safe-area-inset-left/right)) on .nk-filtersheet.
- **Evidence:** app/globals.css:960 .nk-backtotop; app/globals.css:939 .nk-filtersheet padding
- *RB-08 · confidence 0.8 · code-inferred*

### breadcrumb

**RSP-339 · POLISH** — 3-row wrapped breadcrumb consumes ~250px above the H1 at 320px (320–360px)

- **What:** On the subcategory landing at 320x568, the trail 'Pagrindinis › / Nuomojami daiktai › / Fotografija ir video' wraps to three rows, each a 44px-min-height crumb with generous line spacing (rows at ~y105/155/205 CSS), pushing the eyebrow+H1 ~250px down — nearly half the first viewport is trail + nav. The ≤680 rule already drops the current-page crumb; the remaining three items still wrap with dangling '›' separators at row ends.
- **Why:** RB-24: the compact skin should compress chrome proportionally; a wayfinding element outweighing the page title at 320 (Fold-cover-adjacent) is loose rhythm.
- **Fix:** At ≤360 render a single 'back to parent' crumb (‹ Nuomojami daiktai) or allow horizontal scroll of one crumb row, and keep '›' bound to its following segment (wrap the sep+link in the existing .nk-crumbs__seg).
- **Evidence:** `feed-cat-city/catrail-end-lt-0320x0568-dpr2-vp.png` · `feed-cat-city/catrail-end-lt-0390x0844-dpr2-vp.png` · app/globals.css:1068 .nk-crumb min-height:var(--nk-tap); app/globals.css:1073-1076 ≤680 current-crumb drop
- *RB-24 · confidence 0.75 · visual*


---

## 6. How it works (/kaip-tai-veikia)

*Collapsed (≤1120) and desktop (≥1121) regimes, owner role + step-4 states, sticky-phone mid-scroll at 1121×800/1280×620/1920×1080; 20 substantiated findings (8 MEDIUM · 12 POLISH) — no HIGHs; the strongest large page.*

≤1120 the inline per-step device works, but switching steps unmounts the ~490 px phone instantly — a half-screen layout jump (RSP-class); the owner payout mock wraps "+ 120 €" orphaning the euro sign. ≥1121 the sticky synced phone (~772 px with caption) never fully fits ≤~890 px-tall windows (1280×620 verified — bottom third clipped while sticky); `?role=owner` deep links paint renter content first and swap the whole steps/FAQ section post-mount (hydration swap, RSP-class). The 1120/1121 seam also carries the locale/CTA hit-box collision (RSP-066 family). The phone mock renders in two container contexts sized by viewport queries — a CQ target.

### All findings — How it works

### steps-phone-mock

**RSP-344 · MEDIUM** — Owner payout mock wraps '+ 120 €' so the euro sign orphans onto its own line (320–1120px, state: hiw-owner-s4)

- **What:** In the owner flow's step-4 inline phone (the payout screen), the 34px display amount '+ 120 €' breaks after '120', leaving '€' alone on a second line. Confirmed at 320 (hiw/hiw-owner-s4-lt-0320x0568) and at 1120 (hiw/hiw-owner-s4-lt-1120x0800) — i.e. across the entire ≤1120 band where the 230px .htw-phone--inline is the only phone shown. The .htw-ps-amt inner width is ~142 CSS px (230 phone − 2×22 screen padding − 2×22 amt padding), too narrow for the 34px string with breakable spaces. EN's '+ €120' (en.ts:299) has the same breakable space after '+'.
- **Why:** This is the single most persuasive screen of the owner funnel ('you get paid') and it renders with a typographic error on every phone and tablet. A 2026 marketplace would never ship an orphaned currency glyph in its hero explainer.
- **Fix:** Use non-breaking spaces in the dict values (lt.ts:326 '+ 120 €', en.ts:299 '+ €120') and/or add white-space:nowrap to .htw-ps-amt span (app/globals.css:1683); optionally drop the font to ~28px inside .htw-phone--inline.
- **Evidence:** `hiw/hiw-owner-s4-lt-0320x0568-dpr2-fp.png` · `hiw/hiw-owner-s4-lt-1120x0800-fp.png` · app/globals.css:1682 .htw-ps-amt; app/globals.css:1683 .htw-ps-amt span
- *RB-10 · confidence 0.92 · visual*

**RSP-345 · MEDIUM** — Phone mock renders in two container contexts but is sized by viewport @media — prime @container target (320–1120px, state: base, hiw-owner-s4; locales: en, lt)

- **What:** PhoneScreen/.htw-phone renders in (1) the desktop synced column .htw-right/.htw-phonewrap at 340px (>1120) and (2) the per-step inline slot .htw-step__device at 230px (≤1120), forked purely by @media(max-width:1120px) (globals.css:1718-1729). The mock's internals — 54/22px screen padding, 34px payout amount, 200px map height, 15px search text — are tuned for 340px and do not adapt to the 230px context, producing the observed defects: euro-sign orphan (payout), mid-word placeholder truncation, and a half-empty search screen. The repo has zero @container usage.
- **Why:** RB-03: a component rendered at two different container widths should size itself from its container. Every future context (e.g. reusing the mock on home or invite) re-inherits the 340px assumptions.
- **Fix:** Add container-type:inline-size to .htw-phone and convert .htw-ps-* paddings/font sizes and .htw-ps-map height to cqw-based values or an @container (max-width:280px) block; delete the --inline @media overrides at globals.css:1727-1729.
- **Evidence:** `hiw/base-en-1120x0800-fp.png` · `hiw/hiw-owner-s4-lt-0320x0568-dpr2-fp.png` · `hiw/textspacing-lt-0768x1024-dpr2-fp.png` · app/globals.css:1649 .htw-phone (width:min(340px,…), aspect-ratio:340/700); app/globals.css:1655 .htw-ps-screen (fixed 54/22 padding)
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-354 · POLISH** — Inline phone's 'search' screen fills only ~55% of its fixed 340/700 box — bottom half empty (320–1120px, locales: en, lt)

- **What:** The step-1 search mock (search pill + 4 tiles + one bar) occupies roughly the top 55% of the phone screen; the remaining ~200 CSS px (at 230px width: search content ends ~y280 of ~473 height) is blank dark surface. Visible at 320, 344, 768, 1119 and 1120 in both locales. Other screens (reserve, list) use margin-top:auto CTAs to fill; search and payout do not.
- **Why:** RB-24: the flagship explainer's first mock reads as an unfinished/failed render, especially at tablet widths where the phone is large and centered.
- **Fix:** Add a filler element (e.g. a second Bar row or skeleton list) to the `search` and `payout` screens in PhoneScreen (HowItWorksScreen.tsx:306-311, 359-365), or shorten the inline aspect (e.g. aspect-ratio:340/560 for .htw-phone--inline).
- **Evidence:** `hiw/base-en-1120x0800-fp.png` · `hiw/textspacing-lt-0768x1024-dpr2-fp.png` · `hiw/base-lt-1119x0800-fp.png` · app/globals.css:1649 .htw-phone aspect-ratio:340/700; app/globals.css:1727 .htw-phone--inline
- *RB-24 · confidence 0.85 · visual*

**RSP-357 · POLISH** — Mock search placeholder truncates mid-word at the 230px inline phone width (320–1120px, locales: en, lt)

- **What:** In the 230px inline phone the search pill shows 'Ką norite išs…' (LT) / 'What do yo…' (EN) — the ellipsis cuts mid-word because the dict string is sized for the 340px desktop mock. Seen at 1119/1120 (LT and EN) and 768.
- **Why:** A mid-word chop in the very first UI element the explainer shows is a small craft miss; real search fields choose placeholders that fit.
- **Fix:** Provide a shorter screen.searchPlaceholder for the mock (both dicts) or reduce .htw-ps-search font-size inside .htw-phone--inline so the phrase completes a word before eliding.
- **Evidence:** `hiw/base-en-1120x0800-fp.png` · `hiw/base-lt-1119x0800-fp.png` · app/globals.css:1665 .htw-ps-search span (ellipsis); app/globals.css:1662 .htw-ps-search
- *RB-10 · confidence 0.8 · visual*

### nav

**RSP-346 · MEDIUM** — 1121–~1179px: locale trigger 'Kalba ▾' collides with the install CTA (bounding boxes overlap ~511px²) (1121–1179px)

- **What:** One pixel above the 1120px burger collapse, the full LT desktop nav (logo + 3 links + locale picker + 'Atsisiųsti programėlę') does not fit. The nowrap links group overflows its shrunk flex box: the 'Kalba' chevron touches/underlaps the CTA's left rounded edge, and the auto-metric measures a 511px² overlap between button.nk-locale-trigger and .nk-nav-cta (≈11×46px). At 1180px the overlap is gone (leads: none).
- **Why:** The site's primary conversion CTA and the locale switcher share pixels at a real laptop/tablet-landscape band (1121–1179, e.g. 1152×864, small windows). Overlapping hit targets and a visually cramped chrome on every page is below the 2026 bar; the CTA also occludes part of the locale trigger's 44px hit area.
- **Fix:** Either raise the collapse breakpoint to ~1200px for the LT dictionary, or make the band fit: lower the gap clamp floor (globals.css:559) and/or apply the compact CTA label (.nk-nav-cta__short) already used ≤1120 to a 1121–1199 band. Verify with LT copy, which is longer than EN.
- **Evidence:** `hiw/base-lt-1121x0800-vp.png` · `hiw/base-lt-1119x0800-vp.png` · app/globals.css:559 .nk-nav-links{gap:clamp(18px,3vw,52px);white-space:nowrap;min-width:0;margin-left:auto}; app/globals.css:562 .nk-nav-cta
- *RB-01 · confidence 0.85 · measured*

**RSP-348 · MEDIUM** — At 1121-~1179px the locale trigger's hit box slides under the nav install CTA (1121–1179px, state: base, hiw-owner-s4, hiw-sticky-mid)

- **What:** Just above the 1120px burger breakpoint the full desktop nav no longer fits: the auto-metric measures a 511 CSS-px2 box overlap (~12x44px) between button.nk-locale-trigger and the primary .nk-nav-cta on every 1121px shot (base, sticky-mid, owner-s4); visually the 'Kalba' chevron sits ~8px from the CTA edge while the trigger's 44px-min-width padded box extends beneath the button. At 1180px the pair is comfortably spaced and the overlap metric is zero.
- **Why:** Two interactive controls with overlapping boxes: the CTA (later in DOM) steals the right edge of the locale trigger's click area, and the trigger's hover wash (.nk-locale-trigger:hover background, globals.css:654) paints a rectangle that runs under the CTA. Colliding chrome at a mainstream ~1150px laptop-with-sidebar width is below the 2026 marketplace bar for the site's one persistent conversion CTA.
- **Fix:** Give the desktop nav breathing room at its minimum width: either raise the collapse breakpoint (globals.css:573) from 1120 to ~1180, or let .nk-nav-links stop underlapping its sibling (e.g. drop white-space:nowrap overflow risk by lowering the gap clamp floor and adding flex-shrink/overflow control so the last child never extends past the container edge).
- **Evidence:** `hiw/base-lt-1121x0800-vp.png` · `hiw/hiw-sticky-mid-lt-1121x0800-vp.png` · `hiw/base-lt-1180x0820-vp.png` · app/globals.css:558 .nk-nav-links (gap:clamp(18px,3vw,52px);min-width:0;white-space:nowrap); app/globals.css:561 .nk-nav-cta
- *RB-01 · confidence 0.75 · measured*

### steps-phone

**RSP-347 · MEDIUM** — HIW sticky phone column is ~876px tall from top:120px — bottom of phone + step counter never fully visible on ≤820px-tall desktops (1121–3840px, locales: en, lt; window height ≤ ~880px (1366×768, 1440×810, 1280×720))

- **What:** At ≥1121px the synced phone is sticky at top:120px (globals.css:1641) with a fixed 340×700 aspect frame (:1649) plus a 26px margin and the '1 / 4 · …' step counter (~30px): total ≈ 876px below the sticky offset. On mainstream short desktops (1366×768 is still a top-5 resolution; 1280×720 windows) the lower ~110-230px — including the entire step-count caption and the phone's CTA area — can never be on screen while the column is stuck; there is no height media query for it, although the same fold problem was solved for the listing bento with a (max-height:780px) and (min-width:981px) band (globals.css:1343).
- **Why:** The synced phone is the section's core explanatory device; permanently cropping its bottom (where the mock CTA lives) on common laptop folds undercuts the demo, and the codebase's own bento fix shows the intended standard.
- **Fix:** Add @media(min-width:1121px) and (max-height:820px){ .htw-right{top:88px} .htw-phone{width:280px} } (aspect-ratio keeps it proportional: 280×576 + caption ≈ 720px) mirroring the bento's short-fold band at globals.css:1343.
- **Evidence:** app/globals.css:1641 .htw-right{position:sticky;top:120px}; app/globals.css:1649 .htw-phone{width:min(340px,...);aspect-ratio:340/700}
- *RB-06 · confidence 0.75 · code-inferred*

### overlay-app-redirect

**RSP-349 · MEDIUM** — App-redirect bottom sheet caps at raw 92vh while the nav drawer already uses dvh (320–560px, state: redirect-open; locales: en, lt; short mobile viewports with expanded browser UI)

- **What:** At ≤560px the .nk-redirect-panel bottom sheet (opened from the nav download CTA and the owner 'Ikelti skelbima' mid-funnel CTA on this page) uses max-height:92vh (globals.css:1045). On mobile Safari/Chrome 100vh is the LARGE viewport, so with the URL bar expanded 92vh can exceed the visible height and push the sheet's top edge (close affordance) off-screen. The same codebase already solves this correctly for the nav drawer with 100dvh (globals.css:583), so the viewport-unit strategy is internally inconsistent; .nk-sheet (globals.css:933) shares the defect.
- **Why:** RB-06: full-height overlays must use svh/dvh deliberately. A QR/install sheet whose header scrolls out of the visible viewport on the most common mobile state (URL bar shown) is below the 2026 bar for a core install-funnel overlay.
- **Fix:** Change max-height:92vh to max-height:min(92dvh, calc(100dvh - 16px)) (or 92svh for stability) in app/globals.css:1045 and app/globals.css:933.
- **Evidence:** app/globals.css:1045 .nk-redirect-panel (max-height:92vh); app/globals.css:933 .nk-sheet (max-height:92vh)
- *RB-06 · confidence 0.7 · code-inferred*

### steps

**RSP-350 · MEDIUM** — ?role=owner deep link paints the renter content first, then swaps the whole steps/FAQ section post-mount (320–1920px, state: deep-link ?role=owner; locales: en, lt)

- **What:** role is initialised to 'renter' and the ?role=owner query (linked from the homepage earn card) is read in a mount effect, so deep-linked owners first see the renter toggle state, renter step titles, renter phone screen and renter FAQ, which then all swap after hydration. On the ≤1120 single-column layout the inline device and expanded step body also re-render, moving content under the user's thumb.
- **Why:** A visible full-section content swap on first paint is a CLS/flash defect on a designed entry path; 2026 practice is to resolve URL-driven state before first paint (server-side or pre-hydration).
- **Fix:** Read the role on the server (make the page accept searchParams and pass an initialRole prop), or gate the section's reveal until the one-shot URL read has run; alternatively keep the static shell but render the toggle/steps after the effect with a dimension-matched placeholder. app/components/HowItWorksScreen.tsx:32-45.
- **Evidence:** app/components/HowItWorksScreen.tsx:40 useEffect ?role=owner post-mount setRole
- *RB-18 · confidence 0.7 · code-inferred*

**RSP-351 · MEDIUM** — Step switch on ≤1120 unmounts the ~490px inline phone instantly — half-screen layout jump (320–1120px, state: base, step-switch; locales: en, lt)

- **What:** The inline device is conditionally mounted only on the active step (HowItWorksScreen.tsx:250 `{i === active && (<span className="htw-step__device">…)}`). The step TEXT reveal is animated via grid-template-rows (globals.css:1632), but the phone — ~490 CSS px tall at the 230px inline width (aspect 340/700 + margin) — appears/disappears with no transition. Tapping step 2 while step 1 is open removes ~490px above the tap point, so the row the user tapped leaps upward by more than half a phone viewport; tapping an earlier step pushes content down equally abruptly.
- **Why:** RB-18: JS/state-driven responsive swaps must not jump. On phones this is the page's primary interaction and the jump happens under the user's finger, breaking scroll position and inviting mis-taps; the polished text animation next to an unanimated 490px pop reads as broken.
- **Fix:** Move .htw-step__device inside .htw-step__reveal's animated grid row (it already auto-sizes), or give the device its own 0fr→1fr grid reveal, so total row height transitions; optionally compensate scroll position in onSelect.
- **Evidence:** `hiw/base-en-1120x0800-fp.png` · `hiw/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:1632 .htw-step__reveal (grid-rows transition); app/globals.css:1640 .htw-step__device
- *RB-18 · confidence 0.65 · code-inferred*

**RSP-352 · POLISH** — Phone mock renders in two container contexts but is sized by viewport media queries (1121–2560px, locales: en, lt)

- **What:** The same .htw-phone component renders (a) in the desktop synced rail .htw-right at 340px and (b) inline inside the active step (.htw-phone--inline, 230px) below 1120px — the size switch and the rail's visibility are driven by viewport @media (globals.css:1718-1727) and 100vw math, not by the width of the column the phone actually sits in. The repo has zero @container rules.
- **Why:** Named CQ migration target per the audit charter: two container contexts, viewport-sized. If the steps grid ratio or gutters change, the phone's fit must be re-tuned by hand at each breakpoint instead of following its column.
- **Fix:** Make .htw-right / .htw-step__device containment roots (container-type:inline-size) and size .htw-phone with cqw-based min() so both contexts share one rule; keep the current @media as fallback.
- **Evidence:** `hiw/base-lt-1280x0800-fp.png` · `hiw/base-lt-1121x0800-fp.png` · app/globals.css:1649 .htw-phone width:min(340px,calc(100vw - 2*var(--nk-gutter))); app/globals.css:1727 .htw-phone--inline{width:min(230px,100%)} inside @media(max-width:1120px)
- *RB-03 · confidence 0.9 · code-inferred*

**RSP-353 · POLISH** — Steps-section lead hardcodes 19px inline, defeating the page's --hero-lead 17px compact-skin token (320–560px, locales: en, lt)

- **What:** The role lead paragraph reuses class nk-hero-band__lead (sized by var(--hero-lead)) but pins fontSize:19/lineHeight:30px inline. At ≤560 the page retunes --hero-lead to 17px/27px for the hero lead, while this sibling lead stays 19px/30px — two lead sizes from one token system on the same phone screen, and the token override can never win against the inline style.
- **Why:** Double type system (token + inline literal on the same class) is exactly the RB-09 anti-pattern; it silently forks whenever --hero-lead is retuned.
- **Fix:** Replace the inline font sizing with a dedicated class (e.g. .htw-role-lead{font-size:19px} plus a ≤560 override) or reuse var(--hero-lead) in the inline style; keep alignment/max-width overrides only.
- **Evidence:** `hiw/base-lt-0560x0900-dpr2-fp.png` · app/components/HowItWorksScreen.tsx:97 inline style fontSize:19,lineHeight:'30px' on .nk-hero-band__lead; app/globals.css:1748 .htw-page{--hero-lead:17px;--hero-lead-lh:27px} at ≤560
- *RB-09 · confidence 0.9 · code-inferred*

**RSP-355 · POLISH** — .htw-step:hover wash is not gated on (hover:hover) — sticky highlight after tap on touch (320–1024px, locales: en, lt)

- **What:** `.htw-step:hover{background:var(--nk-surface-glass)}` (globals.css:1605) applies on touch devices, where the emulated hover sticks to the last-tapped step until the user taps elsewhere — so a second, stale highlight coexists with the is-active state. Nearly every other hover effect in the file is wrapped in @media(hover:hover) and (pointer:fine).
- **Why:** RB-13: hover styles must not leak to touch; a lingering glass wash on a previously tapped step misreports which step is active.
- **Fix:** Wrap the rule in @media(hover:hover) and (pointer:fine){…} matching the codebase convention (see globals.css:673 et al).
- **Evidence:** app/globals.css:1605 .htw-step:hover
- *RB-13 · confidence 0.85 · code-inferred*

**RSP-361 · POLISH** — Synced sticky phone (~772px incl caption) never fully fits on <=~890px-tall desktop windows (1121–2560px, state: base, hiw-sticky-mid; defect on viewports shorter than ~890px; worst at 620-700px tall)

- **What:** The desktop step-sync phone column is 700px of phone + 26px margin + ~46px step caption, stuck at top:120px. On a 1280x620 window only ~500px of the phone is in view while stuck (620 - 68 nav - 120 offset leaves 432px below the sticky top before the fold), so the mock screen's bottom CTA and the '1 / 4' caption are clipped for the whole scroll range; the section's sticky travel is also only ~130px because the left column (~900px) barely exceeds the phone column.
- **Why:** The page's core desktop interaction (click a step, watch the synced phone) partially loses its payoff on short laptop/external-monitor windows: the changing part of the mock (bottom CTA/pills) and the step counter sit below the fold. Height-responsive scaling of hero-scale props is standard 2026 practice.
- **Fix:** Add a height-gated size step, e.g. @media(min-width:1121px) and (max-height:760px){.htw-phone{width:280px}.htw-right{top:96px}} so the full phone + caption fit within short viewports (globals.css:1641/1649).
- **Evidence:** `hiw/hiw-sticky-mid-lt-1280x0620-vp.png` · `hiw/base-lt-1280x0620-vp.png` · `hiw/hiw-sticky-mid-lt-1121x0800-vp.png` · app/globals.css:1641 .htw-right{position:sticky;top:120px}; app/globals.css:1649 .htw-phone{width:min(340px,...);aspect-ratio:340/700}
- *RB-07 · confidence 0.7 · visual*

**RSP-362 · POLISH** — Expanded step body text has no measure cap — ~85ch lines at 1920px (1537–2560px, locales: en, lt)

- **What:** The intro lead is capped inline at 560px (HowItWorksScreen.tsx:97) but .htw-step__text is not: at 1920 the left grid column is ~875px (1.05fr of the 1920-cap container minus the 90px gap), leaving ~780px of 18px Sora for the active step's paragraph — roughly 82-86ch, over the 75ch wide-viewport prose guideline the rest of the page follows (.nk-head__sub 60ch, .nk-prose 65ch, FAQ capped at 1320px).
- **Why:** Long unruled lines in the page's main explanatory copy read worse than every sibling text block that is deliberately capped; inconsistent measure discipline at ultrawide.
- **Fix:** Add max-width:62ch to .htw-step__text (app/globals.css:1635), matching the 560px inline cap on the lead.
- **Evidence:** `hiw/hiw-sticky-mid-lt-1920x1080-vp.png` · `hiw/base-lt-1440x0900-fp.png` · app/globals.css:1635 .htw-step__text (no max-width)
- *RB-04 · confidence 0.7 · code-inferred*

### steps+cta

**RSP-356 · POLISH** — Phone mock, AppCtaBanner and FeatureBand each render in ≥2 container contexts but size via viewport @media (zero @container in repo) (320–1920px, locales: en, lt)

- **What:** (1) .htw-phone renders in the desktop sticky rail (~340px context) and inline inside a step body (230px via a max-width:1120 viewport rule) — the inline variant needs its own font/padding overrides (.htw-phone--inline .htw-ps-cta) because the sizing key is the viewport, not the box. (2) .nk-appcta is shared by home and HIW under different section paddings and switches to its stacked form on viewport ≤1120. (3) FeatureBand's .nk-row card ladder (3→2@900→1@768) is viewport-keyed though the band renders under different page caps. grep confirms 0 @container rules repo-wide.
- **Why:** Container-query candidacy per RB-03: componentizing these on @container would delete the paired viewport overrides and remove seam risk when the components are reused in a new context.
- **Fix:** Give .htw-right/.htw-step__device, the AppCtaBanner wrapper and the FeatureBand row container-type:inline-size and move the variant rules to @container thresholds (e.g. phone mock compact <300px; appcta stacked <760px container).
- **Evidence:** `hiw/base-lt-0700x0900-dpr2-fp.png` · `hiw/base-lt-1440x0900-fp.png` · app/globals.css:1650 .htw-phone{width:min(340px,calc(100vw - 2*var(--nk-gutter)))}; app/globals.css:1728 @media(max-width:1120px) .htw-phone--inline{width:min(230px,100%)}
- *RB-03 · confidence 0.85 · code-inferred*

### faq

**RSP-358 · POLISH** — Open FAQ answer runs ~100ch measure at 1000–1120 (full container width) (981–1120px, locales: en, lt)

- **What:** The expanded first FAQ row's answer paragraph spans the full ~990px inner width of the container at 1119 ('Taip. Ieškoti ir peržiūrėti…' renders as two ~115ch lines). No max-width is applied to the answer text.
- **Why:** RB-04: prose measure should stay ≤75ch; long single lines hurt scanability of trust-critical answers (fees, deposits).
- **Fix:** Add max-width:72ch to the FAQ answer paragraph (shared Faq in sections.tsx / .nk-faq answer rule near app/globals.css:800).
- **Evidence:** `hiw/base-lt-1119x0800-fp.png` · app/globals.css:800 .nk-faq
- *RB-04 · confidence 0.75 · visual*

### steps-toggle

**RSP-359 · POLISH** — ?role=owner deep link flashes renter content for one paint (post-mount effect swap) (320–3840px, state: ?role=owner deep link; locales: en, lt)

- **What:** HowItWorksScreen.tsx:40-45 reads ?role=owner in a useEffect after mount (deliberate, to keep SSG + avoid hydration mismatch), so visitors following the homepage earn-card link see the renter steps/toggle for the first paint before the owner content swaps in — steps, lead, toggle thumb and phone screen all flip.
- **Why:** A visible content swap on arrival undermines the deep link's promise; minor because it is one frame on fast devices, but it also resets StepList spine measurement mid-entrance.
- **Fix:** Keep SSG but hide the flash: read location in a useLayoutEffect (runs before paint on the client — still after hydration, eliminating the visible flip), or make /kaip-tai-veikia?role=owner a distinct prerendered variant via generateStaticParams-style segment (e.g. /kaip-tai-veikia/nuomotojui).
- *RB-18 · confidence 0.7 · code-inferred*

### cta-banner

**RSP-360 · POLISH** — App CTA panel at 769–1120 strands ~55% of the panel as empty gradient (769–1120px, locales: en, lt)

- **What:** At ≤1120 the panel hides the phone art and stacks copy → badges → QR, all left-aligned; at 1119 the copy block is ~560px and the QR ~180px wide inside a ~1055px panel, leaving the right ~55% pure gradient with nothing anchoring it. The stack is deliberate (CSS comment), but between ~900 and 1120 the emptiness reads as a missing asset rather than negative space.
- **Why:** RB-04/RB-24: an install CTA is the page's conversion moment; at common tablet-landscape/small-laptop widths it looks half-loaded next to the balanced >1120 composition.
- **Fix:** At 901–1120 either keep a slimmed phone image (right-anchored, ~35% width) or move the QR column beside the copy (two-column flex) so the panel reads composed; anchor: app/globals.css:1732-1736.
- **Evidence:** `hiw/base-lt-1119x0800-fp.png` · app/globals.css:1732 .nk-appcta (≤1120 stack); app/globals.css:1733 .nk-appcta__phone display:none
- *RB-04 · confidence 0.7 · visual*

**RSP-363 · POLISH** — App CTA banner H2 wraps raggedly at 1121-1280 (single-word first line) (1121–1300px, state: base, hiw-owner-s4)

- **What:** In the gradient CTA banner the display heading breaks unevenly at 1121-1280px: renter LT renders 'Pasiruošę / rezervuoti? Tęskite / programėlėje' and the owner variant 'Pasiruošę / išnuomoti? / Įkelkite skelbimą / programėlėje' — a one-word first line above much longer lines. At 1440 the same headings break cleanly into two balanced lines.
- **Why:** A ragged 3-4 line display heading with a stranded first word on the page's conversion banner looks unfinished next to the otherwise balanced hero; text-wrap:balance is the 2026-standard fix for exactly this.
- **Fix:** Add text-wrap:balance to the .nk-appcta heading (and consider it for other display H2s); alternatively keep the two question/imperative sentences together with a span + white-space:nowrap on 'Pasiruošę rezervuoti?' / 'Pasiruošę išnuomoti?'.
- **Evidence:** `hiw-owner/base-lt-1280x0800-fp.png` · `hiw/base-lt-1280x0800-fp.png` · `hiw/hiw-owner-s4-lt-1121x0800-fp.png` · app/globals.css:1694 .nk-appcta (title column ~50% width; no text-wrap:balance)
- *RB-10 · confidence 0.7 · visual*


---

## 7. Legal center (/teisine + naudojimosi-salygos, privatumo-politika, paskyros-trynimas)

*Hub + 3 documents at all widths (tables boundary 700/701, TOC boundary 1180/1181, cells 420/421), TOC drawer states incl. 844×390, progress states; 30 substantiated findings (3 HIGH · 11 MEDIUM · 16 POLISH).*

**The mobile table transform is the site's worst reading defect**: ≤700 px the stacked-card transform promotes every inline node to a grid item, shattering "Skaitykite 4 ir 6 skyriuose" into four rows with the link numbers floating alone (RSP-365, verified at 700 px). On laptops, the sidebar TOC is withheld across 981–1180 despite fitting — users get the FAB+drawer while the right margin sits dead (RSP-367) — and the left-anchored "Turinys" FAB occludes reading-column line starts, covering the SVARBU warning at 1024×768 (RSP-366). The drawer's own header scrolls away (panel is the scroller); short-viewport TOC links drop to ~37 px; fixed chrome applies bottom insets only ≤680 so landscape phones get FABs without insets. Documents are extremely long at phone widths (≥19 screens at 390 px) — the progress bar + TOC carry the burden and mostly succeed; 420/421 cell collapse verified clean.

### All findings — Legal center

### table

**RSP-365 · HIGH** — ≤700px legal table cards shatter cell phrases: each inline link/text run becomes its own grid item (320–700px)

- **What:** At ≤700px .nk-lg-td becomes a 2-column grid (label / value), but the td's children are the bare inline nodes emitted by <Inline> (link, text run, link, text run). Every anonymous run and <a> becomes a separate grid item, so the wayfinding cell "4 ir 6 skyriuose" renders as three stacked grid rows: [Skaitykite | 4], [ir | 6], [skyriuose | —]; "3 skyriuje" renders as [Skaitykite | 3] with "skyriuje" orphaned on the next row under the label column. Every row of the "Kur rasti svarbiausią informaciją" table with mixed link+text content is scrambled. At 701px the normal table renders the same cells correctly inline ("3 skyriuje").
- **Why:** The terms-of-use wayfinding table is unreadable/garbled on every phone width (≤700 covers virtually all portrait phones). A flagship marketplace would never ship a legal navigation table whose reading order is destroyed by the responsive transform; it also breaks the semantic phrase for screen-reader-adjacent visual users.
- **Fix:** In app/components/legal/Blocks.tsx:96-98 wrap the cell content in a single element: <td className="nk-lg-td" data-label=...><span><Inline text={c} locale={locale}/></span></td>, so the ≤700 grid always has exactly two items (::before label + content span). No CSS change needed; verify the [data-label=""] block-mode cells still render.
- **Evidence:** `legal-terms/base-lt-0700x0900-dpr2-fp-tile4.png` · `legal-terms/base-lt-0701x0900-dpr2-fp-tile4.png` · app/components/legal/legal.css:256 .nk-lg-td (display:grid; grid-template-columns:minmax(96px,36%) minmax(0,1fr)); app/components/legal/Blocks.tsx:96 <td className="nk-lg-td"><Inline text={c}/></td>
- *RB-01 · confidence 0.97 · measured · verified (orchestrator re-check: shot + code)*

### fab-toc

**RSP-366 · HIGH** — Left-aligned Turinys/Contents FAB occludes reading-column line starts; covers SVARBU warning at 1024×768 (681–1180px, locales: en, lt; worst at short viewports (390–768); present at all)

- **What:** The fixed TOC FAB (left:24px, bottom:24px, ~113×46px LT / ~123×46px EN) sits directly over the left-aligned article column, whose text starts at x≈49–64 in the whole 681–1180 band. At every scroll position the first ~90–130px of the bottom 2 lines is hidden: at 1024×768 it covers 'Platformoje…' → '…je gali būti'; at 1120 EN it hides words in 'governed by Platform functions'; at 1024×600 it covers 'susijusias paslaugas'; at 980 it covers the bolded run-in 'Veiklos Lietuvoje apimtis'. On account-deletion at 1024×768 the initial (scroll-0) viewport has the FAB sitting on the amber warning callout, obscuring its 'SVARBU' label and the start of 'Per 30 dienų galite atšaukti trynimą…'. The 96px shell bottom reserve that keeps end-of-document content clear of the FABs only applies ≤680px, so in 681–1180 the fixed pair also overlaps the final content/footer at max scroll.
- **Why:** A persistent overlay on the first words of body lines of a legal document — and over an irreversibility warning at the landing viewport — is a direct readability defect visible to every reader at mainstream laptop/tablet widths; 2026 practice floats chrome over margins, not over the text measure.
- **Fix:** Either fix the band via the RB-04 finding (sidebar ≥~1040 removes the FAB there) and for the remaining 681–~1040 band move the FAB to the right edge stacked above .nk-lg-totop (right:24px, bottom:82px) so it floats over the empty right margin; alternatively keep it left but extend the legal.css:272 bottom reserve to the full FAB band (≤1180) and add scroll-margin so callouts never land under it.
- **Evidence:** `account-deletion/base-lt-1024x0768-fp.png` · `legal-terms/base-lt-1024x0768-vp.png` · `legal-terms/base-en-1120x0800-vp.png` · app/components/legal/legal.css:207 .nk-lg-fab-toc{ position:fixed; left:24px; bottom:24px; }; app/components/legal/legal.css:272 .nk-lg-shell bottom reserve (padding-bottom:96px) exists only inside @media (max-width:680px)
- *RB-07 · confidence 0.95 · measured*

**RSP-374 · MEDIUM** — Safe-area insets gated by width ≤680, so landscape phones (844×390) get FABs without insets (681–1024px, locales: en, lt; landscape phones (≈390–430px tall))

- **What:** env(safe-area-inset-bottom) for .nk-lg-fab-toc/.nk-lg-totop is applied only in the ≤680px width query, but a landscape iPhone (844×390, captured) is 844px wide: both fixed buttons fall back to bottom:24px with no bottom inset (home indicator ≈21px in landscape) and no env(safe-area-inset-left/right) even though landscape is exactly when the 47px side insets exist — the FAB at left:24px can sit inside the sensor-housing/rounded-corner zone.
- **Why:** RB-08 requires safe-area completeness on every fixed element including landscape left/right; width-based gating is the classic way landscape phones slip through.
- **Fix:** Move the inset math onto the base rules: .nk-lg-fab-toc{ left:calc(24px + env(safe-area-inset-left,0px)); bottom:calc(24px + env(safe-area-inset-bottom,0px)); } and mirror right/bottom on .nk-lg-totop; keep the ≤680 query only for the size/offset changes.
- **Evidence:** `legal-terms/base-lt-0844x0390-dpr2-vp.png` · app/components/legal/legal.css:197 .nk-lg-totop{ right:24px; bottom:24px } (no env()); app/components/legal/legal.css:207 .nk-lg-fab-toc{ left:24px; bottom:24px } (no env())
- *RB-08 · confidence 0.75 · code-inferred*

### toc

**RSP-367 · HIGH** — Sidebar TOC hidden across 981–1180 despite fitting; laptops get FAB+drawer and dead right margin (981–1180px, locales: en, lt; all heights; observed at 600, 768, 800, 834)

- **What:** The 981–1180 media query (legal.css:238–242) is byte-identical to the ≤980 one: it collapses .nk-lg-body to 1 column, hides .nk-lg-toc and shows the mobile FAB. But the sidebar layout needs only 620px article + 264px TOC + 36px gap + ~118px padding ≈ 1040px, so at 1024–1180 (1024×768, 1112×834 iPad Pro landscape, 1119/1120) the 720px-capped article sits with ~250–400px of empty right margin while section navigation is relegated to a bottom-left FAB + full-screen drawer. The in-file comment at line 247 still describes a '981–1120 sidebar band', i.e. the current cutoff looks like an unintended regression, not a decision. At 1280/1366 the sidebar renders normally.
- **Why:** Mouse/laptop users at the single most common laptop widths lose persistent wayfinding on 27k–40k-px-tall legal documents and must open a modal drawer instead; the stranded 300px margin next to a 720px column reads as broken utilization, not a deliberate reading cap. 2026 flagship legal centers (Stripe, Airbnb) keep a sticky TOC whenever it fits.
- **Fix:** Merge the two identical queries into one @media (max-width:~1039px) and let the sidebar grid apply from ~1040px up (optionally narrowing --lg-read or the 264px TOC column in the 1040–1180 band); delete the stale comment at legal.css:247 or restore the band it documents.
- **Evidence:** `legal-terms/base-lt-1024x0768-vp.png` · `legal-terms/base-lt-1119x0800-vp.png` · `legal-terms/base-en-1120x0800-vp.png` · app/components/legal/legal.css:238 @media (max-width:1180px) and (min-width:981px) hides .nk-lg-toc; app/components/legal/legal.css:233 @media (max-width:980px) identical body (duplicate rule)
- *RB-04 · confidence 0.9 · measured*

**RSP-379 · POLISH** — Legal TOC hidden via two adjacent media blocks with identical bodies (320–1180px, locales: en, lt)

- **What:** legal.css:233 (≤980) and legal.css:238 (981-1180) carry byte-identical declarations (hide sidebar TOC, show fab). They could be a single max-width:1180px block; the synthetic 980/981 seam exists only in source.
- **Why:** Duplicate blocks invite drift — a future edit to one branch silently forks behavior at an invisible seam.
- **Fix:** Merge into @media (max-width:1180px){…} and delete legal.css:238-242.
- **Evidence:** app/components/legal/legal.css:233-237 (max-width:980); app/components/legal/legal.css:238-242 (981-1180, byte-identical declarations)
- *RB-01 · confidence 0.95 · code-inferred*

**RSP-380 · POLISH** — legal.css carries two adjacent media blocks with byte-identical declarations (980 split at a synthetic seam) (320–1180px, locales: en, lt)

- **What:** Seam S4 CONFIRMED benign no-op. legal.css:233 (≤980) and legal.css:238 (981-1180) both set .nk-lg-body 1-col, hide .nk-lg-toc, show .nk-lg-fab-toc — identical bodies that could be one @media(max-width:1180px) block. Verified byte-identical at the cited lines.
- **Why:** The split invites drift: an edit to one branch and not the other creates a real 980/981 behavior seam later.
- **Fix:** Merge into a single @media (max-width:1180px) block at legal.css:233; delete lines 238-242.
- **Evidence:** app/components/legal/legal.css:233 max-width:980; app/components/legal/legal.css:238 (max-width:1180) and (min-width:981) — identical declarations
- *RB-01 · confidence 0.95 · code-inferred*

**RSP-385 · POLISH** — Sticky legal TOC height uses raw 100vh and a 110px magic number (1181–3840px, locales: en, lt)

- **What:** The sidebar TOC max-height is calc(100vh - 110px) — raw vh (desktop-only so low risk) and a hardcoded 110 instead of the nav tokens its own sticky top uses (calc(var(--nk-nav-h-scrolled) + 16px) at the same line). If --nk-nav-h-scrolled changes, top and max-height drift apart.
- **Why:** Unit/token inconsistency inside one declaration block; dvh + token math keeps the scroller honest on short windows.
- **Fix:** legal.css:73 — max-height:calc(100dvh - var(--nk-nav-h-scrolled) - 42px) (or equivalent token math).
- **Evidence:** app/components/legal/legal.css:73 .nk-lg-toc{max-height:calc(100vh - 110px)}
- *RB-06 · confidence 0.8 · code-inferred*

**RSP-391 · POLISH** — Sticky sidebar TOC sizes itself with 100vh; on iPad-class browsers the list bottom can sit under the URL bar (1181–1920px, locales: en, lt; tablets/laptops with dynamic browser chrome)

- **What:** The scrollable sticky TOC caps at calc(100vh - 110px). The sidebar renders from 1181px up, which includes iPad Pro landscape (1366×1024) Safari where 100vh is the largest viewport: with the URL bar expanded, the TOC's bottom rows and its bottom-fade cue extend below the visible viewport. The mobile drawer already uses 100dvh correctly (legal.css:217), so this is the one remaining raw-vh sizing on the surface (plus the inert min-height:100vh at legal.css:23).
- **Why:** RB-06: stable/dynamic viewport units should be chosen deliberately on anything viewport-sized; svh here keeps the 'you are here' list fully visible on tablet browsers.
- **Fix:** legal.css:73 → max-height:calc(100svh - 110px) (or dvh).
- **Evidence:** `privacy/base-lt-1366x0768-vp.png` · app/components/legal/legal.css:73 .nk-lg-toc{ max-height:calc(100vh - 110px) }
- *RB-06 · confidence 0.7 · code-inferred*

### nav

**RSP-368 · MEDIUM** — Legal doc breadcrumb omits the /teisine hub level, so <=680 it collapses to a lone 'Pagrindinis' chip (320–680px)

- **What:** DocumentScreen.tsx:62 passes items={[{ label: doc.meta.title }]} - trail is Home > [current] with no 'Teisine informacija' hub crumb. Because the shared <=680 rule hides the current-page chip (globals.css:1077-1078), the whole breadcrumb row on legal-terms at 390 renders as a single 'Pagrindinis' link occupying a full ~44px chrome row. Listing detail at the same width keeps a 3-link trail (Pagrindinis > Nuomojami daiktai > Elektronika ir technologijos), so the same component delivers full wayfinding on one page and none on another.
- **Why:** Mobile users on a legal doc lose the one-tap path back to the policy-center hub (/teisine) that the site's own IA defines; cross-page the breadcrumb system feels inconsistent (rich trail on detail/subcat, dead-end home link on legal). Also diverges from the BreadcrumbList completeness practice used elsewhere on the site.
- **Fix:** In app/components/legal/DocumentScreen.tsx:62 pass items={[{ label: t.hubTitle, href: localized '/teisine' }, { label: doc.meta.title }]} so <=680 shows Pagrindinis > Teisine informacija; mirror the hub level in the page's breadcrumb JSON-LD if emitted.
- **Evidence:** `legal-terms/base-lt-0390x0844-dpr2-vp.png` · `detail-full/base-lt-0390x0844-dpr2-vp.png` · app/globals.css:1077 @media(max-width:680px) .nk-crumbs [aria-current="page"]{display:none}
- *RB-24 · confidence 0.95 · measured*

### mbar / backtotop / legal FABs / legal drawer

**RSP-369 · MEDIUM** — Fixed bottom bars and FABs handle only safe-area-inset-bottom; left/right insets missing in landscape (660–980px, state: base, legal-toc-drawer; locales: en, lt; landscape phones (notch on left/right; inset ~47-59px on notched iPhones))

- **What:** Every fixed-chrome element except the lightbox guards only the bottom inset: .nk-mbar spans left:0/right:0 with 20px horizontal padding, so in landscape on a notched phone the '20 EUR / diena' price block or the Rezervuoti CTA sits inside the ~47px sensor/corner exclusion zone; .nk-backtotop (right offset 16-32px), the legal Turinys FAB and to-top FAB (16px offsets), and the left-anchored legal TOC drawer (items at 12px padding) have the same gap. The gallery lightbox already implements the correct pattern (padding-left/right:max(clamp(...),env(safe-area-inset-left/right)), globals.css:1278-1280), so this is an inconsistency, not a missing capability.
- **Why:** RB-08: landscape phone users get the booking CTA and FABs partially under the notch/rounded-corner zone; iOS also dims content in the inset band. A conversion-critical Rezervuoti button should never sit in the exclusion zone.
- **Fix:** Add padding-left/right:max(20px, env(safe-area-inset-left/right)) to .nk-mbar (globals.css:1335); right:max(clamp(16px,4vw,32px), env(safe-area-inset-right)) to .nk-backtotop and the legal FABs; padding-left:env(safe-area-inset-left) to .nk-lg-drawer__panel. Mirror the lightbox recipe.
- **Evidence:** `detail-full/base-lt-0915x0412-vp.png` · `legal-terms/legal-toc-drawer-lt-0844x0390-dpr2-vp.png` · app/globals.css:1335 .nk-mbar (padding:14px 20px calc(14px + var(--nk-safe-bottom)) — no left/right env); app/globals.css:965 .nk-backtotop (right:clamp(16px,4vw,32px) — no env right)
- *RB-08 · confidence 0.85 · code-inferred*

### related

**RSP-370 · MEDIUM** — Related-docs contact card dangles half-width in row 2 of the fixed 2-col grid on every document (701–1920px, locales: en, lt)

- **What:** The related grid always holds exactly 3 items (2 sibling docs + contact), so in the fixed 1fr 1fr template the taller multi-line contact card ('Turite klausimų…' / questions+CTA) lands alone in row 2 column 1 with an equal-width empty hole to its right — on all three documents, everywhere above the 560px 1-col fallback. This is a structural (item-count) imbalance, not a partial last grid row of a variable feed.
- **Why:** A permanently half-empty closing row is the last thing a reader sees before the footer of every legal page; a designer would span or rebalance it before a flagship release.
- **Fix:** Give the contact card its own full-width row: .nk-lg-related__contact{ grid-column:1 / -1; } (optionally switch it to a horizontal layout at that width), or make the grid 3 columns ≥~900px so all three cards share one row.
- **Evidence:** `account-deletion/base-lt-1024x0768-fp.png` · app/components/legal/legal.css:178 .nk-lg-related__grid{ grid-template-columns:1fr 1fr }; app/components/legal/legal.css:185 .nk-lg-related__contact
- *RB-02 · confidence 0.85 · visual*

### footer

**RSP-371 · MEDIUM** — Footer 4-col grid engages at 1025px but is too tight until ~1200px: every link wraps 2 lines (1025–1200px, locales: en, lt)

- **What:** At 1112 and 1120px the desktop footer grid (grid-template-columns:1.4fr 1.75fr .7fr .85fr, gaps 48px 56px) gives the Miestai column ~122px and Pagalba ~148px of content width. Every city link ('Nuoma Vilniuje'...'Nuoma Panevezyje' / 'Rentals in Vilnius'...) wraps to 2 lines, the 'Pagalba ir taisykles' heading wraps, and Kategorijos labels ('Fotografija ir video', 'Namai ir sodas') wrap — right after the 1024px seam where the 2-col layout rendered every one of these on a single line comfortably.
- **Why:** A width ladder that switches to its densest column count exactly where it has the least room reads as broken next to the tidy 1024 layout; leading 2026 marketplaces keep footer link lists single-line through the seam. LT strings are long, so the LT default locale is hit worst.
- **Fix:** Move the 4-col engage point up (e.g. @media(min-width:1200px) for the 4-col template, keeping the 1fr 1fr layout through 1025–1199), or relax the fractions (e.g. 1.3fr 1.6fr .95fr 1fr) and drop column-gap to 40px at globals.css:866/909 so .7fr never computes below ~170px.
- **Evidence:** `teisine/base-lt-1112x0834-fp.png` · `teisine/base-en-1120x0800-fp.png` · `teisine/base-lt-1024x0768-fp.png` · app/globals.css:866 .nk-footer__top; app/globals.css:909 @media(max-width:1024px) .nk-footer__top
- *RB-02 · confidence 0.85 · measured*

**RSP-390 · POLISH** — Footer category sub-columns squeeze to ~110px in the 561-680 band; LT labels wrap 2-3 lines (561–680px)

- **What:** Between the 560 single-column skin and wider tablet room, the footer keeps the 1fr 1fr grid with Kategorijos split into two sub-columns. At 600px each sub-column is ~110-120px, so 'Fotografija ir video', 'Irankiai ir statyba', 'Sportas ir laisvalaikis', 'Namai ir sodas' wrap 2 lines and 'Garsas, muzika ir renginiu technika' wraps 3 lines, while the Miestai column beside them stays airy.
- **Why:** The compact skin should compress proportionally; a band where one column triple-wraps while its neighbor has slack reads ad-hoc rather than systematic.
- **Fix:** Extend the single-column .nk-footer__top rule from max-width:560px to ~max-width:680px, or stack .nk-footer__catgrid to one sub-column below 680px (globals.css:869-874).
- **Evidence:** `teisine/base-lt-0600x0960-dpr2-fp.png` · `teisine/base-lt-0560x0900-dpr2-fp.png` · app/globals.css:869 .nk-footer__catgrid; app/globals.css:915 @media(max-width:560px) .nk-footer__top
- *RB-24 · confidence 0.75 · visual*

### fab-chrome

**RSP-372 · MEDIUM** — Legal fixed chrome handles only safe-area-bottom (and only ≤680px) — no left/right insets, none at 681–980 (320–980px, state: base, toc-drawer; locales: en, lt; landscape phones; also 681–980 band lacks safe-area-bottom)

- **What:** The floating 'Turinys' FAB (left edge) and back-to-top (right edge) add env(safe-area-inset-bottom) only inside the ≤680px rule; in the 681–980px band (landscape phones, small tablets) they sit at bottom:24px with no inset. Neither button nor the left-anchored TOC drawer panel applies env(safe-area-inset-left/right), so on notched phones in landscape the FAB/drawer content can sit under the sensor-housing inset.
- **Why:** RB-08 requires safe-area completeness on every fixed bar/drawer edge, including landscape left/right. Landscape phone reading of long legal docs is a normal use (681–980 width band is exactly landscape-phone territory).
- **Fix:** In legal.css: base the FAB/totop offsets on max(24px, env(safe-area-inset-bottom)) and add env(safe-area-inset-left)/(right) to .nk-lg-fab-toc / .nk-lg-totop at all widths, not just ≤680; add padding-left:calc(22px + env(safe-area-inset-left)) to .nk-lg-drawer__panel.
- **Evidence:** `legal-terms/base-lt-0700x0900-dpr2-fp-tile2.png` · app/components/legal/legal.css:197 .nk-lg-totop{right:24px;bottom:24px}; app/components/legal/legal.css:207 .nk-lg-fab-toc{left:24px;bottom:24px}
- *RB-08 · confidence 0.85 · code-inferred*

### legal-toc-drawer

**RSP-373 · MEDIUM** — Legal TOC drawer drops link targets from 44px to ~31px on short (landscape touch) viewports (660–980px, state: legal-toc-drawer; locales: en, lt; <=620px tall — i.e. exactly the landscape-phone band, which is always touch)

- **What:** At max-height:620px the drawer's TOC links lose their min-height:var(--nk-tap) (44px) and become padding-block:8px with ~15px text = roughly 31px tall, with no compensating spacing. Short viewports in this width band are landscape phones — touch devices — so the compaction removes compliant targets precisely where they are needed. The drawer is internally scrollable, so the height saving is not required for reachability.
- **Why:** WCAG 2.5.8 / platform HIG 44px minimum; a 31px row in a 33-item scrollable list invites mis-taps on adjacent sections of a legal document.
- **Fix:** Delete the min-height:0 override in legal.css:281 (keep the padding trim only down to min-height:40px), or gate the compaction on (hover:hover) and (pointer:fine).
- **Evidence:** `legal-terms/legal-toc-drawer-lt-0844x0390-dpr2-vp.png` · app/components/legal/legal.css:279-282 @media(max-height:620px){ .nk-lg-drawer__panel a{min-height:0;padding-block:8px} }; app/components/legal/legal.css:227 .nk-lg-drawer__panel a{min-height:var(--nk-tap)}
- *RB-12 · confidence 0.8 · code-inferred*

### toc-drawer

**RSP-375 · MEDIUM** — Short-viewport override drops drawer TOC links to ~37px tall, below the 44px house floor (320–980px, state: toc-drawer-open; locales: en, lt; viewport height <= 620px (all landscape phones, small phones))

- **What:** @media (max-height:620px) sets .nk-lg-drawer__panel a{min-height:0;padding-block:8px}. With 15px font x 1.4 line-height (~21px) + 16px padding, single-line TOC links measure ~37px tall with 6px flex gap — below --nk-tap:44px (the repo's own WCAG 2.5.8 token) precisely on landscape phones, which are always touch devices.
- **Why:** Touch targets shrink exactly in the orientation where they are hardest to hit; the rest of the site holds a 44px floor (globals.css:149 --nk-tap). Violates the project's own target-size contract and WCAG 2.5.8 best practice.
- **Fix:** In legal.css:281 keep min-height:40px (or var(--nk-tap)) and recover height by tightening panel padding/gap instead, e.g. .nk-lg-drawer__panel{gap:2px} — the panel already scrolls internally so item height need not shrink.
- **Evidence:** `legal-terms/base-lt-0320x0568-dpr2-vp.png` · app/components/legal/legal.css:278 @media (max-height:620px); app/components/legal/legal.css:281 .nk-lg-drawer__panel a{min-height:0;padding-block:8px}
- *RB-12 · confidence 0.75 · code-inferred*

**RSP-376 · MEDIUM** — Opening the TOC drawer sets body overflow:hidden with no scrollbar compensation → layout shift (701–1180px, state: drawer-open; locales: en, lt; any with visible scrollbar)

- **What:** LegalChrome.tsx:80 locks background scroll by setting document.body.style.overflow='hidden'. On Windows/Linux (classic ~15–17px scrollbars) — and the drawer serves the entire 701–1180 mouse band per the media queries — the scrollbar disappears on open, so the whole page (sticky nav, centered 720px column) shifts right ~15px behind the scrim and shifts back on close.
- **Why:** RB-23: overlays must lock background scroll without layout shift; a visible page jolt on a 40k-px legal doc every time the reader opens/closes contents is below the flagship bar.
- **Fix:** Add scrollbar-gutter:stable to html in globals.css, or compensate with body{padding-right:var(--removed-scrollbar-width)} while locked (measure window.innerWidth - documentElement.clientWidth before locking) in LegalChrome.tsx:74-93.
- **Evidence:** app/components/legal/LegalChrome.tsx:80 document.body.style.overflow = "hidden"
- *RB-23 · confidence 0.7 · code-inferred*

**RSP-377 · MEDIUM** — Mobile TOC drawer header (title + close button) scrolls away — panel is the scroller (320–1180px, state: drawer-open, toc-drawer-open; locales: en, lt; worst on short viewports (568) where terms' ~18-item TOC exceeds panel height)

- **What:** .nk-lg-drawer__panel is the overflow-y:auto container and .nk-lg-drawer__top (Contents title + CloseButton) is an ordinary first flex child, so on long docs (terms-of-use TOC ~18 links x ~44px ~ 800px vs 568px viewport) the close button scrolls out of view as the user browses sections. Only the bottom fade (::after) is sticky; the header is not.
- **Why:** RB-23 requires overlay headers pinned: once the user scrolls the TOC, the only visible dismissal is the scrim (undiscoverable) or Esc (no keyboard on touch). 2026 sheet/drawer patterns pin the title+close row.
- **Fix:** In legal.css make .nk-lg-drawer__top{position:sticky;top:0;background:var(--lg-elevated);z-index:1;margin:-24px -22px 14px;padding:24px 22px 10px} or restructure the panel (header fixed, links in an inner overflow-y:auto wrapper) — LegalChrome.tsx:117-131.
- **Evidence:** `legal-terms/base-lt-0320x0568-dpr2-vp.png` · app/components/legal/legal.css:217 .nk-lg-drawer__panel; app/components/legal/legal.css:224 .nk-lg-drawer__top
- *RB-23 · confidence 0.7 · code-inferred*

**RSP-392 · POLISH** — TOC drawer scroll lock uses body overflow:hidden without scrollbar-gutter compensation (981–1180px, state: toc-drawer; locales: en, lt)

- **What:** Opening the mobile TOC drawer sets body overflow:hidden with no scrollbar-width compensation. The drawer is shown up to 1180px, a band where desktop browsers with classic scrollbars are common — on those, opening/closing the drawer removes/restores a ~15px scrollbar and shifts the page and the centered 1280px shell.
- **Why:** RB-23: background scroll must lock without layout shift; the reading column visibly nudges behind the scrim on classic-scrollbar systems.
- **Fix:** Add scrollbar-gutter:stable to the root while locked, or compensate with body padding-right equal to (innerWidth - documentElement.clientWidth) in the same effect (LegalChrome.tsx:74-93).
- **Evidence:** app/components/legal/LegalChrome.tsx:80 document.body.style.overflow='hidden'
- *RB-23 · confidence 0.7 · code-inferred*

### fixed-chrome

**RSP-378 · MEDIUM** — Legal fixed chrome ignores horizontal safe-area insets; bottom inset only applied <=680px (320–980px, state: base, toc-drawer-open; locales: en, lt; landscape orientation on notched phones; any height at 681-980 width)

- **What:** Three gaps: (1) .nk-lg-fab-toc{left:16/24px} and .nk-lg-totop{right:16/24px} never add env(safe-area-inset-left/right), so in notched-phone landscape (inset ~44-59px) the FABs sit inside the sensor/corner zone; (2) the left-anchored .nk-lg-drawer__panel (top:0;bottom:0;left:0) has no padding-left:env(safe-area-inset-left), putting TOC link text under the notch in landscape-left; (3) env(safe-area-inset-bottom) is added to both FABs only inside @media (max-width:680px) — at 681-980px (where the FAB is still the only TOC access, legal.css:236) bottom stays a raw 24px.
- **Why:** RB-08 requires safe-area completeness on every fixed bar/drawer edge, left/right in landscape included; partially-inset chrome reads broken on 2026 flagship devices.
- **Fix:** Use inset-aware offsets unconditionally: .nk-lg-fab-toc{left:calc(16px + env(safe-area-inset-left));bottom:calc(24px + env(safe-area-inset-bottom))}, mirror for .nk-lg-totop right/bottom, and add padding-left:calc(22px + env(safe-area-inset-left)) to .nk-lg-drawer__panel.
- **Evidence:** `legal-terms/base-lt-0320x0568-dpr2-vp.png` · `legal-terms/base-lt-0700x0900-dpr2-fp-tile40.png` · app/components/legal/legal.css:197 .nk-lg-totop; app/components/legal/legal.css:207 .nk-lg-fab-toc
- *RB-08 · confidence 0.7 · code-inferred*

### hero

**RSP-381 · POLISH** — PageHead eyebrow duplicates the H1 verbatim in both locales, costing ~2 extra lines on phones (320–1120px, locales: en, lt)

- **What:** page.tsx:49-50 passes eyebrow={t.brandSub} and title={t.hubTitle}, and the dictionaries define both as the identical string ('Taisykles ir privatumas' lt.ts:826/842; 'Rules & privacy' en.ts:736/752). On <=390px the letter-spaced eyebrow wraps to two lines directly above the same two words repeated as the H1, spending ~120px of above-the-fold height on repetition (the codebase already hides the breadcrumb current-page chip <=680px for exactly this 'repeats the H1' reason, globals.css:1070-1075).
- **Why:** Redundant stacked headings dilute the compact skin's vertical rhythm and look like a templating slip; every other page pairs a distinct eyebrow with its H1.
- **Fix:** Give legal.brandSub distinct copy (e.g. 'Teisine informacija' / 'Legal') or drop the eyebrow prop on this page (app/[lang]/teisine/page.tsx:49).
- **Evidence:** `teisine/base-lt-0320x0568-dpr2-vp.png` · `teisine/base-lt-0375x0667-dpr2-vp.png` · `teisine/base-en-0900x1280-dpr2-fp.png` · app/globals.css:244 .nk-eyebrow; app/globals.css:260 .nk-h-page
- *RB-24 · confidence 0.95 · measured*

### cards

**RSP-382 · POLISH** — Hub doc-card titles/blurbs hardcode 20px/15.5px inline, outside the --nk-fs token system (320–1120px, locales: en, lt)

- **What:** page.tsx:64-65 sets fontSize:20 on card titles and fontSize:15.5/lineHeight:24px on blurbs as inline styles instead of the --nk-fs-card/--nk-fs-body tokens. The compact <=560 skin retunes tokens globally (e.g. .nk-eyebrow steps 18->17->16px in globals.css:1536/1844), but these cards are frozen at every band, so the hub is the one surface whose card type does not participate in the responsive type scale.
- **Why:** A parallel one-off type scale is exactly the double-system drift the token layer exists to prevent; future compact-skin tuning will silently skip this page.
- **Fix:** Replace the inline sizes at app/[lang]/teisine/page.tsx:64-65 with var(--nk-fs-row)/existing body classes (.nk-h-row + .nk-body) or add the card to the nk- class layer.
- **Evidence:** `teisine/base-lt-0320x0568-dpr2-fp.png` · `teisine/base-lt-1112x0834-fp.png` · app/globals.css:230 --nk-fs-h1 token block (fs token system the cards bypass)
- *RB-24 · confidence 0.9 · code-inferred*

**RSP-384 · POLISH** — Doc cards ship zero pointer feedback (no hover/active state) unlike every sibling card (1025–1120px, locales: en, lt)

- **What:** The three hub cards are inline-styled <Link>s (page.tsx:61-68) with no nk- class, so on hover:hover/pointer:fine devices they have no hover elevation, border shift, or arrow nudge, while nk-offer/nk-cat/nk-round elsewhere all animate under @media(hover:hover) gates. No information is hover-gated (good), but the primary actions on this page are the only dead-feeling cards in the system.
- **Why:** Interaction-state parity across pointer bands is part of the responsive contract; inert primary cards read as unfinished on desktop.
- **Fix:** Give the card a shared class (e.g. .nk-doccard) with the standard @media(hover:hover) and (pointer:fine) hover treatment plus :active scale, mirroring globals.css:673/744.
- **Evidence:** `teisine/base-lt-1112x0834-fp.png` · `teisine/base-en-1120x0800-fp.png` · app/globals.css:673 .nk-offer:hover (the pointer-feedback pattern siblings use)
- *RB-13 · confidence 0.85 · code-inferred*

### callouts+toc

**RSP-383 · POLISH** — 11px uppercase micro-labels ('TRUMPAI' callout label, TOC heading) sit below the ~12px flagship floor (320–1920px, locales: en, lt)

- **What:** The 13 'TRUMPAI'/'In brief' callout labels render at 11px uppercase with .15em tracking at every width (visible in shots; auto-metric minFontPx=11 on all legal captures); the sidebar TOC heading is also 11px at ≥1181.
- **Why:** 11px letterspaced uppercase is at the legibility edge on low-DPI screens; leading marketplaces keep persistent labels ≥12px. Minor but repeated 13× per document.
- **Fix:** Raise both to 12px (they are display-font, tracked uppercase — 12px keeps the hierarchy): legal.css:145 and :80.
- **Evidence:** `legal-terms/base-lt-0560x0900-dpr2-fp-tile39.png` · app/components/legal/legal.css:145 .nk-lg-callout__lbl{font-size:11px}; app/components/legal/legal.css:80 .nk-lg-toc__h{font-size:11px}
- *RB-24 · confidence 0.9 · measured*

### fixed-controls

**RSP-386 · POLISH** — Corner-fixed controls pad bottom safe-area but not left/right for landscape (320–980px, state: scrolled; locales: en, lt; landscape phones with viewport-fit=cover)

- **What:** Back-to-top (feed), legal to-top and the legal TOC fab all offset bottom with env(safe-area-inset-bottom) but keep bare 16-24px horizontal offsets. With viewport-fit=cover, landscape side insets are 47-59px, so these 44-46px circles sit partly inside the rounded-corner/home-indicator-side zone.
- **Why:** Same inset discipline the lightbox already applies (:1283-1284); corner controls half-clipped by the display radius look broken on 2026 hardware.
- **Fix:** Wrap the horizontal offsets in max(): e.g. right:max(clamp(16px,4vw,32px), env(safe-area-inset-right)) at globals.css:965; same for legal.css:197/207/273-275.
- **Evidence:** app/globals.css:965 .nk-backtotop{right:clamp(16px,4vw,32px)} (no safe-area-right); app/components/legal/legal.css:197 .nk-lg-totop{right:24px}
- *RB-08 · confidence 0.8 · code-inferred*

### toc sidebar / status screen

**RSP-387 · POLISH** — Remaining raw vh uses (legal TOC sidebar, legal root, status screen) should move to dvh/svh for consistency (320–1920px, locales: en, lt; mobile-affected only for the min-height uses; .nk-lg-toc is desktop-only)

- **What:** Three leftover raw-vh declarations: the sticky desktop TOC (calc(100vh - 110px) — harmless on desktop, slightly tall if a desktop browser docks bars), the legal root min-height:100vh, and .nk-statusmain min-height:62vh (on mobile 62lvh can push the footer below the visible viewport on 404/error pages). The rest of the codebase has standardized on dvh (nav drawer, bento).
- **Why:** Consistency of the viewport-unit policy; min-height:100vh on mobile creates a small dead scroll on short pages.
- **Fix:** s/100vh/100dvh/ and s/62vh/62dvh/ (svh where a stable floor is wanted).
- **Evidence:** `legal-terms/base-lt-0320x0568-dpr2-vp.png` · app/components/legal/legal.css:73 .nk-lg-toc{max-height:calc(100vh - 110px)}; app/components/legal/legal.css:23 min-height:100vh
- *RB-06 · confidence 0.8 · code-inferred*

### toc-sidebar

**RSP-388 · POLISH** — Legal uses raw 100vh (root min-height, sticky TOC max-height) instead of deliberate svh/dvh (1181–1920px, locales: en, lt; short laptop viewports)

- **What:** Two raw 100vh uses in legal.css. Impact is desktop-only (the TOC is hidden ≤1180 and the root is taller than any viewport), so no mobile URL-bar bug today — but the 110px magic number is also not derived from --nk-nav-h-scrolled, and any future reuse of .nk-lg-toc below 1181 would inherit the vh problem. The drawer correctly uses 100dvh.
- **Why:** RB-06 asks for deliberate svh/dvh choice; raw 100vh + magic offset is fragile even when currently harmless.
- **Fix:** Use 100svh (or 100dvh) and calc(100svh - var(--nk-nav-h-scrolled) - 2*16px) at legal.css:23/:73.
- **Evidence:** app/components/legal/legal.css:23 .nk-lg-root{min-height:100vh}; app/components/legal/legal.css:73 .nk-lg-toc{max-height:calc(100vh - 110px)}
- *RB-06 · confidence 0.8 · code-inferred*

### toc-fab

**RSP-389 · POLISH** — Legal 'Turinys' FAB uses raw bottom:24px (no safe-area) and covers line starts at 320px (320–1024px, locales: en, lt)

- **What:** The fixed TOC FAB is pinned left:24px;bottom:24px with no env(safe-area-inset-bottom) (unlike .nk-backtotop, globals.css:961, which adds it). On gesture-nav phones the home indicator zone (~34px) intersects it. At 320px wide it also permanently occludes the first ~140px of the bottom prose lines of a 76,000px-long document while reading.
- **Why:** Inconsistent safe-area handling across the site's FABs, and a bottom-LEFT FAB over left-aligned LTR prose hides sentence beginnings rather than ends — the higher-cost side.
- **Fix:** legal.css:207 — bottom:calc(24px + env(safe-area-inset-bottom)); left:max(24px,env(safe-area-inset-left)); consider auto-fading the FAB while the user scrolls (like 2026 reader UIs) since the doc is ~240 viewports long.
- **Evidence:** `legal-terms/base-lt-0320x0568-dpr2-vp.png` · `legal-terms/base-lt-0320x0568-dpr2-fp-tile1.png` · app/components/legal/legal.css:207 .nk-lg-fab-toc{left:24px;bottom:24px}
- *RB-08 · confidence 0.75 · code-inferred*

### tables

**RSP-393 · POLISH** — Legal table card-mode is keyed to viewport width while its container context varies — CQ candidate (320–700px, locales: en, lt)

- **What:** The table renders in two container contexts (full-width article <=1180px; 720px-capped article beside a 264px sidebar >=1180px) but its record-card transform triggers on viewport <=700px, and the CSS comment (legal.css:243-247) documents hand-tuning around the 981-1120 squeeze. The repo has zero @container; the duplicated identical media blocks at 233-237 and 238-242 are ladder-maintenance fallout of the same viewport coupling.
- **Why:** A container query on the .nk-lg-tablewrap (or article) would make the card switch track the actual reading-column width, deleting the special-case comments and the duplicated media pair.
- **Fix:** Add container-type:inline-size to .nk-lg-article and convert legal.css:248 to @container (max-width:~640px); merge the duplicate 233-242 blocks into one @media (max-width:1180px).
- **Evidence:** `privacy/base-lt-0320x0568-dpr2-fp-tile12.png` · app/components/legal/legal.css:248 @media (max-width:700px) table card-mode; app/components/legal/legal.css:68 .nk-lg-root[data-layout="a"] .nk-lg-body
- *RB-03 · confidence 0.65 · code-inferred*

### article

**RSP-394 · POLISH** — Section permalink target is 24px on touch widths above 680px (44px upgrade stops at 680) (681–700px, locales: en, lt)

- **What:** The @media (max-width:680px) block upgrades .nk-lg-anchor to a 44px (--nk-tap) target, but from 681px up through the tablet touch band it reverts to the 24x24px base — exactly WCAG 2.5.8 minimum, well under the 44-48px preferred size the rest of the band gets. Touch users at 681-1024px (small tablets, large phones) get the half-visible (opacity:.5) anchor with a 24px hit area.
- **Why:** Inconsistent target sizing across the touch band; the affordance is already de-emphasized on touch (opacity .5), and a 24px target next to a heading invites mis-taps into the heading text.
- **Fix:** Extend the 44px anchor sizing (legal.css:271) to the full touch range, e.g. move it into a @media (max-width:1024px) or (pointer:coarse) block.
- **Evidence:** `legal-terms/base-lt-0401x0844-dpr2-fp-tile0.png` · `account-deletion/base-lt-0360x0800-dpr2-vp.png` · app/components/legal/legal.css:97 .nk-lg-anchor{min-width:24px;min-height:24px}; app/components/legal/legal.css:271 .nk-lg-anchor 44px only <=680px
- *RB-12 · confidence 0.65 · code-inferred*


---

## 8. Invite (/invite)

*Bare, coded and wrapping-code states at all widths incl. 1119/1120/1121 (its 2-col split sits ON the nav collapse seam); 9 substantiated findings (5 MEDIUM · 4 POLISH).*

The 1120 min-width split + 1120 max-width nav collapse coexist at exactly 1120 px without visible conflict (probed) — fragile but currently safe. Benefit checklist items center individually, staggering check-icon left edges by up to ~130 px; the QR aside stretches its 0.75fr track (~455–637 px) around a fixed 172 px QR at 1440–1920; invite hides its scan-QR ≤560 while the sibling CTA banner hides it ≤768 — 561–768 handhelds are told to scan the device they hold (inconsistent capability assumption).

### All findings — Invite

### grid

**RSP-401 · MEDIUM** — Invite split starts at min-width:1120, overlapping the max-width:1120 collapse rules (1120–1120px, locales: en, lt)

- **What:** Every other min/max pair in the file uses the 1120/1121 convention (e.g. :lang(lt) hero at min-width:1121). The invite two-column split alone uses min-width:1120px, so at exactly 1120px the page renders the desktop split grid while the nav simultaneously shows the collapsed burger + drawer (max-width:1120 also true) and the HIW grid rules would also both apply on that page family.
- **Why:** At the shared boundary two 'modes' co-exist for 1 CSS px — visible on 1120-wide windows and at zoom levels that land there; it also breaks the codified ladder convention, inviting future drift.
- **Fix:** globals.css:1783 — change to @media(min-width:1121px) to match the 1120/1121 convention.
- **Evidence:** app/globals.css:1783 @media(min-width:1120px) .invite-cols split; app/globals.css:578 @media(max-width:1120px) nav collapse
- *RB-01 · confidence 0.95 · code-inferred*

**RSP-406 · POLISH** — Invite split uses min-width:1120 while the site ladder is 1121 — desktop layout + burger nav coexist at exactly 1120 (1120–1120px, locales: en, lt)

- **What:** Seam S1 CONFIRMED as a real off-by-one, low impact. Every other min/max pair at this cutline uses 1120/1121 (nav collapses ≤1120 at globals.css:578; LT hero sizing starts ≥1121 at globals.css:1450), but .invite-cols splits at min-width:1120 (globals.css:1783). At exactly 1120px the invite page shows its two-column desktop layout under the collapsed burger-nav chrome — a 1px-wide mixed state; no property double-applies to one element.
- **Why:** Inconsistent breakpoint semantics; harmless today but the kind of drift that produces real conflicts when either block grows.
- **Fix:** Change app/globals.css:1783 to @media(min-width:1121px).
- **Evidence:** app/globals.css:1783 @media(min-width:1120px) .invite-cols; app/globals.css:578 nav collapse @media(max-width:1120px)
- *RB-01 · confidence 0.95 · code-inferred*

### hero

**RSP-402 · MEDIUM** — Benefit checklist items center individually, staggering check-icon left edges up to ~130px (480–1119px, locales: en, lt)

- **What:** .invite-benefits is flex-column with align-items:center below 1120px, so each <li> centers as its own block. When line lengths differ, the BadgeCheck icons do not share a left edge: at 1024px li1 starts at ~x187 while li2/li3 start at ~x318 (~130px stagger); at 560px the offset is ~55px; at 673px and 768px the first (2-line) bullet juts far left of the two single-line bullets. Only at <=430px, where every bullet wraps to full width, do the edges happen to align.
- **Why:** A checklist whose bullets don't share a rail reads as misalignment, not centering — trust bullets are the core persuasion block of this install funnel, and every mid-band visitor (large phones through small desktop) sees the ragged version. 2026 marketplace bar: centered blocks, internally left-aligned lists.
- **Fix:** In app/globals.css:1769 keep the block centered but align items internally: `.invite-benefits{align-items:flex-start;width:fit-content;margin-inline:auto}` (the >=1120 override at :1784 already uses flex-start and needs no change).
- **Evidence:** `invite-code/base-en-1024x0768-fp.png` · `invite-bare/base-lt-0560x0900-dpr2-fp.png` · `invite-code/base-lt-0673x0841-dpr2-fp.png` · app/globals.css:1769 .invite-benefits; app/globals.css:1777 .invite-cols__main
- *RB-24 · confidence 0.95 · measured*

**RSP-403 · MEDIUM** — Invite hides its scan-QR only <=560px while the sibling app-CTA hides it <=768px; 561-768 handhelds get a scan-your-own-screen prompt (561–768px, locales: en, lt)

- **What:** The install QR + 'Nuskenuokite telefonu' / 'Scan with your phone' hint is displayed at 561-768px CSS widths (verified at 561, 673 and 768). Those widths are overwhelmingly handheld devices — large phones and foldable inner screens (Pixel Fold inner = 673px) — where the visitor cannot scan the screen they are holding. The codebase already encodes this exact rationale for the shared app-CTA banner, which drops its QR at <=768 (globals.css:1742 comment: 'on a phone you can't scan your own screen'), but the invite band's threshold is 560 (globals.css:1790).
- **Why:** Inconsistent device-affordance policy between two funnels on the same site: the primary conversion instruction on /invite for a foldable/large-phone user is one they physically cannot follow, while the badges that would work sit above it. Referral landings are disproportionately mobile.
- **Fix:** Change app/globals.css:1790 to `@media(max-width:768px){.invite-qr{display:none}}` to match the .nk-appcta__qr policy (CTA + store badges remain the path on those widths).
- **Evidence:** `invite-code/base-lt-0673x0841-dpr2-fp.png` · `invite-bare/base-lt-0561x0900-dpr2-fp.png` · `invite-bare/base-en-0768x1024-dpr2-fp.png` · app/globals.css:1790 @media(max-width:560px) .invite-qr; app/globals.css:1742 .nk-appcta__qr (hidden <=768 for the same reason)
- *RB-05 · confidence 0.9 · measured*

**RSP-404 · MEDIUM** — At 1440-1920px the aside glass card stretches to its .75fr track (~455-637px) around a fixed 172px QR (1440–1920px, locales: en, lt)

- **What:** The >=1120 split grid gives the aside `grid-template-columns:1.25fr .75fr`, and .invite-cols__aside stretches to fill its track. With nk-container capped at 1920px, the glass card measures ~455px wide at 1440w and ~632x290px at 1920w while its only content is a fixed 172px QR + one hint line (~27% width fill at 1920). The card reads as an empty panel with a small sticker in the middle; in the captured no-code state there is no code chip to help fill it.
- **Why:** Under-filled containers at wide viewports are the classic 'stretched, not designed' tell (RB-04 utilization). This is the page's visual anchor on desktop — a flagship marketplace would either cap the card or scale its content.
- **Fix:** Cap and center the aside: add `max-width:400px;justify-self:center` to .invite-cols__aside inside the min-width:1120px block (app/globals.css:1782), or scale the QR with the track (e.g. size prop ~200-220 at >=1440, or width:min(240px,60%) on the .nk-qr-card).
- **Evidence:** `invite-code/base-en-1920x1080-fp.png` · `invite-code/base-en-1440x0900-fp.png` · app/globals.css:1779 .invite-cols (min-width:1120px); app/globals.css:1782 .invite-cols__aside
- *RB-04 · confidence 0.85 · measured*

**RSP-405 · MEDIUM** — Shared .nk-hero-band h1 sizes by viewport (5.6vw clamp) in two different container contexts — CQ migration target (1120–1920px, locales: en, lt)

- **What:** The parametrized hero band renders in >=2 container contexts: (a) full-width centered column (How-it-works hero, and /invite below 1120 with --hero-title-mw:900px) and (b) the /invite >=1120 split where the h1 lives in a 1.25fr column (~625px at 1120w, ~1060px at 1920w). In both, type is sized by the viewport clamp(38px,5.6vw,68px), so at 1120w a ~63px headline is laid into a ~625px column (wraps to 3 lines, near line-count max) while the same viewport size one pixel narrower renders 2 centered lines in a 900px measure. The repo has zero @container rules.
- **Why:** Viewport-sized type in a half-width track is exactly the case container queries solve: the band cannot be reused in a new context (e.g. a narrower split) without re-tuning viewport clamps. 2026 practice is cqi-based sizing for components that ship in multiple layout slots.
- **Fix:** Make .nk-hero-band a container (`container-type:inline-size` on .invite-cols__main / the band inner) and express --hero-title in cqi, e.g. `clamp(38px, 9cqi, 68px)`, so the h1 tracks its actual column in both contexts.
- **Evidence:** `invite-code/base-en-1120x0800-fp.png` · `invite-code/base-lt-1119x0800-fp.png` · `invite-code/base-en-1920x1080-fp.png` · app/globals.css:1569 .nk-hero-band h1 (var(--hero-title)); app/globals.css:1764 .invite-hero (--hero-title:clamp(38px,5.6vw,68px))
- *RB-03 · confidence 0.85 · code-inferred*

**RSP-407 · POLISH** — EN headline dangles single words at phone widths: 'Rent' alone on line 1 at 320px, 'nearby.' alone at 390px (320–414px, locales: en)

- **What:** Despite text-wrap:balance, the EN headline 'Rent items from people and businesses nearby.' renders as 'Rent / items from / people and / businesses / nearby.' at 320px (one-word first line, 5 lines total) and 'Rent items from / people and / businesses / nearby.' at 390px (one-word last line). The LT headline wraps cleanly at the same widths (4 lines at 320, no dangles).
- **Why:** One-word lines on the page's display heading read as unpolished on the most common referral-landing devices; balance is being defeated by the long token 'businesses' constraining the measure.
- **Fix:** Either soften the EN copy (e.g. 'Rent from people and businesses nearby.') in app/lib/i18n/en.ts invite.titleGeneric, or lower the <=360 clamp floor (see the htw-page pattern at app/globals.css:1747) so 'Rent items' fits the first line.
- **Evidence:** `invite-code/base-en-0320x0568-dpr2-vp.png` · `invite-code/base-en-0320x0568-dpr2-fp.png` · `invite-wrap/base-en-0390x0844-dpr2-fp.png` · app/globals.css:1570 .nk-hero-band h1 text-wrap:balance; app/globals.css:1764 .invite-hero --hero-title clamp min 38px
- *RB-10 · confidence 0.9 · visual*

**RSP-408 · POLISH** — Invite split-columns activate at min-width:1120 while nav/htw collapse at max-width:1120 — both fire at exactly 1120px (1120–1120px, locales: en, lt)

- **What:** At exactly 1120px CSS width the invite page renders its desktop two-column funnel (.invite-cols grid) underneath the mobile burger nav; every other 1120-boundary rule in the system treats 1120 as the last mobile pixel (max-width:1120). Off-by-one against the codebase's own convention.
- **Why:** Seam-integrity hygiene: a device at exactly 1120 (or a desktop window snapped there) shows a mixed desktop/mobile chrome state; the design system's breakpoints should partition, not overlap.
- **Fix:** Change globals.css:1779 to @media(min-width:1121px) to match the 1120-inclusive-mobile convention used by the nav and .htw-grid.
- **Evidence:** app/globals.css:1779 @media(min-width:1120px) .invite-cols split; app/globals.css:574 @media(max-width:1120px) nav collapse
- *RB-05 · confidence 0.9 · code-inferred*

**RSP-409 · POLISH** — Invite skips the <=560 hero-title compression its sibling How-it-works band applies (38px floor vs 32px) (320–560px, locales: en, lt)

- **What:** Both pages share .nk-hero-band, but only .htw-page lowers --hero-title/--hero-lead at <=560 (globals.css:1746-1747). .invite-hero's <=560 block (globals.css:1798) adjusts only --hero-gap, leaving the 38px clamp floor: at 320px the EN headline runs 5 lines (~210px block) and the lead stays 20px/32px, vs the sibling band's 32px title + 17px lead at the same width.
- **Why:** The <=560 compact skin should compress the shared band consistently (RB-24) — two pages using the same component with different mobile densities reads as drift, and the invite hero pushes the CTA further below the fold on short phones.
- **Fix:** Add the deltas to the existing <=560 block at app/globals.css:1798: `.invite-hero{--hero-title:clamp(32px,10vw,42px);--hero-lead:17px;--hero-lead-lh:27px}` (values mirroring :1747).
- **Evidence:** `invite-code/base-en-0320x0568-dpr2-vp.png` · `invite-code/base-lt-0344x0882-dpr2-fp.png` · `invite-code/base-lt-0375x0667-dpr2-vp.png` · app/globals.css:1764 .invite-hero (no <=560 --hero-title override); app/globals.css:1747 .htw-page <=560 override (--hero-title:clamp(32px,10vw,42px))
- *RB-24 · confidence 0.85 · code-inferred*


---

## 9. Cancel deletion (/cancel-deletion)

*All 6 machine states (idle, submitting via slow-token mock, success, invalid, already, error) at 4 widths; 9 substantiated findings (3 MEDIUM · 6 POLISH).*

A GDPR-critical path that mostly holds. The error-state support mailto is a ~20 px inline text target on touch bands (RSP-411); invalid/already terminal states promise contact in copy but render no action (unlike error); submit unmounts the focused confirm button, dropping keyboard focus with no announcement of the result — a responsive-adjacent a11y defect worth fixing alongside.

### All findings — Cancel deletion

### error-state

**RSP-411 · MEDIUM** — Error-state support mailto link is a ~20px-tall 14px inline text target on touch bands (320–1024px, state: error; locales: en, lt)

- **What:** The only support path in the retryable-error state is the correlation-ID line: 14px body text with an inline <a href=mailto:> (CancelDeletionScreen.tsx:118-125). Rendered target height is ~20 CSS px (14px font, default line box) at 320/390/768 — far below the 44px minimum (48 preferred) for touch. The auto-metrics flag it as a smallTarget ('a') at 320, 390, 768 and 1280.
- **Why:** This is the escape hatch of a GDPR-critical flow (cancel account deletion failed). A user on a phone who has just seen 'Nepavyko atšaukti' must hit a 20px-tall link to reach support; a missed tap on a dark page with nothing else nearby reads as a dead end. 2026 marketplace bar: terminal error states expose a full-size secondary action.
- **Fix:** Give the mailto link button-like affordance on touch bands: wrap it as a secondary .nk-btn (min-height:var(--nk-tap)) or add display:inline-block; padding:12px 8px; margin:-12px -8px to the anchor in CancelDeletionScreen.tsx:125. Keep the correlation code as plain selectable text.
- **Evidence:** `mock-cancel-error/base-lt-0320x0568-dpr2-fp.png` · `mock-cancel-error/base-lt-0390x0844-dpr2-fp.png` · `mock-cancel-error/base-lt-0768x1024-dpr2-vp.png`
- *RB-12 · confidence 0.9 · measured*

**RSP-415 · POLISH** — Correlation-ID support line wraps with a dangling '·' separator at narrow widths (320–420px, state: error)

- **What:** At 320 the support line breaks as 'Užklausos ID: mock-corr-err-789 ·' / 'info@naudokis.lt' — the middot separator dangles at the end of line 1 (CancelDeletionScreen.tsx:119-125 renders '{correlationId} · link' as flat inline text). Real correlation IDs are likely longer than the mock, making the break point band-dependent.
- **Why:** A dangling separator on the one support line of an error state reads unfinished; wrap quality on display/meta lines is a 2026 craft expectation (RB-10).
- **Fix:** Bind the separator to the link ('\u00a0·\u00a0' before the anchor inside a white-space:nowrap span), or stack the two parts as flex column with gap on ≤560.
- **Evidence:** `mock-cancel-error/base-lt-0320x0568-dpr2-fp.png`
- *RB-10 · confidence 0.85 · visual*

### invalid-already-states

**RSP-412 · MEDIUM** — Invalid/already terminal states promise contact in copy but render no action, unlike error state (320–1280px, state: already, invalid; locales: en, lt)

- **What:** State parity break between sibling terminal states: the error state renders a retry CTA plus a contact email line, but the invalid and already states (CancelDeletionScreen.tsx:96-102) render only title + subtitle — no button, no link — while their body copy explicitly says 'susisiekite su mumis' / 'Contact us if you need help.' The status area is otherwise empty at every band (e.g. 320, 390, 561, 1024); the nearest contact affordance is the footer email one full screen below (~1400px of scroll at 320).
- **Why:** A user who clicks an expired deletion-cancellation link lands on a dead-end screen whose text tells them to contact support without giving the path the copy promises. Sibling states of the same surface behave inconsistently — exactly the parity RB-19 requires across states of one component.
- **Fix:** Pass an action into both EmptyStates (CancelDeletionScreen.tsx:97 and 101): a mailto CONTACT_EMAIL secondary button (actionLabel from a new dict key), mirroring the error-state support hook; or append the same correlation/contact <p> block used in the error branch.
- **Evidence:** `cancel-deletion/base-lt-0320x0568-dpr2-fp.png` · `mock-cancel-already/base-lt-0390x0844-dpr2-vp.png` · `cancel-deletion/base-en-0390x0844-dpr2-fp.png`
- *RB-19 · confidence 0.9 · visual*

### confirm-flow

**RSP-413 · MEDIUM** — Submit unmounts the focused confirm button; focus is dropped, result never announced (320–1920px, state: already, error, idle, invalid, submitting, success; locales: en, lt)

- **What:** submit() (CancelDeletionScreen.tsx:40-53) flips state and the whole idle block including the focused button unmounts (line 60-81), replaced by an EmptyState (83-128). No ref/focus() call and no aria-live region exists, so keyboard focus falls back to <body> and screen readers get no announcement of success vs failure. On error, the retry CTA is not focused either.
- **Why:** Keyboard and SR users completing a GDPR-critical confirmation lose their place and get no confirmation that the deletion was actually cancelled — they must re-scan the page. RB-15 requires layers/state swaps that remove the focused element to restore focus deliberately, in every band.
- **Fix:** Give the result heading tabIndex={-1} via EmptyState titleAs ref (or a wrapper ref) and focus it in submit() after setState; alternatively wrap the status main in aria-live="polite". CancelDeletionScreen.tsx:47-52.
- **Evidence:** `mock-cancel-submitting/base-lt-0768x1024-dpr2-vp.png` · `mock-cancel-success/base-lt-0768x1024-dpr2-fp.png`
- *RB-15 · confidence 0.75 · code-inferred*

**RSP-414 · POLISH** — Submitting spinner animates via inline style, bypassing the repo's reduced-motion gates (320–1920px, state: submitting; locales: en, lt)

- **What:** The confirm button's loader uses style={{animation:"nk-spin .8s linear infinite"}} (CancelDeletionScreen.tsx:72). Inline styles are not covered by the existing prefers-reduced-motion gates — the same keyframe's class consumer .nk-lightbox__spin is gated at globals.css:1317, and .nk-empty__ill at :834.
- **Why:** The codebase's own convention is to gate every animation; this is the one ungated one on the surface. Small progress spinners are a common exemption, but consistency argues for the class-based, gated variant.
- **Fix:** Add a shared .nk-spinning{animation:nk-spin .8s linear infinite} with a reduced-motion gate next to globals.css:1308, and use it instead of the inline style at CancelDeletionScreen.tsx:72.
- **Evidence:** `mock-cancel-submitting/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:1307 @keyframes nk-spin; app/globals.css:1317 reduced-motion gate for .nk-lightbox__spin
- *RB-16 · confidence 0.9 · code-inferred*

**RSP-419 · POLISH** — Confirm→result swap jumps from an 88px icon to a ~180-232px illustration, re-centering the column (320–1920px, state: already, error, idle, invalid, success; locales: en, lt)

- **What:** The idle/submitting state leads with an 88px .nk-empty__icon circle (CancelDeletionScreen.tsx:62-64); every result state leads with a .nk-empty__ill illustration at clamp(180px,20vw,232px) (150-156px on compact bands). On submit resolution the heading shifts down ~90-140px and the whole centered block re-flows within the same 62vh shell.
- **Why:** Cross-state geometry parity (RB-19): the user's eye is on the button/heading when the result lands; a leading marketplace keeps the anchor point stable (or transitions it) on a confirm→result swap rather than teleporting the composition.
- **Fix:** Use the same visual scale for both phases — e.g. success keeps the 88px icon treatment (EmptyState icon="BadgeCheck" already supports it) and reserve illustrations for direct-landing states (invalid/already), or wrap the media slot in a fixed-height box across states.
- **Evidence:** `mock-cancel-submitting/base-lt-0768x1024-dpr2-vp.png` · `mock-cancel-error/base-lt-0768x1024-dpr2-vp.png` · app/globals.css:829 .nk-empty__icon (88px); app/globals.css:831 .nk-empty__ill (clamp 180-232px)
- *RB-19 · confidence 0.65 · visual*

### status-shell

**RSP-416 · POLISH** — .nk-statusmain centers with raw min-height:62vh instead of svh (320–1024px, locales: en, lt; mobile URL-bar sensitive)

- **What:** .nk-statusmain{min-height:62vh} (globals.css:819) drives the vertical centering of every state of this surface. Raw vh on iOS/Android resolves against the large viewport, so with browser chrome expanded the centered block is sized against ~62% of a height the user does not currently have.
- **Why:** The rubric requires full-height-ish sections to pick svh (stable) or dvh (following) deliberately; raw vh is the one wrong default. Impact here is mild (min-height for centering, content fits anyway), hence polish, but it is the only vh remnant on a shared status shell.
- **Fix:** globals.css:819 → min-height:62svh (keep 62vh on a fallback line before it for old engines).
- **Evidence:** `cancel-deletion/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:819 .nk-statusmain
- *RB-06 · confidence 0.8 · code-inferred*

### empty-state-shell

**RSP-417 · POLISH** — EmptyState sizes its illustration with viewport units/media queries but lives in 3+ container contexts (320–1920px, state: already, error, invalid; locales: en, lt)

- **What:** EmptyState renders in at least three container contexts — the full-page status main here (.nk-statusmain), the CategoriesScreen results panel (CategoriesScreen.tsx:86-105), and feed/search result areas — yet .nk-empty__ill is sized clamp(180px,20vw,232px) with viewport min-width media overrides at globals.css:1822/1925. Its size tracks the viewport, not the box it sits in.
- **Why:** The repo has zero @container rules; any narrower future context (split layout, side panel, modal) gets an illustration sized for the viewport. This is exactly the CQ migration target class: one shared component, multiple containers, viewport-driven sizing.
- **Fix:** Make .nk-empty a container (container-type:inline-size) and size .nk-empty__ill with cqi units (e.g. clamp(150px,40cqi,232px)), replacing the 20vw and the two width-media overrides.
- **Evidence:** `cancel-deletion/base-lt-0560x0900-dpr2-fp.png` · `cancel-deletion/base-lt-1024x0768-fp.png` · app/globals.css:831 .nk-empty__ill; app/globals.css:1822 .nk-empty__ill (small-screen override)
- *RB-03 · confidence 0.75 · code-inferred*

### result-titles

**RSP-418 · POLISH** — white-space:nowrap on h1.nk-empty__title leaves no headroom for text-spacing or longer copy (561–767px, state: already, error, invalid, success; locales: en, lt)

- **What:** From 561px up the result h1 is forced to one line (globals.css:828) with no ellipsis/overflow handling. The longest current title, LT 'Paskyros ištrynimas atšauktas', measures ~390px at 26px Archivo vs ~465px available at a 561px viewport — ~16% headroom. WCAG 1.4.12 text-spacing (letter-spacing .12em + word-spacing .16em) consumes roughly that entire margin, and any longer future dictionary value overflows the centered column instead of wrapping.
- **Why:** nowrap on a heading that carries variable localized copy is a latent RB-01 overflow wired to a dictionary edit; it also makes the 1.4.12 text-spacing test marginal exactly at the 561 seam. Currently renders fine (verified at 561 and 768), hence polish.
- **Fix:** Replace the nowrap rule with text-wrap:balance on .nk-empty__title (all bands), or scope nowrap to a max-inline-size check; at minimum drop the rule for this GDPR surface's titles.
- **Evidence:** `cancel-deletion/base-lt-0561x0900-dpr2-fp.png` · `mock-cancel-success/base-lt-0768x1024-dpr2-fp.png` · app/globals.css:828 @media(min-width:561px) .nk-empty__title{white-space:nowrap}
- *RB-10 · confidence 0.7 · code-inferred*


---

## 10. Error & status pages

*Soft-404, listing-404, route error (mock SSR-500), loading skeletons; 4 substantiated findings (1 MEDIUM · 3 POLISH).*

StatusScreen is robust across bands; at 320×568 both recovery CTAs sit below the fold; `.nk-statusmain` centers with raw `62vh` (RSP-421); the shared `nk-empty__title` nowrap (RSP-107) applies here too. Route-level loading states drop the entire site nav — chrome flashes out during home→feed/detail client navigations (RSP-048).

### All findings — Error & status pages

### empty-state

**RSP-420 · MEDIUM** — h1.nk-empty__title is force-nowrap >=561px, blocking WCAG 1.4.12 text-spacing reflow (561–760px, state: base, text-spacing; locales: en, lt)

- **What:** globals.css:829 applies white-space:nowrap to every EmptyState title at >=561px. The class carries locale-dependent copy far beyond the short 404 title: CategoriesScreen error/empty titles (LT 'Pagal šią paiešką daiktų neradome', 33 chars ~446px at the fixed 26px/700 Archivo) and CancelDeletionScreen titles flow through the same selector. At a 561px viewport the title's content box is ~470px (container gutter 2x~34px + .nk-empty 24px inline padding), so the longest LT title fits by only ~25px. With WCAG 1.4.12 text-spacing overrides (letter-spacing 0.12em ≈ +103px) the nowrap line grows to ~550px and cannot reflow — it overflows/clips in the 561–700px band. In the captured 404 shots the short title renders single-line and clean, so this is code-anchored risk on the shared selector, not a visual defect in these specific shots.
- **Why:** WCAG 1.4.12 requires text to survive user spacing overrides without loss; nowrap on a copy-bearing h1 forbids the reflow that guarantees it. It is also one translation away from base-state horizontal overflow on a shared component (404, error boundary, categories empty/error, account-deletion states).
- **Fix:** Delete app/globals.css:829 and use text-wrap:balance on .nk-empty__title instead — the title then stays visually one-line whenever it genuinely fits, at any container width and under text-spacing.
- **Evidence:** `soft-404/base-lt-0561x0900-dpr2-fp.png` · `soft-404/base-lt-0768x1024-dpr2-fp.png` · app/globals.css:829 @media(min-width:561px){.nk-empty__title{white-space:nowrap}}; app/globals.css:827 .nk-empty__title
- *RB-11 · confidence 0.7 · code-inferred*

**RSP-421 · POLISH** — .nk-statusmain uses raw 62vh instead of svh for its centering min-height (320–1024px, locales: en, lt; mobile URL-bar bands)

- **What:** .nk-statusmain (the shared 404/error/deletion shell) sets min-height:62vh. On iOS/Android, vh resolves to the large viewport, so with the URL bar visible the centered block reserves more than 62% of the actually-visible height, nudging the CTA further down exactly on the short-viewport bands where finding the action already matters. No overlay/clipping consequence — the page scrolls normally.
- **Why:** 2026 practice is svh/dvh for any height that participates in first-paint framing on mobile; raw vh drifts with browser chrome.
- **Fix:** app/globals.css:820 — change to min-height:62svh (with 62vh fallback line above for old engines).
- **Evidence:** `soft-404/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:820 .nk-statusmain{min-height:62vh...}
- *RB-06 · confidence 0.85 · code-inferred*

**RSP-422 · POLISH** — LT 404 body strands a single word ('pasiūlymus.') on its last line at 320-390px (320–560px)

- **What:** The centered LT body copy wraps to 5 lines at 320 and 4 lines at 390 with the final line holding only 'pasiūlymus.' — a one-word orphan under a centered ragged block. EN copy at the same widths ends with a 3-word line and reads balanced.
- **Why:** Orphan last lines in a centered hero-style composition read as untended typography; text-wrap:pretty is the zero-risk 2026 fix.
- **Fix:** Add text-wrap:pretty to the EmptyState subtitle (the .nk-empty body paragraph style near app/globals.css:821-827).
- **Evidence:** `soft-404/base-lt-0390x0844-dpr2-vp.png` · `soft-404/base-lt-0320x0568-dpr2-vp.png` · app/globals.css:821 .nk-empty (subtitle lives in this column)
- *RB-10 · confidence 0.85 · visual*

**RSP-423 · POLISH** — At 320x568 both 404 recovery CTAs sit fully below the fold (320–360px, <=600px viewports)

- **What:** On the LT 404 at 320x568: nav ~64px + status padding 56px + illustration 150px + gaps + 2-line title + 5-line body push the primary 'Į pradžią' button top to ~575px CSS and the secondary to ~662px — both entirely below the 568px fold. The short-phone tuning block (56px pad, 150px illustration) already exists but doesn't compress quite enough for the 568px-tall SE class; ~120px of nav-to-illustration whitespace remains above the composition.
- **Why:** A lost user on the smallest mainstream viewport sees illustration + prose but no recovery action without scrolling; 2026 marketplace error pages keep at least the primary action at first paint.
- **Fix:** In the (max-width:560px) and (max-height:700px) block (app/globals.css:1810), drop --nk-status-pad to ~24px and the illustration to ~120px, or add a (max-height:600px) step; alternatively reduce .nk-empty gap at short heights.
- **Evidence:** `soft-404/base-lt-0320x0568-dpr2-vp.png` · `soft-404/base-lt-0320x0568-dpr2-fp.png` · app/globals.css:820 .nk-statusmain; app/globals.css:1810 --nk-status-pad:56px (max-width:560 and max-height:700 block)
- *RB-24 · confidence 0.75 · measured*


---

## 11. Overlays (drawers, sheets, dialogs, lightbox)

*Every overlay at its native bands + landscape/short-height combos; 24 substantiated findings (2 HIGH · 12 MEDIUM · 10 POLISH). The overlay layer is where the height axis bites hardest.*

Form flips (dialog↔sheet at 560/561, TOC sidebar↔drawer at 1180/1181, popovers↔sheet at 560/561) all fire at the right seams — verified. The defects are vertical: `92vh` caps (RSP-425), the desktop install dialog with no max-height/scroll (RSP-426 — breaks at 844×390 where width ≥561 selects the *desktop* form on a 390 px-tall phone), the filter sheet's unpinned header (RSP-427), scroll-lock without scrollbar compensation shifting the background (RSP-437), the nav drawer's scrim-without-scroll-lock (RSP-099, deliberate but off-pattern), and `closeAt` auto-close dropping keyboard focus to `<body>` when the opener is display:none on the new band (RSP-121).

### All findings — Overlays

### filter-sheet / app-redirect-sheet

**RSP-425 · HIGH** — Bottom sheets cap at raw 92vh; on iOS/Android with dynamic URL bar the sheet top clips offscreen (320–700px, state: app-redirect, filter-sheet; locales: en, lt; binds on short viewports (at 568h the filter sheet already hits the 523px = 92vh cap); worst with mobile browser URL bar expanded)

- **What:** Both mobile sheets are bottom-anchored (scrim align-items:flex-end) with max-height:92vh. vh resolves to the LARGE viewport on mobile, but the fixed scrim tracks the small/dynamic viewport. With the URL bar expanded (the default state when a user opens filters after landing), 92lvh exceeds 100svh — e.g. iPhone SE Safari: 92vh = 614px vs ~553px visible, so ~60px of the sheet's top (grabber + 'Filtrai' title + 44px close button) is pushed above the visible viewport. Harness confirms the cap binds at short heights: at 320x568 the filter sheet renders exactly 523px = 92vh (dialogFit rect h:523).
- **Why:** The filter sheet is the primary mobile refinement path and the app-redirect sheet is the install-funnel conversion surface; a clipped header/close on every stock mobile browser before first scroll is below the 2026 marketplace bar. Raw 100vh/92vh on mobile-affected overlays is exactly the RB-06 defect class.
- **Fix:** In app/globals.css:938 and :1050 change max-height:92vh to max-height:min(92dvh, calc(100dvh - 24px)) (or 92svh for a stable cap). The codebase already uses 100dvh correctly for the nav drawer (globals.css:588) — align the sheets with that pattern.
- **Evidence:** `feed/filter-sheet-open-lt-0320x0568-dpr2-vp.png` · `feed/filter-sheet-open-lt-0390x0667-dpr2-vp.png` · `home/app-redirect-lt-0320x0568-dpr2-vp.png` · app/globals.css:938 .nk-sheet{max-height:92vh}; app/globals.css:1050 .nk-redirect-panel{max-height:92vh} (max-width:560 block)
- *RB-06 · confidence 0.85 · code-inferred · verified (orchestrator re-check: shot + code)*

### app-redirect

**RSP-426 · HIGH** — Desktop app-redirect dialog has no max-height or internal scroll; overflows short viewports (561–1920px, state: app-redirect; any viewport shorter than ~640px: landscape phones (667-932 x 320-428) and short desktop windows)

- **What:** The >560px dialog form (.nk-redirect-panel, globals.css:976) sets width:min(480px,calc(100vw - 40px)) but NO max-height and NO overflow, and its centering scrim (globals.css:967, display:flex;align-items:center) is not scrollable either. Measured at 561x900 the panel is ~592 CSS px tall (with the listing context card it grows to ~680). Every landscape phone is >560px wide, so it gets this desktop form: on 844x390 / 932x430 the centered panel overflows the viewport top AND bottom with no way to scroll — the close button, logo and store badges are clipped off-screen and unreachable. The mobile (<=560) sheet DOES cap at 92vh with overflow:auto (globals.css:1046); the desktop form has no equivalent. The two @media(max-height) blocks that exist (globals.css:1344, 1804) do not touch this panel.
- **Why:** A locked-action tap in landscape (rotating to view listing photos is common on a rental marketplace) opens the install-conversion dialog with its dismiss control and both store CTAs unreachable; only scrim-tap/Esc escape it. RB-23 requires overlays to scroll internally when tall and fit short viewports.
- **Fix:** Add max-height:min(92dvh,calc(100dvh - 32px)) and overflow:auto to .nk-redirect-panel in the base (desktop) rule at app/globals.css:976, or give the scrim overflow:auto with safe-centering (margin:auto on the panel).
- **Evidence:** `home/app-redirect-lt-0561x0900-dpr2-vp.png` · `legal-terms/legal-toc-drawer-lt-0844x0390-dpr2-vp.png` · app/globals.css:976 .nk-redirect-panel; app/globals.css:967 .nk-redirect-scrim
- *RB-23 · confidence 0.8 · code-inferred · also reported as RSP-449*

**RSP-428 · MEDIUM** — Redirect modal heading runs a double type system: inline 28px fought by 22px !important override (320–560px, state: app-redirect; locales: en, lt)

- **What:** AppRedirect.tsx:135 hardcodes the dialog title inline (fontSize:28, lineHeight:'32px'), and the <=560 compact-skin block overrides it with .nk-redirect-panel h2{font-size:22px!important;line-height:27px!important} (globals.css:1929). Two competing sources of truth for one element, resolved by specificity war rather than a fluid token; the repo's --nk-fs-* clamp() tokens are bypassed entirely. The step is also a 27% cliff at the 560/561 seam (22px -> 28px).
- **Why:** RB-09: stepped !important overrides fighting the element's own sizing is the 'double system' anti-pattern — any future edit to the inline style silently loses on phones, and the heading can never be tuned fluidly. The seam cliff is masked only because the whole dialog changes form at 560.
- **Fix:** Replace the inline fontSize on AppRedirect.tsx:135 with a fluid token (e.g. fontSize:'clamp(22px,3.5vw,28px)' or a --nk-fs-* var) and delete the !important override at app/globals.css:1929.
- **Evidence:** `home/app-redirect-lt-0560x0900-dpr2-vp.png` · `home/app-redirect-lt-0561x0900-dpr2-vp.png` · app/globals.css:1929 .nk-redirect-panel h2 (font-size:22px!important inside the <=560 block)
- *RB-09 · confidence 0.95 · code-inferred*

**RSP-440 · POLISH** — Primary install CTA 'Atsisiųsti programėlę' wraps to two lines at 320px (320–340px, state: app-redirect)

- **What:** At 320x568 the full-width primary button in the redirect sheet breaks 'Atsisiųsti / programėlę' across two lines (icon + first word on line 1). At 344 (Fold cover, not captured for this state but wider) and 390 it is one line. The button stays fully tappable and un-clipped.
- **Why:** A two-line primary CTA at a mainstream-narrow width is below the craft bar for the site's single most important conversion button; a ~1px font-size trim or tighter padding keeps it on one line.
- **Fix:** In the <=560 compact block, give .nk-redirect-smartlink a slightly smaller font-size (e.g. 16px) or reduced inline padding so the LT label fits 320px minus the 2x36px panel padding.
- **Evidence:** `home/app-redirect-lt-0320x0568-dpr2-vp.png` · app/globals.css:1504 .nk-btn{white-space:normal} (<=560 block)
- *RB-10 · confidence 0.9 · visual*

### filters

**RSP-427 · MEDIUM** — Filter sheet pins its footer but not its header — title, close button and drag handle scroll away (320–700px, state: filter-sheet; locales: en, lt; any height where the sheet scrolls internally (all captured: 568-932))

- **What:** The sheet's foot (Apply/Clear) is position:sticky bottom:0 (globals.css:955), but .nk-filtersheet__head (globals.css:942) and the .nk-sheet-grabzone are plain flow children of the scrolling .nk-sheet container. Every foot-state capture (320x568, 390x667, 390x844, 430x932) shows the title, 44px close button AND the swipe-to-dismiss grab handle scrolled out of view mid-list. While scrolled, the only dismissal paths are scrim-tap, Esc, or the Apply button.
- **Why:** RB-23 requires sheets to pin their header/footer. The 2026 mobile sheet pattern keeps title+close pinned; here the drag-dismiss affordance advertised at open (grabber) disappears exactly when the user is deepest in the sheet. FilterSheetGroup lists are long (13 category chips + 9 cities + 5 prices + toggle + 4 sorts), so scrolling is the normal case, not the edge case.
- **Fix:** Make the head sticky: add position:sticky;top:0;z-index:1;background:var(--nk-bg) to .nk-filtersheet__head (app/globals.css:942) — or wrap grabzone+head in one sticky header block in FeedScreen.tsx:833-837. Mirrors the already-sticky foot.
- **Evidence:** `feed/filter-sheet-foot-lt-0320x0568-dpr2-vp.png` · `feed/filter-sheet-foot-lt-0430x0932-dpr2-vp.png` · `feed/filter-sheet-foot-lt-0390x0667-dpr2-vp.png` · app/globals.css:942 .nk-filtersheet__head; app/globals.css:955 .nk-filtersheet__foot (sticky)
- *RB-23 · confidence 0.95 · measured*

**RSP-434 · MEDIUM** — Bottom sheets cap height with raw 92vh, not dvh/svh — header clips under iOS dynamic toolbar (320–560px, state: app-redirect, filter-sheet; locales: en, lt; iOS Safari / Android Chrome with dynamic URL bar expanded)

- **What:** Both mobile sheets use max-height:92vh (globals.css:934 for .nk-sheet/.nk-filtersheet, globals.css:1046 for the <=560 .nk-redirect-panel). 100vh is the LARGE viewport on mobile; with the browser toolbar visible the small (visible) viewport is ~60-90px shorter. The filter sheet already hits the cap at 320x568 (measured rect y=45, h=523 = exactly 92vh), so on a real iPhone SE (svh~548, lvh~634 → 92vh=583) the top ~35px of the bottom-anchored sheet — the grab handle and part of the 'Filtrai' title / 44px close button — renders above the visible viewport, behind the browser chrome.
- **Why:** RB-06: raw vh on mobile-affected overlays is a defect. The clipped strip contains the sheet's drag-dismiss handle and close button — the two dismissal affordances — precisely on the small phones where the sheet maxes out.
- **Fix:** Change max-height:92vh to max-height:92dvh (or 92svh for stability) at app/globals.css:934 and app/globals.css:1046. The legal drawer already does this correctly (legal.css:217 uses 100dvh).
- **Evidence:** `feed/filter-sheet-open-lt-0320x0568-dpr2-vp.png` · `feed/filter-sheet-open-lt-0344x0882-dpr2-vp.png` · app/globals.css:934 .nk-sheet (max-height:92vh); app/globals.css:1046 .nk-redirect-panel <=560 (max-height:92vh)
- *RB-06 · confidence 0.85 · code-inferred*

**RSP-443 · POLISH** — Two-line filter chip ('Garsas, muzika ir renginių technika') centers its wrapped text while siblings are left-aligned (320–360px, state: filter-sheet)

- **What:** At 320-344px the longest category chip wraps to two lines and both lines render horizontally centered (inline-flex centering of the wrapped span), while every single-line sibling chip reads as left-aligned. Visible at 320x568 and 344x882; at >=390 the chip fits one line.
- **Why:** RB-10 wrap quality: the one wrapped chip breaks the left-edge rhythm of the option cloud and reads as a styling accident rather than a deliberate variant.
- **Fix:** Add text-align:left to the label span inside .nk-filtersheet__opt (app/globals.css:948), e.g. .nk-filtersheet__opt>span{text-align:left;min-width:0}.
- **Evidence:** `feed/filter-sheet-open-lt-0320x0568-dpr2-vp.png` · `feed/filter-sheet-open-lt-0344x0882-dpr2-vp.png` · app/globals.css:948 .nk-filtersheet__opt
- *RB-10 · confidence 0.85 · visual*

### lightbox

**RSP-429 · MEDIUM** — Phone lightbox flanks the photo with 48px desktop arrows, shrinking it to ~65% width (320–560px, state: lightbox)

- **What:** At 390px the stage lays out prev-arrow (48px) + photo + next-arrow (48px) in a row with gaps, so the photo box is only ~255px of the 390px viewport (measured 255px CSS on lightbox-s1 390x844). Swipe paging already exists (onTouchStart/onTouchEnd, ListingDetail.tsx:504-510), so the flanking arrows cost a third of the photo width for an affordance touch users don't need in that position.
- **Why:** The photo is the entire point of a lightbox; leading 2026 marketplace lightboxes (Airbnb-class) give it full bleed on touch and overlay or drop the arrows. ~65% width photos look cramped and force extra pinch-zooming.
- **Fix:** At <=560px, position .nk-lightbox__nav absolutely over the stage edges (semi-transparent, safe-area aware) or hide them in favour of swipe + thumb strip; let .nk-lightbox__img span the full stage width.
- **Evidence:** `mock-bento-5/lightbox-s1-lt-0390x0844-dpr2-vp.png` · `mock-bento-5/lightbox-s2-lt-0390x0844-dpr2-vp.png` · app/globals.css:1287 .nk-lightbox__stage; app/globals.css:1289 .nk-lightbox__nav
- *RB-23 · confidence 0.9 · measured*

**RSP-435 · MEDIUM** — Overlay scroll lock removes the scrollbar with no gutter compensation - background shifts (981–1920px, state: lightbox, reserve-modal)

- **What:** Both the gallery lightbox (ListingDetail.tsx:456 document.body.style.overflow="hidden") and the app-redirect modal (app/lib/use-dismissable-layer.ts:39) lock scroll by hiding body overflow. globals.css has no scrollbar-gutter rule, so on desktop OSes with classic scrollbars (Windows, Linux, macOS 'always show') opening either overlay widens the page by ~15px: the capped .nk-container recenters and the fixed nav content jumps horizontally, visibly, behind the scrim.
- **Why:** RB-23 requires background scroll lock without layout shift; visible chrome jump on every Rezervuoti/photo click reads as jank at a 2026 marketplace bar.
- **Fix:** Add html{scrollbar-gutter:stable} (with a both-edges audit for centered layout) or set body padding-right = scrollbar width while locked, in one shared lock helper used by both overlays.
- **Evidence:** `mock-bento-5/lightbox-s1-lt-1280x0800-vp.png` · app/globals.css:1274 .nk-lightbox
- *RB-23 · confidence 0.8 · code-inferred*

**RSP-442 · POLISH** — Desktop lightbox thumbnails left-align under a centered photo (981–1920px, state: lightbox)

- **What:** At 1280x800 the 5 thumbnails hug the panel's left edge (x64-704 of a 1280 panel) while the photo above is horizontally centered, leaving the strip visually disconnected from the stage. The count ('2 / 5') also sits far left while the CTA sits far right in the space-between bar - the left column reads unanchored.
- **Why:** Craft: centered media with left-anchored controls reads unfinished next to the otherwise symmetric overlay.
- **Fix:** Center the strip when it doesn't overflow: .nk-lightbox__thumbs{justify-content:safe center} (keep overflow-x:auto; 'safe' preserves reachability when it does overflow).
- **Evidence:** `mock-bento-5/lightbox-s1-lt-1280x0800-vp.png` · `mock-bento-5/lightbox-s2-lt-1280x0800-vp.png` · app/globals.css:1312 .nk-lightbox__thumbs
- *RB-24 · confidence 0.85 · visual*

**RSP-445 · POLISH** — Landscape-phone lightbox gives the photo only ~56% of viewport height (660–940px, state: lightbox; <=480px landscape phones)

- **What:** At 932x430 the photo stage is ~242px tall (56%) because the always-on thumb strip (46px + padding) and the count/CTA bar (~48px) plus top padding stack vertically. At 844x390 the same chrome leaves ~215px. The photo stays usable but small; the thumb strip duplicates the swipe/arrow affordances in the band where height is scarcest.
- **Why:** RB-22 orientation parity: landscape exists to see the photo bigger; premium galleries collapse secondary chrome under a height media query.
- **Fix:** Add @media(max-height:480px){.nk-lightbox__thumbs{display:none}} (count + arrows already communicate position), reclaiming ~58px for the stage.
- **Evidence:** `mock-bento-5/lightbox-s1-lt-0932x0430-vp.png` · `mock-bento-5/lightbox-s1-lt-0844x0390-dpr2-vp.png` · app/globals.css:1282 .nk-lightbox__panel; app/globals.css:1312 .nk-lightbox__thumbs
- *RB-22 · confidence 0.8 · measured*

### booking

**RSP-430 · MEDIUM** — BookingPanel/HostCard/OfferCard render in multiple container contexts but size via viewport media only (320–1920px)

- **What:** Repo has zero @container. BookingPanel + HostCard render both in the ~300-372px sticky sidebar (.nk-reserve) and full-width inline (.nk-booking-inline, <=980px); OfferCard renders in the feed grid, the detail similar rail (.nk-grid-4--rail), and the home shelf. All adapt through viewport @media plus !important overrides that fight the components' inline styles (.nk-rev-grid:1364, .nk-fact:1377, .nk-ratebreak:1393) - the overrides exist precisely because viewport queries can't see the actual container width.
- **Why:** RB-03: multi-context components on viewport media are the canonical CQ migration target; the !important layer is fragile (any inline-style tweak silently breaks a band) and each new context needs another bespoke media block.
- **Fix:** Make .nk-reserve, .nk-booking-inline, .nk-detail-grid's focus column and the card grids container-type:inline-size and move the fact-card/ratebreak/rev-grid compact rules to @container queries, dropping the !important fights.
- **Evidence:** `detail-full/reserve-mbar-mid-lt-0980x0900-vp.png` · `detail-full/reserve-mbar-mid-lt-0981x0900-vp.png` · app/globals.css:1348-1364 @media(max-width:980px) detail block; app/globals.css:1364 .nk-rev-grid !important
- *RB-03 · confidence 0.9 · code-inferred*

**RSP-432 · MEDIUM** — Fixed reserve bar handles only safe-area-inset-bottom; landscape notch insets ignored (320–980px, state: reserve-mbar; landscape phones (notch on left/right))

- **What:** MobileBar (.nk-mbar, active <=980px including the 844x390 landscape band) is left:0;right:0 with padding 14px 20px (10px 12px <=560) plus only var(--nk-safe-bottom). env(safe-area-inset-left/right) is never added, so in landscape on notched phones the 20E price block or the Rezervuoti button sits inside the ~44-59px sensor-housing/curved-corner inset.
- **Why:** RB-08 requires left/right safe-area on every fixed bar in landscape; the primary conversion CTA partially under the notch is a visible flagship-release defect on real devices (screenshots can't show the inset).
- **Fix:** app/globals.css:1333 - padding:14px max(20px, env(safe-area-inset-right)) calc(14px + var(--nk-safe-bottom)) max(20px, env(safe-area-inset-left)); mirror in the <=560 override at :1379.
- **Evidence:** `detail-full/reserve-mbar-mid-lt-0844x0390-dpr2-vp.png` · app/globals.css:1331 .nk-mbar; app/globals.css:1379 .nk-mbar (<=560 skin)
- *RB-08 · confidence 0.85 · code-inferred*

**RSP-439 · POLISH** — Compact skin fights inline component styles with stepped !important overrides (320–560px, state: reserve-mbar)

- **What:** MobileBar's button gets inline padding:14px 26px/fontSize:16 (ListingDetail.tsx:937) then a <=560 rule re-steps it to 12px 16px/14.5px with !important (globals.css:1380); FactCard's inline padding/gap are likewise re-stepped at :1377-1378. Two sizing systems own the same elements, so any inline tweak silently desyncs the compact band.
- **Why:** RB-09 double-system: stepped !important overrides against per-element styles are the fragile inverse of the fluid token system the rest of the page uses.
- **Fix:** Move the mbar button and fact-card sizing fully into CSS (or CSS vars the inline style reads), letting one clamp()/token express both bands without !important.
- **Evidence:** `detail-full/similar-rail-start-lt-0560x0900-dpr2-vp.png` · app/globals.css:1380 .nk-mbar .nk-btn (!important); app/globals.css:1377 .nk-fact (!important)
- *RB-09 · confidence 0.9 · code-inferred*

**RSP-446 · POLISH** — Reserve-bar trust note ellipsizes to 'Galutine suma progra...' on <=360px foldables (320–359px, state: reserve-mbar)

- **What:** The mbar caption 'Galutine suma programeleje' is capped at min(52vw,340px) with ellipsis; at 320px that's 166px, truncating the 26-char/13px string (needs ~180px). Visible in the 320x568 full-page capture (fixed bar painted at scroll-0 per capture semantics; the truncation itself is real at any scroll position).
- **Why:** The note is the honest 'final price in the app' disclosure - cutting it to 'progra...' on Fold-cover widths weakens the trust copy exactly where the CTA lives.
- **Fix:** Allow the caption to wrap to two 13px lines below 360px (white-space:normal + -webkit-line-clamp:2) or use a shorter <=360 string in both dictionaries.
- **Evidence:** `detail-full/desc-expanded-lt-0320x0568-dpr2-fp.png` · app/globals.css:1340 .nk-mbar > span span (max-width:min(52vw,340px))
- *RB-21 · confidence 0.75 · measured*

### app-redirect-modal

**RSP-431 · MEDIUM** — App-redirect bottom sheet caps at raw 92vh, not svh/dvh, on mobile (320–560px, state: reserve-modal; mobile browsers with dynamic URL bar)

- **What:** The <=560px sheet form of .nk-redirect-panel uses max-height:92vh (globals.css:1046). On mobile, vh resolves against the large viewport; with the URL bar expanded the visible (small) viewport is ~8-12% shorter, so a full-content sheet (title + QR + store badges) can run 92lvh ~= 100-104svh tall - its grabber/close zone sits at or above the visible top edge and the internal scroll start is hidden. .nk-sheet (the filters sheet base, :934) shares the same raw 92vh.
- **Why:** This is the core reserve->install funnel overlay; 2026 practice is svh/dvh for bottom sheets (RB-06). A sheet taller than the visible viewport buries the dismiss affordance behind browser chrome.
- **Fix:** Change max-height:92vh to max-height:min(92svh, 92vh) (or 92dvh if follow-the-bar behaviour is wanted) at app/globals.css:1046 and :934.
- **Evidence:** `detail-full/reserve-mbar-mid-lt-0390x0844-dpr2-vp.png` · app/globals.css:1046 .nk-redirect-panel (max-height:92vh); app/globals.css:934 .nk-sheet (max-height:92vh)
- *RB-06 · confidence 0.85 · code-inferred*

### description

**RSP-433 · MEDIUM** — Description prose runs 93ch at 1440 - no measure cap, and skeleton caps at 720px while content doesn't (1200–1920px, state: base, desc-expanded)

- **What:** The loaded description div (ListingDetail.tsx:594, .nk-prose) has no max-width, so in the ~750px focus column at 1440/1441 the auto-metric measured 93ch lines (17px/30px type). The loading skeleton DOES cap its description block at maxWidth:720 (ListingDetail.tsx:160), so skeleton and loaded geometry disagree (RB-19) and the loaded state exceeds the <=75ch readable-measure bar.
- **Why:** 90+ character lines measurably reduce reading comprehension and look untended next to the rest of the tokenized layout; the skeleton mismatch also causes a subtle line-length jump when content lands.
- **Fix:** Add maxWidth:720 (or 68ch) to the prose div at app/components/ListingDetail.tsx:594 to match the skeleton.
- **Evidence:** `detail-full/similar-rail-start-lt-1440x0900-vp.png` · app/globals.css:1388 .nk-desc-clamp
- *RB-04 · confidence 0.85 · measured*

### overlay-sheets

**RSP-436 · MEDIUM** — Bottom sheets cap at raw 92vh — sheet top (title + close button) can sit under the iOS toolbar (320–560px, state: overlay-open, toolbar-expanded; locales: en, lt; iOS Safari dynamic toolbar: 92vh(lvh) ≈ 100-104% of svh)

- **What:** Both mobile sheets use max-height:92vh (globals.css:933 .nk-sheet used by the filter sheet; :1045 .nk-redirect-panel in ≤560 sheet mode). vh resolves to the LARGE viewport on iOS, while position:fixed overlays (.nk-modal-scrim/.nk-redirect-scrim, inset:0) get the small/visual viewport when the toolbar is expanded. The sheet is bottom-anchored (align-items:flex-end), so when its content fills the cap — the filter sheet's category+city+price+sort option lists easily exceed one phone screen — the top 5-10% of the sheet, i.e. the grabber, the "Filtrai" title and the close button, extends above the visible viewport under the toolbar until the user collapses it. The codebase already uses dvh in three other places (globals.css:583, 1214; legal.css:217) and has zero svh usage anywhere, so this is an internal inconsistency, not a platform constraint.
- **Why:** The close affordance of a modal must never render off-viewport; dvh/svh has been the baseline fix since 2023 and the project applies it elsewhere.
- **Fix:** globals.css:933 and :1045 — change max-height:92vh to max-height:92dvh (or min(92dvh, 92vh) if very old Safari matters; dvh is fine for the supported matrix).
- **Evidence:** app/globals.css:933 .nk-sheet{max-height:92vh}; app/globals.css:1045 .nk-redirect-panel (≤560 sheet){max-height:92vh}
- *RB-06 · confidence 0.75 · code-inferred*

**RSP-448 · POLISH** — Scrollable sheets lack overscroll-behavior:contain — edge scroll chains to the (overflow:hidden) body on iOS (320–560px, state: overlay-open, scroll-at-edge; locales: en, lt)

- **What:** The filter sheet (.nk-sheet, globals.css:933) and the mobile redirect sheet (.nk-redirect-panel, :1045) are overflow:auto scroll containers without overscroll-behavior:contain; only the nav drawer inner has it (:584). On iOS, body{overflow:hidden} does not reliably block touch scroll chaining, so reaching a sheet's scroll end and continuing the gesture can rubber-band or scroll the page beneath the scrim.
- **Why:** Background movement behind a modal breaks the layering illusion and can leave the page at a different scroll position on close; contain is a one-line, zero-risk guard the codebase already uses for the drawer.
- **Fix:** Add overscroll-behavior:contain to .nk-sheet (globals.css:933) and the ≤560 .nk-redirect-panel block (:1045); consider it for .nk-lightbox__thumbs (x-axis) too.
- **Evidence:** app/globals.css:933 .nk-sheet{overflow:auto}; app/globals.css:1045 .nk-redirect-panel{overflow:auto}
- *RB-14 · confidence 0.7 · code-inferred*

### overlay-scroll-lock

**RSP-437 · MEDIUM** — Scroll lock sets body overflow:hidden with no scrollbar compensation — background shifts on open (561–1920px, state: app-redirect, filter-sheet, legal-toc-drawer; locales: en, lt)

- **What:** use-dismissable-layer.ts (line ~38, document.body.style.overflow='hidden') and LegalChrome.tsx:80 (same pattern) remove the document scrollbar while an overlay is open. There is no scrollbar-gutter:stable on html/body and no padding-right compensation anywhere in globals.css. On classic-scrollbar platforms (Windows Chrome/Edge/Firefox, ~15-17px), the whole page reflows wider the instant the app-redirect dialog / legal drawer opens and snaps back on close — visible through the semi-transparent blurred scrim both times.
- **Why:** RB-23 explicitly requires locking background scroll WITHOUT layout shift. On the install-conversion dialog this double-jolt (open+close) reads as jank at the most brand-critical moment.
- **Fix:** Add scrollbar-gutter:stable to the root (html) in app/globals.css, or in use-dismissable-layer.ts set document.body.style.paddingRight = (window.innerWidth - document.documentElement.clientWidth) + 'px' alongside overflow:hidden (and mirror in LegalChrome.tsx:80).
- **Evidence:** `home/app-redirect-lt-1920x1080-vp.png` · app/globals.css: (no scrollbar-gutter rule exists)
- *RB-23 · confidence 0.7 · code-inferred*

### legal-toc-drawer

**RSP-438 · MEDIUM** — Legal TOC drawer and FABs skip landscape safe-area insets (left notch, bottom home indicator) (561–980px, state: base, legal-toc-drawer; locales: en, lt; landscape phones (844x390, 932x430) — notch on left, home indicator at bottom)

- **What:** The left-anchored TOC drawer panel (legal.css:217) uses padding:24px 22px with no env(safe-area-inset-left); in landscape with the notch on the left (~48-59px inset on iPhone) the TOC link text and tap targets sit under the sensor housing. The FAB pair only gains env(safe-area-inset-bottom) inside the <=680px media block (legal.css:272-275); at 681-980px — exactly the landscape-phone band where the FAB is shown (confirmed visible in the 844x390 capture) — the base rules bottom:24px (legal.css:197, 207) leave the 46px buttons overlapping the ~21px home-indicator gesture zone.
- **Why:** RB-08 requires env(safe-area-inset-left/right) in landscape for every drawer edge and fixed bar, not just bottom. Legal docs are long reads where landscape reading is plausible; taps near the home indicator trigger the system gesture instead of the FAB.
- **Fix:** legal.css:218 → padding-left:max(22px, env(safe-area-inset-left)); move the FAB safe-area bottoms out of the <=680px block into the base .nk-lg-totop/.nk-lg-fab-toc rules (bottom:calc(24px + env(safe-area-inset-bottom)), left/right:max(24px, env(safe-area-inset-left/right))).
- **Evidence:** `legal-terms/legal-toc-drawer-lt-0844x0390-dpr2-vp.png` · app/components/legal/legal.css:217 .nk-lg-drawer__panel; app/components/legal/legal.css:197 .nk-lg-totop (bottom:24px)
- *RB-08 · confidence 0.65 · code-inferred*

**RSP-444 · POLISH** — Legal TOC drawer header (title + close) scrolls away with the list instead of pinning (320–1180px, state: legal-toc-drawer; locales: en, lt; all — the 30+-item Terms TOC always overflows the panel)

- **What:** The drawer panel itself is the scroll container (legal.css:217 overflow-y:auto) and .nk-lg-drawer__top (title + 44px close, legal.css:224) is a plain flow child, so on the ~34-entry Terms TOC the close button scrolls out of view once the user browses lower sections. The bottom sticky fade (::after, legal.css:222) is a nice continuation affordance, but there is no top equivalent.
- **Why:** RB-23 pinned-header expectation. Mitigated to POLISH because every list item is a link that closes the drawer on tap, plus Esc and a scrim remain — the user is never trapped.
- **Fix:** Make the top row sticky: .nk-lg-drawer__top{position:sticky;top:-24px;padding-top:24px;background:var(--lg-elevated);z-index:1} (offsetting the panel's 24px padding), app/components/legal/legal.css:224.
- **Evidence:** `legal-terms/legal-toc-drawer-lt-0320x0568-dpr2-vp.png` · `legal-terms/legal-toc-drawer-lt-0390x0844-dpr2-vp.png` · app/components/legal/legal.css:224 .nk-lg-drawer__top; app/components/legal/legal.css:217 .nk-lg-drawer__panel (overflow-y:auto)
- *RB-23 · confidence 0.85 · measured*

### rail

**RSP-441 · POLISH** — Similar-items snap rail lacks scroll-snap-stop and overscroll containment (320–560px, state: similar-rail)

- **What:** The <=560px carousel form of .nk-grid-4--rail sets scroll-snap-type:x mandatory and snap-align:start but no scroll-snap-stop:always and no overscroll-behavior-x:contain. A fast flick can skip past cards, and edge overscroll chains to the page / can trigger browser back-swipe on Android. Not visible in live shots (only 1 sibling item today) - code-inferred against the 5-card capacity.
- **Why:** RB-14 snap ergonomics: mandatory snap without a stop policy makes 240px cards easy to overshoot once inventory grows.
- **Fix:** In app/globals.css:1953 add scroll-snap-stop:always to .nk-grid-4--rail>* and overscroll-behavior-x:contain to the rail rule at :1951.
- **Evidence:** `detail-full/similar-rail-start-lt-0560x0900-dpr2-vp.png` · app/globals.css:1951 .nk-grid-4--rail (<=560 carousel)
- *RB-14 · confidence 0.85 · code-inferred*

### gallery

**RSP-447 · POLISH** — Bento hero tile declares sizes 60vw but renders ~515px in the capped grid at wide (1200–1920px)

- **What:** GalleryTile big uses sizes="(max-width:980px) 100vw, 60vw" (ListingDetail.tsx:68). Above the ~1180px content cap the 1.55fr hero tile renders ~515px, but 60vw at 1440 declares 864px -> the optimizer serves the ~1080 rendition, ~1.7x the needed DPR1 width, on the page's LCP image. (The lightbox's own LB_SIZES is correctly slot-aware, so the pattern exists in-file.)
- **Why:** RB-17: sizes should match rendered width per band; the over-fetch taxes LCP on desktop.
- **Fix:** Declare the cap: sizes="(max-width:980px) 100vw, (min-width:1200px) 520px, 60vw" for big tiles (and ~20vw->240px for small tiles) in GalleryTile, ListingDetail.tsx:68.
- **Evidence:** `detail-full/similar-rail-start-lt-1440x0900-vp.png` · app/globals.css:1215 .nk-bento
- *RB-17 · confidence 0.75 · code-inferred*


---

## 12. Site chrome (nav + footer, cross-page)

*Nav at 3 label stages × both locales at the exact flip widths (559/560/561, 1119/1120/1121), footer at all six page caps; 17 substantiated findings (7 MEDIUM · 10 POLISH).*

Nav stages flip correctly in both locales (EN/LT label lengths verified at the seams). Footer: the Cities column double-wraps every link across the whole 1025–~1300 band (RSP-451); category sub-columns squeeze to ~110 px at 561–680 with 2–3-line LT labels; the 4-col grid engages at 1025 but only breathes from ~1200. Cross-page: store-badge pairs render at four different heights (48/51/55/57 px) across six surfaces; the install QR gets three different treatments; the legal-doc breadcrumb omits the /teisine hub level so ≤680 it collapses to a lone "Pagrindinis" chip; inventory-count readouts sit right-aligned on feed but left-aligned on categories. Safe-area left/right is absent on nav/drawer/rails under `viewport-fit=cover` (RSP-060).

### All findings — Site chrome

### type

**RSP-450 · MEDIUM** — Quiet Luxe eyebrow rule silently kills the mobile eyebrow size and strands the --nk-fs-eyebrow token (320–3840px, locales: en, lt)

- **What:** Three declarations disagree about the eyebrow size: the token --nk-fs-eyebrow:18px (:234) feeds the base class (:246); the ≤560 block sets 17px (:1541); the later unconditional Quiet Luxe rule sets 16px (:1849). Equal specificity + later source order means 16px wins EVERYWHERE, including under 560px — the mobile 17px rule is dead and the token no longer reflects any rendered size, so retuning --nk-fs-eyebrow does nothing.
- **Why:** The token file promises 'a single source of truth' (:225-227); this chain is a live counter-example that will eat a future designer's change. Fluid-type system integrity is the RB-09 concern.
- **Fix:** Retarget the token (--nk-fs-eyebrow:16px at :234), make the Quiet Luxe rule read var(--nk-fs-eyebrow) (:1849), and delete the dead ≤560 17px rule (:1541).
- **Evidence:** app/globals.css:1541 ≤560 .nk-eyebrow{font-size:17px} (dead — earlier in source); app/globals.css:1849 .nk-eyebrow{font-size:16px} (unconditional Quiet Luxe, wins by order)
- *RB-09 · confidence 0.92 · code-inferred*

**RSP-453 · MEDIUM** — Body type drops 20px→15.5px in one step at the 560/561 seam (555–566px, locales: en, lt)

- **What:** Headings ride clamp() tokens, but the body tier (--nk-fs-body 20px, --nk-fs-body-sm 18px) is fixed px overridden to a flat 15.5px at ≤560. Crossing 560↔561px changes .nk-body by 4.5px (−22%) and its line-height 32→24px in a single frame; .nk-body-sm/.nk-meta jump 2.5px. A foldable, a tablet split-screen, or a resized window straddling the cliff sees the whole page's body copy reflow abruptly, and the 561-700px band keeps desktop-scale 20px body inside 2-up ~270px cards.
- **Why:** The design system's own thesis is a fluid clamp ramp ('scales down to mobile without per-component media queries'); the body tier violates it with the largest discontinuity in the file. 2026 practice: clamp the body tier too.
- **Fix:** Retarget the tokens: --nk-fs-body:clamp(15.5px,1.2vw + 11px,20px) and --nk-fs-body-sm:clamp(15px,1vw + 10px,18px) (tuned to hit today's endpoints), then delete the ≤560 overrides at :1538-1540.
- **Evidence:** app/globals.css:1538-1540 ≤560 .nk-body/.nk-body-sm/.nk-meta{font-size:15.5px;line-height:24px}; app/globals.css:235-236 --nk-fs-body:20px / --nk-fs-body-sm:18px (fixed px, not clamp)
- *RB-09 · confidence 0.85 · code-inferred*

### footer

**RSP-451 · MEDIUM** — Footer Cities column double-wraps every link across the whole 1025-~1300 band (1025–1350px, locales: en, lt)

- **What:** The desktop footer grid (globals.css:867, grid-template-columns:1.4fr 1.75fr .7fr .85fr) activates at 1025px. The .7fr Cities track is ~118-135px wide there, while 'Nuoma Klaipėdoje' / 'Rentals in Klaipėda' at 18px need ~150-170px — so ALL five city links render as two-line links in both locales at 1025 (LT shot) and 1119/1120 (LT+EN shots). The LT 'Pagalba ir taisyklės' heading also wraps in the .85fr Help track. At <=1024 (2-col layout, e.g. 820/900/1024 shots) the same links fit one line — the wrap is introduced by the 4-col fr split, not by content.
- **Why:** A footer where an entire sitemap column is double-wrapped for a ~300px-wide mainstream band (small laptops, 1280 displays with sidebars) reads as broken ladder tuning, below the flagship-marketplace bar; it also doubles footer height for those users.
- **Fix:** In globals.css:867, give the cities/help tracks intrinsic floors — e.g. grid-template-columns:1.4fr 1.75fr minmax(max-content,.7fr) minmax(max-content,.85fr) — or move the 4-col layout up to min-width:1200px and keep the 2-col layout for 1025-1199.
- **Evidence:** `feed/base-lt-1025x0768-fp.png` · `feed/base-lt-1119x0800-fp.png` · `feed/base-en-1120x0800-fp.png` · app/globals.css:867 .nk-footer__top; app/globals.css:899 .nk-footer__col a
- *RB-10 · confidence 0.9 · measured*

**RSP-462 · POLISH** — Footer tablet band (561-1024): 'Pagalba ir taisykles' column wraps alone, leaving an empty half-row (561–1024px)

- **What:** At <=1024 .nk-footer__top becomes 1fr 1fr with brand spanning row 1; the three nav columns then fill 2 tracks: row 2 = Kategorijos | Miestai, row 3 = Pagalba ir taisykles | (empty ~50%-wide cell). At 768 the empty cell is ~336 CSS px wide next to a 4-link column, and Miestai's track also underfills against the tall 2-sub-column Kategorijos block (identical on home, feed, teisine).
- **Why:** A designer would rebalance before flagship release - the orphaned column plus dead cell makes the tablet footer read one row taller and lopsided, on every page of the site.
- **Fix:** In the <=1024 band place the two short columns together, e.g. .nk-footer__top{grid-template-columns:1fr 1fr} with Kategorijos spanning row 2 full-width or grid-template-areas putting Miestai and Pagalba side by side in one row (app/globals.css:914-919).
- **Evidence:** `crops from home/base-lt-0768x1024-dpr2-fp.png footer` · `crops from teisine/base-lt-0768x1024-dpr2-fp.png footer` · app/globals.css:914 @media(max-width:1024px) .nk-footer__top{grid-template-columns:1fr 1fr}; app/globals.css:871 .nk-footer__top
- *RB-24 · confidence 0.85 · measured*

**RSP-465 · POLISH** — Footer sitemap/contact links are 24px-tall targets on touch bands (320–1024px, locales: en, lt)

- **What:** Footer column links and contact links declare min-height:24px with width:fit-content (globals.css:899, 880); vertical gap between links is var(--nk-s-4)=16px (catcol) / --nk-gap-lg. That yields ~24x(text-width) targets on ~40px pitch — above the WCAG 2.5.8 24px minimum but well under the 44-48px preferred for primary link lists on phones. Social icons (44x44) and drawer items (48px) are compliant.
- **Why:** Footer city/category/legal links are real navigation on this bridge site (SEO landings, policy pages); 24px targets are fumble-prone on phones against the 2026 44px preference.
- **Fix:** Raise link min-height to 44px (or add padding-block:10px with negative margin compensation) inside a (max-width:1024px) block near globals.css:899.
- **Evidence:** `feed/base-lt-0320x0568-dpr2-fp.png` · `feed/base-lt-0820x1180-dpr2-fp.png` · app/globals.css:899 .nk-footer__col a (min-height:24px); app/globals.css:880 .nk-footer__contact a
- *RB-12 · confidence 0.75 · code-inferred*

### overlay

**RSP-452 · MEDIUM** — Scroll lock sets body overflow:hidden with no scrollbar compensation — page + sticky nav shift ~15px on every modal open (classic-scrollbar platforms) (561–3840px, state: overlay-open; locales: en, lt)

- **What:** use-dismissable-layer.ts:39 and GalleryLightbox (ListingDetail.tsx:456) lock scroll via document.body.style.overflow="hidden". There is no scrollbar-gutter:stable anywhere in globals.css (grep: 0 hits) and no padding-right compensation. On Windows/Linux (and macOS with 'always show scrollbars'), removing the ~15-17px scrollbar reflows the entire page and the centered .nk-container content — including the sticky nav — every time the bridge modal, filter sheet, or lightbox opens, and shifts back on close.
- **Why:** A full-page 15px lurch on the site's primary conversion interaction (every locked CTA opens the bridge modal) is a well-known 2026-eliminated defect; scrollbar-gutter:stable has been baseline since 2022.
- **Fix:** Add html{scrollbar-gutter:stable} to globals.css (verify against the .nk-container centering), or in use-dismissable-layer.ts set body.style.paddingRight = (window.innerWidth - document.documentElement.clientWidth) + 'px' alongside the overflow lock and clear both in cleanup (also in the lightbox's mount effect).
- **Evidence:** app/globals.css: (no scrollbar-gutter anywhere — grep verified)
- *RB-18 · confidence 0.85 · code-inferred*

### overlay-sheets

**RSP-454 · MEDIUM** — Bottom sheets cap at 92vh (large-viewport units) — top of sheet can exceed the visible viewport on iOS (320–560px, state: modal-open; locales: en, lt; iOS Safari toolbar-expanded state)

- **What:** Both bottom sheets use raw vh: .nk-sheet (filter sheet, globals.css:938) and the ≤560 .nk-redirect-panel (globals.css:1050) set max-height:92vh. On iOS Safari vh == lvh (large viewport), while the fixed scrim tracks the dynamic viewport; with the toolbar expanded the visible height is ~90% of lvh, so a content-full sheet (92% of lvh, bottom-anchored) pokes its top — grab zone and close affordance — above the visible area behind browser chrome. The codebase already uses dvh correctly elsewhere (nav drawer globals.css:588, bento globals.css:1219, legal drawer legal.css:217), so these two are stragglers.
- **Why:** The grabber/close control of the app-redirect sheet — the site's core conversion modal — can render partially behind Safari's toolbar on long-content states; dvh (or svh) is the 2026 baseline for bottom sheets.
- **Fix:** Change max-height:92vh to 92dvh at app/globals.css:938 and app/globals.css:1050.
- **Evidence:** app/globals.css:938 .nk-sheet max-height:92vh; app/globals.css:1050 .nk-redirect-panel (≤560 sheet) max-height:92vh
- *RB-06 · confidence 0.8 · code-inferred*

### nav

**RSP-455 · MEDIUM** — viewport-fit=cover is set but nav, drawer and footer lack env(safe-area-inset-left/right) (568–950px, state: base, drawer-open; locales: en, lt; landscape phones with notch/Dynamic Island)

- **What:** app/[lang]/layout.tsx:93 sets viewportFit:"cover", so on notched iPhones in landscape the page extends under the sensor housing and env(safe-area-inset-left/right) is ~47-59px. Only the gallery lightbox guards left/right (globals.css:1279-1280). The sticky .nk-nav-bar, the drawer padding (globals.css:585 uses bare var(--nk-gutter)) and .nk-footer all rely on --nk-gutter = clamp(20px,6vw,82px): at 844-932px-wide landscape that resolves to ~50-56px, i.e. equal to or LESS than the 59px inset on iPhone 14/15/16 Pro — the logo, drawer items and footer links can sit partially under the notch/curved corner on one side.
- **Why:** Landscape users on mainstream 2022+ iPhones get chrome content occluded by hardware; safe-area completeness on every fixed bar and drawer edge is the 2026 baseline once you opt into viewport-fit=cover.
- **Fix:** Change .nk-container (globals.css:337) and .nk-nav-drawer-inner (globals.css:585) horizontal padding to max(var(--nk-gutter), env(safe-area-inset-left)) / max(var(--nk-gutter), env(safe-area-inset-right)), or fold the insets into the --nk-gutter definition at globals.css:203.
- **Evidence:** `feed/base-lt-0844x0390-dpr2-vp.png` · `feed/base-lt-0915x0412-vp.png` · app/globals.css:203 --nk-gutter; app/globals.css:337 .nk-container
- *RB-08 · confidence 0.8 · code-inferred*

**RSP-464 · POLISH** — closeAt auto-dismiss restores focus to an opener that just became display:none (561–1440px, state: drawer-open-then-resize; locales: en, lt)

- **What:** useDismissableLayer correctly restores focus to the opener on close — but when the close is triggered by the closeAt media query (drawer at 1121px+, filter sheet at 561px+), the opener (burger / Filters button) is display:none at the new width, so opener.focus() is a silent no-op and keyboard focus drops to <body>.
- **Why:** RB-15 nuance: after a rotate/resize a keyboard or switch user loses their place entirely; focus should land on a visible equivalent (nav links / desktop filter row).
- **Fix:** In use-dismissable-layer.ts cleanup, if the opener is not focusable/visible (offsetParent null), focus a fallback (e.g. layer's aria-labelled control or main landmark) — accept a fallbackFocus ref option.
- **Evidence:** app/lib/use-dismissable-layer.ts:65 (opener?.focus() on cleanup); app/globals.css:579-580 (.nk-nav-burger display:none >1120)
- *RB-15 · confidence 0.75 · code-inferred*

**RSP-466 · POLISH** — Nav bar and drawer rely on the 6vw gutter instead of env(safe-area-inset-left/right) (640–932px, state: base, nav-drawer; locales: en, lt; landscape phones (notch on the long edge))

- **What:** viewportFit:'cover' is set (app/[lang]/layout.tsx:93) and --nk-safe-bottom exists for the bottom inset, but no rule anywhere uses env(safe-area-inset-left/right). The sticky nav and the drawer pad horizontally with var(--nk-gutter)=clamp(20px,6vw,82px); at 740px-wide landscape that is 44.4px against a ~47px notch inset, so edge content (logo, drawer item icons) can tuck into the rounded-corner/notch zone on some devices.
- **Why:** RB-08: every fixed bar/drawer edge should include env(safe-area-inset-left/right) in landscape once viewport-fit=cover is opted into; relying on a vw gutter coincidentally clearing the inset is fragile.
- **Fix:** Define --nk-gutter (or the nav/drawer padding-inline) as max(clamp(20px,6vw,82px), env(safe-area-inset-left)) / …-right, at app/globals.css:203 or on .nk-container/.nk-nav-drawer-inner.
- **Evidence:** `home/nav-drawer-lt-0320x0568-dpr2-vp.png` · app/globals.css:550 .nk-nav-inner; app/globals.css:584 .nk-nav-drawer-inner padding
- *RB-08 · confidence 0.7 · code-inferred*

**RSP-467 · POLISH** — viewport-fit=cover but .nk-container gutter is not maxed against safe-area-inset-left/right (568–932px, locales: en, lt; landscape phones)

- **What:** layout.tsx sets viewportFit:'cover', so env(safe-area-inset-left/right) is real (47-59px on notched iPhones in landscape), but .nk-container pads with plain var(--nk-gutter) = clamp(20px,6vw,82px). In landscape at 852-932px wide that resolves to ~51-56px — up to ~8px short of the 59px inset on Pro Max class devices, letting nav/footer/status content edge under the sensor housing. Bottom insets are handled (--nk-safe-bottom, sheet/drawer paddings) and the redirect modal maxes left/right, but the shared container does not.
- **Why:** RB-08: with cover, every edge-touching layout needs left/right inset guards, not just bottom; the gutter covering it 'by coincidence' breaks the day the gutter token is tuned down.
- **Fix:** app/globals.css:337 — padding-inline:max(var(--nk-gutter),env(safe-area-inset-left)) max(var(--nk-gutter),env(safe-area-inset-right)).
- **Evidence:** `soft-404/base-lt-1024x0768-vp.png` · app/globals.css:337 .nk-container{padding-inline:var(--nk-gutter)}; app/globals.css:203 --nk-gutter:clamp(20px,6vw,82px)
- *RB-08 · confidence 0.65 · code-inferred*

### overlay-redirect

**RSP-456 · MEDIUM** — Redirect bottom sheet also uses raw 92vh instead of dvh (320–560px, state: redirect-open; locales: en, lt; iOS Safari with expanded URL bar)

- **What:** Same defect class as the filter sheet: the ≤560 install-bridge sheet caps at max-height:92vh (large viewport on iOS). Content is short today (QR dropped on mobile), so it rarely binds, but any copy growth or small-viewport zoom makes the sheet head (grabber, close) clip above the dynamic viewport.
- **Why:** Raw vh in a bottom sheet is the canonical RB-06 miss; the fix is one token.
- **Fix:** globals.css:1050 — change 92vh to 92dvh.
- **Evidence:** app/globals.css:1050 .nk-redirect-panel ≤560 {max-height:92vh;overflow:auto}
- *RB-06 · confidence 0.75 · code-inferred*

### grid

**RSP-458 · POLISH** — ≤560 grid columns defined twice at equal specificity — phone layout survives only by source order (320–1024px, locales: en, lt)

- **What:** Seam S3 CONFIRMED as real fragility (no user-visible bug today). .nk-grid-feed/.nk-grid-4 get grid-template-columns:1fr at ≤560 (globals.css:1191/1467) and repeat(2,minmax(0,1fr)) at the same breakpoint and specificity in the later Quiet Luxe layer (globals.css:1903); the 2-up phones ship purely because 1903 comes later in the file. Same class: .nk-hero-panel 1fr ≤1024 (1470) re-widened to 2-col for 901-1024 (1477) by order alone.
- **Why:** Any refactor that splits globals.css, reorders layers, or extracts the Quiet Luxe block silently reverts phones to 1-col browsing — a severe regression with no compile-time signal.
- **Fix:** Delete the dead 1fr rules at app/globals.css:1191 and 1467 (and fold the hero 901-1024 exception into a non-overlapping 561-900/901-1024 pair).
- **Evidence:** app/globals.css:1191 .nk-grid-feed 1fr ≤560 (dead); app/globals.css:1467 .nk-grid-4 1fr ≤560 (dead)
- *RB-01 · confidence 0.95 · code-inferred*

### cards+booking+nav

**RSP-459 · POLISH** — Every font-size in the system — tokens, clamps and inline styles — is px: user browser font-size preference has zero effect (320–3840px, state: user-font-size-200%; locales: en, lt)

- **What:** All --nk-fs-* tokens (globals.css:228-231), the compact skin, and hundreds of inline fontSize values (e.g. ListingDetail.tsx:42-43, 255, 266; AppRedirect.tsx:135-136) are px with no rem anywhere in the type system. Page zoom works, but a user's browser default-font-size setting (the non-zoom a11y path, and the one Android WebView 'Font size' maps to) is completely ignored across the site.
- **Why:** WCAG 1.4.4 is technically satisfiable via zoom, but rem-based type is the 2026 expectation for marketplace-grade a11y, and the app-install audience skews mobile where OS font-size settings are the primary mechanism.
- **Fix:** Systemic, phased: convert the :root --nk-fs-* clamps to rem-based terms first (e.g. clamp(2.125rem,5vw,3.25rem)) — components inherit the win token-by-token without touching inline styles.
- **Evidence:** app/globals.css:228-231 --nk-fs-* (px-based clamps); app/globals.css:1901-1928 (px !important skin)
- *RB-09 · confidence 0.9 · code-inferred*

### hero

**RSP-460 · POLISH** — Store-badge pair renders at 4 different heights (48/51/55/57px) across 6 surfaces (320–1920px, state: app-redirect, base)

- **What:** AppBadges height prop varies per call site: home hero 52 (default, sections-home.tsx:53), CTA banner 50 (AppCtaBanner.tsx:26), invite 50 (InviteScreen.tsx:89), footer 46 (sections-home.tsx:138), HIW hero 44 (HowItWorksScreen.tsx:71), redirect modal 44 (AppRedirect.tsx:181). StoreBadge then multiplies by 1.1 (ui.tsx:68), so rendered heights are 57.2 / 55 / 50.6 / 48.4 CSS px - four near-identical but non-equal sizes of the same two marks.
- **Why:** 2026 design-system practice sizes repeated brand components from a small token scale (e.g. badge-lg / badge-sm); four heights within a 9px band reads as drift rather than hierarchy when surfaces appear near each other (invite hero 55 vs its own footer 50.6 on one screen).
- **Fix:** Collapse to two tokens, e.g. lg=52 (hero, CTA banner, invite) and sm=44 (footer, HIW, modal): change the height props at app/components/AppCtaBanner.tsx:26, InviteScreen.tsx:89 and sections-home.tsx:138; keep the x1.1 optical factor inside StoreBadge.
- **Evidence:** `invite-code/base-lt-1280x0800-vp.png` · `home/app-redirect-lt-1280x0800-vp.png` · `crops from feed/base-lt-1920x1080-fp.png footer` · app/globals.css:532 .nk-appbadges
- *RB-24 · confidence 0.9 · code-inferred*

### rail

**RSP-461 · POLISH** — No horizontal rail sets scroll-snap-stop or overscroll-behavior-x — fast flicks skip cards, edge pans can chain (320–980px, locales: en, lt)

- **What:** All three edge-bleed rails (.nk-grid-4--rail globals.css:1955, .nk-cats-shelf globals.css:2059, .nk-catrail globals.css:1141) omit scroll-snap-stop:always on children and overscroll-behavior-x:contain on the scroller; the only overscroll-behavior in the codebase is the nav drawer (globals.css:589). A hard flick on a mandatory-snap rail can fly past several cards, and a pan that reaches a rail edge chains into horizontal page gestures (browser back-swipe on iOS/Android).
- **Why:** 2026 mobile carousel practice pairs mandatory snap with snap-stop for card-by-card browsing and contains overscroll so a rail swipe never triggers history navigation.
- **Fix:** Add overscroll-behavior-x:contain to the three rail scrollers; consider scroll-snap-stop:always on .nk-grid-4--rail>* and .nk-cats-shelf>* (chips rail needs no snap).
- **Evidence:** app/globals.css:1955 .nk-grid-4--rail; app/globals.css:2059-2061 .nk-cats-shelf
- *RB-14 · confidence 0.85 · code-inferred*

### nav-drawer

**RSP-463 · POLISH** — Drawer max-height budgets for the 68px scrolled nav but sits under the 76px at-rest bar (8px overhang) (320–1120px, state: nav-drawer; locales: en, lt; only bites on viewports shorter than ~556px (landscape phones) with the page unscrolled)

- **What:** Open-drawer max-height is calc(100dvh - var(--nk-nav-h-scrolled)) = 100dvh - 68px, but at scrollY≤16 the bar above it is --nk-nav-h = 76px tall. When the dvh term wins (viewport < ~556px tall, e.g. 844×390 landscape) the drawer's scrollport bottom lands 8px below the viewport edge, clipping the bottom 8px of its internal scroll area (safe-area padding / last control edge).
- **Why:** Overlay fit math should be exact; an 8px offscreen strip of a scrollable overlay is unreachable content on landscape phones.
- **Fix:** Use var(--nk-nav-h) in the calc at app/globals.css:583 (the bar can only be at-rest when its bottom edge is lowest), or set max-height via top-anchored positioning: max-height:calc(100dvh - 76px).
- **Evidence:** `home/nav-drawer-lt-0320x0568-dpr2-vp.png` · app/globals.css:583 .nk-nav-drawer.open max-height:min(calc(100dvh - var(--nk-nav-h-scrolled)),480px); app/globals.css:153 --nk-nav-h:76px / --nk-nav-h-scrolled:68px
- *RB-23 · confidence 0.8 · code-inferred*


---

# Cross-cutting systems

### Grids & cards
The three grid families (`.nk-grid-feed`, `.nk-grid-4`, `.nk-grid-cats`) all use explicit `repeat(N)` width ladders. Ladders create three defect classes found repeatedly: track widths that undercut the component's own minimum (categories at ladder entries, RSP-307), card-width cliffs at ladder steps (−26/28 % at 1024→1025), and 1 px seam risk at fractional viewport widths under browser zoom (RSP-232, demoted to edge-case). `auto-fill/minmax()` versions — already half-present in the cats base rule before the ladders override it — retire all three at once. The OfferCard itself is the site's most-context component (feed grid, home rail, similar rail, landing grids) and the single best container-query candidate: today a 207 px card can wear desktop type while a 240 px card wears the compact skin, purely by viewport (RSP-149 family, 40 RB-03 findings).

### Typography
Two systems coexist: a genuinely good clamp()/token ramp (`--nk-fs-*`, 61 clamp() uses) and a stepped `!important` compact skin ≤560 that overrides it — every 560/561 type cliff (+18–50 %) traces to this double system (RB-09 ×30). Wrap policy is the second axis: `overflow-wrap:anywhere` on display headings splits Lithuanian words unhyphenated (RSP-001 — the audit's headline defect), review/UGC text lacks `hyphens:auto` (RSP-233), page H1s lack `text-wrap:balance` (RSP-322), and the smallest text on the site is a 9.5–10.5 px tracked-uppercase card eyebrow that still truncates (RSP-014/021/078). The site sets `lang` correctly, so `hyphens:auto` is a one-line unlock per element class.

### Overlays & sheets
Four ad-hoc sheet/drawer implementations (filter sheet, install sheet/dialog, legal TOC drawer, nav drawer) share no primitive, and each misses a different modern requirement: raw `92vh` heights (RSP-425), no dialog max-height (RSP-426), unpinned headers (RSP-427), missing scroll-lock compensation (RSP-437), scrim without lock (RSP-099), focus dropped on breakpoint auto-close (RSP-121). One shared sheet primitive — `max-height:min(92dvh,92svh)`, sticky header, `env()` padding, `scrollbar-gutter` compensation, focus-restoring close — resolves ~20 findings across four chapters.

### Fixed chrome & viewport budgets
The nav (76→68 px scrolled), the feed/landing filter bar (up to 3 wrapped rows), the detail mbar (~72 px + inset) and FABs are all width-gated only. On the height axis they stack to 37–43 % of landscape-phone viewports (RSP-154/241) and ~32–35 % at 561–1024 short windows (RSP-165); the worst case is 561–700 landings where the desktop toolbar pins ≈250 px (RSP-321). The codebase already has the pattern to fix this — the short-phone token retarget at `(max-width:560px) and (max-height:700px)` — it just needs a `(max-height:520px)` tier that unsticks/collapses secondary chrome regardless of width.

### Snap rails
Three rails (`.nk-catrail`, `.nk-cats-shelf`, `.nk-grid-4--rail`), consistent visual language, but none sets `scroll-snap-stop`, `overscroll-behavior-x`, or `scroll-padding-inline`; snap alignment differs per rail (flush edge vs gutter); the home shelf can render an exact-fit tile count with no continuation affordance (RSP-006); the feed catrail never scrolls its active chip into view (RSP-131). A rail checklist (stop, containment, padding, peek, active-into-view, keyboard focus scroll) applied to all three closes 19 findings.

### Accessibility-responsiveness
Reflow at 320 px (≈1280@400 % zoom) passes across the site — a real strength. The failures are targeted: WCAG 1.4.12 text-spacing clips on `nowrap`/clamped elements (hero lead RSP-005, nav CTA/breadcrumb/verified-badge RSP-281, empty titles RSP-107); the touch-target floor misses on secondary controls (38 px chips RSP-122, 36 px favourites RSP-015, 34 px reset RSP-151, 20 px mailto RSP-411); keyboard focus is dropped by breakpoint-triggered auto-close (RSP-121) and by the cancel-deletion submit swap. Hover-gated styling consistently has touch-visible equivalents (attested clean repeatedly) — the pointer gating itself is done well.

### Ultrawide & content caps
The cap family (teisine 1100 · legal 1280 · detail 1340 · feed 1480 · cats 1520 · container 1920) renders centered and deliberate to 3840 — verified across TIER-3. Incoherences are minor: the feed grid's `max-width:none` override makes the feed the only full-bleed-ish surface ≥1537 (reads as intent, 5-up density was requested); the footer's cap follows each page, so its column rhythm differs subtly between siblings; prose measure exceeds 90ch only on detail ≥1025 (RSP-class) — the one real readability miss at wide.

### Seam-lattice health
Of the 17 width cut-lines, most seams verified clean at ±1 px (560/561 form flips, 980/981 sidebar, 1180/1181 TOC, 1440/1441 cats — all attested). The pathologies: the 1025–1120 hero hole (RSP-001), the 1120 min/max + 1121 triplet (invite splits *at* the width where nav still collapses — currently safe, structurally fragile; plus the locale/CTA hit-box abutment just above, RSP-066), three dead rules (≤400 cat-h, ≤430 lhead actions, ≥1200 `--nk-stack-md`), the 981–993 detail min-content squeeze masked by `overflow-x:clip`, and equal-specificity double definitions in the ≤560 layer that survive only by source order — a refactor hazard flagged by the code finders.

---

# 2026 techniques adoption map

Current state: **container queries 0 uses · dvh 3 uses · svh 0 · text-wrap 12 (partial) · scroll-snap 3 rails (incomplete) · safe-area bottom-only · scrollbar-gutter 0 · hyphens 0**. The table below is the concrete migration path; effort S <½ day, M ≈1–2 days, L = architecture pass.

| # | Change | Where (anchor) | Effort | Impact |
|---|---|---|---|---|
| 1 | `@container` skin for OfferCard (name the grid wrappers `container-type:inline-size`; move the ≤560 `!important` skin + type steps to `@container (max-width:240px)` tiers) | `cards.tsx` + `globals.css` compact-skin block | **L** | Retires 40 RB-03 findings + the 560/561 card cliffs; cards finally match their actual width in all 4 contexts |
| 2 | `@container` for category tile + HIW phone mock | `.nk-catv2__*`, `.htw-phone` | M | Same class of wins on 2 more multi-context components |
| 3 | Intrinsic grids: `repeat(auto-fill,minmax(min(100%,var(--nk-card-min)),1fr))` replacing the `.nk-grid-feed`/`.nk-grid-4`/`.nk-grid-cats` ladders (define `--nk-card-min`; keep the ≥1281 rail cap) | `globals.css` grid ladder block | M | Kills RSP-307, the 1024/1025 cliffs, fractional-width seam risk |
| 4 | `svh`/`dvh` pass: `.nk-sheet` + `.nk-redirect-panel` → `max-height:min(92dvh,92svh)`; `.nk-statusmain` 62vh→`62svh`; legal TOC/root vh→dvh | `globals.css:948, 1060`, status/legal blocks | **S** | Fixes RSP-425 family; sheet tops stop clipping under mobile toolbars |
| 5 | Desktop dialog `max-height:min(90dvh,90svh)` + `overflow:auto` | `.nk-redirect-panel` desktop form | **S** | RSP-426 — install dialog usable on landscape phones/short laptops |
| 6 | Pinned sheet headers: `position:sticky;top:0` + surface background on sheet/drawer titles | filter sheet, TOC drawer | S | RSP-427; close button always reachable |
| 7 | `scrollbar-gutter:stable` (or padding compensation) with every scroll lock | overlay lock helper | **S** | RSP-437/376 — no background shift on open |
| 8 | Delete `.nk-empty__title` nowrap; add `overflow-wrap:anywhere` to the query-echo span + ellipsize the echo variable in `emptySubtitle` | `globals.css:843` + dict fns | **S** | RSP-107 family (4 findings, site-wide states) |
| 9 | LT wrap policy: `hyphens:auto` on UGC (reviews, descriptions, card titles, breadcrumb labels); remove `overflow-wrap:anywhere` from display headings; `text-wrap:balance` on `.nk-h-page`/hero H1 (+`pretty` on intros) | type ramp block | M | RSP-001/233/322 + the 29-finding wrap family |
| 10 | Hero ramp step for 1025–1120 (`--nk-fs-hero` mid tier) | `:root` ramp + ≥1121 rule | **S** | Closes the RSP-001 ladder hole specifically |
| 11 | Rail checklist on all 3 rails: `scroll-snap-stop:always`, `overscroll-behavior-x:contain`, `scroll-padding-inline:var(--nk-gutter)`, half-tile peek basis, active-chip `scrollIntoView` | rails block + `FeedScreen.tsx` | S–M | RSP-006/024/042/131/236 (19 findings) |
| 12 | Safe-area sides: add `env(safe-area-inset-left/right)` to nav padding, `.nk-mbar`, FABs, drawers, edge-bleed rails (extend the `--nk-safe-bottom` token pattern with `--nk-safe-x`) | fixed-chrome blocks | S | RSP-235/060 family (29 findings) |
| 13 | Height-aware chrome tier: `@media(max-height:520px)` unsticks filter bar, condenses nav, keeps mbar only | nav/filterbar/mbar blocks | M | RSP-154/165/241/321 — landscape budget back under 40 % |
| 14 | `sizes` correction on detail bento (cap-aware: `(max-width:980px) 100vw, min(60vw, 800px)`) and lightbox | `ListingDetail.tsx:69` | **S** | Bento overfetch at wide; (OfferCard `sizes` verified already correct) |
| 15 | Clamp `?page` to last page; suppress filter-blame copy when no filters active | `landing-params.ts`, `FeedScreen.tsx` | **S** | RSP-108/117 |
| 16 | Focus restore fallback in `useDismissableLayer` (`closeAt` path → focus the surviving equivalent control or `main`) | `app/lib/use-dismissable-layer.ts` | S | RSP-121/464 |
| 17 | Dead-rule deletions (≤400 cat-h, ≤430 lhead, ≥1200 stack-md) + de-duplicate the equal-specificity ≤560 grid definitions | `globals.css` | **S** | Seam-lattice hygiene; prevents silent regressions |
| 18 | Legal stacked-table transform: one flow container per cell body | `legal.css` ≤700 block | M | RSP-365 — restores sentence integrity |

---

# Appendices


## Appendix A — Rejected findings (verification)

Claims killed during verification, with the disproof:

- **RSP-110** “OfferCard sizes claims 92vw up to 760px but the grid renders 2-up (~44vw) since Quiet Luxe” → **REJECTED**: cards.tsx:59 sizes is a correct per-band ladder ((max-width:560px) calc(50vw - 28px), ..., 240px) — no 92vw on OfferCard; claim contradicts current code
- **RSP-111** “OfferCard sizes=92vw on phones where cards render ~44vw in the 2-up grid (~4x pixels wasted)” → **REJECTED**: duplicate of RSP-110 refutation — sizes ladder is correct
- **RSP-113** “OfferCard sizes='(max-width:760px) 92vw' but the grid is 2-up below 700px — ~4x image bytes” → **REJECTED**: duplicate of RSP-110 refutation — sizes ladder is correct
- **RSP-320** “OfferCard sizes claims 92vw on phones but the mobile grid renders 2-up ~45vw cards” → **REJECTED**: duplicate of RSP-110 refutation — sizes ladder is correct


## Appendix B — Unproven observations (confidence < 0.65)

Reported by finders but not substantiated to the main-body bar; listed for completeness, not action:

- **RSP-065 · MEDIUM** [home] Category tiles are fixed-height (--nk-cat-h) with overflow:hidden — WCAG 1.4.12 text-spacing clips — *confidence 0.6, code-inferred* — Every category tile is a fixed 208px box (globals.css:739 height + overflow:hidden) containing a two-deck text stack (title up to 2 lines, e.g. 'Garsas, muzika ir renginių technika', plus an examples sub-line at 13.5px/1
- **RSP-066 · MEDIUM** [home] Locale trigger's hit-box intersects the nav install CTA just above the 1120px burger seam (LT) — *confidence 0.55, measured* — The DOM-measured lead at 1121px (LT) reports a 511 CSS-px^2 intersection between button.nk-locale-trigger and the .nk-nav-cta install button (~11px x 44px). .nk-nav-links has min-width:0 + white-space:nowrap and a gap fl
- **RSP-281 · MEDIUM** [detail] WCAG 1.4.12 text-spacing override clips nav CTA label, breadcrumb segment and verified pill at 320px — *confidence 0.6, measured* — Under the text-spacing test state (letter/word-spacing + line-height bumps) the auto-metric flags clipped text on button.nk-btn--primary ('Atsisiusti programele'), span.nk-crumbs__seg ('Elektronika ir technologijos') and
- **RSP-282 · MEDIUM** [detail] Delivery-zone map graphic renders as a completely empty 200px box in every capture — *confidence 0.5, visual* — In ALL examined shots (320, 560, 981) the DeliveryZoneGraphic is a bare bordered rectangle: no road-grid hairlines, no radius circles, no purple pin, no 'Iki 250 km' overlay chip - despite ListingDetail.tsx:622-644 rende
- **RSP-315 · MEDIUM** [categories] Fixed-height category tiles (138-248px, overflow:hidden) will clip under WCAG 1.4.12 text spacing — *confidence 0.6, code-inferred* — .nk-cat uses a hard height (var(--nk-cat-h,248px), 138px on the ≤560 2-up grid) with overflow:hidden, containing a multi-line title plus example/meta lines (.nk-catv2 anatomy). Injecting the 1.4.12 test values (line-heig
- **RSP-316 · MEDIUM** [categories] Fixed-height overflow:hidden tiles with unclamped examples line will clip under WCAG 1.4.12 text spacing — *confidence 0.6, code-inferred* — Tiles are hard-sized (height:var(--nk-cat-h) = 208px) with overflow:hidden, and the bottom meta block stacks a 2-line-clamped 20px/25px title plus an UNCLAMPED 13.5px/18px examples paragraph. At 561-980px the long tiles 
- **RSP-333 · MEDIUM** [seo-landings] Interruption banner splits after 6 cards on first paint, then jumps to a measured row boundary on 4/5-col grids — *confidence 0.6, code-inferred* — FeedScreen.tsx:344 computes splitAt = max(columns, round(6/columns)*columns) from useMeasuredColumns, which reads the grid in a post-mount useEffect (useMeasuredColumns.ts:13) - so SSR HTML and first paint always use the
- **RSP-457 · MEDIUM** [chrome-crosscutting] Open nav drawer dims the page with a full scrim but leaves background scroll unlocked — *confidence 0.6, code-inferred* — Nav mounts useDismissableLayer with lockScroll:false (app/components/sections.tsx:86-89), so while the drawer is open and the fixed .nk-nav-scrim dims the entire page, touch/wheel scrolling on the scrim still scrolls the
- **RSP-103 · POLISH** [home] CTA banner phone image is display:none'd ≤980 but stays in the DOM with sizes 60vw — hidden-asset bytes on tablets — *confidence 0.6, code-inferred* — AppCtaBanner.tsx:12 renders the 899x705 download-phone via next/image with sizes="(max-width:980px) 60vw, 480px", while globals.css:1733 hides it entirely below 981px. Depending on the browser's lazy-load handling of box
- **RSP-104 · POLISH** [home] Hero body copy runs onto the phone mockup's bezel at 1025-1120 (LT) — *confidence 0.6, visual* — At 1112 and 1119px the ends of the LT subtitle lines ('...foto technika ar', '...galutine suma ir') visually sit on the tilted phone image's dark bezel/corner, which juts left of its grid column (position:absolute, trans
- **RSP-105 · POLISH** [home] 'Pristatymas' delivery badge truncates on 2-up cards at ≤344px — *confidence 0.55, code-inferred* — Auto-metrics flag span.nk-offer__badge text 'Pristatymas' as clipped on three cards in every 320px home shot. At 320 the 2-up grid yields ~139px cards; the badge is capped at max-width:calc(100% - 52px) ≈ 87px while 'Pri
- **RSP-106 · POLISH** [home] Fixed nav, drawer and snap-rail edges rely on --nk-gutter instead of env(safe-area-inset-left/right) in landscape — *confidence 0.55, code-inferred* — Only one selector in globals.css (1278-1279) uses horizontal safe-area env(); the sticky nav inner, the open drawer's item padding and the edge-bleed categories rail all pad with --nk-gutter = clamp(20px,6vw,82px). At 78
- **RSP-229 · POLISH** [feed] Append skeletons run ~11% taller than compact loaded cards at ≤560 — *confidence 0.6, measured* — During infinite-scroll append at 390px the 2-up OfferCardSkeleton tiles measure ~312px tall vs ~281px for adjacent loaded compact cards — the skeleton's body lines are sized for the full-size card type (20px title / 27px
- **RSP-230 · POLISH** [feed] At the 1121px full-nav seam the locale trigger's hit box overlaps the nav CTA — *confidence 0.55, measured* — Just past the hamburger->full-nav seam (1120/1121) the inline nav is at its densest: the auto-metric reports the 'Kalba' locale trigger's bounding box overlapping the 'Atsisiusti programele' CTA by 511px2 at 1121x800; vi
- **RSP-231 · POLISH** [feed] Interruption banner splits at 6 cards until useMeasuredColumns reports, then jumps to 8 on 4/5-up — *confidence 0.55, code-inferred* — splitAt (FeedScreen.tsx:344) defaults from columns=1 (useMeasuredColumns.ts:10 initial state) → 6, so SSR/first client paint places the banner after 6 cards; once the ResizeObserver reads 4–5 real columns the split becom
- **RSP-306 · POLISH** [detail] Under WCAG text-spacing overrides the detail page's 'Tapatybe patikrinta' span and a crumb segment report clipping — *confidence 0.45, measured* — The harness text-spacing pass (1.5 line-height / 0.12em letter-spacing) flags span 'Tapatybe patikrinta' and span.nk-crumbs__seg 'Elektronika ir technologijos' as clipped at 320. Caution: the same detector flagged the na
- **RSP-318 · POLISH** [categories] --nk-gutter has no env(safe-area-inset-left/right) guard while overlays already use one — *confidence 0.55, code-inferred* — Page horizontal padding comes solely from --nk-gutter (clamp(20px,6vw,82px)); unlike the AppRedirect overlay (globals.css:1277-1279), it is not wrapped in max(..., env(safe-area-inset-left/right)). In landscape on notche
- **RSP-364 · POLISH** [hiw] viewport-fit=cover is set but nav drawer/gutters never consume safe-area-inset-left/right — *confidence 0.6, code-inferred* — layout.tsx:93 sets viewportFit:"cover", making side insets real in landscape on notched phones, yet only safe-area-inset-bottom (and lightbox top) are consumed. The full-width nav drawer (.nk-nav-drawer-inner, globals.cs
- **RSP-395 · POLISH** [legal] Prose links are inline-flex boxes: multi-word links can't break across line ends and center-wrap internally — *confidence 0.6, code-inferred* — Every in-article link is display:inline-flex with justify-content:center (a tap-target hack for min 24×24). An inline-flex box is atomic for line breaking: a multi-word link near a line end drops to the next line as a un
- **RSP-396 · POLISH** [legal] Persistent FABs occlude the footer's bottom corners at end of scroll; article-only clearance — *confidence 0.6, code-inferred* — The 96px bottom clearance is on .nk-lg-shell (the article), so at full scroll the always-visible Turinys FAB (left) and back-to-top (right) permanently cover the footer's last rows (payment marks / copyright at bottom-le
- **RSP-397 · POLISH** [legal] 11px uppercase micro-labels (callout 'SVARBU/TRUMPAI') sit below the common 12px floor — *confidence 0.6, measured* — The callout label renders at 11px letterspaced uppercase (matches the auto-metric minFontPx:11 on every mobile shot). It labels legally meaningful callouts (the amber irreversible-deletion warning) rather than being pure
- **RSP-398 · POLISH** [legal] Drawer body-scroll lock is overflow:hidden only — iOS Safari background can still rubber-band — *confidence 0.6, code-inferred* — LegalChrome.tsx:80 locks background scroll with document.body.style.overflow='hidden'. On iOS Safari this does not reliably prevent background scrolling/rubber-banding behind the open TOC drawer, and the drawer panel has
- **RSP-399 · POLISH** [legal] Two-digit TOC section numbers flagged as clipped under WCAG 1.4.12 text-spacing overrides — *confidence 0.55, code-inferred* — In the 1280×800 text-spacing capture the auto-metric reports scrollWidth>clientWidth on span.nk-lg-toc__num for sections 10, 12, 13, 15, 16 (the two-digit numbers): with letter-spacing 0.12em added, '1'+'0'+tracking exce
- **RSP-400 · POLISH** [legal] Two-digit TOC numbers metric-flagged as clipped at 1280 under text spacing — *confidence 0.4, code-inferred* — The auto-metric reports span.nk-lg-toc__num clipped for items 10/12/13/15/16 in the sticky sidebar TOC at 1280. The num span sits first in a flex anchor next to a long label; it has min-width:1.4em but default flex-shrin
- **RSP-410 · POLISH** [invite] Post-validation DOM inserts (reward line / invalid note, headline swap, chip removal) shift the hero after first paint — *confidence 0.55, code-inferred* — InviteScreen.tsx:42-51 swaps the h1 string and conditionally inserts a <p.invite-reward> (line 70) or invalid note (line 73) once useValidateCode resolves, and removes the code chip on confirmed-invalid (line 102). None 
- **RSP-424 · POLISH** [errors] EmptyState sizes itself by viewport (20vw illus, 561px media) across 3+ container contexts — *confidence 0.6, code-inferred* — The .nk-empty component renders in at least three different containers — the full-page StatusScreen main (StatusScreen.tsx:44), the CategoriesScreen results band under its own page chrome (CategoriesScreen.tsx:86-105), a
- **RSP-468 · POLISH** [chrome-crosscutting] Base button declares overflow-wrap:anywhere under white-space:nowrap — the escape hatch is inert above 560px — *confidence 0.6, code-inferred* — .nk-btn sets both overflow-wrap:anywhere and white-space:nowrap in the same rule; nowrap suppresses all soft-wrap opportunities, so anywhere does nothing until the ≤560 override flips to normal. Between 561-1024px a long
- **RSP-469 · POLISH** [chrome-crosscutting] Primary nav collapses to a hamburger up to 1120px, leaving a ~1200px dead zone in the bar — *confidence 0.6, visual* — At 1119/1120 (and the whole 900-1120 band) the bar shows only logo + 'Get app' + burger with an empty middle spanning most of the width; the three primary links + locale switcher (~600px incl. LT strings) would fit comfo


## Appendix C — Verified good (positive attestations)

Behaviors verified correct with evidence — the counterweight to the findings list:

### Home (/)
- Closed mobile drawer is genuinely inert (inert attr + max-height:0 + overflow:hidden) - the auto-metric drawer/h1 overlaps are false positives (evidence: home/base-lt-0560x0900-dpr2-vp.png)
- Stacked <=560 hero search is a textbook mobile pattern: labeled rows (DAIKTAS/MIESTAS), full-width 48px submit, divider repurposed as hairline (evidence: home/base-lt-0431x0932-dpr2-vp.png)
- Category rail shows a clear continuation peek + edge fade at both 431 and 560, and skeletons share tile height so data landing cannot jump the rail (evidence: home/base-lt-0560x0900-dpr2-fp.png)
- Store badges stay on one row with 44px tap floor and scale cleanly from 431 to 560 (evidence: home/base-lt-0431x0932-dpr2-vp.png)
- EN locale at 560 renders the same anatomy with shorter copy - no truncation or badge overflow in the green trust pill despite the much longer EN string (evidence: home/base-en-0560x0900-dpr2-fp.png)
- Footer 2-col category/city/help stacks wrap cleanly at 431 with no orphaned columns; payment marks and social targets well sized (evidence: home/base-lt-0431x0932-dpr2-fp.png)
- Sticky nav consumes only 8-11% of viewport across the band incl. the 720px-tall shot (evidence: home/base-lt-0540x0720-dpr2-vp.png)
- No horizontal overflow at any B2 width, LT or EN (evidence: home/base-lt-0361x0800-dpr2-fp.png, home/base-en-0430x0932-dpr2-fp.png)
- Reveal integrity: scroll-driven reveals leave no stuck-hidden sections - reveal-integrity full page identical to base (evidence: home/reveal-integrity-lt-0390x0844-dpr2-fp.png)
- Store badges hold one row with 44px tap floor at 361px (evidence: home/base-lt-0361x0800-dpr2-vp.png)
- Category snap rail shows ~2.2 tiles with peek + edge-fade continuation affordance (evidence: home/base-lt-0390x0844-dpr2-fp.png)
- Sticky nav budget excellent: 8-12% of viewport, icon-only 44px CTA + 46px burger at phone widths (evidence: home/base-lt-0375x0667-dpr2-vp.png)
- Footer two-column link columns + payment marks hold cleanly at 361px with generous tap spacing (evidence: home/base-lt-0361x0800-dpr2-fp.png)
- Card focus ring clearly visible in the compact skin (evidence: home/loading-detail-lt-0390x0844-dpr2-vp.png)
### Listings feed (/skelbimai)
- 2-up compact feed grid holds cleanly from 361 to 430 with zero horizontal overflow at any tested width (evidence: feed/base-lt-0361x0800-dpr2-fp.png)
- Result count shows an honest em-dash while loading instead of a stale claim, left-aligned opposite the clear control on mobile (evidence: feed/skeleton-feed-lt-0390x0844-dpr2-vp.png)
- Offline strip renders inline above still-browsable cached results without layout shift or fixed-bar cost (evidence: feed/offline-strip-lt-0390x0844-dpr2-vp.png)
- Sticky filterbar keeps only search + Filters pinned (solid bg, clean clip edge) and consumes at most 25% of a 667px viewport (evidence: feed/back-to-top-lt-0390x0844-dpr2-vp.png)
- Back-to-top FAB respects env(safe-area-inset-bottom) and sits clear of footer content (evidence: feed/back-to-top-lt-0390x0844-dpr2-vp.png)
- Category rail edge-fades via mask-image at both gutters — a proper continuation affordance (evidence: feed/base-lt-0430x0932-dpr2-vp.png)
- LT and EN render identical geometry at 390 and 430; localized price formats ('20 € / diena' vs '€20 per day') both fit the compact pricebar (evidence: feed/base-en-0430x0932-dpr2-fp.png)
- 400 vs 401 and 700 vs 701 boundary pairs show no seam artifacts (evidence: feed/base-lt-0401x0844-dpr2-fp.png)
- Interruption banner goes full-width with a full-width CTA at <=560 and sits on a row boundary between the two grids (evidence: feed/base-lt-0400x0844-dpr2-fp.png)
- Extreme 60+-char titles truncate to a clean 2-line clamp with ellipsis + title tooltip at every band 320–1280 (evidence: mock-stress-feed/base-lt-0430x0932-dpr2-fp.png)
- Stress price 9999,99 € + '/ diena' + rating '5,0 (12345)' never clip; the pricebar's flex-wrap drops the rating to its own right-aligned line at narrow cards exactly as designed (evidence: mock-stress-feed/base-lt-0320x0568-dpr2-fp.png)
- Interruption banner always lands on a whole row boundary: after 6 cards at 2/3-up and 8 at 4-up (evidence: mock-stress-feed/base-lt-0768x1024-dpr2-fp.png, mock-pag-first/base-lt-1280x0800-fp.png)
- Pagination endpoint states are correct: first page shows only 'Kitas puslapis', last page (8/8, 3-card partial row) only 'Ankstesnis'; pager centers and wraps at 320 (evidence: mock-pag-last/base-lt-0320x0568-dpr2-fp.png)
- Filter-empty state at 390 is coherent: 'Vaikams ×' + 'Pristatymas galimas ×' chips, Filtrai badge '2', 0 count, and a single 'Išvalyti filtrus' recovery action (evidence: mock-empty-filter/base-lt-0390x0844-dpr2-fp.png)
### Listing detail (/skelbimai/[id])
- Viewport-aware bento height (clamp with 100dvh term + max-height:780 rule) keeps the booking-panel price visible at/near the fold on 900px and 826px tall desktops (evidence: detail-full/base-lt-1440x0900-vp.png, detail-full/base-lt-1536x0826-vp.png)
- Count-aware gallery degrades gracefully: single failed photo renders one full-width tile with the ImageOff placeholder, never a grid of grey boxes (evidence: detail-full/base-lt-1440x0900-fp.png)
- 1119->1121 nav seam is clean: burger swaps to full link row with zero content reorder or type cliff (evidence: detail-full/base-lt-1119x0800-fp.png vs detail-full/base-lt-1121x0800-fp.png)
- 1440->1441 renders pixel-identical - no phantom seam (evidence: detail-full/base-lt-1441x0900-fp.png)
- Ultrawide strategy coherent: 1340px cap centered with balanced margins at 1728, sidebar/host cards aligned (evidence: detail-full/base-lt-1728x1000-fp.png)
- EN locale parity: longer/shorter EN strings ('Reserve in the app', 'Identity checked') fit every slot; UGC original-language disclosure note renders on /en (evidence: detail-full/base-en-1024x0768-fp.png, detail-full/base-en-1440x0900-fp.png)
- Empty-reviews state mirrors the section geometry with a clear CTA at every width (evidence: detail-full/base-lt-1440x0900-fp.png)
- Pathological unbroken e2e title wraps safely via text-wrap:balance + overflowWrap:anywhere, and header actions wrap below it at 981-1119 without crowding (evidence: detail-full/base-lt-0981x0900-fp.png)
- NOTE (capture artifact, not assessed): the handover Google-Maps iframe paints as an empty bordered box in every shot - headless capture does not paint the embed; the DeliveryZoneGraphic fallback path exists in code for the no-key case
- 980→981 layout swap is exemplary: sidebar booking+owner cards replace the inline cards and fixed bar with no duplicated owner card and no content loss (evidence: detail-full/base-lt-0980x0900-fp.png vs detail-full/base-lt-0981x0900-fp.png)
- 1119→1121 nav seam clean: burger→full desktop nav with no reflow of page content (evidence: detail-full/base-lt-1119x0800-fp.png vs detail-full/base-lt-1121x0800-fp.png)
- Fixed reserve bar guards its own text: price label ellipsizes at max-width:min(52vw,340px), CTA flex:none — no clipping at 560 (evidence: detail-full/base-lt-0560x0900-dpr2-vp.png)
- Current-page breadcrumb chip is dropped ≤680 where it would duplicate the H1, with the preceding chevron also removed via :has (evidence: categories/base-lt-0560x0900-dpr2-fp.png)
- Footer 1024→1025 reflow to 4 columns is clean and balanced (evidence: detail-full/base-lt-1025x0768-fp.png)
### Categories (/kategorijos)
- Ultrawide cap is deliberate and centered: at 1920 the grid spans x283-1635 (283/285 margins, measured), and 3440/1920 read as the same system with nav/footer on the wider shell (evidence: categories/base-lt-1920x1080-fp.png, categories/base-lt-3440x1440-fp.png)
- Zero horizontal overflow at all 73 captured widths including the 320 floor and 344 Fold cover (auto-metric overflow:0 + visual at 320/344-class shots) (evidence: categories/base-lt-0320x0568-dpr2-fp.png)
- Skeleton/tile height share one token (--nk-cat-h) and skeleton count matches the wire's constant 12 — no cold-load layout shift by construction (evidence: app/globals.css:770, CategoriesScreen.tsx:18)
- Hover choreography is properly pointer-gated: arrow/watermark/chip motion only under hover:hover+pointer:fine, with a :focus-within keyboard path and static arrow on touch (evidence: categories/base-lt-0430x0932-dpr2-fp.png shows arrows... hidden ≤400 by design; app/globals.css:2008-2020)
- All 12 LT titles + examples fit without truncation at 393, 430, 560, 700, 980 and 1440 (evidence: categories/base-lt-0393x0851-dpr2-fp.png, categories/base-lt-1440x0900-fp.png)
- EN locale mirrors LT geometry at 360/900/1024 with no locale-specific breakage (evidence: categories/base-en-0360x0800-dpr2-fp.png)
- Mobile nav chrome stays lean: icon-only 44px CTA + 46px burger at ≤560, sticky consumption max 14% at 320x568 (evidence: categories/base-lt-0360x0800-dpr2-vp.png)
- Landscape tablet 1024x768 fully usable: 4-up grid, complete H1/search/count above the fold (evidence: categories/base-lt-1024x0768-vp.png)
### SEO landings (/nuoma/…, /miestai/…)
- 344px Fold-cover width renders cleanly — nav, chips, filter chip row, empty state all intact (evidence: hub-sveikata/base-lt-0344x0882-dpr2-fp.png)
- Empty landing states are honest and recovery-oriented: city-specific title, browse + list-item CTAs, correct geometry at 320 and 673 (evidence: subcat-city-deep/base-lt-0320x0568-dpr2-fp.png, hub-sveikata/base-lt-0673x0841-dpr2-fp.png)
- 560→561 empty-state/SEO-block seam is smooth — no reorder, proportional type (evidence: cat-city-branch/base-lt-0560x0900-dpr2-fp.png vs base-lt-0561x0900-dpr2-fp.png)
- Long authored intros clamp to 3 lines with a working expand toggle at 320 (evidence: hub-transportas/base-lt-0320x0568-dpr2-fp.png)
- Breadcrumb drops the current-page crumb ≤680 so the trail stays one row and never duplicates the H1 (evidence: subcat-longest/base-lt-0360x0800-dpr2-vp.png)
- Category rail has a gutter fade mask as a continuation affordance; next chip peeks at every width (evidence: city-vilnius/base-en-0360x0800-dpr2-fp.png)
- Portrait-phone sticky budget healthy: nav + collapsed filter bar = 20-29% of 568-800px viewports (evidence: city-vilnius/base-lt-0375x0667-dpr2-vp.png)
- Result count shows an em-dash while unknown and locale-correct pluralization when known ('4 pasiūlymai' / '0 pasiūlymų') (evidence: hub-transportas/base-lt-0320x0568-dpr2-fp.png)
- Interruption banner sits on a true row boundary after 4 cards at 2-up and never orphans a card (evidence: city-vilnius/base-lt-0344x0882-dpr2-fp.png)
- EN locale parity: same layout, shorter 'Delivery' badge fits even at 320-360, translated chips/crumbs intact (evidence: city-vilnius/base-en-0360x0800-dpr2-fp.png)
- Auto-metric drawer-item/crumb/H1 'overlaps' in the shot manifests are false positives — the closed nav drawer (max-height:0, opacity:0, overflow:hidden) keeps layout geometry; do not re-flag (evidence: city-vilnius/base-lt-0320x0568-dpr2-vp.png shows no visible overlap)
- Ultrawide strategy is deliberate: 1920 container cap centered with balanced dead margins at 3440, 5-up grid fills the cap (evidence: city-vilnius/base-lt-3440x1440-fp.png)
- Nav collapse seam is clean: burger at 1119, full links at 1121, zero reflow below the header (evidence: hub-sveikata/base-lt-1119x0800-vp.png vs hub-sveikata/base-lt-1121x0800-vp.png)
- Sticky chrome budget healthy on short laptops: nav + filterbar = 32% of a 768-tall viewport, content keeps 68% (evidence: subcat-longest/base-lt-1024x0768-vp.png)
### How it works (/kaip-tai-veikia)
- 320px hero: 4-line balanced H1, no mid-word breaks, store badges pair fits with comfortable gap, breadcrumb intact (evidence: hiw/base-lt-0320x0568-dpr2-fp.png)
- Fold-cover 344px fully intact — full-width toggle, steps, trust cards, FAQ, footer all clean (evidence: hiw/base-lt-0344x0882-dpr2-vp.png)
- Text-spacing (WCAG 1.4.12) stress at 320 and 768: step reveals grow (grid-rows auto), trust cards and FAQ absorb the spacing with zero visible clipping (evidence: hiw/textspacing-lt-0320x0568-dpr2-fp.png, hiw/textspacing-lt-0768x1024-dpr2-fp.png)
- EN copy parity: 'Renter/Owner' toggle, step titles, tags and CTAs all fit at 320 and 1120 — no LT-vs-EN length breakage (evidence: hiw-owner/base-en-0320x0568-dpr2-fp.png, hiw/base-en-1120x0800-fp.png)
- 375x667 above-the-fold: eyebrow + H1 + lead + store badges all visible on the first screen — strong install-funnel fold composition (evidence: hiw/base-lt-0375x0667-dpr2-vp.png)
- Owner role deep-state (s4) renders correct payout screen with completed pill and role-matched 'Ikelti skelbima' CTA at 1120 and 320 (evidence: hiw/hiw-owner-s4-lt-1120x0800-fp.png)
- 1119/1120 collapsed layout: 720px centered column with inline device is deliberate and tidy; sticky-nav budget only ~10% (evidence: hiw/base-lt-1119x0800-fp.png)
- QR correctly hidden ≤768 (can't scan your own screen) and present, left-aligned, at 769–1120 (evidence: hiw/base-lt-1119x0800-fp.png vs hiw/base-lt-0320x0568-dpr2-fp.png)
- Breakpoint seams inside the band are pixel-stable: 1199 vs 1200 and 1280 vs 1281 full-page shots are visually identical (evidence: hiw/base-lt-1199x0800-fp.png, hiw/base-lt-1200x0800-fp.png, hiw/base-lt-1280x0800-fp.png, hiw/base-lt-1281x0800-fp.png)
- WCAG 1.4.12 text-spacing survives: page reflows from 5181 to 5939px with zero clipping — the grid-template-rows step reveal and pill tags absorb the extra leading (evidence: hiw/textspacing-lt-1280x0800-fp.png)
- Step/phone sync is truthful in deep states: owner step 4 shows the payout mock and the caption reads '4 / 4 · Gaukite išmoką' (evidence: hiw/hiw-owner-s4-lt-1280x0800-fp.png)
- EN locale parity — longer/shorter English strings cause no wrap or layout breakage at 1280/1440 (evidence: hiw/base-en-1280x0800-fp.png, hiw-owner/base-en-1440x0900-fp per leads, hiw/base-en-1440x0900-fp.png)
- Reveal integrity: with entry animations forced, all sections render in place — the CSS-only view() timeline reveal is progressive enhancement (evidence: hiw/reveal-integrity-lt-1280x0800-fp.png)
- Deep-linked ?role=owner and the /en owner route render the owner journey with correct steps, FAQ set and CTA copy at every width read (evidence: hiw-owner/base-lt-1280x0800-fp.png, hiw/hiw-owner-s4-lt-1121x0800-fp.png)
### Legal center (/teisine + documents)
- Text-spacing stress state reflows without clipping or overlap at 320px — headings, intro, meta chips all wrap (evidence: legal-terms/textspacing-lt-0320x0568-dpr2-fp-tile0.png, legal-terms/textspacing-lt-0320x0568-dpr2-fp-tile3.png)
- Table -> labelled record-card transform at <=700 reads excellently at 320: hidden thead preserved for AT, data-label headers bold, 1-col td grid at <=420 (evidence: privacy/base-lt-0320x0568-dpr2-fp-tile12.png)
- 344px Fold-cover width fully intact: numbered h2s, ordered-list badges, warn callout, related-docs grid, footer (evidence: account-deletion/base-lt-0344x0882-dpr2-fp.png)
- Sticky/fixed chrome consumes only 9-14% of short viewports — generous reading area (evidence: legal-terms/base-lt-0320x0568-dpr2-vp.png)
- Hover-only section permalinks have a touch path (opacity .5 under hover:none) and pin to the heading's first line <=680 (evidence: legal-terms/base-lt-0401x0844-dpr2-fp-tile0.png)
- Breadcrumb current-page chip deliberately dropped <=680 so the trail stays one row, full trail returns at 700 (evidence: legal-terms/base-lt-0700x0900-dpr2-fp-tile0.png)
- Drawer uses max-height:100dvh and width:min(360px,86vw) — correct viewport units and 320px fit (code: app/components/legal/legal.css:217)
- h1 clamp(30px,4.6vw,50px) transitions smoothly across the band with text-wrap:balance — no type cliffs (evidence: legal-terms/base-lt-0320x0568-dpr2-fp-tile0.png vs legal-terms/base-lt-0700x0900-dpr2-fp-tile0.png)
- Reading experience at 540px scales cleanly; related grid collapses to 1-col below 560 without stranded cards (evidence: account-deletion/base-lt-0540x0720-dpr2-fp.png)
- Global reduced-motion blanket covers all legal transitions; smooth-scrolls gate on prefersReducedMotion() (code: app/globals.css:440, app/components/legal/LegalChrome.tsx:18)
- 980↔981 and 1024↔1025 boundary pairs are pixel-identical — no seam artifacts (evidence: legal-terms/base-lt-0980x0900-vp.png vs legal-terms/base-lt-0981x0900-vp.png)
- WCAG 1.4.12 text-spacing state reflows the whole 40k-px terms doc without clipped prose, overlapping chips or broken chips/callouts at 1280 and 768 (evidence: legal-terms/textspacing-lt-1280x0800-fp-tile0.png, legal-terms/textspacing-lt-0768x1024-dpr2-fp-tile0.png)
- 4-column privacy summary table stays legible inside the 720px column at 1024 with no clipping and its scroll wrapper unused (evidence: privacy/base-lt-1024x0768-fp-tile3.png)
- EN and LT render with identical anatomy; longer/shorter strings (Contents vs Turinys, Get app vs Programėlė) cause no breakage (evidence: legal-terms/base-en-1120x0800-vp.png)
### Invite (/invite)
- 560↔561 seam is clean: band H1 stays 42px on both sides (clamp floors meet exactly), CTA switches icon-only→short-label deliberately (evidence: hiw/base-lt-0560x0900-dpr2-vp.png vs hiw/base-lt-0561x0900-dpr2-fp.png)
- 700↔701, 980↔981 hiw pairs pixel-equivalent — no teleports, no density jumps (evidence: hiw/base-lt-0700x0900-dpr2-fp.png, hiw/base-lt-0980x0900-fp.png, hiw/base-lt-0981x0900-fp.png)
- ≤1120 inline step device pattern works: the active step carries its own phone mock centered, so step and screen never decouple in the single-column layout (evidence: hiw/base-lt-0560x0900-dpr2-fp.png)
- Phone-band CTA QR correctly removed ≤768 ('can't scan your own screen'), present at 980+ (evidence: hiw/base-lt-0980x0900-fp.png vs hiw/base-lt-0700x0900-dpr2-fp.png)
- Legal reading column holds a ~48–62ch measure at 560 and 700 with 16.5px/1.75 body — comfortable long-form typography (evidence: legal-terms/base-lt-0560x0900-dpr2-vp.png)
- Breadcrumb current-page chip intentionally dropped ≤680 (it repeats the H1 directly below) — trail stays one row (evidence: hiw/base-lt-0560x0900-dpr2-vp.png, globals.css:1073)
- Legal floating chrome (Turinys FAB + back-to-top) never collides with body CTAs and reserves 96px shell bottom padding (evidence: legal-terms/base-lt-0560x0900-dpr2-fp-tile39.png)
- 1440px desktop hiw: sticky synced phone + spine layout balanced, no stranded elements (evidence: hiw/base-lt-1440x0900-fp.png)
- Zero horizontal overflow at every captured band 320-1920, both locales (evidence: invite-code/base-en-0320x0568-dpr2-fp.png, invite-code/base-en-1920x1080-fp.png)
- QR correctly hidden <=560 with CTA + store badges as the mobile path — no dead scan affordance on phones (evidence: invite-bare/base-lt-0560x0900-dpr2-fp.png)
- 344px Fold-cover width renders cleanly with no >=360 assumptions (evidence: invite-code/base-lt-0344x0882-dpr2-fp.png)
- Sticky nav consumes only ~14% of a 320x568 viewport; primary CTA reachable within ~1.5 viewports (evidence: invite-code/base-en-0320x0568-dpr2-vp.png)
- 1119->1120 stack-to-split seam has no type-size cliff (h1 ~63px both sides) and no content loss (evidence: invite-code/base-lt-1119x0800-fp.png, invite-code/base-en-1120x0800-fp.png)
- >=1120 split layout is balanced and left-aligns benefits correctly per its own override (evidence: invite-code/base-en-1440x0900-fp.png)
### Cancel deletion (/cancel-deletion)
- Zero horizontal overflow at every captured band 320-1280 across all six states (evidence: cancel-deletion/base-lt-0320x0568-dpr2-fp.png)
- Confirm CTA is full tap-height and its two-line LT label wraps cleanly at 320 without truncation — nk-btn white-space:normal on compact bands (evidence: mock-cancel-submitting/base-lt-0320x0568-dpr2-vp.png)
- 560→561 seam transition is clean: no type cliff, no reorder, no disappearing elements (evidence: cancel-deletion/base-lt-0560x0900-dpr2-fp.png vs cancel-deletion/base-lt-0561x0900-dpr2-fp.png)
- Fixed-chrome budget excellent: nav consumes only 8-14% of viewport, no bottom bar on this surface (evidence: cancel-deletion/base-lt-0320x0568-dpr2-vp.png)
- Landscape tablet 1024x768 renders a balanced centered composition (evidence: cancel-deletion/base-lt-1024x0768-fp.png)
- EN locale parity holds — shorter copy, same geometry, no wrap breakage at 390 (evidence: cancel-deletion/base-en-0390x0844-dpr2-fp.png)
- Token-less visit resolves instantly to the invalid state rather than a broken idle form — live capture confirms the guard (evidence: cancel-deletion/base-lt-0320x0568-dpr2-vp.png)
- Success title respects the >=561 one-line rule without clipping at 768 (evidence: mock-cancel-success/base-lt-0768x1024-dpr2-fp.png)
- Idle→submitting geometry is perfectly stable: button persists, spinner swaps the leading icon in place (evidence: mock-cancel-submitting/base-lt-0768x1024-dpr2-vp.png)
- .nk-empty__ill float animation and skeleton shimmer are reduced-motion gated in CSS (app/globals.css:834,814)
### Error & status pages
- 404 offers two recovery routes (primary home + secondary browse) that stay side-by-side when they fit and wrap to a clean centered stack when LT copy is longer — no overflow at any band (evidence: soft-404/base-en-0390x0844-dpr2-fp.png vs soft-404/base-lt-0390x0844-dpr2-vp.png)
- 560->561 seam is minimal and deliberate: only the nav download button gains its 'Programėlė' label; status composition and type are pixel-stable (evidence: soft-404/base-lt-0560x0900-dpr2-fp.png, soft-404/base-lt-0561x0900-dpr2-fp.png)
- Landscape 1024x768 shows the entire 404 above the fold, properly centered (evidence: soft-404/base-lt-1024x0768-vp.png)
- 1920 ultrawide: centered composition under the site cap, 4-column footer balanced, no stranded full-bleed elements (evidence: soft-404/base-lt-1920x1080-fp.png)
- listing-404 renders a real status screen with identical geometry to the route 404 at every width — no half-broken detail shell (evidence: listing-404/base-lt-0390x0844-dpr2-fp.png)
- Short-phone tuning already exists: (max-width:560px) and (max-height:700px) block shrinks status padding to 56px and the illustration to 150px (app/globals.css:1810,1823)
- Reduced-motion gates the floating illustration (app/globals.css:835) and danger-tone states announce via role=alert with focus moved to retry (StatusScreen.tsx:27-29)
- Footer social targets are 44x44 with gap (app/globals.css:887); 404 CTAs ~48px tall — touch budget met (evidence: soft-404/base-lt-0320x0568-dpr2-fp.png)
- Footer category columns at the 561px seam wrap labels to 2 lines but never clip or overlap (evidence: soft-404/base-lt-0561x0900-dpr2-fp.png)
### Overlays (drawers, sheets, dialogs, lightbox)
- FilterSelect popovers cap at min(60vh,480px) with internal scroll and overscroll-behavior:contain — correct overlay discipline at 768/900-tall viewports (evidence: feed/filter-popover-p2-lt-0561x0900-dpr2-vp.png)
- Focus is restored to the sort trigger after the popover closes — visible focus ring on Rūšiuoti (evidence: feed/filter-popover-p1-lt-1024x0768-vp.png)
- Hero search input shows a clear purple focus ring inside the light card at 320/390/560 (evidence: home/search-focus-lt-0320x0568-dpr2-vp.png)
- City picker at 1280x800 opens upward from the in-bar trigger and fits fully with all 9 options visible (evidence: home/city-picker-lt-1280x0800-vp.png)
- Category chip rail has gutter-width mask fades as a continuation affordance at both edges (evidence: feed-cat-city/catrail-end-lt-0560x0900-dpr2-vp.png)
- Filter pills wrap to two rows at 561-768 without clipping; active filter chips (Fotografija ir video ×, Vilnius ×) are full 44px+ targets (evidence: feed/filter-popover-p0-lt-0561x0900-dpr2-vp.png, feed-cat-city/catrail-end-lt-0560x0900-dpr2-vp.png)
- Truthful result count ('0 pasiūlymų' / '4 pasiūlymai') with a clear Išvalyti reset adjacent — empty state mirrors feed width (evidence: feed-cat-city/catrail-end-lt-0560x0900-dpr2-vp.png)
- Nav drawer uses 100dvh with overscroll containment and safe-area padding (app/globals.css:584-585) — the modern unit is already house style
- 980->981 breakpoint swap is exemplary: fixed reserve bar + inline booking/host cards at 980 are replaced by the sticky sidebar at 981 with zero double-render and matched content order (evidence: detail-full/reserve-mbar-mid-lt-0980x0900-vp.png vs detail-full/reserve-mbar-mid-lt-0981x0900-vp.png)
- Mobile reserve bar hides when the footer enters view and removes itself from the tab order via visibility, so the footer is never occluded and keyboard focus can't land on an invisible CTA (evidence: detail-full/reserve-mbar-foot-lt-0390x0844-dpr2-vp.png)
- Lightbox is safe-area aware on top/left/right (notch guards at globals.css:1278-1280) and keeps 44-48px controls with pinned count/CTA bar at every band read, including 430px-tall landscape (evidence: mock-bento-5/lightbox-s1-lt-0932x0430-vp.png)
- Zero-photo listing renders a single graceful hero placeholder with caption instead of a grid of grey boxes, and 'New' pill stays legible (evidence: detail-full/desc-expanded-lt-0390x0844-dpr2-fp.png)
- Single-sibling similar rail degrades honestly: broader 'Daugiau daiktu nuomai' heading + category/city chip links + one card, no fake fill (evidence: detail-full/similar-rail-start-lt-0560x0900-dpr2-vp.png)
- 320x568 full page shows no horizontal overflow anywhere including the 2-chip row and fact grid (1-col <360) (evidence: detail-full/desc-expanded-lt-0320x0568-dpr2-fp.png)
### Site chrome (nav + footer, cross-page)
- Nav collapse chain is disciplined: full links >=1121, burger + labeled CTA <=1120, icon-only 44px CTA <=560 — the single conversion action survives every band (evidence: feed/base-lt-1119x0800-fp.png, feed/base-lt-0320x0568-dpr2-vp.png)
- Footer reflow 4-col -> 2-col (<=1024) -> 1-col (<=560) is clean with pay marks and copyright never colliding, down to 320px (evidence: feed/base-lt-1024x0768-fp.png, feed/base-lt-0320x0568-dpr2-fp.png)
- Breadcrumb dedupe below 680px (current-page chip dropped since the H1 repeats it) keeps the trail one row at 320-360 (evidence: feed/base-lt-0320x0568-dpr2-vp.png, feed/base-lt-0359x0800-dpr2-vp.png)
- Drawer a11y plumbing is genuinely strong: inert when closed, focus trap, Escape/scrim close, focus restore, auto-close at >=1121px, 100dvh-capped internal scroll with safe-bottom padding (evidence: app/components/sections.tsx:86-127, app/globals.css:584-585)
- 900 vs 901 and 359 vs 361 render pixel-equivalent chrome — no phantom seams at those boundaries (evidence: feed/base-lt-0900x1280-dpr2-vp.png vs feed/base-lt-0901x1280-vp.png)
- Landscape phones get the correct <=1120 tablet layout, not a squashed desktop (evidence: feed/base-lt-0844x0390-dpr2-vp.png)
- Closed mobile drawer is inert — six hidden drawer links are removed from tab order and AT tree (app/components/sections.tsx:232); auto-metric 'drawer overlaps h1/crumbs' are false positives (evidence: feed/base-lt-0320x0568-dpr2-vp.png)
- Hidden booking bar removes its Reserve button from Tab order via discrete visibility transition (app/globals.css:1337 comment documents the fix)
- Drawer sizing uses 100dvh with 480px cap and overscroll-behavior:contain + safe-area bottom padding (app/globals.css:584-585)
- Breadcrumb current-page chip deliberately dropped ≤680 to avoid duplicating the H1 (app/globals.css:1073-1075) (evidence: detail-full/base-lt-0320x0568-dpr2-fp.png)
- 344px Fold-cover width renders cleanly on HIW incl. store badges and segmented toggle (evidence: hiw/base-lt-0344x0882-dpr2-fp.png)
- 359/360/361 boundary triplet identical — no ≥360 assumption breaks (evidence: hub-sveikata/base-lt-0359x0800-dpr2-fp.png vs hub-sveikata/base-lt-0360x0800-dpr2-fp.png)
- Category-hub empty state mirrors loaded feed geometry with clear recovery CTAs at 359-673 (evidence: hub-sveikata/base-lt-0673x0841-dpr2-fp.png)
- Long unbroken listing slug wraps without horizontal overflow at 320 via overflow-wrap:anywhere (evidence: detail-full/base-lt-0320x0568-dpr2-fp.png)


## Appendix D — Coverage matrix

Direct agent shot-reads per route × band (● read directly · ◐ partially · · sampled via hot-ranking / metric-screen only). 100 % of captures passed the automated metric screen regardless of mark.

| Route | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 |
|---|---|---|---|---|---|---|---|---|
| account-deletion | ● | · | ◐ | · | ◐ | · | · | · |
| cancel-deletion | ● | ● | ● | ● | ● | · |   | · |
| cat-city-branch | · | · | ● | ● | · | ● |   | · |
| categories | ● | ● | ◐ | ● | ● | ● | ◐ | ● |
| city-marijampole | · | · | · | · | ◐ | · | · | · |
| city-palanga | · | · | · | · | · | · |   | ● |
| city-panevezys | · | · | · | · | · | · |   | · |
| city-siauliai | · | · | · | · | · | · |   | · |
| city-vilnius | ● | ◐ | · | ◐ | · | · | ◐ | ● |
| detail-full | ● | ● | ● | ● | ● | ● | ● | ◐ |
| detail-noreviews | ◐ | · | · | · | · | · | · | · |
| feed | ● | ● | ● | ● | ● | ● | · | ◐ |
| feed-cat-city | ● | ● | ● | ◐ | ● | ● | · | · |
| feed-empty | · | ● | · | ● | ● | ● |   | · |
| feed-filtered | ● | · | ◐ | · | ● | ● | · | · |
| feed-page2 | ◐ | · | ● | · | ● | ● | · | · |
| feed-q-long | ● | ● | · | ● | · | · | · | ● |
| hiw | ● | ◐ | ◐ | ● | ● | ● | ● | ● |
| hiw-owner | ● | · | · | · | · | ◐ | · | · |
| home | ● | ● | ● | ● | ● | ● | ● | ● |
| hub-kita | · | · | · | · | · | ● |   | · |
| hub-sveikata | ● | · | · | ● | ● | ● | · | · |
| hub-transportas | ● | · | · | · | · | ● |   | · |
| invite-bare | · | · | ● | ● | · | · |   | · |
| invite-code | ● | ● | · | ◐ | ● | ● | ● | ● |
| invite-wrap | ● | ● | · | · | · | · |   | · |
| legal-terms | ● | ● | ● | ● | ● | ● | · | · |
| listing-404 | · | ● | · | · | · | ● |   | · |
| mock-bento-0 |   | ● |   | · |   | · |   |   |
| mock-bento-1 |   | ● |   | · |   | · |   |   |
| mock-bento-2 |   | · |   | · |   | · |   |   |
| mock-bento-3 |   | ● |   | · |   | · |   |   |
| mock-bento-4 |   | ● |   | · |   | · |   |   |
| mock-bento-5 |   | ● |   | · | ● | ● |   |   |
| mock-cancel-already | · | ● |   | · |   | · |   |   |
| mock-cancel-error | ● | · |   | ● |   | ● |   |   |
| mock-cancel-invalid | · | · |   | · |   | · |   |   |
| mock-cancel-submitting | ● | · |   | ● |   | · |   |   |
| mock-cancel-success | ● | · |   | ● |   | · |   |   |
| mock-empty-city | · | · | ● | · |   | · |   |   |
| mock-empty-filter | · | ● | · | · |   | · |   |   |
| mock-error-feed |   | ● |   |   |   | · |   |   |
| mock-error-home |   | ● |   |   |   | ● |   |   |
| mock-long-owner | ● | · | · |   |   |   |   |   |
| mock-pag-first | · | · |   | · |   | ● |   |   |
| mock-pag-last | ● | · |   | · |   | · |   |   |
| mock-pag-mid | · | · |   | · |   | · |   |   |
| mock-pag-overflow | · | ● |   | · |   | · |   |   |
| mock-stress-feed | ● | ● | ● | ● | · | ● |   |   |
| mock-stress-numbers | ● | · | · |   | ● | · |   |   |
| mock-stress-title | ● | ● | ● | ● | · | · |   |   |
| privacy | ● | · | · | · | ◐ | · | ◐ | · |
| soft-404 | ● | ● | ● | ● | ● | ● |   | ● |
| subcat-city-deep | ◐ | ◐ | · | · | ● | · | · | · |
| subcat-dronai | · | · | · | · | · | ● |   | · |
| subcat-longest | ◐ | · | · | ◐ | ● | · | · | · |
| subcat-tents | · | · | · | · | · | · |   | · |
| teisine | ● | ● | ● | ◐ | ● | ● | · | · |


---

*Generated 2026-07-11 by a multi-agent capture+audit pipeline (harness: `scripts/wide-audit-shots.mjs`). Screenshots referenced as `route/file.png` live under `screenshots/wide-audit/`.*
