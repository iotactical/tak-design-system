import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const COMPOSE_DIR = resolve(ROOT, 'platforms', 'atak', 'compose', 'generated');

// rtmx:req REQ-BLD-003
describe('REQ-BLD-003: Jetpack Compose Kotlin generation', () => {
  before(() => {
    execSync('npm run build:compose', { cwd: ROOT, stdio: 'pipe' });
  });

  it('TakColors.kt exists', () => {
    assert.ok(existsSync(resolve(COMPOSE_DIR, 'TakColors.kt')));
  });

  it('has correct package declaration', () => {
    const kt = readFileSync(resolve(COMPOSE_DIR, 'TakColors.kt'), 'utf8');
    assert.match(kt, /^package co\.iotactical\.tak\.designsystem/m);
  });

  it('imports androidx.compose.ui.graphics.Color', () => {
    const kt = readFileSync(resolve(COMPOSE_DIR, 'TakColors.kt'), 'utf8');
    assert.match(kt, /import androidx\.compose\.ui\.graphics\.Color/);
  });

  it('contains color val properties', () => {
    const kt = readFileSync(resolve(COMPOSE_DIR, 'TakColors.kt'), 'utf8');
    const vals = kt.match(/val \w+ = Color\(0x[0-9A-Fa-f]+\)/g) || [];
    assert.ok(vals.length > 0, 'No Color val properties found');
  });

  it('color hex values are 8 digits (AARRGGBB)', () => {
    const kt = readFileSync(resolve(COMPOSE_DIR, 'TakColors.kt'), 'utf8');
    const hexes = kt.match(/Color\(0x([0-9A-Fa-f]+)\)/g) || [];
    for (const hex of hexes) {
      const digits = hex.match(/0x([0-9A-Fa-f]+)/)[1];
      assert.equal(digits.length, 8, `Expected 8-digit hex: ${hex}`);
    }
  });
});
