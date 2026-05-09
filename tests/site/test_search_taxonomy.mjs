// rtmx:req REQ-XW-118
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');
const SITE_SRC = join(ROOT, 'site', 'src');

describe('REQ-XW-118: Full taxonomy search index', () => {
  it('searchIndex.ts exists and exports SearchEntry with breadcrumb field', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(content.includes('breadcrumb'), 'SearchEntry should have breadcrumb field');
    assert.ok(
      content.includes('export interface SearchEntry'),
      'Should export SearchEntry interface',
    );

    // Check breadcrumb is in the interface definition
    const interfaceMatch = content.match(
      /export interface SearchEntry\s*\{([\s\S]*?)\}/,
    );
    assert.ok(interfaceMatch, 'Should define SearchEntry interface');
    assert.ok(
      interfaceMatch[1].includes('breadcrumb: string'),
      'SearchEntry should have breadcrumb: string field',
    );
  });

  it('searchIndex covers all major data sources', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    // Token sources
    assert.ok(content.includes('core.json'), 'Should import core tokens');
    assert.ok(content.includes('semantic.json'), 'Should import semantic tokens');
    assert.ok(content.includes('atak.json'), 'Should import ATAK tokens');

    // Icons - should index all, not just first 200
    assert.ok(content.includes('atak-drawable-catalog.json'), 'Should import drawable catalog');
    assert.ok(
      !content.includes('.slice(0, 200)'),
      'Should NOT limit icons to first 200',
    );

    // 2525 entities
    assert.ok(content.includes('b-entities.json'), 'Should import 2525 entities');

    // Intents
    assert.ok(content.includes('atak-intents.json'), 'Should import ATAK intents');

    // External/internal interfaces
    assert.ok(content.includes('tak-interfaces-external.json'), 'Should import external interfaces');
    assert.ok(content.includes('tak-interfaces-internal.json'), 'Should import internal interfaces');
  });

  it('tokens have hierarchical breadcrumbs like Tokens > Core > color > blue', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(
      content.includes('Tokens > ${source}'),
      'Token breadcrumbs should include source tier (Core, Semantic, ATAK)',
    );
  });

  it('components have breadcrumbs with layout category', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(
      content.includes('Components > ${c.layoutCategory} > ${c.name}'),
      'Component breadcrumbs should include layout category',
    );

    // Check component categories are defined
    assert.ok(content.includes("layoutCategory: 'Layout'"), 'Should have Layout category');
    assert.ok(content.includes("layoutCategory: 'Inputs'"), 'Should have Inputs category');
    assert.ok(content.includes("layoutCategory: 'Data Display'"), 'Should have Data Display category');
    assert.ok(content.includes("layoutCategory: 'Tactical'"), 'Should have Tactical category');
  });

  it('icons have breadcrumbs like Icons > {category} > {name}', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(
      content.includes('Icons > ${entry.category'),
      'Icon breadcrumbs should include category from catalog',
    );
  });

  it('2525 entities have breadcrumbs with symbol set name', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(
      content.includes('2525 > ${ssName} > ${e.label}'),
      '2525 breadcrumbs should include symbol set name',
    );
    assert.ok(
      content.includes("'01': 'Air'"),
      'Should map symbol set 01 to Air',
    );
    assert.ok(
      content.includes("'10': 'Land Unit'"),
      'Should map symbol set 10 to Land Unit',
    );
  });

  it('intents have breadcrumbs with namespace', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(
      content.includes('Interfaces > Intents > ${group.namespace}'),
      'Intent breadcrumbs should include namespace',
    );
  });

  it('interfaces have External/Internal breadcrumbs', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(
      content.includes('Interfaces > External > ${iface.name}'),
      'External interfaces should have External breadcrumb',
    );
    assert.ok(
      content.includes('Interfaces > Internal > ${iface.name}'),
      'Internal interfaces should have Internal breadcrumb',
    );
  });

  it('BDD specs are included in the index', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(content.includes("'Specs'"), 'Should include Specs category');
    assert.ok(
      content.includes('Specs > ${s.name}'),
      'Spec breadcrumbs should follow Specs > {name} pattern',
    );
    assert.ok(content.includes('CoT Lifecycle'), 'Should include CoT Lifecycle spec');
    assert.ok(content.includes('Team Management'), 'Should include Team Management spec');
  });

  it('palette entries include team colors and roles', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(content.includes("'White'"), 'Should include White team color');
    assert.ok(content.includes("'Cyan'"), 'Should include Cyan team color');
    assert.ok(content.includes("'Team Lead'"), 'Should include Team Lead role');
    assert.ok(content.includes("'Medic'"), 'Should include Medic role');
    assert.ok(
      content.includes('Palettes > Skittles >'),
      'Palette breadcrumbs should reference Skittles',
    );
  });

  it('GlobalSearch shows breadcrumbs in results', () => {
    const content = readFileSync(join(SITE_SRC, 'components', 'GlobalSearch.tsx'), 'utf8');

    assert.ok(
      content.includes('entry.breadcrumb'),
      'GlobalSearch should display entry.breadcrumb in results',
    );
    assert.ok(
      content.includes('resultBreadcrumb'),
      'GlobalSearch should use resultBreadcrumb CSS class',
    );
  });

  it('SearchCategory type includes 2525 and Specs', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    assert.ok(
      content.includes("| '2525'"),
      'SearchCategory should include 2525',
    );
    assert.ok(
      content.includes("| 'Specs'"),
      'SearchCategory should include Specs',
    );
  });

  it('total index should target 3000+ entries from all sources combined', () => {
    const content = readFileSync(join(SITE_SRC, 'data', 'searchIndex.ts'), 'utf8');

    // Count sources: ~310 tokens + 28 components + 1317 icons + 37 palettes + 1915 entities + 440 intents + 20 interfaces + 6 specs = ~4073
    // Verify all sources are spread into searchIndex
    assert.ok(content.includes('buildTokenEntries()'), 'Should include token entries');
    assert.ok(content.includes('buildComponentEntries()'), 'Should include component entries');
    assert.ok(content.includes('buildIconEntries()'), 'Should include icon entries');
    assert.ok(content.includes('buildPaletteEntries()'), 'Should include palette entries');
    assert.ok(content.includes('build2525Entries()'), 'Should include 2525 entries');
    assert.ok(content.includes('buildIntentEntries()'), 'Should include intent entries');
    assert.ok(content.includes('buildInterfaceEntries()'), 'Should include interface entries');
    assert.ok(content.includes('buildSpecEntries()'), 'Should include spec entries');
  });
});
