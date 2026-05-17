// rtmx:req REQ-SITE-003
// rtmx:req REQ-SITE-010
// rtmx:req REQ-SITE-011
// rtmx:req REQ-SITE-012
// rtmx:req REQ-XW-121
import { useEffect, useState, useMemo, useCallback, useRef, type CSSProperties } from 'react';
import { useHighlight } from '../hooks/useHighlight';
import styles from './Icons.module.css';
import catalog from '../../../data/atak-drawable-catalog.json';
import shapeData from '../../../data/atak-shapes.json';
import selectorData from '../../../data/atak-selectors.json';
import layerListData from '../../../data/atak-layer-lists.json';

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
  gradient?: { startColor?: string; endColor?: string; centerColor?: string; angle?: string; type?: string };
};

type SelectorState = {
  drawable?: string;
  color?: string;
  inlineDrawable?: ShapeEntry;
  inlineColor?: string;
  conditions?: Record<string, boolean>;
};

type SelectorEntry = {
  name: string;
  states: SelectorState[];
};

type LayerEntry = {
  index: number;
  id?: string;
  drawable?: string;
  inlineShape?: ShapeEntry;
  gravity?: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number | string;
  height: number | string;
};

type LayerListEntry = {
  name: string;
  atakSourceFile: string;
  layers: LayerEntry[];
};

const allItems: CatalogEntry[] = catalog as CatalogEntry[];
const shapeMap = new Map<string, ShapeEntry>();
for (const s of shapeData as ShapeEntry[]) {
  shapeMap.set(s.name, s);
}

const selectorMap = new Map<string, SelectorEntry>();
for (const sel of selectorData as SelectorEntry[]) {
  selectorMap.set(sel.name, sel);
}

const layerListMap = new Map<string, LayerListEntry>();
for (const ll of layerListData as LayerListEntry[]) {
  layerListMap.set(ll.name, ll);
}

const catMap = new Map<string, CatalogEntry>();
for (const e of allItems) catMap.set(e.name, e);

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

const COLOR_MAP: Record<string, string> = {
  '@color/dark_gray': '#444444',
  '@color/darker_gray': '#333333',
  '@color/lighter_gray': '#CCCCCC',
  '@color/pastel_gray': '#C0C0C0',
  '@color/trolley_grey': '#808080',
  '@color/taupe': '#7B6B5A',
  '@color/deep_carmine_pink': '#EF3038',
  '@color/black': '#000000',
  '@color/white': '#FFFFFF',
  '@color/led_green': '#00FF00',
  '@android:color/darker_gray': '#333333',
  '@android:color/white': '#FFFFFF',
  '@android:color/black': '#000000',
  '@android:color/transparent': 'transparent',
};

function resolveColor(ref: string | undefined): string | undefined {
  if (!ref) return undefined;
  if (ref.startsWith('#')) return ref;
  return COLOR_MAP[ref] || '#888888';
}

function ShapePreview({ shape, size = 40 }: { shape: ShapeEntry; size?: number }) {
  const s: CSSProperties = {
    width: size,
    height: size,
    borderRadius: shape.shapeType === 'oval' ? '50%' : undefined,
    boxSizing: 'border-box',
  };

  if (shape.solidColor) {
    s.backgroundColor = resolveColor(shape.solidColor);
  }

  if (shape.gradient) {
    const g = shape.gradient;
    if (g.type === 'radial') {
      s.background = `radial-gradient(circle, ${resolveColor(g.startColor) || '#333'}, ${resolveColor(g.endColor) || '#666'})`;
    } else {
      const angle = parseInt(g.angle || '0', 10);
      const cssAngle = (angle + 90) % 360;
      const stops = [resolveColor(g.startColor) || '#333'];
      if (g.centerColor) stops.push(resolveColor(g.centerColor)!);
      stops.push(resolveColor(g.endColor) || '#666');
      s.background = `linear-gradient(${cssAngle}deg, ${stops.join(', ')})`;
    }
  }

  if (shape.stroke) {
    s.border = `${dpToPx(shape.stroke.width) || 1}px solid ${resolveColor(shape.stroke.color) || '#666'}`;
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

  if (shape.shapeType === 'ring') {
    s.borderRadius = '50%';
    s.backgroundColor = 'transparent';
    if (!shape.stroke) {
      s.border = `${Math.max(2, size / 8)}px solid ${resolveColor(shape.solidColor) || '#888'}`;
    }
  }

  if (!s.backgroundColor && !s.background) {
    s.backgroundColor = '#333';
  }

  return <div style={s} />;
}

function LayerListPreview({ layerList, size = 40 }: { layerList: LayerListEntry; size?: number }) {
  const scale = size / 48;
  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'hidden' }}>
      {layerList.layers.map((layer, i) => {
        const layerStyle: CSSProperties = {
          position: 'absolute',
          left: layer.left * scale,
          top: layer.top * scale,
          right: layer.right * scale,
          bottom: layer.bottom * scale,
        };
        if (typeof layer.width === 'number' && layer.width > 0) layerStyle.width = layer.width * scale;
        if (typeof layer.height === 'number' && layer.height > 0) layerStyle.height = layer.height * scale;

        if (layer.inlineShape) {
          return (
            <div key={i} style={layerStyle}>
              <ShapePreview shape={layer.inlineShape} size={size} />
            </div>
          );
        }
        if (layer.drawable?.startsWith('@color/') || layer.drawable?.startsWith('@android:color/')) {
          return <div key={i} style={{ ...layerStyle, backgroundColor: resolveColor(layer.drawable) }} />;
        }
        if (layer.drawable?.startsWith('@drawable/')) {
          const refName = layer.drawable.replace('@drawable/', '');
          return (
            <div key={i} style={layerStyle}>
              <img
                src={`${BASE}icons/${refName}.png`}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          );
        }
        return <div key={i} style={{ ...layerStyle, backgroundColor: '#2a2a3e' }} />;
      })}
    </div>
  );
}

function CardPreview({ entry }: { entry: CatalogEntry }) {
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

  const shape = shapeMap.get(entry.name);
  if (entry.type === 'shape' && shape) {
    return <ShapePreview shape={shape} />;
  }

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

  // REQ-SITE-010: Selector -- use pre-rendered PNG from ICN-013
  if (entry.type === 'selector') {
    return (
      <img
        src={`${BASE}icons/selectors/${entry.name}.png`}
        alt={entry.name}
        className={styles.pngPreview}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          console.warn(`[TakIcons] Missing selector preview: ${entry.name}`);
        }}
      />
    );
  }

  // REQ-SITE-010: Layer-list -- inline CSS composition
  if (entry.type === 'layer-list') {
    const ll = layerListMap.get(entry.name);
    if (ll) {
      return <LayerListPreview layerList={ll} />;
    }
  }

  // Fallback (should not fire under normal operation)
  console.warn(`[TakIcons] No preview available for: ${entry.name} (${entry.type})`);
  return (
    <div className={styles.noPreview}>
      <span className={styles.noPreviewIcon}>?</span>
      <span className={styles.noPreviewLabel}>{entry.type}</span>
    </div>
  );
}

// REQ-SITE-011: Selector Inspector Panel
function SelectorInspector({ selector, onClose }: { selector: SelectorEntry; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.inspectorOverlay} onClick={onClose}>
      <div
        ref={panelRef}
        className={styles.inspectorPanel}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-label={`Selector inspector: ${selector.name}`}
      >
        <div className={styles.inspectorHeader}>
          <h3 className={styles.inspectorTitle}>{selector.name}</h3>
          <button className={styles.inspectorClose} onClick={onClose} aria-label="Close inspector">
            x
          </button>
        </div>
        <div className={styles.inspectorBody}>
          <p className={styles.inspectorMeta}>{selector.states.length} states (first-match-wins evaluation order)</p>
          <div className={styles.stateList}>
            {selector.states.map((state, i) => {
              const isDefault = !state.conditions;
              const label = isDefault
                ? 'Default (fallback)'
                : Object.entries(state.conditions!).map(([k, v]) => `${k}=${v}`).join(', ');
              return (
                <div key={i} className={styles.stateRow}>
                  <div className={styles.statePriority}>{i + 1}</div>
                  <div className={styles.statePreview}>
                    <StatePreview state={state} selectorName={selector.name} />
                  </div>
                  <div className={styles.stateInfo}>
                    <div className={styles.stateLabel}>{label}</div>
                    <div className={styles.stateRef}>
                      {state.drawable || state.color || state.inlineColor || '(inline)'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatePreview({ state, selectorName }: { state: SelectorState; selectorName: string }) {
  if (state.inlineDrawable) {
    return <ShapePreview shape={state.inlineDrawable} size={32} />;
  }
  if (state.inlineColor || state.color) {
    const color = resolveColor(state.inlineColor || state.color);
    return <div style={{ width: 32, height: 32, backgroundColor: color || '#333' }} />;
  }
  if (state.drawable?.startsWith('@drawable/')) {
    const refName = state.drawable.replace('@drawable/', '');
    return (
      <img
        src={`${BASE}icons/${refName}.png`}
        alt={refName}
        style={{ width: 32, height: 32, objectFit: 'contain' }}
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
      />
    );
  }
  if (state.drawable?.startsWith('@color/') || state.drawable?.startsWith('@android:color/')) {
    const color = resolveColor(state.drawable);
    return <div style={{ width: 32, height: 32, backgroundColor: color || '#333' }} />;
  }
  return <div style={{ width: 32, height: 32, backgroundColor: '#2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888' }}>?</div>;
}

// REQ-SITE-012: Layer-List Inspector Panel
function LayerListInspector({ layerList, onClose }: { layerList: LayerListEntry; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [visibleLayers, setVisibleLayers] = useState<boolean[]>(() => layerList.layers.map(() => true));

  useEffect(() => {
    panelRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const toggleLayer = (idx: number) => {
    setVisibleLayers(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  return (
    <div className={styles.inspectorOverlay} onClick={onClose}>
      <div
        ref={panelRef}
        className={styles.inspectorPanel}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-label={`Layer-list inspector: ${layerList.name}`}
      >
        <div className={styles.inspectorHeader}>
          <h3 className={styles.inspectorTitle}>{layerList.name}</h3>
          <button className={styles.inspectorClose} onClick={onClose} aria-label="Close inspector">
            x
          </button>
        </div>
        <div className={styles.inspectorBody}>
          <p className={styles.inspectorMeta}>{layerList.layers.length} layers | Source: {layerList.atakSourceFile}</p>

          <div className={styles.layerComposite}>
            <div style={{ position: 'relative', width: 96, height: 96, overflow: 'hidden', background: '#1a1a2e', borderRadius: 4 }}>
              {layerList.layers.map((layer, i) => {
                if (!visibleLayers[i]) return null;
                const scale = 96 / 48;
                const ls: CSSProperties = {
                  position: 'absolute',
                  left: layer.left * scale,
                  top: layer.top * scale,
                  right: layer.right * scale,
                  bottom: layer.bottom * scale,
                  opacity: 0.85,
                };
                if (typeof layer.width === 'number' && layer.width > 0) ls.width = layer.width * scale;
                if (typeof layer.height === 'number' && layer.height > 0) ls.height = layer.height * scale;

                if (layer.inlineShape) {
                  return <div key={i} style={ls}><ShapePreview shape={layer.inlineShape} size={96} /></div>;
                }
                if (layer.drawable?.startsWith('@drawable/')) {
                  const refName = layer.drawable.replace('@drawable/', '');
                  return (
                    <div key={i} style={ls}>
                      <img src={`${BASE}icons/${refName}.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  );
                }
                if (layer.drawable?.startsWith('@color/') || layer.drawable?.startsWith('@android:color/')) {
                  return <div key={i} style={{ ...ls, backgroundColor: resolveColor(layer.drawable) }} />;
                }
                return <div key={i} style={{ ...ls, backgroundColor: '#2a2a3e' }} />;
              })}
            </div>
          </div>

          <div className={styles.stateList}>
            {layerList.layers.map((layer, i) => (
              <div key={i} className={styles.stateRow}>
                <div className={styles.statePriority}>{layer.index}</div>
                <label className={styles.layerToggle}>
                  <input
                    type="checkbox"
                    checked={visibleLayers[i]}
                    onChange={() => toggleLayer(i)}
                  />
                </label>
                <div className={styles.statePreview}>
                  {layer.inlineShape ? (
                    <ShapePreview shape={layer.inlineShape} size={28} />
                  ) : (
                    <div style={{ width: 28, height: 28, backgroundColor: '#2a2a3e', borderRadius: 2 }} />
                  )}
                </div>
                <div className={styles.stateInfo}>
                  <div className={styles.stateLabel}>{layer.drawable || layer.id || `layer-${layer.index}`}</div>
                  <div className={styles.stateRef}>
                    {layer.left || layer.top || layer.right || layer.bottom
                      ? `offsets: L${layer.left} T${layer.top} R${layer.right} B${layer.bottom}dp`
                      : 'no offset'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Icons() {
  useEffect(() => { document.title = 'Icons - TAK Design System'; }, []);
  useHighlight();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [inspectedSelector, setInspectedSelector] = useState<SelectorEntry | null>(null);
  const [inspectedLayerList, setInspectedLayerList] = useState<LayerListEntry | null>(null);

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

  const handleCardClick = useCallback((entry: CatalogEntry) => {
    if (entry.type === 'selector') {
      const sel = selectorMap.get(entry.name);
      if (sel) setInspectedSelector(sel);
    } else if (entry.type === 'layer-list') {
      const ll = layerListMap.get(entry.name);
      if (ll) setInspectedLayerList(ll);
    }
  }, []);

  return (
    <div className="page">
      <h1 className={styles.title}>Icon and Drawable Browser</h1>
      <p className={styles.subtitle}>
        Browse all 1,317 TAK drawable resources. Vector drawables render as SVG.
        Shape drawables render as CSS. Click selector or layer-list cards to inspect.
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
          <div
            key={entry.name}
            className={`${styles.card} ${entry.type === 'selector' || entry.type === 'layer-list' ? styles.cardClickable : ''}`}
            data-highlight={entry.name}
            onClick={() => handleCardClick(entry)}
          >
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

      {inspectedSelector && (
        <SelectorInspector
          selector={inspectedSelector}
          onClose={() => setInspectedSelector(null)}
        />
      )}

      {inspectedLayerList && (
        <LayerListInspector
          layerList={inspectedLayerList}
          onClose={() => setInspectedLayerList(null)}
        />
      )}
    </div>
  );
}
