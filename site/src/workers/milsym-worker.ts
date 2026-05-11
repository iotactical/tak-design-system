// rtmx:req REQ-XW-137
// Web Worker for mil-sym-ts rendering
// Receives: { id: string, sidc: string, size: number, modifiers?: Record<string, string> }
// Returns: { id: string, svg: string } or { id: string, error: string }

export interface MilSymWorkerRequest {
  id: string;
  sidc: string;
  size: number;
  modifiers?: Record<string, string>;
}

export interface MilSymWorkerResponse {
  id: string;
  svg?: string;
  error?: string;
}

self.onmessage = async (e: MessageEvent<MilSymWorkerRequest>) => {
  const { id, sidc, size, modifiers } = e.data;
  try {
    // Dynamic import mil-sym-ts inside worker -- uses OffscreenCanvas for font metrics
    const milsym = await import('@armyc2.c5isr.renderer/mil-sym-ts');
    const { MilStdIconRenderer, RendererSettings } = milsym;

    const rs = RendererSettings.getInstance();
    rs.setDefaultPixelSize(size || 50);

    const renderer = MilStdIconRenderer.getInstance();
    const mods = new Map<string, string>();
    const attrs = new Map<string, string>();
    attrs.set('PIXELSIZE', String(size || 50));

    if (modifiers) {
      for (const [key, value] of Object.entries(modifiers)) {
        mods.set(key, value);
      }
    }

    // RenderSVG signature: (symbolID, modifiers, attributes)
    const result = renderer.RenderSVG(sidc, mods, attrs);
    if (result && result.getSVG) {
      const ib = result.getImageBounds();
      const w = ib ? ib.getWidth() : size;
      const h = ib ? ib.getHeight() : size;
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${result.getSVG()}</svg>`;
      (self as unknown as Worker).postMessage({ id, svg: svgContent });
    } else {
      (self as unknown as Worker).postMessage({ id, error: 'Render returned null' });
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
