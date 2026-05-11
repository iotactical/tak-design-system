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
    // Dynamic import mil-sym-ts inside worker to avoid main-thread getFont() crash
    const milsym = await import('@anthropic-ai/mil-sym-ts-web');
    const { MilStdIconRenderer, MilStdAttributes, RendererSettings } = milsym;

    const rs = RendererSettings.getInstance();
    rs.setDefaultPixelSize(size || 50);

    const renderer = MilStdIconRenderer.getInstance();
    const attrs = new Map<string, string>();
    attrs.set(MilStdAttributes.PixelSize, String(size || 50));

    if (modifiers) {
      for (const [key, value] of Object.entries(modifiers)) {
        attrs.set(key, value);
      }
    }

    const result = renderer.RenderSVG(sidc, attrs);
    if (result && result.getSVG) {
      (self as unknown as Worker).postMessage({ id, svg: result.getSVG() });
    } else {
      (self as unknown as Worker).postMessage({ id, error: 'Render returned null' });
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
