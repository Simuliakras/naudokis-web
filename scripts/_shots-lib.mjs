// Shared helpers for the wide-viewport audit harness (wide-audit-shots.mjs).
// Extracted from listing-howitworks-audit-shots.mjs / responsive-audit.mjs so the
// capture boilerplate (reveal-kill, settle, texture-safe fullPage, page metrics,
// device-emulating contexts) lives in one place.
import { devices } from "playwright";

// Force scroll-reveal sections visible, freeze animation (no mid-transition shots),
// and hide the Next dev-indicator badge so dev runs match prod shots.
export const REVEAL_KILL = `.nk-reveal,.nk-reveal-grid>*,.nk-hero-intro>*,.nk-hero-media{opacity:1!important;transform:none!important}
  *,*::before,*::after{animation:none!important;transition:none!important}
  nextjs-portal,[data-next-badge-root],[data-nextjs-toast],#__next-build-watcher{display:none!important}`;

// WCAG 1.4.12 text-spacing overrides — layouts must survive these without clipping.
export const TEXT_SPACING = `*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}
  p{margin-bottom:2em!important}`;

// Phone descriptor: hover:none / pointer:coarse / hasTouch so mobile-only rules
// (tap targets, drawer, .nk-mbar) render as on a real device. Applied whenever the
// SHORT edge is phone-sized so landscape phones keep their touch regime.
const PHONE = devices["Pixel 7"];

export const pad = (n) => String(n).padStart(4, "0");

export function contextOptions({ width, height, dpr, bypassCSP = false }) {
  const phone = Math.min(width, height) <= 680;
  return {
    ...(phone ? PHONE : {}),
    viewport: { width, height },
    deviceScaleFactor: dpr,
    reducedMotion: "reduce",
    bypassCSP,
  };
}

export async function gotoWithRetry(page, url, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      return;
    } catch (error) {
      lastError = error;
      // networkidle can starve behind long-polling — accept "load" on the retry.
      try {
        await page.goto(url, { waitUntil: "load", timeout: 60_000 });
        return;
      } catch (innerError) {
        lastError = innerError;
      }
      await page.waitForTimeout(500 * (i + 1));
    }
  }
  throw lastError;
}

export async function clickIfReady(page, selector, timeout = 4000) {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) {
    return false;
  }
  try {
    await locator.waitFor({ state: "visible", timeout });
    await locator.click({ timeout });
    return true;
  } catch {
    return false;
  }
}

export async function settle(page, { revealKill = true, extraCss } = {}) {
  if (revealKill) {
    await page.addStyleTag({ content: REVEAL_KILL });
  }
  if (extraCss) {
    await page.addStyleTag({ content: extraCss });
  }
  await page.evaluate(() => document.fonts?.ready);
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 25));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
}

// Chromium clamps screenshot textures at 16384 device px — beyond that the image
// tail renders as a dead dark band. Over-tall pages drop to CSS-pixel scale; pages
// too tall even for that are tiled as viewport crops so no content is unauditable.
export async function fullPageShot(page, path) {
  const h = await page.evaluate(() => document.body.scrollHeight);
  const dpr = await page.evaluate(() => window.devicePixelRatio || 1);
  const files = [];
  let textureClamped = false;
  if (h <= 16000) {
    const opts = { path, fullPage: true };
    if (h * dpr > 16384) {
      opts.scale = "css";
      textureClamped = true;
    }
    await page.screenshot(opts);
    files.push(path);
    return { files, textureClamped, tiled: false };
  }
  const vh = await page.evaluate(() => window.innerHeight);
  const step = Math.max(200, Math.floor(vh * 0.9));
  let n = 0;
  for (let y = 0; y < h && n <= 40; y += step) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
    const tilePath = path.replace(/\.png$/, `-tile${n}.png`);
    await page.screenshot({ path: tilePath, fullPage: false });
    files.push(tilePath);
    n += 1;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  return { files, textureClamped: true, tiled: true };
}

// Per-shot page metrics beyond pixels: overflow culprits, type floor, tap-target
// spacing, prose measure, fixed-chrome viewport consumption, content-cap
// utilization, landmark burial, overlaps, image distortion, dialog fit.
// All measurements are CSS px. Headless Chromium reports safe-area insets as 0,
// so safe-area feet are verified structurally by the audit, not visually here.
export async function collectMetrics(page) {
  return page.evaluate(() => {
    const root = document.scrollingElement || document.documentElement;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const labelFor = (el) => {
      const tag = el.tagName.toLowerCase();
      if (el.id) return `${tag}#${el.id}`;
      const cls = String(el.className || "").trim().split(/\s+/)[0];
      return cls ? `${tag}.${cls}` : tag;
    };
    const sectionFor = (el) => {
      const landmark = el.closest("main, section, header, footer, nav, aside, [role='dialog']");
      return landmark ? labelFor(landmark) : "unknown";
    };
    const rectOf = (el) => {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && cs.opacity !== "0";
    };
    const sel = (el) => el.tagName.toLowerCase() + (el.className ? "." + String(el.className).trim().split(/\s+/).slice(0, 3).join(".") : "");

    // -- clipped text (ellipsis/line-clamp exempt; those are counted separately) --
    let ellipsizedCount = 0;
    const clipped = [...document.querySelectorAll("button, a, label, h1, h2, h3, p, span, dt, dd")]
      .filter((el) => visible(el) && !el.closest("[aria-hidden='true']"))
      .filter((el) => {
        const overX = el.scrollWidth > el.clientWidth + 1;
        const overY = el.scrollHeight > el.clientHeight + 1;
        if (!overX && !overY) return false;
        const cs = getComputedStyle(el);
        const intentional = cs.textOverflow === "ellipsis" || cs.webkitLineClamp !== "none" || el.classList.contains("nk-sr-only");
        if (intentional) {
          ellipsizedCount += 1;
          return false;
        }
        return true;
      })
      .slice(0, 30)
      .map((el) => ({ section: sectionFor(el), selector: sel(el), text: (el.textContent || "").trim().slice(0, 90), rect: rectOf(el) }));

    // -- interactive targets: sub-minimum sizes + tight spacing pairs --
    const interactive = [...document.querySelectorAll("button, a, input, select, textarea, [role='button'], [tabindex]:not([tabindex='-1'])")]
      .filter((el) => visible(el) && !el.closest("[aria-hidden='true']"));
    const smallTargets = interactive
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const primary = el.classList.contains("nk-btn") || el.classList.contains("nk-nav-cta") || el.classList.contains("nk-filters-mobilebtn");
        const min = primary ? 44 : 24;
        return r.width < min || r.height < min;
      })
      .slice(0, 30)
      .map((el) => ({ section: sectionFor(el), selector: sel(el), rect: rectOf(el) }));
    const tightTargetPairs = [];
    const interRects = interactive.slice(0, 250).map((el) => ({ el, r: el.getBoundingClientRect() }));
    for (let i = 0; i < interRects.length && tightTargetPairs.length < 20; i += 1) {
      for (let j = i + 1; j < interRects.length && tightTargetPairs.length < 20; j += 1) {
        const a = interRects[i], b = interRects[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const gapX = Math.max(b.r.left - a.r.right, a.r.left - b.r.right);
        const gapY = Math.max(b.r.top - a.r.bottom, a.r.top - b.r.bottom);
        const overlapX = a.r.left < b.r.right && b.r.left < a.r.right;
        const overlapY = a.r.top < b.r.bottom && b.r.top < a.r.bottom;
        if ((overlapY && gapX >= 0 && gapX < 8) || (overlapX && gapY >= 0 && gapY < 8)) {
          tightTargetPairs.push({ a: sel(a.el), b: sel(b.el), gap: Math.round(Math.max(0, Math.min(gapX < 0 ? 99 : gapX, gapY < 0 ? 99 : gapY))) });
        }
      }
    }

    // -- horizontal overflow + culprit elements (skip deliberate scroll rails) --
    const scrollOverflow = Math.max(0, root.scrollWidth - root.clientWidth);
    const inScrollRail = (el) => {
      let node = el.parentElement;
      for (let d = 0; node && d < 6; d += 1, node = node.parentElement) {
        const ox = getComputedStyle(node).overflowX;
        if (ox === "auto" || ox === "scroll") return true;
      }
      return false;
    };
    let overflowOffenders = [];
    if (scrollOverflow > 1) {
      overflowOffenders = [...document.body.querySelectorAll("*")]
        .filter((el) => visible(el))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ el, r }) => (r.right > viewport.width + 1 || r.left < -1) && !inScrollRail(el))
        .sort((a, b) => (b.r.right - viewport.width) - (a.r.right - viewport.width))
        .slice(0, 10)
        .map(({ el, r }) => ({ section: sectionFor(el), selector: sel(el), overhang: Math.round(r.right - viewport.width), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }));
    }

    // -- type floor --
    let minFontPx = Infinity;
    const smallTextEls = [];
    const textEls = [...document.body.querySelectorAll("*")].slice(0, 5000);
    for (const el of textEls) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length >= 3);
      if (!own || !visible(el) || el.closest("[aria-hidden='true']")) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < minFontPx) minFontPx = fs;
      if (fs < 12 && smallTextEls.length < 15) {
        smallTextEls.push({ section: sectionFor(el), selector: sel(el), fontPx: Math.round(fs * 10) / 10, text: (el.textContent || "").trim().slice(0, 60) });
      }
    }

    // -- prose measure (chars per line estimate) --
    const proseLineLen = [...document.querySelectorAll(".nk-prose, .nk-prose p, .nk-lg-body p, .nk-subtitle, .nk-hero-band__lead")]
      .filter((el) => visible(el) && (el.textContent || "").trim().length > 80)
      .slice(0, 12)
      .map((el) => {
        const fs = parseFloat(getComputedStyle(el).fontSize);
        const chars = Math.round(el.clientWidth / (fs * 0.52));
        return { section: sectionFor(el), selector: sel(el), chars };
      })
      .filter((p) => p.chars > 90 || p.chars < 35);

    // -- fixed/sticky chrome consumption (top-level pinned elements only) --
    const pinned = [...document.querySelectorAll("*")]
      .filter((el) => {
        const cs = getComputedStyle(el);
        if (cs.position !== "fixed" && cs.position !== "sticky") return false;
        const r = el.getBoundingClientRect();
        return visible(el) && r.bottom > 0 && r.top < viewport.height && r.width > viewport.width * 0.4;
      })
      .filter((el, _, all) => !all.some((other) => other !== el && other.contains(el)));
    const stickyEls = pinned.map((el) => {
      const r = el.getBoundingClientRect();
      const visibleHeight = Math.max(0, Math.min(r.bottom, viewport.height) - Math.max(r.top, 0));
      return { section: sectionFor(el), selector: sel(el), rect: rectOf(el), visibleHeight: Math.round(visibleHeight) };
    });
    const stickyConsumptionPct = Math.round(stickyEls.reduce((s, e) => s + e.visibleHeight, 0) / viewport.height * 100);

    // -- content-cap utilization --
    const container = document.querySelector("main .nk-container, .nk-container");
    const capUtilization = container
      ? { containerW: Math.round(container.getBoundingClientRect().width), viewportW: viewport.width, leftGutter: Math.round(container.getBoundingClientRect().left), pct: Math.round(container.getBoundingClientRect().width / viewport.width * 100) }
      : null;

    // -- landmark burial --
    const yOf = (q) => {
      const el = document.querySelector(q);
      if (!el) return null;
      return Math.round(el.getBoundingClientRect().top + window.scrollY);
    };
    const landmarksY = {
      main: yOf("main"),
      footer: yOf("footer"),
      primaryCta: yOf(".nk-btn--primary"),
      faq: yOf(".nk-faq"),
    };

    // -- visual overlap between headings/interactive siblings --
    // Stretched card links (.nk-stretch and any anchor whose rect fully covers
    // the other element) are a deliberate pattern, not z-fighting — skip them.
    const overlapCandidates = [...document.querySelectorAll("h1, h2, h3, button, a, .nk-badge, .nk-fav")]
      .filter((el) => visible(el) && !el.closest("[aria-hidden='true']") && !el.classList.contains("nk-stretch"))
      .slice(0, 200)
      .map((el) => ({ el, r: el.getBoundingClientRect() }));
    const covers = (outer, inner) => outer.left <= inner.left + 2 && outer.right >= inner.right - 2 && outer.top <= inner.top + 2 && outer.bottom >= inner.bottom - 2;
    const overlapPairs = [];
    for (let i = 0; i < overlapCandidates.length && overlapPairs.length < 15; i += 1) {
      for (let j = i + 1; j < overlapCandidates.length && overlapPairs.length < 15; j += 1) {
        const a = overlapCandidates[i], b = overlapCandidates[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        if ((a.el.tagName === "A" && covers(a.r, b.r)) || (b.el.tagName === "A" && covers(b.r, a.r))) continue;
        const ix = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const iy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (ix > 4 && iy > 4 && ix * iy > 16) {
          overlapPairs.push({ a: sel(a.el), b: sel(b.el), area: Math.round(ix * iy) });
        }
      }
    }

    // -- image distortion --
    const imgDistortion = [...document.querySelectorAll("img")]
      .filter((el) => visible(el) && el.naturalWidth > 0)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.height < 24) return false;
        if (getComputedStyle(el).objectFit === "cover") return false;
        const natural = el.naturalWidth / el.naturalHeight;
        const rendered = r.width / r.height;
        return Math.abs(natural - rendered) / natural > 0.02;
      })
      .slice(0, 10)
      .map((el) => ({ src: (el.currentSrc || el.src || "").slice(-60), rendered: rectOf(el), natural: { w: el.naturalWidth, h: el.naturalHeight } }));

    // -- dialog / sheet fit --
    const dialogFit = [...document.querySelectorAll("[role='dialog'], .nk-sheet, .nk-lg-drawer__panel, .nk-nav-drawer")]
      .filter(visible)
      .slice(0, 4)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const buttons = [...el.querySelectorAll("button, a")].filter(visible);
        const lastButton = buttons[buttons.length - 1];
        const lastRect = lastButton ? lastButton.getBoundingClientRect() : null;
        return {
          selector: sel(el),
          rect: rectOf(el),
          overflowsViewport: r.top < -2 || r.bottom > viewport.height + 2 || r.left < -2 || r.right > viewport.width + 2,
          internallyScrollable: el.scrollHeight > el.clientHeight + 2,
          lastControlInViewport: lastRect ? lastRect.bottom <= viewport.height + 2 : null,
        };
      });

    const visibleContentCount = [...document.body.querySelectorAll("main, header, footer, nav, h1, h2, h3, p, a, button, img, svg")]
      .filter((el) => visible(el) && !el.closest("[aria-hidden='true']")).length;
    const textLength = (document.body.innerText || "").trim().length;

    return {
      viewport,
      blank: textLength < 20 && visibleContentCount < 3,
      textLength,
      visibleContentCount,
      scrollOverflow,
      scrollHeightPx: root.scrollHeight,
      clipped,
      ellipsizedCount,
      smallTargets,
      tightTargetPairs,
      overflowOffenders,
      minFontPx: minFontPx === Infinity ? null : Math.round(minFontPx * 10) / 10,
      smallTextEls,
      proseLineLen,
      stickyRisks: stickyEls.slice(0, 12),
      stickyConsumptionPct,
      capUtilization,
      landmarksY,
      overlapPairs,
      imgDistortion,
      dialogFit,
      sections: [...document.querySelectorAll("main, section, header, footer, nav")].filter(visible).slice(0, 40).map((el) => ({ id: labelFor(el), rect: rectOf(el) })),
    };
  });
}
