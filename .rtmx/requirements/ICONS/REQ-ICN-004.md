# REQ-ICN-004: ATAK Navigation Icon Library

## Description
Extract, convert, and package the 119 `nav_*` navigation toolbar icons used throughout the ATAK interface. Navigation icons appear in the primary toolbar, secondary action bars, and breadcrumb navigation stacks. They communicate spatial orientation, tool mode, and view state. Because these icons are displayed at small sizes in high-contrast tactical environments, each SVG must be pixel-hinted for 24dp rendering and must maintain legibility on both light and dark map backgrounds. The complete set enables non-Android TAK clients to present a toolbar experience visually identical to ATAK.

## Acceptance Criteria
- [ ] A directory `icons/svg/nav/` contains exactly 119 SVG files corresponding to every `nav_*` drawable in ATAK.
- [ ] Each SVG uses a uniform 24x24 viewport.
- [ ] All SVGs default to `currentColor` fill for themability.
- [ ] A metadata file `icons/svg/nav/manifest.json` lists every icon with fields: `name`, `file`, `semanticLabel`, `atakSourceFile`, `toolbarSection` (primary, secondary, breadcrumb, or other), `tags`.
- [ ] Icons sourced from Android XML selectors are extracted in their default/enabled state; alternate states are documented in the manifest under a `states` field.
- [ ] SVGs pass validation per SVG 1.1 specification.
- [ ] SVGO optimization is applied; each file is under 4 KB.
- [ ] Visual regression test confirms each icon renders without artifact at 16px, 24px, 32px, and 48px.
- [ ] Icons are tested for contrast ratio of at least 3:1 against both #000000 and #FFFFFF backgrounds when rendered with their ATAK default color.
- [ ] The manifest covers all 119 icons with no missing or extra entries.

## Validation
- **Test**: tests/icons/test_nav_icons.mjs::test_nav_icon_count
- **Test**: tests/icons/test_nav_icons.mjs::test_nav_icon_viewport
- **Test**: tests/icons/test_nav_icons.mjs::test_nav_manifest_complete
- **Test**: tests/icons/test_nav_icons.mjs::test_nav_icon_file_size
- **Test**: tests/icons/test_nav_icons.mjs::test_nav_icon_contrast
- **Method**: Unit Test
