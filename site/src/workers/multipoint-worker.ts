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
}

export interface MultipointWorkerResponse {
  id: string;
  geojson?: string;
  error?: string;
}

self.onmessage = async (e: MessageEvent<MultipointWorkerRequest>) => {
  const { id, symbolCode, controlPoints, scale, bbox, modifiers, attributes, format } = e.data;
  try {
    const milsym = await import('@armyc2.c5isr.renderer/mil-sym-ts-web');
    const { WebRenderer } = milsym;

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

    const result = WebRenderer.RenderSymbol(
      id,              // id
      '',              // name
      '',              // description
      symbolCode,      // symbolCode (20-char SIDC)
      controlPoints,   // controlPoints "lon,lat lon,lat ..." (space-separated)
      'clampToGround', // altitudeMode
      scale,           // scale
      bbox,            // bbox "left,bottom,right,top"
      mods,            // modifiers
      attrs,           // attributes
      outputFormat     // format
    );

    if (result) {
      // Pass affiliation info alongside raw GeoJSON so the component can
      // apply color mapping without needing to parse/re-stringify in the worker
      // (avoids Firefox strict JSON parse failures on WebRenderer output).
      const si = symbolCode.length >= 4 ? symbolCode.substring(2, 4) : '03';
      (self as unknown as Worker).postMessage({ id, geojson: result, si });
    } else {
      (self as unknown as Worker).postMessage({ id, error: 'RenderSymbol returned null' });
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
