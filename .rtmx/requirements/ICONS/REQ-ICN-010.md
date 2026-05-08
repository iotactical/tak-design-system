# REQ-ICN-010: ATAK Toolbar/Tab/Toggle Drawable Sets

## Description
Extract and convert the combined 45 drawables spanning ATAK toolbar containers (`toolbar_*`, 16), tab widgets (`tab_*`, 16), and toggle button states (`toggle_*`, 13). These three drawable families share a common pattern: each defines a container or control chrome element that frames or wraps content icons. Toolbars provide action bar backgrounds and dividers; tabs provide selected/unselected indicator chrome; toggles provide on/off visual states. The design system must decompose these into reusable component primitives with platform-agnostic state definitions so that cross-platform UI frameworks can render structurally identical control chrome.

## Acceptance Criteria
- [ ] A directory `icons/chrome/toolbar/` contains 16 definitions for `toolbar_*` drawables.
- [ ] A directory `icons/chrome/tab/` contains 16 definitions for `tab_*` drawables.
- [ ] A directory `icons/chrome/toggle/` contains 13 definitions for `toggle_*` drawables.
- [ ] Each definition is a JSON file containing: `name`, `type` (toolbar, tab, toggle), `atakSourceFile`, `drawableType` (shape, selector, nine-patch, layer-list), and type-specific properties.
- [ ] Toolbar definitions include: `background` (shape or color reference), `divider` (color, width), `height`, `elevation`.
- [ ] Tab definitions include: `states` (selected, unselected, pressed), each with `indicator` (color, height, position), `background`, `textColor`, `iconTint`.
- [ ] Toggle definitions include: `states` (on, off, disabled), each with `thumbDrawable` (SVG ref or shape), `trackDrawable` (SVG ref or shape), `thumbTint`, `trackTint`.
- [ ] SVG reference files are generated for any visual element that cannot be expressed as a simple shape/color (stored alongside the JSON).
- [ ] CSS equivalents are generated in `icons/chrome/css/` for each definition, using CSS custom properties for theming.
- [ ] A combined manifest `icons/chrome/manifest.json` indexes all 45 entries with: `name`, `type`, `stateCount`, `atakSourceFile`.
- [ ] All JSON files pass schema validation against `schemas/chrome-definition.schema.json`.

## Validation
- **Test**: tests/icons/test_chrome_drawables.mjs::test_toolbar_count
- **Test**: tests/icons/test_chrome_drawables.mjs::test_tab_count
- **Test**: tests/icons/test_chrome_drawables.mjs::test_toggle_count
- **Test**: tests/icons/test_chrome_drawables.mjs::test_chrome_definition_schema
- **Test**: tests/icons/test_chrome_drawables.mjs::test_chrome_css_generated
- **Test**: tests/icons/test_chrome_drawables.mjs::test_chrome_manifest_complete
- **Method**: Unit Test
