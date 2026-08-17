// rtmx:req REQ-XW-092
// rtmx:req REQ-XW-093
// rtmx:req REQ-XW-100
// rtmx:req REQ-XW-105
// rtmx:req REQ-XW-106
// rtmx:req REQ-XW-121
// rtmx:req REQ-XW-140
import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHighlight } from '../hooks/useHighlight';
import styles from './Explorer.module.css';
import { MilSymRenderer } from '../components/MilSymRenderer';
import { lazy, Suspense } from 'react';
const ControlMeasuresPanel = lazy(() => import('../components/ControlMeasuresPanel'));
import bEntitiesData from '../../../data/mil-std-2525/b-entities.json';
import b2dData from '../../../data/mil-std-2525/b2d.json';
import b2cData from '../../../data/mil-std-2525/b2c.json';

// ----- Types -----

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

interface B2CMapping {
  b_sidc: string;
  c_sidc: string;
  match_type: string;
}

// ----- Constants -----

const SYMBOL_SET_NAMES: Record<string, string> = {
  '01': 'Air',
  '02': 'Air Missile',
  '05': 'Space',
  '10': 'Land Unit',
  '11': 'Land Civilian',
  '15': 'Land Equipment',
  '20': 'Land Installation',
  '25': 'Control Measures',
  '30': 'Sea Surface',
  '35': 'Sea Subsurface',
  '36': 'Mine Warfare',
  '40': 'Activities',
};

const STANDARD_IDENTITY_NAMES: Record<string, string> = {
  '0': 'Pending',
  '1': 'Unknown',
  '2': 'Assumed Friend',
  '3': 'Friend',
  '4': 'Neutral',
  '5': 'Suspect/Joker',
  '6': 'Hostile/Faker',
};

const STATUS_NAMES: Record<string, string> = {
  '0': 'Present',
  '1': 'Planned/Anticipated',
};

const ECHELON_NAMES: Record<string, string> = {
  '00': 'Unspecified',
  '11': 'Team/Crew',
  '12': 'Squad',
  '13': 'Section',
  '14': 'Platoon',
  '15': 'Company/Battery',
  '16': 'Battalion/Squadron',
  '17': 'Regiment/Group',
  '18': 'Brigade',
  '19': 'Division',
  '20': 'Corps',
  '21': 'Army',
  '22': 'Front',
  '23': 'Region',
  '24': 'Command',
};

const HQ_TF_FD_NAMES: Record<string, string> = {
  '0': 'Not Applicable',
  '1': 'Feint/Dummy',
  '2': 'Headquarters',
  '3': 'Feint/Dummy HQ',
  '4': 'Task Force',
  '5': 'Feint/Dummy TF',
  '6': 'Task Force HQ',
  '7': 'Feint/Dummy TF HQ',
};

type TabId = 'browse' | 'decode' | 'compare' | 'control-measures';

const TABS: { id: TabId; label: string }[] = [
  { id: 'browse', label: 'Browse' },
  { id: 'decode', label: 'Decode' },
  { id: 'compare', label: 'Compare' },
  { id: 'control-measures', label: 'Control Measures' },
];

// ----- Helpers -----

/** D/E echelon code -> B/C position 11 character */
const ECHELON_D_TO_BC: Record<string, string> = {
  '00': '-', '11': 'A', '12': 'B', '13': 'C', '14': 'D',
  '15': 'E', '16': 'F', '17': 'G', '18': 'H', '21': 'I',
  '22': 'J', '23': 'K', '24': 'L', '25': 'M', '26': 'N',
};

/** D/E HQ/TF/FD code -> B/C position 12 character */
const HQTFFD_D_TO_BC: Record<string, string> = {
  '0': '-', '1': 'D', '2': 'A', '3': 'E', '4': 'C', '5': 'F', '6': 'B', '7': 'G',
};

function buildSidc15(basic: string, affiliationChar: string, echelon?: string, hqtffd?: string): string {
  if (!basic || basic.length < 2) return basic;
  let sidc = basic.charAt(0) + affiliationChar + basic.substring(2);
  if (sidc.charAt(3) === '*') {
    sidc = sidc.substring(0, 3) + 'P' + sidc.substring(4);
  }
  sidc = sidc.replace(/\*/g, '-');
  // Encode echelon at position 11 and HQ/TF/FD at position 12
  if (echelon || hqtffd) {
    const pos11 = (echelon && ECHELON_D_TO_BC[echelon]) || sidc.charAt(10);
    const pos12 = (hqtffd && HQTFFD_D_TO_BC[hqtffd]) || sidc.charAt(11);
    sidc = sidc.substring(0, 10) + pos11 + pos12 + sidc.substring(12);
  }
  return sidc;
}

function buildDSidc(mapping: B2DMapping, si: string): string {
  // 20-char: version(2) + context(1) + SI(1) + SS(2) + status(1) + HQ(1) + echelon(2) + entity(6) + mod1(2) + mod2(2)
  return `100${si}${mapping.d_ss}0000${mapping.d_ec}${mapping.d_s1}${mapping.d_s2}`;
}

// ----- Data -----

const bEntities = (bEntitiesData as { entities: BEntity[] }).entities;
const b2dMappings = (b2dData as { mappings: B2DMapping[] }).mappings;
const b2cMappings = b2cData as B2CMapping[];

// ----- Modifier Helpers -----

interface ModifierOption {
  value: string;
  label: string;
}

function getModifierOptions(symbolSet: string, field: 's1' | 's2'): ModifierOption[] {
  const key = field === 's1' ? 'd_s1' : 'd_s2';
  const seen = new Map<string, string>();
  seen.set('00', 'None');
  for (const m of b2dMappings) {
    if (m.d_ss !== symbolSet) continue;
    const val = m[key];
    if (val === '00' || seen.has(val)) continue;
    seen.set(val, `${val} - ${m.label}`);
  }
  return Array.from(seen.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, label]) => ({ value, label }));
}

function findB2DMapping(entity: BEntity): B2DMapping | undefined {
  return b2dMappings.find((m) => m.d_ss === entity.ss && m.d_ec === entity.ec);
}

function buildDSidcFromEntity(entity: BEntity, si: string, s1: string, s2: string): string {
  // 20-char: version(2) + context(1) + SI(1) + SS(2) + status(1) + HQ(1) + echelon(2) + entity(6) + mod1(2) + mod2(2)
  return `100${si}${entity.ss}0000${entity.ec}${s1}${s2}`;
}

// ----- Modifier Inspector -----

function ModifierInspector({
  entity, affiliation, onClose,
}: {
  entity: BEntity;
  affiliation: typeof BROWSE_AFFILIATIONS[number];
  onClose: () => void;
}) {
  const [s1, setS1] = useState('00');
  const [s2, setS2] = useState('00');
  const b2dMapping = useMemo(() => findB2DMapping(entity), [entity]);
  const siDigit = useMemo(() => {
    switch (affiliation.key) {
      case 'friendly': return '3';
      case 'hostile': return '6';
      case 'neutral': return '4';
      case 'unknown': return '1';
      default: return '3';
    }
  }, [affiliation]);
  const s1Options = useMemo(() => getModifierOptions(entity.ss, 's1'), [entity.ss]);
  const s2Options = useMemo(() => getModifierOptions(entity.ss, 's2'), [entity.ss]);
  const dSidc = useMemo(() => buildDSidcFromEntity(entity, siDigit, s1, s2), [entity, siDigit, s1, s2]);
  const hasModifiers = s1Options.length > 1 || s2Options.length > 1;

  useEffect(() => {
    if (b2dMapping) { setS1(b2dMapping.d_s1); setS2(b2dMapping.d_s2); }
    else { setS1('00'); setS2('00'); }
  }, [b2dMapping]);

  return (
    <div className={styles.inspectorPanel} data-testid="modifier-inspector">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#DAD4BC' }}>{entity.label}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#878787', cursor: 'pointer', fontSize: 16 }} aria-label="Close inspector">X</button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <MilSymRenderer sidc={dSidc} size={72} label={entity.label} />
        <div style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: '#878787', marginTop: 4 }}>{dSidc}</div>
        <div style={{ fontSize: 10, color: '#787878' }}>D/E 20-char SIDC</div>
      </div>
      <div style={{ fontSize: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #2E2E2E' }}>
          <span style={{ color: '#878787' }}>Symbol Set</span>
          <span style={{ color: '#DAD4BC' }}>{SYMBOL_SET_NAMES[entity.ss] || entity.ss} ({entity.ss})</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #2E2E2E' }}>
          <span style={{ color: '#878787' }}>Entity Code</span>
          <span style={{ color: '#DAD4BC' }}>{entity.ec}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #2E2E2E' }}>
          <span style={{ color: '#878787' }}>B SIDC</span>
          <span style={{ color: '#DAD4BC', fontFamily: "'Roboto Mono', monospace", fontSize: 11 }}>{entity.basic}</span>
        </div>
        {b2dMapping && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ color: '#878787' }}>Crosswalk</span>
            <span style={{ color: b2dMapping.lossy ? '#ffb300' : '#4caf50' }}>
              {b2dMapping.lossy ? 'D/E Adds Modifiers' : '1:1 Match'}
            </span>
          </div>
        )}
      </div>
      {hasModifiers ? (
        <div data-testid="modifier-controls">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#c8a951', marginBottom: 8 }}>Sector Modifiers</div>
          {s1Options.length > 1 && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, color: '#878787', display: 'block', marginBottom: 4 }}>Modifier 1 (s1) -- positions 17-18</label>
              <select data-testid="modifier-s1-select" value={s1} onChange={(e) => setS1(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 4, color: '#DAD4BC', fontSize: 12 }}>
                {s1Options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          )}
          {s2Options.length > 1 && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, color: '#878787', display: 'block', marginBottom: 4 }}>Modifier 2 (s2) -- positions 19-20</label>
              <select data-testid="modifier-s2-select" value={s2} onChange={(e) => setS2(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', background: '#1A1A1A', border: '1px solid #2E2E2E', borderRadius: 4, color: '#DAD4BC', fontSize: 12 }}>
                {s2Options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#787878', fontStyle: 'italic' }}>No sector modifiers available for this symbol set.</div>
      )}
    </div>
  );
}

// ----- Browse Tab -----

const BROWSE_AFFILIATIONS = [
  { key: 'friendly', label: 'Friendly', color: '#80C0FF' },
  { key: 'hostile', label: 'Hostile', color: '#FF8080' },
  { key: 'neutral', label: 'Neutral', color: '#AAFFAA' },
  { key: 'unknown', label: 'Unknown', color: '#FFFF80' },
] as const;

function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? '#000' : '#FFF';
}

function BrowsePanel() {
  const [selectedSS, setSelectedSS] = useState('01');
  const [search, setSearch] = useState('');
  const [affiliation, setAffiliation] = useState<typeof BROWSE_AFFILIATIONS[number]>(BROWSE_AFFILIATIONS[0]);
  const [inspectedEntity, setInspectedEntity] = useState<BEntity | null>(null);

  const symbolSets = useMemo(() => {
    return Object.entries(SYMBOL_SET_NAMES).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  const filteredEntities = useMemo(() => {
    const lower = search.toLowerCase();
    let entities = bEntities;
    if (lower) {
      entities = entities.filter((e) => e.label.toLowerCase().includes(lower));
    }
    if (!lower) {
      entities = entities.filter((e) => e.ss === selectedSS);
    }
    return entities;
  }, [search, selectedSS]);

  const entityCount = useMemo(() => {
    return bEntities.filter((e) => e.ss === selectedSS).length;
  }, [selectedSS]);

  return (
    <div>
      <div className={styles.controlBar}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Affiliation</span>
          <div className={styles.affiliationGroup}>
            {BROWSE_AFFILIATIONS.map((a) => (
              <button
                key={a.key}
                className={styles.affiliationBtn}
                style={{
                  borderLeftColor: a.color,
                  backgroundColor: affiliation.key === a.key ? a.color : undefined,
                  color: affiliation.key === a.key ? contrastText(a.color) : undefined,
                }}
                onClick={() => setAffiliation(a)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search all entities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search MIL-STD-2525 entities"
          style={{ flex: 1, minWidth: 200 }}
        />
        <span className={styles.searchCount} aria-live="polite" aria-atomic="true">
          {search ? `${filteredEntities.length} results` : ''}
        </span>
      </div>
      <div className={styles.browseLayout}>
        {!search && (
          <div className={styles.symbolSetList}>
            {symbolSets.map(([code, name]) => (
              <button
                key={code}
                className={`${styles.symbolSetItem} ${selectedSS === code ? styles.symbolSetItemActive : ''}`}
                onClick={() => setSelectedSS(code)}
              >
                {name}
                <span style={{ fontSize: 11, color: '#787878', marginLeft: 6 }}>
                  ({bEntities.filter((e) => e.ss === code).length})
                </span>
              </button>
            ))}
          </div>
        )}
        <div className={styles.entityGrid}>
          {filteredEntities.map((entity) => (
            <div
              key={entity.basic}
              className={styles.entityCard}
              data-highlight={entity.label}
              onClick={() => setInspectedEntity(inspectedEntity?.basic === entity.basic ? null : entity)}
              style={{
                cursor: 'pointer',
                borderColor: inspectedEntity?.basic === entity.basic ? '#c8a951' : undefined,
              }}
            >
              <MilSymRenderer
                sidc={entity.basic} affiliation={affiliation.key as any}
                size={36} label={entity.label}
              />
              <div className={styles.entityLabel} title={entity.label}>
                {entity.label}
              </div>
              <div className={styles.entitySidc}>{entity.basic}</div>
            </div>
          ))}
          {filteredEntities.length === 0 && (
            <div className={styles.emptyState}>No entities found.</div>
          )}
        </div>
        {inspectedEntity && (
          <ModifierInspector
            entity={inspectedEntity}
            affiliation={affiliation}
            onClose={() => setInspectedEntity(null)}
          />
        )}
      </div>
    </div>
  );
}

// ----- Decode Tab -----

function DecodePanel() {
  const [input, setInput] = useState('');

  const parsed = useMemo(() => {
    const sidc = input.replace(/\s/g, '').toUpperCase();
    if (sidc.length === 20) {
      // D/E 20-char format
      const version = sidc.substring(0, 2);
      const versionLabel = version === '10' ? 'D' : version === '11' ? 'E' : version;
      return {
        valid: true,
        format: 'D/E (20-char)',
        sidc,
        fields: [
          { name: 'Version', value: sidc.substring(0, 2), label: versionLabel },
          { name: 'Standard Identity', value: sidc.substring(2, 4), label: STANDARD_IDENTITY_NAMES[sidc.charAt(2)] || sidc.substring(2, 4) },
          { name: 'Symbol Set', value: sidc.substring(4, 6), label: SYMBOL_SET_NAMES[sidc.substring(4, 6)] || sidc.substring(4, 6) },
          { name: 'Status', value: sidc.charAt(6), label: STATUS_NAMES[sidc.charAt(6)] || sidc.charAt(6) },
          { name: 'HQ/TF/FD', value: sidc.charAt(7), label: HQ_TF_FD_NAMES[sidc.charAt(7)] || sidc.charAt(7) },
          { name: 'Echelon', value: sidc.substring(8, 10), label: ECHELON_NAMES[sidc.substring(8, 10)] || sidc.substring(8, 10) },
          { name: 'Entity', value: sidc.substring(10, 16), label: sidc.substring(10, 16) },
          { name: 'Modifier 1', value: sidc.substring(16, 18), label: sidc.substring(16, 18) },
          { name: 'Modifier 2', value: sidc.substring(18, 20), label: sidc.substring(18, 20) },
        ],
      };
    }
    if (sidc.length === 15) {
      // B/C 15-char format
      return {
        valid: true,
        format: 'B/C (15-char)',
        sidc,
        fields: [
          { name: 'Coding Scheme', value: sidc.charAt(0), label: sidc.charAt(0) },
          { name: 'Affiliation', value: sidc.charAt(1), label: sidc.charAt(1) },
          { name: 'Battle Dimension', value: sidc.charAt(2), label: sidc.charAt(2) },
          { name: 'Status', value: sidc.charAt(3), label: sidc.charAt(3) },
          { name: 'Function ID', value: sidc.substring(4, 10), label: sidc.substring(4, 10) },
          { name: 'Symbol Modifier', value: sidc.substring(10, 12), label: sidc.substring(10, 12) },
          { name: 'Country Code', value: sidc.substring(12, 14), label: sidc.substring(12, 14) },
          { name: 'Order of Battle', value: sidc.charAt(14), label: sidc.charAt(14) },
        ],
      };
    }
    return null;
  }, [input]);

  // Crosswalk: find equivalent SIDCs
  const crosswalk = useMemo(() => {
    if (!parsed || !parsed.valid) return null;
    const sidc = parsed.sidc;

    if (sidc.length === 15) {
      // B format -- find D equivalent
      const bPattern = sidc.charAt(0) + '*' + sidc.substring(2);
      const mapping = b2dMappings.find((m) => {
        const mNorm = m.b_sidc;
        if (mNorm.length !== bPattern.length) return false;
        for (let i = 0; i < mNorm.length; i++) {
          if (mNorm[i] === '*' || bPattern[i] === '*') continue;
          if (mNorm[i] !== bPattern[i]) return false;
        }
        return true;
      });
      if (mapping) {
        const dSidc = buildDSidc(mapping, '3');
        return { bSidc: sidc, dSidc, label: mapping.label };
      }
    }

    if (sidc.length === 20) {
      // D format -- find B equivalent
      const ss = sidc.substring(4, 6);
      const ec = sidc.substring(10, 16);
      const mapping = b2dMappings.find((m) => m.d_ss === ss && m.d_ec === ec);
      if (mapping) {
        const bSidc = buildSidc15(mapping.b_sidc, 'F');
        return { bSidc, dSidc: sidc, label: mapping.label };
      }
    }

    return null;
  }, [parsed]);

  return (
    <div>
      <input
        className={styles.decodeInput}
        type="text"
        placeholder="Paste a SIDC (15 or 20 chars)..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="SIDC input"
      />
      {parsed && (
        <div className={styles.decodeResult}>
          <div className={styles.fieldTable}>
            <div className={styles.fieldRow}>
              <span className={styles.fieldName}>Format</span>
              <span className={styles.fieldValue}>{parsed.format}</span>
            </div>
            {parsed.fields.map((f) => (
              <div key={f.name} className={styles.fieldRow}>
                <span className={styles.fieldName}>{f.name}</span>
                <span className={styles.fieldValue}>
                  {f.value}
                  {f.label !== f.value && (
                    <span style={{ color: '#878787', marginLeft: 8 }}>({f.label})</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.symbolPreview}>
            <MilSymRenderer sidc={parsed.sidc} size={64} label={crosswalk?.label} />
            <div className={styles.entitySidc}>{parsed.sidc}</div>
          </div>
        </div>
      )}
      {parsed && crosswalk && (
        <div className={styles.crosswalkSection}>
          <div className={styles.crosswalkTitle}>Crosswalk: {crosswalk.label}</div>
          <div className={styles.crosswalkRow}>
            <span className={styles.crosswalkVersion}>B/C</span>
            <span className={styles.crosswalkSidc}>{crosswalk.bSidc}</span>
          </div>
          <div className={styles.crosswalkRow}>
            <span className={styles.crosswalkVersion}>D/E</span>
            <span className={styles.crosswalkSidc}>{crosswalk.dSidc}</span>
          </div>
        </div>
      )}
      {!parsed && input.length > 0 && (
        <div className={styles.emptyState}>
          Enter a valid 15-character (B/C) or 20-character (D/E) SIDC.
        </div>
      )}
    </div>
  );
}

// ----- Compare helpers -----

/** Match B SIDC patterns using wildcard '*' at affiliation position */
function matchBSidc(pattern: string, candidate: string): boolean {
  if (pattern.length !== candidate.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '*' || candidate[i] === '*') continue;
    if (pattern[i] !== candidate[i]) return false;
  }
  return true;
}

// ----- Compare Tab -----

/** Determine crosswalk confidence for a B->D mapping */
function getConfidence(mapping: B2DMapping): 'exact' | 'modifier' | 'unverified' {
  // If lossy, the mapping required modifier-level approximation
  if (mapping.lossy) return 'modifier';
  // Check if there's a matching b2c entry (verified chain B->C->D)
  const hasB2C = b2cMappings.some((m) => matchBSidc(m.b_sidc, mapping.b_sidc));
  if (hasB2C) return 'exact';
  return 'unverified';
}

const CONFIDENCE_COLORS: Record<string, string> = {
  exact: '#4caf50',
  modifier: '#ffb300',
  unverified: '#ef5350',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  exact: '1:1 Match',
  modifier: 'D/E Adds Modifiers',
  unverified: 'Unmapped',
};

function ComparePanel() {
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search || search.length < 2) return [];
    const lower = search.toLowerCase();
    return b2dMappings
      .filter((m) => m.label.toLowerCase().includes(lower))
      .slice(0, 20);
  }, [search]);

  // Confidence summary counts for current results
  const confidenceCounts = useMemo(() => {
    const counts = { exact: 0, modifier: 0, unverified: 0 };
    for (const mapping of results) {
      counts[getConfidence(mapping)]++;
    }
    return counts;
  }, [results]);

  return (
    <div>
      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search entity by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search entity for comparison"
        />
      </div>
      {results.length > 0 && (
        <div
          data-testid="confidence-summary"
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 16,
            padding: '8px 12px',
            background: '#1e1e1e',
            borderRadius: 6,
            fontSize: 13,
          }}
        >
          <span style={{ color: CONFIDENCE_COLORS.exact }}>
            {confidenceCounts.exact} 1:1
          </span>
          <span style={{ color: CONFIDENCE_COLORS.modifier }}>
            {confidenceCounts.modifier} modifier
          </span>
          {confidenceCounts.unverified > 0 && (
            <span style={{ color: CONFIDENCE_COLORS.unverified }}>
              {confidenceCounts.unverified} unmapped
            </span>
          )}
        </div>
      )}
      {results.map((mapping) => {
        const dSidc = buildDSidc(mapping, '3');
        const confidence = getConfidence(mapping);
        return (
          <div key={mapping.b_sidc} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#DAD4BC', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              {mapping.label}
              <span
                data-testid="confidence-badge"
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 3,
                  background: CONFIDENCE_COLORS[confidence],
                  color: '#000',
                  fontWeight: 600,
                }}
              >
                {CONFIDENCE_LABELS[confidence]}
              </span>
            </div>
            <div className={styles.compareGrid}>
              <div className={styles.compareCard}>
                <span className={styles.compareVersion}>2525B</span>
                <MilSymRenderer sidc={mapping.b_sidc} affiliation="friendly" size={48} label={mapping.label} />
                <span className={styles.compareSidc}>{mapping.b_sidc}</span>
              </div>
              <div className={styles.compareCard}>
                <span className={styles.compareVersion}>2525C</span>
                <MilSymRenderer sidc={mapping.b_sidc} affiliation="friendly" size={48} label={mapping.label} />
                <span className={styles.compareSidc}>{mapping.b_sidc}</span>
              </div>
              <div className={styles.compareCard}>
                <span className={styles.compareVersion}>2525D</span>
                <MilSymRenderer sidc={mapping.b_sidc} affiliation="friendly" size={48} label={mapping.label} />
                <span className={styles.compareSidc}>{dSidc}</span>
              </div>
              <div className={styles.compareCard}>
                <span className={styles.compareVersion}>2525E</span>
                <MilSymRenderer sidc={mapping.b_sidc} affiliation="friendly" size={48} label={mapping.label} />
                <span className={styles.compareSidc}>{dSidc}</span>
              </div>
            </div>
          </div>
        );
      })}
      {search.length >= 2 && results.length === 0 && (
        <div className={styles.emptyState}>No entities match your search.</div>
      )}
      {search.length < 2 && (
        <div className={styles.emptyState}>
          Type at least 2 characters to search for an entity and compare across versions.
        </div>
      )}
    </div>
  );
}

// ----- Main Component -----

export default function Explorer() {
  const { tab } = useParams();
  const navigate = useNavigate();

  useEffect(() => { document.title = '2525 Explorer - TAK Design System'; }, []);
  useHighlight();
  const activeTab: TabId = (tab && ['browse', 'decode', 'compare', 'control-measures'].includes(tab) ? tab : 'browse') as TabId;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>2525 Explorer</h1>
      <p className={styles.subtitle}>
        Browse, decode, and compare MIL-STD-2525 symbology across versions. Construct SIDCs in the Symbol Sandbox.
      </p>

      <div className={styles.tabBar} role="tablist" aria-label="2525 Explorer tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`explorer-tab-${t.id}`}
            role="tab"
            aria-selected={activeTab === t.id}
            aria-controls={`explorer-panel-${t.id}`}
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
            onClick={() => navigate(`/explorer/${t.id}`)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id={`explorer-panel-${activeTab}`} role="tabpanel" aria-labelledby={`explorer-tab-${activeTab}`}>
        {activeTab === 'browse' && <BrowsePanel />}
        {activeTab === 'decode' && <DecodePanel />}
        {activeTab === 'compare' && <ComparePanel />}
        {activeTab === 'control-measures' && (
          <Suspense fallback={<div style={{ color: '#878787', padding: 24 }}>Loading...</div>}>
            <ControlMeasuresPanel />
          </Suspense>
        )}
      </div>
    </div>
  );
}
