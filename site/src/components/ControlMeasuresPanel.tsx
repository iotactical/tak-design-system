// rtmx:req REQ-XW-106
import { useState, useEffect, useMemo, useCallback } from 'react';
import { MultipointMap } from './MultipointMap';
import { useMultipointWorker } from '../hooks/useMultipointWorker';
import {
  MULTIPOINT_EXAMPLES,
  EXAMPLE_BY_ENTITY,
  type MultipointExample,
} from '../data/multipoint-examples';
import b2dData from '../../../data/mil-std-2525/b2d.json';

interface B2DMapping {
  b_sidc: string;
  d_ss: string;
  d_ec: string;
  d_s1: string;
  d_s2: string;
  label: string;
  lossy: boolean;
}

const AFFILIATIONS: { code: string; label: string }[] = [
  { code: '3', label: 'Friendly' },
  { code: '6', label: 'Hostile' },
  { code: '4', label: 'Neutral' },
  { code: '1', label: 'Unknown' },
];

const DEFAULT_BBOX = '-100.0,35.0,-94.0,40.0';
const DEFAULT_SCALE = 500000;

function withAffiliation(sidc: string, affiliationChar: string): string {
  if (sidc.length < 20) return sidc;
  return sidc.substring(0, 2) + affiliationChar + sidc.substring(3);
}

function makeSidc25(entityCode: string): string {
  return `10030025000${entityCode}0000`;
}

function EntityCard({
  entity,
  example,
  affiliation,
  expanded,
  onToggle,
}: {
  entity: B2DMapping;
  example: MultipointExample | undefined;
  affiliation: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { renderMultipoint, ready } = useMultipointWorker();
  const [geojson, setGeojson] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<[number, number][]>([]);

  const sidc = withAffiliation(makeSidc25(entity.d_ec), affiliation);
  const points = example?.controlPoints || '';

  // Render with canonical points
  useEffect(() => {
    if (!ready || !points) return;
    let cancelled = false;
    renderMultipoint(sidc, points, DEFAULT_SCALE, DEFAULT_BBOX, example?.modifiers, example?.attributes).then((r) => {
      if (!cancelled) setGeojson(r);
    });
    return () => { cancelled = true; };
  }, [sidc, points, ready, renderMultipoint]);

  // Re-render when user clicks points in interactive mode
  useEffect(() => {
    if (!expanded || !ready || userPoints.length < 2) return;
    let cancelled = false;
    const cp = userPoints.map(([lon, lat]) => `${lon},${lat}`).join(' ');
    const lons = userPoints.map((p) => p[0]);
    const lats = userPoints.map((p) => p[1]);
    const bbox = `${Math.min(...lons) - 1},${Math.min(...lats) - 1},${Math.max(...lons) + 1},${Math.max(...lats) + 1}`;
    renderMultipoint(sidc, cp, DEFAULT_SCALE, bbox).then((r) => {
      if (!cancelled) setGeojson(r);
    });
    return () => { cancelled = true; };
  }, [expanded, userPoints, sidc, ready, renderMultipoint]);

  const handleClick = useCallback((lngLat: [number, number]) => {
    setUserPoints((prev) => [...prev, lngLat]);
  }, []);

  const center = useMemo((): [number, number] => {
    if (example) {
      const pts = example.controlPoints.split(' ').map((p) => {
        const [lon, lat] = p.split(',').map(Number);
        return [lon, lat] as [number, number];
      });
      return [
        pts.reduce((s, p) => s + p[0], 0) / pts.length,
        pts.reduce((s, p) => s + p[1], 0) / pts.length,
      ];
    }
    return [-98.5, 39.8];
  }, [example]);

  return (
    <div style={{
      background: '#1E1E1E',
      border: '1px solid #2E2E2E',
      borderRadius: 8,
      marginBottom: 8,
      overflow: 'hidden',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 16px',
          background: 'none',
          border: 'none',
          color: '#E0E0E0',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontFamily: 'var(--tak-font-mono)', fontSize: 12, color: '#878787', minWidth: 60 }}>
          {entity.d_ec}
        </span>
        <span style={{ flex: 1, fontSize: 14 }}>{entity.label}</span>
        {example && (
          <span style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(33,150,243,0.15)',
            color: '#64b5f6',
          }}>
            {example.category}
          </span>
        )}
        <span style={{ fontSize: 12, color: '#878787' }}>{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontSize: 12, color: '#878787', marginBottom: 8 }}>
            SIDC: <span style={{ fontFamily: 'var(--tak-font-mono)' }}>{sidc}</span>
            {entity.b_sidc && (
              <span> | B: <span style={{ fontFamily: 'var(--tak-font-mono)' }}>{entity.b_sidc}</span></span>
            )}
          </div>

          {example ? (
            <>
              <div style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 8 }}>
                {example.description}
              </div>
              {example.modifiers && Object.keys(example.modifiers).length > 0 && (
                <div style={{ fontSize: 12, color: '#878787', marginBottom: 8 }}>
                  {Object.entries(example.modifiers).map(([k, v]) => (
                    <span key={k} style={{ marginRight: 12 }}>{k}: <span style={{ color: '#DAD4BC' }}>{v}</span></span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#878787', marginBottom: 8 }}>
                Points: {example.minPoints}{example.maxPoints > 0 ? `-${example.maxPoints}` : '+'} |
                Click map to add points interactively
                {userPoints.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setUserPoints([]); }}
                    style={{
                      marginLeft: 8,
                      padding: '2px 8px',
                      fontSize: 11,
                      background: 'rgba(244,67,54,0.15)',
                      color: '#ef9a9a',
                      border: '1px solid rgba(244,67,54,0.3)',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Clear ({userPoints.length})
                  </button>
                )}
              </div>
              <div style={{ height: 300, borderRadius: 6, overflow: 'hidden' }}>
                <MultipointMap
                  geojson={geojson}
                  center={center}
                  zoom={6}
                  onClick={handleClick}
                />
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#878787', padding: '16px 0' }}>
              No canonical example coordinates defined for this graphic type.
              This entity may be a single-point control measure.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ControlMeasuresPanel() {
  const [search, setSearch] = useState('');
  const [affiliation, setAffiliation] = useState('3');
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  const ss25Entities = useMemo(() => {
    return (b2dData as { mappings: B2DMapping[] }).mappings.filter(
      (m) => m.d_ss === '25' && m.d_ec
    );
  }, []);

  const filtered = useMemo(() => {
    if (!search) return ss25Entities;
    const q = search.toLowerCase();
    return ss25Entities.filter(
      (e) => e.label.toLowerCase().includes(q) || e.d_ec.includes(q) || e.b_sidc.includes(q.toUpperCase())
    );
  }, [ss25Entities, search]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: '#A0A0A0', marginBottom: 12 }}>
          Symbol Set 25 (Control Measures) -- {ss25Entities.length} entities.
          Multi-point graphics require 2+ geographic coordinates to render.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search control measures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              maxWidth: 400,
              padding: '8px 12px',
              fontSize: 14,
              background: '#1E1E1E',
              border: '1px solid #2E2E2E',
              borderRadius: 6,
              color: '#E0E0E0',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            {AFFILIATIONS.map((a) => (
              <button
                key={a.code}
                onClick={() => setAffiliation(a.code)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  background: affiliation === a.code ? 'var(--tak-accent, #FFE35E)' : '#1E1E1E',
                  color: affiliation === a.code ? '#000' : '#878787',
                  border: '1px solid #2E2E2E',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#878787' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {' | '}{MULTIPOINT_EXAMPLES.length} have map previews
        </p>
      </div>

      <div>
        {filtered.map((entity) => (
          <EntityCard
            key={entity.d_ec + entity.b_sidc}
            entity={entity}
            example={EXAMPLE_BY_ENTITY[entity.d_ec]}
            affiliation={affiliation}
            expanded={expandedEntity === entity.d_ec}
            onToggle={() =>
              setExpandedEntity((prev) => (prev === entity.d_ec ? null : entity.d_ec))
            }
          />
        ))}
      </div>
    </div>
  );
}
