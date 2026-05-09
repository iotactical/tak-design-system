// rtmx:req REQ-SITE-002
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');
const SITE_DIST = join(ROOT, 'site', 'dist');

describe('REQ-SITE-002: Component gallery page', () => {
  // Build is handled by pretest script
  it('site/dist/index.html exists after build', () => {
    const indexPath = join(SITE_DIST, 'index.html');
    assert.ok(existsSync(indexPath), 'index.html should exist in site/dist');
    const html = readFileSync(indexPath, 'utf8');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Should be a valid HTML document');
  });

  it('built JS bundle contains component name references', () => {
    const assetsDir = join(SITE_DIST, 'assets');
    assert.ok(existsSync(assetsDir), 'assets directory should exist');

    const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
    assert.ok(jsFiles.length > 0, 'Should have at least one JS bundle');

    const bundleContent = jsFiles
      .map((f) => readFileSync(join(assetsDir, f), 'utf8'))
      .join('\n');

    const expectedComponents = [
      'Button',
      'NavBar',
      'ToolBar',
      'DockPane',
      'EditText',
      'Checkbox',
      'Toggle',
      'Spinner',
      'RadioGroup',
      'ListView',
      'TabLayout',
      'ProgressBar',
      'CoordinateDisplay',
      'RangeBearing',
      'MarkerDetail',
      'UserList',
      'Modal',
      'DialogPanel',
      'RadialMenu',
      'ChatPanel',
      'RoutePlanner',
      'NineLineForm',
      'ScaleBar',
      'CompassHeading',
      'ElevationProfile',
      'ConnectionStatus',
      'GPSStatus',
    ];

    for (const name of expectedComponents) {
      assert.ok(
        bundleContent.includes(name),
        `Bundle should contain reference to component "${name}"`
      );
    }
  });

  it('built CSS bundle contains ATAK dark theme colors', () => {
    const assetsDir = join(SITE_DIST, 'assets');
    const cssFiles = readdirSync(assetsDir).filter((f) => f.endsWith('.css'));
    assert.ok(cssFiles.length > 0, 'Should have at least one CSS file');

    const cssContent = cssFiles
      .map((f) => readFileSync(join(assetsDir, f), 'utf8'))
      .join('\n');

    // Check for ATAK dark theme colors (may be lowercased by minifier)
    const lowerCss = cssContent.toLowerCase();
    assert.ok(
      lowerCss.includes('#ffe35e') || lowerCss.includes('ffe35e'),
      'CSS should contain maize accent color #FFE35E'
    );
    assert.ok(
      lowerCss.includes('#1a1a1a') || lowerCss.includes('1a1a1a'),
      'CSS should contain onyx background color #1A1A1A'
    );
  });
});
