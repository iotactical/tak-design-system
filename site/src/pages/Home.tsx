import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import coreTokens from '@tokens/core.json';
import semanticTokens from '@tokens/semantic.json';
import atakTokens from '@tokens/atak.json';
import catalog from '../../../data/atak-drawable-catalog.json';

function countTokens(obj: Record<string, unknown>): number {
  let count = 0;
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && '$value' in (value as Record<string, unknown>)) {
      count++;
    } else if (value && typeof value === 'object') {
      count += countTokens(value as Record<string, unknown>);
    }
  }
  return count;
}

const totalTokens =
  countTokens(coreTokens as Record<string, unknown>) +
  countTokens(semanticTokens as Record<string, unknown>) +
  countTokens(atakTokens as Record<string, unknown>);

const stats = [
  { label: 'Tokens', value: totalTokens },
  { label: 'Components', value: 28 },
  { label: 'Icons', value: (catalog as unknown[]).length },
  { label: 'Palettes', value: 14 },
  { label: 'Platforms', value: 6 },
  { label: 'Tests', value: 584 },
];

const navCards = [
  { to: '/colors', title: 'Colors', desc: 'Browse 365 design tokens' },
  { to: '/components', title: 'Components', desc: '28 React components' },
  { to: '/icons', title: 'Icons', desc: '1,317 drawable resources' },
  { to: '/palettes', title: 'Palettes', desc: '14 ATAK icon palettes' },
  { to: '/platforms', title: 'Platforms', desc: '6 platform outputs' },
];

const platformMatrix = [
  { platform: 'ATAK', target: 'Android', output: 'XML resources' },
  { platform: 'WinTAK', target: 'WPF', output: 'XAML dictionaries' },
  { platform: 'WebTAK', target: 'CSS/React', output: 'CSS variables, React components' },
  { platform: 'VS Code', target: 'Theme', output: 'VS Code color theme JSON' },
];

const INSTALL_CMD = 'npm install @iotactical/tak-react';

export default function Home() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = 'TAK Design System';
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          TAK Design System
          <span className={styles.version}>v0.1.0</span>
        </h1>
        <p className={styles.tagline}>ATAK on every OS</p>
      </div>

      {/* Live stats */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation cards */}
      <h2 className={styles.sectionTitle}>Explore</h2>
      <div className={styles.navGrid}>
        {navCards.map((card) => (
          <Link key={card.to} to={card.to} className={styles.navCard}>
            <div className={styles.navCardTitle}>{card.title}</div>
            <div className={styles.navCardDesc}>{card.desc}</div>
          </Link>
        ))}
      </div>

      {/* Platform support matrix */}
      <h2 className={styles.sectionTitle}>Platform support</h2>
      <table className={styles.matrixTable}>
        <thead>
          <tr>
            <th>Platform</th>
            <th>Target</th>
            <th>Output</th>
          </tr>
        </thead>
        <tbody>
          {platformMatrix.map((row) => (
            <tr key={row.platform}>
              <td>{row.platform}</td>
              <td>{row.target}</td>
              <td>{row.output}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Quick start */}
      <h2 className={styles.sectionTitle}>Quick start</h2>
      <div className={styles.quickStart}>
        <div className={styles.codeBlock}>
          <code>{INSTALL_CMD}</code>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
