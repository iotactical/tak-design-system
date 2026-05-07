import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = resolve(__dirname, '..', '..', 'icons', 'roles');

// rtmx:req REQ-AST-001
describe('REQ-AST-001: Role-based tactical icon set', () => {
  const roles = ['team', 'teamlead', 'hq', 'forwardobserver', 'k9', 'medic', 'rto', 'sniper'];
  const variants = ['', '_human', '_nogps'];

  it('icons/roles directory exists', () => {
    assert.ok(existsSync(ICONS_DIR));
  });

  for (const role of roles) {
    for (const variant of variants) {
      const filename = `${role}${variant}.png`;
      it(`${filename} exists`, () => {
        assert.ok(existsSync(resolve(ICONS_DIR, filename)), `Missing: ${filename}`);
      });
    }
  }

  it('has at least 24 PNG files', () => {
    const files = readdirSync(ICONS_DIR).filter(f => f.endsWith('.png'));
    assert.ok(files.length >= 24, `Expected >= 24 PNGs, found ${files.length}`);
  });
});
