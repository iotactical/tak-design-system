// rtmx:req REQ-SITE-001
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const siteDist = join(root, 'site', 'dist');

describe('REQ-SITE-001: Site build', () => {
  // Build is handled by pretest script
  it('site/dist directory exists after build', () => {
    assert.ok(existsSync(siteDist), 'site/dist directory should exist');
  });

  it('should produce index.html', () => {
    const indexPath = join(siteDist, 'index.html');
    assert.ok(existsSync(indexPath), 'site/dist/index.html should exist');
  });

  it('should produce JS assets', () => {
    const assetsDir = join(siteDist, 'assets');
    assert.ok(existsSync(assetsDir), 'site/dist/assets/ should exist');
    const files = readdirSync(assetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    assert.ok(jsFiles.length > 0, 'should have at least one .js file in assets');
  });

  it('should produce CSS assets', () => {
    const assetsDir = join(siteDist, 'assets');
    const files = readdirSync(assetsDir);
    const cssFiles = files.filter((f) => f.endsWith('.css'));
    assert.ok(cssFiles.length > 0, 'should have at least one .css file in assets');
  });
});
