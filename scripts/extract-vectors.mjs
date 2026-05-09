#!/usr/bin/env node
/**
 * TAK Design System - Extract ATAK Vector Drawables to SVG
 *
 * REQ-ICN-002: Converts Android VectorDrawable XML files from the ATAK source
 * tree into platform-agnostic SVG files.
 *
 * Handles:
 *   - android:viewportWidth/Height -> SVG viewBox
 *   - <path android:pathData="..." android:fillColor="..."/> -> <path d="..." fill="..."/>
 *   - <group> transforms (translate, rotate, scale)
 *   - android:fillType (evenOdd / nonZero) -> fill-rule
 *   - android:strokeColor / android:strokeWidth
 *   - android:fillAlpha / android:strokeAlpha
 *
 * Skips:
 *   - Animated vector drawables (<animated-vector>)
 *   - Files without <vector> root elements
 *   - Complex clip paths (logged but clip-path groups are simplified)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Source and output paths
const ATAK_DRAWABLE = resolve(
  process.env.HOME,
  'Downloads/atak-master/ATAK/app/src/main/res/drawable'
);
const SVG_OUTPUT = resolve(ROOT, 'icons/svg/atak');
const MANIFEST_PATH = resolve(ROOT, 'data/atak-vector-manifest.json');

// Ensure output directories exist
mkdirSync(SVG_OUTPUT, { recursive: true });
mkdirSync(dirname(MANIFEST_PATH), { recursive: true });

/**
 * Extract an Android XML attribute value from a tag string.
 */
function getAttr(xml, attr) {
  // Match android:attr="value" or plain attr="value"
  const pattern = new RegExp(`(?:android:)?${attr}\\s*=\\s*"([^"]*)"`, 'i');
  const m = xml.match(pattern);
  return m ? m[1] : null;
}

/**
 * Parse a <vector> element and extract viewportWidth, viewportHeight, width, height.
 */
function parseVectorAttrs(vectorTag) {
  return {
    viewportWidth: parseFloat(getAttr(vectorTag, 'viewportWidth')) || 24,
    viewportHeight: parseFloat(getAttr(vectorTag, 'viewportHeight')) || 24,
    width: getAttr(vectorTag, 'width') || '24dp',
    height: getAttr(vectorTag, 'height') || '24dp',
  };
}

/**
 * Convert an Android color to an SVG-compatible color string.
 * Android uses #AARRGGBB or #RRGGBB or named refs.
 */
function convertColor(androidColor) {
  if (!androidColor) return null;
  if (androidColor.startsWith('@')) return null; // resource reference, skip
  if (androidColor.startsWith('?')) return null; // theme attr, skip

  let hex = androidColor;
  if (hex.startsWith('#')) {
    if (hex.length === 9) {
      // #AARRGGBB -> #RRGGBBAA (but for SVG we use fill + opacity separately)
      const alpha = hex.substring(1, 3);
      const rgb = hex.substring(3);
      if (alpha === '00') return 'none';
      if (alpha === 'FF' || alpha === 'ff') return `#${rgb}`;
      return `#${rgb}`; // we handle opacity via fill-opacity
    }
    return hex;
  }
  return hex;
}

/**
 * Get fill-opacity from a color with alpha channel.
 */
function getColorAlpha(androidColor) {
  if (!androidColor || !androidColor.startsWith('#') || androidColor.length !== 9) return null;
  const alpha = parseInt(androidColor.substring(1, 3), 16);
  if (alpha === 255) return null;
  if (alpha === 0) return '0';
  return (alpha / 255).toFixed(3);
}

/**
 * Convert fillType: evenOdd -> evenodd, nonZero -> nonzero
 */
function convertFillRule(fillType) {
  if (!fillType) return null;
  if (fillType === 'evenOdd') return 'evenodd';
  if (fillType === 'nonZero') return 'nonzero';
  return null;
}

/**
 * Parse group transform attributes and return an SVG transform string.
 */
function parseGroupTransform(groupTag) {
  const transforms = [];

  const translateX = parseFloat(getAttr(groupTag, 'translateX')) || 0;
  const translateY = parseFloat(getAttr(groupTag, 'translateY')) || 0;
  if (translateX !== 0 || translateY !== 0) {
    transforms.push(`translate(${translateX}, ${translateY})`);
  }

  const rotation = parseFloat(getAttr(groupTag, 'rotation')) || 0;
  if (rotation !== 0) {
    const pivotX = parseFloat(getAttr(groupTag, 'pivotX')) || 0;
    const pivotY = parseFloat(getAttr(groupTag, 'pivotY')) || 0;
    if (pivotX !== 0 || pivotY !== 0) {
      transforms.push(`rotate(${rotation}, ${pivotX}, ${pivotY})`);
    } else {
      transforms.push(`rotate(${rotation})`);
    }
  }

  const scaleX = parseFloat(getAttr(groupTag, 'scaleX'));
  const scaleY = parseFloat(getAttr(groupTag, 'scaleY'));
  if (!isNaN(scaleX) || !isNaN(scaleY)) {
    const sx = isNaN(scaleX) ? 1 : scaleX;
    const sy = isNaN(scaleY) ? 1 : scaleY;
    if (sx !== 1 || sy !== 1) {
      transforms.push(`scale(${sx}, ${sy})`);
    }
  }

  return transforms.length > 0 ? transforms.join(' ') : null;
}

/**
 * Convert an Android path element to SVG path attributes string.
 */
function convertPathToSvg(pathTag) {
  const pathData = getAttr(pathTag, 'pathData');
  if (!pathData) return null;

  const attrs = [];
  attrs.push(`d="${pathData}"`);

  const fillColor = getAttr(pathTag, 'fillColor');
  const fill = convertColor(fillColor);
  if (fill) {
    attrs.push(`fill="${fill}"`);
  } else if (!fillColor) {
    attrs.push('fill="none"');
  }

  const fillAlphaAttr = getAttr(pathTag, 'fillAlpha');
  const colorAlpha = getColorAlpha(fillColor);
  if (fillAlphaAttr && parseFloat(fillAlphaAttr) !== 1) {
    attrs.push(`fill-opacity="${fillAlphaAttr}"`);
  } else if (colorAlpha) {
    attrs.push(`fill-opacity="${colorAlpha}"`);
  }

  const fillType = getAttr(pathTag, 'fillType');
  const fillRule = convertFillRule(fillType);
  if (fillRule) {
    attrs.push(`fill-rule="${fillRule}"`);
  }

  const strokeColor = getAttr(pathTag, 'strokeColor');
  const stroke = convertColor(strokeColor);
  if (stroke && stroke !== 'none') {
    attrs.push(`stroke="${stroke}"`);

    const strokeWidth = getAttr(pathTag, 'strokeWidth');
    if (strokeWidth) {
      attrs.push(`stroke-width="${strokeWidth}"`);
    }
  }

  const strokeAlpha = getAttr(pathTag, 'strokeAlpha');
  if (strokeAlpha && parseFloat(strokeAlpha) !== 1) {
    attrs.push(`stroke-opacity="${strokeAlpha}"`);
  }

  return `<path ${attrs.join(' ')}/>`;
}

/**
 * Simple recursive parser that handles <path> and <group> elements.
 * Returns an array of SVG element strings.
 */
function parseElements(xml) {
  const elements = [];
  // Remove comments
  const cleaned = xml.replace(/<!--[\s\S]*?-->/g, '');

  // Find all top-level <path.../> and <group>...</group> elements
  let pos = 0;
  while (pos < cleaned.length) {
    // Find next <path or <group or <clip-path
    const pathIdx = cleaned.indexOf('<path', pos);
    const groupIdx = cleaned.indexOf('<group', pos);

    // Determine which comes first
    let nextIdx = -1;
    let nextType = null;

    if (pathIdx >= 0 && (groupIdx < 0 || pathIdx < groupIdx)) {
      nextIdx = pathIdx;
      nextType = 'path';
    } else if (groupIdx >= 0) {
      nextIdx = groupIdx;
      nextType = 'group';
    }

    if (nextIdx < 0) break;

    if (nextType === 'path') {
      // Find end of path tag (self-closing)
      const endSelf = cleaned.indexOf('/>', nextIdx);
      const endOpen = cleaned.indexOf('>', nextIdx);
      if (endSelf >= 0 && endSelf <= endOpen + 1) {
        const pathTag = cleaned.substring(nextIdx, endSelf + 2);
        // Skip clip-path elements
        if (!pathTag.includes('<clip-path')) {
          const svgPath = convertPathToSvg(pathTag);
          if (svgPath) elements.push(svgPath);
        }
        pos = endSelf + 2;
      } else {
        pos = nextIdx + 5;
      }
    } else if (nextType === 'group') {
      // Find matching </group>
      const groupEnd = findClosingTag(cleaned, nextIdx, 'group');
      if (groupEnd < 0) {
        pos = nextIdx + 6;
        continue;
      }

      const groupContent = cleaned.substring(nextIdx, groupEnd);
      const groupTagEnd = cleaned.indexOf('>', nextIdx);
      const groupTag = cleaned.substring(nextIdx, groupTagEnd + 1);

      // Check for clip-path -- we skip clip-path content but still process
      // regular paths inside the group
      const hasClipPath = groupContent.includes('<clip-path');

      const transform = parseGroupTransform(groupTag);
      const innerContent = cleaned.substring(groupTagEnd + 1, groupEnd - '</group>'.length);
      const innerElements = parseElements(innerContent);

      if (innerElements.length > 0) {
        if (transform || hasClipPath) {
          const gAttrs = [];
          if (transform) gAttrs.push(`transform="${transform}"`);
          // Skip clip-path in SVG output (simplified handling)
          const gOpen = gAttrs.length > 0 ? `<g ${gAttrs.join(' ')}>` : '<g>';
          elements.push(gOpen);
          elements.push(...innerElements);
          elements.push('</g>');
        } else {
          elements.push(...innerElements);
        }
      }

      pos = groupEnd;
    }
  }

  return elements;
}

/**
 * Find the closing tag position for a given tag name starting at pos.
 */
function findClosingTag(xml, startPos, tagName) {
  const closeTag = `</${tagName}>`;
  const openTag = `<${tagName}`;
  let depth = 0;
  let pos = startPos;

  while (pos < xml.length) {
    const nextOpen = xml.indexOf(openTag, pos + 1);
    const nextClose = xml.indexOf(closeTag, pos + 1);

    if (nextClose < 0) return -1;

    if (nextOpen >= 0 && nextOpen < nextClose) {
      // Check if it's self-closing
      const selfClose = xml.indexOf('/>', nextOpen);
      const tagEnd = xml.indexOf('>', nextOpen);
      if (selfClose >= 0 && selfClose <= tagEnd) {
        // Self-closing, skip it
        pos = selfClose + 2;
      } else {
        depth++;
        pos = nextOpen + 1;
      }
    } else {
      if (depth === 0) {
        return nextClose + closeTag.length;
      }
      depth--;
      pos = nextClose + 1;
    }
  }

  return -1;
}

/**
 * Convert a single Android VectorDrawable XML file to SVG.
 */
function convertToSvg(xmlContent, filename) {
  // Check for animated-vector
  if (xmlContent.includes('<animated-vector') || xmlContent.includes('<animated')) {
    return { svg: null, reason: 'animated vector' };
  }

  // Find <vector> tag
  const vectorMatch = xmlContent.match(/<vector\s[^>]*>/s);
  if (!vectorMatch) {
    return { svg: null, reason: 'no <vector> tag found' };
  }

  const vectorTag = vectorMatch[0];
  const attrs = parseVectorAttrs(vectorTag);

  // Find content between <vector> and </vector>
  const vectorStart = xmlContent.indexOf(vectorMatch[0]) + vectorMatch[0].length;
  const vectorEnd = xmlContent.indexOf('</vector>');
  if (vectorEnd < 0) {
    return { svg: null, reason: 'no closing </vector> tag' };
  }

  const innerContent = xmlContent.substring(vectorStart, vectorEnd);
  const svgElements = parseElements(innerContent);

  if (svgElements.length === 0) {
    return { svg: null, reason: 'no path elements found' };
  }

  const viewBox = `0 0 ${attrs.viewportWidth} ${attrs.viewportHeight}`;
  const svgLines = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${attrs.viewportWidth}" height="${attrs.viewportHeight}">`,
    ...svgElements.map(el => `  ${el}`),
    '</svg>',
  ];

  return {
    svg: svgLines.join('\n') + '\n',
    viewBox,
    viewportWidth: attrs.viewportWidth,
    viewportHeight: attrs.viewportHeight,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (!existsSync(ATAK_DRAWABLE)) {
  console.error(`ATAK drawable directory not found: ${ATAK_DRAWABLE}`);
  process.exit(1);
}

const xmlFiles = readdirSync(ATAK_DRAWABLE)
  .filter(f => f.endsWith('.xml'))
  .sort();

console.log(`Scanning ${xmlFiles.length} XML files in ${ATAK_DRAWABLE}...`);

const manifest = [];
const skipped = [];
let converted = 0;

for (const filename of xmlFiles) {
  const filepath = resolve(ATAK_DRAWABLE, filename);
  const xml = readFileSync(filepath, 'utf8');

  // Quick check: does it contain a <vector tag?
  if (!xml.includes('<vector')) {
    continue; // Not a vector drawable, silently skip
  }

  const name = basename(filename, '.xml');
  const result = convertToSvg(xml, filename);

  if (!result.svg) {
    skipped.push({ name, reason: result.reason });
    console.log(`  SKIP: ${filename} (${result.reason})`);
    continue;
  }

  const outputPath = resolve(SVG_OUTPUT, `${name}.svg`);
  writeFileSync(outputPath, result.svg);

  manifest.push({
    name,
    source: `drawable/${filename}`,
    output: `icons/svg/atak/${name}.svg`,
    viewBox: result.viewBox,
    viewportWidth: result.viewportWidth,
    viewportHeight: result.viewportHeight,
  });

  converted++;
}

// Sort manifest by name
manifest.sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

console.log(`\nConversion complete:`);
console.log(`  Converted: ${converted} vector drawables to SVG`);
console.log(`  Skipped:   ${skipped.length} files`);
console.log(`  Output:    ${SVG_OUTPUT}`);
console.log(`  Manifest:  ${MANIFEST_PATH}`);

if (skipped.length > 0) {
  console.log(`\nSkipped files:`);
  for (const s of skipped) {
    console.log(`  - ${s.name}: ${s.reason}`);
  }
}
