// rtmx:req REQ-XW-088
import { useState, useEffect, useMemo } from 'react';
import { MultipointMap } from '../components/MultipointMap';
import { useMultipointWorker } from '../hooks/useMultipointWorker';
import {
  MULTIPOINT_EXAMPLES,
  MULTIPOINT_CATEGORIES,
  type MultipointExample,
} from '../data/multipoint-examples';
import styles from './MultipointGallery.module.css';

const AFFILIATIONS = [
  { code: '03', label: 'Friendly', color: '#80C0FF' },
  { code: '06', label: 'Hostile', color: '#FF8080' },
  { code: '04', label: 'Neutral', color: '#AAFFAA' },
  { code: '01', label: 'Unknown', color: '#FFFF80' },
] as const;

function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? '#000' : '#fff';
}

const BADGE_CLASS: Record<string, string> = {
  line: styles.badgeLine,
  area: styles.badgeArea,
  arrow: styles.badgeArrow,
  point: styles.badgePoint,
};

/** B-series affiliation letters (position 1 of 15-char SIDC) */
const B_AFFILIATION: Record<string, string> = {
  '03': 'F', '06': 'H', '04': 'N', '01': 'U',
};

/** Apply affiliation to either a D-series (20-char) or B-series (15-char pattern) SIDC */
function withAffiliation(sidc: string, si: string): string {
  if (sidc.length === 15 || sidc.includes('*')) {
    // B-series: replace wildcard at position 1 with affiliation letter
    const letter = B_AFFILIATION[si] || 'F';
    return sidc[0] + letter + sidc.substring(2).replace(/\*/g, '-');
  }
  if (sidc.length >= 20) {
    return sidc.substring(0, 2) + si + sidc.substring(4);
  }
  return sidc;
}

/** Default bbox covering the continental US for gallery rendering */
const DEFAULT_BBOX = '-100.0,35.0,-94.0,40.0';
const DEFAULT_SCALE = 500000;

function GalleryCard({
  example,
  affiliation,
  version,
}: {
  example: MultipointExample;
  affiliation: string;
  version: 'B' | 'C' | 'D' | 'E';
}) {
  const { renderMultipoint, ready } = useMultipointWorker();
  const [geojson, setGeojson] = useState<string | null>(null);

  const baseSidc = (version === 'B' || version === 'C') ? example.bSidc : example.sidc;
  const sidc = withAffiliation(baseSidc, affiliation);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    // Don't pass modifiers/attributes to gallery thumbnails -- WebRenderer
    // embeds raw modifier Maps in GeoJSON output without proper JSON escaping,
    // which breaks strict parsers (Firefox). Graphics render fine without them.
    renderMultipoint(
      sidc,
      example.controlPoints,
      DEFAULT_SCALE,
      DEFAULT_BBOX,
    ).then((result) => {
      if (!cancelled) setGeojson(result);
    });

    return () => { cancelled = true; };
  }, [sidc, example.controlPoints, ready, renderMultipoint]);

  // Compute center from control points
  const center = useMemo((): [number, number] => {
    const pts = example.controlPoints.split(' ').map((p) => {
      const [lon, lat] = p.split(',').map(Number);
      return [lon, lat] as [number, number];
    });
    const avgLon = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const avgLat = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return [avgLon, avgLat];
  }, [example.controlPoints]);

  return (
    <div className={styles.card}>
      <div className={styles.cardMap}>
        <MultipointMap geojson={geojson} center={center} zoom={6} small />
        <span className={`${styles.badge} ${BADGE_CLASS[example.category] || ''}`}>
          {example.category}
        </span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardDesignation}>{example.name}</div>
        <div className={styles.cardMeta}>
          <span className={styles.cardSidc}>{sidc}</span>
          <span className={styles.cardPts}>
            {example.minPoints}
            {example.maxPoints > 0 ? `-${example.maxPoints}` : '+'} pts
          </span>
        </div>
        <div className={styles.cardDesc}>{example.description}</div>
      </div>
    </div>
  );
}

export default function MultipointGallery() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [version, setVersion] = useState<'B' | 'C' | 'D' | 'E'>('E');
  const [affiliation, setAffiliation] = useState('03');

  const filtered = useMemo(() => {
    if (!activeCategory) return MULTIPOINT_EXAMPLES;
    return MULTIPOINT_EXAMPLES.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Tactical Graphics</h1>
      <p className={styles.subtitle}>
        MIL-STD-2525E tactical control measures (Symbol Set 25), rendered via
        mil-sym-ts WebRenderer on MapLibre GL. Defaults to 2525E; select B/C/D
        for earlier versions.
      </p>

      <div className={styles.controlBar}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Version</span>
          <div className={styles.btnGroup}>
            {(['B', 'C', 'D', 'E'] as const).map((v) => (
              <button
                key={v}
                className={`${styles.filterBtn} ${version === v ? styles.filterBtnActive : ''}`}
                onClick={() => setVersion(v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Category</span>
          <div className={styles.btnGroup}>
            <button
              className={`${styles.filterBtn} ${activeCategory === null ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              All
            </button>
            {MULTIPOINT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Affiliation</span>
          <div className={styles.btnGroup}>
            {AFFILIATIONS.map((a) => (
              <button
                key={a.code}
                className={styles.affiliationBtn}
                style={{
                  borderLeftColor: a.color,
                  backgroundColor: affiliation === a.code ? a.color : undefined,
                  color: affiliation === a.code ? contrastText(a.color) : undefined,
                }}
                onClick={() => setAffiliation(a.code)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className={styles.count}>
        {filtered.length} graphic{filtered.length !== 1 ? 's' : ''}
        {(version === 'B' || version === 'C') && ' (B/C use 15-char SIDCs)'}
        {version === 'D' && ' (D uses 20-char SIDCs)'}
      </p>

      <div className={styles.grid}>
        {filtered.map((example) => (
          <GalleryCard
            key={example.entityCode + version}
            example={example}
            affiliation={affiliation}
            version={version}
          />
        ))}
      </div>
    </div>
  );
}
