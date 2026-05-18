// rtmx:req REQ-XW-088
import { test, expect } from 'playwright/test';

test.describe('Tactical Graphics Gallery (/multipoint)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tak-design-system/multipoint');
  });

  test('page title and heading render', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Tactical Graphics');
  });

  test('no console errors from CSP or 404', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/tak-design-system/multipoint');
    // Wait for initial content
    await expect(page.locator('h1')).toHaveText('Tactical Graphics');
    await page.waitForTimeout(10_000);

    const realErrors = errors.filter((e) =>
      !e.includes('[multipoint-worker]') &&
      !e.includes('requires a modifiers object'),
    );

    const cspErrors = realErrors.filter((e) =>
      e.includes('Content Security Policy') || e.includes('connect-src'),
    );
    expect(cspErrors).toHaveLength(0);

    const notFoundErrors = realErrors.filter((e) => e.includes('404'));
    expect(notFoundErrors).toHaveLength(0);
  });

  test('version selector is present with B/C/D/E', async ({ page }) => {
    for (const v of ['B', 'C', 'D', 'E']) {
      await expect(page.getByRole('button', { name: v, exact: true })).toBeVisible();
    }
  });

  test('affiliation selector is present', async ({ page }) => {
    for (const a of ['Friendly', 'Hostile', 'Neutral', 'Unknown']) {
      await expect(page.getByRole('button', { name: a })).toBeVisible();
    }
  });
});

test.describe('Tactical Graphics - Desktop Grid', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'desktop-only test');
    await page.goto('/tak-design-system/multipoint');
  });

  test('gallery cards appear', async ({ page }) => {
    const cards = page.locator('[data-testid="gallery-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(40);
  });

  test('cards contain canvas elements (maps rendered)', async ({ page }) => {
    const cards = page.locator('[data-testid="gallery-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });

    const canvases = page.locator('[data-testid="gallery-card"] canvas');
    await expect(canvases.first()).toBeVisible({ timeout: 30_000 });
    const canvasCount = await canvases.count();
    expect(canvasCount).toBeGreaterThanOrEqual(1);
  });

  test('version selector switches SIDC format', async ({ page }) => {
    const cards = page.locator('[data-testid="gallery-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });

    const firstSidc = cards.first().locator('[class*="cardSidc"]');
    const eSidc = await firstSidc.textContent();
    expect(eSidc).toHaveLength(20);

    await page.getByRole('button', { name: 'B', exact: true }).click();
    await page.waitForTimeout(1_000);
    const bSidc = await firstSidc.textContent();
    expect(bSidc).toHaveLength(15);
  });

  test('affiliation selector changes SIDC', async ({ page }) => {
    const cards = page.locator('[data-testid="gallery-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });

    const firstSidc = cards.first().locator('[class*="cardSidc"]');
    const friendlySidc = await firstSidc.textContent();

    await page.getByRole('button', { name: 'Hostile' }).click();
    await page.waitForTimeout(1_000);
    const hostileSidc = await firstSidc.textContent();
    expect(hostileSidc).not.toEqual(friendlySidc);
  });

  test('category filter reduces card count', async ({ page }) => {
    const cards = page.locator('[data-testid="gallery-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    const allCount = await cards.count();

    await page.getByRole('button', { name: 'Line' }).click();
    await page.waitForTimeout(500);
    const lineCount = await cards.count();
    expect(lineCount).toBeLessThan(allCount);
    expect(lineCount).toBeGreaterThan(0);
  });
});

test.describe('Tactical Graphics - Mobile', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test');
    await page.goto('/tak-design-system/multipoint');
  });

  test('mobile layout shows single map viewer', async ({ page }) => {
    await expect(page.locator('[class*="mobileLayout"]')).toBeVisible({ timeout: 15_000 });
  });

  test('mobile list shows graphic items', async ({ page }) => {
    const listItems = page.locator('[class*="mobileListItem"]');
    await expect(listItems.first()).toBeVisible({ timeout: 15_000 });
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(40);
  });

  test('mobile tap selects a graphic', async ({ page }) => {
    await expect(page.locator('[class*="mobileLayout"]')).toBeVisible({ timeout: 15_000 });

    const listItems = page.locator('[class*="mobileListItem"]');
    await expect(listItems.first()).toBeVisible({ timeout: 10_000 });

    const secondItem = listItems.nth(1);
    const secondName = await secondItem.locator('[class*="mobileListName"]').textContent();
    await secondItem.click();

    await expect(page.locator('[class*="mobileSelectedName"]')).toHaveText(secondName!);
  });

  test('mobile map canvas renders', async ({ page }) => {
    await expect(page.locator('[class*="mobileLayout"]')).toBeVisible({ timeout: 15_000 });

    // The single mobile map should eventually render a canvas
    const canvas = page.locator('[class*="mobileMap"] canvas');
    await expect(canvas.first()).toBeVisible({ timeout: 30_000 });
  });

  test('mobile version switch updates SIDC', async ({ page }) => {
    await expect(page.locator('[class*="mobileLayout"]')).toBeVisible({ timeout: 15_000 });

    const sidc = page.locator('[class*="cardSidc"]');
    const eSidc = await sidc.textContent();
    expect(eSidc).toHaveLength(20);

    await page.getByRole('button', { name: 'B', exact: true }).click();
    await page.waitForTimeout(1_000);
    const bSidc = await sidc.textContent();
    expect(bSidc).toHaveLength(15);
  });
});
