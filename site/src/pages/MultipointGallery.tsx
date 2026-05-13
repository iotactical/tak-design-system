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

const AFFILIATIONS: { code: string; label: string; char: string }[] = [
  { code: '3', label: 'Friendly', char: '3' },
  { code: '6', label: 'Hostile', char: '6' },
  { code: '4', label: 'Neutral', char: '4' },
  { code: '1', label: 'Unknown', char: '1' },
];

const BADGE_CLASS: Record<string, string> = {
  line: styles.badgeLine,
  area: styles.badgeArea,
  arrow: styles.badgeArrow,
  point: styles.badgePoint,
};

/** Replace the affiliation digit (position 2) in a 20-char SIDC */
function withAffiliation(sidc: string, affiliationChar: string): string {
  if (sidc.length < 20) return sidc;
  return sidc.substring(0, 2) + affiliationChar + sidc.substring(3);
}

/** Default bbox covering the continental US for gallery rendering */
const DEFAULT_BBOX = '-100.0,35.0,-94.0,40.0';
const DEFAULT_SCALE = 500000;

function GalleryCard({
  example,
  affiliation,
}: {
  example: MultipointExample;
  affiliation: string;
}) {
  const { renderMultipoint, ready } = useMultipointWorker();
  const [geojson, setGeojson] = useState<string | null>(null);

  const sidc = withAffiliation(example.sidc, affiliation);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

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
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardName}>{example.name}</div>
        <div className={styles.cardSidc}>{sidc}</div>
        <div className={styles.cardMeta}>
          <span className={`${styles.badge} ${BADGE_CLASS[example.category] || ''}`}>
            {example.category}
          </span>
          <span>
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
  const [affiliation, setAffiliation] = useState('3');

  const filtered = useMemo(() => {
    if (!activeCategory) return MULTIPOINT_EXAMPLES;
    return MULTIPOINT_EXAMPLES.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Multi-Point Graphics</h1>
      <p className={styles.subtitle}>
        Tactical control measures from MIL-STD-2525D Symbol Set 25, rendered via
        mil-sym-ts WebRenderer on MapLibre GL.
      </p>

      <div className={styles.filterRow}>
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

      <div className={styles.affiliationRow}>
        <span className={styles.affiliationLabel}>Affiliation:</span>
        {AFFILIATIONS.map((a) => (
          <button
            key={a.code}
            className={`${styles.filterBtn} ${affiliation === a.code ? styles.filterBtnActive : ''}`}
            onClick={() => setAffiliation(a.code)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <p className={styles.count}>
        {filtered.length} graphic{filtered.length !== 1 ? 's' : ''}
      </p>

      <div className={styles.grid}>
        {filtered.map((example) => (
          <GalleryCard
            key={example.entityCode}
            example={example}
            affiliation={affiliation}
          />
        ))}
      </div>
    </div>
  );
}
