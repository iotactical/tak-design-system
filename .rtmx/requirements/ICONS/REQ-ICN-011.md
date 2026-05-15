# REQ-ICN-011: Layer-List Composition Extraction

## Description
Extract composition data from the 36 Android layer-list drawables in ATAK into a structured JSON file at `data/atak-layer-lists.json`. Android layer-list drawables define stacked layers where each `<item>` references a child drawable (via `@drawable/` reference, inline `<shape>`, inline `<bitmap>`, or inline `<color>`) and optionally specifies positional offsets (`left`, `top`, `right`, `bottom`), dimensions (`width`, `height`), and gravity. Without this data the design system cannot render composite icons that combine multiple drawables into a single visual element -- these appear as placeholders on the Icons page today. The extraction script follows the regex-based XML parsing pattern in `scripts/extract-drawable-metadata.mjs`, reading source XML from the ATAK drawable directory.

## Acceptance Criteria
- [ ] A JSON file `data/atak-layer-lists.json` exists containing an array of exactly 36 entries.
- [ ] Each entry contains: `name` (string), `atakSourceFile` (string), `layers` (ordered array of layer objects).
- [ ] Each layer object contains: `index` (0-based integer), `drawable` (string reference such as `@drawable/foo`, `@color/bar`, or `inline:<type>` for inline definitions), `left` (number, default 0), `top` (number, default 0), `right` (number, default 0), `bottom` (number, default 0), `width` (number or null), `height` (number or null), `gravity` (string or null).
- [ ] Inline shape definitions within `<item>` elements are fully expanded into an `inlineShape` object using the same schema as `data/atak-shapes.json` entries.
- [ ] All `@drawable/` references are validated against `data/atak-drawable-catalog.json`; unresolvable references are flagged in a `warnings` array on the entry.
- [ ] The output JSON passes schema validation against `schemas/atak-layer-list.schema.json`.
- [ ] The extraction script is at `scripts/extract-layer-lists.mjs` and is idempotent (running twice produces identical output).

## Validation
- **Test**: tests/icons/test_layer_lists.mjs::test_layer_list_count
- **Test**: tests/icons/test_layer_lists.mjs::test_layer_list_schema_valid
- **Test**: tests/icons/test_layer_lists.mjs::test_layer_list_drawable_refs_resolve
- **Test**: tests/icons/test_layer_lists.mjs::test_layer_list_inline_shapes_parsed
- **Test**: tests/icons/test_layer_lists.mjs::test_layer_list_idempotent
- **Method**: Unit Test
