import { useEffect, useState } from 'react';
import coreTokens from '@tokens/core.json';
import semanticTokens from '@tokens/semantic.json';
import atakTokens from '@tokens/atak.json';
import styles from './Colors.module.css';

interface TokenEntry {
  name: string;
  value: string;
  description?: string;
}

function extractColors(
  obj: Record<string, unknown>,
  prefix = ''
): TokenEntry[] {
  const result: TokenEntry[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const v = val as Record<string, unknown>;
    if (v && v.$type === 'color' && typeof v.$value === 'string') {
      // Only include hex colors (skip references)
      if ((v.$value as string).startsWith('#')) {
        result.push({
          name: path,
          value: v.$value as string,
          description: v.$description as string | undefined,
        });
      }
    } else if (v && typeof v === 'object') {
      result.push(...extractColors(v as Record<string, unknown>, path));
    }
  }
  return result;
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '').slice(0, 6);
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

const colorGroups = [
  { label: 'TAK', colors: extractColors((atakTokens as Record<string, unknown>).atak as Record<string, unknown>) },
  { label: 'Core', colors: extractColors((coreTokens as Record<string, unknown>).color as Record<string, unknown>) },
  { label: 'Semantic', colors: extractColors(semanticTokens as Record<string, unknown>) },
];

export default function Colors() {
  useEffect(() => { document.title = 'Colors - TAK Design System'; }, []);
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className={styles.page}>
      <h1 style={{ fontSize: 30, fontWeight: 700, color: '#FFE35E', marginBottom: 8 }}>Colors</h1>
      <p style={{ color: '#878787', marginBottom: 32 }}>
        Click any swatch to copy its hex value.
      </p>

      {colorGroups.map((group) => (
        <section key={group.label} style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{group.label}</h2>
          <div className={styles.colorGrid}>
            {group.colors.map((c) => (
              <button
                key={`${group.label}-${c.name}`}
                onClick={() => handleCopy(c.value)}
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2E2E2E',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                }}
                title={c.description || c.name}
              >
                <div
                  style={{
                    height: 64,
                    background: c.value,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontFamily: 'Roboto Mono, monospace',
                    color: isLightColor(c.value) ? '#131415' : '#DAD4BC',
                  }}
                >
                  {copied === c.value ? 'Copied!' : ''}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#DAD4BC',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'Roboto Mono, monospace', color: '#878787' }}>
                    {c.value}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
