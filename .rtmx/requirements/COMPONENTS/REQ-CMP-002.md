# REQ-CMP-002: RadialMenu

## Description
The RadialMenu is a circular/pie context menu used extensively in ATAK for map-object interactions. ATAK ships 110 menu definitions in assets/menus/ as XML, each describing a ring of actions around a tapped marker or point. This component must faithfully reproduce the radial layout, sector highlighting, sub-menu drill-down, and long-press behavior so that muscle memory from ATAK Android transfers directly to every other TAK platform.

## Acceptance Criteria
- [ ] Renders a circular menu centered on a given screen coordinate
- [ ] Supports configurable number of sectors (4, 6, 8 are common in ATAK menu XMLs)
- [ ] Each sector displays an icon and an optional label
- [ ] Sector highlight follows pointer/touch position with visual feedback
- [ ] Supports nested sub-menus: selecting a sector can open an inner or outer ring
- [ ] Long-press on a sector shows a tooltip with the full action description
- [ ] Dismisses on tap outside the menu or on a cancel gesture (back button, Escape key)
- [ ] Emits onSelect with the sector id and menu path when a sector is activated
- [ ] Applies design tokens: surface.overlay background, radial.sector.active highlight, icon.primary fill
- [ ] Minimum sector arc of 45 degrees to maintain touch accuracy
- [ ] Animates open/close with a scale+fade transition not exceeding 200ms
- [ ] Menu definitions can be supplied as JSON matching the ATAK XML menu schema
- [ ] Renders correctly when positioned near screen edges (auto-repositions to stay in viewport)

## Validation
- **Test**: tests/components/test_radial_menu.mjs::renders_six_sector_menu
- **Test**: tests/components/test_radial_menu.mjs::nested_submenu_opens_on_select
- **Test**: tests/components/test_radial_menu.mjs::dismisses_on_outside_tap
- **Test**: tests/components/test_radial_menu.mjs::edge_repositioning
- **Test**: tests/components/test_radial_menu.mjs::json_menu_definition_parsing
- **Method**: Unit Test, Visual Regression Test
