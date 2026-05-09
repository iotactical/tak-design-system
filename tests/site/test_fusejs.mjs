// rtmx:req REQ-XW-120
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');

describe('REQ-XW-120: Fuse.js fuzzy matching in GlobalSearch', () => {
  it('site/package.json has fuse.js dependency', () => {
    const pkgPath = join(ROOT, 'site', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    assert.ok(
      pkg.dependencies && pkg.dependencies['fuse.js'],
      'fuse.js should be listed in site/package.json dependencies',
    );
  });

  it('GlobalSearch.tsx imports Fuse from fuse.js', () => {
    const filePath = join(ROOT, 'site', 'src', 'components', 'GlobalSearch.tsx');
    const content = readFileSync(filePath, 'utf8');
    assert.ok(
      content.includes("import Fuse from 'fuse.js'"),
      'GlobalSearch.tsx should import Fuse from fuse.js',
    );
  });

  it('GlobalSearch.tsx creates Fuse instance with weighted keys', () => {
    const filePath = join(ROOT, 'site', 'src', 'components', 'GlobalSearch.tsx');
    const content = readFileSync(filePath, 'utf8');

    assert.ok(
      content.includes('new Fuse('),
      'GlobalSearch.tsx should create a new Fuse instance',
    );
    assert.ok(
      content.includes("name: 'name', weight: 3"),
      'Fuse config should weight name field at 3',
    );
    assert.ok(
      content.includes("name: 'breadcrumb', weight: 1"),
      'Fuse config should weight breadcrumb field at 1',
    );
    assert.ok(
      content.includes("name: 'description', weight: 0.5"),
      'Fuse config should weight description field at 0.5',
    );
    assert.ok(
      content.includes('threshold: 0.4'),
      'Fuse config should set threshold to 0.4',
    );
    assert.ok(
      content.includes('includeScore: true'),
      'Fuse config should include score in results',
    );
    assert.ok(
      content.includes('minMatchCharLength: 2'),
      'Fuse config should require minimum 2 character matches',
    );
  });

  it('GlobalSearch.tsx uses fuse.search() instead of filter()', () => {
    const filePath = join(ROOT, 'site', 'src', 'components', 'GlobalSearch.tsx');
    const content = readFileSync(filePath, 'utf8');

    assert.ok(
      content.includes('fuse.search('),
      'GlobalSearch.tsx should call fuse.search()',
    );
    assert.ok(
      !content.includes('searchIndex.filter('),
      'GlobalSearch.tsx should no longer use searchIndex.filter()',
    );
  });
});
