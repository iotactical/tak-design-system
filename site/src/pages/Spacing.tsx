import { useEffect } from 'react';
import coreTokens from '@tokens/core.json';
import atakTokens from '@tokens/atak.json';

const core = coreTokens as Record<string, unknown>;
const atak = (atakTokens as Record<string, unknown>).atak as Record<string, unknown>;

function getEntries(obj: Record<string, unknown>) {
  const entries: { name: string; value: string }[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const v = val as Record<string, unknown>;
    if (v.$value) {
      entries.push({ name: key, value: v.$value as string });
    }
  }
  return entries;
}

const coreSpacing = getEntries(core.spacing as Record<string, unknown>);
const coreBorderRadius = getEntries(core.borderRadius as Record<string, unknown>);
const atakSpacing = getEntries((atak.dimension as Record<string, unknown>).spacing as Record<string, unknown>);

export default function Spacing() {
  useEffect(() => { document.title = 'Spacing - TAK Design System'; }, []);
  return (
    <div style={{ maxWidth: 960 }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: '#FFE35E', marginBottom: 8 }}>Spacing</h1>
      <p style={{ color: '#878787', marginBottom: 32 }}>
        Spacing scale and border radius tokens visualized with proportional bars.
      </p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Core spacing scale</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {coreSpacing.map((s) => {
            const px = parseInt(s.value) || 0;
            return (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 80,
                    fontFamily: 'Roboto Mono, monospace',
                    fontSize: 13,
                    color: '#FFE35E',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  spacing.{s.name}
                </div>
                <div
                  style={{
                    width: 50,
                    fontFamily: 'Roboto Mono, monospace',
                    fontSize: 13,
                    color: '#878787',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    height: 20,
                    width: px * 4 || 2,
                    background: '#FFE35E',
                    borderRadius: 3,
                    opacity: px === 0 ? 0.3 : 1,
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>ATAK spacing</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {atakSpacing.map((s) => {
            const px = parseInt(s.value) || 0;
            return (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 140,
                    fontFamily: 'Roboto Mono, monospace',
                    fontSize: 13,
                    color: '#FFE35E',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    width: 50,
                    fontFamily: 'Roboto Mono, monospace',
                    fontSize: 13,
                    color: '#878787',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    height: 20,
                    width: px * 4 || 2,
                    background: '#42A5F5',
                    borderRadius: 3,
                    opacity: px === 0 ? 0.3 : 1,
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Border radius</h2>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {coreBorderRadius.map((r) => {
            const px = parseInt(r.value) || 0;
            const radius = px > 100 ? '50%' : `${px}px`;
            return (
              <div key={r.name} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: '#FFE35E',
                    borderRadius: radius,
                    marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 12, fontFamily: 'Roboto Mono, monospace', color: '#FFE35E' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 11, fontFamily: 'Roboto Mono, monospace', color: '#878787' }}>
                  {r.value}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
