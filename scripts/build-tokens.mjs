#!/usr/bin/env node
/**
 * TAK Design System - Token Build Pipeline
 *
 * Transforms W3C Design Tokens into platform-specific outputs:
 *   - Android XML (colors.xml, dimens.xml, styles.xml, values-night/)
 *   - Jetpack Compose (TakColors.kt, TakDimens.kt, TakTypography.kt)
 *   - CSS custom properties
 *   - VS Code theme JSON
 */

import StyleDictionary from 'style-dictionary';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const platformArg = process.argv.find(a => a.startsWith('--platform='))?.split('=')[1];

// Helper: get resolved value from a token (supports both DTCG and legacy)
const val = (t) => t.$value ?? t.value;

// ---------------------------------------------------------------------------
// Custom transforms
// ---------------------------------------------------------------------------

// Android XML color name: tak_color_blue_500
StyleDictionary.registerTransform({
  name: 'name/tak/android',
  type: 'name',
  transform: (token) => {
    return ['tak', ...token.path].join('_').toLowerCase().replace(/-/g, '_');
  }
});

// Compose property name: TakColorBlue500
StyleDictionary.registerTransform({
  name: 'name/tak/compose',
  type: 'name',
  transform: (token) => {
    return ['tak', ...token.path]
      .map(p => p.replace(/-([a-zA-Z0-9])/g, (_, c) => c.toUpperCase()))
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join('');
  }
});

// CSS variable name: --tak-color-blue-500
StyleDictionary.registerTransform({
  name: 'name/tak/css',
  type: 'name',
  transform: (token) => {
    return '--tak-' + token.path.join('-').toLowerCase();
  }
});

// ---------------------------------------------------------------------------
// Custom formats
// ---------------------------------------------------------------------------

// Android colors.xml
StyleDictionary.registerFormat({
  name: 'android/tak-colors',
  format: ({ dictionary }) => {
    const colors = dictionary.allTokens
      .filter(t => t.$type === 'color')
      .map(t => `    <color name="${t.name}">${val(t)}</color>`)
      .join('\n');
    return `<?xml version="1.0" encoding="utf-8"?>
<!-- TAK Design System - Generated. Do not edit manually. -->
<resources>
${colors}
</resources>
`;
  }
});

// Android dimens.xml
StyleDictionary.registerFormat({
  name: 'android/tak-dimens',
  format: ({ dictionary }) => {
    const dimens = dictionary.allTokens
      .filter(t => t.$type === 'dimension')
      .map(t => {
        const v = val(t);
        const dimVal = typeof v === 'string' ? v.replace('px', 'dp') : `${v}dp`;
        return `    <dimen name="${t.name}">${dimVal}</dimen>`;
      })
      .join('\n');
    return `<?xml version="1.0" encoding="utf-8"?>
<!-- TAK Design System - Generated. Do not edit manually. -->
<resources>
${dimens}
</resources>
`;
  }
});

// Jetpack Compose Kotlin object
StyleDictionary.registerFormat({
  name: 'compose/tak-object',
  format: ({ dictionary, file }) => {
    const objectName = file.options?.objectName || 'TakTokens';
    const colors = dictionary.allTokens
      .filter(t => {
        const v = val(t);
        return t.$type === 'color' && typeof v === 'string' && v.startsWith('#');
      })
      .map(t => {
        let hex = val(t).replace('#', '').toUpperCase();
        if (hex.length === 6) {
          hex = 'FF' + hex;
        } else if (hex.length === 8) {
          // CSS uses RRGGBBAA, Compose uses AARRGGBB - swap alpha to front
          hex = hex.slice(6, 8) + hex.slice(0, 6);
        }
        return `    val ${t.name} = Color(0x${hex})`;
      })
      .join('\n');
    return `package co.iotactical.tak.designsystem

import androidx.compose.ui.graphics.Color

/**
 * TAK Design System - Generated color constants.
 * Do not edit manually. Run \`npm run build:compose\` to regenerate.
 */
object ${objectName} {
${colors}
}
`;
  }
});

// VS Code theme JSON
StyleDictionary.registerFormat({
  name: 'vscode/tak-theme',
  format: ({ dictionary }) => {
    const colors = {};
    dictionary.allTokens
      .filter(t => t.$type === 'color')
      .forEach(t => {
        const v = val(t);
        const path = t.path.join('.');
        if (path.includes('surface') && path.includes('dark')) {
          if (path.includes('surface-0') || path.includes('background'))
            colors['editor.background'] = v;
          if (path.includes('surface-1') || path.includes('primary'))
            colors['sideBar.background'] = v;
          if (path.includes('surface-2') || path.includes('elevated'))
            colors['titleBar.activeBackground'] = v;
          if (path.includes('surface-3') || path.includes('card'))
            colors['panel.background'] = v;
        }
        if (path.includes('accent.primary'))
          colors['focusBorder'] = v;
        if (path.includes('text.primary.dark'))
          colors['editor.foreground'] = v;
        if (path.includes('text.secondary.dark'))
          colors['editorLineNumber.foreground'] = v;
        if (path.includes('status.error'))
          colors['errorForeground'] = v;
      });

    const theme = {
      name: 'TAK Dark',
      type: 'dark',
      colors: {
        ...colors,
        'activityBar.background': '#1A1A1A',
        'activityBar.foreground': '#FFFFFFDE',
        'statusBar.background': '#1565C0',
        'statusBar.foreground': '#FFFFFF',
        'terminal.background': '#1A1A1A',
        'terminal.foreground': '#FFFFFFDE',
        'terminal.ansiBlue': '#2196F3',
        'terminal.ansiRed': '#F44336',
        'terminal.ansiGreen': '#4CAF50',
        'terminal.ansiYellow': '#FFEB3B'
      },
      tokenColors: [
        {
          scope: ['comment'],
          settings: { foreground: '#757575', fontStyle: 'italic' }
        },
        {
          scope: ['keyword', 'storage.type'],
          settings: { foreground: '#42A5F5' }
        },
        {
          scope: ['string'],
          settings: { foreground: '#81C784' }
        },
        {
          scope: ['constant.numeric'],
          settings: { foreground: '#FFB74D' }
        },
        {
          scope: ['entity.name.function'],
          settings: { foreground: '#FFF176' }
        },
        {
          scope: ['entity.name.type', 'entity.name.class'],
          settings: { foreground: '#64B5F6' }
        },
        {
          scope: ['variable'],
          settings: { foreground: '#FFFFFFDE' }
        }
      ]
    };

    return JSON.stringify(theme, null, 2) + '\n';
  }
});

// ---------------------------------------------------------------------------
// Platform configurations
// ---------------------------------------------------------------------------

const platforms = {
  android: {
    transformGroup: 'android',
    transforms: ['name/tak/android'],
    buildPath: 'platforms/atak/res/values/',
    files: [
      {
        destination: 'tak_colors.xml',
        format: 'android/tak-colors',
        filter: (token) => token.$type === 'color'
      },
      {
        destination: 'tak_dimens.xml',
        format: 'android/tak-dimens',
        filter: (token) => token.$type === 'dimension'
      }
    ]
  },
  compose: {
    transforms: ['name/tak/compose'],
    buildPath: 'platforms/atak/compose/generated/',
    files: [
      {
        destination: 'TakColors.kt',
        format: 'compose/tak-object',
        filter: (token) => token.$type === 'color',
        options: { objectName: 'TakColors' }
      }
    ]
  },
  css: {
    transforms: ['name/tak/css'],
    buildPath: 'platforms/web/generated/',
    files: [
      {
        destination: 'tak-tokens.css',
        format: 'css/variables',
        options: { selector: ':root' }
      }
    ]
  },
  vscode: {
    transforms: ['attribute/cti'],
    buildPath: 'platforms/vscode/generated/',
    files: [
      {
        destination: 'tak-dark-theme.json',
        format: 'vscode/tak-theme'
      }
    ]
  }
};

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const selectedPlatforms = platformArg ? [platformArg] : Object.keys(platforms);

for (const platformName of selectedPlatforms) {
  if (!platforms[platformName]) {
    console.error(`Unknown platform: ${platformName}`);
    process.exit(1);
  }

  console.log(`Building ${platformName}...`);

  const sd = new StyleDictionary({
    source: ['tokens/w3c/**/*.json'],
    usesDtcg: true,
    platforms: {
      [platformName]: platforms[platformName]
    }
  });

  await sd.buildAllPlatforms();
  console.log(`  Done: ${platformName}`);
}

console.log('Build complete.');
