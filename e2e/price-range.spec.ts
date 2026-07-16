import { expect, test, type Page } from "@playwright/test";

// The price-range filter, driven end to end. Assertions are deliberately
// data-independent — they check the control's contract (roles, values, the URL it
// writes, the cents it sends), never how many listings the live backend returns — so
// the suite is stable against whatever inventory the dev API currently holds.

// Navigate and WAIT FOR HYDRATION — until the client bundle attaches, a trigger tap
// is a no-op. The dev webServer may also be recompiling the route under parallel load,
// so callers retry the actual open.
const gotoFeed = async (page: Page) => {
  await page.goto("/skelbimai", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (window as Window & { __nkNavReady?: boolean }).__nkNavReady === true);
};

const openDesktopPopover = async (page: Page) => {
  const trigger = page.locator(".nk-price-field > button");
  await trigger.waitFor({ state: "visible" });
  await expect(async () => {
    if (!(await page.locator(".nk-price-pop").isVisible())) {
      await trigger.click();
    }
    await expect(page.locator(".nk-price-pop")).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20000 });
};

const sliders = (page: Page) => page.getByRole("slider");
const inputs = (page: Page) => page.locator(".nk-price-input input");

test.describe("price-range filter", () => {
  test("exposes two labelled sliders with bounds constrained against each other", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);

    const thumbs = sliders(page);
    await expect(thumbs).toHaveCount(2);
    const min = thumbs.nth(0);
    const max = thumbs.nth(1);
    await expect(min).toBeFocused(); // the popover autofocuses the min thumb

    for (const thumb of [min, max]) {
      await expect(thumb).toHaveAttribute("aria-label", /.+/);
      await expect(thumb).toHaveAttribute("aria-valuetext", /\d/);
      await expect(thumb).toHaveAttribute("aria-orientation", "horizontal");
    }
    await expect(min).toHaveAttribute("aria-valuemin", "0");
    await expect(min).toHaveAttribute("aria-valuemax", "200");
    await expect(max).toHaveAttribute("aria-valuemin", "0");
    await expect(max).toHaveAttribute("aria-valuemax", "200");
  });

  test("keyboard moves a thumb and it cannot pass the other", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);
    const min = sliders(page).nth(0);
    const max = sliders(page).nth(1);
    await min.focus();

    await min.press("ArrowRight");
    await min.press("ArrowRight");
    await expect(min).toHaveAttribute("aria-valuenow", "2");
    await min.press("PageUp");
    await expect(min).toHaveAttribute("aria-valuenow", "12");

    // End sends the min thumb to its reachable ceiling — the max thumb — and stops there.
    await min.press("End");
    const maxNow = await max.getAttribute("aria-valuenow");
    // Assert it rather than defaulting it: a `?? "200"` fallback would silently compare
    // against a literal if the attribute were ever dropped, and the test would still pass.
    expect(maxNow).not.toBeNull();
    await expect(min).toHaveAttribute("aria-valuenow", String(maxNow));
    // The max thumb's floor has followed the min up to that shared value.
    await expect(max).toHaveAttribute("aria-valuemin", String(maxNow));
  });

  test("commits on interaction end, not mid-drag", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);

    const track = page.locator(".nk-price-track");
    const min = sliders(page).nth(0);
    const startBox = await min.boundingBox();
    const trackBox = await track.boundingBox();
    if (!startBox || !trackBox) {
      throw new Error("slider geometry unavailable");
    }
    const centerY = startBox.y + startBox.height / 2;

    await page.mouse.move(startBox.x + startBox.width / 2, centerY);
    await page.mouse.down();
    await page.mouse.move(trackBox.x + trackBox.width * 0.3, centerY, { steps: 8 });
    // Still dragging: the value has moved, but nothing is written to the URL yet.
    await expect(min).not.toHaveAttribute("aria-valuenow", "0");
    expect(page.url()).not.toContain("price=");

    await page.mouse.up();
    // Interaction ended → the URL gains the range exactly now.
    await expect.poll(() => page.url()).toContain("price=");
  });

  test("a typed minimum leaves the top open and sends only the min cents", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);

    const backendRequest = page.waitForRequest(
      (req) => req.url().includes("/listings") && req.url().includes("price_min_cents"),
    );
    await inputs(page).nth(0).fill("50"); // max left on the €200 ceiling → "€50+"
    await inputs(page).nth(0).press("Enter");

    await expect(sliders(page).nth(0)).toHaveAttribute("aria-valuenow", "50");
    await expect.poll(() => page.url()).toContain("price=50-");
    const url = new URL((await backendRequest).url());
    expect(url.searchParams.get("price_min_cents")).toBe("5000");
    expect(url.searchParams.has("price_max_cents")).toBe(false);
  });

  test("a typed maximum leaves the floor open and sends only the max cents", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);

    const backendRequest = page.waitForRequest(
      (req) => req.url().includes("/listings") && req.url().includes("price_max_cents"),
    );
    await inputs(page).nth(1).fill("120");
    await inputs(page).nth(1).press("Enter");

    await expect(sliders(page).nth(1)).toHaveAttribute("aria-valuenow", "120");
    await expect.poll(() => page.url()).toContain("price=-120");
    const url = new URL((await backendRequest).url());
    expect(url.searchParams.get("price_max_cents")).toBe("12000");
    expect(url.searchParams.has("price_min_cents")).toBe(false);
  });

  test("a bounded range from both inputs drives both thumbs and the URL", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);

    // Commit each field deliberately so the two edits never collide.
    await inputs(page).nth(0).fill("40");
    await inputs(page).nth(0).press("Enter");
    await expect.poll(() => page.url()).toContain("price=40-");
    await inputs(page).nth(1).fill("120");
    await inputs(page).nth(1).press("Enter");

    await expect.poll(() => page.url()).toContain("price=40-120");
    await expect(sliders(page).nth(0)).toHaveAttribute("aria-valuenow", "40");
    await expect(sliders(page).nth(1)).toHaveAttribute("aria-valuenow", "120");
  });

  test("browser back and forward restore the committed range", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);
    await inputs(page).nth(0).fill("30");
    await inputs(page).nth(0).press("Enter");
    await expect.poll(() => page.url()).toContain("price=30-");
    // The trigger reflects the committed range (label reads "…30 …") — this is what
    // must survive navigation, and it doesn't depend on the popover's open state.
    const trigger = page.locator(".nk-price-field > button");
    await expect(trigger).toContainText("30");

    await page.goBack();
    await expect.poll(() => page.url()).not.toContain("price=");
    await expect(trigger).not.toContainText("30"); // back to "any price"

    await page.goForward();
    await expect.poll(() => page.url()).toContain("price=30-");
    await expect(trigger).toContainText("30"); // rehydrated from the URL
  });

  test("the mobile sheet shows an active chip and badge, and the chip clears the price", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeed(page);

    await page.locator(".nk-filters-mobilebtn").click();
    const sheet = page.locator(".nk-filtersheet");
    await expect(sheet).toBeVisible();
    // The range panel renders inline in the sheet (no nested layer).
    await expect(sheet.locator(".nk-price-panel")).toBeVisible();

    await sheet.locator(".nk-price-input input").nth(0).fill("30");
    await sheet.locator(".nk-price-input input").nth(0).press("Enter");
    await expect.poll(() => page.url()).toContain("price=30-");

    // Close the sheet; the badge on the Filters button and the removable chip reflect it.
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(page.locator(".nk-filters-badge")).toBeVisible();

    const chip = page.locator(".nk-fchip", { hasText: "€" }).first();
    await expect(chip).toBeVisible();
    await chip.click();
    await expect.poll(() => page.url()).not.toContain("price=");
  });
});
