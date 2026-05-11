# TAK Design System

[![CI](https://github.com/iotactical/tak-design-system/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/iotactical/tak-design-system/actions/workflows/build-and-release.yml)
[![Tests](https://img.shields.io/endpoint?url=https://iotactical.github.io/tak-design-system/badges/tests.json)](https://github.com/iotactical/tak-design-system/actions)
[![Requirements](https://img.shields.io/endpoint?url=https://iotactical.github.io/tak-design-system/badges/rtm.json)](https://github.com/iotactical/tak-design-system)
[![License](https://img.shields.io/github/license/iotactical/tak-design-system)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=nodedotjs)](package.json)
[![W3C Tokens](https://img.shields.io/badge/tokens-W3C%20Design%20Tokens-blue?logo=w3c)](https://tr.designtokens.org/format/)
[![MIL-STD-2525](https://img.shields.io/badge/symbology-MIL--STD--2525%20B%2FC%2FD%2FE-informational)](https://github.com/missioncommand/mil-sym-ts)

Design tokens, components, and military symbology for the TAK (Tactical Assault Kit / Team Awareness Kit) ecosystem. Supports ATAK 5.5.1 through 5.7.0.

Built for [Defense Builders SDK](https://github.com/iotactical/defense-builders-sdk) codespaces and standalone TAK plugin development.

## Site

Browse the design system at [iotactical.github.io/tak-design-system](https://iotactical.github.io/tak-design-system/).

- Token browser with color palettes, spacing, and typography
- 28 React component gallery with live previews
- MIL-STD-2525 Explorer: Browse, Decode, Build, and Compare symbology across B/C/D/E versions
- ATAK icon palettes: Skittles, Self Marker, Markers, Spot Map, Vehicle Models, and 10+ icon packs
- Intent catalog with Java, Kotlin, TypeScript, and C# code snippets
- Interface reference for external and internal TAK protocols

## Platforms

| Platform | Output | Path |
|----------|--------|------|
| ATAK (Android) | XML resources, Compose constants | `platforms/atak/` |
| WinTAK (Windows) | XAML resources | `platforms/wintak/` |
| WebTAK | CSS custom properties | `platforms/web/` |
| Flutter | Dart theme data | `platforms/flutter/` |
| Swift (iOS) | Swift Color/Font extensions | `platforms/swift/` |
| VS Code | Editor theme | `platforms/vscode/` |

## Token Architecture

```
tokens/w3c/
  core.json         Primitive values (colors, spacing, typography)
  semantic.json      Intent-based aliases (affiliation, status, surfaces)
  component.json     Component-specific tokens (buttons, toolbar, markers)
  responsive.json    Breakpoints, touch targets, responsive spacing
```

Tokens follow the [W3C Design Tokens](https://tr.designtokens.org/format/) specification and are transformed by [Style Dictionary v4](https://amzn.github.io/style-dictionary/) into platform-specific outputs.

## Military Symbology

Full MIL-STD-2525 cross-version support:

- **2525B/C**: 15-character SIDC with 1,915 entities
- **2525D/E**: 20-character SIDC with runtime rendering via [mil-sym-ts](https://github.com/missioncommand/mil-sym-ts)
- **Crosswalk**: Verified B-to-D mapping with 1,477 exact and 438 modifier-level entries
- **Pre-rendered SVGs**: 6,568 symbols (1,915 entities x 4 affiliations) for instant loading
- **Runtime rendering**: Web Worker with OffscreenCanvas for echelon, HQ/TF/FD, and status amplifiers

## Tactical Semantics

The design system encodes MIL-STD-2525 / APP-6 affiliation colors:

- **Friendly** (blue) -- `affiliation.friendly`
- **Hostile** (red) -- `affiliation.hostile`
- **Neutral** (green) -- `affiliation.neutral`
- **Unknown** (yellow) -- `affiliation.unknown`

Map overlay tokens cover danger zones, safe zones, route lines, range rings, and grid overlays.

## Usage

### Build all platforms

```bash
npm ci
npm run build
```

### Run tests

```bash
npm test
```

962 tests across 158 suites covering tokens, components, icons, symbology, site pages, and interfaces.

### Validate tokens

```bash
npm run validate
```

### In a DBSDK Codespace

Tokens are pre-installed at `$TAK_DESIGN_SYSTEM_PATH`. Android resources are available at `$TAK_DESIGN_ATAK_RES` for direct inclusion in your plugin's `res/` directory.

## Requirements Traceability

This project uses [RTMX](https://github.com/iotactical/rtmx) for requirements traceability. Every requirement links to at least one test, and every test traces back to a requirement.

```bash
npx rtmx verify    # Verify all requirements have passing tests
npx rtmx status    # Show RTM coverage summary
```

Current: 166/178 requirements verified (93.2%).

## Figma Source

This system is derived from the [ATAK Design System](https://www.figma.com/community/file/1571370238280853168/atak-design-system-tactical-assault-kit-team-awareness-kit) and [WinTAK Design System](https://www.figma.com/community/file/1573375430276099247/wintak-design-system-windows-tactical-assault-kit-team-awareness-kit) Figma community files.

## License

[MIT](LICENSE)
