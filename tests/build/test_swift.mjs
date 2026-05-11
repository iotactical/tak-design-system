// rtmx:req REQ-XW-134
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SWIFT_DIR = resolve(ROOT, 'platforms', 'swift', 'generated');

describe('REQ-XW-134: Swift/SwiftUI token generation', () => {
  it('build:swift exits 0', () => {
    execSync('npm run build:swift', { cwd: ROOT, stdio: 'pipe' });
  });

  it('TakTokens.swift exists', () => {
    assert.ok(existsSync(resolve(SWIFT_DIR, 'TakTokens.swift')));
  });

  it('contains TakColors enum', () => {
    const swift = readFileSync(resolve(SWIFT_DIR, 'TakTokens.swift'), 'utf8');
    assert.match(swift, /public enum TakColors \{/);
  });

  it('imports SwiftUI', () => {
    const swift = readFileSync(resolve(SWIFT_DIR, 'TakTokens.swift'), 'utf8');
    assert.match(swift, /^import SwiftUI$/m);
  });

  it('contains Color properties with RGB values', () => {
    const swift = readFileSync(resolve(SWIFT_DIR, 'TakTokens.swift'), 'utf8');
    const props = swift.match(/public static let \w+ = Color\(red: [\d.]+, green: [\d.]+, blue: [\d.]+\)/g) || [];
    assert.ok(props.length > 0, 'No Color properties found');
  });

  it('RGB values are between 0 and 1', () => {
    const swift = readFileSync(resolve(SWIFT_DIR, 'TakTokens.swift'), 'utf8');
    const rgbs = swift.match(/Color\(red: ([\d.]+), green: ([\d.]+), blue: ([\d.]+)\)/g) || [];
    for (const rgb of rgbs) {
      const [, r, g, b] = rgb.match(/red: ([\d.]+), green: ([\d.]+), blue: ([\d.]+)/);
      assert.ok(parseFloat(r) >= 0 && parseFloat(r) <= 1, `Red out of range: ${r}`);
      assert.ok(parseFloat(g) >= 0 && parseFloat(g) <= 1, `Green out of range: ${g}`);
      assert.ok(parseFloat(b) >= 0 && parseFloat(b) <= 1, `Blue out of range: ${b}`);
    }
  });
});
