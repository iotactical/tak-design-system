import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MILSTD_DIR = resolve(__dirname, '..', '..', 'data', 'mil-std-2525');

// rtmx:req REQ-AST-003
describe('REQ-AST-003: MIL-STD-2525 symbol mapping', () => {
  const csvPath = resolve(MILSTD_DIR, 'ms2525cd-mapping.csv');

  it('ms2525cd-mapping.csv exists', () => {
    assert.ok(existsSync(csvPath));
  });

  it('is valid CSV with header row', () => {
    const csv = readFileSync(csvPath, 'utf8');
    const lines = csv.trim().split('\n');
    assert.ok(lines.length > 1, 'CSV should have header + data rows');
    const header = lines[0];
    assert.ok(header.includes(','), 'Header should be comma-separated');
  });

  it('has multiple data rows', () => {
    const csv = readFileSync(csvPath, 'utf8');
    const lines = csv.trim().split('\n');
    assert.ok(lines.length > 10, `Expected >10 rows, found ${lines.length}`);
  });

  it('all rows have consistent column count', () => {
    const csv = readFileSync(csvPath, 'utf8');
    const lines = csv.trim().split('\n');
    const headerCols = lines[0].split(',').length;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const cols = lines[i].split(',').length;
      assert.equal(cols, headerCols, `Row ${i + 1} has ${cols} columns, expected ${headerCols}`);
    }
  });
});
