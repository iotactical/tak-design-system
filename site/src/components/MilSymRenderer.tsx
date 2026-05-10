// rtmx:req REQ-XW-085
import { useMemo } from 'react';
import manifest from '../../../data/2525-svg-manifest.json';

export interface MilSymRendererProps {
  /** The raw entity basic SIDC pattern (e.g. "S*A*MF----*****") */
  sidc: string;
  /** Pixel size of the rendered symbol (default 50) */
  size?: number;
  /** Affiliation: friendly, hostile, neutral, unknown (default friendly) */
  affiliation?: 'friendly' | 'hostile' | 'neutral' | 'unknown';
  /** Optional label to display below the frame */
  label?: string;
}

const BASE = import.meta.env.BASE_URL;
const svgManifest = manifest as Record<string, Record<string, string>>;

/** Map affiliation character to directory name */
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
    if (!sidc || sidc.length < 10) return null;

    // Determine affiliation from prop or SIDC character
    let aff = affiliation;
    if (!aff) {
      const ch = sidc.length >= 20 ? sidc.charAt(2) : (sidc.length >= 2 ? sidc.charAt(1) : 'U');
      aff = charToAffiliation(ch) as typeof affiliation;
    }
    const affDir = aff || 'friendly';

    // Try manifest lookup first (most reliable)
    // The manifest key is the raw entity.basic pattern with wildcards
    const affManifest = svgManifest[affDir];
    if (affManifest) {
      // Try exact match
      if (affManifest[sidc]) {
        return `${BASE}2525/${affDir}/${affManifest[sidc]}`;
      }
      // Try reconstructing the basic pattern by replacing affiliation back to *
      let basicPattern = sidc;
      if (sidc.length === 15) {
        basicPattern = sidc.charAt(0) + '*' + sidc.substring(2);
        // Also restore position 3 status to *
        if (basicPattern.charAt(3) === 'P' || basicPattern.charAt(3) === 'A') {
          basicPattern = basicPattern.substring(0, 3) + '*' + basicPattern.substring(4);
        }
        // Restore trailing dashes to *****
        basicPattern = basicPattern.substring(0, 10) + '*****';
      }
      if (affManifest[basicPattern]) {
        return `${BASE}2525/${affDir}/${affManifest[basicPattern]}`;
      }
    }

    // Fallback: construct filename directly
    let cleanSidc = sidc.replace(/[^A-Za-z0-9-]/g, '_');
    return `${BASE}2525/${affDir}/${cleanSidc}.svg`;
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
