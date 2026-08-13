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
  ['Sources', '/tak-design-system/sources'],
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

  test('floating controls stay tappable while the nav drawer is open', async ({ page }) => {
    await page.goto('/tak-design-system/');

    const menu = page.getByRole('button', { name: 'Toggle navigation' });
    await menu.click();
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');

    // The backdrop used to swallow these: hit-test the centre of each control.
    const reachable = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button'))
        .filter((el) => getComputedStyle(el).position === 'fixed' && getComputedStyle(el).display !== 'none')
        .map((el) => {
          const r = el.getBoundingClientRect();
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return { label: el.getAttribute('aria-label'), reachable: !!hit && (hit === el || el.contains(hit)) };
        }),
    );
    expect(reachable.length).toBeGreaterThan(0);
    expect(reachable.filter((c) => !c.reachable)).toEqual([]);

    // And the control that opened the drawer can close it again.
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  });
});

// REQ-SITE-036: the grid blew out into a second column that ran off screen, which
// the 360px sweep missed because that width is single column.
test.describe('Home card grid fits every mobile width', () => {
  for (const width of [360, 390, 430, 480, 560, 600, 679]) {
    test(`no sideways scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/tak-design-system/');

      const grid = page.locator('[data-testid="mobile-grid"]');
      await expect(grid).toBeVisible();
      expect(await documentOverflow(page)).toBeLessThanOrEqual(1);

      const cards = await grid.evaluate((el) => {
        const vw = document.documentElement.clientWidth;
        return Array.from(el.children).map((c) => {
          const r = c.getBoundingClientRect();
          return { right: r.right, clipped: r.right > vw + 1 };
        });
      });
      expect(cards.filter((c) => c.clipped)).toEqual([]);
    });
  }
});
