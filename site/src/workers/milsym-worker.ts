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

/**
 * mil-sym-ts 2525Ech1 (15) looks only in the E SVG table, so many D entities render as
 * an empty frame. Try Ech1 padded to 22 chars, then 2525E (13), then D-ch1 (11).
 */
function rendererSidcCandidates(sidc: string): string[] {
  const candidates = [sidc];
  if (sidc.length === 20) {
    const rest = sidc.slice(2);
    if (sidc.startsWith('15')) {
      candidates.push(`${sidc}00`, `13${rest}`, `11${rest}`);
    } else if (sidc.startsWith('13')) {
      candidates.push(`11${rest}`);
    }
  } else if (sidc.length > 20) {
    const rest = sidc.slice(2, 20);
    if (sidc.startsWith('15')) {
      candidates.push(`13${rest}`, `11${rest}`);
    }
  }
  return [...new Set(candidates)];
}

function packSvg(
  result: { getSVG: () => string; getImageBounds?: () => { getX(): number; getY(): number; getWidth(): number; getHeight(): number } },
  size: number,
): string | null {
  const inner = result.getSVG();
  if (!inner) return null;
  const trimmed = String(inner).trim();
  // The renderer already returns a complete <svg> once amplifiers are laid out.
  // Wrapping that again with viewBox 0 0 w h clips echelon / HQ drawn above the frame.
  if (trimmed.startsWith('<svg')) return trimmed;
  const ib = result.getImageBounds?.();
  const x = ib ? ib.getX() : 0;
  const y = ib ? ib.getY() : 0;
  const w = ib ? ib.getWidth() : size;
  const h = ib ? ib.getHeight() : size;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}">${trimmed}</svg>`;
}

self.onmessage = async (e: MessageEvent<MilSymWorkerRequest>) => {
  const { id, sidc, size, modifiers } = e.data;
  try {
    // Dynamic import mil-sym-ts-web (superset of mil-sym-ts) so both workers share
    // one renderer package, eliminating a duplicate 6.9 MB chunk from the build.
    const milsym = await import('@armyc2.c5isr.renderer/mil-sym-ts-web');
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

    let packed: string | null = null;
    for (const candidate of rendererSidcCandidates(sidc)) {
      const result = renderer.RenderSVG(candidate, mods, attrs);
      if (result && result.getSVG) {
        const next = packSvg(result, size || 50);
        if (!next) continue;
        // Frame-only E renders are shorter than the same SIDC with a D/E icon.
        if (!packed || next.length > packed.length) packed = next;
      }
    }

    if (packed) {
      (self as unknown as Worker).postMessage({ id, svg: packed });
    } else {
      (self as unknown as Worker).postMessage({ id, error: 'Render returned null' });
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
