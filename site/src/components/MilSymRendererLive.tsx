// rtmx:req REQ-XW-137
import { useState, useEffect } from 'react';
import { useMilSymWorker } from '../hooks/useMilSymWorker';
import { MilSymRenderer, MilSymRendererProps } from './MilSymRenderer';

export interface MilSymRendererLiveProps extends MilSymRendererProps {
  /** Additional modifiers passed to mil-sym-ts renderer */
  modifiers?: Record<string, string>;
  /** If true, skip worker and use only pre-rendered fallback */
  staticOnly?: boolean;
}

/**
 * Live symbol renderer using Web Worker with mil-sym-ts.
 * Falls back to pre-rendered SVG (MilSymRenderer) if the worker fails.
 * Shows a loading state while the worker processes.
 *
 * Used for interactive features: Build tab, modifier inspector, echelon changes.
 */
export function MilSymRendererLive({
  sidc,
  size = 50,
  affiliation,
  modifiers,
  staticOnly = false,
}: MilSymRendererLiveProps) {
  const { renderSymbol, ready } = useMilSymWorker();
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(!staticOnly);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (staticOnly || !ready) return;

    let cancelled = false;
    setLoading(true);

    renderSymbol(sidc, size, modifiers).then((result) => {
      if (cancelled) return;
      if (result) {
        setSvg(result);
        setFailed(false);
      } else {
        setFailed(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [sidc, size, modifiers, staticOnly, ready, renderSymbol]);

  // If static only or worker failed, use pre-rendered fallback
  if (staticOnly || failed) {
    return <MilSymRenderer sidc={sidc} size={size} affiliation={affiliation} />;
  }

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.4,
        }}
        aria-label="Loading symbol"
      >
        <MilSymRenderer sidc={sidc} size={size} affiliation={affiliation} />
      </div>
    );
  }

  // Render live SVG from worker -- allow height to expand for amplifiers
  if (svg) {
    return (
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label={`Military symbol ${sidc}`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  // Fallback
  return <MilSymRenderer sidc={sidc} size={size} affiliation={affiliation} />;
}

export default MilSymRendererLive;
