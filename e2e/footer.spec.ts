import { expect, test } from "@playwright/test";

const WIDTHS = [320, 360, 390, 430, 768, 1024, 1105, 1186, 1280, 1509, 1971];

test("footer stays compact, readable, and collision-free at requested widths", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/", { waitUntil: "load" });
  const footer = page.locator("footer.nk-footer");
  await expect(footer).toBeVisible();

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: width <= 430 ? 932 : 900 });
    // Rest at the true page bottom — that is where the footer is actually read,
    // and the state the reserved 48px track in .nk-footer__bottom protects.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator(".nk-backtotop")).toHaveClass(/is-on/);

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
          socialTop: socialRect.top,
          socialBottom: socialRect.bottom,
          badgesTop: badgesRect.top,
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
      };
    });

    expect(audit.overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
    expect(audit.overlaps, `back-to-top overlaps footer bottom bar at ${width}px`).toEqual([]);
    expect(audit.backToTop, `back-to-top float state at ${width}px`)
      .toEqual({ position: "fixed", visibility: "visible" });
    expect(Math.min(...audit.paymentHeights), `payment mark height at ${width}px`).toBeGreaterThanOrEqual(29);
    expect(audit.helpTrailingBorder, `help trailing divider at ${width}px`).toBe(0);

    if (width === 1024) {
      expect(
        Math.abs(audit.tabletBrandAlignment.socialTop - audit.tabletBrandAlignment.taglineTop),
        "social row aligns with the tablet tagline",
      ).toBeLessThanOrEqual(1);
      expect(
        audit.tabletBrandAlignment.badgesTop - audit.tabletBrandAlignment.socialBottom,
        "tablet social-to-store gap",
      ).toBeGreaterThanOrEqual(24);
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

    if (width <= 430) {
      expect(audit.disclosureDisplay, `mobile disclosure at ${width}px`).toBe("flex");
      expect(audit.categoryDisplay, `collapsed category content at ${width}px`).toBe("none");
      expect(audit.footerHeight, `compact mobile footer at ${width}px`).toBeLessThan(800);
    } else {
      expect(audit.disclosureDisplay, `desktop disclosure at ${width}px`).toBe("none");
      expect(audit.categoryDisplay, `desktop category content at ${width}px`).toBe("block");
    }
  }
});

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

  const categories = footer.getByRole("button", { name: "Kategorijos", exact: true });
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

  await page.keyboard.press("Space");
  await expect(categories).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();
});

test("footer motion collapses under the reduced-motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "load" });
  const chevron = page.locator(".nk-footer__col--categories .nk-footer__disclosure svg");
  const duration = await chevron.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
});
