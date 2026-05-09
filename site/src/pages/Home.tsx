import coreTokens from '@tokens/core.json';
import semanticTokens from '@tokens/semantic.json';
import atakTokens from '@tokens/atak.json';

function countTokens(obj: Record<string, unknown>, depth = 0): number {
  let count = 0;
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && '$value' in (value as Record<string, unknown>)) {
      count++;
    } else if (value && typeof value === 'object') {
      count += countTokens(value as Record<string, unknown>, depth + 1);
    }
  }
  return count;
}

const stats = [
  { label: 'Core tokens', value: countTokens(coreTokens as Record<string, unknown>) },
  { label: 'Semantic tokens', value: countTokens(semanticTokens as Record<string, unknown>) },
  { label: 'ATAK tokens', value: countTokens(atakTokens as Record<string, unknown>) },
  { label: 'Platforms', value: 4 },
  { label: 'Token files', value: 4 },
];

export default function Home() {
  return (
    <div style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: '#FFE35E', marginBottom: 8 }}>
        TAK Design System
      </h1>
      <p style={{ color: '#878787', marginBottom: 32, fontSize: 16 }}>
        Design tokens and platform-specific assets for ATAK, WinTAK, TAKX, and WebTAK development.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#1A1A1A',
              border: '1px solid #2E2E2E',
              borderRadius: 8,
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700, color: '#FFE35E' }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#878787', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Token layers</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2E2E2E', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px', color: '#878787', fontWeight: 500 }}>File</th>
            <th style={{ padding: '8px 12px', color: '#878787', fontWeight: 500 }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {[
            { file: 'core.json', desc: 'Primitive values: colors, spacing, typography, border radii, opacity' },
            { file: 'semantic.json', desc: 'Intent-based aliases: affiliation, status, surface, text, map, team' },
            { file: 'atak.json', desc: 'ATAK-native tokens from styles.xml, colors.xml, dimen.xml' },
            { file: 'component.json', desc: 'Component-level tokens for buttons, inputs, cards, toolbars' },
          ].map((row) => (
            <tr key={row.file} style={{ borderBottom: '1px solid #2E2E2E' }}>
              <td style={{ padding: '10px 12px', fontFamily: 'Roboto Mono, monospace', fontSize: 13, color: '#FFE35E' }}>
                {row.file}
              </td>
              <td style={{ padding: '10px 12px' }}>{row.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
