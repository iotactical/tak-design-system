# REQ-ICN-008: ATAK Radial Menu Definitions

## Description
Index and convert the 110 ATAK radial menu XML definitions into structured JSON suitable for cross-platform radial menu rendering. ATAK uses a custom XML format to define radial (pie) menus that appear on long-press of map items. Each menu definition specifies sectors, icons, labels, action intents, sub-menus, and conditional visibility rules. The design system must capture these definitions so that non-Android TAK clients can present identical radial menus with the same structure, icon references, and action semantics. This requirement does not implement the radial menu renderer -- it produces the data model that renderers consume.

## Acceptance Criteria
- [ ] A directory `data/radial-menus/` contains 110 JSON files, one per ATAK radial menu XML.
- [ ] Each JSON file contains: `name`, `atakSourceFile`, `sectors` (ordered array of sector objects), `defaultRadius` (number), `centerAction` (object or null).
- [ ] Each sector object contains: `index` (0-based position), `icon` (reference to an icon asset from REQ-ICN-003 or the drawable catalog), `label`, `action` (string action identifier), `subMenu` (reference to another radial menu JSON or null), `visibilityCondition` (string expression or null), `enabled` (boolean default).
- [ ] Sub-menu references use a `$ref` path to another file in `data/radial-menus/`, forming a navigable tree.
- [ ] Action identifiers are normalized from Android intent strings to platform-agnostic action keys (e.g., `com.atakmap.android.maps.ROUTE_PLANNING` becomes `route.planning`).
- [ ] A mapping file `data/radial-menus/action-map.json` provides bidirectional lookup between ATAK intent strings and normalized action keys.
- [ ] A manifest file `data/radial-menus/manifest.json` indexes all 110 menus with: `name`, `sectorCount`, `hasSubMenus`, `hasConditionalVisibility`, `atakSourceFile`.
- [ ] All JSON files pass schema validation against `schemas/radial-menu-definition.schema.json`.
- [ ] The total set of unique icon references across all menus is documented and each reference resolves to an asset in the drawable catalog (REQ-ICN-001).

## Validation
- **Test**: tests/icons/test_radial_menus.mjs::test_radial_menu_count
- **Test**: tests/icons/test_radial_menus.mjs::test_radial_menu_schema
- **Test**: tests/icons/test_radial_menus.mjs::test_radial_menu_icon_refs_resolve
- **Test**: tests/icons/test_radial_menus.mjs::test_radial_menu_submenu_refs_resolve
- **Test**: tests/icons/test_radial_menus.mjs::test_radial_menu_action_map_bidirectional
- **Test**: tests/icons/test_radial_menus.mjs::test_radial_menu_manifest_complete
- **Method**: Unit Test
