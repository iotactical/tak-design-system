// rtmx:req REQ-SITE-024
// rtmx:req REQ-SITE-025
// rtmx:req REQ-SITE-026
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const INSTALL_CMD = 'npm install @iotactical/tak-react';
const BASE = import.meta.env.BASE_URL;

const pageCards = [
  { to: '/colors', title: 'Colors', desc: 'Design tokens and color palettes', preview: 'preview-colors.png', icon: 'C' },
  { to: '/typography', title: 'Typography', desc: 'Type scale, weights, and font stacks', preview: 'preview-typography.png', icon: 'T' },
  { to: '/spacing', title: 'Spacing', desc: 'Spacing scale and layout primitives', preview: 'preview-spacing.png', icon: 'S' },
  { to: '/components', title: 'Components', desc: 'React components for TAK interfaces', preview: 'preview-components.png', icon: 'R' },
  { to: '/icons', title: 'Icons', desc: 'TAK drawable icon catalog', preview: 'preview-icons.png', icon: 'I' },
  { to: '/palettes', title: 'Palettes', desc: 'MIL-STD-2525 symbols, vehicles, markers', preview: 'preview-palettes.png', icon: 'P' },
  { to: '/platforms', title: 'Platforms', desc: 'Android, WPF, Web, and IDE outputs', preview: 'preview-platforms.png', icon: 'X' },
  { to: '/interfaces', title: 'Interfaces', desc: 'Reference UI patterns and layouts', preview: 'preview-interfaces.png', icon: 'IF' },
  { to: '/multipoint', title: 'Tactical Graphics', desc: 'Tactical control measure graphics', preview: 'preview-multipoint.png', icon: 'TG' },
  { to: '/explorer', title: '2525 Explorer', desc: 'Browse, decode, and build SIDCs', preview: 'preview-explorer.png', icon: '25' },
  { to: '/sources', title: 'Sources', desc: 'Figma, TAK Product Center, MIL-STD-2525', preview: 'preview-sources.png', icon: 'Fg' },
];

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
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>TAK</span> Design System
        </h1>
        <p className={styles.tagline}>One TAK for every device</p>
      </div>

      <div className={styles.installBlock}>
        <div className={styles.installBar}>
          <span className={styles.installPrompt}>$</span>
          <code className={styles.installCmd}>{INSTALL_CMD}</code>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Desktop/tablet: flex grid */}
      <div className={styles.cardGrid}>
        {pageCards.map((card) => (
          <Link key={card.to} to={card.to} className={styles.card}>
            <div className={styles.cardPreview}>
              <img
                src={`${BASE}previews/${card.preview}`}
                alt={`${card.title} preview`}
                className={styles.cardImg}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTitle}>{card.title}</div>
              <div className={styles.cardDesc}>{card.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile: compact vertical 2-column grid (REQ-SITE-024) */}
      <div className={styles.mobileGrid} data-testid="mobile-grid">
        {pageCards.map((card) => (
          <Link key={card.to} to={card.to} className={styles.mobileCard}>
            <span className={styles.mobileIcon}>{card.icon}</span>
            <div className={styles.mobileCardText}>
              <div className={styles.mobileTitle}>{card.title}</div>
              <div className={styles.mobileDesc}>{card.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
