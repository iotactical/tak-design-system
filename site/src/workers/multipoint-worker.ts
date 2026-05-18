// rtmx:req REQ-XW-138
// Web Worker for multi-point tactical graphics rendering via mil-sym-ts WebRenderer.
// Receives: { id, symbolCode, controlPoints, scale, bbox, modifiers?, attributes?, format? }
// Returns: { id, geojson?: string } or { id, error: string }

export interface MultipointWorkerRequest {
  id: string;
  symbolCode: string;
  controlPoints: string;   // "lon,lat lon,lat ..." format (space-separated)
  scale: number;
  bbox: string;            // "left,bottom,right,top" format
  modifiers?: Record<string, string>;
  attributes?: Record<string, string>;
  format?: number;         // WebRenderer.OUTPUT_FORMAT_GEOJSON = 2 (default)
  /** When set, use RenderSymbol2D with pixel dimensions instead of scale */
  pixelWidth?: number;
  pixelHeight?: number;
}

export interface MultipointWorkerResponse {
  id: string;
  geojson?: string;
  error?: string;
}

const AFFILIATION_COLORS: Record<string, string> = {
  '03': '#4DA6FF',  // Friendly -> blue
  '06': '#FF4444',  // Hostile -> red
  '04': '#00CC00',  // Neutral -> green
  '01': '#FFFF00',  // Unknown -> yellow
};

/** Normalize WebRenderer GeoJSON for MapLibre consumption.
 *  - Copies feature.style.stroke/fill/stroke-width into feature.properties
 *  - Falls back camelCase properties (strokeColor, strokeWidth) to simplestyle
 *  - Replaces #000000 with affiliation-appropriate color
 *  - Filters out empty polygon features */
function normalizeGeoJson(geojsonStr: string, symbolCode: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = JSON.parse(geojsonStr) as any;
  if (json.type === 'error') return geojsonStr;

  const si = symbolCode.length >= 4 ? symbolCode.substring(2, 4) : '03';
  const blackReplace = AFFILIATION_COLORS[si] || '#4DA6FF';

  for (const f of json.features) {
    const p = f.properties || (f.properties = {});
    if (f.style) {
      if (f.style.stroke) p.stroke = f.style.stroke;
      if (f.style['stroke-width'] != null) p['stroke-width'] = f.style['stroke-width'];
      if (f.style.fill) p.fill = f.style.fill;
    }
    if (p.strokeColor && !p.stroke) p.stroke = p.strokeColor;
    if (p.strokeWidth && !p['stroke-width']) p['stroke-width'] = p.strokeWidth;
    if (p.stroke === '#000000') p.stroke = blackReplace;
    if (p.fill === '#000000') p.fill = blackReplace;
  }

  json.features = json.features.filter((f: { geometry?: { type?: string; coordinates?: unknown[] } }) => {
    const coords = f.geometry?.coordinates;
    if (!coords) return false;
    if (Array.isArray(coords) && coords.length === 0) return false;
    if (f.geometry!.type === 'Polygon' && (coords as unknown[][])[0]?.length === 0) return false;
    return true;
  });

  return JSON.stringify(json);
}

let renderCounter = 0;

// Signal to the host that the worker loaded successfully as a module
(self as unknown as Worker).postMessage({ type: 'ready' });

self.onmessage = async (e: MessageEvent<MultipointWorkerRequest>) => {
  const { id, symbolCode, controlPoints, scale, bbox, modifiers, attributes, format, pixelWidth, pixelHeight } = e.data;
  // Use a simple numeric ID for the renderer call -- the full cache key (id)
  // may contain JSON brackets/quotes from modifiers which corrupt GeoJSON output
  // when WebRenderer embeds the ID in its result strings.
  const renderId = String(++renderCounter);
  try {
    const milsym = await import('@armyc2.c5isr.renderer/mil-sym-ts-web');
    const { WebRenderer, C2DLookup } = milsym;

    // Convert 15-char B/C-series SIDCs to D-series for the renderer
    let renderCode = symbolCode;
    if (symbolCode.length === 15) {
      const lookup = C2DLookup.getInstance();
      const dCode = lookup.getDCode(symbolCode, true);
      if (dCode && dCode.length >= 20) {
        renderCode = dCode;
      } else {
        (self as unknown as Worker).postMessage({
          id,
          error: `Cannot convert B-series SIDC to D: ${symbolCode}`,
        });
        return;
      }
    }

    // mil-sym-ts expects full modifier key names (e.g. 'AM_DISTANCE' not 'AM').
    // Map short MIL-STD modifier letters to the internal property names.
    const MOD_KEY_MAP: Record<string, string> = {
      AM: 'AM_DISTANCE',
      AN: 'AN_AZIMUTH',
      T: 'T_UNIQUE_DESIGNATION_1',
      T1: 'T1_UNIQUE_DESIGNATION_2',
      W: 'W_DTG_1',
      W1: 'W1_DTG_2',
      X: 'X_ALTITUDE_DEPTH',
      C: 'C_QUANTITY',
      H: 'H_ADDITIONAL_INFO_1',
      H1: 'H1_ADDITIONAL_INFO_2',
      H2: 'H2_ADDITIONAL_INFO_3',
      N: 'N_HOSTILE',
      Q: 'Q_DIRECTION_OF_MOVEMENT',
      V: 'V_EQUIP_TYPE',
      Y: 'Y_LOCATION',
      AP: 'AP_TARGET_NUMBER',
      AS: 'AS_COUNTRY',
    };
    const mods = new Map<string, string>();
    const attrs = new Map<string, string>();

    if (modifiers) {
      for (const [key, value] of Object.entries(modifiers)) {
        mods.set(MOD_KEY_MAP[key] || key, value);
      }
    }
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        attrs.set(key, value);
      }
    }

    const outputFormat = format ?? 2;

    // Use RenderSymbol2D when pixel dimensions are provided -- this lets
    // the renderer derive decoration density from the actual viewport size,
    // producing cleaner scallops/zigzags for small gallery thumbnails.
    const result = (pixelWidth && pixelHeight)
      ? WebRenderer.RenderSymbol2D(
          renderId, '', '', renderCode, controlPoints,
          pixelWidth, pixelHeight, bbox,
          mods, attrs, outputFormat
        )
      : WebRenderer.RenderSymbol(
          renderId, '', '', renderCode, controlPoints,
          'clampToGround', scale, bbox,
          mods, attrs, outputFormat
        );

    if (result) {
      // WebRenderer returns {"type":"error",...} for single-point symbols
      // passed to the multipoint renderer. Detect and report as error.
      if (result.includes('"type":"error"')) {
        const errMatch = result.match(/"error"\s*:\s*"([^"]+)"/);
        (self as unknown as Worker).postMessage({
          id,
          error: errMatch ? errMatch[1] : 'RenderSymbol returned an error',
        });
        return;
      }
      // Normalize: copy style -> properties, replace black with affiliation color,
      // filter empty polygons. This makes GeoJSON directly consumable by MapLibre.
      const normalized = normalizeGeoJson(result, renderCode);
      (self as unknown as Worker).postMessage({ id, geojson: normalized });
    } else {
      (self as unknown as Worker).postMessage({ id, error: 'RenderSymbol returned null' });
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
