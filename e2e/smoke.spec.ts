import { test, expect } from "@playwright/test";

// Critical bridge-site flows, run against the mock data layer (see
// playwright.config.ts). Selectors use stable ids/classes, not copy, so the
// suite survives dictionary edits.

test("home hero search routes to the feed with the query", async ({ page }) => {
  await page.goto("/");
  const input = page.locator(".nk-search__input");
  await input.fill("Sony");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/skelbimai\?q=Sony/);
  await expect(page.locator("#nk-feed-search-input")).toHaveValue("Sony");
});

test("feed filters hydrate from the URL and clear back to the bare feed", async ({ page }) => {
  await page.goto("/skelbimai?q=Sony");
  await expect(page.locator("#nk-feed-search-input")).toHaveValue("Sony");
  // The matching mock listing renders as a card linking to its detail page.
  await expect(page.locator('a[href="/skelbimai/sony-a7-iii"]').first()).toBeVisible();
  await page.locator("button.nk-clear").click();
  await expect(page).toHaveURL(/\/skelbimai$/);
  await expect(page.locator("#nk-feed-search-input")).toHaveValue("");
});

test("feed pagination: renders the full set and shows no spurious load-more when there is no next page", async ({ page }) => {
  await page.goto("/skelbimai");
  const cards = page.locator("#nk-main article.nk-offer");
  // The mock set fits in a single page (< page size), so the cursor is exhausted
  // on the first page and the load-more control must not appear.
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(page.locator("#nk-main button.nk-btn--ghost")).toHaveCount(0);
});

test("listing detail locked CTA opens the app-redirect dialog; Escape closes and unlocks scroll", async ({ page }) => {
  await page.goto("/skelbimai/sony-a7-iii");
  await expect(page.locator("h1")).toHaveText("Sony A7 III");
  await page.locator(".nk-reserve button.nk-btn--primary").first().click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("locale routing: lt unprefixed, en at /en, /lt redirects to bare path", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "lt");
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/lt/kategorijos");
  await expect(page).toHaveURL(/\/kategorijos$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "lt");
});

test("skip link is the first focusable element and targets the main landmark", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.locator("a.nk-skip");
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#nk-main$/);
});
