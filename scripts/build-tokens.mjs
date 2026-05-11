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

// rtmx:req XW-033
// WinTAK WPF resource key: TakColorBlue500 (PascalCase with Tak prefix)
StyleDictionary.registerTransform({
  name: 'name/tak/wintak',
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
    return 'tak-' + token.path.join('-').toLowerCase();
  }
});

// rtmx:req REQ-XW-133
// Dart/Flutter token name: takColorBlue500 (camelCase with 'tak' prefix)
StyleDictionary.registerTransform({
  name: 'name/tak/dart',
  type: 'name',
  transform: (token) => {
    return ['tak', ...token.path]
      .map((p, i) => {
        const clean = p.replace(/-([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
        if (i === 0) return clean.toLowerCase();
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      })
      .join('');
  }
});

// rtmx:req REQ-XW-134
// Swift token name: camelCase with category prefix (e.g. blue500, spacing4)
StyleDictionary.registerTransform({
  name: 'name/tak/swift',
  type: 'name',
  transform: (token) => {
    // Drop the first path segment (category like "color") and camelCase the rest
    const parts = token.path.slice(1);
    return parts
      .map((p, i) => {
        const clean = p.replace(/-([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
        if (i === 0) return clean.charAt(0).toLowerCase() + clean.slice(1);
        return clean.charAt(0).toUpperCase() + clean.slice(1);
      })
      .join('');
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

// rtmx:req XW-030
// WinTAK WPF ResourceDictionary XAML
StyleDictionary.registerFormat({
  name: 'wintak/resource-dictionary',
  format: ({ dictionary }) => {
    const resources = dictionary.allTokens.map(t => {
      const v = val(t);
      // rtmx:req XW-031
      if (t.$type === 'color') {
        return `    <SolidColorBrush x:Key="${t.name}" Color="${v}"/>`;
      }
      // rtmx:req XW-032
      if (t.$type === 'dimension') {
        const num = typeof v === 'string' ? v.replace(/[a-z%]+$/i, '') : String(v);
        return `    <sys:Double x:Key="${t.name}">${num}</sys:Double>`;
      }
      return null;
    }).filter(Boolean).join('\n');

    return `<!-- TAK Design System - Generated. Do not edit manually. -->
<ResourceDictionary
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:sys="clr-namespace:System;assembly=mscorlib">
${resources}
</ResourceDictionary>
`;
  }
});

// rtmx:req REQ-XW-133
// Flutter/Dart tokens file
StyleDictionary.registerFormat({
  name: 'flutter/tak-tokens',
  format: ({ dictionary }) => {
    const colors = dictionary.allTokens
      .filter(t => {
        const v = val(t);
        return t.$type === 'color' && typeof v === 'string' && v.startsWith('#');
      })
      .map(t => {
        let hex = val(t).replace('#', '').toUpperCase();
        if (hex.length === 6) hex = 'FF' + hex;
        else if (hex.length === 8) hex = hex.slice(6, 8) + hex.slice(0, 6);
        return `  static const Color ${t.name} = Color(0x${hex});`;
      })
      .join('\n');

    const dimens = dictionary.allTokens
      .filter(t => t.$type === 'dimension')
      .map(t => {
        const v = val(t);
        const num = typeof v === 'string' ? parseFloat(v.replace(/[a-z%]+$/i, '')) : Number(v);
        return `  static const double ${t.name} = ${num.toFixed(1)};`;
      })
      .join('\n');

    let body = '';
    if (colors) {
      body += `\nclass TakColors {\n${colors}\n}\n`;
    }
    if (dimens) {
      body += `\nclass TakDimens {\n${dimens}\n}\n`;
    }

    return `/// TAK Design System - Generated design tokens.
/// Do not edit manually. Run \`npm run build:flutter\` to regenerate.
library tak_tokens;

import 'dart:ui';
${body}`;
  }
});

// rtmx:req REQ-XW-134
// Swift/SwiftUI tokens file
StyleDictionary.registerFormat({
  name: 'swift/tak-tokens',
  format: ({ dictionary }) => {
    const colors = dictionary.allTokens
      .filter(t => {
        const v = val(t);
        return t.$type === 'color' && typeof v === 'string' && v.startsWith('#');
      })
      .map(t => {
        let hex = val(t).replace('#', '');
        if (hex.length === 8) hex = hex.slice(0, 6); // strip alpha for RGB
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        return `    public static let ${t.name} = Color(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)})`;
      })
      .join('\n');

    const dimens = dictionary.allTokens
      .filter(t => t.$type === 'dimension')
      .map(t => {
        const v = val(t);
        const num = typeof v === 'string' ? parseFloat(v.replace(/[a-z%]+$/i, '')) : Number(v);
        return `    public static let ${t.name}: CGFloat = ${num.toFixed(1)}`;
      })
      .join('\n');

    let body = '';
    if (colors) {
      body += `\npublic enum TakColors {\n${colors}\n}\n`;
    }
    if (dimens) {
      body += `\npublic enum TakDimens {\n${dimens}\n}\n`;
    }

    return `/// TAK Design System - Generated design tokens.
/// Do not edit manually. Run \`npm run build:swift\` to regenerate.

import SwiftUI
${body}`;
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
  // rtmx:req XW-034
  wintak: {
    transforms: ['name/tak/wintak'],
    buildPath: 'platforms/wintak/generated/',
    files: [
      {
        destination: 'TakResourceDictionary.xaml',
        format: 'wintak/resource-dictionary',
        filter: (token) => token.$type === 'color' || token.$type === 'dimension'
      }
    ]
  },
  // rtmx:req REQ-XW-133
  flutter: {
    transforms: ['name/tak/dart'],
    buildPath: 'platforms/flutter/generated/',
    files: [
      {
        destination: 'tak_tokens.dart',
        format: 'flutter/tak-tokens'
      }
    ]
  },
  // rtmx:req REQ-XW-134
  swift: {
    transforms: ['name/tak/swift'],
    buildPath: 'platforms/swift/generated/',
    files: [
      {
        destination: 'TakTokens.swift',
        format: 'swift/tak-tokens'
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
