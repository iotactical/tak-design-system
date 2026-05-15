// rtmx:req REQ-XW-106
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MultipointMap } from './MultipointMap';
import { MilSymRenderer } from './MilSymRenderer';
import { useMultipointWorker } from '../hooks/useMultipointWorker';
import {
  EXAMPLE_BY_ENTITY,
  MULTIPOINT_CATEGORIES,
  type MultipointExample,
} from '../data/multipoint-examples';
import b2dData from '../../../data/mil-std-2525/b2d.json';
import styles from '../pages/Explorer.module.css';

interface B2DMapping {
  b_sidc: string;
  d_ss: string;
  d_ec: string;
  d_s1: string;
  d_s2: string;
  label: string;
  lossy: boolean;
}

const CATEGORY_NAMES: Record<string, string> = {
  '11': 'Command & Control Lines',
  '12': 'Areas of Interest',
  '13': 'Control Points',
  '14': 'Maneuver Lines',
  '15': 'Maneuver Areas',
  '16': 'Observation & Outposts',
  '17': 'Air Corridors & Routes',
  '18': 'Airspace Control Points',
  '21': 'Maritime & Naval',
  '22': 'Electronic Warfare',
  '23': 'Deception',
  '24': 'Fire Support',
  '25': 'Fire Support Points',
  '26': 'Fire Support Lines',
  '27': 'Minefields & Obstacles',
  '28': 'Obstacle Types',
  '29': 'Obstacle Lines & Wire',
  '31': 'Detainee & POW',
  '32': 'Support & Supply Points',
  '33': 'Convoys',
  '34': 'Tactical Mission Tasks',
};

const SINGLE_POINT_PREFIXES = new Set(['13', '16', '18', '25']);

function isSinglePoint(ec: string): boolean {
  if (SINGLE_POINT_PREFIXES.has(ec.substring(0, 2))) return true;
  return SINGLE_POINT_INDIVIDUALS.has(ec);
}

const SINGLE_POINT_INDIVIDUALS = new Set([
  '210200','210400','210500','210700','210800','210900','211100','211400','211500',
  '212000','212100','212300','212400','212600','212700','212800','212901','212902',
  '212903','212904','213000','213100','213200','213300','213500','213501','213502',
  '213504','213506','213507','213508','213510','213511','213512','213513','213514',
  '213515','213600','213700','213800','213900','214200','214400','214500','214800',
  '214900','215000','215100','215200','215300','215400','215500','215600','215700',
  '215800','215900','216000','216100','216200','216300','216400','216500','216600',
  '216700','216800','216900','217100','217200','217300','217500','217600','217700',
  '218000','218100','218200','218300','218500','218600','218700','218800','218900',
  '219000','219100','219200',
  '240601','240602','240900',
  '270705',
  '280200','280201','280300','280400','280500','280600','280700','280800','280900',
  '281000','281100','281200','281300','281400','281500','281600','281800','281801',
  '281802','281803','281804','281805','281806','281901','281902','281903','282001','282002',
  '320200','320300','320400','320500','320600','320700','320800','320900','321000',
  '321100','321200','321300','321400','321500','321600','321700','321707','321708',
  '321709','321710','321711','321712','321713','321714','321715','321716',
  '340900','341400','341600','342800',
]);

interface TreeGroup {
  prefix: string;
  name: string;
  entities: B2DMapping[];
}

/** A committed graphic in the session */
interface CommittedGraphic {
  id: number;
  label: string;
  sidc: string;
  affiliation: string;
  pointCount: number;
  geojson: string;
}

const AFFILIATIONS: { code: string; label: string }[] = [
  { code: '03', label: 'Friendly' },
  { code: '06', label: 'Hostile' },
  { code: '04', label: 'Neutral' },
  { code: '01', label: 'Unknown' },
];

const AFF_LABELS: Record<string, string> = {
  '03': 'FRI', '06': 'HOS', '04': 'NEU', '01': 'UNK',
};

function withAffiliation(sidc: string, si: string): string {
  if (sidc.length < 20) return sidc;
  return sidc.substring(0, 2) + si + sidc.substring(4);
}

function makeSidc25(entityCode: string): string {
  return `1003250000${entityCode}0000`;
}

type Point = [number, number];

/** Parse canonical "lon,lat lon,lat" control-point string into Point[] */
function parseControlPoints(cp: string): Point[] {
  return cp.split(' ').map((p) => {
    const [lon, lat] = p.split(',').map(Number);
    return [lon, lat] as Point;
  });
}

interface Snapshot {
  points: Point[];
  rotation: number;
}

function usePointHistory() {
  const [points, setPoints] = useState<Point[]>([]);
  const [rotation, setRotation] = useState(0);
  // Full snapshot undo/redo stacks
  const undoStack = useRef<Snapshot[]>([]);
  const redoStack = useRef<Snapshot[]>([]);
  // Track whether the current drag is already snapshotted (coalesce frames)
  const skipSnapshotRef = useRef(false);
  // Current rotation ref for snapshot capture inside setPoints callbacks
  const rotationRef = useRef(0);

  const pushUndo = useCallback((prevPts: Point[]) => {
    undoStack.current.push({ points: prevPts, rotation: rotationRef.current });
    redoStack.current = [];
  }, []);

  const addPoint = useCallback((pt: Point) => {
    setPoints((prev) => {
      pushUndo(prev);
      return [...prev, pt];
    });
  }, [pushUndo]);

  const undo = useCallback(() => {
    const snapshot = undoStack.current.pop();
    if (!snapshot) return;
    setPoints((prev) => {
      redoStack.current.push({ points: prev, rotation: rotationRef.current });
      return snapshot.points;
    });
    rotationRef.current = snapshot.rotation;
    setRotation(snapshot.rotation);
  }, []);

  const redo = useCallback(() => {
    const snapshot = redoStack.current.pop();
    if (!snapshot) return;
    setPoints((prev) => {
      undoStack.current.push({ points: prev, rotation: rotationRef.current });
      return snapshot.points;
    });
    rotationRef.current = snapshot.rotation;
    setRotation(snapshot.rotation);
  }, []);

  const updatePoint = useCallback((index: number, pt: Point) => {
    setPoints((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      if (!skipSnapshotRef.current) pushUndo(prev);
      skipSnapshotRef.current = true;
      const next = [...prev];
      next[index] = pt;
      return next;
    });
  }, [pushUndo]);

  const translateAll = useCallback((dLng: number, dLat: number) => {
    setPoints((prev) => {
      if (!skipSnapshotRef.current) pushUndo(prev);
      skipSnapshotRef.current = true;
      return prev.map(([lng, lat]) => [lng + dLng, lat + dLat] as Point);
    });
  }, [pushUndo]);

  const rotateAll = useCallback((angleDeg: number) => {
    setPoints((prev) => {
      if (prev.length < 2) return prev;
      if (!skipSnapshotRef.current) pushUndo(prev);
      skipSnapshotRef.current = true;
      const cx = prev.reduce((s, p) => s + p[0], 0) / prev.length;
      const cy = prev.reduce((s, p) => s + p[1], 0) / prev.length;
      const rad = (angleDeg * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);
      const latScale = Math.cos((cy * Math.PI) / 180);
      return prev.map(([lng, lat]) => {
        const dx = (lng - cx) * latScale;
        const dy = lat - cy;
        const rx = dx * cosA - dy * sinA;
        const ry = dx * sinA + dy * cosA;
        return [cx + rx / latScale, cy + ry] as Point;
      });
    });
    rotationRef.current += angleDeg;
    setRotation(rotationRef.current);
  }, [pushUndo]);

  const scaleAll = useCallback((factorX: number, factorY: number, anchorLng: number, anchorLat: number) => {
    setPoints((prev) => {
      if (!skipSnapshotRef.current) pushUndo(prev);
      skipSnapshotRef.current = true;
      return prev.map(([lng, lat]) => [
        anchorLng + (lng - anchorLng) * factorX,
        anchorLat + (lat - anchorLat) * factorY,
      ] as Point);
    });
  }, [pushUndo]);

  const commitDrag = useCallback(() => {
    skipSnapshotRef.current = false;
  }, []);

  const clear = useCallback(() => {
    undoStack.current = [];
    redoStack.current = [];
    rotationRef.current = 0;
    setRotation(0);
    setPoints([]);
  }, []);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  return {
    points, rotation, addPoint, updatePoint, translateAll, rotateAll, scaleAll,
    undo, redo, clear, canUndo, canRedo, setPoints, commitDrag,
  };
}

/** Merge multiple GeoJSON strings into one FeatureCollection */
function mergeGeoJson(items: string[]): string {
  const allFeatures: unknown[] = [];
  for (const raw of items) {
    try {
      const sanitized = raw
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/:\s*NaN/g, ':0')
        .replace(/:\s*-?Infinity/g, ':0')
        .replace(/:\s*undefined/g, ':null');
      const parsed = JSON.parse(sanitized);
      if (parsed.features) {
        for (const f of parsed.features) allFeatures.push(f);
      }
    } catch { /* skip unparseable */ }
  }
  return JSON.stringify({ type: 'FeatureCollection', features: allFeatures });
}

/** Generate a simple GeoJSON preview of user-plotted points (circles + connecting line)
 *  for visual feedback before the minimum point count is met. */
function buildPointPreviewGeoJson(pts: Point[]): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const features: any[] = [];
  if (pts.length >= 2) {
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: pts.map(([lon, lat]) => [lon, lat]) },
      properties: { stroke: '#FFE35E', 'stroke-width': 2, strokeDasharray: '6,4' },
    });
  }
  for (let i = 0; i < pts.length; i++) {
    const [lon, lat] = pts[i];
    const d = 0.03;
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[lon - d, lat - d], [lon + d, lat - d], [lon + d, lat + d], [lon - d, lat + d], [lon - d, lat - d]]],
      },
      properties: { fill: '#FFE35E', fillColor: '#FFE35E', stroke: '#FFE35E', 'stroke-width': 1, label: `${i + 1}` },
    });
  }
  return JSON.stringify({ type: 'FeatureCollection', features });
}

const DESKTOP_MIN_WIDTH = 768;

export default function ControlMeasuresPanel() {
  const [search, setSearch] = useState('');
  const [affiliation, setAffiliation] = useState('03');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedEc, setSelectedEc] = useState<string | null>(null);
  const [activeGeojson, setActiveGeojson] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [committed, setCommitted] = useState<CommittedGraphic[]>([]);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= DESKTOP_MIN_WIDTH : true
  );
  // After committing, suppress canonical rendering until user starts a new graphic
  const justCommittedRef = useRef(false);
  // Track whether canonical points have been adopted into editable state
  const adoptedRef = useRef(false);
  const nextId = useRef(1);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    points: userPoints, rotation: rotationAngle, addPoint, updatePoint,
    translateAll, rotateAll, scaleAll,
    undo, redo, clear, canUndo, canRedo, setPoints, commitDrag,
  } = usePointHistory();
  const { renderMultipoint, ready } = useMultipointWorker();

  // Desktop gate
  useEffect(() => {
    function onResize() {
      setIsDesktop(window.innerWidth >= DESKTOP_MIN_WIDTH);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const ss25Entities = useMemo(() => {
    return (b2dData as { mappings: B2DMapping[] }).mappings.filter(
      (m) => m.d_ss === '25' && m.d_ec
    );
  }, []);

  const entityByEc = useMemo(() => {
    const map = new Map<string, B2DMapping>();
    for (const e of ss25Entities) map.set(e.d_ec, e);
    return map;
  }, [ss25Entities]);

  const tree = useMemo((): TreeGroup[] => {
    const groupMap = new Map<string, B2DMapping[]>();
    let entities = ss25Entities;

    if (search) {
      const q = search.toLowerCase();
      entities = entities.filter((e) =>
        e.label.toLowerCase().includes(q) ||
        e.d_ec.includes(q) ||
        e.b_sidc.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      entities = entities.filter((e) => {
        const ex = EXAMPLE_BY_ENTITY[e.d_ec];
        return ex ? ex.category === categoryFilter : false;
      });
    }

    for (const e of entities) {
      const prefix = e.d_ec.substring(0, 2);
      let group = groupMap.get(prefix);
      if (!group) { group = []; groupMap.set(prefix, group); }
      group.push(e);
    }

    return Array.from(groupMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([prefix, ents]) => ({
        prefix,
        name: CATEGORY_NAMES[prefix] || `Group ${prefix}`,
        entities: ents,
      }));
  }, [ss25Entities, search, categoryFilter]);

  useEffect(() => {
    if (search) setExpandedGroups(new Set(tree.map((g) => g.prefix)));
  }, [search, tree]);

  const selectedEntity = useMemo(
    () => (selectedEc ? entityByEc.get(selectedEc) ?? null : null),
    [entityByEc, selectedEc]
  );
  const example: MultipointExample | undefined = selectedEc
    ? EXAMPLE_BY_ENTITY[selectedEc]
    : undefined;
  const singlePoint = selectedEc ? isSinglePoint(selectedEc) : false;

  const sidc = selectedEc
    ? withAffiliation(makeSidc25(selectedEc), affiliation)
    : '';

  // Whether we should show the canonical example (no user points, not just committed)
  const showCanonical = !justCommittedRef.current && userPoints.length === 0 && !!example && !singlePoint;

  // Active vertices: user points, or canonical example points for editing
  const activeVertices = useMemo((): Point[] => {
    if (userPoints.length > 0) return userPoints;
    if (showCanonical && example) return parseControlPoints(example.controlPoints);
    return [];
  }, [userPoints, showCanonical, example]);

  // Commit the current in-progress graphic
  const commitCurrent = useCallback(() => {
    if (!activeGeojson || !selectedEc || singlePoint || activeVertices.length === 0) return;
    const entity = entityByEc.get(selectedEc);
    setCommitted((prev) => [
      {
        id: nextId.current++,
        label: entity?.label || selectedEc,
        sidc,
        affiliation,
        pointCount: activeVertices.length,
        geojson: activeGeojson,
      },
      ...prev,
    ]);
    justCommittedRef.current = true;
    adoptedRef.current = false;
    clear();
    setActiveGeojson(null);
  }, [activeGeojson, selectedEc, singlePoint, activeVertices.length, entityByEc, sidc, affiliation, clear]);

  // Auto-commit when switching entities (if user has plotted points with rendered result)
  const prevSelectedEc = useRef(selectedEc);
  useEffect(() => {
    if (prevSelectedEc.current !== selectedEc && prevSelectedEc.current !== null) {
      commitCurrent();
    }
    prevSelectedEc.current = selectedEc;
  }, [selectedEc, commitCurrent]);

  // Reset state when selection changes
  useEffect(() => {
    justCommittedRef.current = false;
    adoptedRef.current = false;
    clear();
  }, [selectedEc, clear]);

  // Adopt canonical points into editable user points (called on first drag/transform).
  // Idempotent: only runs once per entity selection via adoptedRef.
  const adoptCanonical = useCallback(() => {
    if (adoptedRef.current || userPoints.length > 0 || !example) return;
    adoptedRef.current = true;
    justCommittedRef.current = false;
    setPoints(parseControlPoints(example.controlPoints));
  }, [userPoints.length, example, setPoints]);

  // Render the active (in-progress) graphic
  useEffect(() => {
    if (!ready || !selectedEc || singlePoint) {
      setActiveGeojson(null);
      return;
    }

    // After commit, don't re-render canonical
    if (justCommittedRef.current && userPoints.length === 0) {
      setActiveGeojson(null);
      return;
    }

    const minPts = example?.minPoints ?? 1;
    const hasUserPoints = userPoints.length >= minPts;
    const canonicalPoints = example?.controlPoints || '';
    const points = hasUserPoints
      ? userPoints.map(([lon, lat]) => `${lon},${lat}`).join(' ')
      : canonicalPoints;

    // Below minimum: show point preview markers instead of the full graphic
    if (!points && userPoints.length > 0) {
      setActiveGeojson(buildPointPreviewGeoJson(userPoints));
      return;
    }
    if (userPoints.length > 0 && !hasUserPoints) {
      setActiveGeojson(buildPointPreviewGeoJson(userPoints));
      return;
    }

    if (!points) {
      setActiveGeojson(null);
      return;
    }

    const parsedPts = hasUserPoints
      ? userPoints
      : parseControlPoints(canonicalPoints);
    const lons = parsedPts.map((p) => p[0]);
    const lats = parsedPts.map((p) => p[1]);
    const pad = hasUserPoints ? 1 : 2;
    const bbox = `${Math.min(...lons) - pad},${Math.min(...lats) - pad},${Math.max(...lons) + pad},${Math.max(...lats) + pad}`;

    const el = mapWrapRef.current;
    const pw = el ? el.clientWidth : 800;
    const ph = el ? el.clientHeight : 500;
    const [, bBottom, , bTop] = bbox.split(',').map(Number);
    const midLat = (bBottom + bTop) / 2;
    const bboxParts = bbox.split(',').map(Number);
    const geoWidth = (bboxParts[2] - bboxParts[0]) * Math.cos((midLat * Math.PI) / 180) * 111;
    const geoHeight = (bTop - bBottom) * 111;
    const geoAspect = geoWidth / geoHeight;
    const pxW = Math.round(Math.max(pw, ph * geoAspect));
    const pxH = Math.round(pxW / geoAspect);

    let cancelled = false;
    const delay = userPoints.length > 0 ? 80 : 0;
    const timer = setTimeout(() => {
      renderMultipoint(
        sidc, points, 5000000, bbox,
        undefined, undefined, pxW, pxH,
      ).then((r) => {
        if (!cancelled) setActiveGeojson(r);
      });
    }, delay);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [selectedEc, affiliation, userPoints, ready, renderMultipoint, sidc, example, singlePoint]);

  // Merge committed + active GeoJSON for the map
  const mergedGeojson = useMemo(() => {
    const sources: string[] = [];
    for (const c of committed) sources.push(c.geojson);
    if (activeGeojson) sources.push(activeGeojson);
    if (sources.length === 0) return null;
    if (sources.length === 1) return sources[0];
    return mergeGeoJson(sources);
  }, [committed, activeGeojson]);

  const handleMapClick = useCallback((lngLat: Point) => {
    if (!selectedEc || singlePoint) return;
    justCommittedRef.current = false;
    addPoint(lngLat);
  }, [selectedEc, singlePoint, addPoint]);

  // Transform callbacks -- adopt canonical on first interaction
  const handleVertexDrag = useCallback((index: number, lngLat: Point) => {
    if (userPoints.length === 0 && example) {
      // Adopt canonical points, then apply the drag
      const pts = parseControlPoints(example.controlPoints);
      pts[index] = lngLat;
      justCommittedRef.current = false;
      setPoints(pts);
    } else {
      updatePoint(index, lngLat);
    }
  }, [userPoints.length, example, updatePoint, setPoints]);

  const handleShapeTranslate = useCallback((dLng: number, dLat: number) => {
    if (userPoints.length === 0) adoptCanonical();
    translateAll(dLng, dLat);
  }, [userPoints.length, adoptCanonical, translateAll]);

  const handleRotate = useCallback((angleDeg: number) => {
    if (userPoints.length === 0) adoptCanonical();
    rotateAll(angleDeg);
  }, [userPoints.length, adoptCanonical, rotateAll]);

  const handleResize = useCallback((factorX: number, factorY: number, anchorLng: number, anchorLat: number) => {
    if (userPoints.length === 0) adoptCanonical();
    scaleAll(factorX, factorY, anchorLng, anchorLat);
  }, [userPoints.length, adoptCanonical, scaleAll]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (mod && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
      else if (mod && e.key === 'y') { e.preventDefault(); redo(); }
      else if (e.key === 'Escape' && userPoints.length > 0) { clear(); }
      else if (e.key === 'Enter' && activeVertices.length > 0) {
        e.preventDefault();
        commitCurrent();
      }
    }
    const el = panelRef.current;
    if (el) {
      el.addEventListener('keydown', onKeyDown);
      return () => el.removeEventListener('keydown', onKeyDown);
    }
  }, [undo, redo, clear, userPoints.length, activeVertices.length, commitCurrent]);

  const center = useMemo((): Point => {
    if (activeVertices.length > 0) {
      return [
        activeVertices.reduce((s, p) => s + p[0], 0) / activeVertices.length,
        activeVertices.reduce((s, p) => s + p[1], 0) / activeVertices.length,
      ];
    }
    return [-97.5, 37.5];
  }, [activeVertices]);

  const handleSelect = useCallback((ec: string) => {
    setSelectedEc((prev) => (prev === ec ? null : ec));
  }, []);

  const toggleGroup = useCallback((prefix: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(prefix)) next.delete(prefix); else next.add(prefix);
      return next;
    });
  }, []);

  const deleteGraphic = useCallback((id: number) => {
    setCommitted((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setCommitted([]);
    clear();
    setActiveGeojson(null);
  }, [clear]);

  // Plotting instruction text
  const minPts = example?.minPoints ?? 1;
  const maxPts = example?.maxPoints ?? 0;
  const plotInstruction = useMemo(() => {
    if (!selectedEc || singlePoint) return null;
    if (showCanonical) return 'Drag vertices or handles to edit. Click map to plot new points.';
    if (justCommittedRef.current && userPoints.length === 0) return 'Graphic committed. Click to plot another, or select a different entity.';
    if (userPoints.length === 0) return null;
    const n = userPoints.length + 1;
    if (userPoints.length < minPts) {
      if (maxPts > 0) return `Click to place point ${n} of ${maxPts}`;
      return `Click to place point ${n} (${minPts}+ required)`;
    }
    if (maxPts > 0 && userPoints.length < maxPts) {
      return `Click to place point ${n} of ${maxPts}`;
    }
    return `${userPoints.length} points plotted -- Enter to commit, click to add more`;
  }, [selectedEc, singlePoint, showCanonical, userPoints.length, minPts, maxPts]);

  const totalFiltered = tree.reduce((s, g) => s + g.entities.length, 0);

  // REQ-SITE-016: Desktop-only gate
  if (!isDesktop) {
    return (
      <div className={styles.cmEmpty} style={{ minHeight: 300, flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 40, opacity: 0.3 }}>&#9000;</div>
        <div style={{ fontSize: 15, color: '#A0A0A0', maxWidth: 360, textAlign: 'center', lineHeight: 1.6 }}>
          Interactive tactical graphic plotting requires a desktop browser
          with a larger screen and mouse input.
        </div>
        <div style={{ fontSize: 13, color: '#666' }}>
          Minimum viewport width: {DESKTOP_MIN_WIDTH}px
        </div>
      </div>
    );
  }

  return (
    <div ref={panelRef} tabIndex={-1} style={{ outline: 'none', overflow: 'hidden' }}>
      {/* Top bar */}
      <div className={styles.cmTopBar}>
        <input
          type="text"
          placeholder="Search control measures..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.cmSearch}
          style={{ flex: 1, maxWidth: 360 }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {AFFILIATIONS.map((a) => (
            <button
              key={a.code}
              onClick={() => setAffiliation(a.code)}
              className={styles.affiliationBtn}
              style={
                affiliation === a.code
                  ? { background: 'var(--tak-accent, #FFE35E)', color: '#000', borderColor: '#FFE35E' }
                  : undefined
              }
            >
              {a.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setCategoryFilter(null)}
            className={styles.cmFilterBtn}
            style={
              categoryFilter === null
                ? { background: 'var(--tak-accent, #FFE35E)', color: '#000', borderColor: '#FFE35E' }
                : undefined
            }
          >
            All
          </button>
          {MULTIPOINT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              className={styles.cmFilterBtn}
              style={
                categoryFilter === cat
                  ? { background: 'var(--tak-accent, #FFE35E)', color: '#000', borderColor: '#FFE35E' }
                  : undefined
              }
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <span className={styles.cmCount}>
          {totalFiltered} entities{search && ` matching "${search}"`}
        </span>
      </div>

      {/* Main layout: sidebar | map | log */}
      <div className={styles.cmLayout}>
        {/* Sidebar tree */}
        <div className={styles.cmSidebar}>
          <div className={styles.cmList}>
            {tree.map((group) => (
              <div key={group.prefix}>
                <button
                  className={styles.cmGroupHeader}
                  onClick={() => toggleGroup(group.prefix)}
                >
                  <span className={styles.cmGroupArrow}>
                    {expandedGroups.has(group.prefix) ? '\u25BC' : '\u25B6'}
                  </span>
                  <span className={styles.cmGroupName}>{group.name}</span>
                  <span className={styles.cmGroupCount}>{group.entities.length}</span>
                </button>
                {expandedGroups.has(group.prefix) &&
                  group.entities.map((entity) => {
                    const ex = EXAMPLE_BY_ENTITY[entity.d_ec];
                    const sp = isSinglePoint(entity.d_ec);
                    return (
                      <button
                        key={entity.d_ec + entity.b_sidc}
                        className={`${styles.cmRow} ${selectedEc === entity.d_ec ? styles.cmRowActive : ''}`}
                        onClick={() => handleSelect(entity.d_ec)}
                        title={entity.label}
                      >
                        <span className={styles.cmRowIcon}>{sp ? '\u2022' : '\u2500'}</span>
                        <span className={styles.cmRowLabel}>{entity.label}</span>
                        {ex && <span className={styles.cmRowBadge}>{ex.category}</span>}
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>

        {/* Map + info */}
        <div className={styles.cmMain}>
          <div className={styles.cmMapWrap} ref={mapWrapRef}>
            {plotInstruction && (
              <div className={styles.cmToast}>{plotInstruction}</div>
            )}

            {selectedEc && singlePoint ? (
              <div className={styles.cmEmpty}>
                <div style={{ marginBottom: 12 }}>
                  <MilSymRenderer sidc={sidc} size={80} label={selectedEntity?.label} />
                </div>
                <div style={{ fontSize: 13, color: '#A0A0A0' }}>
                  Single-point symbol -- rendered as an icon overlay.
                  <br />
                  <Link to="/explorer/browse" style={{ color: '#FFE35E', textDecoration: 'underline' }}>
                    View in Browse tab (Symbol Set 25)
                  </Link>
                </div>
              </div>
            ) : (selectedEc || committed.length > 0) ? (
              <MultipointMap
                geojson={mergedGeojson}
                center={center}
                zoom={6}
                onClick={handleMapClick}
                vertices={activeVertices}
                rotationAngle={rotationAngle}
                onVertexDrag={handleVertexDrag}
                onShapeTranslate={handleShapeTranslate}
                onRotate={handleRotate}
                onResize={handleResize}
                onDragEnd={commitDrag}
              />
            ) : (
              <div className={styles.cmEmpty}>
                Select a control measure from the tree to render it on the map.
                <br />
                Click the map to plot points interactively.
              </div>
            )}

          </div>

          {/* Info bar */}
          {selectedEntity && (
            <div className={styles.cmInfo}>
              <span className={styles.cmInfoName}>{selectedEntity.label}</span>
              <span className={styles.cmInfoSidc}>{sidc}</span>
              {selectedEntity.b_sidc && (
                <span className={styles.cmInfoSidc}>B: {selectedEntity.b_sidc}</span>
              )}
              {example && (
                <span className={styles.cmInfoPoints}>
                  {example.minPoints}{example.maxPoints > 0 ? `-${example.maxPoints}` : '+'} pts
                </span>
              )}
              {example && (
                <span className={styles.cmInfoDesc}>{example.description}</span>
              )}

              {!singlePoint && (
                <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                  <button className={styles.cmToolBtn} onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">Undo</button>
                  <button className={styles.cmToolBtn} onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">Redo</button>
                  {activeVertices.length > 0 && (
                    <button className={styles.cmToolBtn} onClick={commitCurrent} title="Commit graphic (Enter)">Commit</button>
                  )}
                  {userPoints.length > 0 && (
                    <button className={styles.cmClearBtn} onClick={clear} title="Clear points (Esc)">
                      Clear {userPoints.length} pt{userPoints.length !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              )}

              {!example && !singlePoint && userPoints.length === 0 && (
                <span className={styles.cmInfoDesc}>
                  No example data. Click the map to plot points.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Graphics log (persistent right panel) */}
        <div className={styles.cmLog}>
          <div className={styles.cmLogHeader}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#DAD4BC' }}>
              Graphics ({committed.length})
            </span>
            {committed.length > 0 && (
              <button className={styles.cmClearBtn} onClick={clearAll} title="Clear all graphics">
                Clear All
              </button>
            )}
          </div>
          {committed.length > 0 ? (
            <div className={styles.cmLogList}>
              {committed.map((g) => (
                <div key={g.id} className={styles.cmLogItem}>
                  <div className={styles.cmLogItemInfo}>
                    <span className={styles.cmLogItemName}>{g.label}</span>
                    <span className={styles.cmLogItemMeta}>
                      {AFF_LABELS[g.affiliation] || '?'} | {g.pointCount} pts
                    </span>
                  </div>
                  <button
                    className={styles.cmLogDeleteBtn}
                    onClick={() => deleteGraphic(g.id)}
                    title="Remove this graphic"
                  >
                    &#x2715;
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12, padding: 16, textAlign: 'center' }}>
              Commit graphics to add them here. Press Enter or click Commit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
