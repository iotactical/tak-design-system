// rtmx:req REQ-XW-084
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');

describe('REQ-XW-084: Favicon', () => {
  const faviconPath = join(root, 'site', 'public', 'favicon.svg');

  it('favicon.svg exists in site/public/', () => {
    assert.ok(existsSync(faviconPath), 'site/public/favicon.svg should exist');
  });

  it('favicon.svg is a valid SVG with TAK shield', () => {
    const svg = readFileSync(faviconPath, 'utf-8');
    assert.ok(svg.includes('<svg'), 'should be an SVG file');
    assert.ok(svg.includes('viewBox'), 'should have a viewBox');
    assert.ok(svg.includes('TAK'), 'should contain TAK text');
    assert.ok(svg.includes('#126DA0'), 'should use TAK blue fill');
  });

  it('index.html references favicon.svg', () => {
    const indexPath = join(root, 'site', 'index.html');
    const html = readFileSync(indexPath, 'utf-8');
    assert.ok(
      html.includes('favicon.svg'),
      'index.html should reference favicon.svg'
    );
    assert.ok(
      html.includes('rel="icon"'),
      'index.html should have rel="icon" link'
    );
    assert.ok(
      html.includes('type="image/svg+xml"'),
      'favicon link should specify SVG type'
    );
  });

  it('page components set document.title', () => {
    const pages = [
      'Home.tsx', 'Colors.tsx', 'Typography.tsx', 'Spacing.tsx',
      'Components.tsx', 'Icons.tsx', 'Palettes.tsx', 'Platforms.tsx',
    ];
    const pagesDir = join(root, 'site', 'src', 'pages');
    for (const page of pages) {
      const src = readFileSync(join(pagesDir, page), 'utf-8');
      assert.ok(
        src.includes('document.title'),
        `${page} should set document.title`
      );
    }
  });
});
