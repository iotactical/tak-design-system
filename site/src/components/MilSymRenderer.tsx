// rtmx:req REQ-XW-085
import { useMemo } from 'react';
import manifest from '../../../data/2525-svg-manifest.json';

export interface MilSymRendererProps {
  /** SIDC in any format: B-pattern "S*A*MF----*****", 15-char, 20-char, or D-key "01-110100" */
  sidc: string;
  /** Pixel size of the rendered symbol (default 50) */
  size?: number;
  /** Affiliation: friendly, hostile, neutral, unknown */
  affiliation?: 'friendly' | 'hostile' | 'neutral' | 'unknown';
}

const BASE = import.meta.env.BASE_URL;
const svgManifest = manifest as Record<string, Record<string, string>>;

function charToAffiliation(ch: string): string {
  switch (ch) {
    case 'F': case '3': case '2': return 'friendly';
    case 'H': case '6': return 'hostile';
    case 'N': case '4': return 'neutral';
    default: return 'unknown';
  }
}

export function MilSymRenderer({ sidc, size = 50, affiliation }: MilSymRendererProps) {
  const imgSrc = useMemo(() => {
    if (!sidc || sidc.length < 5) return null;

    // Determine affiliation
    let aff = affiliation;
    if (!aff) {
      if (sidc.length >= 20) {
        aff = charToAffiliation(sidc.charAt(2));
      } else if (sidc.length >= 15) {
        aff = charToAffiliation(sidc.charAt(1));
      } else {
        aff = 'friendly';
      }
    }
    const affDir = aff || 'friendly';
    const affManifest = svgManifest[affDir];
    if (!affManifest) return null;

    // 1. Direct manifest lookup (works for B-pattern keys and D-keys like "01-110100")
    if (affManifest[sidc]) {
      return `${BASE}2525/${affDir}/${affManifest[sidc]}`;
    }

    // 2. For 20-char SIDCs: try direct filename match
    if (sidc.length === 20) {
      return `${BASE}2525/${affDir}/${sidc}.svg`;
    }

    // 3. For 15-char SIDCs: reconstruct B-pattern by replacing affiliation/status with wildcards
    if (sidc.length === 15) {
      let pattern = sidc.charAt(0) + '*' + sidc.charAt(2) + '*' + sidc.substring(4, 10) + '*****';
      if (affManifest[pattern]) {
        return `${BASE}2525/${affDir}/${affManifest[pattern]}`;
      }
    }

    return null;
  }, [sidc, affiliation]);

  if (!imgSrc) {
    return <div style={{ width: size, height: size }} />;
  }

  return (
    <img
      src={imgSrc}
      alt={sidc}
      width={size}
      height={size}
      loading="lazy"
      style={{ objectFit: 'contain' }}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

export default MilSymRenderer;
