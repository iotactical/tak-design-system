// rtmx:req REQ-SITE-030
import { useEffect } from 'react';
import coreTokens from '@tokens/core.json';
import atakTokens from '@tokens/atak.json';
import styles from './Spacing.module.css';

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

function ScaleSection({
  caption,
  entries,
  labelPrefix,
  wide = false,
}: {
  caption: string;
  entries: { name: string; value: string }[];
  labelPrefix?: string;
  wide?: boolean;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{caption}</h2>
      <div className={styles.scaleWrap}>
        <div className={`${styles.scale} ${wide ? styles.scaleWide : ''}`}>
          {entries.map((s) => {
            const px = parseInt(s.value) || 0;
            return (
              <div key={s.name} className={styles.row}>
                <div className={`${styles.rowName} ${wide ? styles.rowNameWide : ''}`}>
                  {labelPrefix}{s.name}
                </div>
                <div className={styles.rowValue}>{s.value}</div>
                <div
                  className={`${styles.bar} ${wide ? styles.barAtak : ''} ${px === 0 ? styles.barZero : ''}`}
                  style={{ width: px * 4 || 2 }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Spacing() {
  useEffect(() => { document.title = 'Spacing - TAK Design System'; }, []);
  return (
    <div style={{ maxWidth: '100%' }}>
      <h1 className={styles.title}>Spacing</h1>
      <p className={styles.subtitle}>
        Spacing scale and border radius tokens visualized with proportional bars.
      </p>

      <ScaleSection caption="Core spacing scale" entries={coreSpacing} labelPrefix="spacing." />
      <ScaleSection caption="TAK spacing" entries={atakSpacing} wide />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Border radius</h2>
        <div className={styles.radiusGrid}>
          {coreBorderRadius.map((r) => {
            const px = parseInt(r.value) || 0;
            const radius = px > 100 ? '50%' : `${px}px`;
            return (
              <div key={r.name} className={styles.radiusItem}>
                <div className={styles.radiusSwatch} style={{ borderRadius: radius }} />
                <div className={styles.radiusName}>{r.name}</div>
                <div className={styles.radiusValue}>{r.value}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
