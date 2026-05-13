// rtmx:req REQ-XW-260
// rtmx:req REQ-XW-261
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE = resolve(ROOT, 'site', 'src');

describe('REQ-XW-260: Fix coordinate separator in example data', () => {
  it('multipoint-examples.ts controlPoints use spaces not semicolons', () => {
    const src = readFileSync(resolve(SITE, 'data', 'multipoint-examples.ts'), 'utf8');
    const cpLines = src.split('\n').filter((l) => l.includes('controlPoints:'));
    assert.ok(cpLines.length >= 12, `Should have at least 12 controlPoints entries, found ${cpLines.length}`);
    for (const line of cpLines) {
      // Extract the string value between quotes
      const match = line.match(/controlPoints:\s*'([^']+)'/);
      if (match) {
        assert.ok(!match[1].includes(';'), `controlPoints should not contain semicolons: ${match[1]}`);
        assert.ok(match[1].includes(' '), `controlPoints should contain spaces: ${match[1]}`);
      }
    }
  });

  it('interface comment documents space-separated format', () => {
    const src = readFileSync(resolve(SITE, 'data', 'multipoint-examples.ts'), 'utf8');
    assert.ok(src.includes('space'), 'Interface comment should mention space-separated format');
  });
});

describe('REQ-XW-261: Fix coordinate separator in worker and components', () => {
  it('multipoint-worker.ts documents space-separated format', () => {
    const src = readFileSync(resolve(SITE, 'workers', 'multipoint-worker.ts'), 'utf8');
    assert.ok(src.includes('space-separated'), 'Worker should document space-separated format');
    assert.ok(!src.includes('"lon,lat;lon,lat'), 'Worker should not have semicolon format in comments');
  });

  it('ControlMeasuresPanel.tsx joins with spaces not semicolons', () => {
    const src = readFileSync(resolve(SITE, 'components', 'ControlMeasuresPanel.tsx'), 'utf8');
    assert.ok(src.includes(".join(' ')"), 'Should join with space');
    assert.ok(!src.includes(".join(';')"), 'Should not join with semicolon');
  });

  it('ControlMeasuresPanel.tsx splits with spaces not semicolons', () => {
    const src = readFileSync(resolve(SITE, 'components', 'ControlMeasuresPanel.tsx'), 'utf8');
    assert.ok(src.includes(".split(' ')"), 'Should split on space');
    assert.ok(!src.includes(".split(';')"), 'Should not split on semicolon');
  });

  it('MultipointGallery.tsx splits with spaces not semicolons', () => {
    const src = readFileSync(resolve(SITE, 'pages', 'MultipointGallery.tsx'), 'utf8');
    assert.ok(src.includes(".split(' ')"), 'Should split on space');
    assert.ok(!src.includes(".split(';')"), 'Should not split on semicolon');
  });
});
