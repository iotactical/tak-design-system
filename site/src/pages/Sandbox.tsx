// rtmx:req REQ-SITE-038
// rtmx:req REQ-SITE-039
// rtmx:req REQ-SITE-040
// rtmx:req REQ-SITE-041
// rtmx:req REQ-SITE-042
// rtmx:req REQ-XW-103
// rtmx:req REQ-XW-119
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MilSymRendererLive } from '../components/MilSymRendererLive';
import styles from './Sandbox.module.css';
import bEntitiesData from '../../../data/mil-std-2525/b-entities.json';
import b2dData from '../../../data/mil-std-2525/b2d.json';
import b2cData from '../../../data/mil-std-2525/b2c.json';
import c2dRefData from '../../../data/mil-std-2525/c2d-reference.json';

// ----- Types -----

interface BEntity {
  basic: string;
  ss: string;
  ec: string;
  b_compat: boolean;
  label: string;
}

interface B2DMapping {
  b_sidc: string;
  d_ss: string;
  d_ec: string;
  d_s1: string;
  d_s2: string;
  label: string;
  lossy: boolean;
}

interface B2CMapping {
  b_sidc: string;
  c_sidc: string;
  match_type: string;
}

interface C2DSymbol {
  basic: string;
  ss: string;
  ec: string;
  s1: string;
  s2: string;
  e?: string;
  et?: string;
  est?: string;
}

// ----- Constants -----

const SYMBOL_SET_NAMES: Record<string, string> = {
  '01': 'Air',
  '02': 'Air Missile',
  '05': 'Space',
  '10': 'Land Unit',
  '11': 'Land Civilian',
  '15': 'Land Equipment',
  '20': 'Land Installation',
  '25': 'Control Measures',
  '30': 'Sea Surface',
  '35': 'Sea Subsurface',
  '36': 'Mine Warfare',
  '40': 'Activities',
};

const STANDARD_IDENTITY_NAMES: Record<string, string> = {
  '0': 'Pending',
  '1': 'Unknown',
  '2': 'Assumed Friend',
  '3': 'Friend',
  '4': 'Neutral',
  '5': 'Suspect/Joker',
  '6': 'Hostile/Faker',
};

const STATUS_NAMES: Record<string, string> = {
  '0': 'Present',
  '1': 'Planned/Anticipated',
};

const ECHELON_NAMES: Record<string, string> = {
  '00': 'Unspecified',
  '11': 'Team/Crew',
  '12': 'Squad',
  '13': 'Section',
  '14': 'Platoon',
  '15': 'Company/Battery',
  '16': 'Battalion/Squadron',
  '17': 'Regiment/Group',
  '18': 'Brigade',
  '19': 'Division',
  '20': 'Corps',
  '21': 'Army',
  '22': 'Front',
  '23': 'Region',
  '24': 'Command',
};

const HQ_TF_FD_NAMES: Record<string, string> = {
  '0': 'Not Applicable',
  '1': 'Feint/Dummy',
  '2': 'Headquarters',
  '3': 'Feint/Dummy HQ',
  '4': 'Task Force',
  '5': 'Feint/Dummy TF',
  '6': 'Task Force HQ',
  '7': 'Feint/Dummy TF HQ',
};

// ----- Helpers -----

/** D/E echelon code -> B/C position 11 character */
const ECHELON_D_TO_BC: Record<string, string> = {
  '00': '-', '11': 'A', '12': 'B', '13': 'C', '14': 'D',
  '15': 'E', '16': 'F', '17': 'G', '18': 'H', '21': 'I',
  '22': 'J', '23': 'K', '24': 'L', '25': 'M', '26': 'N',
};

/** D/E HQ/TF/FD code -> B/C position 12 character */
const HQTFFD_D_TO_BC: Record<string, string> = {
  '0': '-', '1': 'D', '2': 'A', '3': 'E', '4': 'C', '5': 'F', '6': 'B', '7': 'G',
};

function buildSidc15(basic: string, affiliationChar: string, echelon?: string, hqtffd?: string): string {
  if (!basic || basic.length < 2) return basic;
  let sidc = basic.charAt(0) + affiliationChar + basic.substring(2);
  if (sidc.charAt(3) === '*') {
    sidc = sidc.substring(0, 3) + 'P' + sidc.substring(4);
  }
  sidc = sidc.replace(/\*/g, '-');
  // Encode echelon at position 11 and HQ/TF/FD at position 12
  if (echelon || hqtffd) {
    const pos11 = (echelon && ECHELON_D_TO_BC[echelon]) || sidc.charAt(10);
    const pos12 = (hqtffd && HQTFFD_D_TO_BC[hqtffd]) || sidc.charAt(11);
    sidc = sidc.substring(0, 10) + pos11 + pos12 + sidc.substring(12);
  }
  return sidc;
}

function buildDSidc(mapping: B2DMapping, si: string): string {
  // 20-char: version(2) + context(1) + SI(1) + SS(2) + status(1) + HQ(1) + echelon(2) + entity(6) + mod1(2) + mod2(2)
  return `100${si}${mapping.d_ss}0000${mapping.d_ec}${mapping.d_s1}${mapping.d_s2}`;
}

// ----- Data -----

const bEntities = (bEntitiesData as { entities: BEntity[] }).entities;
const b2dMappings = (b2dData as { mappings: B2DMapping[] }).mappings;
const b2cMappings = b2cData as B2CMapping[];
const c2dSymbols = (c2dRefData as { c2d: { symbols: C2DSymbol[] } }).c2d.symbols;

// ----- Modifier Helpers -----

interface ModifierOption {
  value: string;
  label: string;
}

function getModifierOptions(symbolSet: string, field: 's1' | 's2'): ModifierOption[] {
  const key = field === 's1' ? 'd_s1' : 'd_s2';
  const seen = new Map<string, string>();
  seen.set('00', 'None');
  for (const m of b2dMappings) {
    if (m.d_ss !== symbolSet) continue;
    const val = m[key];
    if (val === '00' || seen.has(val)) continue;
    seen.set(val, `${val} - ${m.label}`);
  }
  return Array.from(seen.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, label]) => ({ value, label }));
}

function findB2DMapping(entity: BEntity): B2DMapping | undefined {
  return b2dMappings.find((m) => m.d_ss === entity.ss && m.d_ec === entity.ec);
}

function buildDSidcFromEntity(entity: BEntity, si: string, s1: string, s2: string): string {
  // 20-char: version(2) + context(1) + SI(1) + SS(2) + status(1) + HQ(1) + echelon(2) + entity(6) + mod1(2) + mod2(2)
  return `100${si}${entity.ss}0000${entity.ec}${s1}${s2}`;
}


const DEFAULT_B = 'SFGPU-----*****';
const DEFAULT_C = 'SFGPU-----*****';
const DEFAULT_D = '10031000001100000000';
const DEFAULT_E = '15031000001100000000';
const SI_CYCLE = ['0', '1', '3', '4', '6'];
const DEFAULT_PREVIEW = 180;
const MIN_PREVIEW = 80;
const MAX_PREVIEW = 480;

/** 20-char SIDC: version(2) + context(1) + SI(1) + SS(2) + status(1) + HQ(1) + echelon(2) + entity(6) + mod1(2) + mod2(2) */
function composeSidc20(
  version: '10' | '15',
  si: string,
  ss: string,
  status: string,
  hqtffd: string,
  echelon: string,
  entity: string,
  mod1: string,
  mod2: string,
): string {
  return `${version}0${si}${ss}${status}${hqtffd}${echelon}${entity}${mod1}${mod2}`;
}

function parseD20(sidc: string) {
  if (sidc.length !== 20) return null;
  const d = sidc.startsWith('10') ? sidc : `10${sidc.slice(2)}`;
  return {
    dSidc: d,
    eSidc: composeSidc20('15', d.charAt(3), d.slice(4, 6), d.charAt(6), d.charAt(7), d.slice(8, 10), d.slice(10, 16), d.slice(16, 18), d.slice(18, 20)),
    si: d.charAt(3),
    ss: d.slice(4, 6),
    status: d.charAt(6),
    hqtffd: d.charAt(7),
    echelon: d.slice(8, 10),
    entityCode: d.slice(10, 16),
    mod1: d.slice(16, 18),
    mod2: d.slice(18, 20),
  };
}

function hydrateSidcParam(raw: string | null) {
  if (!raw) return null;
  const sidc = raw.trim();
  if (/^\d{20}$/.test(sidc)) {
    const fields = parseD20(sidc);
    if (!fields) return null;
    const cBasic = lookupD2C(fields.ss, fields.entityCode);
    const affil = SI_TO_AFFIL[fields.si] || 'F';
    let bSidc = '';
    let cSidc = '';
    if (cBasic) {
      cSidc = buildSidc15(cBasic, affil, fields.echelon, fields.hqtffd);
      const bBasic = lookupC2B(cBasic);
      bSidc = bBasic ? buildSidc15(bBasic, affil, fields.echelon, fields.hqtffd) : cSidc;
    }
    return { ...fields, bSidc, cSidc };
  }
  if (sidc.length === 15) {
    const v = sidc.toUpperCase();
    const affil = v.charAt(1);
    const cBasic = lookupB2C(v);
    const cFull = cBasic ? buildSidc15(cBasic, affil) : v;
    const dFields = cBasic ? lookupC2D(cBasic) : null;
    const siChar = AFFIL_TO_SI[affil] || '3';
    if (!dFields) {
      return {
        bSidc: v,
        cSidc: cFull,
        dSidc: DEFAULT_D,
        eSidc: DEFAULT_E,
        si: siChar,
        ss: '10',
        status: '0',
        hqtffd: '0',
        echelon: '00',
        entityCode: '110000',
        mod1: '00',
        mod2: '00',
      };
    }
    const newD = composeSidc20('10', siChar, dFields.ss, '0', '0', '00', dFields.ec, dFields.s1, dFields.s2);
    return {
      bSidc: v,
      cSidc: cFull,
      dSidc: newD,
      eSidc: composeSidc20('15', siChar, dFields.ss, '0', '0', '00', dFields.ec, dFields.s1, dFields.s2),
      si: siChar,
      ss: dFields.ss,
      status: '0',
      hqtffd: '0',
      echelon: '00',
      entityCode: dFields.ec,
      mod1: dFields.s1,
      mod2: dFields.s2,
    };
  }
  return null;
}

// ----- Build Tab Helpers -----

/** Match B SIDC patterns using wildcard '*' at affiliation position */
function matchBSidc(pattern: string, candidate: string): boolean {
  if (pattern.length !== candidate.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '*' || candidate[i] === '*') continue;
    if (pattern[i] !== candidate[i]) return false;
  }
  return true;
}

/** Given a B SIDC, find the C equivalent via b2c crosswalk */
function lookupB2C(bSidc: string): string | null {
  const normalized = bSidc.charAt(0) + '*' + bSidc.substring(2);
  const entry = b2cMappings.find((m) => matchBSidc(m.b_sidc, normalized));
  return entry ? entry.c_sidc : null;
}

/** Given a C SIDC (basic pattern), find the D equivalent via c2d-reference */
function lookupC2D(cSidc: string): { ss: string; ec: string; s1: string; s2: string } | null {
  const normalized = cSidc.charAt(0) + '*' + cSidc.substring(2);
  const entry = c2dSymbols.find((s) => matchBSidc(s.basic, normalized));
  return entry ? { ss: entry.ss, ec: entry.ec, s1: entry.s1, s2: entry.s2 } : null;
}

/** Reverse lookup: given D fields, find C basic SIDC */
function lookupD2C(ss: string, ec: string): string | null {
  const entry = c2dSymbols.find((s) => s.ss === ss && s.ec === ec);
  return entry ? entry.basic : null;
}

/** Reverse lookup: given C SIDC, find B SIDC via b2c */
function lookupC2B(cSidc: string): string | null {
  const normalized = cSidc.charAt(0) + '*' + cSidc.substring(2);
  const entry = b2cMappings.find((m) => matchBSidc(m.c_sidc, normalized));
  return entry ? entry.b_sidc : null;
}

// B affiliation char to D standard identity digit mapping
const AFFIL_TO_SI: Record<string, string> = {
  'P': '0', 'U': '1', 'A': '2', 'F': '3', 'N': '4', 'S': '5', 'H': '6', 'J': '5', 'K': '6',
};
const SI_TO_AFFIL: Record<string, string> = {
  '0': 'P', '1': 'U', '2': 'A', '3': 'F', '4': 'N', '5': 'S', '6': 'H',
};

// ----- Build Tab -----

function BuildPanel() {

  const [searchParams, setSearchParams] = useSearchParams();
  const seed = useRef(hydrateSidcParam(searchParams.get('sidc'))).current;
  const skipUrl = useRef(seed == null);


  // Four SIDC strings -- default: Command and Control (Land Unit)
  const [bSidc, setBSidc] = useState(seed?.bSidc ?? DEFAULT_B);
  const [cSidc, setCSidc] = useState(seed?.cSidc ?? DEFAULT_C);
  const [dSidc, setDSidc] = useState(seed?.dSidc ?? DEFAULT_D);
  const [eSidc, setESidc] = useState(seed?.eSidc ?? DEFAULT_E);

  // Fuzzy entity search
  const [entitySearch, setEntitySearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // D/E field dropdowns
  const [si, setSi] = useState(seed?.si ?? '3');
  const [ss, setSs] = useState(seed?.ss ?? '10');
  const [status, setStatus] = useState(seed?.status ?? '0');
  const [hqtffd, setHqtffd] = useState(seed?.hqtffd ?? '0');
  const [echelon, setEchelon] = useState(seed?.echelon ?? '00');
  const [entityCode, setEntityCode] = useState(seed?.entityCode ?? '110000');
  const [mod1, setMod1] = useState(seed?.mod1 ?? '00');
  const [mod2, setMod2] = useState(seed?.mod2 ?? '00');
  const [previewSize, setPreviewSize] = useState(DEFAULT_PREVIEW);
  const [showVersions, setShowVersions] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number; t: number }>());
  const pinch = useRef({ start: 0, size: DEFAULT_PREVIEW });
  const lastTap = useRef(0);

  const ssEntities = useMemo(() => {
    return b2dMappings.filter((m) => m.d_ss === ss);
  }, [ss]);
  const mod1Options = useMemo(() => getModifierOptions(ss, 's1'), [ss]);
  const mod2Options = useMemo(() => getModifierOptions(ss, 's2'), [ss]);

  // Fuzzy-filtered entity list for search autocomplete
  const searchResults = useMemo(() => {
    if (!entitySearch || entitySearch.length < 1) return [];
    const lower = entitySearch.toLowerCase();
    return bEntities
      .filter((e) => e.label.toLowerCase().includes(lower))
      .slice(0, 25);
  }, [entitySearch]);

  // Sync all four versions from D fields
  function syncFromDFields(
    newSi: string, newSs: string, newStatus: string,
    newHqtffd: string, newEchelon: string, newEc: string,
    newMod1: string, newMod2: string
  ) {
    const newD = composeSidc20('10', newSi, newSs, newStatus, newHqtffd, newEchelon, newEc, newMod1, newMod2);
    const newE = composeSidc20('15', newSi, newSs, newStatus, newHqtffd, newEchelon, newEc, newMod1, newMod2);
    setDSidc(newD);
    setESidc(newE);

    // Reverse to C
    const cBasic = lookupD2C(newSs, newEc);
    if (cBasic) {
      const affilil = SI_TO_AFFIL[newSi] || 'F';
      const cFull = buildSidc15(cBasic, affilil, newEchelon, newHqtffd);
      setCSidc(cFull);

      // Reverse to B
      const bBasic = lookupC2B(cBasic);
      if (bBasic) {
        setBSidc(buildSidc15(bBasic, affilil, newEchelon, newHqtffd));
      } else {
        setBSidc(cFull);
      }
    } else {
      // No B/C equivalent -- entity is D/E only
      setBSidc('');
      setCSidc('');
    }
  }

  // Handle entity selection from search
  function handleEntitySelect(entity: BEntity) {
    setEntitySearch(entity.label);
    setShowDropdown(false);

    // Set B SIDC
    const bFull = buildSidc15(entity.basic, 'F');
    setBSidc(bFull);

    // B -> C
    const cBasic = lookupB2C(entity.basic);
    const cFull = cBasic ? buildSidc15(cBasic, 'F') : bFull;
    setCSidc(cFull);

    // Use entity.ss and entity.ec for D/E
    const newSs = entity.ss;
    const newEc = entity.ec;
    setSs(newSs);
    setEntityCode(newEc);
    setSi('3');
    setStatus('0');
    setHqtffd('0');
    setEchelon('00');
    setMod1('00');
    setMod2('00');
    syncFromDFields('3', newSs, '0', '0', '00', newEc, '00', '00');
  }

  // Handle direct B SIDC edit
  function handleBSidcChange(val: string) {
    const v = val.toUpperCase();
    setBSidc(v);
    if (v.length === 15) {
      const affil = v.charAt(1);
      // B -> C
      const cBasic = lookupB2C(v);
      if (cBasic) {
        setCSidc(buildSidc15(cBasic, affil));
        // C -> D
        const dFields = lookupC2D(cBasic);
        if (dFields) {
          const siChar = AFFIL_TO_SI[affil] || '3';
          setSi(siChar);
          setSs(dFields.ss);
          setEntityCode(dFields.ec);
          setMod1(dFields.s1);
          setMod2(dFields.s2);
          const newD = composeSidc20('10', siChar, dFields.ss, status, hqtffd, echelon, dFields.ec, dFields.s1, dFields.s2);
          const newE = composeSidc20('15', siChar, dFields.ss, status, hqtffd, echelon, dFields.ec, dFields.s1, dFields.s2);
          setDSidc(newD);
          setESidc(newE);
        }
      }
    }
  }

  // Handle direct C SIDC edit
  function handleCSidcChange(val: string) {
    const v = val.toUpperCase();
    setCSidc(v);
    if (v.length === 15) {
      const affil = v.charAt(1);
      // C -> D
      const dFields = lookupC2D(v);
      if (dFields) {
        const siChar = AFFIL_TO_SI[affil] || '3';
        setSi(siChar);
        setSs(dFields.ss);
        setEntityCode(dFields.ec);
        setMod1(dFields.s1);
        setMod2(dFields.s2);
        const newD = composeSidc20('10', siChar, dFields.ss, status, hqtffd, echelon, dFields.ec, dFields.s1, dFields.s2);
        const newE = composeSidc20('15', siChar, dFields.ss, status, hqtffd, echelon, dFields.ec, dFields.s1, dFields.s2);
        setDSidc(newD);
        setESidc(newE);
      }
      // Reverse to B
      const bBasic = lookupC2B(v);
      if (bBasic) {
        setBSidc(buildSidc15(bBasic, affil));
      }
    }
  }

  // Handle direct D SIDC edit
  function handleDSidcChange(val: string) {
    setDSidc(val);
    if (val.length === 20) {
      const parsed = parseD20(val);
      if (!parsed) return;
      setSi(parsed.si);
      setStatus(parsed.status);
      setSs(parsed.ss);
      setHqtffd(parsed.hqtffd);
      setEchelon(parsed.echelon);
      setEntityCode(parsed.entityCode);
      setMod1(parsed.mod1);
      setMod2(parsed.mod2);
      setDSidc(parsed.dSidc);
      setESidc(parsed.eSidc);

      const cBasic = lookupD2C(parsed.ss, parsed.entityCode);
      if (cBasic) {
        const affil = SI_TO_AFFIL[parsed.si] || 'F';
        setCSidc(buildSidc15(cBasic, affil, parsed.echelon, parsed.hqtffd));
        const bBasic = lookupC2B(cBasic);
        if (bBasic) {
          setBSidc(buildSidc15(bBasic, affil, parsed.echelon, parsed.hqtffd));
        }
      }
    }
  }

  // Handle direct E SIDC edit
  function handleESidcChange(val: string) {
    setESidc(val);
    if (val.length === 20) {
      // E is same structure as D with version prefix 15
      const equivalentD = '10' + val.substring(2);
      handleDSidcChange(equivalentD);
      setDSidc(equivalentD);
    }
  }

  // Handle dropdown field changes
  function handleFieldChange(field: string, value: string) {
    const newSi = field === 'si' ? value : si;
    const newSs = field === 'ss' ? value : ss;
    const newStatus = field === 'status' ? value : status;
    const newHqtffd = field === 'hqtffd' ? value : hqtffd;
    const newEchelon = field === 'echelon' ? value : echelon;
    const newEc = field === 'entity' ? value : entityCode;
    const newMod1 = field === 'mod1' ? value : mod1;
    const newMod2 = field === 'mod2' ? value : mod2;

    if (field === 'si') setSi(value);
    if (field === 'ss') {
      setSs(value);
      // Reset to first valid entity for new symbol set
      const firstEntity = b2dMappings.find((m) => m.d_ss === value);
      const defaultEc = firstEntity ? firstEntity.d_ec : '110000';
      setEntityCode(defaultEc);
    }
    if (field === 'status') setStatus(value);
    if (field === 'hqtffd') setHqtffd(value);
    if (field === 'echelon') setEchelon(value);
    if (field === 'entity') setEntityCode(value);
    if (field === 'mod1') setMod1(value);
    if (field === 'mod2') setMod2(value);

    const ec = field === 'ss'
      ? (b2dMappings.find((m) => m.d_ss === value)?.d_ec || '110000')
      : newEc;
    syncFromDFields(newSi, newSs, newStatus, newHqtffd, newEchelon, ec, newMod1, newMod2);
  }


  useEffect(() => {
    if (skipUrl.current) {
      skipUrl.current = false;
      return;
    }
    setSearchParams({ sidc: dSidc }, { replace: true });
  }, [dSidc, setSearchParams]);

  function cycleSi(dir: 1 | -1) {
    const idx = SI_CYCLE.indexOf(si);
    const next = SI_CYCLE[(Math.max(idx, 0) + dir + SI_CYCLE.length) % SI_CYCLE.length];
    handleFieldChange('si', next);
  }

  function cycleEchelon() {
    const keys = Object.keys(ECHELON_NAMES);
    const idx = Math.max(keys.indexOf(echelon), 0);
    handleFieldChange('echelon', keys[(idx + 1) % keys.length]);
  }

  function pointerDistance() {
    const pts = [...pointers.current.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY, t: Date.now() });
    if (pointers.current.size === 2) {
      pinch.current = { start: pointerDistance(), size: previewSize };
    }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY, t: pointers.current.get(e.pointerId)!.t });
    if (pointers.current.size === 2 && pinch.current.start > 0) {
      const ratio = pointerDistance() / pinch.current.start;
      const next = Math.min(MAX_PREVIEW, Math.max(MIN_PREVIEW, pinch.current.size * ratio));
      setPreviewSize(next);
    }
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const start = pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);
    if (!start || pointers.current.size > 0) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dist = Math.hypot(dx, dy);
    const dt = Date.now() - start.t;
    if (dt < 400 && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      cycleSi(dx > 0 ? 1 : -1);
      return;
    }
    if (dt < 350 && dist < 14) {
      const now = Date.now();
      if (now - lastTap.current < 320) {
        setPreviewSize(DEFAULT_PREVIEW);
        lastTap.current = 0;
        return;
      }
      lastTap.current = now;
      const rect = canvasRef.current?.getBoundingClientRect();
      const relY = rect ? (e.clientY - rect.top) / rect.height : 0;
      if (relY > 0.7) cycleEchelon();
      else cycleSi(1);
    }
  }

  return (
    <div className={styles.layout}>
      <div
        ref={canvasRef}
        className={styles.canvas}
        data-testid="sandbox-preview"
        style={{ touchAction: 'none', minHeight: previewSize, minWidth: previewSize }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div data-testid="sandbox-frame" className={styles.frameHit}>
          <MilSymRendererLive sidc={dSidc} size={previewSize} />
        </div>
        <button
          type="button"
          data-testid="sandbox-echelon-hit"
          className={styles.echelonHit}
          aria-label="Cycle echelon"
          onClick={(ev) => { ev.stopPropagation(); cycleEchelon(); }}
        />
      </div>
      <div className={styles.sheet}>
      {/* Fuzzy entity search */}
      <div className={styles.buildSearchWrap}>
        <label className={styles.buildFieldLabel}>Search Entity</label>
        <div className={styles.buildSearchBox}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Type to search 1,915 entities..."
            value={entitySearch}
            onChange={(e) => { setEntitySearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            aria-label="Entity search"
            data-testid="entity-search-input"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className={styles.buildDropdown}>
              {searchResults.map((entity) => (
                <button
                  key={entity.basic}
                  className={styles.buildDropdownItem}
                  onMouseDown={() => handleEntitySelect(entity)}
                >
                  <span className={styles.buildDropdownLabel}>{entity.label}</span>
                  <span className={styles.buildDropdownSs}>{SYMBOL_SET_NAMES[entity.ss] || entity.ss}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* D/E field selector dropdowns — two columns so all eight stay on-screen */}
      <div className={styles.buildFields}>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Standard Identity</label>
          <select className={styles.buildFieldSelect} data-testid="sandbox-si-select" value={si} onChange={(e) => handleFieldChange('si', e.target.value)}>
            {Object.entries(STANDARD_IDENTITY_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Symbol Set</label>
          <select className={styles.buildFieldSelect} value={ss} onChange={(e) => handleFieldChange('ss', e.target.value)}>
            {Object.entries(SYMBOL_SET_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Status</label>
          <select className={styles.buildFieldSelect} value={status} onChange={(e) => handleFieldChange('status', e.target.value)}>
            {Object.entries(STATUS_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>HQ/TF/FD</label>
          <select className={styles.buildFieldSelect} value={hqtffd} onChange={(e) => handleFieldChange('hqtffd', e.target.value)}>
            {Object.entries(HQ_TF_FD_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Echelon</label>
          <select className={styles.buildFieldSelect} data-testid="sandbox-echelon-select" value={echelon} onChange={(e) => handleFieldChange('echelon', e.target.value)}>
            {Object.entries(ECHELON_NAMES).map(([k, v]) => (
              <option key={k} value={k}>{v} ({k})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Entity</label>
          <select className={styles.buildFieldSelect} value={entityCode} onChange={(e) => handleFieldChange('entity', e.target.value)}>
            {ssEntities.map((m) => (
              <option key={m.d_ec} value={m.d_ec}>{m.label} ({m.d_ec})</option>
            ))}
            {ssEntities.length === 0 && (
              <option value="110000">Default (110000)</option>
            )}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Modifier 1</label>
          <select className={styles.buildFieldSelect} value={mod1} onChange={(e) => handleFieldChange('mod1', e.target.value)}>
            {mod1Options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
            ))}
          </select>
        </div>
        <div className={styles.buildFieldGroup}>
          <label className={styles.buildFieldLabel}>Modifier 2</label>
          <select className={styles.buildFieldSelect} value={mod2} onChange={(e) => handleFieldChange('mod2', e.target.value)}>
            {mod2Options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.mobileSidc}>
        <label className={styles.buildFieldLabel}>SIDC (2525D)</label>
        <input
          className={styles.buildSidcInput}
          type="text"
          value={dSidc}
          onChange={(e) => handleDSidcChange(e.target.value)}
          maxLength={20}
          aria-label="D SIDC input"
        />
        <button type="button" className={styles.versionsToggle} onClick={() => setShowVersions((v) => !v)}>
          {showVersions ? 'Hide B/C/E' : 'Show B/C/D/E'}
        </button>
      </div>
      {/* Four-version SIDC display (desktop; mobile only if expanded) */}
      <div className={`${styles.buildVersionGrid}${showVersions ? ` ${styles.versionsOpen}` : ''}`}>
        {/* B version */}
        <div className={styles.buildVersionCard}>
          <span className={styles.buildVersionLabel}>2525B (15-char)</span>
          <input
            className={styles.buildSidcInput}
            type="text"
            value={bSidc}
            onChange={(e) => handleBSidcChange(e.target.value)}
            maxLength={15}
            placeholder="No B equivalent"
            aria-label="B SIDC input"
            data-testid="b-sidc-input"
          />
          {bSidc ? <MilSymRendererLive sidc={dSidc} size={48} /> : (
            <div style={{ fontSize: 11, color: '#787878', fontStyle: 'italic', padding: 8 }}>D/E only entity</div>
          )}
        </div>

        {/* C version */}
        <div className={styles.buildVersionCard}>
          <span className={styles.buildVersionLabel}>2525C (15-char)</span>
          <input
            className={styles.buildSidcInput}
            type="text"
            value={cSidc}
            onChange={(e) => handleCSidcChange(e.target.value)}
            maxLength={15}
            aria-label="C SIDC input"
            data-testid="c-sidc-input"
          />
          {cSidc ? <MilSymRendererLive sidc={dSidc} size={48} /> : (
            <div style={{ fontSize: 11, color: '#787878', fontStyle: 'italic', padding: 8 }}>D/E only entity</div>
          )}
        </div>

        {/* D version */}
        <div className={styles.buildVersionCard}>
          <span className={styles.buildVersionLabel}>2525D (20-char)</span>
          <input
            className={styles.buildSidcInput}
            type="text"
            value={dSidc}
            onChange={(e) => handleDSidcChange(e.target.value)}
            maxLength={20}
            aria-label="D SIDC input"
            data-testid="d-sidc-input"
          />
          <MilSymRendererLive sidc={dSidc} size={48} />
        </div>

        {/* E version */}
        <div className={styles.buildVersionCard}>
          <span className={styles.buildVersionLabel}>2525E (20-char)</span>
          <input
            className={styles.buildSidcInput}
            type="text"
            value={eSidc}
            onChange={(e) => handleESidcChange(e.target.value)}
            maxLength={20}
            aria-label="E SIDC input"
            data-testid="e-sidc-input"
          />
          <MilSymRendererLive sidc={eSidc} size={48} />
        </div>
      </div>
      </div>
    </div>
  );
}



export default function Sandbox() {
  useEffect(() => { document.title = 'Symbol Sandbox - TAK Design System'; }, []);
  return (
    <div className={styles.page} data-testid="sandbox-page">
      <h1 className={styles.title}>Symbol Sandbox</h1>
      <p className={styles.subtitle}>
        Construct a SIDC on a live canvas. Field selectors stay in sync with gestures.
      </p>
      <BuildPanel />
    </div>
  );
}
