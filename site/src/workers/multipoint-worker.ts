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

    // WebRenderer.RenderSymbol returns a KML/GeoJSON/GeoSVG string
    // OUTPUT_FORMAT_GEOJSON = 2
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
      (self as unknown as Worker).postMessage({ id, geojson: result });
    } else {
      (self as unknown as Worker).postMessage({ id, error: 'RenderSymbol returned null' });
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
