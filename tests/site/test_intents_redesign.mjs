// rtmx:req REQ-XW-171
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const INTERFACES = resolve(ROOT, 'site', 'src', 'pages', 'Interfaces.tsx');
const source = readFileSync(INTERFACES, 'utf8');
const css = readFileSync(resolve(ROOT, 'site', 'src', 'pages', 'Interfaces.module.css'), 'utf8');

describe('REQ-XW-171: Intents unified table', () => {
  it('Interfaces.tsx uses a table layout for intents (not cards)', () => {
    assert.ok(
      source.includes('<table'),
      'Intents tab must use a <table> element'
    );
    assert.ok(
      source.includes('<thead>'),
      'Intents table must have a <thead>'
    );
    assert.ok(
      source.includes('<tbody>'),
      'Intents table must have a <tbody>'
    );
  });

  it('table header is sticky', () => {
    // Styling moved to the CSS module with REQ-SITE-031 so the mobile
    // breakpoint can release sticky positioning inside the scroll wrapper.
    assert.ok(
      source.includes('className={styles.intentTableHead}'),
      'Table header row must use the intentTableHead class'
    );
    assert.match(
      css,
      /\.intentTableHead \{[^}]*position: sticky;[^}]*top: 0;[^}]*z-index: 1;/s,
      'Header must be sticky, pinned to top, and layered above rows'
    );
  });

  it('has namespace grouping with section rows', () => {
    assert.ok(
      source.includes('group.namespace'),
      'Intents must group by namespace'
    );
    assert.ok(
      source.includes('colSpan={3}'),
      'Namespace rows must span all columns'
    );
    assert.ok(
      source.includes('filteredIntentGroups.map'),
      'Intents must iterate over filtered intent groups'
    );
  });

  it('has correct column structure (Action, Type, Class)', () => {
    assert.ok(
      source.includes('>Action</th>'),
      'Table must have Action column header'
    );
    assert.ok(
      source.includes('>Type</th>'),
      'Table must have Type column header'
    );
    assert.ok(
      source.includes('>Class</th>'),
      'Table must have Class column header'
    );
  });

  it('renders intent action, type, and class data in rows', () => {
    assert.ok(
      source.includes('intent.action'),
      'Table rows must display intent action'
    );
    assert.ok(
      source.includes('intent.type'),
      'Table rows must display intent type'
    );
    assert.ok(
      source.includes('intent.class'),
      'Table rows must display intent class'
    );
  });

  it('supports search filtering across intents', () => {
    assert.ok(
      source.includes('filterIntentGroups'),
      'Interfaces.tsx must filter intent groups by search query'
    );
    assert.ok(
      source.includes('filteredIntentCount'),
      'Interfaces.tsx must track filtered intent count'
    );
  });
});
