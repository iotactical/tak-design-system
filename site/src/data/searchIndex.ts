// rtmx:req REQ-XW-110
/**
 * Build-time search index for GlobalSearch autocomplete.
 * Produces a flat array of searchable entries from tokens, components,
 * icons, palettes, and interfaces data.
 */

import coreTokens from '@tokens/core.json';
import semanticTokens from '@tokens/semantic.json';
import atakTokens from '@tokens/atak.json';
import drawableCatalog from '../../../data/atak-drawable-catalog.json';
import interfacesExternal from '../../../data/tak-interfaces-external.json';
import interfacesInternal from '../../../data/tak-interfaces-internal.json';

// ----- Types -----

export type SearchCategory = 'Tokens' | 'Components' | 'Icons' | 'Palettes' | 'Interfaces';

export interface SearchEntry {
  name: string;
  category: SearchCategory;
  path: string;
  description: string;
}

// ----- Token extraction -----

/** Recursively extract token paths from a W3C token JSON structure */
function extractTokenPaths(obj: Record<string, unknown>, prefix: string): string[] {
  const paths: string[] = [];
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue;
    const val = obj[key] as Record<string, unknown>;
    if (val && typeof val === 'object' && '$value' in val) {
      paths.push(prefix ? `${prefix}.${key}` : key);
    } else if (val && typeof val === 'object') {
      paths.push(...extractTokenPaths(val, prefix ? `${prefix}.${key}` : key));
    }
  }
  return paths;
}

function buildTokenEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const sources: [string, Record<string, unknown>][] = [
    ['core', coreTokens as unknown as Record<string, unknown>],
    ['semantic', semanticTokens as unknown as Record<string, unknown>],
    ['atak', atakTokens as unknown as Record<string, unknown>],
  ];
  for (const [source, data] of sources) {
    const paths = extractTokenPaths(data, '');
    for (const tokenPath of paths) {
      entries.push({
        name: tokenPath,
        category: 'Tokens',
        path: '/colors',
        description: `${source} token`,
      });
    }
  }
  return entries;
}

// ----- Component entries (hardcoded 28 components) -----

const COMPONENTS: { name: string; description: string }[] = [
  { name: 'NavBar', description: 'Top navigation bar with menu, title, search, and action slots' },
  { name: 'ToolBar', description: 'Horizontal toolbar with leading, title, and trailing slots' },
  { name: 'DockPane', description: 'Collapsible side/bottom panel docked to viewport edge' },
  { name: 'Button', description: 'Action button with primary, secondary, and danger variants' },
  { name: 'EditText', description: 'Text input field with label, error, and icon slots' },
  { name: 'Checkbox', description: 'Binary toggle checkbox with label support' },
  { name: 'Toggle', description: 'Switch-style toggle for on/off states' },
  { name: 'Spinner', description: 'Dropdown selector for picking from a list of options' },
  { name: 'RadioGroup', description: 'Mutually exclusive radio button options group' },
  { name: 'ListView', description: 'Scrollable list with single or multi-select support' },
  { name: 'TabLayout', description: 'Tabbed interface for switching content panels' },
  { name: 'ProgressBar', description: 'Horizontal progress indicator with default and small variants' },
  { name: 'CoordinateDisplay', description: 'Geographic coordinate display in MGRS, DD, DMS, or UTM' },
  { name: 'RangeBearing', description: 'Distance and bearing between two geographic points' },
  { name: 'MarkerDetail', description: 'Detail card for map marker with callsign and coordinates' },
  { name: 'UserList', description: 'Team member list with online status and roles' },
  { name: 'Modal', description: 'Centered overlay dialog with backdrop' },
  { name: 'DialogPanel', description: 'Structured dialog with title, content, and action buttons' },
  { name: 'RadialMenu', description: 'Circular context menu with configurable sectors' },
  { name: 'ChatPanel', description: 'Real-time messaging panel with channel switching' },
  { name: 'RoutePlanner', description: 'Waypoint-based route planning with distance estimates' },
  { name: 'NineLineForm', description: 'Standardized 9-line CAS briefing form' },
  { name: 'ScaleBar', description: 'Map scale indicator in metric or imperial units' },
  { name: 'CompassHeading', description: 'Compass rose widget displaying heading in degrees' },
  { name: 'ElevationProfile', description: 'Elevation chart showing terrain profile along a path' },
  { name: 'ConnectionStatus', description: 'Network connection state indicator with colored dot' },
  { name: 'GPSStatus', description: 'GPS fix quality indicator with satellites and accuracy' },
  { name: 'ModelViewer', description: '3D model viewer for vehicle and equipment models' },
];

function buildComponentEntries(): SearchEntry[] {
  return COMPONENTS.map((c) => ({
    name: c.name,
    category: 'Components' as SearchCategory,
    path: '/components',
    description: c.description,
  }));
}

// ----- Icon entries from drawable catalog -----

function buildIconEntries(): SearchEntry[] {
  const catalog = drawableCatalog as { name: string; category?: string }[];
  // Limit to first 200 to keep index lightweight
  return catalog.slice(0, 200).map((entry) => ({
    name: entry.name,
    category: 'Icons' as SearchCategory,
    path: '/icons',
    description: entry.category ? `${entry.category} drawable` : 'ATAK drawable',
  }));
}

// ----- Palette entries (14 palette names) -----

const PALETTE_NAMES: { id: string; label: string }[] = [
  { id: 'skittles', label: 'Skittles' },
  { id: 'self-marker', label: 'Self Marker' },
  { id: 'markers', label: 'Markers' },
  { id: 'spotmap', label: 'Spot Map' },
  { id: 'vehicle-models', label: 'Vehicle Models' },
  { id: 'google', label: 'Google' },
  { id: 'osm', label: 'OSM' },
  { id: 'generic', label: 'Generic Icons' },
  { id: 'fema', label: 'FEMA Icons' },
  { id: 'default', label: 'Default' },
  { id: 'falconview', label: 'FalconView' },
  { id: 'incident', label: 'Incident Mgmt' },
  { id: 'air', label: 'Public Safety Air' },
  { id: 'responder', label: 'Responder' },
];

function buildPaletteEntries(): SearchEntry[] {
  return PALETTE_NAMES.map((p) => ({
    name: p.label,
    category: 'Palettes' as SearchCategory,
    path: '/palettes',
    description: `${p.label} icon palette`,
  }));
}

// ----- Interface entries -----

function buildInterfaceEntries(): SearchEntry[] {
  const external = interfacesExternal as { name: string; description?: string }[];
  const internal = interfacesInternal as { name: string; description?: string }[];
  return [...external, ...internal].map((iface) => ({
    name: iface.name,
    category: 'Interfaces' as SearchCategory,
    path: '/interfaces',
    description: iface.description ?? 'TAK interface',
  }));
}

// ----- Build and export -----

export const searchIndex: SearchEntry[] = [
  ...buildTokenEntries(),
  ...buildComponentEntries(),
  ...buildIconEntries(),
  ...buildPaletteEntries(),
  ...buildInterfaceEntries(),
];

export default searchIndex;
