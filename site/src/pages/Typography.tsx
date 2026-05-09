import { useEffect } from 'react';
import coreTokens from '@tokens/core.json';
import atakTokens from '@tokens/atak.json';

const core = coreTokens as Record<string, unknown>;
const atak = (atakTokens as Record<string, unknown>).atak as Record<string, unknown>;

function getEntries(obj: Record<string, unknown>) {
  const entries: { name: string; value: string; description?: string }[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const v = val as Record<string, unknown>;
    if (v.$value) {
      entries.push({ name: key, value: v.$value as string, description: v.$description as string | undefined });
    }
  }
  return entries;
}

const fontFamilies = getEntries(core.fontFamily as Record<string, unknown>);
const fontSizes = getEntries(core.fontSize as Record<string, unknown>);
const fontWeights = getEntries(core.fontWeight as Record<string, unknown>);
const atakFonts = getEntries(atak.font as Record<string, unknown>);
const atakFontSizes = getEntries((atak.dimension as Record<string, unknown>).font as Record<string, unknown>);

export default function Typography() {
  useEffect(() => { document.title = 'Typography - TAK Design System'; }, []);
  return (
    <div style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: '#FFE35E', marginBottom: 8 }}>Typography</h1>
      <p style={{ color: '#878787', marginBottom: 32 }}>
        Font families, sizes, and weights from the core and ATAK token sets.
      </p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Core font families</h2>
        {fontFamilies.map((f) => (
          <div key={f.name} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#878787', fontFamily: 'Roboto Mono, monospace', marginBottom: 4 }}>
              {f.name}: {f.value}
            </div>
            <div style={{ fontFamily: f.value, fontSize: 24 }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>ATAK font families</h2>
        {atakFonts.map((f) => (
          <div key={f.name} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#878787', fontFamily: 'Roboto Mono, monospace', marginBottom: 4 }}>
              {f.name}: {f.value}
              {f.description ? ` -- ${f.description}` : ''}
            </div>
            <div style={{ fontFamily: f.value, fontSize: 24 }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Core font size scale</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2E2E2E', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', color: '#878787', fontWeight: 500, width: 80 }}>Token</th>
              <th style={{ padding: '8px 12px', color: '#878787', fontWeight: 500, width: 80 }}>Value</th>
              <th style={{ padding: '8px 12px', color: '#878787', fontWeight: 500 }}>Preview</th>
            </tr>
          </thead>
          <tbody>
            {fontSizes.map((s) => (
              <tr key={s.name} style={{ borderBottom: '1px solid #2E2E2E' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'Roboto Mono, monospace', fontSize: 13, color: '#FFE35E' }}>
                  {s.name}
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'Roboto Mono, monospace', fontSize: 13 }}>
                  {s.value}
                </td>
                <td style={{ padding: '10px 12px', fontSize: parseInt(s.value) }}>
                  Sample text
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>ATAK font sizes</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2E2E2E', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', color: '#878787', fontWeight: 500, width: 180 }}>Token</th>
              <th style={{ padding: '8px 12px', color: '#878787', fontWeight: 500, width: 80 }}>Value</th>
              <th style={{ padding: '8px 12px', color: '#878787', fontWeight: 500 }}>Preview</th>
            </tr>
          </thead>
          <tbody>
            {atakFontSizes.map((s) => (
              <tr key={s.name} style={{ borderBottom: '1px solid #2E2E2E' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'Roboto Mono, monospace', fontSize: 13, color: '#FFE35E' }}>
                  {s.name}
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'Roboto Mono, monospace', fontSize: 13 }}>
                  {s.value}
                </td>
                <td style={{ padding: '10px 12px', fontSize: parseInt(s.value) }}>
                  Sample text
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Font weights</h2>
        <div style={{ display: 'flex', gap: 32 }}>
          {fontWeights.map((w) => (
            <div key={w.name}>
              <div style={{ fontSize: 12, color: '#878787', fontFamily: 'Roboto Mono, monospace', marginBottom: 4 }}>
                {w.name} ({w.value})
              </div>
              <div style={{ fontSize: 24, fontWeight: parseInt(w.value) }}>
                Aa Bb Cc
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
