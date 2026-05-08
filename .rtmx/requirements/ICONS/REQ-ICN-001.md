# REQ-ICN-001: ATAK Drawable Resource Catalog

## Description
Produce a complete, machine-readable catalog of all 1,317 unique drawable resources shipped in the ATAK Android application. The catalog serves as the authoritative index for every subsequent icon-extraction and conversion requirement in the ICN tier. Each entry must capture the resource name, drawable type (vector, bitmap, shape, selector, nine-patch, layer-list, animated), source path inside the ATAK repository, intrinsic dimensions, and category tag so that downstream tooling can filter, batch-convert, and validate coverage. Without this catalog the design system cannot guarantee parity with the native ATAK icon surface.

## Acceptance Criteria
- [ ] A JSON file `data/atak-drawable-catalog.json` exists containing an array of exactly 1,317 entries.
- [ ] Each entry contains the fields: `name` (string), `type` (enum: vector, bitmap, shape, selector, nine-patch, layer-list, animated, other), `sourcePath` (string), `category` (string), `widthDp` (number | null), `heightDp` (number | null).
- [ ] The `category` field classifies every entry into one of the documented prefixes: ic_menu, nav, enter_location, btn, toolbar, tab, toggle, sidemenu, navcue, ic_navstack, ic_route, ic_track, ic_hostile, ic_self, or "other" for unclassified drawables.
- [ ] Category counts match known totals: ic_menu (83), nav (119), enter_location (46), btn (40), toolbar (16), tab (16), toggle (13), sidemenu (13), navcue (13), ic_navstack (12), ic_route (9), ic_track (8), ic_hostile (8), ic_self (5).
- [ ] Drawable type counts match known totals: vector (174), shape (118), selector/state-list (117), with the remainder distributed across bitmap, nine-patch, layer-list, animated, and other.
- [ ] The catalog JSON passes schema validation against `schemas/atak-drawable-catalog.schema.json`.
- [ ] No duplicate `name` values exist in the catalog.
- [ ] A summary report is generated listing counts per category and per type.
- [ ] The catalog build script is idempotent -- running it twice produces identical output.

## Validation
- **Test**: tests/icons/test_drawable_catalog.mjs::test_catalog_entry_count
- **Test**: tests/icons/test_drawable_catalog.mjs::test_catalog_schema_valid
- **Test**: tests/icons/test_drawable_catalog.mjs::test_catalog_no_duplicates
- **Test**: tests/icons/test_drawable_catalog.mjs::test_catalog_category_counts
- **Test**: tests/icons/test_drawable_catalog.mjs::test_catalog_type_counts
- **Method**: Unit Test
