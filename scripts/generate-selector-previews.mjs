#!/usr/bin/env node
// rtmx:req REQ-ICN-013
/**
 * REQ-ICN-013: Generate pre-rendered selector default-state PNGs
 *
 * For each selector in data/atak-selectors.json, renders a 48x48 PNG preview
 * of its default state (the last state, or first state without conditions).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from 'canvas';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SIZE = 48;

const selectors = JSON.parse(readFileSync(resolve(ROOT, 'data', 'atak-selectors.json'), 'utf8'));
const shapes = JSON.parse(readFileSync(resolve(ROOT, 'data', 'atak-shapes.json'), 'utf8'));
const layerLists = JSON.parse(readFileSync(resolve(ROOT, 'data', 'atak-layer-lists.json'), 'utf8'));
const iconsDir = resolve(ROOT, 'site', 'public', 'icons');
const outDir = resolve(iconsDir, 'selectors');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// ATAK color references (subset used in selectors)
const COLOR_MAP = {
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

function resolveColor(ref) {
  if (!ref) return null;
  if (ref.startsWith('#')) return ref;
  return COLOR_MAP[ref] || '#888888';
}

// Render an inline shape definition to canvas
function renderInlineShape(ctx, shape) {
  const color = resolveColor(shape.solidColor);
  const strokeColor = shape.stroke ? resolveColor(shape.stroke.color) : null;
  const strokeWidth = shape.stroke ? parseInt(shape.stroke.width) || 1 : 0;
  const radius = shape.corners?.radius ? parseInt(shape.corners.radius) || 0 : 0;

  const x = strokeWidth;
  const y = strokeWidth;
  const w = SIZE - strokeWidth * 2;
  const h = SIZE - strokeWidth * 2;

  ctx.beginPath();
  if (shape.shapeType === 'oval') {
    ctx.ellipse(SIZE / 2, SIZE / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (radius > 0) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }

  if (shape.gradient) {
    const g = shape.gradient;
    let grad;
    if (g.type === 'radial') {
      grad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
    } else {
      const angle = parseInt(g.angle) || 0;
      const rad = (angle * Math.PI) / 180;
      const cx = SIZE / 2, cy = SIZE / 2;
      const len = SIZE / 2;
      grad = ctx.createLinearGradient(
        cx - len * Math.cos(rad), cy + len * Math.sin(rad),
        cx + len * Math.cos(rad), cy - len * Math.sin(rad),
      );
    }
    if (g.startColor) grad.addColorStop(0, resolveColor(g.startColor));
    if (g.centerColor) grad.addColorStop(0.5, resolveColor(g.centerColor));
    if (g.endColor) grad.addColorStop(1, resolveColor(g.endColor));
    ctx.fillStyle = grad;
  } else if (color && color !== 'transparent') {
    ctx.fillStyle = color;
  }

  if (color && color !== 'transparent') ctx.fill();

  if (strokeColor && strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
}

// Render a solid color preview
function renderColor(ctx, color) {
  const resolved = resolveColor(color);
  if (!resolved || resolved === 'transparent') return;
  ctx.fillStyle = resolved;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

// Get the default state for a selector
function getDefaultState(sel) {
  return sel.states.find((st) => !st.conditions) || sel.states[sel.states.length - 1];
}

async function generatePreview(sel) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const def = getDefaultState(sel);
  let method = 'unknown';

  if (!def) {
    method = 'empty';
  } else if (def.inlineDrawable) {
    // Inline shape from ICN-012
    renderInlineShape(ctx, def.inlineDrawable);
    method = 'inline';
  } else if (def.inlineColor) {
    renderColor(ctx, def.inlineColor);
    method = 'inline';
  } else if (def.color) {
    renderColor(ctx, def.color);
    method = 'inline';
  } else if (def.drawable?.startsWith('@color/') || def.drawable?.startsWith('@android:color/')) {
    renderColor(ctx, def.drawable);
    method = 'inline';
  } else if (def.drawable?.startsWith('@drawable/')) {
    const refName = def.drawable.replace('@drawable/', '');

    // Try existing PNG
    const pngPath = resolve(iconsDir, `${refName}.png`);
    if (existsSync(pngPath)) {
      try {
        const img = await loadImage(pngPath);
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        method = 'drawable_ref';
      } catch {
        method = 'drawable_ref_error';
      }
    } else {
      // Try rendering from shapes data
      const shape = shapes.find((s) => s.name === refName);
      if (shape) {
        renderInlineShape(ctx, shape);
        method = 'drawable_ref_shape';
      } else {
        // Try layer-list
        const ll = layerLists.find((l) => l.name === refName);
        if (ll) {
          // Render each layer bottom-up
          for (const layer of ll.layers) {
            if (layer.inlineShape) {
              renderInlineShape(ctx, layer.inlineShape);
            } else if (layer.drawable?.startsWith('@drawable/')) {
              const llRefName = layer.drawable.replace('@drawable/', '');
              const llPng = resolve(iconsDir, `${llRefName}.png`);
              if (existsSync(llPng)) {
                try {
                  const img = await loadImage(llPng);
                  ctx.drawImage(img, 0, 0, SIZE, SIZE);
                } catch { /* skip */ }
              }
            }
          }
          method = 'drawable_ref_layerlist';
        } else {
          // Vector drawable without PNG -- render a gray placeholder with first letter
          ctx.fillStyle = '#2a2a3e';
          ctx.fillRect(0, 0, SIZE, SIZE);
          ctx.fillStyle = '#888';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(refName[0].toUpperCase(), SIZE / 2, SIZE / 2);
          method = 'drawable_ref_placeholder';
        }
      }
    }
  } else if (def.drawable === 'inline:shape' && def.inlineDrawable) {
    renderInlineShape(ctx, def.inlineDrawable);
    method = 'inline';
  } else if (def.drawable === 'inline:layer-list') {
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, 0, SIZE, SIZE);
    method = 'inline_layerlist';
  } else {
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, 0, SIZE, SIZE);
    method = 'fallback';
  }

  const buf = canvas.toBuffer('image/png');
  const outPath = resolve(outDir, `${sel.name}.png`);
  writeFileSync(outPath, buf);

  return { name: sel.name, path: `icons/selectors/${sel.name}.png`, method };
}

// Generate all previews
const manifest = [];
let count = 0;
for (const sel of selectors) {
  const entry = await generatePreview(sel);
  manifest.push(entry);
  count++;
}

// Write manifest
const manifestPath = resolve(outDir, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// Summary
const methods = {};
for (const e of manifest) {
  methods[e.method] = (methods[e.method] || 0) + 1;
}
console.log(`Generated ${count} selector preview PNGs to ${outDir}`);
console.log('Methods:', methods);
