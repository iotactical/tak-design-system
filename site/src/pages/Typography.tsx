// rtmx:req REQ-SITE-030
import { useEffect } from 'react';
import coreTokens from '@tokens/core.json';
import atakTokens from '@tokens/atak.json';
import styles from './Typography.module.css';

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

function SizeTable({ caption, entries }: { caption: string; entries: { name: string; value: string }[] }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{caption}</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((s) => (
              <tr key={s.name}>
                <td className={styles.tokenCell}>{s.name}</td>
                <td className={styles.valueCell}>{s.value}</td>
                <td className={styles.previewCell} style={{ fontSize: parseInt(s.value) }}>
                  Sample text
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Typography() {
  useEffect(() => { document.title = 'Typography - TAK Design System'; }, []);
  return (
    <div style={{ maxWidth: '100%' }}>
      <h1 className={styles.title}>Typography</h1>
      <p className={styles.subtitle}>
        Font families, sizes, and weights from the core and TAK token sets.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Core font families</h2>
        {fontFamilies.map((f) => (
          <div key={f.name} className={styles.sample}>
            <div className={styles.sampleMeta}>
              {f.name}: {f.value}
            </div>
            <div className={styles.sampleText} style={{ fontFamily: f.value }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>TAK font families</h2>
        {atakFonts.map((f) => (
          <div key={f.name} className={styles.sample}>
            <div className={styles.sampleMeta}>
              {f.name}: {f.value}
              {f.description ? ` -- ${f.description}` : ''}
            </div>
            <div className={styles.sampleText} style={{ fontFamily: f.value }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
        ))}
      </section>

      <SizeTable caption="Core font size scale" entries={fontSizes} />
      <SizeTable caption="TAK font sizes" entries={atakFontSizes} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Font weights</h2>
        <div className={styles.weightGrid}>
          {fontWeights.map((w) => (
            <div key={w.name}>
              <div className={styles.weightMeta}>
                {w.name} ({w.value})
              </div>
              <div className={styles.weightSample} style={{ fontWeight: parseInt(w.value) }}>
                Aa Bb Cc
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
