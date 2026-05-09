// rtmx:req REQ-SITE-005
import { useState, useMemo, useEffect } from 'react';
import styles from './Palettes.module.css';

// ZIP-based iconset manifests (these exist)
import responderData from '../../../data/atak-iconset-responder.json';
import falconviewData from '../../../data/atak-iconset-falconview.json';
import airData from '../../../data/atak-iconset-air.json';
import incidentData from '../../../data/atak-iconset-incident.json';
import wildfireData from '../../../data/atak-iconset-wildfire.json';

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

type PaletteType = 'iconset' | 'spotmap' | 'markers' | 'vehicle-models';

interface PaletteTab {
  id: string;
  label: string;
  type: PaletteType;
  data: IconsetManifest | null;
  /** JSON filename to dynamically load if data is null */
  dynamicFile?: string;
}

const PALETTE_TABS: PaletteTab[] = [
  { id: 'markers', label: 'Markers', type: 'markers', data: null },
  { id: 'spotmap', label: 'Spot Map', type: 'spotmap', data: null },
  { id: 'vehicle-models', label: 'Vehicle Models', type: 'vehicle-models', data: null, dynamicFile: 'atak-vehicle-models.json' },
  { id: 'reference-point', label: 'Reference Point', type: 'iconset', data: null, dynamicFile: 'atak-palette-referencepoint.json' },
  { id: 'google', label: 'Google', type: 'iconset', data: null, dynamicFile: 'atak-palette-google.json' },
  { id: 'osm', label: 'OSM', type: 'iconset', data: null, dynamicFile: 'atak-palette-osm.json' },
  { id: 'generic', label: 'Generic Icons', type: 'iconset', data: null, dynamicFile: 'atak-palette-generic.json' },
  { id: 'fema', label: 'FEMA Icons', type: 'iconset', data: null, dynamicFile: 'atak-palette-fema.json' },
  { id: 'default', label: 'Default', type: 'iconset', data: null, dynamicFile: 'atak-palette-default.json' },
  { id: 'falconview', label: 'FalconView', type: 'iconset', data: falconviewData as IconsetManifest },
  { id: 'incident', label: 'Incident Mgmt', type: 'iconset', data: incidentData as IconsetManifest },
  { id: 'air', label: 'Public Safety Air', type: 'iconset', data: airData as IconsetManifest },
  { id: 'responder', label: 'Responder', type: 'iconset', data: responderData as IconsetManifest },
  { id: 'geoops', label: 'GeoOps', type: 'iconset', data: wildfireData as IconsetManifest },
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
  return `${BASE}palettes/${paletteId}/${icon.path}`;
}

// ----- Hook for dynamic data loading -----

function useDynamicManifest(filename: string | undefined): IconsetManifest | null {
  const [data, setData] = useState<IconsetManifest | null>(null);

  useEffect(() => {
    if (!filename) return;
    // Attempt to fetch from the data directory (works during dev with Vite)
    fetch(`${BASE}data/${filename}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((json) => {
        if (json) setData(json as IconsetManifest);
      })
      .catch(() => {
        // File does not exist yet
      });
  }, [filename]);

  return data;
}

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
  const dynamicData = useDynamicManifest('atak-vehicle-models.json');

  if (!dynamicData) {
    return (
      <div>
        <div className={styles.paletteHeader}>
          <div className={styles.paletteName}>Vehicle Models</div>
        </div>
        <div className={styles.placeholder}>
          <div className={styles.placeholderTitle}>Extracting...</div>
          Vehicle model data not yet available.
        </div>
      </div>
    );
  }

  const models = (dynamicData as unknown as VehicleModelsManifest).models || [];
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
        <div className={styles.paletteCount}>{(dynamicData as unknown as VehicleModelsManifest).count} models</div>
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
  const dynamicData = useDynamicManifest(tab.data ? undefined : tab.dynamicFile);
  const manifest = tab.data || dynamicData;

  if (!manifest) {
    return (
      <div>
        <div className={styles.paletteHeader}>
          <div className={styles.paletteName}>{tab.label}</div>
        </div>
        <div className={styles.placeholder}>
          <div className={styles.placeholderTitle}>Extracting...</div>
          Palette data not yet available. Run the extraction script to populate.
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
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('[data-fallback]')) {
                      const span = document.createElement('span');
                      span.setAttribute('data-fallback', 'true');
                      span.style.cssText = 'font-size:10px;color:#878787;text-align:center;padding:4px;word-break:break-all;';
                      span.textContent = icon.name;
                      parent.insertBefore(span, target.nextSibling);
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
      {active.type === 'iconset' && <IconsetPanel tab={active} />}
    </div>
  );
}
