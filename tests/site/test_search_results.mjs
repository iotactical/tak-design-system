// rtmx:req REQ-XW-112
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');
const SITE_SRC = join(ROOT, 'site', 'src');

describe('REQ-XW-112: Search results page', () => {
  it('SearchResults.tsx page exists', () => {
    const filePath = join(SITE_SRC, 'pages', 'SearchResults.tsx');
    assert.ok(existsSync(filePath), 'site/src/pages/SearchResults.tsx should exist');
  });

  it('SearchResults imports search index and Fuse.js', () => {
    const filePath = join(SITE_SRC, 'pages', 'SearchResults.tsx');
    const content = readFileSync(filePath, 'utf8');
    assert.ok(content.includes('searchIndex'), 'Should import searchIndex');
    assert.ok(content.includes('Fuse') || content.includes('fuse'), 'Should import Fuse.js');
  });

  it('SearchResults reads query from URL params', () => {
    const filePath = join(SITE_SRC, 'pages', 'SearchResults.tsx');
    const content = readFileSync(filePath, 'utf8');
    assert.ok(content.includes('useSearchParams'), 'Should use useSearchParams');
    assert.ok(content.includes("'q'") || content.includes('"q"'), 'Should read q param');
  });

  it('SearchResults groups results by category', () => {
    const filePath = join(SITE_SRC, 'pages', 'SearchResults.tsx');
    const content = readFileSync(filePath, 'utf8');
    assert.ok(content.includes('category'), 'Should group by category');
    assert.ok(content.includes('breadcrumb'), 'Should show breadcrumb');
    assert.ok(content.includes('description'), 'Should show description');
  });

  it('SearchResults shows all matches (not capped at 8)', () => {
    const filePath = join(SITE_SRC, 'pages', 'SearchResults.tsx');
    const content = readFileSync(filePath, 'utf8');
    // Should NOT have the slice(0, 8) limit that GlobalSearch uses
    assert.ok(!content.includes('slice(0, 8)'), 'Should not cap results at 8');
  });

  it('App.tsx has /search route', () => {
    const filePath = join(SITE_SRC, 'App.tsx');
    const content = readFileSync(filePath, 'utf8');
    assert.ok(content.includes('SearchResults'), 'App.tsx should import SearchResults');
    assert.ok(content.includes('/search'), 'App.tsx should have /search route');
  });
});
