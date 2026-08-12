// rtmx:req REQ-SITE-030
// rtmx:req REQ-SITE-031
// rtmx:req REQ-SITE-034
import { test, expect, type Page } from 'playwright/test';

// Narrowest viewport the site targets; below the 480px polish breakpoints.
const NARROW = { width: 360, height: 780 };

/** Horizontal overflow of the document, in CSS pixels. */
function documentOverflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
}

const PAGES = [
  ['Typography', '/tak-design-system/typography'],
  ['Spacing', '/tak-design-system/spacing'],
  ['Interfaces', '/tak-design-system/interfaces'],
  ['Platforms', '/tak-design-system/platforms'],
  ['Icons', '/tak-design-system/icons'],
] as const;

test.describe('Mobile responsiveness at 360px', () => {
  test.use({ viewport: NARROW });

  for (const [name, url] of PAGES) {
    test(`${name} does not force the page to scroll sideways`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('h1')).toBeVisible();
      // Sub-pixel layout rounding can leave a fraction of a pixel behind.
      expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
    });
  }

  // The token reference pages are expected to reflow rather than hand the user a
  // scrollable strip, so no wrapper on them may overflow either.
  for (const [name, url] of [PAGES[0], PAGES[1]]) {
    test(`${name} tables fit without an inner scroll strip`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('h1')).toBeVisible();

      const overflowing = await page.evaluate(() =>
        Array.from(document.querySelectorAll('section *'))
          .filter((el) => el.scrollWidth - el.clientWidth > 1)
          .map((el) => `${el.tagName.toLowerCase()}.${el.className}`),
      );
      expect(overflowing).toEqual([]);
    });
  }

  test('Interfaces intent table scrolls inside its wrapper, not the page', async ({ page }) => {
    await page.goto('/tak-design-system/interfaces/intents');

    const wrapper = page.locator('[class*="intentTableWrap"]');
    await expect(wrapper).toBeVisible();

    const scrollable = await wrapper.evaluate((el) => ({
      overflowX: getComputedStyle(el).overflowX,
      canScroll: el.scrollWidth > el.clientWidth,
    }));
    expect(scrollable.overflowX).toBe('auto');
    expect(scrollable.canScroll).toBe(true);

    expect(await documentOverflow(page)).toBeLessThanOrEqual(1);
  });

  test('Platforms copy button sits above the code instead of over it', async ({ page }) => {
    await page.goto('/tak-design-system/platforms');

    const button = page.getByRole('button', { name: 'Copy' }).first();
    const code = page.locator('pre').first();
    await expect(button).toBeVisible();

    const [buttonBox, codeBox] = await Promise.all([button.boundingBox(), code.boundingBox()]);
    expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(codeBox!.y + 1);
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
  });
});
