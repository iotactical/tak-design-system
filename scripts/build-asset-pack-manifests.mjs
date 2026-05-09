#!/usr/bin/env node
/**
 * TAK Design System - Asset Pack Manifest Builder
 *
 * Generates JSON manifests for ATAK asset packs:
 *   - REQ-APK-007: Landing Point Tactical (LPT) icons
 *   - REQ-APK-008: ATAK font bundle catalog
 *   - REQ-APK-009: ATAK map tile style definitions
 */

import { readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'data');

const ATAK_ROOT = resolve(
  process.env.ATAK_SOURCE_ROOT ||
  `${process.env.HOME}/Downloads/atak-master/ATAK/app/src/main`
);

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// REQ-APK-007: Landing Point Tactical Icons
// ---------------------------------------------------------------------------

function classifyLptIcon(name) {
  // name is the filename without extension and without the lpt_ prefix
  const lower = name.toLowerCase();

  // Helicopter-related
  if (
    lower.includes('heli') ||
    lower.includes('hlz') ||
    lower.includes('medevac') ||
    lower.includes('hport') ||
    lower.includes('farp') ||
    lower.includes('vip_helipad')
  ) {
    return 'helicopter';
  }

  // Aircraft-related
  if (
    lower.includes('airplane') ||
    lower.includes('airship') ||
    lower.includes('airfield') ||
    lower.includes('runway') ||
    lower.includes('parachut') ||
    lower.includes('drop_zone') ||
    lower.includes('divert') ||
    lower.includes('nfz') ||
    lower.includes('vfr') ||
    lower === 'dz' ||
    // Known aircraft model prefixes
    /^(a_10|b_1|b_52|c_130|e_3|f_4|f_15|kc_135|t_bird|cargo|hog|viper|tornado|tweet)$/.test(lower)
  ) {
    return 'aircraft';
  }

  // Color-coded markers (color prefix patterns)
  const colorPrefixes = [
    'blue', 'red', 'green', 'gren', 'grn', 'gray', 'gry', 'white',
    'cyan', 'purp', 'pur', 'yel', 'yelo', 'orange', 'brown'
  ];
  for (const color of colorPrefixes) {
    if (lower.startsWith(color + '_') || lower === color + 'star' || lower.startsWith(color.slice(0, 3) + 'star')) {
      return 'marker';
    }
  }
  // Star suffixes with color abbreviations
  if (/^(blu|cyn|grn|gry|pur|red|yel)star$/.test(lower)) {
    return 'marker';
  }

  // Navigation / waypoints
  if (
    lower.includes('turn') ||
    lower.includes('waypoint') ||
    lower.includes('initial_point') ||
    lower.includes('local_point') ||
    lower === 'ip2' ||
    lower === 'target' ||
    lower.includes('tgt') ||
    lower.includes('pushpin') ||
    lower.includes('gps')
  ) {
    return 'navigation';
  }

  // Ground / vehicle
  if (
    lower.includes('gnd') ||
    lower.includes('car') ||
    lower.includes('truck') ||
    lower.includes('boat') ||
    lower.includes('ship') ||
    lower.includes('subsurface') ||
    lower.includes('surfaceship') ||
    lower.includes('marswimmer') ||
    lower.includes('whale') ||
    lower.includes('anchor')
  ) {
    return 'ground-vehicle';
  }

  // German landing pad types (GER = Germany NATO)
  if (lower.startsWith('ger_')) {
    return 'helicopter';
  }

  // Infrastructure
  if (
    lower.includes('hospital') ||
    lower.includes('medical') ||
    lower.includes('house') ||
    lower.includes('cemeteri') ||
    lower.includes('port_civ') ||
    lower.includes('tlight') ||
    lower.includes('light_') ||
    lower.includes('tree') ||
    lower.includes('nuke') ||
    lower.includes('hazwaste') ||
    lower.includes('rf')
  ) {
    return 'infrastructure';
  }

  return 'other';
}

function buildLptManifest() {
  const lptDir = resolve(ATAK_ROOT, 'assets/lpticons');
  if (!existsSync(lptDir)) {
    console.warn(`  Warning: LPT icons directory not found at ${lptDir}`);
    return [];
  }

  const files = readdirSync(lptDir).filter(f => f.endsWith('.png'));
  const entries = files.map(file => {
    const name = basename(file, '.png');
    // Strip lpt_ prefix for classification
    const stripped = name.startsWith('lpt_') ? name.slice(4) : name;
    return {
      name,
      category: classifyLptIcon(stripped)
    };
  });

  return entries;
}

// ---------------------------------------------------------------------------
// REQ-APK-008: ATAK Font Bundle
// ---------------------------------------------------------------------------

function inferFamily(filename) {
  const lower = filename.toLowerCase();
  if (lower.startsWith('digital')) return 'Digital';
  if (lower.startsWith('roboto')) return 'Roboto';
  if (lower.startsWith('nunito')) return 'Nunito';
  // Fallback: use filename stem
  return basename(filename, extname(filename));
}

function buildFontManifest() {
  const assetFontsDir = resolve(ATAK_ROOT, 'assets/fonts');
  const resFontDir = resolve(ATAK_ROOT, 'res/font');

  const fonts = [];

  if (existsSync(assetFontsDir)) {
    const files = readdirSync(assetFontsDir).filter(f =>
      f.endsWith('.ttf') || f.endsWith('.otf')
    );
    for (const file of files) {
      fonts.push({
        name: basename(file, extname(file)),
        file,
        source: 'assets',
        family: inferFamily(file)
      });
    }
  } else {
    console.warn(`  Warning: Assets fonts directory not found at ${assetFontsDir}`);
  }

  if (existsSync(resFontDir)) {
    const files = readdirSync(resFontDir).filter(f =>
      f.endsWith('.ttf') || f.endsWith('.otf')
    );
    for (const file of files) {
      fonts.push({
        name: basename(file, extname(file)),
        file,
        source: 'res',
        family: inferFamily(file)
      });
    }
  } else {
    console.warn(`  Warning: Res fonts directory not found at ${resFontDir}`);
  }

  return fonts;
}

// ---------------------------------------------------------------------------
// REQ-APK-009: ATAK Map Tile Style Definitions
// ---------------------------------------------------------------------------

function buildMapStylesManifest() {
  const styleDir = resolve(ATAK_ROOT, 'assets/style');
  const styles = [];

  if (existsSync(styleDir)) {
    // Scan actual directory structure
    const providers = readdirSync(styleDir).filter(entry => {
      const fullPath = resolve(styleDir, entry);
      return statSync(fullPath).isDirectory();
    });

    for (const provider of providers) {
      const providerDir = resolve(styleDir, provider);
      const variants = readdirSync(providerDir).filter(entry => {
        const fullPath = resolve(providerDir, entry);
        return statSync(fullPath).isDirectory();
      });

      for (const variant of variants) {
        const variantDir = resolve(providerDir, variant);
        const files = readdirSync(variantDir).filter(f =>
          statSync(resolve(variantDir, f)).isFile()
        );
        styles.push({
          provider,
          variant,
          files
        });
      }

      // Also check for files directly in the provider dir (non-variant files)
      const providerFiles = readdirSync(providerDir).filter(entry => {
        const fullPath = resolve(providerDir, entry);
        return statSync(fullPath).isFile();
      });
      if (providerFiles.length > 0 && !styles.some(s => s.provider === provider)) {
        styles.push({
          provider,
          variant: 'default',
          files: providerFiles
        });
      }
    }
  } else {
    // Style directory not yet present in source - generate reference manifest
    // based on known ATAK map tile style structure
    console.warn(`  Warning: Style directory not found at ${styleDir}`);
    console.warn('  Generating reference manifest from known ATAK structure.');

    const providers = ['omt', 'rbt'];
    const variants = ['bright', 'dark', 'overlay'];

    for (const provider of providers) {
      for (const variant of variants) {
        styles.push({
          provider,
          variant,
          files: [`${variant}.json`]
        });
      }
    }
  }

  return styles;
}

// ---------------------------------------------------------------------------
// Build all manifests
// ---------------------------------------------------------------------------

console.log('Building asset pack manifests...');

console.log('  REQ-APK-007: LPT icons...');
const lptIcons = buildLptManifest();
const lptPath = resolve(DATA_DIR, 'atak-lpt-icons.json');
writeFileSync(lptPath, JSON.stringify(lptIcons, null, 2) + '\n');
console.log(`    ${lptIcons.length} icons cataloged -> ${lptPath}`);

console.log('  REQ-APK-008: Fonts...');
const fonts = buildFontManifest();
const fontsPath = resolve(DATA_DIR, 'atak-fonts.json');
writeFileSync(fontsPath, JSON.stringify(fonts, null, 2) + '\n');
console.log(`    ${fonts.length} fonts cataloged -> ${fontsPath}`);

console.log('  REQ-APK-009: Map styles...');
const mapStyles = buildMapStylesManifest();
const mapStylesPath = resolve(DATA_DIR, 'atak-map-styles.json');
writeFileSync(mapStylesPath, JSON.stringify(mapStyles, null, 2) + '\n');
console.log(`    ${mapStyles.length} style entries -> ${mapStylesPath}`);

console.log('Asset pack manifests complete.');
