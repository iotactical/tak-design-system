// rtmx:req REQ-SITE-003
import { useState, useMemo, type CSSProperties } from 'react';
import styles from './Icons.module.css';
import catalog from '../../../data/atak-drawable-catalog.json';
import shapeData from '../../../data/atak-shapes.json';

const CATEGORIES = [
  'ic_menu', 'nav', 'btn', 'enter_location', 'toolbar', 'tab', 'toggle', 'other',
] as const;

const TYPES = [
  'vector', 'shape', 'selector', 'png', 'nine-patch', 'layer-list',
] as const;

type CatalogEntry = {
  name: string;
  type: string;
  category: string;
  densities: string[];
  format: string;
};

type ShapeEntry = {
  name: string;
  shapeType: string;
  solidColor?: string;
  stroke?: { width?: string; color?: string };
  corners?: { radius?: string; topLeftRadius?: string; topRightRadius?: string; bottomLeftRadius?: string; bottomRightRadius?: string };
  gradient?: { startColor?: string; endColor?: string; angle?: string };
};

const allItems: CatalogEntry[] = catalog as CatalogEntry[];
const shapeMap = new Map<string, ShapeEntry>();
for (const s of shapeData as ShapeEntry[]) {
  shapeMap.set(s.name, s);
}

/** Vector SVGs served from site/public/icons/ */
const BASE = import.meta.env.BASE_URL;

function categoryMatches(entryCategory: string, filterCategory: string): boolean {
  if (filterCategory === 'other') {
    return !CATEGORIES.slice(0, -1).some((c) => entryCategory === c || entryCategory.startsWith(c + '_'));
  }
  return entryCategory === filterCategory || entryCategory.startsWith(filterCategory + '_');
}

function typeBadgeClass(type: string): string {
  switch (type) {
    case 'vector': return styles.badgeVector;
    case 'shape': return styles.badgeShape;
    case 'selector': return styles.badgeSelector;
    case 'png': return styles.badgePng;
    case 'nine-patch': return styles.badgeNinepatch;
    default: return styles.badgeOther;
  }
}

function dpToPx(dp: string | undefined): number {
  if (!dp) return 0;
  return parseInt(dp.replace(/dp|px|sp/g, ''), 10) || 0;
}

/** Render a shape drawable as a CSS-styled div */
function ShapePreview({ shape }: { shape: ShapeEntry }) {
  const s: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: shape.shapeType === 'oval' ? '50%' : undefined,
  };

  if (shape.solidColor) {
    s.backgroundColor = shape.solidColor;
  }

  if (shape.gradient) {
    const angle = parseInt(shape.gradient.angle || '0', 10);
    s.background = `linear-gradient(${angle}deg, ${shape.gradient.startColor || '#333'}, ${shape.gradient.endColor || '#666'})`;
  }

  if (shape.stroke) {
    s.border = `${dpToPx(shape.stroke.width) || 1}px solid ${shape.stroke.color || '#666'}`;
  }

  if (shape.corners) {
    if (shape.corners.radius) {
      s.borderRadius = dpToPx(shape.corners.radius);
    } else {
      s.borderTopLeftRadius = dpToPx(shape.corners.topLeftRadius);
      s.borderTopRightRadius = dpToPx(shape.corners.topRightRadius);
      s.borderBottomLeftRadius = dpToPx(shape.corners.bottomLeftRadius);
      s.borderBottomRightRadius = dpToPx(shape.corners.bottomRightRadius);
    }
  }

  if (!s.backgroundColor && !s.background) {
    s.backgroundColor = '#333';
  }

  return <div style={s} />;
}

function CardPreview({ entry }: { entry: CatalogEntry }) {
  // Vector: show SVG from public/icons/
  if (entry.type === 'vector') {
    return (
      <img
        src={`${BASE}icons/${entry.name}.svg`}
        alt={entry.name}
        className={styles.svgPreview}
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  // Shape: render as CSS
  const shape = shapeMap.get(entry.name);
  if (entry.type === 'shape' && shape) {
    return <ShapePreview shape={shape} />;
  }

  // PNG/nine-patch: try loading from public/icons/
  if (entry.type === 'png' || entry.type === 'nine-patch') {
    const ext = entry.type === 'nine-patch' ? '.9.png' : '.png';
    return (
      <img
        src={`${BASE}icons/${entry.name}${ext}`}
        alt={entry.name}
        className={styles.pngPreview}
        loading="lazy"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          // Fallback: try without .9 prefix
          if (ext === '.9.png') {
            el.src = `${BASE}icons/${entry.name}.png`;
            el.onerror = () => { el.style.display = 'none'; };
          } else {
            el.style.display = 'none';
          }
        }}
      />
    );
  }

  // Selector/layer-list: metadata-only, no visual preview
  const icon = entry.type === 'selector' ? '\u21C4' : '\u29C9';
  return (
    <div className={styles.noPreview}>
      <span className={styles.noPreviewIcon}>{icon}</span>
      <span className={styles.noPreviewLabel}>{entry.type}</span>
    </div>
  );
}

export default function Icons() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = allItems;
    if (search) {
      const lower = search.toLowerCase();
      items = items.filter((e) => e.name.toLowerCase().includes(lower));
    }
    if (activeCategory) {
      items = items.filter((e) => categoryMatches(e.category, activeCategory));
    }
    if (activeType) {
      items = items.filter((e) => e.type === activeType);
    }
    return items;
  }, [search, activeCategory, activeType]);

  return (
    <div className="page">
      <h1 className={styles.title}>Icon and Drawable Browser</h1>
      <p className={styles.subtitle}>
        Browse all 1,317 ATAK drawable resources. Vector drawables render as SVG.
        Shape drawables render as CSS. Filter by category or type.
      </p>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search icons by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search icons"
        />
      </div>

      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>Category:</span>
        <div className={styles.filterButtons}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>Type:</span>
        <div className={styles.filterButtons}>
          {TYPES.map((type) => (
            <button
              key={type}
              className={`${styles.filterBtn} ${activeType === type ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveType(activeType === type ? null : type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.countDisplay}>
        {filtered.length} of {allItems.length} items
      </div>

      <div className={styles.grid}>
        {filtered.map((entry) => (
          <div key={entry.name} className={styles.card}>
            <div className={styles.cardPreview}>
              <CardPreview entry={entry} />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardName} title={entry.name}>
                {entry.name}
              </div>
              <div className={styles.cardBadges}>
                <span className={`${styles.badge} ${typeBadgeClass(entry.type)}`}>
                  {entry.type}
                </span>
                <span className={`${styles.badge} ${styles.badgeCategory}`}>
                  {entry.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className={styles.emptyState}>
          No drawables match your search criteria.
        </div>
      )}
    </div>
  );
}
