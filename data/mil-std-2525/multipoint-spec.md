# Multi-Point Graphics Specification

## What Are Multi-Point Graphics?

Multi-point graphics are tactical control measures in MIL-STD-2525 that require two or more geographic coordinates to render. Unlike single-point symbols (unit icons placed at one lat/lon), these represent spatial features on the battlefield:

- **Boundaries**: Lines separating areas of responsibility between units (e.g., brigade/division boundaries)
- **Phase Lines**: Named lines used for coordination and control of operations (e.g., PL ALPHA, PL BRAVO)
- **Axes of Advance**: Directional arrows indicating planned movement corridors for maneuver elements
- **Engagement Areas**: Polygonal zones where indirect/direct fire is planned to destroy enemy forces

Other examples include direction of attack arrows, forward edge of battle area (FEBA), fire support coordination lines (FSCL), and minimum-risk routes (MRR).

## How 2525D/E Defines Multi-Point Graphics

In MIL-STD-2525D and 2525E, multi-point graphics belong to **Symbol Set 25 (Control Measures)**. Their 20-character SIDC follows the same structure as point symbols:

```
10 [SI] [Status] 25 [HQ/TF/FD] [Echelon] [Entity] [Mod1] [Mod2]
```

The key distinction is that the symbol's geometry is not encoded in the SIDC itself. Instead, the standard defines:

1. **Anchor points**: Each graphic type specifies a minimum and maximum number of coordinate pairs (e.g., an axis of advance requires at least 3 points)
2. **Coordinate arrays**: Ordered sequences of lat/lon pairs that define the shape
3. **Rendering rules**: Algorithmic descriptions for how to interpolate between points (splines for arrows, straight segments for boundaries)

The standard's Appendix B provides rendering specifications for each graphic, including point counts, interpolation methods, and label placement rules.

## How mil-sym-ts Renders Multi-Point Graphics

The mil-sym-ts library (TypeScript port of mil-sym-java) provides multi-point rendering through its `WebRenderer` class:

```typescript
import { WebRenderer } from 'mil-sym-ts';

const result = WebRenderer.RenderSymbol(
  sidc,           // 20-char SIDC (symbol set 25)
  coordinates,    // Array of {x: lon, y: lat} coordinate pairs
  scale,          // Map scale denominator
  bbox,           // Bounding box of current view
  modifiers,      // Label modifiers (AM, AN, T, W, etc.)
  attributes      // Rendering attributes (line color, fill, width)
);
```

Output formats:
- **GeoJSON**: Feature collections with LineString/Polygon geometries for use with web map libraries
- **GeoSVG**: SVG path data with geographic coordinates for direct overlay rendering

The renderer handles spline interpolation, arrow head generation, label anchor computation, and clipping to the visible extent.

## What We Need for the Site

To display multi-point graphics in the TAK Design System gallery, we need:

1. **MapLibre GL JS**: Provides the base map canvas and tile rendering for geographic context
2. **mil-sym-ts Web Worker**: Offloads the computationally expensive rendering (spline math, clipping) off the main thread to maintain 60fps interaction
3. **GeoJSON layer pipeline**: Takes mil-sym-ts output and adds it as a MapLibre source/layer for proper zoom-level rendering

Architecture:

```
User interaction (pan/zoom)
  -> Main thread sends SIDC + viewport bbox to Worker
  -> Worker calls WebRenderer.RenderSymbol()
  -> Worker posts GeoJSON FeatureCollection back
  -> Main thread updates MapLibre source data
  -> MapLibre renders lines/fills/labels on canvas
```

## Proposed Approach for the Gallery

1. **Static preview mode**: For the symbol browser, render each multi-point graphic at a fixed representative scale with predefined coordinate arrays that showcase the graphic's shape (e.g., 4-point axis arrow, 2-point phase line)

2. **Interactive demo**: A dedicated "Multi-Point" tab in the 2525 Explorer with a MapLibre map where users can:
   - Select a multi-point graphic type from the Symbol Set 25 entity list
   - Click points on the map to define the coordinate array
   - See the rendered graphic update in real-time via the Web Worker

3. **Catalog entries**: Each multi-point graphic in the gallery shows:
   - SIDC and entity name
   - Minimum/maximum point count
   - A thumbnail SVG rendered at a canonical scale
   - Description of tactical usage

4. **Performance considerations**:
   - Lazy-load the MapLibre GL bundle only on the multi-point tab
   - Cache rendered GeoJSON for previously viewed graphics
   - Use requestAnimationFrame throttling on the worker message handler during map pan/zoom
