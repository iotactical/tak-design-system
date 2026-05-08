# REQ-SYM-003: WPF/XAML Military Symbology Renderer (mil-sym-wpf)

## Description
Build an open-source WPF renderer for MIL-STD-2525D/E military symbols,
filling the platform gap in the missioncommand ecosystem. WinTAK currently
depends on Spyglass.Graphics.Icon (proprietary/native). No open-source
WPF renderer exists.

Target: contribute as standalone missioncommand/mil-sym-wpf project under
Apache-2.0 license, consistent with existing mil-sym-ts/java/android repos.

## Approach
- Port rendering logic from mil-sym-ts (TypeScript) to C#/.NET WPF
- Use WPF DrawingVisual/GeometryDrawing for vector symbol composition
- Consume SVG path data from svgd.json/svge.json (same data as TS renderer)
- Integrate with WinTAK via ComponentResourceKey pattern discovered in SDK
- Consume TAK design tokens for affiliation colors via REQ-SYM-002 bridge

## Acceptance Criteria
- [ ] Renders single-point 2525D/E icons as WPF DrawingImage
- [ ] Supports all standard identities (friendly, hostile, neutral, unknown, suspect, pending)
- [ ] Supports echelon, HQ/TF/FD, and status amplifiers
- [ ] Consumes svgd.json/svge.json for entity icon SVG paths
- [ ] API compatible with mil-sym-ts SymbolID/MilStdSymbol patterns
- [ ] Apache-2.0 licensed for upstream contribution to missioncommand org
- [ ] Standalone repo: missioncommand/mil-sym-wpf (or iotactical fork initially)

## Validation
- **Test**: tests/symbology/test_wpf_renderer.mjs::test_wpf_renderer_spec
- **Method**: Unit Test (spec validation; full WPF tests in the standalone repo)
