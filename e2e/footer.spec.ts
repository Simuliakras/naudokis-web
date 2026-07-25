import { expect, test } from "@playwright/test";
import { BREAKPOINTS } from "../app/lib/breakpoints";
import { getDictionary } from "../app/lib/i18n/dictionaries";

// 480/540/600/640 are not padding: the footer disclosure is driven by a CONTAINER
// query, so its switch point is not a viewport tier. The list used to jump 430 ->
// 768, which skipped the entire band where the disclosure is still showing — and
// the spec asserted `width <= 430` for it, a number matching nothing in the CSS.
const WIDTHS = [320, 360, 390, 430, 480, 540, 600, 640, 768, 1024, 1105, 1186, 1280, 1509, 1971];

// Mirrors the CSS exactly: .nk-footer .nk-container is the query container, and
// .nk-container's padding-inline is clamp(20px, 6vw, 82px). So the container
// measures viewport - 2*gutter, and 35rem of container arrives at ~637px of
// viewport — not 560px, and nowhere near 430px.
const FOOTER_COLUMNS_AT = Number.parseFloat(BREAKPOINTS.sm) * 16;
function footerContainerWidth(viewport: number): number {
  const gutter = Math.min(Math.max(20, viewport * 0.06), 82);
  return viewport - 2 * gutter;
}
const showsDisclosure = (viewport: number) => footerContainerWidth(viewport) < FOOTER_COLUMNS_AT;

// Same container-width arithmetic: the payment marks and their hairline drop out
// at and below a 900px viewport, which is 49.5rem of footer container.
const PAYMENT_MARKS_DROP_AT = 49.5 * 16;
const showsPaymentMarks = (viewport: number) => footerContainerWidth(viewport) > PAYMENT_MARKS_DROP_AT;

// One test per width: a single loop aborts at the first failure, so a regression at
// 320px would hide the state of the other fourteen.
for (const width of WIDTHS) {
  test(`footer stays compact, readable, and collision-free at ${width}px`, async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const footer = page.locator("footer.nk-footer");
    await expect(footer).toBeVisible();
    await page.setViewportSize({ width, height: width <= 430 ? 932 : 900 });
    // Rest at the true page bottom — that is where the footer is actually read.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // Back-to-top YIELDS to the footer (an IntersectionObserver in BackToTop.tsx),
    // so here it must be gone. Waiting on that is also what makes the audit below
    // stable: the class flips asynchronously off the observer, and reading the
    // computed style while `is-on` was still on the way out reported `hidden`
    // against a spec that expected `visible` — flaky at 3 widths in 15.
    await expect(page.locator(".nk-backtotop")).not.toHaveClass(/is-on/);

    const audit = await page.evaluate(() => {
      const root = document.scrollingElement ?? document.documentElement;
      const footerElement = document.querySelector<HTMLElement>("footer.nk-footer")!;
      const back = document.querySelector<HTMLElement>(".nk-backtotop")!;
      const backRect = back.getBoundingClientRect();
      const backStyle = getComputedStyle(back);
      const intersects = (element: Element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0
          && rect.left < backRect.right && rect.right > backRect.left
          && rect.top < backRect.bottom && rect.bottom > backRect.top;
      };
      // Scoped to the footer's bottom bar: the float is fixed, so it deliberately
      // passes over the link columns mid-scroll. The bottom bar is the contract.
      const overlaps = [...footerElement.querySelectorAll(
        ".nk-footer__bottom a, .nk-footer__bottom button, .nk-footer__pay img",
      )]
        .filter((element) => element !== back && intersects(element))
        .map((element) => element.getAttribute("alt") || element.getAttribute("aria-label") || element.textContent?.trim());
      const paymentHeights = [...footerElement.querySelectorAll<HTMLImageElement>(".nk-footer__pay img")]
        .map((image) => image.getBoundingClientRect().height);
      const taglineRect = footerElement.querySelector(".nk-footer__tagline")!.getBoundingClientRect();
      const contactRect = footerElement.querySelector(".nk-footer__contact")!.getBoundingClientRect();
      const socialRect = footerElement.querySelector(".nk-footer__social")!.getBoundingClientRect();
      const badgesRect = footerElement.querySelector(".nk-footer__brand .nk-appbadges")!.getBoundingClientRect();
      const brandRect = footerElement.querySelector(".nk-footer__brand")!.getBoundingClientRect();
      const categoriesRect = footerElement.querySelector(".nk-footer__col--categories")!.getBoundingClientRect();
      const citiesRect = footerElement.querySelector(".nk-footer__col--cities")!.getBoundingClientRect();
      const helpColumn = footerElement.querySelector<HTMLElement>(".nk-footer__col--help")!;
      const navContainerRect = document.querySelector<HTMLElement>(".nk-nav-inner.nk-container")!.getBoundingClientRect();
      const footerContainerRect = footerElement.querySelector<HTMLElement>(".nk-container")!.getBoundingClientRect();

      return {
        overflow: root.scrollWidth - root.clientWidth,
        footerHeight: footerElement.getBoundingClientRect().height,
        overlaps,
        backToTop: { position: backStyle.position, visibility: backStyle.visibility },
        paymentHeights,
        tabletBrandAlignment: {
          taglineTop: taglineRect.top,
          contactTop: contactRect.top,
          contactBottom: contactRect.bottom,
          socialTop: socialRect.top,
          socialBottom: socialRect.bottom,
          badgesTop: badgesRect.top,
          // Social moved INSIDE the contact block; containment is the structural
          // half of that contract and a rect comparison cannot express it.
          socialInsideContact: footerElement
            .querySelector(".nk-footer__contact")!
            .contains(footerElement.querySelector(".nk-footer__social")),
        },
        tabletRowSeparation: {
          brandBottom: brandRect.bottom,
          categoriesTop: categoriesRect.top,
          citiesTop: citiesRect.top,
        },
        largeContainerAlignment: {
          navLeft: navContainerRect.left,
          navRight: navContainerRect.right,
          footerLeft: footerContainerRect.left,
          footerRight: footerContainerRect.right,
        },
        helpTrailingBorder: Number.parseFloat(getComputedStyle(helpColumn).borderBlockEndWidth),
        disclosureDisplay: getComputedStyle(footerElement.querySelector(".nk-footer__disclosure")!).display,
        categoryDisplay: getComputedStyle(footerElement.querySelector(".nk-footer__col--categories .nk-footer__col-content")!).display,
        categoryHeight: footerElement.querySelector(".nk-footer__col--categories .nk-footer__col-content")!.getBoundingClientRect().height,
        separatorDisplay: getComputedStyle(footerElement.querySelector(".nk-footer__sep")!).display,
      };
    });

    expect(audit.overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
    // The collision contract, now enforced by withdrawal rather than by a reserved
    // gutter in .nk-footer__bottom: at the page bottom the float is not painted at
    // all, so it cannot sit on the payment marks or the privacy control. `overlaps`
    // stays as the belt to that braces — it would still catch the button being
    // re-shown down here by some later rule.
    expect(audit.backToTop, `back-to-top float state at ${width}px`)
      .toEqual({ position: "fixed", visibility: "hidden" });
    expect(audit.overlaps, `back-to-top overlaps footer bottom bar at ${width}px`).toEqual([]);
    // Below the drop point the marks are display:none, so every rect is 0 — assert
    // that they are gone rather than that they are 30px tall.
    if (showsPaymentMarks(width)) {
      expect(Math.min(...audit.paymentHeights), `payment mark height at ${width}px`).toBeGreaterThanOrEqual(29);
    } else {
      expect(Math.max(...audit.paymentHeights), `payment marks hidden at ${width}px`).toBe(0);
      expect(audit.separatorDisplay, `payment hairline hidden at ${width}px`).toBe("none");
    }
    expect(audit.helpTrailingBorder, `help trailing divider at ${width}px`).toBe(0);

    if (width === 1024) {
      // The two-track tablet band: ONE identity stack on the left (wordmark →
      // tagline → contact block, which now contains phone, email AND social), with
      // the store badges alone in the second track, opening on the contact block's
      // first line so the two "how to reach us / how to get us" clusters share a
      // top edge. This used to assert social against the tagline, from when social
      // was the second track's first item — it is inside the contact block now.
      expect(audit.tabletBrandAlignment.socialInsideContact, "social lives in the contact block").toBe(true);
      expect(
        Math.abs(audit.tabletBrandAlignment.badgesTop - audit.tabletBrandAlignment.contactTop),
        "store badges open on the contact block's first line",
      ).toBeLessThanOrEqual(1);
      // Last cluster in that block, not the first: it sits under the phone/email rows.
      expect(
        audit.tabletBrandAlignment.socialTop - audit.tabletBrandAlignment.contactTop,
        "social sits below the phone/email rows",
      ).toBeGreaterThan(0);
      expect(
        audit.tabletBrandAlignment.contactBottom - audit.tabletBrandAlignment.socialBottom,
        "social closes the contact block",
      ).toBeLessThanOrEqual(1);
    }

    if (width === 1105) {
      expect(
        audit.tabletRowSeparation.categoriesTop - audit.tabletRowSeparation.brandBottom,
        "1105px brand-to-categories separation",
      ).toBeGreaterThanOrEqual(20);
      expect(
        audit.tabletRowSeparation.citiesTop - audit.tabletRowSeparation.brandBottom,
        "1105px brand-to-cities separation",
      ).toBeGreaterThanOrEqual(20);
    }

    if (width === 1971) {
      expect(
        Math.abs(audit.largeContainerAlignment.footerLeft - audit.largeContainerAlignment.navLeft),
        "large-screen footer and navbar left edges",
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(audit.largeContainerAlignment.footerRight - audit.largeContainerAlignment.navRight),
        "large-screen footer and navbar right edges",
      ).toBeLessThanOrEqual(1);
    }

    if (showsDisclosure(width)) {
      expect(audit.disclosureDisplay, `narrow disclosure at ${width}px`).toBe("flex");
      // The collapsed panel is a 0fr grid row rather than display:none, so height is
      // what carries the contract now — it is what keeps the footer compact, and it
      // is correct the instant the container query crosses. Deliberately NOT
      // `visibility`: that one is transitioned, so this sweep (which loads at the
      // 1280px device viewport and then resizes down) would catch it still holding
      // `visible` on a fast machine and read `hidden` on a slow one.
      expect(audit.categoryDisplay, `collapsed category content at ${width}px`).toBe("grid");
      expect(audit.categoryHeight, `collapsed category height at ${width}px`).toBe(0);
      if (width <= 430) {
        expect(audit.footerHeight, `compact mobile footer at ${width}px`).toBeLessThan(800);
      }
    } else {
      expect(audit.disclosureDisplay, `column disclosure at ${width}px`).toBe("none");
      expect(audit.categoryDisplay, `column category content at ${width}px`).toBe("block");
    }
  });
}

// The sitewide back-to-top and the legal TOC FAB both own the bottom-right
// corner. legal.css offsets the float above the FAB via :has(.nk-lg-fab-toc);
// nothing else covers that rule.
test("back-to-top stacks clear of the legal TOC FAB below lg", async ({ page }) => {
  for (const width of [390, 768, 1023]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/naudojimosi-salygos", { waitUntil: "load" });
    await page.evaluate(() => window.scrollTo(0, 1400));

    const back = page.locator(".nk-backtotop");
    const fab = page.locator(".nk-lg-fab-toc");
    await expect(back).toHaveClass(/is-on/);
    await expect(fab).toBeVisible();
    // .is-on only STARTS the fade — the resting state is translateY(10px) scale(.94)
    // and the transform transition runs 0.22s. Measuring on the class alone caught
    // the button mid-scale (45.6px wide instead of 46), which read as a ~1.05px
    // right-edge misalignment that came and went with machine speed. Wait for the
    // transform to actually land; Playwright polls this assertion.
    await expect(back).toHaveCSS("transform", "none");
    // The legal-only copy of this button is gone — exactly one control now.
    await expect(back).toHaveCount(1);
    await expect(page.locator(".nk-lg-totop")).toHaveCount(0);

    const boxes = await page.evaluate(() => {
      const rect = (selector: string) =>
        document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
      return { back: rect(".nk-backtotop"), fab: rect(".nk-lg-fab-toc") };
    });

    expect(boxes.back.bottom, `back-to-top sits above the FAB at ${width}px`)
      .toBeLessThanOrEqual(boxes.fab.top);
    expect(Math.abs(boxes.back.right - boxes.fab.right), `shared right edge at ${width}px`)
      .toBeLessThanOrEqual(1);
  }
});

test("mobile footer disclosures work with the keyboard and retain visible focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "load" });
  const footer = page.locator("footer.nk-footer");
  await footer.scrollIntoViewIfNeeded();

  const browseHeading = getDictionary("lt").footer.browseHeading;
  const categories = footer.getByRole("button", { name: browseHeading, exact: true });
  const panelId = await categories.getAttribute("aria-controls");
  expect(panelId).toBeTruthy();
  const panel = page.locator(`[id="${panelId}"]`);

  await categories.focus();
  await expect(categories).toBeFocused();
  await expect(categories).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();

  const focusRing = await categories.evaluate((element) => ({
    style: getComputedStyle(element).outlineStyle,
    width: getComputedStyle(element).outlineWidth,
  }));
  expect(focusRing.style).toBe("solid");
  expect(Number.parseFloat(focusRing.width)).toBeGreaterThanOrEqual(2);

  await page.keyboard.press("Enter");
  await expect(categories).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link")).toHaveCount(10);

  // The clip that hides the panel mid-animation cuts at its own padding box, and the
  // focus ring is 2px at a 3px offset — so the links have to sit at least that far
  // inside it, or tabbing an open panel shows a shaved ring. This is the whole reason
  // the panel's padding lives on the clip's child instead of on the clip.
  const insets = await panel.evaluate((element) => {
    const clip = element.querySelector<HTMLElement>(".nk-footer__col-clip")!;
    const box = clip.getBoundingClientRect();
    return [...clip.querySelectorAll("a")].map((link) => {
      const rect = link.getBoundingClientRect();
      return Math.min(rect.left - box.left, box.right - rect.right, rect.top - box.top);
    });
  });
  expect(Math.min(...insets), "focus rings clear the clip").toBeGreaterThanOrEqual(5);

  await page.keyboard.press("Space");
  await expect(categories).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();
});

// The panel opens on an animated grid row, not a display flip. Asserting the
// transition declaration would be vacuous — it is the travel that breaks when the
// clip, its min-block-size, or the selector the transition sits on is wrong, and a
// snapped panel still satisfies every state assertion in the tests above.
test("mobile footer disclosure expands on an animated grid row", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "load" });

  const column = page.locator(".nk-footer__col--categories");
  const button = column.locator(".nk-footer__disclosure");
  const panel = column.locator(".nk-footer__col-content");
  await button.scrollIntoViewIfNeeded();

  // Toggle once through Playwright first: it waits for actionability, so the panel
  // below is measured on a hydrated button rather than racing the React handler.
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await button.click();
  await expect(panel).toBeHidden();

  // Click and sample in one evaluate — no round-trip can straddle the animation.
  const run = await column.evaluate(
    (element) =>
      new Promise<{ final: number; samples: number[] }>((resolve) => {
        const content = element.querySelector<HTMLElement>(".nk-footer__col-content")!;
        const samples: number[] = [];
        element.querySelector<HTMLButtonElement>(".nk-footer__disclosure")!.click();
        const started = performance.now();
        const tick = () => {
          samples.push(content.getBoundingClientRect().height);
          if (performance.now() - started < 600) {
            requestAnimationFrame(tick);
            return;
          }
          resolve({ final: content.getBoundingClientRect().height, samples });
        };
        requestAnimationFrame(tick);
      }),
  );

  expect(run.final, "panel opens").toBeGreaterThan(200);
  // A display swap only ever produces 0 or the final height; a travelling row is
  // caught part-open on some frame.
  expect(
    run.samples.some((height) => height > 1 && height < run.final - 1),
    "panel travels rather than snapping",
  ).toBe(true);
});

// Asserting only the transition duration here would be near-vacuous: globals.css
// carries a blanket `* { transition-duration: .001ms !important }` under
// reduced-motion, so that passes whether or not the chevron is wired up at all.
// What matters is that the disclosure stays FUNCTIONAL — the rotation is state, not
// decoration, so it must still land, just without travelling.
test("footer disclosure still works, without motion, under reduced-motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "load" });

  const column = page.locator(".nk-footer__col--categories");
  const button = column.locator(".nk-footer__disclosure");
  const chevron = column.locator(".nk-footer__disclosure svg");
  await button.scrollIntoViewIfNeeded();

  const duration = await chevron.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration), "chevron transition is collapsed").toBeLessThanOrEqual(0.001);

  const collapsed = await chevron.evaluate((element) => getComputedStyle(element).transform);
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(column.locator(".nk-footer__col-content")).toBeVisible();

  // matrix(-1, 0, 0, -1, 0, 0) is the 180deg rotate; "none" would mean the state
  // cue never arrives for anyone who prefers reduced motion.
  const expanded = await chevron.evaluate((element) => getComputedStyle(element).transform);
  expect(expanded, "chevron still reflects the expanded state").not.toBe(collapsed);
  expect(expanded).not.toBe("none");
});
