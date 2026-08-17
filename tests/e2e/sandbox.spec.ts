// rtmx:req REQ-SITE-038
// rtmx:req REQ-SITE-039
// rtmx:req REQ-SITE-040
// rtmx:req REQ-SITE-041
// rtmx:req REQ-SITE-042
import { test, expect } from 'playwright/test';

const BASE = '/tak-design-system';

test.describe('Symbol Sandbox', () => {
  test('opens /sandbox as its own page', async ({ page }) => {
    await page.goto(`${BASE}/sandbox`);
    await expect(page.getByTestId('sandbox-page')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Symbol Sandbox');
    await expect(page.getByTestId('sandbox-preview')).toBeVisible();
  });

  test('/explorer/build redirects to /sandbox', async ({ page }) => {
    await page.goto(`${BASE}/explorer/build`);
    await expect(page).toHaveURL(/\/sandbox/);
    await expect(page.getByTestId('sandbox-page')).toBeVisible();
  });

  test('sidc query hydrates the D SIDC field', async ({ page }) => {
    await page.goto(`${BASE}/sandbox?sidc=10031000001100000000`);
    await expect(page.getByTestId('d-sidc-input')).toHaveValue('10031000001100000000');
  });

  test('invalid sidc does not crash', async ({ page }) => {
    await page.goto(`${BASE}/sandbox?sidc=not-a-sidc`);
    await expect(page.getByTestId('sandbox-page')).toBeVisible();
    await expect(page.getByTestId('d-sidc-input')).toHaveValue(/^[0-9]{20}$/);
  });
});

test.describe('Symbol Sandbox mobile', () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test('preview is at least 160px and the page does not scroll sideways', async ({ page }) => {
    await page.goto(`${BASE}/sandbox`);
    const preview = page.getByTestId('sandbox-preview');
    await expect(preview).toBeVisible();
    const box = await preview.boundingBox();
    expect(box).toBeTruthy();
    expect(Math.min(box!.width, box!.height)).toBeGreaterThanOrEqual(160);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('does not show a four-column SIDC grid', async ({ page }) => {
    await page.goto(`${BASE}/sandbox`);
    const grid = page.locator('[class*="buildVersionGrid"]');
    await expect(grid).toBeHidden();
  });

  test('does not show a fullscreen control', async ({ page }) => {
    await page.goto(`${BASE}/sandbox`);
    await expect(page.getByTestId('sandbox-fullscreen')).toHaveCount(0);
  });

  test('test_sandbox_touch: tap on the frame cycles Standard Identity', async ({ page }) => {
    await page.goto(`${BASE}/sandbox`);
    const select = page.getByTestId('sandbox-si-select');
    const before = await select.inputValue();
    await page.getByTestId('sandbox-frame').click();
    await expect(select).not.toHaveValue(before);
  });
});
