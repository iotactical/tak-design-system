#!/usr/bin/env node
// rtmx:req REQ-ICN-011
/**
 * REQ-ICN-011: Layer-List Composition Extraction
 *
 * Reads ATAK layer-list drawable XMLs and extracts composition data into
 * data/atak-layer-lists.json. Each entry contains an ordered array of layers
 * with offsets, drawable references, and inline shape definitions.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Support ATAK_DRAWABLE env var or default to the atak-civ GitHub checkout
const ATAK_DRAWABLE = process.env.ATAK_DRAWABLE || resolve(
  process.env.HOME,
  'code/github.com/TAK-Product-Center/atak-civ/atak/ATAK/app/src/main/res/drawable'
);

if (!existsSync(ATAK_DRAWABLE)) {
  console.error(`ATAK drawable directory not found: ${ATAK_DRAWABLE}`);
  process.exit(1);
}

const catalogPath = resolve(ROOT, 'data', 'atak-drawable-catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const layerListNames = catalog
  .filter((e) => e.type === 'layer-list')
  .map((e) => e.name);

function readXml(name) {
  const p = resolve(ATAK_DRAWABLE, `${name}.xml`);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8');
}

// Parse an inline <shape> block into a structured object
function parseInlineShape(shapeXml) {
  const result = {};

  const typeMatch = shapeXml.match(/android:shape\s*=\s*"([^"]+)"/);
  result.shapeType = typeMatch ? typeMatch[1] : 'rectangle';

  const solidMatch = shapeXml.match(/<solid\b[^>]*android:color\s*=\s*"([^"]+)"/);
  if (solidMatch) result.solidColor = solidMatch[1];

  const strokeW = shapeXml.match(/<stroke\b[^>]*android:width\s*=\s*"([^"]+)"/);
  const strokeC = shapeXml.match(/<stroke\b[^>]*android:color\s*=\s*"([^"]+)"/);
  if (strokeW || strokeC) {
    result.stroke = {};
    if (strokeW) result.stroke.width = strokeW[1];
    if (strokeC) result.stroke.color = strokeC[1];
  }

  const radiusMatch = shapeXml.match(/<corners\b[^>]*android:radius\s*=\s*"([^"]+)"/);
  if (radiusMatch) {
    result.corners = { radius: radiusMatch[1] };
  } else {
    const corners = {};
    for (const attr of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
      const m = shapeXml.match(new RegExp(`android:${attr}\\s*=\\s*"([^"]+)"`));
      if (m) corners[attr] = m[1];
    }
    if (Object.keys(corners).length > 0) result.corners = corners;
  }

  const gradMatch = shapeXml.match(/<gradient\b([^>]*)\/?>/s);
  if (gradMatch) {
    const ga = gradMatch[1];
    const gradient = {};
    for (const f of ['startColor', 'endColor', 'centerColor', 'angle', 'type', 'gradientRadius']) {
      const m = ga.match(new RegExp(`android:${f}\\s*=\\s*"([^"]+)"`));
      if (m) gradient[f] = m[1];
    }
    if (Object.keys(gradient).length > 0) result.gradient = gradient;
  }

  const sizeH = shapeXml.match(/<size\b[^>]*android:height\s*=\s*"([^"]+)"/);
  const sizeW = shapeXml.match(/<size\b[^>]*android:width\s*=\s*"([^"]+)"/);
  if (sizeH) result.height = sizeH[1];
  if (sizeW) result.width = sizeW[1];

  return result;
}

// Extract offset attributes from an <item> tag's attributes string
function parseOffsets(attrs) {
  const offsets = {};
  for (const dir of ['left', 'top', 'right', 'bottom']) {
    const m = attrs.match(new RegExp(`android:${dir}\\s*=\\s*"([^"]+)"`));
    offsets[dir] = m ? m[1] : '0';
  }
  return offsets;
}

// Parse a single <item>...</item> block from a layer-list
function parseLayerItem(itemBlock, index) {
  const layer = { index };

  // Extract attributes from the opening <item> tag
  const openTag = itemBlock.match(/<item\b([^>]*?)(?:\/>|>)/s);
  const attrs = openTag ? openTag[1] : '';

  // ID
  const idMatch = attrs.match(/android:id\s*=\s*"([^"]+)"/);
  if (idMatch) layer.id = idMatch[1];

  // Gravity on the item
  const gravMatch = attrs.match(/android:gravity\s*=\s*"([^"]+)"/);
  if (gravMatch) layer.gravity = gravMatch[1];

  // Offsets
  const offsets = parseOffsets(attrs);
  layer.left = offsets.left;
  layer.top = offsets.top;
  layer.right = offsets.right;
  layer.bottom = offsets.bottom;

  // Width/height on item
  const wMatch = attrs.match(/android:width\s*=\s*"([^"]+)"/);
  const hMatch = attrs.match(/android:height\s*=\s*"([^"]+)"/);
  layer.width = wMatch ? wMatch[1] : null;
  layer.height = hMatch ? hMatch[1] : null;

  // Drawable reference on the item tag itself
  const drawableMatch = attrs.match(/android:drawable\s*=\s*"([^"]+)"/);
  if (drawableMatch) {
    layer.drawable = drawableMatch[1];
    return layer;
  }

  // Check for inline content: clip+shape first (before bare shape)
  const clipShape = itemBlock.match(/<clip>[\s\S]*?(<shape\b[\s\S]*?<\/shape>)[\s\S]*?<\/clip>/);
  if (clipShape) {
    layer.drawable = 'inline:clip+shape';
    layer.inlineShape = parseInlineShape(clipShape[1]);
    return layer;
  }

  const shapeMatch = itemBlock.match(/<shape\b[\s\S]*?<\/shape>/);
  if (shapeMatch) {
    layer.drawable = 'inline:shape';
    layer.inlineShape = parseInlineShape(shapeMatch[0]);
    return layer;
  }

  const bitmapMatch = itemBlock.match(/<bitmap\b([^>]*)\/?>/s);
  if (bitmapMatch) {
    const ba = bitmapMatch[1];
    const src = ba.match(/android:src\s*=\s*"([^"]+)"/);
    const grav = ba.match(/android:gravity\s*=\s*"([^"]+)"/);
    layer.drawable = src ? src[1] : 'inline:bitmap';
    if (grav) layer.gravity = grav[1];
    return layer;
  }

  // <color> inline
  const colorMatch = itemBlock.match(/<color\b[^>]*android:color\s*=\s*"([^"]+)"/);
  if (colorMatch) {
    layer.drawable = `inline:color`;
    layer.inlineColor = colorMatch[1];
    return layer;
  }

  // Fallback: no recognizable content
  layer.drawable = null;
  return layer;
}

// Parse a full layer-list XML
function parseLayerList(name) {
  const xml = readXml(name);
  if (!xml) return null;

  // Strip XML comments to avoid parsing commented-out items
  const cleanXml = xml.replace(/<!--[\s\S]*?-->/g, '');

  // Verify it's actually a layer-list (not a selector wrapping layer-lists)
  if (!cleanXml.match(/<layer-list\b[^>]*>/)) return null;

  const warnings = [];
  const layers = [];

  // Split items -- we need to handle nested elements carefully.
  // Match <item ...>...</item> or self-closing <item ... />
  // Use a simple state machine to handle nesting depth.
  const items = [];
  let depth = 0;
  let currentStart = -1;

  // Find all <item and </item> positions
  const tagRegex = /<(\/?)item\b([^>]*?)(\/?)>/gs;
  let m;
  while ((m = tagRegex.exec(cleanXml)) !== null) {
    const isClosing = m[1] === '/';
    const isSelfClosing = m[3] === '/';
    const pos = m.index;

    if (!isClosing && !isSelfClosing) {
      if (depth === 0) currentStart = pos;
      depth++;
    } else if (isClosing) {
      depth--;
      if (depth === 0 && currentStart >= 0) {
        items.push(cleanXml.substring(currentStart, pos + m[0].length));
        currentStart = -1;
      }
    } else if (isSelfClosing) {
      if (depth === 0) {
        items.push(m[0]);
      }
    }
  }

  for (let i = 0; i < items.length; i++) {
    const layer = parseLayerItem(items[i], i);
    // Validate drawable references
    if (layer.drawable && layer.drawable.startsWith('@drawable/')) {
      const refName = layer.drawable.replace('@drawable/', '');
      const exists = catalog.some((e) => e.name === refName);
      if (!exists) {
        warnings.push(`Layer ${i}: unresolvable reference ${layer.drawable}`);
      }
    }
    layers.push(layer);
  }

  const entry = {
    name,
    atakSourceFile: `${name}.xml`,
    layers,
  };
  if (warnings.length > 0) entry.warnings = warnings;
  return entry;
}

// Process all cataloged layer-list drawables
const results = [];
for (const name of layerListNames) {
  const parsed = parseLayerList(name);
  if (parsed) results.push(parsed);
  else console.warn(`Warning: Could not parse layer-list for ${name}`);
}

results.sort((a, b) => a.name.localeCompare(b.name));

const outPath = resolve(ROOT, 'data', 'atak-layer-lists.json');
writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n');
console.log(`Wrote ${results.length} layer-lists to ${outPath}`);

if (results.length !== 36) {
  console.warn(`Expected 36 layer-lists but got ${results.length}`);
}
