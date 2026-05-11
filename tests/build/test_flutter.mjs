// rtmx:req REQ-XW-133
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const FLUTTER_DIR = resolve(ROOT, 'platforms', 'flutter', 'generated');

describe('REQ-XW-133: Flutter/Dart token generation', () => {
  it('build:flutter exits 0', () => {
    execSync('npm run build:flutter', { cwd: ROOT, stdio: 'pipe' });
  });

  it('tak_tokens.dart exists', () => {
    assert.ok(existsSync(resolve(FLUTTER_DIR, 'tak_tokens.dart')));
  });

  it('contains TakColors class', () => {
    const dart = readFileSync(resolve(FLUTTER_DIR, 'tak_tokens.dart'), 'utf8');
    assert.match(dart, /class TakColors \{/);
  });

  it('contains library declaration', () => {
    const dart = readFileSync(resolve(FLUTTER_DIR, 'tak_tokens.dart'), 'utf8');
    assert.match(dart, /^library tak_tokens;/m);
  });

  it('imports dart:ui', () => {
    const dart = readFileSync(resolve(FLUTTER_DIR, 'tak_tokens.dart'), 'utf8');
    assert.match(dart, /import 'dart:ui';/);
  });

  it('contains Color constants with 0x hex values', () => {
    const dart = readFileSync(resolve(FLUTTER_DIR, 'tak_tokens.dart'), 'utf8');
    const consts = dart.match(/static const Color \w+ = Color\(0x[0-9A-Fa-f]+\);/g) || [];
    assert.ok(consts.length > 0, 'No Color constants found');
  });

  it('color hex values are 8 digits (AARRGGBB)', () => {
    const dart = readFileSync(resolve(FLUTTER_DIR, 'tak_tokens.dart'), 'utf8');
    const hexes = dart.match(/Color\(0x([0-9A-Fa-f]+)\)/g) || [];
    for (const hex of hexes) {
      const digits = hex.match(/0x([0-9A-Fa-f]+)/)[1];
      assert.equal(digits.length, 8, `Expected 8-digit hex: ${hex}`);
    }
  });
});
