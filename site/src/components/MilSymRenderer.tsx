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
  /** Human-readable label for alt text (e.g., entity name) */
  label?: string;
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

export function MilSymRenderer({ sidc, size = 50, affiliation, label }: MilSymRendererProps) {
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

    // 2. For 20-char SIDCs: try D-key format "ss-entity" in manifest, then direct file
    if (sidc.length === 20) {
      const ss = sidc.substring(4, 6);
      const entity = sidc.substring(10, 16);
      const dKey = `${ss}-${entity}`;
      if (affManifest[dKey]) {
        return `${BASE}2525/${affDir}/${affManifest[dKey]}`;
      }
      // Try exact filename
      if (affManifest[sidc] !== undefined) {
        return `${BASE}2525/${affDir}/${affManifest[sidc]}`;
      }
      // Try pre-rendered file directly (only if we know it exists via manifest)
      return null;
    }

    // 3. For 15-char SIDCs: reconstruct B-pattern by replacing affiliation/status with wildcards
    if (sidc.length === 15) {
      const pattern = sidc.charAt(0) + '*' + sidc.charAt(2) + '*' + sidc.substring(4, 10) + '*****';
      if (affManifest[pattern]) {
        return `${BASE}2525/${affDir}/${affManifest[pattern]}`;
      }
    }

    return null;
  }, [sidc, affiliation]);

  // Determine symbol category for fallback icon
  const fallbackIcon = useMemo(() => {
    if (!sidc || sidc.length < 3) return null;

    // B/C format (15-char): check position 0
    const ch = sidc.charAt(0);
    if (ch === 'W') {
      const dim = sidc.charAt(1);
      if (dim === 'O') return { label: 'OCN', color: '#2196F3' };
      if (dim === 'A') return { label: 'ATM', color: '#FF9800' };
      if (dim === 'S') return { label: 'SPC', color: '#9C27B0' };
      return { label: 'MET', color: '#607D8B' };
    }
    if (ch === 'G') {
      return { label: 'TG', color: '#4CAF50' };
    }

    // D/E format (20-char): check symbol set at positions 5-6
    if (sidc.length === 20) {
      const ss = sidc.substring(4, 6);
      if (ss === '25') return { label: 'TG', color: '#4CAF50' };
      if (ss === '45') return { label: 'ATM', color: '#FF9800' };
      if (ss === '46') return { label: 'OCN', color: '#2196F3' };
      if (ss === '47') return { label: 'SPC', color: '#9C27B0' };
    }

    return null;
  }, [sidc]);

  if (!imgSrc) {
    if (fallbackIcon) {
      return (
        <div style={{
          width: size, height: size,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px dashed #444', borderRadius: 4,
          fontSize: Math.max(9, size * 0.22), fontWeight: 700,
          color: fallbackIcon.color, fontFamily: "'Roboto Mono', monospace",
        }}>
          {fallbackIcon.label}
        </div>
      );
    }
    return <div style={{ width: size, height: size }} />;
  }

  return (
    <img
      src={imgSrc}
      alt={label ? `${label} (${sidc})` : sidc}
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
