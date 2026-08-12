// rtmx:req REQ-SITE-029
import { test, expect, type Page } from 'playwright/test';

const ICONS_URL = '/tak-design-system/icons';
const PREVIEW = '[data-testid="card-preview"]';

/** Counts preview slots and how many of them currently hold a rendered icon. */
function previewCounts(page: Page) {
  return page.evaluate((selector) => {
    const slots = Array.from(document.querySelectorAll(selector));
    return {
      total: slots.length,
      mounted: slots.filter((slot) => slot.childElementCount > 0).length,
    };
  }, PREVIEW);
}

async function waitForFirstMount(page: Page) {
  await expect(page.locator('h1')).toContainText('Icon and Drawable Browser');
  await expect.poll(async () => (await previewCounts(page)).mounted, { timeout: 15_000 }).toBeGreaterThan(0);
}

test.describe('Icons grid virtualization (/icons)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ICONS_URL);
  });

  test('every catalog entry keeps a card so the grid geometry is complete', async ({ page }) => {
    await waitForFirstMount(page);
    const { total } = await previewCounts(page);
    expect(total).toBeGreaterThan(1_000);
  });

  test('only a small window of previews is mounted', async ({ page }) => {
    await waitForFirstMount(page);
    const { total, mounted } = await previewCounts(page);
    expect(mounted).toBeLessThan(total / 4);
  });

  test('scrolling mounts previews further down and releases those left behind', async ({ page }) => {
    await waitForFirstMount(page);

    const firstHasIcon = () =>
      page.evaluate((selector) => document.querySelector(selector)!.childElementCount > 0, PREVIEW);

    expect(await firstHasIcon()).toBe(true);

    await page.evaluate(() => window.scrollTo(0, 20_000));

    // The first card is now far above the viewport, so its preview is released.
    await expect.poll(firstHasIcon, { timeout: 10_000 }).toBe(false);

    const { mounted } = await previewCounts(page);
    expect(mounted).toBeGreaterThan(0);
  });

  test('search still filters the full catalog, not just mounted cards', async ({ page }) => {
    await waitForFirstMount(page);
    const { total } = await previewCounts(page);

    await page.getByLabel('Search icons').fill('toolbar');

    await expect.poll(async () => (await previewCounts(page)).total, { timeout: 10_000 }).toBeLessThan(total);
    const filtered = await previewCounts(page);
    expect(filtered.total).toBeGreaterThan(0);
  });
});
