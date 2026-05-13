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

const DEFAULT_BASEMAP = BASEMAP_STYLES[0];

const GEOJSON_SOURCE_ID = 'multipoint-source';
const LINE_LAYER_ID = 'multipoint-lines';
const FILL_LAYER_ID = 'multipoint-fills';
const LABEL_LAYER_ID = 'multipoint-labels';

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
  const [basemapIdx, setBasemapIdx] = useState(0);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let map: InstanceType<typeof import('maplibre-gl').Map> | null = null;

    loadMaplibre().then((maplibregl) => {
      if (cancelled || !containerRef.current) return;

      map = new maplibregl.Map({
        container: containerRef.current,
        style: DEFAULT_BASEMAP.style,
        center,
        zoom,
        attributionControl: false,
      });

      map.on('load', () => {
        if (cancelled || !map) return;

        map.addSource(GEOJSON_SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.addLayer({
          id: FILL_LAYER_ID,
          type: 'fill',
          source: GEOJSON_SOURCE_ID,
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': ['coalesce', ['get', 'fill'], '#4fc3f7'],
            'fill-opacity': 0.25,
          },
        });

        map.addLayer({
          id: LINE_LAYER_ID,
          type: 'line',
          source: GEOJSON_SOURCE_ID,
          paint: {
            'line-color': ['coalesce', ['get', 'stroke'], '#4fc3f7'],
            'line-width': ['coalesce', ['get', 'stroke-width'], 2],
          },
        });

        // REQ-XW-291: Symbol text labels from GeoJSON properties
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
            'text-color': ['coalesce', ['get', 'stroke'], '#ffffff'],
            'text-halo-color': '#000000',
            'text-halo-width': 1.5,
          },
        });

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

  // REQ-XW-276: Switch basemap style
  useEffect(() => {
    if (!loaded || !mapRef.current) return;
    const bm = BASEMAP_STYLES[basemapIdx];
    const map = mapRef.current;

    // setStyle removes all sources/layers, so we need to re-add after style loads
    map.once('style.load', () => {
      if (!map.getSource(GEOJSON_SOURCE_ID)) {
        map.addSource(GEOJSON_SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        map.addLayer({
          id: FILL_LAYER_ID,
          type: 'fill',
          source: GEOJSON_SOURCE_ID,
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': ['coalesce', ['get', 'fill'], '#4fc3f7'],
            'fill-opacity': 0.25,
          },
        });
        map.addLayer({
          id: LINE_LAYER_ID,
          type: 'line',
          source: GEOJSON_SOURCE_ID,
          paint: {
            'line-color': ['coalesce', ['get', 'stroke'], '#4fc3f7'],
            'line-width': ['coalesce', ['get', 'stroke-width'], 2],
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
            'text-color': ['coalesce', ['get', 'stroke'], '#ffffff'],
            'text-halo-color': '#000000',
            'text-halo-width': 1.5,
          },
        });
      }
    });

    map.setStyle(bm.style as string | import('maplibre-gl').StyleSpecification);
  }, [basemapIdx, loaded]);

  // Update GeoJSON source when data changes
  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const source = mapRef.current.getSource(GEOJSON_SOURCE_ID);
    if (!source || source.type !== 'geojson') return;

    if (geojson) {
      try {
        const parsed = typeof geojson === 'string' ? JSON.parse(geojson) : geojson;
        (source as import('maplibre-gl').GeoJSONSource).setData(parsed);
      } catch {
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
