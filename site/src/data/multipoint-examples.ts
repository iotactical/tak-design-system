// rtmx:req REQ-XW-088
// Canonical coordinate arrays for multi-point gallery thumbnails.
// Each entry defines representative geometry for a control measure type.
// Coordinates are in lon,lat format as required by mil-sym-ts WebRenderer.

export interface MultipointExample {
  /** Human-readable name */
  name: string;
  /** 20-char SIDC (friendly affiliation, present status) */
  sidc: string;
  /** B-series SIDC pattern */
  bSidc: string;
  /** Entity code within Symbol Set 25 */
  entityCode: string;
  /** lon,lat pairs separated by spaces for WebRenderer (e.g., "lon,lat lon,lat") */
  controlPoints: string;
  /** Minimum anchor points per the standard */
  minPoints: number;
  /** Maximum anchor points (0 = unlimited) */
  maxPoints: number;
  /** Brief tactical description */
  description: string;
  /** Graphic type category */
  category: 'line' | 'area' | 'point' | 'arrow';
}

// Build a 20-char SIDC for SS 25: 10 [SI=3 friendly] [Status=0 present] 25 [HQ=0] [Ech=00] [Entity] [Mod1=00] [Mod2=00]
function ss25Sidc(entityCode: string): string {
  return `10030025000${entityCode}0000`;
}

export const MULTIPOINT_EXAMPLES: MultipointExample[] = [
  {
    name: 'Boundary',
    sidc: ss25Sidc('110100'),
    bSidc: 'G*G*GLB---****X',
    entityCode: '110100',
    controlPoints: '-99.0,38.0 -97.5,38.5 -96.0,38.2 -94.5,38.8',
    minPoints: 2,
    maxPoints: 0,
    description: 'Line separating areas of responsibility between adjacent units.',
    category: 'line',
  },
  {
    name: 'Phase Line',
    sidc: ss25Sidc('110300'),
    bSidc: 'G*G*GLP---****X',
    entityCode: '110300',
    controlPoints: '-98.5,37.0 -97.0,37.5 -95.5,37.2',
    minPoints: 2,
    maxPoints: 0,
    description: 'Named line used for coordination and control of operations (e.g., PL ALPHA).',
    category: 'line',
  },
  {
    name: 'Forward Line of Own Troops (FLOT)',
    sidc: ss25Sidc('110400'),
    bSidc: 'G*G*GLF---****X',
    entityCode: '110400',
    controlPoints: '-99.0,36.0 -97.5,36.3 -96.0,36.1 -94.5,36.5',
    minPoints: 2,
    maxPoints: 0,
    description: 'Forward-most positions of friendly forces at a given time.',
    category: 'line',
  },
  {
    name: 'Line of Contact',
    sidc: ss25Sidc('110500'),
    bSidc: 'G*G*GLC---****X',
    entityCode: '110500',
    controlPoints: '-98.5,35.0 -97.0,35.4 -95.5,35.1',
    minPoints: 2,
    maxPoints: 0,
    description: 'General trace of contact between opposing forces.',
    category: 'line',
  },
  {
    name: 'Area of Operations',
    sidc: ss25Sidc('120100'),
    bSidc: 'G*G*SAO---****X',
    entityCode: '120100',
    controlPoints: '-98.0,39.0 -96.0,39.0 -96.0,37.5 -98.0,37.5',
    minPoints: 3,
    maxPoints: 0,
    description: 'Defined geographic area for a unit to conduct military operations.',
    category: 'area',
  },
  {
    name: 'Named Area of Interest',
    sidc: ss25Sidc('120200'),
    bSidc: 'G*G*SAN---****X',
    entityCode: '120200',
    controlPoints: '-97.5,38.5 -96.5,38.5 -96.5,37.8 -97.5,37.8',
    minPoints: 3,
    maxPoints: 0,
    description: 'Defined area where enemy activity is expected to provide intelligence.',
    category: 'area',
  },
  {
    name: 'Engagement Area',
    sidc: ss25Sidc('140100'),
    bSidc: 'G*F*ACEI--****X',
    entityCode: '140100',
    controlPoints: '-97.0,38.0 -96.0,38.2 -95.8,37.5 -96.5,37.3 -97.2,37.6',
    minPoints: 3,
    maxPoints: 0,
    description: 'Area where the commander plans to mass fires to destroy an enemy force.',
    category: 'area',
  },
  {
    name: 'Axis of Advance',
    sidc: ss25Sidc('150100'),
    bSidc: 'G*G*OLAV--****X',
    entityCode: '150100',
    controlPoints: '-99.0,37.0 -98.0,37.5 -97.0,37.3 -96.0,37.8',
    minPoints: 3,
    maxPoints: 0,
    description: 'General route of advance for a maneuver element.',
    category: 'arrow',
  },
  {
    name: 'Direction of Attack',
    sidc: ss25Sidc('150200'),
    bSidc: 'G*G*OLKA--****X',
    entityCode: '150200',
    controlPoints: '-98.5,36.5 -97.5,37.0 -96.5,37.2',
    minPoints: 2,
    maxPoints: 0,
    description: 'Arrow indicating the primary direction of an attack.',
    category: 'arrow',
  },
  {
    name: 'Fire Support Coordination Line (FSCL)',
    sidc: ss25Sidc('110600'),
    bSidc: 'G*F*LCF---****X',
    entityCode: '110600',
    controlPoints: '-99.5,38.5 -98.0,38.8 -96.5,38.3 -95.0,38.6',
    minPoints: 2,
    maxPoints: 0,
    description: 'Line beyond which fire support may be delivered without additional coordination.',
    category: 'line',
  },
  {
    name: 'Coordinated Fire Line (CFL)',
    sidc: ss25Sidc('110700'),
    bSidc: 'G*F*LCC---****X',
    entityCode: '110700',
    controlPoints: '-99.0,37.5 -97.5,37.8 -96.0,37.4',
    minPoints: 2,
    maxPoints: 0,
    description: 'Line beyond which fires may be delivered without coordination with the affected commander.',
    category: 'line',
  },
  {
    name: 'Minimum Risk Route (MRR)',
    sidc: ss25Sidc('160100'),
    bSidc: 'G*G*ALC---****X',
    entityCode: '160100',
    controlPoints: '-99.0,39.5 -97.5,39.8 -96.0,39.3 -94.5,39.6',
    minPoints: 2,
    maxPoints: 0,
    description: 'Recommended route to minimize risk from friendly surface fires.',
    category: 'line',
  },
];

/** Map from entity code to example for quick lookup */
export const EXAMPLE_BY_ENTITY: Record<string, MultipointExample> =
  Object.fromEntries(MULTIPOINT_EXAMPLES.map((e) => [e.entityCode, e]));

/** Available categories for filtering */
export const MULTIPOINT_CATEGORIES = ['line', 'area', 'arrow', 'point'] as const;
