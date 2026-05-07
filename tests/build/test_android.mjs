import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const ATAK_RES = resolve(ROOT, 'platforms', 'atak', 'res', 'values');

// rtmx:req REQ-BLD-002
describe('REQ-BLD-002: Android XML resource generation', () => {
  // Build is handled by pretest script

  it('tak_colors.xml exists', () => {
    assert.ok(existsSync(resolve(ATAK_RES, 'tak_colors.xml')));
  });

  it('tak_dimens.xml exists', () => {
    assert.ok(existsSync(resolve(ATAK_RES, 'tak_dimens.xml')));
  });

  it('colors use Android hex format', () => {
    const xml = readFileSync(resolve(ATAK_RES, 'tak_colors.xml'), 'utf8');
    const colors = xml.match(/<color name="[^"]+">([^<]+)<\/color>/g) || [];
    assert.ok(colors.length > 0, 'No color entries found');
    for (const entry of colors) {
      const value = entry.match(/>([^<]+)</)[1];
      assert.match(value, /^#[0-9A-Fa-f]{6,8}$/, `Invalid color format: ${value}`);
    }
  });

  it('dimensions use dp units', () => {
    const xml = readFileSync(resolve(ATAK_RES, 'tak_dimens.xml'), 'utf8');
    const dimens = xml.match(/<dimen name="[^"]+">([^<]+)<\/dimen>/g) || [];
    assert.ok(dimens.length > 0, 'No dimen entries found');
    for (const entry of dimens) {
      const value = entry.match(/>([^<]+)</)[1];
      assert.match(value, /dp$/, `Expected dp unit: ${value}`);
    }
  });

  it('resource names use tak_ prefix', () => {
    const xml = readFileSync(resolve(ATAK_RES, 'tak_colors.xml'), 'utf8');
    const names = xml.match(/name="([^"]+)"/g) || [];
    for (const name of names) {
      const n = name.match(/"([^"]+)"/)[1];
      assert.ok(n.startsWith('tak_'), `Missing tak_ prefix: ${n}`);
    }
  });
});
