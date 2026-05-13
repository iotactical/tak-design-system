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

const DEFAULT_BASEMAP = BASEMAP_STYLES[1]; // Terrain (Voyager) -- better contrast for tactical graphics

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

const GEOJSON_SOURCE_ID = 'multipoint-source';
const LINE_CASING_LAYER_ID = 'multipoint-line-casing';
const LINE_LAYER_ID = 'multipoint-lines';
const FILL_LAYER_ID = 'multipoint-fills';
const LABEL_LAYER_ID = 'multipoint-labels';

/** Add GeoJSON source + layers to a map instance */
function addGeoJsonLayers(map: import('maplibre-gl').Map) {
  if (map.getSource(GEOJSON_SOURCE_ID)) return;

  map.addSource(GEOJSON_SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  // WebRenderer puts color in various property names depending on feature type:
  // lines/fills: stroke, strokeColor, fill, fillColor
  // labels: labelColor, fontColor, color
  // Replace black (#000000) with blue -- MIL-STD uses black for friendly control
  // measures which is invisible on dark backgrounds.
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
    paint: {
      'fill-color': fillExpr,
      'fill-opacity': 0.35,
    },
  });

  // White outline behind colored lines for contrast on any background
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

  map.addLayer({
    id: LINE_LAYER_ID,
    type: 'line',
    source: GEOJSON_SOURCE_ID,
    paint: {
      'line-color': colorExpr,
      'line-width': widthExpr,
    },
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

export interface MultipointMapProps {
  geojson: string | null;
  center?: [number, number];
  zoom?: number;
  small?: boolean;
  /** Called when user clicks the map -- returns [lng, lat] */
  onClick?: (lngLat: [number, number]) => void;
}

/**
 * MapLibre GL component for rendering multi-point tactical graphics as GeoJSON.
 * Lazy-loads maplibre-gl on first render.
 */
export function MultipointMap({
  geojson,
  center = [-98.5, 39.8],
  zoom = 4,
  small = false,
  onClick,
}: MultipointMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<InstanceType<typeof import('maplibre-gl').Map> | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [basemapIdx, setBasemapIdx] = useState(1);

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
        addGeoJsonLayers(map);
        mapRef.current = map;
        setLoaded(true);
      });

      if (onClick) {
        map.on('click', (e) => {
          onClick([e.lngLat.lng, e.lngLat.lat]);
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
    // Skip the first run -- initial style is already set in the constructor
    if (initialBasemapRef.current === basemapIdx) {
      initialBasemapRef.current = -1; // mark as consumed
      return;
    }
    const bm = BASEMAP_STYLES[basemapIdx];
    const map = mapRef.current;

    // setStyle removes all sources/layers, so re-add after style loads
    map.once('style.load', () => {
      addGeoJsonLayers(map);
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
      // Sanitize WebRenderer output for strict JSON parsers (Firefox):
      raw = raw
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/:\s*NaN/g, ':0')
        .replace(/:\s*-?Infinity/g, ':0')
        .replace(/:\s*undefined/g, ':null');
      try {
        const parsed = JSON.parse(raw);
        (source as import('maplibre-gl').GeoJSONSource).setData(parsed);

        // Auto-fit: zoom map to graphic bounds so nothing is clipped.
        // Use generous padding (30% of container size) to keep graphics
        // well within the thumbnail and account for labels/arrowheads.
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
