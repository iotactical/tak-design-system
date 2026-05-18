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

    const mods = new Map<string, string>();
    const attrs = new Map<string, string>();

    if (modifiers) {
      for (const [key, value] of Object.entries(modifiers)) {
        mods.set(key, value);
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
      // Pass affiliation info alongside raw GeoJSON so the component can
      // apply color mapping without needing to parse/re-stringify in the worker
      // (avoids Firefox strict JSON parse failures on WebRenderer output).
      const si = renderCode.length >= 4 ? renderCode.substring(2, 4) : '03';
      (self as unknown as Worker).postMessage({ id, geojson: result, si });
    } else {
      (self as unknown as Worker).postMessage({ id, error: 'RenderSymbol returned null' });
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
