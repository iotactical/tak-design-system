// rtmx:req REQ-XW-100
import { useEffect, useState, useMemo } from 'react';
import styles from './Explorer.module.css';
import { MilSymRenderer } from '../components/MilSymRenderer';
import bEntitiesData from '../../../data/mil-std-2525/b-entities.json';
import b2dData from '../../../data/mil-std-2525/b2d.json';

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

type TabId = 'browse' | 'decode' | 'build' | 'compare';

const TABS: { id: TabId; label: string }[] = [
  { id: 'browse', label: 'Browse' },
  { id: 'decode', label: 'Decode' },
  { id: 'build', label: 'Build' },
  { id: 'compare', label: 'Compare' },
];

// ----- Helpers -----

function buildSidc15(basic: string, affiliationChar: string): string {
  if (!basic || basic.length < 2) return basic;
  return basic.charAt(0) + affiliationChar + basic.substring(2);
}

function buildDSidc(mapping: B2DMapping, si: string): string {
  return `10${si}0${mapping.d_ss}${mapping.d_ec}${mapping.d_s1}${mapping.d_s2}00`;
}

// ----- Data -----

const bEntities = (bEntitiesData as { entities: BEntity[] }).entities;
const b2dMappings = (b2dData as { mappings: B2DMapping[] }).mappings;

// ----- Browse Tab -----

function BrowsePanel() {
  const [selectedSS, setSelectedSS] = useState('01');
  const [search, setSearch] = useState('');

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
      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search all entities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search MIL-STD-2525 entities"
        />
        {search && (
          <span className={styles.searchCount}>
            {filteredEntities.length} results
          </span>
        )}
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
                <span style={{ fontSize: 11, color: '#585858', marginLeft: 6 }}>
                  ({bEntities.filter((e) => e.ss === code).length})
                </span>
              </button>
            ))}
          </div>
        )}
        <div className={styles.entityGrid}>
          {filteredEntities.map((entity) => (
            <div key={entity.basic} className={styles.entityCard}>
              <MilSymRenderer
                sidc={buildSidc15(entity.basic, 'F')}
                size={36}
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
        const dSidc = buildDSidc(mapping, '30');
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
            <MilSymRenderer sidc={parsed.sidc} size={64} />
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

// ----- Build Tab -----

function BuildPanel() {
  const [si, setSi] = useState('3');
  const [ss, setSs] = useState('10');
  const [status, setStatus] = useState('0');
  const [hqtffd, setHqtffd] = useState('0');
  const [echelon, setEchelon] = useState('00');
  const [entityCode, setEntityCode] = useState('110000');
  const [mod1, setMod1] = useState('00');
  const [mod2, setMod2] = useState('00');

  const sidc = `10${si}${status}${ss}${hqtffd}${echelon}${entityCode}${mod1}${mod2}`;

  const ssEntities = useMemo(() => {
    return b2dMappings.filter((m) => m.d_ss === ss);
  }, [ss]);

  return (
    <div>
      <div className={styles.buildPreview}>
        <MilSymRenderer sidc={sidc} size={64} />
        <div className={styles.buildSidc}>{sidc}</div>
      </div>
      <div className={styles.buildFields}>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Standard Identity</label>
          <select className={styles.buildFieldSelect} value={si} onChange={(e) => setSi(e.target.value)}>
            {Object.entries(STANDARD_IDENTITY_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Symbol Set</label>
          <select className={styles.buildFieldSelect} value={ss} onChange={(e) => { setSs(e.target.value); setEntityCode('110000'); }}>
            {Object.entries(SYMBOL_SET_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Status</label>
          <select className={styles.buildFieldSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>HQ/TF/FD</label>
          <select className={styles.buildFieldSelect} value={hqtffd} onChange={(e) => setHqtffd(e.target.value)}>
            {Object.entries(HQ_TF_FD_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Echelon</label>
          <select className={styles.buildFieldSelect} value={echelon} onChange={(e) => setEchelon(e.target.value)}>
            {Object.entries(ECHELON_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Entity</label>
          <select className={styles.buildFieldSelect} value={entityCode} onChange={(e) => setEntityCode(e.target.value)}>
            {ssEntities.map((m) => (
              <option key={m.d_ec} value={m.d_ec}>{m.label} ({m.d_ec})</option>
            ))}
            {ssEntities.length === 0 && (
              <option value="110000">Default (110000)</option>
            )}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Modifier 1</label>
          <select className={styles.buildFieldSelect} value={mod1} onChange={(e) => setMod1(e.target.value)}>
            <option value="00">None (00)</option>
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Modifier 2</label>
          <select className={styles.buildFieldSelect} value={mod2} onChange={(e) => setMod2(e.target.value)}>
            <option value="00">None (00)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ----- Compare Tab -----

function ComparePanel() {
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search || search.length < 2) return [];
    const lower = search.toLowerCase();
    return b2dMappings
      .filter((m) => m.label.toLowerCase().includes(lower))
      .slice(0, 20);
  }, [search]);

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
      {results.map((mapping) => {
        const bSidc = buildSidc15(mapping.b_sidc, 'F');
        const dSidc = buildDSidc(mapping, '30');
        return (
          <div key={mapping.b_sidc} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#DAD4BC', marginBottom: 8 }}>
              {mapping.label}
            </div>
            <div className={styles.compareGrid}>
              <div className={styles.compareCard}>
                <span className={styles.compareVersion}>2525B</span>
                <MilSymRenderer sidc={bSidc} size={48} />
                <span className={styles.compareSidc}>{bSidc}</span>
              </div>
              <div className={styles.compareCard}>
                <span className={styles.compareVersion}>2525C</span>
                <MilSymRenderer sidc={bSidc} size={48} />
                <span className={styles.compareSidc}>{bSidc}</span>
              </div>
              <div className={styles.compareCard}>
                <span className={styles.compareVersion}>2525D</span>
                <MilSymRenderer sidc={dSidc} size={48} />
                <span className={styles.compareSidc}>{dSidc}</span>
              </div>
              <div className={styles.compareCard}>
                <span className={styles.compareVersion}>2525E</span>
                <MilSymRenderer sidc={dSidc} size={48} />
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
  useEffect(() => { document.title = '2525 Explorer - TAK Design System'; }, []);
  const [activeTab, setActiveTab] = useState<TabId>('browse');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>2525 Explorer</h1>
      <p className={styles.subtitle}>
        Browse, decode, build, and compare MIL-STD-2525 symbology across versions.
      </p>

      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && <BrowsePanel />}
      {activeTab === 'decode' && <DecodePanel />}
      {activeTab === 'build' && <BuildPanel />}
      {activeTab === 'compare' && <ComparePanel />}
    </div>
  );
}
