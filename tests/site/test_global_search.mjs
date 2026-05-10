// rtmx:req REQ-XW-110
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');
const SITE_SRC = join(ROOT, 'site', 'src');

describe('REQ-XW-110: Persistent site-wide autocomplete search bar', () => {
  it('GlobalSearch.tsx component exists', () => {
    const filePath = join(SITE_SRC, 'components', 'GlobalSearch.tsx');
    assert.ok(existsSync(filePath), 'GlobalSearch.tsx should exist in site/src/components/');

    const content = readFileSync(filePath, 'utf8');
    assert.ok(content.includes('GlobalSearch'), 'Should export GlobalSearch component');
    assert.ok(content.includes('searchIndex'), 'Should import searchIndex');
    assert.ok(content.includes('useDebounce'), 'Should implement debounced input');
    assert.ok(content.includes('ArrowDown'), 'Should support keyboard navigation');
    assert.ok(content.includes('Escape'), 'Should handle ESC to close dropdown');
    assert.ok(content.includes('useNavigate'), 'Should use react-router navigation');
  });

  it('GlobalSearch.module.css exists with dark theme styles', () => {
    const filePath = join(SITE_SRC, 'components', 'GlobalSearch.module.css');
    assert.ok(existsSync(filePath), 'GlobalSearch.module.css should exist');

    const content = readFileSync(filePath, 'utf8');
    assert.ok(content.includes('.searchInput'), 'Should define searchInput class');
    assert.ok(content.includes('.dropdown'), 'Should define dropdown class');
    assert.ok(content.includes('.badge'), 'Should define category badge class');
    assert.ok(content.includes('.highlight'), 'Should define text highlight class');
  });

  it('searchIndex.ts exists and exports search data', () => {
    const filePath = join(SITE_SRC, 'data', 'searchIndex.ts');
    assert.ok(existsSync(filePath), 'searchIndex.ts should exist in site/src/data/');

    const content = readFileSync(filePath, 'utf8');
    assert.ok(content.includes('export const searchIndex'), 'Should export searchIndex array');
    assert.ok(content.includes('SearchEntry'), 'Should define SearchEntry type');
    assert.ok(content.includes('SearchCategory'), 'Should define SearchCategory type');

    // Verify all five categories are represented
    assert.ok(content.includes("'Tokens'"), 'Should include Tokens category');
    assert.ok(content.includes("'Components'"), 'Should include Components category');
    assert.ok(content.includes("'Icons'"), 'Should include Icons category');
    assert.ok(content.includes("'Palettes'"), 'Should include Palettes category');
    assert.ok(content.includes("'Interfaces'"), 'Should include Interfaces category');

    // Verify data sources
    assert.ok(content.includes('core.json'), 'Should import core tokens');
    assert.ok(content.includes('semantic.json'), 'Should import semantic tokens');
    assert.ok(content.includes('atak.json'), 'Should import atak tokens');
    assert.ok(content.includes('atak-drawable-catalog.json'), 'Should import drawable catalog');
    assert.ok(content.includes('tak-interfaces-external.json'), 'Should import external interfaces');
    assert.ok(content.includes('tak-interfaces-internal.json'), 'Should import internal interfaces');
  });

  it('App.tsx includes GlobalSearch in topBar', () => {
    const filePath = join(SITE_SRC, 'App.tsx');
    assert.ok(existsSync(filePath), 'App.tsx should exist');

    const content = readFileSync(filePath, 'utf8');
    assert.ok(
      content.includes("from './components/GlobalSearch'"),
      'App.tsx should import GlobalSearch',
    );
    assert.ok(
      content.includes('<GlobalSearch'),
      'App.tsx should render GlobalSearch component',
    );
    assert.ok(
      content.includes('topBar'),
      'GlobalSearch should be in the topBar',
    );
  });

  it('searchIndex includes 28 component definitions', () => {
    const filePath = join(SITE_SRC, 'data', 'searchIndex.ts');
    const content = readFileSync(filePath, 'utf8');

    const expectedComponents = [
      'NavBar', 'ToolBar', 'DockPane', 'Button', 'EditText',
      'Checkbox', 'Toggle', 'Spinner', 'RadioGroup', 'ListView',
      'TabLayout', 'ProgressBar', 'CoordinateDisplay', 'RangeBearing',
      'MarkerDetail', 'UserList', 'Modal', 'DialogPanel', 'RadialMenu',
      'ChatPanel', 'RoutePlanner', 'NineLineForm', 'ScaleBar',
      'CompassHeading', 'ElevationProfile', 'ConnectionStatus',
      'GPSStatus', 'ModelViewer',
    ];

    for (const name of expectedComponents) {
      assert.ok(
        content.includes(`name: '${name}'`),
        `searchIndex should include component: ${name}`,
      );
    }
  });

  it('searchIndex includes 14 palette entries', () => {
    const filePath = join(SITE_SRC, 'data', 'searchIndex.ts');
    const content = readFileSync(filePath, 'utf8');

    const expectedPalettes = [
      'Skittles', 'Self Marker', 'Markers', 'Spot Map', 'Vehicle Models',
      'Google', 'OSM', 'Generic Icons', 'FEMA Icons', 'Default',
      'FalconView', 'Incident Mgmt', 'Public Safety Air', 'Responder',
    ];

    for (const name of expectedPalettes) {
      assert.ok(
        content.includes(name),
        `searchIndex should include palette: ${name}`,
      );
    }
  });

  it('search entries have required fields: name, category, path, description', () => {
    const filePath = join(SITE_SRC, 'data', 'searchIndex.ts');
    const content = readFileSync(filePath, 'utf8');

    assert.ok(content.includes('name:'), 'Entries should have name field');
    assert.ok(content.includes('category:'), 'Entries should have category field');
    assert.ok(content.includes('path:'), 'Entries should have path field');
    assert.ok(content.includes('description:'), 'Entries should have description field');
  });
});
