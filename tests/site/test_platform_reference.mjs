// rtmx:req REQ-SITE-004
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const siteDist = join(root, 'site', 'dist');

describe('REQ-SITE-004: Platform output reference pages', () => {
  // Build is handled by pretest script
  it('should produce JS bundle containing Android color references', () => {
    const assetsDir = join(siteDist, 'assets');
    const files = readdirSync(assetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    assert.ok(jsFiles.length > 0, 'should have JS bundles');

    const allJs = jsFiles
      .map((f) => readFileSync(join(assetsDir, f), 'utf-8'))
      .join('\n');

    // Android XML color resources should be bundled
    assert.ok(
      allJs.includes('tak_colors') || allJs.includes('tak_color'),
      'built output should reference Android color resource names'
    );
  });

  it('should produce JS bundle containing CSS token references', () => {
    const assetsDir = join(siteDist, 'assets');
    const files = readdirSync(assetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    const allJs = jsFiles
      .map((f) => readFileSync(join(assetsDir, f), 'utf-8'))
      .join('\n');

    // CSS custom properties should be bundled
    assert.ok(
      allJs.includes('--tak-') || allJs.includes('tak-tokens'),
      'built output should reference CSS token content'
    );
  });

  it('should produce JS bundle containing mil-sym bridge references', () => {
    const assetsDir = join(siteDist, 'assets');
    const files = readdirSync(assetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    const allJs = jsFiles
      .map((f) => readFileSync(join(assetsDir, f), 'utf-8'))
      .join('\n');

    // mil-sym bridge content should be bundled
    assert.ok(
      allJs.includes('mil-sym') || allJs.includes('mil_sym'),
      'built output should reference mil-sym bridge content'
    );
  });

  it('should produce JS bundle containing Compose/Kotlin references', () => {
    const assetsDir = join(siteDist, 'assets');
    const files = readdirSync(assetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    const allJs = jsFiles
      .map((f) => readFileSync(join(assetsDir, f), 'utf-8'))
      .join('\n');

    assert.ok(
      allJs.includes('TakColors') || allJs.includes('Color('),
      'built output should reference Compose Kotlin content'
    );
  });

  it('should produce JS bundle containing VS Code theme references', () => {
    const assetsDir = join(siteDist, 'assets');
    const files = readdirSync(assetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    const allJs = jsFiles
      .map((f) => readFileSync(join(assetsDir, f), 'utf-8'))
      .join('\n');

    assert.ok(
      allJs.includes('tak-dark') || allJs.includes('editor.background'),
      'built output should reference VS Code theme content'
    );
  });
});
