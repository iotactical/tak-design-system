import type { CSSProperties } from 'react';
import type { LayerListDefinition, LayerDefinition, TakIconSize } from './types';
import { SIZE_MAP } from './types';
import { ShapeRenderer, resolveColor } from './ShapeRenderer';

interface LayerListRendererProps {
  layerList: LayerListDefinition;
  size?: TakIconSize;
  className?: string;
  style?: CSSProperties;
}

export function LayerListRenderer({ layerList, size = 'md', className, style }: LayerListRendererProps) {
  const px = SIZE_MAP[size];

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: px,
    height: px,
    overflow: 'hidden',
    ...style,
  };

  return (
    <div className={className} style={containerStyle} role="img" aria-label={layerList.name}>
      {layerList.layers.map((layer, i) => (
        <LayerItem key={i} layer={layer} containerSize={px} size={size} />
      ))}
    </div>
  );
}

function LayerItem({ layer, containerSize, size }: { layer: LayerDefinition; containerSize: number; size: TakIconSize }) {
  const scale = containerSize / 48; // layer offsets are relative to 48dp base
  const layerStyle: CSSProperties = {
    position: 'absolute',
    left: layer.left * scale,
    top: layer.top * scale,
    right: layer.right * scale,
    bottom: layer.bottom * scale,
  };

  // Apply gravity
  if (layer.gravity) {
    applyGravity(layerStyle, layer.gravity, containerSize, layer, scale);
  }

  // Width/height constraints
  if (typeof layer.width === 'number' && layer.width > 0) {
    layerStyle.width = layer.width * scale;
  }
  if (typeof layer.height === 'number' && layer.height > 0) {
    layerStyle.height = layer.height * scale;
  }

  // Render layer content
  if (layer.inlineShape) {
    return (
      <div style={layerStyle}>
        <ShapeRenderer shape={layer.inlineShape} size={size} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  if (layer.drawable?.startsWith('@color/') || layer.drawable?.startsWith('@android:color/')) {
    const color = resolveColor(layer.drawable);
    return <div style={{ ...layerStyle, backgroundColor: color }} />;
  }

  if (layer.drawable?.startsWith('@drawable/')) {
    const refName = layer.drawable.replace('@drawable/', '');
    return (
      <div style={layerStyle}>
        <img
          src={`/icons/${refName}.png`}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          loading="lazy"
        />
      </div>
    );
  }

  // Inline clip+shape or unknown
  return <div style={{ ...layerStyle, backgroundColor: '#2a2a3e' }} />;
}

function applyGravity(
  style: CSSProperties,
  gravity: string,
  containerSize: number,
  layer: LayerDefinition,
  scale: number,
) {
  const parts = gravity.split('|');
  for (const part of parts) {
    switch (part.trim()) {
      case 'center':
        style.left = '50%';
        style.top = '50%';
        style.transform = 'translate(-50%, -50%)';
        style.right = 'auto';
        style.bottom = 'auto';
        break;
      case 'center_horizontal':
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        style.right = 'auto';
        break;
      case 'center_vertical':
        style.top = '50%';
        style.transform = 'translateY(-50%)';
        style.bottom = 'auto';
        break;
      case 'fill':
        style.left = 0;
        style.top = 0;
        style.right = 0;
        style.bottom = 0;
        break;
      case 'fill_horizontal':
        style.left = 0;
        style.right = 0;
        break;
      case 'fill_vertical':
        style.top = 0;
        style.bottom = 0;
        break;
      case 'top':
        style.top = layer.top * scale;
        style.bottom = 'auto';
        break;
      case 'bottom':
        style.bottom = layer.bottom * scale;
        style.top = 'auto';
        break;
      case 'left':
      case 'start':
        style.left = layer.left * scale;
        style.right = 'auto';
        break;
      case 'right':
      case 'end':
        style.right = layer.right * scale;
        style.left = 'auto';
        break;
    }
  }
}
