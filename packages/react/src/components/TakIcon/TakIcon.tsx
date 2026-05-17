import { useState, useEffect, useContext, createContext, type CSSProperties, type ReactNode } from 'react';
import type { TakIconProps, TakIconSize, CatalogEntry, ShapeDefinition, SelectorDefinition, LayerListDefinition } from './types';
import { SIZE_MAP } from './types';
import { ShapeRenderer } from './ShapeRenderer';
import { SelectorRenderer } from './SelectorRenderer';
import { LayerListRenderer } from './LayerListRenderer';
import { useDensity } from '../../theme/DensityContext';

// Optional theme context access (doesn't throw if missing)
const TakThemeContext = createContext<{ mode: 'dark' | 'light' } | null>(null);

function useTakThemeOptional() {
  return useContext(TakThemeContext);
}

// Lazy-loaded data caches
let catalogPromise: Promise<CatalogEntry[]> | null = null;
let catalogData: CatalogEntry[] | null = null;
let shapesPromise: Promise<ShapeDefinition[]> | null = null;
let shapesData: ShapeDefinition[] | null = null;
let selectorsPromise: Promise<SelectorDefinition[]> | null = null;
let selectorsData: SelectorDefinition[] | null = null;
let layerListsPromise: Promise<LayerListDefinition[]> | null = null;
let layerListsData: LayerListDefinition[] | null = null;

async function loadCatalog(): Promise<CatalogEntry[]> {
  if (catalogData) return catalogData;
  if (!catalogPromise) {
    catalogPromise = import('../../../../../data/atak-drawable-catalog.json', { assert: { type: 'json' } })
      .then(m => { catalogData = m.default as CatalogEntry[]; return catalogData; });
  }
  return catalogPromise;
}

async function loadShapes(): Promise<ShapeDefinition[]> {
  if (shapesData) return shapesData;
  if (!shapesPromise) {
    shapesPromise = import('../../../../../data/atak-shapes.json', { assert: { type: 'json' } })
      .then(m => { shapesData = m.default as ShapeDefinition[]; return shapesData; });
  }
  return shapesPromise;
}

async function loadSelectors(): Promise<SelectorDefinition[]> {
  if (selectorsData) return selectorsData;
  if (!selectorsPromise) {
    selectorsPromise = import('../../../../../data/atak-selectors.json', { assert: { type: 'json' } })
      .then(m => { selectorsData = m.default as SelectorDefinition[]; return selectorsData; });
  }
  return selectorsPromise;
}

async function loadLayerLists(): Promise<LayerListDefinition[]> {
  if (layerListsData) return layerListsData;
  if (!layerListsPromise) {
    layerListsPromise = import('../../../../../data/atak-layer-lists.json', { assert: { type: 'json' } })
      .then(m => { layerListsData = m.default as LayerListDefinition[]; return layerListsData; });
  }
  return layerListsPromise;
}

interface ResolvedIcon {
  type: 'vector' | 'png' | 'shape' | 'selector' | 'layer-list' | 'not-found';
  entry?: CatalogEntry;
  shape?: ShapeDefinition;
  selector?: SelectorDefinition;
  layerList?: LayerListDefinition;
}

export function TakIcon({ name, size = 'md', className, style, alt, fallback, interactive }: TakIconProps) {
  const [resolved, setResolved] = useState<ResolvedIcon | null>(null);
  const density = useDensityOptional();
  const theme = useTakThemeOptional();

  const densityScale = density === 'mobile' ? 1.25 : 1.0;
  const basePx = SIZE_MAP[size];
  const px = Math.round(basePx * densityScale);

  useEffect(() => {
    let cancelled = false;
    resolveIcon(name).then(r => {
      if (!cancelled) setResolved(r);
    });
    return () => { cancelled = true; };
  }, [name]);

  if (!resolved) {
    return <span className={className} style={{ display: 'inline-block', width: px, height: px, ...style }} />;
  }

  if (resolved.type === 'not-found') {
    if (fallback) return <>{fallback}</>;
    return <span className={className} style={{ display: 'inline-block', width: px, height: px, ...style }} />;
  }

  const sizeStyle: CSSProperties = { width: px, height: px, ...style };

  switch (resolved.type) {
    case 'vector':
      return (
        <img
          src={`/icons/${name}.svg`}
          alt={alt || name}
          width={px}
          height={px}
          loading="lazy"
          className={className}
          style={{ ...sizeStyle, color: theme?.mode === 'light' ? '#1a1a2e' : '#e0e0e0' }}
        />
      );
    case 'png':
      return (
        <img
          src={`/icons/${name}.png`}
          alt={alt || name}
          width={px}
          height={px}
          loading="lazy"
          className={className}
          style={sizeStyle}
        />
      );
    case 'shape':
      return <ShapeRenderer shape={resolved.shape!} size={size} className={className} style={style} />;
    case 'selector':
      return <SelectorRenderer selector={resolved.selector!} size={size} interactive={interactive} className={className} style={style} />;
    case 'layer-list':
      return <LayerListRenderer layerList={resolved.layerList!} size={size} className={className} style={style} />;
    default:
      return <span className={className} style={{ display: 'inline-block', width: px, height: px, ...style }} />;
  }
}

TakIcon.displayName = 'TakIcon';

async function resolveIcon(name: string): Promise<ResolvedIcon> {
  const catalog = await loadCatalog();
  const entry = catalog.find(e => e.name === name);

  if (!entry) {
    return { type: 'not-found' };
  }

  switch (entry.type) {
    case 'vector':
    case 'animated-vector':
      return { type: 'vector', entry };
    case 'png':
    case 'nine-patch':
      return { type: 'png', entry };
    case 'shape': {
      const shapes = await loadShapes();
      const shape = shapes.find(s => s.name === name);
      return shape ? { type: 'shape', entry, shape } : { type: 'png', entry };
    }
    case 'selector': {
      const selectors = await loadSelectors();
      const selector = selectors.find(s => s.name === name);
      return selector ? { type: 'selector', entry, selector } : { type: 'png', entry };
    }
    case 'layer-list': {
      const layerLists = await loadLayerLists();
      const ll = layerLists.find(l => l.name === name);
      return ll ? { type: 'layer-list', entry, layerList: ll } : { type: 'png', entry };
    }
    default:
      return { type: 'png', entry };
  }
}

function useDensityOptional(): 'mobile' | 'desktop' {
  try {
    return useDensity();
  } catch {
    return 'desktop';
  }
}

export type { TakIconProps, TakIconSize };
