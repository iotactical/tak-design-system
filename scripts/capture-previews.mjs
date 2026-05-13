#!/usr/bin/env node
/**
 * Capture preview screenshots of each site page for the Home page cards.
 * Uses Playwright to render each page and save a cropped screenshot.
 *
 * Usage: npx playwright test --config=scripts/capture-previews.mjs
 *   or:  node scripts/capture-previews.mjs
 *
 * Requires: npx playwright install chromium
 * Expects: site dev server running on http://localhost:5173
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(__dirname, '../site/public/previews');
const BASE_URL = 'http://localhost:5173/tak-design-system';

const PAGES = [
  { path: '/colors', file: 'preview-colors.png', waitFor: 1000 },
  { path: '/typography', file: 'preview-typography.png', waitFor: 500 },
  { path: '/spacing', file: 'preview-spacing.png', waitFor: 500 },
  { path: '/components', file: 'preview-components.png', waitFor: 1500 },
  { path: '/icons', file: 'preview-icons.png', waitFor: 1500 },
  { path: '/palettes', file: 'preview-palettes.png', waitFor: 2000 },
  { path: '/platforms', file: 'preview-platforms.png', waitFor: 500 },
  { path: '/interfaces', file: 'preview-interfaces.png', waitFor: 1000 },
  { path: '/multipoint', file: 'preview-multipoint.png', waitFor: 6000, timeout: 60000 },
  { path: '/explorer', file: 'preview-explorer.png', waitFor: 2000 },
];

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });

  for (const page of PAGES) {
    const tab = await context.newPage();
    console.log(`Capturing ${page.path}...`);

    try {
      await tab.goto(`${BASE_URL}${page.path}`, { waitUntil: 'networkidle', timeout: page.timeout || 30000 });
      // Extra wait for dynamic content (maps, icons, etc.)
      await tab.waitForTimeout(page.waitFor);

      // Hide the sidebar and topbar for a cleaner screenshot
      await tab.evaluate(() => {
        const sidebar = document.querySelector('nav');
        const topBar = document.querySelectorAll('[class*="topBar"]');
        if (sidebar) sidebar.style.display = 'none';
        topBar.forEach(el => { el.style.display = 'none'; });
        const content = document.querySelector('main');
        if (content) {
          content.style.marginLeft = '0';
          content.style.paddingTop = '16px';
        }
      });

      // Capture the main content area
      const clip = { x: 0, y: 0, width: 1280, height: 900 };
      await tab.screenshot({
        path: resolve(OUTPUT_DIR, page.file),
        clip,
        type: 'png',
      });
      console.log(`  -> ${page.file}`);
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
    }

    await tab.close();
  }

  await browser.close();
  console.log(`\nDone. Previews saved to ${OUTPUT_DIR}`);
}

main().catch(console.error);
