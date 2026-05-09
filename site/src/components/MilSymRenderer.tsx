// rtmx:req REQ-XW-085
import { useMemo } from 'react';

/**
 * MilSymRenderer -- renders a simplified MIL-STD-2525 symbol frame
 * based on affiliation and dimension.
 *
 * The frame shape follows MIL-STD-2525 conventions:
 *   - Friendly:  rectangle (blue)
 *   - Hostile:   diamond (red)
 *   - Neutral:   square (green)
 *   - Unknown:   cloverleaf / quatrefoil (yellow)
 *
 * This is a foundation component. A follow-up will integrate
 * mil-sym-ts (github:missioncommand/mil-sym-ts) for full
 * symbol rendering with entity icons and modifiers.
 */

export interface MilSymRendererProps {
  /** 15-char (B/C) or 20-char (D/E) Symbol Identification Code */
  sidc: string;
  /** Pixel size of the rendered symbol (default 50) */
  size?: number;
  /** Optional text modifiers (future use with mil-sym-ts) */
  modifiers?: Record<string, string>;
  /** Optional label to display below the frame */
  label?: string;
}

/** Affiliation colors per MIL-STD-2525 */
const AFFILIATION_STYLES: Record<string, { fill: string; stroke: string; label: string }> = {
  F: { fill: '#80B0FF', stroke: '#3366CC', label: 'Friendly' },
  A: { fill: '#80B0FF', stroke: '#3366CC', label: 'Assumed Friend' },
  H: { fill: '#FF8080', stroke: '#CC3333', label: 'Hostile' },
  S: { fill: '#FF8080', stroke: '#CC3333', label: 'Suspect' },
  N: { fill: '#80FF80', stroke: '#33AA33', label: 'Neutral' },
  U: { fill: '#FFFF80', stroke: '#CCAA33', label: 'Unknown' },
  P: { fill: '#FFFF80', stroke: '#CCAA33', label: 'Pending' },
};

const DEFAULT_STYLE = { fill: '#C0C0C0', stroke: '#666666', label: 'Unknown' };

/**
 * Extract affiliation character from SIDC.
 * B/C format: position 1 (0-indexed)
 * D/E format: position 2 (standard identity digit 1)
 */
function getAffiliation(sidc: string): string {
  if (!sidc || sidc.length < 2) return 'U';

  if (sidc.length >= 20) {
    // D/E 20-char format: digits, position 2 = standard identity
    const si = sidc.charAt(2);
    // Map D/E numeric standard identity to B/C letter
    const siMap: Record<string, string> = {
      '0': 'P', // Pending
      '1': 'U', // Unknown
      '2': 'F', // Assumed Friend
      '3': 'F', // Friend
      '4': 'N', // Neutral
      '5': 'S', // Suspect/Joker
      '6': 'H', // Hostile/Faker
    };
    return siMap[si] || 'U';
  }

  // B/C 15-char format: position 1 = affiliation letter
  return sidc.charAt(1).toUpperCase();
}

/**
 * Determine the dimension / battle space from the SIDC.
 * Returns 'air' | 'ground' | 'sea' | 'subsurface' | 'space' | 'activity' | 'unknown'
 */
function getDimension(sidc: string): string {
  if (!sidc || sidc.length < 3) return 'unknown';

  if (sidc.length >= 20) {
    // D/E format: positions 4-5 = symbol set
    const ss = sidc.substring(4, 6);
    const ssNum = parseInt(ss, 10);
    if (ssNum >= 1 && ssNum <= 2) return 'air';
    if (ssNum === 5) return 'space';
    if (ssNum >= 10 && ssNum <= 20) return 'ground';
    if (ssNum === 25) return 'activity'; // control measures
    if (ssNum >= 30 && ssNum <= 30) return 'sea';
    if (ssNum >= 35 && ssNum <= 36) return 'subsurface';
    if (ssNum >= 40 && ssNum <= 46) return 'activity';
    if (ssNum >= 50 && ssNum <= 54) return 'ground'; // SIGINT
    if (ssNum === 60) return 'ground'; // cyber
    return 'unknown';
  }

  // B/C format: position 2 = battle dimension
  const dim = sidc.charAt(2).toUpperCase();
  const dimMap: Record<string, string> = {
    A: 'air',
    G: 'ground',
    S: 'sea',
    U: 'subsurface',
    P: 'space',
    F: 'activity',
    Z: 'unknown',
  };
  return dimMap[dim] || 'unknown';
}

/**
 * Render the appropriate frame shape as an SVG path / element.
 */
function renderFrame(
  affiliation: string,
  dimension: string,
  size: number,
): { svg: string; viewBox: string } {
  const style = AFFILIATION_STYLES[affiliation] || DEFAULT_STYLE;
  const sw = Math.max(1.5, size / 25); // stroke width

  // All frames fit in a 100x100 viewBox
  const vb = '0 0 100 100';

  // Friendly = rectangle, Hostile = diamond, Neutral = square, Unknown = cloverleaf
  if (affiliation === 'H' || affiliation === 'S') {
    // Diamond
    return {
      viewBox: vb,
      svg: `<polygon points="50,10 90,50 50,90 10,50" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${sw}" />`,
    };
  }

  if (affiliation === 'N') {
    // Square
    return {
      viewBox: vb,
      svg: `<rect x="15" y="15" width="70" height="70" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${sw}" />`,
    };
  }

  if (affiliation === 'U' || affiliation === 'P') {
    // Cloverleaf / quatrefoil (simplified as rounded rectangle with arcs)
    return {
      viewBox: vb,
      svg: `<path d="M50,8 C60,8 68,16 68,26 C78,26 90,34 90,50 C90,66 78,74 68,74 C68,84 60,92 50,92 C40,92 32,84 32,74 C22,74 10,66 10,50 C10,34 22,26 32,26 C32,16 40,8 50,8Z" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${sw}" />`,
    };
  }

  // Friendly / Assumed Friend = rectangle
  return {
    viewBox: vb,
    svg: `<rect x="10" y="20" width="80" height="60" rx="8" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${sw}" />`,
  };
}

export function MilSymRenderer({ sidc, size = 50, modifiers, label }: MilSymRendererProps) {
  const rendered = useMemo(() => {
    if (!sidc || sidc.length < 10) {
      return null;
    }

    const affiliation = getAffiliation(sidc);
    const dimension = getDimension(sidc);
    const frame = renderFrame(affiliation, dimension, size);

    return { frame, affiliation, dimension };
  }, [sidc, size]);

  if (!rendered) {
    return (
      <div
        data-testid="milsym-fallback"
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#878787',
          border: '1px dashed #3A3A3A',
          borderRadius: 4,
        }}
      >
        {sidc || '?'}
      </div>
    );
  }

  const { frame } = rendered;

  return (
    <div
      data-testid="milsym-renderer"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={frame.viewBox}
        xmlns="http://www.w3.org/2000/svg"
        dangerouslySetInnerHTML={{ __html: frame.svg }}
      />
      {label && (
        <span
          style={{
            fontSize: Math.max(8, size / 6),
            color: '#DAD4BC',
            textAlign: 'center',
            maxWidth: size * 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
