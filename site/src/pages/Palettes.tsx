// rtmx:req REQ-SITE-005
import { useState, useMemo } from 'react';
import styles from './Palettes.module.css';

// All iconset manifests - static imports for reliability
import responderData from '../../../data/atak-iconset-responder.json';
import falconviewData from '../../../data/atak-iconset-falconview.json';
import airData from '../../../data/atak-iconset-air.json';
import incidentData from '../../../data/atak-iconset-incident.json';
import wildfireData from '../../../data/atak-iconset-wildfire.json';
import defaultData from '../../../data/atak-palette-default.json';
import googleData from '../../../data/atak-palette-google.json';
import osmData from '../../../data/atak-palette-osm.json';
import genericData from '../../../data/atak-palette-generic.json';
import femaData from '../../../data/atak-palette-fema.json';
import geoopsData from '../../../data/atak-palette-geoops.json';
import vehicleData from '../../../data/atak-vehicle-models.json';

const BASE = import.meta.env.BASE_URL;

// ----- Types -----

interface IconEntry {
  name: string;
  path: string;
}

interface IconsetManifest {
  iconset: string;
  count: number;
  icons: IconEntry[];
}

interface VehicleModelEntry {
  name: string;
  category?: string;
  path?: string;
}

interface VehicleModelsManifest {
  count: number;
  models: VehicleModelEntry[];
}

// ----- Spot Map team colors -----

const TEAM_COLORS: { name: string; hex: string }[] = [
  { name: 'white', hex: '#FFFFFF' },
  { name: 'yellow', hex: '#FFFF00' },
  { name: 'orange', hex: '#FF8C00' },
  { name: 'magenta', hex: '#FF00FF' },
  { name: 'red', hex: '#FF0000' },
  { name: 'maroon', hex: '#800000' },
  { name: 'purple', hex: '#800080' },
  { name: 'dark-blue', hex: '#00008B' },
  { name: 'blue', hex: '#0000FF' },
  { name: 'cyan', hex: '#00FFFF' },
  { name: 'teal', hex: '#008080' },
  { name: 'green', hex: '#00FF00' },
  { name: 'dark-green', hex: '#006400' },
  { name: 'brown', hex: '#8B4513' },
  { name: 'pink', hex: '#FFC0CB' },
];

// ----- Palette tab definitions -----

type PaletteType = 'iconset' | 'sqlite-palette' | 'spotmap' | 'markers' | 'vehicle-models';

/** SQLite palette format: groups with icons */
interface SqlitePalette {
  name: string;
  uid: string;
  iconCount: number;
  groups: { name: string; icons: { filename: string; type2525b?: string }[] }[];
}

/** Normalize SQLite palette to flat icon list with group in path */
function normalizeSqlite(data: SqlitePalette, paletteSlug: string): IconsetManifest {
  const icons: IconEntry[] = [];
  for (const g of data.groups) {
    for (const icon of g.icons) {
      icons.push({ name: icon.filename, path: `${g.name}/${icon.filename}` });
    }
  }
  return { iconset: data.name, count: data.iconCount, icons };
}

interface PaletteTab {
  id: string;
  label: string;
  type: PaletteType;
  data: IconsetManifest | null;
}

const PALETTE_TABS: PaletteTab[] = [
  { id: 'markers', label: 'Markers', type: 'markers', data: null },
  { id: 'spotmap', label: 'Spot Map', type: 'spotmap', data: null },
  { id: 'vehicle-models', label: 'Vehicle Models', type: 'vehicle-models', data: null },
  { id: 'google', label: 'Google', type: 'sqlite-palette', data: normalizeSqlite(googleData as unknown as SqlitePalette, 'google') },
  { id: 'osm', label: 'OSM', type: 'sqlite-palette', data: normalizeSqlite(osmData as unknown as SqlitePalette, 'osm') },
  { id: 'generic', label: 'Generic Icons', type: 'sqlite-palette', data: normalizeSqlite(genericData as unknown as SqlitePalette, 'generic') },
  { id: 'fema', label: 'FEMA Icons', type: 'sqlite-palette', data: normalizeSqlite(femaData as unknown as SqlitePalette, 'fema') },
  { id: 'default', label: 'Default', type: 'sqlite-palette', data: normalizeSqlite(defaultData as unknown as SqlitePalette, 'default') },
  { id: 'falconview', label: 'FalconView', type: 'iconset', data: falconviewData as unknown as IconsetManifest },
  { id: 'incident', label: 'Incident Mgmt', type: 'iconset', data: incidentData as unknown as IconsetManifest },
  { id: 'air', label: 'Public Safety Air', type: 'iconset', data: airData as unknown as IconsetManifest },
  { id: 'responder', label: 'Responder', type: 'iconset', data: responderData as unknown as IconsetManifest },
  { id: 'geoops', label: 'GeoOps', type: 'sqlite-palette', data: normalizeSqlite(geoopsData as unknown as SqlitePalette, 'geoops') },
];

// ----- Helpers -----

/** Extract group name from icon path (directory before filename) */
function getGroupName(icon: IconEntry): string {
  const parts = icon.path.split('/');
  return parts.length > 1 ? parts[parts.length - 2] : 'Ungrouped';
}

/** Group icons by directory */
function groupIcons(icons: IconEntry[]): Map<string, IconEntry[]> {
  const groups = new Map<string, IconEntry[]>();
  for (const icon of icons) {
    const group = getGroupName(icon);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(icon);
  }
  return groups;
}

/** Build the palette image path */
function paletteImgSrc(paletteId: string, icon: IconEntry): string {
  // Try with full path (group/filename) first
  return `${BASE}palettes/${paletteId}/${icon.path}`;
}

/** Fallback: try just the filename without group directory */
function paletteImgFallback(paletteId: string, icon: IconEntry): string {
  return `${BASE}palettes/${paletteId}/${icon.name}`;
}

// No dynamic loading needed - all manifests are statically imported

// ----- Sub-components -----

function SpotMapPanel() {
  return (
    <div>
      <div className={styles.paletteHeader}>
        <div className={styles.paletteName}>Spot Map</div>
        <div className={styles.paletteCount}>15 team colors</div>
      </div>
      <div className={styles.spotGrid}>
        {TEAM_COLORS.map((tc) => (
          <div key={tc.name} className={styles.spotCard}>
            <div
              className={styles.spotCircle}
              style={{ backgroundColor: tc.hex }}
            />
            <span className={styles.spotLabel}>{tc.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarkersPanel() {
  const [version, setVersion] = useState('B');
  const versions = ['B', 'C', 'D', 'E'];

  return (
    <div>
      <div className={styles.paletteHeader}>
        <div className={styles.paletteName}>Markers (MIL-STD-2525)</div>
        <div className={styles.paletteCount}>Military symbology</div>
      </div>
      <div className={styles.subToggle}>
        {versions.map((v) => (
          <button
            key={v}
            className={`${styles.subToggleBtn} ${version === v ? styles.subToggleBtnActive : ''}`}
            onClick={() => setVersion(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className={styles.placeholder}>
        <div className={styles.placeholderTitle}>MIL-STD-2525{version}</div>
        Requires mil-sym-ts integration
      </div>
    </div>
  );
}

function VehicleModelsPanel() {
  const vData = vehicleData as unknown as { totalCount: number; categories: { name: string; models: { name: string; file: string }[] }[] };

  const models = vData.categories.flatMap(c => c.models.map(m => ({ ...m, category: c.name })));
  const categories = new Map<string, VehicleModelEntry[]>();
  for (const m of models) {
    const cat = m.category || 'Uncategorized';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(m);
  }

  return (
    <div>
      <div className={styles.paletteHeader}>
        <div className={styles.paletteName}>Vehicle Models</div>
        <div className={styles.paletteCount}>{vData.totalCount} models</div>
      </div>
      {Array.from(categories.entries()).map(([cat, items]) => (
        <div key={cat} className={styles.groupSection}>
          <div className={styles.groupName}>{cat}</div>
          <div className={styles.groupCount}>{items.length} models</div>
          <div className={styles.grid}>
            {items.map((m) => (
              <div key={m.name} className={styles.iconCard}>
                <div className={styles.iconName} title={m.name}>{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IconsetPanel({ tab }: { tab: PaletteTab }) {
  const [search, setSearch] = useState('');
  const manifest = tab.data;

  if (!manifest) {
    return (
      <div>
        <div className={styles.paletteHeader}>
          <div className={styles.paletteName}>{tab.label}</div>
        </div>
        <div className={styles.placeholder}>
          <div className={styles.placeholderTitle}>No data</div>
          Palette manifest not available.
        </div>
      </div>
    );
  }

  const icons = manifest.icons;

  const filtered = useMemo(() => {
    if (!search) return icons;
    const lower = search.toLowerCase();
    return icons.filter((i) => i.name.toLowerCase().includes(lower));
  }, [icons, search]);

  const groups = useMemo(() => groupIcons(filtered), [filtered]);

  return (
    <div>
      <div className={styles.paletteHeader}>
        <div className={styles.paletteName}>{tab.label}</div>
        <div className={styles.paletteCount}>{manifest.count} icons</div>
      </div>

      {icons.length > 20 && (
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={`Search ${tab.label} icons...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={`Search ${tab.label} icons`}
          />
        </div>
      )}

      {Array.from(groups.entries()).map(([groupName, groupIcons]) => (
        <div key={groupName} className={styles.groupSection}>
          <div className={styles.groupName}>{groupName}</div>
          <div className={styles.groupCount}>{groupIcons.length} icons</div>
          <div className={styles.grid}>
            {groupIcons.map((icon) => (
              <div key={icon.path} className={styles.iconCard}>
                <img
                  src={paletteImgSrc(tab.id, icon)}
                  alt={icon.name}
                  className={styles.iconPreview}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = paletteImgFallback(tab.id, icon);
                    if (target.src !== fallback && !target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = fallback;
                    }
                  }}
                />
                <div className={styles.iconName} title={icon.name}>
                  {icon.name.replace(/\.png$/i, '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className={styles.emptyState}>
          No icons match your search.
        </div>
      )}
    </div>
  );
}

// ----- Main component -----

export default function Palettes() {
  const [activeTab, setActiveTab] = useState('markers');
  const active = PALETTE_TABS.find((t) => t.id === activeTab) ?? PALETTE_TABS[0];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Palettes</h1>
      <p className={styles.subtitle}>
        Browse ATAK icon palettes. Matches the &quot;Select Icon Pallet&quot; dialog in ATAK.
      </p>

      <div className={styles.tabBar}>
        {PALETTE_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active.type === 'spotmap' && <SpotMapPanel />}
      {active.type === 'markers' && <MarkersPanel />}
      {active.type === 'vehicle-models' && <VehicleModelsPanel />}
      {(active.type === 'iconset' || active.type === 'sqlite-palette') && <IconsetPanel tab={active} />}
    </div>
  );
}
