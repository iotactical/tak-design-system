# TAK Design System

Design tokens and platform-specific assets for the TAK (Tactical Assault Kit / Team Awareness Kit) ecosystem.

Built for [Defense Builders SDK](https://github.com/iotactical/defense-builders-sdk) codespaces and standalone TAK plugin development.

## Platforms

| Platform | Output | Path |
|----------|--------|------|
| ATAK (Android) | XML resources, Compose constants | `platforms/atak/` |
| WinTAK (Windows) | XAML resources (planned) | `platforms/wintak/` |
| WebTAK | CSS custom properties | `platforms/web/` |
| VS Code | Editor theme | `platforms/vscode/` |

## Token Architecture

```
tokens/w3c/
  core.json       Primitive values (colors, spacing, typography)
  semantic.json    Intent-based aliases (affiliation, status, surfaces)
  component.json   Component-specific tokens (buttons, toolbar, markers)
```

Tokens follow the [W3C Design Tokens](https://tr.designtokens.org/format/) specification and are transformed by [Style Dictionary](https://amzn.github.io/style-dictionary/) into platform-specific outputs.

## Tactical Semantics

The design system encodes MIL-STD-2525 / APP-6 affiliation colors:

- **Friendly** (blue) - `affiliation.friendly`
- **Hostile** (red) - `affiliation.hostile`
- **Neutral** (green) - `affiliation.neutral`
- **Unknown** (yellow) - `affiliation.unknown`
- **Suspect** (orange) - `affiliation.suspect`

Map overlay tokens cover danger zones, safe zones, route lines, range rings, and grid overlays.

## Usage

### Build all platforms

```bash
npm ci
npm run build
```

### Build specific platform

```bash
npm run build:android
npm run build:compose
npm run build:css
npm run build:vscode
```

### Validate tokens

```bash
npm run validate
```

### In a DBSDK Codespace

Tokens are pre-installed at `$TAK_DESIGN_SYSTEM_PATH`. Android resources are available at `$TAK_DESIGN_ATAK_RES` for direct inclusion in your plugin's `res/` directory.

## Figma Source

This system is derived from the [ATAK Design System](https://www.figma.com/community/file/1571370238280853168/atak-design-system-tactical-assault-kit-team-awareness-kit) and [WinTAK Design System](https://www.figma.com/community/file/1573375430276099247/wintak-design-system-windows-tactical-assault-kit-team-awareness-kit) Figma community files.

Token synchronization from Figma uses the Figma Variables API via Tokens Studio or the Figma MCP server.

## License

MIT
