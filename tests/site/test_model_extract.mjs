// rtmx:req REQ-XW-070
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const modelsDir = join(root, 'site', 'public', 'models');

describe('REQ-XW-070: Vehicle model extraction', () => {
  it('site/public/models/ directory exists', () => {
    assert.ok(existsSync(modelsDir), 'site/public/models/ directory should exist');
  });

  it('has at least 3 category subdirectories (aircraft, automobiles, maritime)', () => {
    const categories = readdirSync(modelsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    assert.ok(categories.length >= 3, `expected >= 3 categories, got ${categories.length}`);
    for (const required of ['aircraft', 'automobiles', 'maritime']) {
      assert.ok(categories.includes(required), `missing category: ${required}`);
    }
  });

  it('has at least 50 model directories total', () => {
    const categories = readdirSync(modelsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
    let totalModels = 0;
    for (const cat of categories) {
      const catDir = join(modelsDir, cat);
      const models = readdirSync(catDir, { withFileTypes: true }).filter((d) =>
        d.isDirectory()
      );
      totalModels += models.length;
    }
    assert.ok(totalModels >= 50, `expected >= 50 model directories, got ${totalModels}`);
  });

  it('sample model directory (aircraft/f-22) contains a .DAE file', () => {
    const sampleDir = join(modelsDir, 'aircraft', 'f-22');
    assert.ok(existsSync(sampleDir), 'aircraft/f-22 directory should exist');
    const files = readdirSync(sampleDir);
    const daeFiles = files.filter((f) => f.toLowerCase().endsWith('.dae'));
    assert.ok(daeFiles.length > 0, 'aircraft/f-22 should contain at least one .DAE file');
  });
});
