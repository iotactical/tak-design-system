import type { CSSProperties } from 'react';
import type { SelectorDefinition, TakIconSize } from './types';
import { SIZE_MAP } from './types';
import { ShapeRenderer, resolveColor } from './ShapeRenderer';

interface SelectorRendererProps {
  selector: SelectorDefinition;
  size?: TakIconSize;
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function SelectorRenderer({ selector, size = 'md', interactive, className, style }: SelectorRendererProps) {
  const px = SIZE_MAP[size];

  // Default: show pre-rendered PNG
  if (!interactive) {
    return (
      <img
        src={`/icons/selectors/${selector.name}.png`}
        alt={selector.name}
        width={px}
        height={px}
        loading="lazy"
        className={className}
        style={style}
      />
    );
  }

  // Interactive mode: resolve default state and render inline
  const defaultState = selector.states.find(s => !s.conditions) || selector.states[selector.states.length - 1];

  if (!defaultState) {
    return <div className={className} style={{ width: px, height: px, backgroundColor: '#2a2a3e', ...style }} role="img" aria-label={selector.name} />;
  }

  if (defaultState.inlineDrawable) {
    return <ShapeRenderer shape={defaultState.inlineDrawable} size={size} className={className} style={style} />;
  }

  if (defaultState.inlineColor || defaultState.color) {
    const color = resolveColor(defaultState.inlineColor || defaultState.color);
    return (
      <div
        className={className}
        style={{ width: px, height: px, backgroundColor: color || '#333', ...style }}
        role="img"
        aria-label={selector.name}
      />
    );
  }

  if (defaultState.drawable?.startsWith('@drawable/')) {
    const refName = defaultState.drawable.replace('@drawable/', '');
    return (
      <img
        src={`/icons/${refName}.png`}
        alt={selector.name}
        width={px}
        height={px}
        loading="lazy"
        className={className}
        style={style}
      />
    );
  }

  // Fallback to pre-rendered PNG
  return (
    <img
      src={`/icons/selectors/${selector.name}.png`}
      alt={selector.name}
      width={px}
      height={px}
      loading="lazy"
      className={className}
      style={style}
    />
  );
}
