import type { CSSProperties } from 'react';
import type { ShapeDefinition, TakIconSize } from './types';
import { SIZE_MAP } from './types';

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

export function resolveColor(ref: string | undefined): string | undefined {
  if (!ref) return undefined;
  if (ref.startsWith('#')) return ref;
  return COLOR_MAP[ref] || '#888888';
}

interface ShapeRendererProps {
  shape: ShapeDefinition;
  size?: TakIconSize;
  className?: string;
  style?: CSSProperties;
}

export function ShapeRenderer({ shape, size = 'md', className, style }: ShapeRendererProps) {
  const px = SIZE_MAP[size];
  const css: CSSProperties = {
    width: px,
    height: px,
    boxSizing: 'border-box',
    ...style,
  };

  // Background
  if (shape.gradient) {
    const g = shape.gradient;
    if (g.type === 'radial') {
      const stops = buildGradientStops(g);
      css.background = `radial-gradient(circle, ${stops})`;
    } else if (g.type === 'sweep') {
      const stops = buildGradientStops(g);
      css.background = `conic-gradient(${stops})`;
    } else {
      const angle = parseInt(g.angle || '0', 10);
      const cssAngle = (angle + 90) % 360;
      const stops = buildGradientStops(g);
      css.background = `linear-gradient(${cssAngle}deg, ${stops})`;
    }
  } else if (shape.solidColor) {
    const color = resolveColor(shape.solidColor);
    if (color && color !== 'transparent') {
      css.backgroundColor = color;
    }
  } else {
    css.backgroundColor = '#333';
  }

  // Border radius
  if (shape.shapeType === 'oval') {
    css.borderRadius = '50%';
  } else if (shape.corners) {
    if (shape.corners.radius) {
      css.borderRadius = parseDp(shape.corners.radius);
    } else {
      css.borderTopLeftRadius = parseDp(shape.corners.topLeftRadius);
      css.borderTopRightRadius = parseDp(shape.corners.topRightRadius);
      css.borderBottomLeftRadius = parseDp(shape.corners.bottomLeftRadius);
      css.borderBottomRightRadius = parseDp(shape.corners.bottomRightRadius);
    }
  }

  // Stroke
  if (shape.stroke) {
    const strokeColor = resolveColor(shape.stroke.color) || '#888';
    const strokeWidth = parseDp(shape.stroke.width) || 1;
    if (shape.stroke.dashWidth) {
      css.border = `${strokeWidth}px dashed ${strokeColor}`;
    } else {
      css.border = `${strokeWidth}px solid ${strokeColor}`;
    }
  }

  // Ring type
  if (shape.shapeType === 'ring') {
    css.borderRadius = '50%';
    css.backgroundColor = 'transparent';
    if (!shape.stroke) {
      css.border = `${Math.max(2, px / 8)}px solid ${resolveColor(shape.solidColor) || '#888'}`;
    }
  }

  // Line type
  if (shape.shapeType === 'line') {
    css.backgroundColor = 'transparent';
    css.borderBottom = `${parseDp(shape.stroke?.width) || 1}px solid ${resolveColor(shape.stroke?.color) || '#888'}`;
    css.height = px;
    css.display = 'flex';
    css.alignItems = 'center';
  }

  return <div className={className} style={css} role="img" aria-label={shape.name || 'shape'} />;
}

function buildGradientStops(g: NonNullable<ShapeDefinition['gradient']>): string {
  const stops: string[] = [];
  if (g.startColor) stops.push(resolveColor(g.startColor) || '#000');
  if (g.centerColor) stops.push(resolveColor(g.centerColor) || '#888');
  if (g.endColor) stops.push(resolveColor(g.endColor) || '#fff');
  return stops.join(', ');
}

function parseDp(value: string | undefined): number | undefined {
  if (!value) return undefined;
  return parseInt(value.replace('dp', '').replace('px', ''), 10) || undefined;
}
