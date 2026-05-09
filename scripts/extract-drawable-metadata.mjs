#!/usr/bin/env node
/**
 * REQ-ICN-005, REQ-ICN-006, REQ-ICN-007: ATAK Drawable Metadata Extraction
 *
 * Reads data/atak-drawable-catalog.json and extracts detailed metadata from
 * ATAK XML drawable resources:
 *   - Selectors (REQ-ICN-007): state conditions and referenced drawables
 *   - Shapes (REQ-ICN-006): shape type, colors, stroke, corners, gradient
 *   - Button states (REQ-ICN-005): state-dependent background definitions
 *
 * Outputs:
 *   data/atak-selectors.json
 *   data/atak-shapes.json
 *   data/atak-button-states.json
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const ATAK_DRAWABLE = resolve(
  process.env.HOME,
  'Downloads/atak-master/ATAK/app/src/main/res/drawable'
);

if (!existsSync(ATAK_DRAWABLE)) {
  console.error(`ATAK drawable directory not found: ${ATAK_DRAWABLE}`);
  process.exit(1);
}

const catalogPath = resolve(ROOT, 'data', 'atak-drawable-catalog.json');
if (!existsSync(catalogPath)) {
  console.error(`Catalog not found: ${catalogPath}`);
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

const outDir = resolve(ROOT, 'data');
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Utility: read XML file for a drawable name
// ---------------------------------------------------------------------------

function readDrawableXml(name) {
  const filePath = resolve(ATAK_DRAWABLE, `${name}.xml`);
  if (!existsSync(filePath)) return null;
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// REQ-ICN-007: Selectors -- extract state conditions and referenced drawables
// ---------------------------------------------------------------------------

const STATE_ATTRS = [
  'state_pressed',
  'state_selected',
  'state_enabled',
  'state_checked',
  'state_focused',
  'state_activated',
  'state_checkable',
  'state_hovered',
  'state_window_focused',
];

function parseSelector(name) {
  const xml = readDrawableXml(name);
  if (!xml) return null;

  const states = [];
  // Match each <item ...> tag (may span multiple lines)
  const itemRegex = /<item\b([^>]*)\/?>/gs;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const state = {};

    // Extract drawable reference
    const drawableMatch = attrs.match(/android:drawable\s*=\s*"([^"]+)"/);
    if (drawableMatch) {
      state.drawable = drawableMatch[1];
    }

    // Extract state conditions
    const conditions = {};
    for (const stateAttr of STATE_ATTRS) {
      const stateMatch = attrs.match(new RegExp(`android:${stateAttr}\\s*=\\s*"([^"]+)"`));
      if (stateMatch) {
        conditions[stateAttr] = stateMatch[1] === 'true';
      }
    }
    if (Object.keys(conditions).length > 0) {
      state.conditions = conditions;
    }

    states.push(state);
  }

  if (states.length === 0) return null;
  return { name, states };
}

// ---------------------------------------------------------------------------
// REQ-ICN-006: Shapes -- extract shape type, colors, stroke, corners, gradient
// ---------------------------------------------------------------------------

function parseShape(name) {
  const xml = readDrawableXml(name);
  if (!xml) return null;

  const result = { name };

  // Shape type from <shape android:shape="..."> or default "rectangle"
  const shapeTypeMatch = xml.match(/android:shape\s*=\s*"([^"]+)"/);
  result.shapeType = shapeTypeMatch ? shapeTypeMatch[1] : 'rectangle';

  // Solid color
  const solidMatch = xml.match(/<solid\b[^>]*android:color\s*=\s*"([^"]+)"/);
  if (solidMatch) {
    result.solidColor = solidMatch[1];
  }

  // Stroke
  const strokeWidthMatch = xml.match(/<stroke\b[^>]*android:width\s*=\s*"([^"]+)"/);
  const strokeColorMatch = xml.match(/<stroke\b[^>]*android:color\s*=\s*"([^"]+)"/);
  if (strokeWidthMatch || strokeColorMatch) {
    result.stroke = {};
    if (strokeWidthMatch) result.stroke.width = strokeWidthMatch[1];
    if (strokeColorMatch) result.stroke.color = strokeColorMatch[1];
  }

  // Corners
  const cornersRadiusMatch = xml.match(/<corners\b[^>]*android:radius\s*=\s*"([^"]+)"/);
  if (cornersRadiusMatch) {
    result.corners = { radius: cornersRadiusMatch[1] };
  } else {
    // Check for individual corner radii
    const cornerAttrs = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
    const corners = {};
    for (const attr of cornerAttrs) {
      const m = xml.match(new RegExp(`android:${attr}\\s*=\\s*"([^"]+)"`));
      if (m) corners[attr] = m[1];
    }
    if (Object.keys(corners).length > 0) {
      result.corners = corners;
    }
  }

  // Gradient
  const gradientMatch = xml.match(/<gradient\b([^>]*)\/?>/s);
  if (gradientMatch) {
    const gAttrs = gradientMatch[1];
    const gradient = {};
    const gFields = ['startColor', 'endColor', 'centerColor', 'angle', 'type', 'gradientRadius'];
    for (const f of gFields) {
      const m = gAttrs.match(new RegExp(`android:${f}\\s*=\\s*"([^"]+)"`));
      if (m) gradient[f] = m[1];
    }
    if (Object.keys(gradient).length > 0) {
      result.gradient = gradient;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// REQ-ICN-005: Button states -- extract state-dependent backgrounds for btn_*
// ---------------------------------------------------------------------------

function parseButtonStates(name) {
  const xml = readDrawableXml(name);
  if (!xml) return null;

  const result = { name, states: [] };

  // Buttons can be selectors or shapes. Extract items if selector-like.
  const itemRegex = /<item\b([^>]*)\/?>/gs;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const state = {};

    const drawableMatch = attrs.match(/android:drawable\s*=\s*"([^"]+)"/);
    if (drawableMatch) {
      state.drawable = drawableMatch[1];
    }

    const colorMatch = attrs.match(/android:color\s*=\s*"([^"]+)"/);
    if (colorMatch) {
      state.color = colorMatch[1];
    }

    // Extract all state_ conditions
    const conditions = {};
    for (const stateAttr of STATE_ATTRS) {
      const stateMatch = attrs.match(new RegExp(`android:${stateAttr}\\s*=\\s*"([^"]+)"`));
      if (stateMatch) {
        conditions[stateAttr] = stateMatch[1] === 'true';
      }
    }
    if (Object.keys(conditions).length > 0) {
      state.conditions = conditions;
    }

    result.states.push(state);
  }

  // If no items found, it may be a shape-based button
  if (result.states.length === 0) {
    // Try extracting shape info
    const shapeData = parseShape(name);
    if (shapeData) {
      result.shapeType = shapeData.shapeType;
      if (shapeData.solidColor) result.solidColor = shapeData.solidColor;
      if (shapeData.stroke) result.stroke = shapeData.stroke;
      if (shapeData.corners) result.corners = shapeData.corners;
      if (shapeData.gradient) result.gradient = shapeData.gradient;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Process catalog entries
// ---------------------------------------------------------------------------

const selectors = [];
const shapes = [];
const buttonStates = [];

for (const entry of catalog) {
  // Selectors
  if (entry.type === 'selector') {
    const parsed = parseSelector(entry.name);
    if (parsed) selectors.push(parsed);
  }

  // Shapes
  if (entry.type === 'shape') {
    const parsed = parseShape(entry.name);
    if (parsed) shapes.push(parsed);
  }

  // Button states (btn_ prefix, all formats)
  if (entry.name.startsWith('btn_')) {
    if (entry.format === 'xml') {
      const parsed = parseButtonStates(entry.name);
      if (parsed) buttonStates.push(parsed);
    } else {
      // Non-XML btn_ resources (png, nine-patch) -- include with basic metadata
      buttonStates.push({
        name: entry.name,
        type: entry.type,
        format: entry.format,
        densities: entry.densities,
        states: [],
      });
    }
  }
}

// Sort all outputs by name
selectors.sort((a, b) => a.name.localeCompare(b.name));
shapes.sort((a, b) => a.name.localeCompare(b.name));
buttonStates.sort((a, b) => a.name.localeCompare(b.name));

// Write outputs
const selectorsPath = resolve(outDir, 'atak-selectors.json');
writeFileSync(selectorsPath, JSON.stringify(selectors, null, 2) + '\n');
console.log(`Wrote ${selectors.length} selectors to ${selectorsPath}`);

const shapesPath = resolve(outDir, 'atak-shapes.json');
writeFileSync(shapesPath, JSON.stringify(shapes, null, 2) + '\n');
console.log(`Wrote ${shapes.length} shapes to ${shapesPath}`);

const btnPath = resolve(outDir, 'atak-button-states.json');
writeFileSync(btnPath, JSON.stringify(buttonStates, null, 2) + '\n');
console.log(`Wrote ${buttonStates.length} button states to ${btnPath}`);
