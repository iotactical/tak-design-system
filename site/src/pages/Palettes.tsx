// rtmx:req REQ-SITE-005
// rtmx:req REQ-XW-074
// rtmx:req REQ-XW-075
import { useEffect, useState, useMemo, useRef } from 'react';
import styles from './Palettes.module.css';
import { ModelViewer } from '../components/ModelViewer';

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

/** Return black or white text depending on background luminance */
function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Relative luminance (ITU-R BT.709)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? '#000000' : '#FFFFFF';
}

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

type PaletteType = 'iconset' | 'sqlite-palette' | 'spotmap' | 'markers' | 'vehicle-models' | 'skittles' | 'self-marker';

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
  { id: 'skittles', label: 'Skittles', type: 'skittles', data: null },
  { id: 'self-marker', label: 'Self Marker', type: 'self-marker', data: null },
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

/** Build the palette image path based on palette type.
 *  - iconset (ZIP-extracted): files are flat, use filename directly
 *  - sqlite-palette: files are in group subdirectories, use group/filename
 */
function paletteImgSrc(paletteId: string, icon: IconEntry, type: PaletteType): string {
  if (type === 'iconset') {
    // ZIP-extracted iconsets have flat file structure (no subdirectory)
    return `${BASE}palettes/${paletteId}/${icon.name}`;
  }
  // SQLite palettes preserve group/filename directory structure
  return `${BASE}palettes/${paletteId}/${icon.path}`;
}

/** Fallback: try the opposite path strategy */
function paletteImgFallback(paletteId: string, icon: IconEntry, type: PaletteType): string {
  if (type === 'iconset') {
    // Some iconsets like responder have subdirectories; try full path
    return `${BASE}palettes/${paletteId}/${icon.path}`;
  }
  // SQLite fallback: try just the filename without group directory
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

// rtmx:req REQ-XW-075
/** Lazy-loading wrapper for ModelViewer using IntersectionObserver */
function LazyModelViewer({
  modelPath,
  modelName,
  width = 160,
  height = 120,
}: {
  modelPath: string;
  modelName: string;
  width?: number;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width, height }}>
      {isVisible ? (
        <ModelViewer
          modelPath={modelPath}
          width={width}
          height={height}
          autoRotate
        />
      ) : (
        <div
          style={{
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            color: '#878787',
            fontSize: 11,
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span>{modelName}</span>
          <span style={{ fontSize: 9, opacity: 0.6 }}>Loading...</span>
        </div>
      )}
    </div>
  );
}

// rtmx:req REQ-XW-074
/** Derive the DAE filename from the model name: remove hyphens, append .DAE */
function deriveDaeFilename(name: string): string {
  return name.replace(/-/g, '') + '.DAE';
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
            {items.map((m) => {
              const daeFile = deriveDaeFilename(m.name);
              const modelPath = `${BASE}models/${cat}/${m.name}/${daeFile}`;
              return (
                <div key={m.name} className={styles.iconCard}>
                  <LazyModelViewer
                    modelPath={modelPath}
                    modelName={m.name}
                    width={160}
                    height={120}
                  />
                  <div className={styles.iconName} title={m.name}>{m.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ----- Skittles role definitions -----

const SKITTLE_ROLES: { label: string; abbr: string }[] = [
  { label: 'Team Member', abbr: '' },
  { label: 'Team Lead', abbr: 'TL' },
  { label: 'HQ', abbr: 'HQ' },
  { label: 'Sniper', abbr: 'S' },
  { label: 'Medic', abbr: 'M' },
  { label: 'Forward Observer', abbr: 'FO' },
  { label: 'RTO', abbr: 'RTO' },
  { label: 'K9', abbr: 'K9' },
];

const AFFILIATION_COLORS: { label: string; hex: string }[] = [
  { label: 'Friendly', hex: '#4488FF' },
  { label: 'Hostile', hex: '#FF4444' },
  { label: 'Neutral', hex: '#44BB44' },
  { label: 'Unknown', hex: '#FFCC00' },
];

const skittleCircleBase: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.2)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: 10,
  flexShrink: 0,
};

// rtmx:req REQ-XW-081
function SkittlesPanel() {
  const stalenessColors = TEAM_COLORS.slice(0, 5);

  return (
    <div>
      <div className={styles.paletteHeader}>
        <div className={styles.paletteName}>Skittles</div>
        <div className={styles.paletteCount}>Team member circles -- ATAK spot map markers</div>
      </div>

      {/* Team Color Grid */}
      <div className={styles.groupSection}>
        <div className={styles.groupName}>Team Colors</div>
        <div className={styles.groupCount}>15 colors</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TEAM_COLORS.map((tc) => (
            <div key={tc.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                data-testid={`skittle-color-${tc.name}`}
                style={{ ...skittleCircleBase, backgroundColor: tc.hex, color: contrastText(tc.hex) }}
              />
              <span style={{ fontSize: 9, color: '#878787' }}>{tc.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Role x Color Matrix */}
      <div className={styles.groupSection}>
        <div className={styles.groupName}>Roles</div>
        <div className={styles.groupCount}>{SKITTLE_ROLES.length} roles x {TEAM_COLORS.length} colors</div>
        <div style={{ overflowX: 'auto' }}>
          {SKITTLE_ROLES.map((role) => (
            <div key={role.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ width: 120, fontSize: 12, color: '#DAD4BC', flexShrink: 0 }}>{role.label}</span>
              {TEAM_COLORS.map((tc) => (
                <div
                  key={tc.name}
                  data-testid={`skittle-role-${role.abbr || 'member'}-${tc.name}`}
                  style={{ ...skittleCircleBase, backgroundColor: tc.hex, color: contrastText(tc.hex) }}
                >
                  {role.abbr}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Staleness States */}
      <div className={styles.groupSection}>
        <div className={styles.groupName}>Staleness States</div>
        <div className={styles.groupCount}>Connected, stale, expired</div>
        {[
          { label: 'Connected', opacity: 1, filter: 'none' },
          { label: 'Stale', opacity: 0.5, filter: 'none' },
          { label: 'Expired', opacity: 0.3, filter: 'grayscale(1)' },
        ].map((state) => (
          <div key={state.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 120, fontSize: 12, color: '#DAD4BC', flexShrink: 0 }}>{state.label}</span>
            {stalenessColors.map((tc) => (
              <div
                key={tc.name}
                style={{
                  ...skittleCircleBase,
                  backgroundColor: tc.hex,
                  color: contrastText(tc.hex),
                  opacity: state.opacity,
                  filter: state.filter,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Affiliation Dots */}
      <div className={styles.groupSection}>
        <div className={styles.groupName}>Affiliation</div>
        <div className={styles.groupCount}>4 affiliations</div>
        <div style={{ display: 'flex', gap: 16 }}>
          {AFFILIATION_COLORS.map((a) => (
            <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ ...skittleCircleBase, backgroundColor: a.hex, color: contrastText(a.hex) }} />
              <span style={{ fontSize: 10, color: '#DAD4BC' }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison: Skittle vs Self Marker */}
      <div className={styles.groupSection}>
        <div className={styles.groupName}>Comparison</div>
        <div className={styles.groupCount}>Skittle circle vs Self Marker arrow</div>
        <div style={{ display: 'flex', gap: 32 }}>
          {TEAM_COLORS.slice(0, 5).map((tc) => (
            <div key={tc.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {/* Skittle circle */}
                <div style={{ ...skittleCircleBase, backgroundColor: tc.hex, color: contrastText(tc.hex) }} />
                {/* Self Marker arrow */}
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <polygon
                    points="14,2 24,24 14,18 4,24"
                    fill={tc.hex}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <span style={{ fontSize: 9, color: '#878787' }}>{tc.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// rtmx:req REQ-XW-082
function SelfMarkerPanel() {
  return (
    <div>
      <div className={styles.paletteHeader}>
        <div className={styles.paletteName}>Self Marker</div>
        <div className={styles.paletteCount}>Directional arrow showing own position and heading</div>
      </div>

      <div className={styles.groupSection}>
        <div className={styles.groupName}>Heading Arrows by Team Color</div>
        <div className={styles.groupCount}>{TEAM_COLORS.length} colors</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {TEAM_COLORS.map((tc) => (
            <div key={tc.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" data-testid={`self-marker-arrow-${tc.name}`}>
                <polygon
                  points="24,4 40,40 24,30 8,40"
                  fill={tc.hex}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                />
              </svg>
              <span style={{ fontSize: 10, color: '#DAD4BC' }}>{tc.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.groupSection}>
        <div className={styles.groupName}>Heading Variations</div>
        <div className={styles.groupCount}>Cardinal directions</div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div key={deg} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <g transform={`rotate(${deg} 24 24)`}>
                  <polygon
                    points="24,4 40,40 24,30 8,40"
                    fill="#00FF00"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                  />
                </g>
              </svg>
              <span style={{ fontSize: 10, color: '#878787' }}>{deg}deg</span>
            </div>
          ))}
        </div>
      </div>
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

      {icons.length > 0 && (
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={`Search ${tab.label} icons...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={`Search ${tab.label} icons`}
          />
          {search && (
            <span className={styles.searchCount}>
              {filtered.length} of {icons.length}
            </span>
          )}
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
                  src={paletteImgSrc(tab.id, icon, tab.type)}
                  alt={icon.name}
                  className={styles.iconPreview}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = paletteImgFallback(tab.id, icon, tab.type);
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
  useEffect(() => { document.title = 'Palettes - TAK Design System'; }, []);
  const [activeTab, setActiveTab] = useState('skittles');
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

      {active.type === 'skittles' && <SkittlesPanel />}
      {active.type === 'self-marker' && <SelfMarkerPanel />}
      {active.type === 'spotmap' && <SpotMapPanel />}
      {active.type === 'markers' && <MarkersPanel />}
      {active.type === 'vehicle-models' && <VehicleModelsPanel />}
      {(active.type === 'iconset' || active.type === 'sqlite-palette') && <IconsetPanel tab={active} />}
    </div>
  );
}
