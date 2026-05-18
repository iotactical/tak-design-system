// rtmx:req REQ-XW-088
// rtmx:req REQ-SITE-021
import { useState, useEffect, useMemo, useCallback, useRef, type RefObject } from 'react';
import {
  MultipointMap,
  THUMBNAIL_STYLE,
  GEOJSON_SOURCE_ID,
  addGeoJsonLayers,
  loadMaplibre,
  computeBounds,
} from '../components/MultipointMap';
import { useMultipointWorker } from '../hooks/useMultipointWorker';
import {
  MULTIPOINT_EXAMPLES,
  MULTIPOINT_CATEGORIES,
  type MultipointExample,
} from '../data/multipoint-examples';
import styles from './MultipointGallery.module.css';
import { LoadingCenter } from '../components/Spinner';

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
const DEFAULT_SCALE = 5000000;
/**
 * Pixel dimensions for RenderSymbol2D must match the geographic aspect ratio
 * of the bbox to avoid stretching decorations. The bbox is 6 deg lon x 5 deg
 * lat. At ~37.5 deg latitude, 1 deg lon ~ 88 km, 1 deg lat ~ 111 km, giving
 * a geographic extent of ~528 x 555 km (roughly square). We use square pixel
 * dimensions; MapLibre crops to the card viewport independently.
 */
const THUMBNAIL_PX_WIDTH = 400;
const THUMBNAIL_PX_HEIGHT = 420;

// ---------- Single-map thumbnail renderer ----------
// Uses one off-screen MapLibre instance to render all gallery thumbnails
// sequentially, capturing each as a static PNG data URL. This avoids the
// "Too many active WebGL contexts" browser limit.

type ThumbnailRequest = {
  geojson: string;
  resolve: (dataUrl: string) => void;
  reject: (err: Error) => void;
};

let thumbnailQueue: ThumbnailRequest[] = [];
let thumbnailProcessing = false;
let thumbnailMap: InstanceType<typeof import('maplibre-gl').Map> | null = null;
let thumbnailContainer: HTMLDivElement | null = null;

async function ensureThumbnailMap() {
  if (thumbnailMap) return thumbnailMap;
  const maplibregl = await loadMaplibre();
  thumbnailContainer = document.createElement('div');
  thumbnailContainer.style.width = '520px';
  thumbnailContainer.style.height = '300px';
  // Position off-screen but keep visible -- MapLibre won't render if the
  // container has visibility:hidden or display:none.
  thumbnailContainer.style.position = 'fixed';
  thumbnailContainer.style.left = '-9999px';
  thumbnailContainer.style.top = '-9999px';
  thumbnailContainer.style.opacity = '0';
  thumbnailContainer.style.pointerEvents = 'none';
  document.body.appendChild(thumbnailContainer);

  // preserveDrawingBuffer is required for canvas.toDataURL() but isn't in
  // MapLibre's strict TS types -- cast to pass it through.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = new maplibregl.Map({
    container: thumbnailContainer,
    style: THUMBNAIL_STYLE,
    center: [-98.5, 39.8],
    zoom: 6,
    interactive: false,
    preserveDrawingBuffer: true,
    attributionControl: false,
  } as any);

  await new Promise<void>((resolve) => map.on('load', () => resolve()));
  addGeoJsonLayers(map, true);
  thumbnailMap = map;
  return map;
}

async function processThumbnailQueue() {
  if (thumbnailProcessing) return;
  thumbnailProcessing = true;

  try {
    const map = await ensureThumbnailMap();
    while (thumbnailQueue.length > 0) {
      const req = thumbnailQueue.shift()!;
      try {
        const parsed = JSON.parse(req.geojson);
        const source = map.getSource(GEOJSON_SOURCE_ID) as import('maplibre-gl').GeoJSONSource;
        source.setData(parsed);

        // Fit the camera to the GeoJSON bounding box so all graphics
        // are fully visible within the thumbnail.
        const bounds = computeBounds(parsed);
        if (bounds) {
          map.fitBounds(bounds, { padding: 80, animate: false });
        }

        await new Promise<void>((resolve) => {
          map.once('idle', () => resolve());
        });

        const dataUrl = map.getCanvas().toDataURL('image/png');
        req.resolve(dataUrl);
      } catch (err) {
        req.reject(err as Error);
      }
    }
  } finally {
    thumbnailProcessing = false;
  }
}

function requestThumbnail(geojson: string): Promise<string> {
  return new Promise((resolve, reject) => {
    thumbnailQueue.push({ geojson, resolve, reject });
    processThumbnailQueue();
  });
}

function destroyThumbnailMap() {
  if (thumbnailMap) {
    thumbnailMap.remove();
    thumbnailMap = null;
  }
  if (thumbnailContainer) {
    document.body.removeChild(thumbnailContainer);
    thumbnailContainer = null;
  }
  thumbnailQueue = [];
}

/** Compute center from control points string */
function computeCenter(cp: string): [number, number] {
  const pts = cp.split(' ').map((p) => {
    const [lon, lat] = p.split(',').map(Number);
    return [lon, lat] as [number, number];
  });
  const avgLon = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const avgLat = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return [avgLon, avgLat];
}

/** Detect mobile viewport */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < breakpoint,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

/** Hook: returns true once the element referenced by ref scrolls into view */
function useInView(ref: RefObject<HTMLElement | null>, rootMargin = '200px'): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/** Wrapper that defers GalleryCard rendering until the card scrolls into view */
function LazyGalleryCard(props: {
  example: MultipointExample;
  affiliation: string;
  version: 'B' | 'C' | 'D' | 'E';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <div ref={ref} className={styles.card} data-testid="gallery-card" style={{ minHeight: 220 }}>
      {inView ? <GalleryCardInner {...props} containerRef={ref} /> : null}
    </div>
  );
}

function GalleryCardInner({
  example,
  affiliation,
  version,
  containerRef: _containerRef,
}: {
  example: MultipointExample;
  affiliation: string;
  version: 'B' | 'C' | 'D' | 'E';
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const { renderMultipoint, ready, unsupported } = useMultipointWorker();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const baseSidc = (version === 'B' || version === 'C') ? example.bSidc : example.sidc;
  const sidc = withAffiliation(baseSidc, affiliation);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setThumbnailUrl(null);

    renderMultipoint(
      sidc,
      example.controlPoints,
      DEFAULT_SCALE,
      DEFAULT_BBOX,
      example.modifiers,
      example.attributes,
      THUMBNAIL_PX_WIDTH,
      THUMBNAIL_PX_HEIGHT,
    )
      .then((geojson) => {
        if (cancelled || !geojson) return;
        return requestThumbnail(geojson);
      })
      .then((dataUrl) => {
        if (!cancelled && dataUrl) setThumbnailUrl(dataUrl);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [sidc, example.controlPoints, example.modifiers, example.attributes, ready, renderMultipoint]);

  return (
    <>
      <div className={styles.cardMap}>
        {unsupported ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: '100%', background: '#1a1a2e', color: '#888',
            fontSize: '0.8rem', textAlign: 'center', padding: '1rem',
          }}>
            Tactical graphics rendering requires a browser with Web Worker support.
            Try Chrome, Firefox, or Safari.
          </div>
        ) : !thumbnailUrl ? (
          <LoadingCenter size={20} />
        ) : (
          <img
            src={thumbnailUrl}
            alt={example.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
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
    </>
  );
}

/** Mobile single-map viewer: one large map + scrollable list */
function MobileGallery({
  filtered,
  affiliation,
  version,
}: {
  filtered: MultipointExample[];
  affiliation: string;
  version: 'B' | 'C' | 'D' | 'E';
}) {
  const { renderMultipoint, ready, unsupported } = useMultipointWorker();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [geojson, setGeojson] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const searchFiltered = useMemo(() => {
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (e) => e.name.toLowerCase().includes(q) || e.entityCode.toLowerCase().includes(q),
    );
  }, [filtered, search]);

  const selected = searchFiltered[selectedIdx] || searchFiltered[0];

  const baseSidc = selected
    ? (version === 'B' || version === 'C') ? selected.bSidc : selected.sidc
    : '';
  const sidc = selected ? withAffiliation(baseSidc, affiliation) : '';

  useEffect(() => {
    if (!ready || !selected) { setGeojson(null); return; }
    let cancelled = false;
    setGeojson(null);
    renderMultipoint(
      sidc,
      selected.controlPoints,
      DEFAULT_SCALE,
      DEFAULT_BBOX,
      selected.modifiers,
      selected.attributes,
      THUMBNAIL_PX_WIDTH,
      THUMBNAIL_PX_HEIGHT,
    ).then((result) => {
      if (!cancelled) setGeojson(result);
    });
    return () => { cancelled = true; };
  }, [sidc, selected, selected?.modifiers, selected?.attributes, ready, renderMultipoint]);

  const center = useMemo(
    () => selected ? computeCenter(selected.controlPoints) : [-98.5, 39.8] as [number, number],
    [selected],
  );

  // Reset selection when filter changes
  useEffect(() => { setSelectedIdx(0); }, [searchFiltered.length]);

  const handleSelect = useCallback((idx: number) => {
    setSelectedIdx(idx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.mobileLayout}>
      <div className={styles.mobileMap}>
        {unsupported ? (
          <div className={styles.mobileUnsupported}>
            Tactical graphics rendering requires Web Worker support.
          </div>
        ) : !geojson ? (
          <LoadingCenter size={24} />
        ) : (
          <MultipointMap geojson={geojson} center={center} zoom={6} small />
        )}
      </div>
      {selected && (
        <div className={styles.mobileSelected}>
          <span className={styles.mobileSelectedName}>{selected.name}</span>
          <span className={`${styles.badge} ${styles.badgeInline} ${BADGE_CLASS[selected.category] || ''}`}>
            {selected.category}
          </span>
          <div className={styles.cardMeta}>
            <span className={styles.cardSidc}>{sidc}</span>
            <span className={styles.cardPts}>
              {selected.minPoints}
              {selected.maxPoints > 0 ? `-${selected.maxPoints}` : '+'} pts
            </span>
          </div>
          <div className={styles.cardDesc}>{selected.description}</div>
        </div>
      )}
      <input
        type="text"
        className={styles.mobileSearch}
        placeholder="Search graphics..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className={styles.mobileList}>
        {searchFiltered.map((ex, i) => (
          <button
            key={ex.entityCode}
            className={`${styles.mobileListItem} ${i === selectedIdx ? styles.mobileListItemActive : ''}`}
            onClick={() => handleSelect(i)}
          >
            <span className={styles.mobileListName}>{ex.name}</span>
            <span className={`${styles.badge} ${styles.badgeInline} ${BADGE_CLASS[ex.category] || ''}`}>
              {ex.category}
            </span>
          </button>
        ))}
        {searchFiltered.length === 0 && (
          <div className={styles.mobileListEmpty}>No matching graphics</div>
        )}
      </div>
    </div>
  );
}

export default function MultipointGallery() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [version, setVersion] = useState<'B' | 'C' | 'D' | 'E'>('E');
  const [affiliation, setAffiliation] = useState('03');
  const isMobile = useIsMobile();

  // Clean up the shared thumbnail renderer when the gallery unmounts
  useEffect(() => {
    return () => destroyThumbnailMap();
  }, []);

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

      {isMobile ? (
        <MobileGallery
          filtered={filtered}
          affiliation={affiliation}
          version={version}
        />
      ) : (
        <div className={styles.grid}>
          {filtered.map((example) => (
            <LazyGalleryCard
              key={example.entityCode + version}
              example={example}
              affiliation={affiliation}
              version={version}
            />
          ))}
        </div>
      )}
    </div>
  );
}
