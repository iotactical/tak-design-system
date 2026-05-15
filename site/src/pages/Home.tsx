import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const INSTALL_CMD = 'npm install @iotactical/tak-react';
const BASE = import.meta.env.BASE_URL;

const pageCards = [
  { to: '/colors', title: 'Colors', desc: 'Design tokens and color palettes', preview: 'preview-colors.png' },
  { to: '/typography', title: 'Typography', desc: 'Type scale, weights, and font stacks', preview: 'preview-typography.png' },
  { to: '/spacing', title: 'Spacing', desc: 'Spacing scale and layout primitives', preview: 'preview-spacing.png' },
  { to: '/components', title: 'Components', desc: 'React components for TAK interfaces', preview: 'preview-components.png' },
  { to: '/icons', title: 'Icons', desc: 'TAK drawable icon catalog', preview: 'preview-icons.png' },
  { to: '/palettes', title: 'Palettes', desc: 'MIL-STD-2525 symbols, vehicles, markers', preview: 'preview-palettes.png' },
  { to: '/platforms', title: 'Platforms', desc: 'Android, WPF, Web, and IDE outputs', preview: 'preview-platforms.png' },
  { to: '/interfaces', title: 'Interfaces', desc: 'Reference UI patterns and layouts', preview: 'preview-interfaces.png' },
  { to: '/multipoint', title: 'Tactical Graphics', desc: 'Tactical control measure graphics', preview: 'preview-multipoint.png' },
  { to: '/explorer', title: '2525 Explorer', desc: 'Browse, decode, and build SIDCs', preview: 'preview-explorer.png' },
  { to: '/sources', title: 'Sources', desc: 'Figma, TAK Product Center, MIL-STD-2525', preview: 'preview-sources.png' },
];

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'TAK Design System';
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };


  // Track carousel scroll position for dot indicators
  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const scrollLeft = track.scrollLeft;
    const cardWidth = track.firstElementChild
      ? (track.firstElementChild as HTMLElement).offsetWidth + 12
      : 1;
    setActiveIdx(Math.round(scrollLeft / cardWidth));
  }, []);

  const scrollTo = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track || !track.firstElementChild) return;
    const cardWidth = (track.firstElementChild as HTMLElement).offsetWidth + 12;
    track.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
  }, []);

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

      {/* Mobile: horizontal carousel */}
      <div className={styles.carousel}>
        <div
          ref={trackRef}
          className={styles.carouselTrack}
          onScroll={handleScroll}
        >
          {pageCards.map((card) => (
            <Link key={card.to} to={card.to} className={styles.carouselCard}>
              <div className={styles.carouselPreview}>
                <img
                  src={`${BASE}previews/${card.preview}`}
                  alt={`${card.title} preview`}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className={styles.carouselBody}>
                <div className={styles.carouselTitle}>{card.title}</div>
                <div className={styles.carouselDesc}>{card.desc}</div>
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.carouselDots}>
          {pageCards.map((card, i) => (
            <button
              key={card.to}
              className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ''}`}
              onClick={() => scrollTo(i)}
              aria-label={`Go to ${card.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
