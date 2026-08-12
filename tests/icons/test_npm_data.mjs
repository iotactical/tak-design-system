import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-257
describe('REQ-XW-257: icon registry data distributed via @iotactical/tak-react', () => {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'packages', 'react', 'package.json'), 'utf8'));

  it('packages/data/ no longer exists', () => {
    assert.ok(
      !existsSync(resolve(ROOT, 'packages', 'data', 'package.json')),
      'packages/data was consolidated into packages/react (REQ-PKG-005) and must not be publishable'
    );
  });

  it('registry and index data are reachable via subpath exports', () => {
    for (const subpath of ['./data/icons', './data/icons/index', './data/radial', './data/radial/index']) {
      assert.ok(pkg.exports[subpath], `Missing ${subpath} export`);
    }
  });

  it('exported data files exist in the source tree', () => {
    const sources = [
      'data/tak-icon-registry.json',
      'data/icons.index.json',
      'data/tak-radial-action-icons.json',
      'data/radial.index.json'
    ];
    for (const source of sources) {
      assert.ok(existsSync(resolve(ROOT, source)), `Missing source data file ${source}`);
    }
  });

  it('copy-data stages every exported data and schema file', () => {
    const copyData = pkg.scripts['copy-data'];
    assert.ok(copyData, 'copy-data script must exist');
    for (const source of ['tak-icon-registry.json', 'icons.index.json', 'tak-radial-action-icons.json', 'radial.index.json']) {
      assert.ok(copyData.includes(source), `copy-data must stage ${source}`);
    }
  });
});
