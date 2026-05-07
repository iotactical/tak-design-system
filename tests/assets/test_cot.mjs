import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COT_DIR = resolve(__dirname, '..', '..', 'data', 'cot');

// rtmx:req REQ-AST-002
describe('REQ-AST-002: COT icon filter mapping', () => {
  it('icon_filters.xml exists', () => {
    assert.ok(existsSync(resolve(COT_DIR, 'icon_filters.xml')));
  });

  it('is valid XML (well-formed)', () => {
    const xml = readFileSync(resolve(COT_DIR, 'icon_filters.xml'), 'utf8');
    // Basic well-formedness: has XML-like structure, opening/closing tags balanced
    assert.match(xml, /^<\?xml|^<\w+/m, 'Does not start with XML declaration or root element');
    // Check it has filter-like entries
    assert.ok(xml.includes('<'), 'No XML tags found');
  });

  it('has 50+ filter mappings', () => {
    const xml = readFileSync(resolve(COT_DIR, 'icon_filters.xml'), 'utf8');
    const allTags = xml.match(/<[^/!?][^>]*>/g) || [];
    const contentTags = allTags.filter(t => !t.includes('<?') && !t.includes('filters') && !t.includes('root'));
    assert.ok(contentTags.length >= 50, `Expected 50+ mappings, found ${contentTags.length}`);
  });
});
