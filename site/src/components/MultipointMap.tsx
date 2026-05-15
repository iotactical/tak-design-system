// rtmx:req REQ-XW-138
// rtmx:req REQ-XW-275
import { useEffect, useRef, useState } from 'react';
import styles from './MultipointMap.module.css';

// Lazy-load maplibre-gl to avoid bundle bloat on other pages
let maplibrePromise: Promise<typeof import('maplibre-gl')> | null = null;
function loadMaplibre() {
  if (!maplibrePromise) {
    maplibrePromise = import('maplibre-gl');
  }
  return maplibrePromise;
}

// REQ-XW-275: Multiple basemap style definitions (inline styles to avoid CORS issues)
function makeRasterStyle(
  id: string,
  tiles: string[],
  attribution: string,
  tileSize = 256,
): import('maplibre-gl').StyleSpecification {
  return {
    version: 8,
    sources: {
      [id]: { type: 'raster', tiles, tileSize, attribution },
    },
    layers: [
      { id: `${id}-layer`, type: 'raster', source: id, minzoom: 0, maxzoom: 19 },
    ],
  };
}

export const BASEMAP_STYLES = [
  {
    id: 'dark',
    label: 'Dark',
    style: makeRasterStyle(
      'carto-dark',
      ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
       'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
       'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
      'CARTO',
    ),
  },
  {
    id: 'terrain',
    label: 'Terrain',
    style: makeRasterStyle(
      'carto-voyager',
      ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
       'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
       'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
      'CARTO',
    ),
  },
  {
    id: 'satellite',
    label: 'Satellite',
    style: makeRasterStyle(
      'esri-satellite',
      ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      'Esri, Maxar, Earthstar Geographics',
    ),
  },
] as const;

const DEFAULT_BASEMAP = BASEMAP_STYLES[0]; // Dark -- matches site theme, good contrast for colored tactical graphics

/** Dark basemap for gallery thumbnails -- uses the same CARTO dark tiles as the
 *  main dark basemap but adds a solid background fallback so tiles that haven't
 *  loaded yet still look clean. */
const THUMBNAIL_STYLE: import('maplibre-gl').StyleSpecification = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: 'CARTO',
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#141422' } },
    { id: 'carto-dark-layer', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 19 },
  ],
};

/** Compute bounding box from parsed GeoJSON for auto-fit */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeBounds(geojson: any): [[number, number], [number, number]] | null {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  let count = 0;

  function visitCoords(coords: number[]) {
    if (!Array.isArray(coords) || coords.length < 2) return;
    minLng = Math.min(minLng, coords[0]);
    minLat = Math.min(minLat, coords[1]);
    maxLng = Math.max(maxLng, coords[0]);
    maxLat = Math.max(maxLat, coords[1]);
    count++;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function walk(geometry: any) {
    if (!geometry || !geometry.type) return;
    switch (geometry.type) {
      case 'Point': visitCoords(geometry.coordinates); break;
      case 'MultiPoint':
      case 'LineString': (geometry.coordinates || []).forEach(visitCoords); break;
      case 'MultiLineString':
      case 'Polygon': (geometry.coordinates || []).forEach((ring: number[][]) => ring.forEach(visitCoords)); break;
      case 'MultiPolygon': (geometry.coordinates || []).forEach((poly: number[][][]) => poly.forEach(ring => ring.forEach(visitCoords))); break;
      case 'GeometryCollection': (geometry.geometries || []).forEach(walk); break;
    }
  }

  if (geojson.features) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const f of geojson.features) { if (f.geometry) walk(f.geometry); }
  } else if (geojson.geometry) {
    walk(geojson.geometry);
  } else if (geojson.type && geojson.type !== 'Feature' && geojson.type !== 'FeatureCollection') {
    walk(geojson);
  }

  if (count === 0) return null;
  if (minLng === maxLng) { minLng -= 0.5; maxLng += 0.5; }
  if (minLat === maxLat) { minLat -= 0.5; maxLat += 0.5; }
  return [[minLng, minLat], [maxLng, maxLat]];
}

// ---------- Layer IDs ----------
const GEOJSON_SOURCE_ID = 'multipoint-source';
const LINE_CASING_LAYER_ID = 'multipoint-line-casing';
const LINE_LAYER_ID = 'multipoint-lines';
const FILL_LAYER_ID = 'multipoint-fills';
const LABEL_LAYER_ID = 'multipoint-labels';
const VERTEX_SOURCE_ID = 'vertex-source';
const VERTEX_LAYER_ID = 'vertex-squares';
const VERTEX_LABEL_LAYER_ID = 'vertex-labels';
const HANDLE_SOURCE_ID = 'handle-source';
const HANDLE_BBOX_LAYER_ID = 'handle-bbox';
const HANDLE_CORNER_LAYER_ID = 'handle-corners';
const HANDLE_STEM_LAYER_ID = 'handle-stem';
const HANDLE_ROTATE_LAYER_ID = 'handle-rotate';

// ---------- Custom map images ----------
function createSquareImageData(
  size: number, fill: number[], stroke: number[], border = 2,
): { width: number; height: number; data: Uint8Array } {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const isBorder = x < border || x >= size - border || y < border || y >= size - border;
      const c = isBorder ? stroke : fill;
      data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
    }
  }
  return { width: size, height: size, data };
}

function createCircleImageData(
  size: number, fill: number[], stroke: number[],
): { width: number; height: number; data: Uint8Array } {
  const data = new Uint8Array(size * size * 4);
  const r = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dx = x - r + 0.5;
      const dy = y - r + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= r - 2) {
        data[i] = fill[0]; data[i + 1] = fill[1]; data[i + 2] = fill[2]; data[i + 3] = 255;
      } else if (dist <= r) {
        data[i] = stroke[0]; data[i + 1] = stroke[1]; data[i + 2] = stroke[2]; data[i + 3] = 255;
      }
    }
  }
  return { width: size, height: size, data };
}

// ---------- GeoJSON helpers ----------
function vertexFeatureCollection(vertices: [number, number][]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: vertices.map(([lng, lat], i) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [lng, lat] },
      properties: { idx: i, label: `${i + 1}` },
    })),
  };
}

/** Rotate a point around a center by angleDeg, accounting for latitude scaling */
function rotatePoint(
  lng: number, lat: number, cx: number, cy: number,
  cosA: number, sinA: number, latScale: number,
): [number, number] {
  const dx = (lng - cx) * latScale;
  const dy = lat - cy;
  return [cx + (dx * cosA - dy * sinA) / latScale, cy + dx * sinA + dy * cosA];
}

function computeHandleGeoJson(
  vertices: [number, number][],
  rotationDeg = 0,
): GeoJSON.FeatureCollection {
  if (vertices.length < 2) return { type: 'FeatureCollection', features: [] };

  const cx = vertices.reduce((s, p) => s + p[0], 0) / vertices.length;
  const cy = vertices.reduce((s, p) => s + p[1], 0) / vertices.length;
  const latScale = Math.cos((cy * Math.PI) / 180);

  // Undo rotation to find the axis-aligned bbox of the unrotated shape
  const negRad = (-rotationDeg * Math.PI) / 180;
  const cosNeg = Math.cos(negRad);
  const sinNeg = Math.sin(negRad);

  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const [lng, lat] of vertices) {
    const [uLng, uLat] = rotatePoint(lng, lat, cx, cy, cosNeg, sinNeg, latScale);
    minLng = Math.min(minLng, uLng);
    maxLng = Math.max(maxLng, uLng);
    minLat = Math.min(minLat, uLat);
    maxLat = Math.max(maxLat, uLat);
  }

  const padLng = Math.max((maxLng - minLng) * 0.08, 0.05);
  const padLat = Math.max((maxLat - minLat) * 0.08, 0.05);
  const bL = minLng - padLng, bR = maxLng + padLng;
  const bB = minLat - padLat, bT = maxLat + padLat;

  // Rotate the bbox corners and handles by +rotationDeg
  const posRad = (rotationDeg * Math.PI) / 180;
  const cosPos = Math.cos(posRad);
  const sinPos = Math.sin(posRad);
  const rot = (lng: number, lat: number): [number, number] =>
    rotatePoint(lng, lat, cx, cy, cosPos, sinPos, latScale);

  const sw = rot(bL, bB), se = rot(bR, bB), ne = rot(bR, bT), nw = rot(bL, bT);

  const features: GeoJSON.Feature[] = [];

  // Bounding box outline (oriented)
  features.push({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [sw, se, ne, nw, sw],
    },
    properties: { handleType: 'bbox' },
  });

  // Corner resize handles
  const cornerPairs: [string, [number, number]][] = [
    ['sw', sw], ['se', se], ['ne', ne], ['nw', nw],
  ];
  for (const [corner, coords] of cornerPairs) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords },
      properties: { handleType: 'resize', corner },
    });
  }

  // Rotation handle: stem from top-center of oriented bbox
  const topMidLng = (nw[0] + ne[0]) / 2;
  const topMidLat = (nw[1] + ne[1]) / 2;
  const stemLen = (bT - bB) * 0.2;
  const stemEnd = rot((bL + bR) / 2, bT + stemLen);

  features.push({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [[topMidLng, topMidLat], stemEnd],
    },
    properties: { handleType: 'rotate-stem' },
  });
  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: stemEnd },
    properties: { handleType: 'rotate' },
  });

  return { type: 'FeatureCollection', features };
}

/** Opposite corner for resize anchor */
const OPPOSITE_CORNER: Record<string, string> = {
  sw: 'ne', se: 'nw', ne: 'sw', nw: 'se',
};

// ---------- Map layer setup ----------
/** Add GeoJSON source + layers to a map instance */
function addGeoJsonLayers(map: import('maplibre-gl').Map, small = false) {
  if (map.getSource(GEOJSON_SOURCE_ID)) return;

  map.addSource(GEOJSON_SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  const rawColor: import('maplibre-gl').ExpressionSpecification =
    ['coalesce', ['get', 'stroke'], ['get', 'strokeColor'], ['get', 'labelColor'], ['get', 'fontColor'], ['get', 'color'], '#4DA6FF'];
  const colorExpr: import('maplibre-gl').ExpressionSpecification =
    ['case', ['==', rawColor, '#000000'], '#4DA6FF', rawColor];
  const widthExpr: import('maplibre-gl').ExpressionSpecification =
    ['coalesce', ['get', 'stroke-width'], ['get', 'strokeWidth'], 3];
  const rawFill: import('maplibre-gl').ExpressionSpecification =
    ['coalesce', ['get', 'fill'], ['get', 'fillColor'], '#4DA6FF'];
  const fillExpr: import('maplibre-gl').ExpressionSpecification =
    ['case', ['==', rawFill, '#000000'], '#4DA6FF', rawFill];

  map.addLayer({
    id: FILL_LAYER_ID,
    type: 'fill',
    source: GEOJSON_SOURCE_ID,
    filter: ['==', '$type', 'Polygon'],
    paint: { 'fill-color': fillExpr, 'fill-opacity': 0.35 },
  });

  if (!small) {
    map.addLayer({
      id: LINE_CASING_LAYER_ID,
      type: 'line',
      source: GEOJSON_SOURCE_ID,
      paint: {
        'line-color': '#ffffff',
        'line-width': widthExpr,
        'line-gap-width': 1,
        'line-opacity': 0.2,
      },
    });
  }

  map.addLayer({
    id: LINE_LAYER_ID,
    type: 'line',
    source: GEOJSON_SOURCE_ID,
    paint: { 'line-color': colorExpr, 'line-width': widthExpr },
  });

  map.addLayer({
    id: LABEL_LAYER_ID,
    type: 'symbol',
    source: GEOJSON_SOURCE_ID,
    layout: {
      'text-field': ['coalesce', ['get', 'label'], ['get', 'name'], ''],
      'text-size': 12,
      'text-allow-overlap': true,
      'text-ignore-placement': true,
    },
    paint: {
      'text-color': colorExpr,
      'text-halo-color': '#000000',
      'text-halo-width': 2,
    },
  });
}

/** Add vertex marker + transform handle layers to an interactive map */
function addEditLayers(map: import('maplibre-gl').Map) {
  if (map.getSource(VERTEX_SOURCE_ID)) return;

  // Register custom images
  if (!map.hasImage('vertex-square')) {
    map.addImage('vertex-square', createSquareImageData(14, [255, 255, 255], [0, 0, 0]));
  }
  if (!map.hasImage('corner-square')) {
    map.addImage('corner-square', createSquareImageData(16, [255, 255, 255], [60, 60, 60]));
  }
  if (!map.hasImage('rotate-circle')) {
    map.addImage('rotate-circle', createCircleImageData(18, [255, 255, 255], [60, 60, 60]));
  }

  // --- Vertex source + layers ---
  map.addSource(VERTEX_SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  map.addLayer({
    id: VERTEX_LAYER_ID,
    type: 'symbol',
    source: VERTEX_SOURCE_ID,
    layout: {
      'icon-image': 'vertex-square',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
  });

  map.addLayer({
    id: VERTEX_LABEL_LAYER_ID,
    type: 'symbol',
    source: VERTEX_SOURCE_ID,
    layout: {
      'text-field': ['get', 'label'],
      'text-size': 10,
      'text-offset': [0, -1.4],
      'text-allow-overlap': true,
      'text-ignore-placement': true,
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000',
      'text-halo-width': 1.5,
    },
  });

  // --- Handle source + layers ---
  map.addSource(HANDLE_SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  // Bounding box dashed line
  map.addLayer({
    id: HANDLE_BBOX_LAYER_ID,
    type: 'line',
    source: HANDLE_SOURCE_ID,
    filter: ['==', ['get', 'handleType'], 'bbox'],
    paint: {
      'line-color': '#ffffff',
      'line-width': 1,
      'line-opacity': 0.4,
      'line-dasharray': [4, 4],
    },
  });

  // Rotation stem
  map.addLayer({
    id: HANDLE_STEM_LAYER_ID,
    type: 'line',
    source: HANDLE_SOURCE_ID,
    filter: ['==', ['get', 'handleType'], 'rotate-stem'],
    paint: {
      'line-color': '#ffffff',
      'line-width': 1.5,
      'line-opacity': 0.6,
    },
  });

  // Corner resize squares
  map.addLayer({
    id: HANDLE_CORNER_LAYER_ID,
    type: 'symbol',
    source: HANDLE_SOURCE_ID,
    filter: ['==', ['get', 'handleType'], 'resize'],
    layout: {
      'icon-image': 'corner-square',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
  });

  // Rotation grip circle
  map.addLayer({
    id: HANDLE_ROTATE_LAYER_ID,
    type: 'symbol',
    source: HANDLE_SOURCE_ID,
    filter: ['==', ['get', 'handleType'], 'rotate'],
    layout: {
      'icon-image': 'rotate-circle',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
  });
}

// ---------- Drag state ----------
type DragState =
  | { type: 'vertex'; idx: number }
  | { type: 'translate'; lastLng: number; lastLat: number }
  | { type: 'rotate'; cx: number; cy: number; lastAngle: number }
  | { type: 'resize'; anchorLng: number; anchorLat: number; lastLng: number; lastLat: number }
  | null;

// ---------- Component ----------
export interface MultipointMapProps {
  geojson: string | null;
  center?: [number, number];
  zoom?: number;
  small?: boolean;
  onClick?: (lngLat: [number, number]) => void;
  /** Vertex positions for draggable markers (interactive maps only) */
  vertices?: [number, number][];
  /** Cumulative rotation angle (degrees) for oriented bounding box */
  rotationAngle?: number;
  /** Called when a vertex is dragged to a new position */
  onVertexDrag?: (index: number, lngLat: [number, number]) => void;
  /** Called when the entire shape is translated by dragging the graphic body */
  onShapeTranslate?: (deltaLng: number, deltaLat: number) => void;
  /** Called when the shape is rotated via the rotation handle (delta in degrees) */
  onRotate?: (angleDeltaDeg: number) => void;
  /** Called when the shape is resized via a corner handle (independent X/Y) */
  onResize?: (scaleX: number, scaleY: number, anchorLng: number, anchorLat: number) => void;
  /** Called when any drag interaction ends (mouseup) */
  onDragEnd?: () => void;
}

export function MultipointMap({
  geojson,
  center = [-98.5, 39.8],
  zoom = 4,
  small = false,
  onClick,
  vertices,
  rotationAngle = 0,
  onVertexDrag,
  onShapeTranslate,
  onRotate,
  onResize,
  onDragEnd,
}: MultipointMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<InstanceType<typeof import('maplibre-gl').Map> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [basemapIdx, setBasemapIdx] = useState(0);

  // Stable refs for callbacks so map event handlers always use the latest
  const draggingRef = useRef<DragState>(null);
  const onClickRef = useRef(onClick);
  const onVertexDragRef = useRef(onVertexDrag);
  const onShapeTranslateRef = useRef(onShapeTranslate);
  const onRotateRef = useRef(onRotate);
  const onResizeRef = useRef(onResize);
  const onDragEndRef = useRef(onDragEnd);
  const verticesRef = useRef(vertices);
  onClickRef.current = onClick;
  onVertexDragRef.current = onVertexDrag;
  onShapeTranslateRef.current = onShapeTranslate;
  onRotateRef.current = onRotate;
  onResizeRef.current = onResize;
  onDragEndRef.current = onDragEnd;
  verticesRef.current = vertices;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let map: InstanceType<typeof import('maplibre-gl').Map> | null = null;

    loadMaplibre().then((maplibregl) => {
      if (cancelled || !containerRef.current) return;

      map = new maplibregl.Map({
        container: containerRef.current,
        style: small ? THUMBNAIL_STYLE : DEFAULT_BASEMAP.style,
        center,
        zoom,
        attributionControl: false,
        interactive: !small,
      });

      map.on('load', () => {
        if (cancelled || !map) return;
        addGeoJsonLayers(map, small);
        if (!small) addEditLayers(map);
        mapRef.current = map;
        setLoaded(true);
      });

      if (!small) {
        // --- Vertex drag ---
        map.on('mousedown', VERTEX_LAYER_ID, (e) => {
          if (!e.features || e.features.length === 0) return;
          e.preventDefault();
          const idx = e.features[0].properties?.idx;
          if (typeof idx !== 'number') return;
          draggingRef.current = { type: 'vertex', idx };
          map!.getCanvas().style.cursor = 'grabbing';
          map!.dragPan.disable();
        });

        // --- Resize drag (corner handles) ---
        map.on('mousedown', HANDLE_CORNER_LAYER_ID, (e) => {
          if (draggingRef.current) return;
          if (!e.features || e.features.length === 0) return;
          e.preventDefault();
          const corner = e.features[0].properties?.corner as string;
          const opp = OPPOSITE_CORNER[corner];
          if (!opp) return;
          // Find anchor coords from handle features
          const src = map!.getSource(HANDLE_SOURCE_ID);
          if (!src) return;
          // Compute anchor from vertices bounding box
          const verts = verticesRef.current;
          if (!verts || verts.length < 2) return;
          let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
          for (const [lng, lat] of verts) {
            minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
          }
          const padLng = Math.max((maxLng - minLng) * 0.08, 0.05);
          const padLat = Math.max((maxLat - minLat) * 0.08, 0.05);
          const bL = minLng - padLng, bR = maxLng + padLng;
          const bB = minLat - padLat, bT = maxLat + padLat;
          const cornerCoords: Record<string, [number, number]> = {
            sw: [bL, bB], se: [bR, bB], ne: [bR, bT], nw: [bL, bT],
          };
          const anchor = cornerCoords[opp];
          draggingRef.current = {
            type: 'resize',
            anchorLng: anchor[0],
            anchorLat: anchor[1],
            lastLng: e.lngLat.lng,
            lastLat: e.lngLat.lat,
          };
          map!.getCanvas().style.cursor = 'nwse-resize';
          map!.dragPan.disable();
        });

        // --- Rotation drag ---
        map.on('mousedown', HANDLE_ROTATE_LAYER_ID, (e) => {
          if (draggingRef.current) return;
          e.preventDefault();
          const verts = verticesRef.current;
          if (!verts || verts.length < 2) return;
          const cx = verts.reduce((s, p) => s + p[0], 0) / verts.length;
          const cy = verts.reduce((s, p) => s + p[1], 0) / verts.length;
          const angle = Math.atan2(e.lngLat.lat - cy, e.lngLat.lng - cx);
          draggingRef.current = { type: 'rotate', cx, cy, lastAngle: angle };
          map!.getCanvas().style.cursor = 'crosshair';
          map!.dragPan.disable();
        });

        // --- Shape body translate drag ---
        for (const layerId of [FILL_LAYER_ID, LINE_LAYER_ID]) {
          map.on('mousedown', layerId, (e) => {
            if (draggingRef.current) return;
            // Don't start translate if on a vertex or handle
            const hits = map!.queryRenderedFeatures(e.point, {
              layers: [VERTEX_LAYER_ID, HANDLE_CORNER_LAYER_ID, HANDLE_ROTATE_LAYER_ID],
            });
            if (hits.length > 0) return;
            e.preventDefault();
            draggingRef.current = {
              type: 'translate',
              lastLng: e.lngLat.lng,
              lastLat: e.lngLat.lat,
            };
            map!.getCanvas().style.cursor = 'move';
            map!.dragPan.disable();
          });
        }

        // --- Global mousemove: dispatch to active drag type ---
        map.on('mousemove', (e) => {
          const d = draggingRef.current;
          if (!d) return;
          switch (d.type) {
            case 'vertex':
              onVertexDragRef.current?.(d.idx, [e.lngLat.lng, e.lngLat.lat]);
              break;
            case 'translate': {
              const dLng = e.lngLat.lng - d.lastLng;
              const dLat = e.lngLat.lat - d.lastLat;
              d.lastLng = e.lngLat.lng;
              d.lastLat = e.lngLat.lat;
              onShapeTranslateRef.current?.(dLng, dLat);
              break;
            }
            case 'rotate': {
              const newAngle = Math.atan2(e.lngLat.lat - d.cy, e.lngLat.lng - d.cx);
              let delta = (newAngle - d.lastAngle) * (180 / Math.PI);
              // Normalize to [-180, 180] to prevent jumps at the atan2 discontinuity
              if (delta > 180) delta -= 360;
              if (delta < -180) delta += 360;
              d.lastAngle = newAngle;
              onRotateRef.current?.(delta);
              break;
            }
            case 'resize': {
              const prevDx = d.lastLng - d.anchorLng;
              const prevDy = d.lastLat - d.anchorLat;
              const newDx = e.lngLat.lng - d.anchorLng;
              const newDy = e.lngLat.lat - d.anchorLat;
              const scaleX = Math.abs(prevDx) > 0.0001 ? newDx / prevDx : 1;
              const scaleY = Math.abs(prevDy) > 0.0001 ? newDy / prevDy : 1;
              d.lastLng = e.lngLat.lng;
              d.lastLat = e.lngLat.lat;
              onResizeRef.current?.(scaleX, scaleY, d.anchorLng, d.anchorLat);
              break;
            }
          }
        });

        // --- Global mouseup: end drag ---
        map.on('mouseup', () => {
          if (draggingRef.current) {
            draggingRef.current = null;
            map!.getCanvas().style.cursor = '';
            map!.dragPan.enable();
            onDragEndRef.current?.();
          }
        });

        // --- Cursor hints ---
        map.on('mouseenter', VERTEX_LAYER_ID, () => {
          if (!draggingRef.current) map!.getCanvas().style.cursor = 'grab';
        });
        map.on('mouseleave', VERTEX_LAYER_ID, () => {
          if (!draggingRef.current) map!.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', HANDLE_CORNER_LAYER_ID, () => {
          if (!draggingRef.current) map!.getCanvas().style.cursor = 'nwse-resize';
        });
        map.on('mouseleave', HANDLE_CORNER_LAYER_ID, () => {
          if (!draggingRef.current) map!.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', HANDLE_ROTATE_LAYER_ID, () => {
          if (!draggingRef.current) map!.getCanvas().style.cursor = 'crosshair';
        });
        map.on('mouseleave', HANDLE_ROTATE_LAYER_ID, () => {
          if (!draggingRef.current) map!.getCanvas().style.cursor = '';
        });
        for (const layerId of [FILL_LAYER_ID, LINE_LAYER_ID]) {
          map.on('mouseenter', layerId, () => {
            if (!draggingRef.current) map!.getCanvas().style.cursor = 'move';
          });
          map.on('mouseleave', layerId, () => {
            if (!draggingRef.current) map!.getCanvas().style.cursor = '';
          });
        }

        // --- Click: suppress on interactive handles ---
        map.on('click', (e) => {
          if (!onClickRef.current) return;
          const hits = map!.queryRenderedFeatures(e.point, {
            layers: [VERTEX_LAYER_ID, HANDLE_CORNER_LAYER_ID, HANDLE_ROTATE_LAYER_ID],
          });
          if (hits.length > 0) return;
          onClickRef.current([e.lngLat.lng, e.lngLat.lat]);
        });
      } else if (onClick) {
        map.on('click', (e) => {
          onClickRef.current?.([e.lngLat.lng, e.lngLat.lat]);
        });
      }
    });

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        map = null;
      }
      mapRef.current = null;
      setLoaded(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // REQ-XW-276: Switch basemap style (interactive maps only)
  const initialBasemapRef = useRef(basemapIdx);
  useEffect(() => {
    if (!loaded || !mapRef.current || small) return;
    if (initialBasemapRef.current === basemapIdx) {
      initialBasemapRef.current = -1;
      return;
    }
    const bm = BASEMAP_STYLES[basemapIdx];
    const map = mapRef.current;
    map.once('style.load', () => {
      addGeoJsonLayers(map);
      addEditLayers(map);
    });
    map.setStyle(bm.style as string | import('maplibre-gl').StyleSpecification);
  }, [basemapIdx, loaded, small]);

  // Update GeoJSON source when data changes
  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const source = mapRef.current.getSource(GEOJSON_SOURCE_ID);
    if (!source || source.type !== 'geojson') return;

    if (geojson) {
      let raw = typeof geojson === 'string' ? geojson : JSON.stringify(geojson);
      raw = raw
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/:\s*NaN/g, ':0')
        .replace(/:\s*-?Infinity/g, ':0')
        .replace(/:\s*undefined/g, ':null');
      try {
        const parsed = JSON.parse(raw);
        (source as import('maplibre-gl').GeoJSONSource).setData(parsed);

        if (small && mapRef.current) {
          const bounds = computeBounds(parsed);
          if (bounds) {
            const container = mapRef.current.getContainer();
            const pad = Math.round(Math.min(container.clientWidth, container.clientHeight) * 0.3);
            mapRef.current.fitBounds(bounds, { padding: pad, duration: 0, maxZoom: 12 });
          }
        }
      } catch (e) {
        const colMatch = String(e).match(/column (\d+)/);
        const col = colMatch ? parseInt(colMatch[1], 10) : 0;
        console.error('[MultipointMap] parse error at col', col,
          'context:', JSON.stringify(raw.substring(Math.max(0, col - 40), col + 40)),
          'charCode:', col > 0 ? raw.charCodeAt(col - 1) : -1,
          'total length:', raw.length);
        (source as import('maplibre-gl').GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    } else {
      (source as import('maplibre-gl').GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }, [geojson, loaded]);

  // Update vertex markers + transform handles when vertices change
  useEffect(() => {
    if (!loaded || !mapRef.current || small) return;

    const vertSrc = mapRef.current.getSource(VERTEX_SOURCE_ID);
    if (vertSrc && vertSrc.type === 'geojson') {
      const data = vertices && vertices.length > 0
        ? vertexFeatureCollection(vertices)
        : { type: 'FeatureCollection' as const, features: [] as GeoJSON.Feature[] };
      (vertSrc as import('maplibre-gl').GeoJSONSource).setData(data);
    }

    const handleSrc = mapRef.current.getSource(HANDLE_SOURCE_ID);
    if (handleSrc && handleSrc.type === 'geojson') {
      const data = vertices && vertices.length >= 2
        ? computeHandleGeoJson(vertices, rotationAngle)
        : { type: 'FeatureCollection' as const, features: [] as GeoJSON.Feature[] };
      (handleSrc as import('maplibre-gl').GeoJSONSource).setData(data);
    }
  }, [vertices, rotationAngle, loaded, small]);

  return (
    <div className={styles.mapWrapper}>
      <div
        ref={containerRef}
        className={small ? styles.mapContainerSmall : styles.mapContainer}
      />
      {!small && (
        <div className={styles.basemapToggle}>
          {BASEMAP_STYLES.map((bm, i) => (
            <button
              key={bm.id}
              className={`${styles.basemapBtn} ${i === basemapIdx ? styles.basemapBtnActive : ''}`}
              onClick={() => setBasemapIdx(i)}
            >
              {bm.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultipointMap;
