// rtmx:req REQ-XW-110
// rtmx:req REQ-XW-118
// rtmx:req REQ-XW-121
/**
 * Full taxonomy search index for GlobalSearch autocomplete.
 * Covers tokens, components, icons, 2525 entities, intents, interfaces, palettes, and BDD specs.
 */

import coreTokens from '@tokens/core.json';
import semanticTokens from '@tokens/semantic.json';
import atakTokens from '@tokens/atak.json';
import drawableCatalog from '../../../data/atak-drawable-catalog.json';
import interfacesExternal from '../../../data/tak-interfaces-external.json';
import interfacesInternal from '../../../data/tak-interfaces-internal.json';
import bEntities from '../../../data/mil-std-2525/b-entities.json';
import atakIntents from '../../../data/atak-intents.json';

// ----- Types -----

export type SearchCategory =
  | 'Tokens'
  | 'Components'
  | 'Icons'
  | 'Palettes'
  | 'Interfaces'
  | '2525'
  | 'Specs';

export interface SearchEntry {
  name: string;
  path: string;
  breadcrumb: string;
  category: SearchCategory;
  description?: string;
}

// ----- Token extraction -----

/** Recursively extract token paths from a W3C token JSON structure */
function extractTokenPaths(
  obj: Record<string, unknown>,
  prefix: string,
  breadcrumbPrefix: string,
): { tokenPath: string; breadcrumb: string }[] {
  const results: { tokenPath: string; breadcrumb: string }[] = [];
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue;
    const val = obj[key] as Record<string, unknown>;
    const currentPath = prefix ? `${prefix}.${key}` : key;
    const currentBreadcrumb = `${breadcrumbPrefix} > ${key}`;
    if (val && typeof val === 'object' && '$value' in val) {
      results.push({ tokenPath: currentPath, breadcrumb: currentBreadcrumb });
    } else if (val && typeof val === 'object') {
      results.push(...extractTokenPaths(val, currentPath, currentBreadcrumb));
    }
  }
  return results;
}

function buildTokenEntries(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const sources: [string, Record<string, unknown>][] = [
    ['Core', coreTokens as unknown as Record<string, unknown>],
    ['Semantic', semanticTokens as unknown as Record<string, unknown>],
    ['ATAK', atakTokens as unknown as Record<string, unknown>],
  ];
  for (const [source, data] of sources) {
    const tokens = extractTokenPaths(data, '', `Tokens > ${source}`);
    for (const { tokenPath, breadcrumb } of tokens) {
      entries.push({
        name: tokenPath,
        path: `/colors?highlight=${encodeURIComponent(tokenPath)}`,
        breadcrumb,
        category: 'Tokens',
        description: `${source} token`,
      });
    }
  }
  return entries;
}

// ----- Component entries (hardcoded 28 components with categories) -----

const COMPONENTS: { name: string; layoutCategory: string; description: string }[] = [
  { name: 'NavBar', layoutCategory: 'Layout', description: 'Top navigation bar with menu, title, search, and action slots' },
  { name: 'ToolBar', layoutCategory: 'Layout', description: 'Horizontal toolbar with leading, title, and trailing slots' },
  { name: 'DockPane', layoutCategory: 'Layout', description: 'Collapsible side/bottom panel docked to viewport edge' },
  { name: 'Button', layoutCategory: 'Inputs', description: 'Action button with primary, secondary, and danger variants' },
  { name: 'EditText', layoutCategory: 'Inputs', description: 'Text input field with label, error, and icon slots' },
  { name: 'Checkbox', layoutCategory: 'Inputs', description: 'Binary toggle checkbox with label support' },
  { name: 'Toggle', layoutCategory: 'Inputs', description: 'Switch-style toggle for on/off states' },
  { name: 'Spinner', layoutCategory: 'Inputs', description: 'Dropdown selector for picking from a list of options' },
  { name: 'RadioGroup', layoutCategory: 'Inputs', description: 'Mutually exclusive radio button options group' },
  { name: 'ListView', layoutCategory: 'Data Display', description: 'Scrollable list with single or multi-select support' },
  { name: 'TabLayout', layoutCategory: 'Data Display', description: 'Tabbed interface for switching content panels' },
  { name: 'ProgressBar', layoutCategory: 'Data Display', description: 'Horizontal progress indicator with default and small variants' },
  { name: 'CoordinateDisplay', layoutCategory: 'Data Display', description: 'Geographic coordinate display in MGRS, DD, DMS, or UTM' },
  { name: 'RangeBearing', layoutCategory: 'Data Display', description: 'Distance and bearing between two geographic points' },
  { name: 'MarkerDetail', layoutCategory: 'Data Display', description: 'Detail card for map marker with callsign and coordinates' },
  { name: 'UserList', layoutCategory: 'Data Display', description: 'Team member list with online status and roles' },
  { name: 'Modal', layoutCategory: 'Overlay', description: 'Centered overlay dialog with backdrop' },
  { name: 'DialogPanel', layoutCategory: 'Overlay', description: 'Structured dialog with title, content, and action buttons' },
  { name: 'RadialMenu', layoutCategory: 'Overlay', description: 'Circular context menu with configurable sectors' },
  { name: 'ChatPanel', layoutCategory: 'Tactical', description: 'Real-time messaging panel with channel switching' },
  { name: 'RoutePlanner', layoutCategory: 'Tactical', description: 'Waypoint-based route planning with distance estimates' },
  { name: 'NineLineForm', layoutCategory: 'Tactical', description: 'Standardized 9-line CAS briefing form' },
  { name: 'ScaleBar', layoutCategory: 'Tactical', description: 'Map scale indicator in metric or imperial units' },
  { name: 'CompassHeading', layoutCategory: 'Tactical', description: 'Compass rose widget displaying heading in degrees' },
  { name: 'ElevationProfile', layoutCategory: 'Tactical', description: 'Elevation chart showing terrain profile along a path' },
  { name: 'ConnectionStatus', layoutCategory: 'Status', description: 'Network connection state indicator with colored dot' },
  { name: 'GPSStatus', layoutCategory: 'Status', description: 'GPS fix quality indicator with satellites and accuracy' },
  { name: 'ModelViewer', layoutCategory: 'Status', description: '3D model viewer for vehicle and equipment models' },
];

function buildComponentEntries(): SearchEntry[] {
  return COMPONENTS.map((c) => ({
    name: c.name,
    category: 'Components' as SearchCategory,
    path: `/components?tab=${encodeURIComponent(c.layoutCategory)}&highlight=${encodeURIComponent(c.name)}`,
    breadcrumb: `Components > ${c.layoutCategory} > ${c.name}`,
    description: c.description,
  }));
}

// ----- Icon entries from drawable catalog (all 1317) -----

function buildIconEntries(): SearchEntry[] {
  const catalog = drawableCatalog as { name: string; category?: string }[];
  return catalog.map((entry) => ({
    name: entry.name,
    category: 'Icons' as SearchCategory,
    path: `/icons?highlight=${encodeURIComponent(entry.name)}`,
    breadcrumb: `Icons > ${entry.category || 'other'} > ${entry.name}`,
    description: entry.category ? `${entry.category} drawable` : 'ATAK drawable',
  }));
}

// ----- Palette entries -----

const TEAM_COLORS = [
  'White', 'Yellow', 'Orange', 'Magenta', 'Red', 'Maroon', 'Purple', 'Dark Blue',
  'Blue', 'Cyan', 'Teal', 'Green', 'Dark Green', 'Brown', 'Unassigned',
];

const ROLES = [
  'Team Lead', 'Team Member', 'HQ', 'Sniper', 'Medic', 'Forward Observer', 'RTO', 'K9',
];

const PALETTE_TABS = [
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
  const entries: SearchEntry[] = [];

  // Palette tab names
  for (const p of PALETTE_TABS) {
    entries.push({
      name: p.label,
      category: 'Palettes',
      path: '/palettes',
      breadcrumb: `Palettes > ${p.label}`,
      description: `${p.label} icon palette`,
    });
  }

  // Team colors for Skittles
  for (const color of TEAM_COLORS) {
    entries.push({
      name: `Skittle ${color}`,
      category: 'Palettes',
      path: '/palettes',
      breadcrumb: `Palettes > Skittles > ${color}`,
      description: `Team color ${color}`,
    });
  }

  // Roles for Skittles
  for (const role of ROLES) {
    entries.push({
      name: `Role ${role}`,
      category: 'Palettes',
      path: '/palettes',
      breadcrumb: `Palettes > Skittles > Roles > ${role}`,
      description: `Skittle role ${role}`,
    });
  }

  return entries;
}

// ----- 2525 entities -----

const SYMBOL_SET_NAMES: Record<string, string> = {
  '01': 'Air',
  '02': 'Air Missile',
  '05': 'Space',
  '10': 'Land Unit',
  '11': 'Land Civilian',
  '15': 'Land Equipment',
  '20': 'Land Installation',
  '25': 'Control Measure',
  '30': 'Sea Surface',
  '35': 'Sea Subsurface',
  '36': 'Mine Warfare',
  '40': 'Activities',
  '45': 'Atmospheric',
  '46': 'Oceanographic',
  '50': 'Meteorological Space',
  '51': 'Signals Intelligence Space',
  '52': 'Signals Intelligence Air',
  '53': 'Signals Intelligence Land',
  '54': 'Signals Intelligence Sea Surface',
  '60': 'Cyberspace',
};

function build2525Entries(): SearchEntry[] {
  const entities = (bEntities as { entities: { label: string; ss: string; basic: string }[] }).entities;
  return entities.map((e) => {
    const ssName = SYMBOL_SET_NAMES[e.ss] || e.ss;
    return {
      name: e.label,
      category: '2525' as SearchCategory,
      path: `/explorer?tab=browse&highlight=${encodeURIComponent(e.label)}`,
      breadcrumb: `2525 > ${ssName} > ${e.label}`,
      description: `SIDC ${e.basic}`,
    };
  });
}

// ----- Intent entries -----

function buildIntentEntries(): SearchEntry[] {
  const data = atakIntents as { groups: { namespace: string; intents: { action: string; description?: string }[] }[] };
  const entries: SearchEntry[] = [];
  for (const group of data.groups) {
    for (const intent of group.intents) {
      // Extract short action name from fully qualified action string
      const parts = intent.action.split('.');
      const shortAction = parts[parts.length - 1] || intent.action;
      entries.push({
        name: shortAction,
        category: 'Interfaces',
        path: `/interfaces?tab=intents&highlight=${encodeURIComponent(intent.action)}`,
        breadcrumb: `Interfaces > Intents > ${group.namespace} > ${shortAction}`,
        description: intent.description || `Intent in ${group.namespace}`,
      });
    }
  }
  return entries;
}

// ----- Interface entries -----

function buildInterfaceEntries(): SearchEntry[] {
  const external = interfacesExternal as { name: string; description?: string }[];
  const internal = interfacesInternal as { name: string; description?: string }[];
  const entries: SearchEntry[] = [];
  for (const iface of external) {
    entries.push({
      name: iface.name,
      category: 'Interfaces',
      path: '/interfaces',
      breadcrumb: `Interfaces > External > ${iface.name}`,
      description: iface.description ?? 'TAK external interface',
    });
  }
  for (const iface of internal) {
    entries.push({
      name: iface.name,
      category: 'Interfaces',
      path: '/interfaces',
      breadcrumb: `Interfaces > Internal > ${iface.name}`,
      description: iface.description ?? 'TAK internal interface',
    });
  }
  return entries;
}

// ----- BDD spec entries -----

const BDD_SPECS = [
  { name: 'CoT Lifecycle', file: 'cot-lifecycle.feature' },
  { name: 'Team Management', file: 'team-management.feature' },
  { name: 'GeoChat', file: 'geochat.feature' },
  { name: 'Route Planning', file: 'route-planning.feature' },
  { name: 'Nine Line', file: 'nine-line.feature' },
  { name: 'Connections', file: 'connections.feature' },
  { name: 'Self Marker', file: 'self-marker.feature' },
  { name: 'Icon Palettes', file: 'icon-palettes.feature' },
  { name: 'Mission Packages', file: 'mission-packages.feature' },
  { name: 'Map Layers', file: 'map-layers.feature' },
  { name: 'Geofence', file: 'geofence.feature' },
  { name: 'Map Orientation', file: 'map-orientation.feature' },
  { name: 'Overlay Hierarchy', file: 'overlay-hierarchy.feature' },
  { name: 'Range and Bearing', file: 'range-bearing.feature' },
  { name: 'Bloodhound', file: 'bloodhound.feature' },
  { name: 'Drawing Tools', file: 'drawing-tools.feature' },
  { name: 'Attachments', file: 'attachments.feature' },
  { name: 'Import and Export', file: 'import-export.feature' },
  { name: 'Emergency Alert', file: 'emergency-alert.feature' },
  { name: 'Viewshed', file: 'viewshed.feature' },
  { name: 'Radial Menu', file: 'radial-menu.feature' },
  { name: 'GPS Location', file: 'gps-location.feature' },
  { name: 'Pairing Line', file: 'pairing-line.feature' },
  { name: 'Tracks', file: 'tracks.feature' },
  { name: 'Go To Coordinate', file: 'coordinate-goto.feature' },
  { name: 'Video Stream', file: 'video-stream.feature' },
  { name: 'Fires', file: 'fires.feature' },
  { name: 'Contacts', file: 'contacts.feature' },
  { name: 'Overview', file: 'overview.feature' },
  { name: 'Red X', file: 'red-x.feature' },
  { name: 'Radio Controls', file: 'radio-controls.feature' },
  { name: 'Chat Inbox', file: 'chat.feature' },
  { name: 'Lasso Select', file: 'lasso.feature' },
  { name: 'Digital Pointer', file: 'digital-pointer.feature' },
  { name: 'Contour Lines', file: 'contour-lines.feature' },
  { name: 'Resection', file: 'resection.feature' },
  { name: 'Rubber Sheet', file: 'rubber-sheet.feature' },
  { name: 'Plugins and Package Management', file: 'plugins.feature' },
  { name: 'Toolbar Manager', file: 'toolbar-manager.feature' },
  { name: 'Clear Content', file: 'clear-content.feature' },
  { name: 'Preferences', file: 'preferences.feature' },
  { name: 'Device Tools', file: 'device-tools.feature' },
  { name: 'Sensors', file: 'sensors.feature' },
  { name: 'Vehicles', file: 'vehicles.feature' },
  { name: 'Preference Keys', file: 'preference-keys.feature' },
];

function buildSpecEntries(): SearchEntry[] {
  return BDD_SPECS.map((s) => ({
    name: s.name,
    category: 'Specs' as SearchCategory,
    path: '/',
    breadcrumb: `Specs > ${s.name}`,
    description: `BDD feature spec: ${s.file}`,
  }));
}

// ----- Build and export -----

export const searchIndex: SearchEntry[] = [
  ...buildTokenEntries(),
  ...buildComponentEntries(),
  ...buildIconEntries(),
  ...buildPaletteEntries(),
  ...build2525Entries(),
  ...buildIntentEntries(),
  ...buildInterfaceEntries(),
  ...buildSpecEntries(),
];

export default searchIndex;
