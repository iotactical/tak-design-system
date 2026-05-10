// rtmx:req REQ-XW-085
import { useEffect, useRef, useState, useMemo } from 'react';

export interface MilSymRendererProps {
  /** 15-char (B/C) or 20-char (D/E) Symbol Identification Code */
  sidc: string;
  /** Pixel size of the rendered symbol (default 50) */
  size?: number;
  /** Optional text modifiers */
  modifiers?: Record<string, string>;
  /** Optional label to display below the frame */
  label?: string;
}

// Lazy-load mil-sym-ts only once
let milSymModule: any = null;
let milSymLoading = false;
let milSymCallbacks: (() => void)[] = [];

function loadMilSym(): Promise<void> {
  if (milSymModule) return Promise.resolve();
  if (milSymLoading) {
    return new Promise((resolve) => { milSymCallbacks.push(resolve); });
  }
  milSymLoading = true;
  return import('@armyc2.c5isr.renderer/mil-sym-ts-web').then((mod) => {
    milSymModule = mod;
    milSymLoading = false;
    milSymCallbacks.forEach((cb) => cb());
    milSymCallbacks = [];
  }).catch((err) => {
    console.warn('mil-sym-ts failed to load:', err);
    milSymLoading = false;
  });
}

export function MilSymRenderer({ sidc, size = 50, modifiers, label }: MilSymRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(!!milSymModule);
  const [svgContent, setSvgContent] = useState<string | null>(null);

  // Load mil-sym-ts on first render
  useEffect(() => {
    if (!milSymModule) {
      loadMilSym().then(() => setLoaded(true));
    }
  }, []);

  // Render the symbol when SIDC or module changes
  useEffect(() => {
    if (!loaded || !milSymModule || !sidc || sidc.length < 10) {
      setSvgContent(null);
      return;
    }

    try {
      const { MilStdIconRenderer, MilStdAttributes, RendererSettings } = milSymModule;

      const rs = RendererSettings.getInstance();
      rs.setDefaultPixelSize(size);

      const renderer = MilStdIconRenderer.getInstance();
      if (!renderer.isReady()) {
        // Renderer needs a tick to initialize
        setTimeout(() => {
          try {
            const attrs = new Map();
            attrs.set(MilStdAttributes.PixelSize, size);
            const result = renderer.RenderSVG(sidc, attrs);
            if (result) {
              setSvgContent(result.getSVG());
            }
          } catch (e) {
            console.warn('mil-sym-ts render error:', e);
          }
        }, 100);
        return;
      }

      const attrs = new Map();
      attrs.set(MilStdAttributes.PixelSize, size);

      if (modifiers) {
        for (const [key, value] of Object.entries(modifiers)) {
          attrs.set(key, value);
        }
      }

      const result = renderer.RenderSVG(sidc, attrs);
      if (result) {
        setSvgContent(result.getSVG());
      }
    } catch (e) {
      console.warn('mil-sym-ts render failed for SIDC:', sidc, e);
      setSvgContent(null);
    }
  }, [loaded, sidc, size, modifiers]);

  // Fallback: show simplified frame if mil-sym-ts hasn't loaded
  const fallbackSvg = useMemo(() => {
    if (svgContent) return null;
    const affChar = sidc.length >= 20 ? sidc.charAt(2) : (sidc.length >= 2 ? sidc.charAt(1) : '0');
    const colors: Record<string, { fill: string; stroke: string }> = {
      '3': { fill: '#80C0FF', stroke: '#006BE6' }, // Friendly
      'F': { fill: '#80C0FF', stroke: '#006BE6' },
      '6': { fill: '#FF8080', stroke: '#C80000' }, // Hostile
      'H': { fill: '#FF8080', stroke: '#C80000' },
      '4': { fill: '#AAFFAA', stroke: '#00A000' }, // Neutral
      'N': { fill: '#AAFFAA', stroke: '#00A000' },
      '1': { fill: '#FFFF80', stroke: '#C8C800' }, // Unknown
      'U': { fill: '#FFFF80', stroke: '#C8C800' },
    };
    const c = colors[affChar] || { fill: '#FFFF80', stroke: '#C8C800' };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect x="4" y="4" width="${size - 8}" height="${size - 8}" rx="3" fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + 3}" text-anchor="middle" font-size="8" fill="${c.stroke}" font-family="sans-serif">?</text>
    </svg>`;
  }, [sidc, size, svgContent]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{ __html: svgContent || fallbackSvg || '' }}
    />
  );
}

export default MilSymRenderer;
