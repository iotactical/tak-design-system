// rtmx:req REQ-SITE-005
// rtmx:req REQ-XW-074
// rtmx:req REQ-XW-075
// rtmx:req REQ-XW-085
import { useEffect, useState, useMemo, useRef } from 'react';
import styles from './Palettes.module.css';
import { ModelViewer } from '../components/ModelViewer';
import { MilSymRenderer } from '../components/MilSymRenderer';

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
import bEntitiesData from '../../../data/mil-std-2525/b-entities.json';
import b2dData from '../../../data/mil-std-2525/b2d.json';

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

/** Symbol set display names for MIL-STD-2525D */
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
  '35': 'Subsurface',
  '36': 'Mine Warfare',
  '40': 'Activities',
  '45': 'Atmospheric',
  '46': 'Oceanographic',
  '50': 'SIGINT - Space',
  '51': 'SIGINT - Air',
  '52': 'SIGINT - Land',
  '53': 'SIGINT - Sea Surface',
  '54': 'SIGINT - Subsurface',
  '60': 'Cyberspace',
};

interface BEntity {
  basic: string;
  ss: string;
  ec: string;
  b_compat: boolean;
  label: string;
}

interface B2DMapping {
  b_sidc: string;
  d_ss: string;
  d_ec: string;
  d_s1: string;
  d_s2: string;
  label: string;
  lossy: boolean;
}

/**
 * Build a friendly SIDC for rendering from the B-format basic pattern.
 * Replace wildcard '*' in affiliation position with 'F' (friendly).
 */
function buildSidc15(basic: string, affiliationChar: string): string {
  if (!basic || basic.length < 2) return basic;
  // Replace wildcards: pos 1=affiliation, pos 3=status(P=present), rest with dashes
  let sidc = basic.charAt(0) + affiliationChar + basic.substring(2);
  // Position 3 (status): replace * with P (present)
  if (sidc.charAt(3) === '*') {
    sidc = sidc.substring(0, 3) + 'P' + sidc.substring(4);
  }
  // Replace remaining * with - (standard padding)
  sidc = sidc.replace(/\*/g, '-');
  return sidc;
}

/**
 * Build a D-format 20-char SIDC from crosswalk mapping.
 */
function buildDSidc(mapping: B2DMapping, si20: string): string {
  const version = '10';
  const si = si20;
  const sd = '0';
  const ss = mapping.d_ss;
  const ec = mapping.d_ec;
  const s1 = mapping.d_s1;
  const s2 = mapping.d_s2;
  const oo = '00';
  return `${version}${si}${sd}${ss}${ec}${s1}${s2}${oo}`;
}

const AFFILIATIONS = [
  { key: 'F', label: 'Friendly', siChar15: 'F', siChar20: '3', color: '#80C0FF' },
  { key: 'H', label: 'Hostile', siChar15: 'H', siChar20: '6', color: '#FF8080' },
  { key: 'N', label: 'Neutral', siChar15: 'N', siChar20: '4', color: '#AAFFAA' },
  { key: 'U', label: 'Unknown', siChar15: 'U', siChar20: '1', color: '#FFFF80' },
] as const;

// rtmx:req REQ-XW-085
function MarkersPanel() {
  const [version, setVersion] = useState('B');
  const [search, setSearch] = useState('');
  const [affiliation, setAffiliation] = useState<typeof AFFILIATIONS[number]>(AFFILIATIONS[0]);
  const versions = ['B', 'C', 'D', 'E'];

  const bEntities = (bEntitiesData as { entities: BEntity[] }).entities;
  const b2dMappings = (b2dData as { mappings: B2DMapping[] }).mappings;

  // Group entities by symbol set
  const groupedEntities = useMemo(() => {
    const groups = new Map<string, BEntity[]>();
    const lower = search.toLowerCase();
    const filtered = lower
      ? bEntities.filter((e) => e.label.toLowerCase().includes(lower))
      : bEntities;
    for (const entity of filtered) {
      const ss = entity.ss;
      if (!groups.has(ss)) groups.set(ss, []);
      groups.get(ss)!.push(entity);
    }
    return groups;
  }, [bEntities, search]);

  // Group D mappings by symbol set
  const groupedDMappings = useMemo(() => {
    const groups = new Map<string, B2DMapping[]>();
    const lower = search.toLowerCase();
    const filtered = lower
      ? b2dMappings.filter((m) => m.label.toLowerCase().includes(lower))
      : b2dMappings;
    for (const mapping of filtered) {
      const ss = mapping.d_ss;
      if (!groups.has(ss)) groups.set(ss, []);
      groups.get(ss)!.push(mapping);
    }
    return groups;
  }, [b2dMappings, search]);

  const totalCount = version === 'B' || version === 'C'
    ? bEntities.length
    : b2dMappings.length;

  const filteredCount = version === 'B' || version === 'C'
    ? Array.from(groupedEntities.values()).reduce((s, g) => s + g.length, 0)
    : Array.from(groupedDMappings.values()).reduce((s, g) => s + g.length, 0);

  return (
    <div>
      <div className={styles.paletteHeader}>
        <div className={styles.paletteName}>Markers (MIL-STD-2525)</div>
        <div className={styles.paletteCount}>{totalCount} entities -- military symbology</div>
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#878787', lineHeight: '32px' }}>Version</span>
          <div className={styles.subToggle} style={{ display: 'flex', alignItems: 'center' }}>
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
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: '#878787', lineHeight: '32px' }}>Affiliation</span>
          <div className={styles.subToggle} style={{ display: 'flex', alignItems: 'center' }}>
            {AFFILIATIONS.map((a) => (
              <button
                key={a.key}
                className={`${styles.subToggleBtn} ${affiliation.key === a.key ? styles.subToggleBtnActive : ''}`}
                style={{
                  borderLeft: `3px solid ${a.color}`,
                  ...(affiliation.key === a.key ? { backgroundColor: a.color, color: contrastText(a.color), borderColor: a.color } : {}),
                }}
                onClick={() => setAffiliation(a)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search entities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search MIL-STD-2525 entities"
        />
        {search && (
          <span className={styles.searchCount}>
            {filteredCount} of {totalCount}
          </span>
        )}
      </div>

      {(version === 'B' || version === 'C') && (
        <>
          {version === 'C' && (
            <p style={{ fontSize: 12, color: '#878787', marginBottom: 16 }}>
              MIL-STD-2525C uses the same 15-character SIDC as 2525B. Showing B entities (B/C share identical coding).
            </p>
          )}
          {Array.from(groupedEntities.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([ss, entities]) => (
              <div key={ss} className={styles.groupSection}>
                <div className={styles.groupName}>
                  {SYMBOL_SET_NAMES[ss] || `Symbol Set ${ss}`}
                </div>
                <div className={styles.groupCount}>{entities.length} entities</div>
                <div className={styles.markerGrid} data-testid={`marker-group-${ss}`}>
                  {entities.map((entity) => (
                    <div key={entity.basic} className={styles.markerCard}>
                      <MilSymRenderer
                        sidc={entity.basic} affiliation={affiliation.key === "F" ? "friendly" : affiliation.key === "H" ? "hostile" : affiliation.key === "N" ? "neutral" : "unknown"}
                        size={36}
                      />
                      <div className={styles.markerLabel} title={`${entity.label}\n${entity.basic}`}>
                        {entity.label}
                      </div>
                      <div className={styles.markerSidc}>{entity.basic}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </>
      )}

      {(version === 'D' || version === 'E') && (
        <>
          {version === 'E' && (
            <p style={{ fontSize: 12, color: '#878787', marginBottom: 16 }}>
              MIL-STD-2525E extends 2525D. Showing D entities from the B-to-D crosswalk.
            </p>
          )}
          {Array.from(groupedDMappings.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([ss, mappings]) => (
              <div key={ss} className={styles.groupSection}>
                <div className={styles.groupName}>
                  {SYMBOL_SET_NAMES[ss] || `Symbol Set ${ss}`}
                </div>
                <div className={styles.groupCount}>
                  {mappings.length} entities
                  {mappings.some((m) => m.lossy) && (
                    <span style={{ color: '#CC8844', marginLeft: 8 }}>
                      ({mappings.filter((m) => m.lossy).length} lossy mappings)
                    </span>
                  )}
                </div>
                <div className={styles.markerGrid} data-testid={`marker-group-d-${ss}`}>
                  {mappings.map((mapping) => {
                    const dSidc = buildDSidc(mapping, affiliation.siChar20);
                    return (
                      <div key={dSidc} className={styles.markerCard}>
                        <MilSymRenderer
                          sidc={`${mapping.d_ss}-${mapping.d_ec}`}
                          affiliation={affiliation.key === 'F' ? 'friendly' : affiliation.key === 'H' ? 'hostile' : affiliation.key === 'N' ? 'neutral' : 'unknown'}
                          size={36}
                        />
                        <div className={styles.markerLabel} title={`${mapping.label}\nB: ${mapping.b_sidc}\nD: ${dSidc}`}>
                          {mapping.label}
                        </div>
                        <div className={styles.markerSidc}>{mapping.d_ss}-{mapping.d_ec}</div>
                        {/* lossy indicated by subtle orange left border, visible on hover via title */}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </>
      )}

      {filteredCount === 0 && (
        <div className={styles.emptyState}>
          No entities match your search.
        </div>
      )}
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

const COL_W = 38; // column width for consistent alignment

const skittleCircleBase: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
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

      {/* Team Color header row with names */}
      <div className={styles.groupSection}>
        <div className={styles.groupName}>Team Colors</div>
        <div className={styles.groupCount}>15 colors</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 6, height: 70 }}>
          <span style={{ width: 130, flexShrink: 0 }} />
          {TEAM_COLORS.map((tc) => (
            <div key={tc.name} style={{ width: COL_W, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%' }}>
              <span style={{ fontSize: 11, color: '#AAA', transform: 'rotate(-45deg)', transformOrigin: '0% 100%', display: 'inline-block', whiteSpace: 'nowrap', position: 'relative', left: 14 }}>{tc.name}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ width: 130, fontSize: 12, color: '#DAD4BC', flexShrink: 0 }}>(base)</span>
          {TEAM_COLORS.map((tc) => (
            <div key={tc.name} style={{ width: COL_W, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <div
                data-testid={`skittle-color-${tc.name}`}
                style={{ ...skittleCircleBase, backgroundColor: tc.hex, color: contrastText(tc.hex) }}
              />
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
            <div key={role.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ width: 130, fontSize: 12, color: '#DAD4BC', flexShrink: 0 }}>{role.label}</span>
              {TEAM_COLORS.map((tc) => (
                <div key={tc.name} style={{ width: COL_W, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                  <div
                    data-testid={`skittle-role-${role.abbr || 'member'}-${tc.name}`}
                    style={{ ...skittleCircleBase, backgroundColor: tc.hex, color: contrastText(tc.hex) }}
                  >
                    {role.abbr}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Staleness States -- full 15 color rows */}
      <div className={styles.groupSection}>
        <div className={styles.groupName}>Staleness States</div>
        <div className={styles.groupCount}>Connected, stale, expired -- all 15 colors</div>
        {[
          { label: 'Connected', opacity: 1, filter: 'none', note: 'CoT received within staleness threshold. Full color.' },
          { label: 'Stale', opacity: 0.5, filter: 'none', note: 'No update received past staleness time. Faded to 50% opacity.' },
          { label: 'Expired', opacity: 0.3, filter: 'grayscale(1)', note: 'No update well past threshold. Grayed out, may be removed.' },
        ].map((state) => (
          <div key={state.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ width: 130, fontSize: 12, color: '#DAD4BC', flexShrink: 0 }}>{state.label}</span>
            {TEAM_COLORS.map((tc) => (
              <div key={tc.name} style={{ width: COL_W, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    ...skittleCircleBase,
                    backgroundColor: tc.hex,
                    color: contrastText(tc.hex),
                    opacity: state.opacity,
                    filter: state.filter,
                  }}
                />
              </div>
            ))}
            <span style={{ fontSize: 11, color: '#878787', marginLeft: 8, flexShrink: 0 }}>
              {state.note}
            </span>
          </div>
        ))}
      </div>

      {/* GPS Source Variants */}
      <div className={styles.groupSection}>
        <div className={styles.groupName}>GPS Source Variants</div>
        <div className={styles.groupCount}>
          CoT &quot;how&quot; field: h-e (GPS), h-* (human/device), m-g-l (manual entry with slash)
        </div>
        {[
          { label: 'GPS (h-e)', suffix: '', note: 'Device GPS fix. Standard rendering, no overlay.' },
          { label: 'Human (h-*)', suffix: 'human', note: 'External GPS source (PLI puck, BT GPS, radio). Green dot indicator.' },
          { label: 'Manual (m-g-l)', suffix: 'nogps', note: 'Hand-entered MGRS/lat-lon. Black slash indicates no GPS hardware.' },
        ].map((variant) => (
          <div key={variant.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ width: 130, fontSize: 12, color: '#DAD4BC', flexShrink: 0 }}>
              {variant.label}
            </span>
            {TEAM_COLORS.map((tc) => (
              <div key={tc.name} style={{ width: COL_W, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    ...skittleCircleBase,
                    backgroundColor: tc.hex,
                    color: contrastText(tc.hex),
                    position: 'relative',
                  }}
                >
                {variant.suffix === 'nogps' && (
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} viewBox="0 0 28 28">
                    <line x1="6" y1="22" x2="22" y2="6" stroke="#000" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {variant.suffix === 'human' && (
                  <svg style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10 }} viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="4" fill="#92A844" stroke="#000" strokeWidth="1" />
                  </svg>
                )}
                </div>
              </div>
            ))}
            <span style={{ fontSize: 11, color: '#878787', marginLeft: 8, flexShrink: 0 }}>
              {variant.note}
            </span>
          </div>
        ))}
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
