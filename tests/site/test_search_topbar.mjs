// rtmx:req REQ-XW-117
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');
const SITE_SRC = join(ROOT, 'site', 'src');

describe('REQ-XW-117: Move search to top bar', () => {
  it('App.tsx renders GlobalSearch inside topBar div, not in sidebar', () => {
    const content = readFileSync(join(SITE_SRC, 'App.tsx'), 'utf8');

    // GlobalSearch should be inside topBar
    assert.ok(
      content.includes('topBar') && content.includes('GlobalSearch'),
      'App.tsx should contain both topBar and GlobalSearch references',
    );

    // Verify GlobalSearch is inside topBar div, not inside sidebar nav
    const topBarMatch = content.match(/className=\{styles\.topBar\}[\s\S]*?<GlobalSearch/);
    assert.ok(topBarMatch, 'GlobalSearch should be rendered inside topBar div');

    // Verify GlobalSearch is NOT between sidebar opening and closing tags
    const sidebarSection = content.match(/<nav[^>]*styles\.sidebar[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(sidebarSection, 'Should have a sidebar nav element');
    assert.ok(
      !sidebarSection[1].includes('GlobalSearch'),
      'GlobalSearch should NOT be inside sidebar nav',
    );
  });

  it('App.module.css defines topBar class with fixed positioning', () => {
    const content = readFileSync(join(SITE_SRC, 'App.module.css'), 'utf8');

    assert.ok(content.includes('.topBar'), 'Should define .topBar class');
    assert.ok(content.includes('position: fixed'), 'topBar should use fixed positioning');
    assert.ok(content.includes('left: 240px'), 'topBar should start after 240px sidebar');
    assert.ok(content.includes('height: 48px'), 'topBar should be 48px tall');
    assert.ok(content.includes('z-index: 100'), 'topBar should have z-index 100');
  });

  it('content area has padding-top for fixed top bar', () => {
    const content = readFileSync(join(SITE_SRC, 'App.module.css'), 'utf8');

    // Extract the .content block
    const contentBlock = content.match(/\.content\s*\{[^}]+\}/);
    assert.ok(contentBlock, 'Should have .content class');
    assert.ok(
      contentBlock[0].includes('padding-top: 48px'),
      'Content area should have padding-top: 48px for fixed top bar',
    );
  });

  it('GlobalSearch wrapper is set to fill top bar width', () => {
    const css = readFileSync(join(SITE_SRC, 'components', 'GlobalSearch.module.css'), 'utf8');

    // The search wrapper should use flex: 1 to fill available space
    const wrapperBlock = css.match(/\.searchWrapper\s*\{[^}]+\}/);
    assert.ok(wrapperBlock, 'Should have .searchWrapper class');
    assert.ok(
      wrapperBlock[0].includes('flex: 1'),
      'searchWrapper should use flex: 1 to fill top bar width',
    );
  });
});
