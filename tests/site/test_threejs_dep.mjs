// rtmx:req REQ-XW-071
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const siteDir = join(root, 'site');

describe('REQ-XW-071: three.js site dependency', () => {
  it('site/package.json contains "three" in dependencies', () => {
    const pkgPath = join(siteDir, 'package.json');
    assert.ok(existsSync(pkgPath), 'site/package.json should exist');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    assert.ok(
      pkg.dependencies && pkg.dependencies.three,
      'site/package.json should have "three" in dependencies'
    );
  });

  it('node_modules/three exists', () => {
    // In a workspace setup, npm may hoist to the root node_modules
    const siteThree = join(siteDir, 'node_modules', 'three');
    const rootThree = join(root, 'node_modules', 'three');
    assert.ok(
      existsSync(siteThree) || existsSync(rootThree),
      'node_modules/three should exist (in site or hoisted to root)'
    );
  });
});
