import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PKG_DIR = resolve(ROOT, 'packages', 'data');

// rtmx:req REQ-XW-257
describe('REQ-XW-257: @iotactical/tak-data npm package', () => {
  it('packages/data/package.json exists', () => {
    assert.ok(existsSync(resolve(PKG_DIR, 'package.json')));
  });

  it('package.json has correct name and version', () => {
    const pkg = JSON.parse(readFileSync(resolve(PKG_DIR, 'package.json'), 'utf8'));
    assert.equal(pkg.name, '@iotactical/tak-data');
    assert.ok(pkg.version, 'Missing version');
  });

  it('package.json has exports for registry and indexes', () => {
    const pkg = JSON.parse(readFileSync(resolve(PKG_DIR, 'package.json'), 'utf8'));
    assert.ok(pkg.exports['.'], 'Missing root export');
    assert.ok(pkg.exports['./icons'], 'Missing icons export');
    assert.ok(pkg.exports['./icons/index'], 'Missing icons/index export');
    assert.ok(pkg.exports['./radial'], 'Missing radial export');
    assert.ok(pkg.exports['./radial/index'], 'Missing radial/index export');
  });

  it('package.json has files field including registry and schemas', () => {
    const pkg = JSON.parse(readFileSync(resolve(PKG_DIR, 'package.json'), 'utf8'));
    assert.ok(pkg.files.includes('registry/'), 'Missing registry/ in files');
    assert.ok(pkg.files.includes('schemas/'), 'Missing schemas/ in files');
  });

  it('package.json has prepublish script', () => {
    const pkg = JSON.parse(readFileSync(resolve(PKG_DIR, 'package.json'), 'utf8'));
    assert.ok(pkg.scripts?.prepublish, 'Missing prepublish script');
  });
});
