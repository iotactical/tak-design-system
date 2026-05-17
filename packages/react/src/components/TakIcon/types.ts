import type { CSSProperties, ReactNode } from 'react';

export type TakIconSize = 'sm' | 'md' | 'lg' | 'xl';

export interface TakIconProps {
  name: string;
  size?: TakIconSize;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  fallback?: ReactNode;
  interactive?: boolean;
}

export const SIZE_MAP: Record<TakIconSize, number> = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
};

export interface ShapeDefinition {
  name?: string;
  shapeType: string;
  solidColor?: string;
  stroke?: { width?: string; color?: string; dashWidth?: string; dashGap?: string };
  corners?: { radius?: string; topLeftRadius?: string; topRightRadius?: string; bottomLeftRadius?: string; bottomRightRadius?: string };
  gradient?: { startColor?: string; endColor?: string; centerColor?: string; angle?: string; type?: string; gradientRadius?: string };
}

export interface SelectorState {
  drawable?: string;
  color?: string;
  inlineDrawable?: ShapeDefinition;
  inlineColor?: string;
  conditions?: Record<string, boolean>;
}

export interface SelectorDefinition {
  name: string;
  states: SelectorState[];
}

export interface LayerDefinition {
  index: number;
  id?: string;
  drawable?: string;
  inlineShape?: ShapeDefinition;
  gravity?: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number | string;
  height: number | string;
}

export interface LayerListDefinition {
  name: string;
  atakSourceFile: string;
  layers: LayerDefinition[];
}

export interface CatalogEntry {
  name: string;
  type: string;
  category: string;
  densities: string[];
  format: string;
}
