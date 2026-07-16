import { expect, test, type Page } from "@playwright/test";

// The feed's calendar date-range filter, driven end to end. Assertions are deliberately
// data-independent — they check the control's contract (grid roles, the URL it writes,
// the params it sends), never how many listings the live backend returns — so the suite
// is stable against whatever inventory the dev API currently holds.

const DATES_TOKEN = /dates=\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}/;

// Navigate and WAIT FOR HYDRATION — until the client bundle attaches, a trigger tap is a
// no-op. The dev webServer may also be recompiling under parallel load, so callers retry
// the actual open.
const gotoFeed = async (page: Page) => {
  await page.goto("/skelbimai", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => (window as Window & { __nkNavReady?: boolean }).__nkNavReady === true);
};

const openDesktopPopover = async (page: Page) => {
  const trigger = page.locator(".nk-datefilter-field > button");
  await trigger.waitFor({ state: "visible" });
  await expect(async () => {
    if (!(await page.locator(".nk-datefilter-pop").isVisible())) {
      await trigger.click();
    }
    await expect(page.locator(".nk-datefilter-pop")).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 20000 });
};

// The roving cell (tabindex=0) — the popover autofocuses it, but focus it explicitly so
// the keyboard sequence is deterministic regardless of the autofocus race.
const rovingCell = (root: Page | ReturnType<Page["locator"]>) =>
  root.locator('[role="gridcell"][tabindex="0"]');

// The market's today, and ISO day arithmetic — the same UTC-midnight stepping app/lib
// /dates.ts uses, so a window built here means what the app thinks it means. Derived from
// the clock rather than hardcoded: a fixed date would silently rot into "fully past".
const marketToday = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Vilnius" }).format(new Date());
const shiftDays = (iso: string, days: number) => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

test.describe("date-range filter", () => {
  test("opens a month grid with a single roving cell and today marked", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);

    const pop = page.locator(".nk-datefilter-pop");
    await expect(pop.getByRole("grid")).toBeVisible();
    await expect(pop.locator('[role="gridcell"]').first()).toBeVisible();
    // One Tab stop in the grid (roving tabindex), and today carries aria-current.
    await expect(rovingCell(pop)).toHaveCount(1);
    await expect(pop.locator('[aria-current="date"]')).toHaveCount(1);
    // The month can't page before the current month — today is the earliest day.
    await expect(pop.locator(".nk-cal__nav").first()).toBeDisabled();
  });

  test("keyboard selects a start then an end and writes a ?dates= window", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);
    const pop = page.locator(".nk-datefilter-pop");
    await rovingCell(pop).focus();

    // Move a couple of days ahead of today and pick the start.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    // Still mid-selection: nothing written to the URL yet (so nothing refetched).
    expect(page.url()).not.toContain("dates=");

    // Grow the range and pick the end — the popover commits and closes.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.url()).toMatch(DATES_TOKEN);
  });

  test("a single day is expressible (minDays is 1)", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);
    const pop = page.locator(".nk-datefilter-pop");
    await rovingCell(pop).focus();

    // Enter on the same cell twice: start, then end === start → a one-day window "X..X".
    await page.keyboard.press("ArrowRight"); // land on a definitely-future day
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.url()).toMatch(DATES_TOKEN);
    const value = new URL(await page.evaluate(() => window.location.href)).searchParams.get("dates");
    const [from, to] = (value ?? "").split("..");
    expect(from).toBe(to); // same date on both sides
  });

  test("a committed window sends available_from/available_to to the backend", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);
    const pop = page.locator(".nk-datefilter-pop");
    await rovingCell(pop).focus();

    const backendRequest = page.waitForRequest(
      (req) => req.url().includes("/listings") && req.url().includes("available_from"),
    );
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");

    const url = new URL((await backendRequest).url());
    // Both bounds or neither — the documented backend contract.
    expect(url.searchParams.get("available_from")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(url.searchParams.get("available_to")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // A shared "this weekend" link opened next week. The server prefetches the CLAMPED
  // window, so the client's first render must clamp against the same date (it is handed
  // down as `serverToday` — useMarketToday() is undefined until mount). If it keys off the
  // raw window instead, the dehydrated page is discarded and a request goes out whose
  // already-past `available_from` the backend answers with an EMPTY page: the feed blinks
  // to nothing. staleTime is 5min, so a key that matches fires no client request at all —
  // which is exactly what makes the wire assertion below decisive.
  test("a straddling ?dates= link never puts a past window on the wire", async ({ page }) => {
    const today = marketToday();
    const opened: string[] = [];
    page.on("request", (req) => {
      const url = new URL(req.url());
      const from = url.searchParams.get("available_from");
      if (url.pathname.includes("/listings") && from) {
        opened.push(from);
      }
    });

    await page.goto(`/skelbimai?dates=${shiftDays(today, -2)}..${shiftDays(today, 3)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(() => (window as Window & { __nkNavReady?: boolean }).__nkNavReady === true);

    // The filter is genuinely applied (so an empty `opened` below means "prefetch
    // consumed", not "feature gone"). The pill, not a chip: chips are mobile-only.
    await expect(page.locator(".nk-datefilter-field > button")).toHaveClass(/is-active/);

    await page.waitForLoadState("networkidle");
    expect(opened.filter((from) => from < today)).toEqual([]);
  });

  test("a fully past ?dates= link drops the filter rather than emptying the feed", async ({ page }) => {
    const today = marketToday();
    const trigger = page.locator(".nk-datefilter-field > button");

    // Read the resting label off a clean feed rather than importing the dictionary — the
    // point is that a stale link is indistinguishable from no filter, in whatever locale.
    await gotoFeed(page);
    const anyDatesLabel = (await trigger.textContent())?.trim() ?? "";
    expect(anyDatesLabel).not.toBe("");

    await page.goto(`/skelbimai?dates=${shiftDays(today, -9)}..${shiftDays(today, -2)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(() => (window as Window & { __nkNavReady?: boolean }).__nkNavReady === true);
    // Nothing to clear, and the pill says so — the URL token is inert.
    await expect(trigger).not.toHaveClass(/is-active/);
    await expect(trigger).toHaveText(anyDatesLabel);
  });

  test("browser back and forward restore the committed window in the pill", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);
    const pop = page.locator(".nk-datefilter-pop");
    await rovingCell(pop).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.url()).toMatch(DATES_TOKEN);

    const trigger = page.locator(".nk-datefilter-field > button");
    const activeLabel = (await trigger.textContent())?.trim() ?? "";
    expect(activeLabel).not.toBe("");

    await page.goBack();
    await expect.poll(() => page.url()).not.toContain("dates=");
    await expect(trigger).not.toHaveText(activeLabel); // back to "Any dates"

    await page.goForward();
    await expect.poll(() => page.url()).toMatch(DATES_TOKEN);
    await expect(trigger).toHaveText(activeLabel); // rehydrated from the URL
  });

  // Clear disables itself once there is nothing left to clear, and a disabled element
  // hands focus to <body> — which would drop a keyboard user out of the panel with Escape
  // dead. Focus has to land back in the grid.
  test("Clear keeps focus inside the panel instead of dropping it to the body", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);
    const pop = page.locator(".nk-datefilter-pop");
    await rovingCell(pop).focus();
    await page.keyboard.press("Enter"); // a start — enough to arm Clear

    await pop.getByRole("button", { name: /./ }).last().waitFor();
    const clear = pop.locator(".nk-cal__foot .nk-btn").first();
    await expect(clear).toBeEnabled();
    await clear.click();

    await expect(clear).toBeDisabled();
    await expect(rovingCell(pop)).toBeFocused();
    // ...and Escape still reaches the layer, which is what the focus was protecting.
    await page.keyboard.press("Escape");
    await expect(pop).toBeHidden();
  });

  test("Tab out of the popover closes it instead of orphaning the dialog", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);
    const pop = page.locator(".nk-datefilter-pop");
    await expect(pop).toBeVisible();

    // Walk focus past the panel's last control; leaving the field dismisses the layer
    // WITHOUT yanking focus back to the trigger (the user is on their way elsewhere).
    for (let i = 0; i < 12 && (await pop.isVisible()); i += 1) {
      await page.keyboard.press("Tab");
    }
    await expect(pop).toBeHidden();
    await expect(page.locator(".nk-datefilter-field > button")).not.toBeFocused();
  });

  // Committing the window already in the URL is an ordinary slip (click the start twice),
  // and it must not grow the back stack — one Back has to leave the feed unfiltered.
  test("re-picking the same window does not push a duplicate history entry", async ({ page }) => {
    await gotoFeed(page);
    await openDesktopPopover(page);
    const pop = page.locator(".nk-datefilter-pop");
    await rovingCell(pop).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.url()).toMatch(DATES_TOKEN);
    const committed = page.url();

    // Re-open and pick the SAME window again. The panel remounts with focusDate on the
    // committed start, so Enter there restarts the range where it already began, and one
    // ArrowRight + Enter lands the end back on its existing day — the everyday slip.
    await openDesktopPopover(page);
    await rovingCell(pop).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.url()).toBe(committed);

    // The guard's whole point: ONE Back leaves the feed, not two.
    await page.goBack();
    await expect.poll(() => page.url()).not.toContain("dates=");
  });

  test("the mobile sheet renders the calendar inline; a chip reflects and clears it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoFeed(page);

    await page.locator(".nk-filters-mobilebtn").click();
    const sheet = page.locator(".nk-filtersheet");
    await expect(sheet).toBeVisible();
    // The calendar renders inline in the sheet (no nested popover).
    await expect(sheet.locator(".nk-datefilter-panel")).toBeVisible();
    await expect(sheet.getByRole("grid")).toBeVisible();

    // The inline grid doesn't autofocus, so focus the roving cell before driving it.
    await rovingCell(sheet).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect.poll(() => page.url()).toMatch(DATES_TOKEN);

    // Close the sheet; the Filters badge and a removable chip reflect the active window.
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(page.locator(".nk-filters-badge")).toBeVisible();

    // By content, not position: `.first()` would silently follow the chip order if another
    // filter ever precedes dates. The en-dash is the date band's own separator.
    const chip = page.locator(".nk-fchip", { hasText: "–" });
    await expect(chip).toBeVisible();
    await chip.click();
    await expect.poll(() => page.url()).not.toContain("dates=");
  });
});
