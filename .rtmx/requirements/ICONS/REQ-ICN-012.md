# REQ-ICN-012: Inline Selector Drawable Extraction

## Description
Enhance the selector extraction in `scripts/extract-drawable-metadata.mjs` to capture inline drawable definitions from the 34 selector XMLs that currently produce empty `drawable` fields. These selectors define their visual states using inline `<shape>`, `<color>`, or `<gradient>` elements nested inside `<item>` tags rather than referencing external `@drawable/` resources. The current regex-based parser only captures the `android:drawable` attribute, so these 34 selectors appear with states that have no drawable reference -- making them unrenderable. After this enhancement, every selector state in `data/atak-selectors.json` will have either a `drawable` reference or an `inlineDrawable` object describing the inline definition.

## Acceptance Criteria
- [ ] `data/atak-selectors.json` is regenerated with enhanced inline parsing.
- [ ] Every state object across all 119 selectors has either a non-empty `drawable` string or a non-null `inlineDrawable` object.
- [ ] The `inlineDrawable` object contains a `type` field (one of: `shape`, `color`, `gradient`) and type-specific properties: shapes use the same schema as `data/atak-shapes.json` entries; colors use `{ type: "color", value: "#RRGGBB" }`; gradients include `startColor`, `endColor`, `angle`, `type`.
- [ ] The 34 selectors that previously had states with no drawable reference now have `inlineDrawable` data on every state.
- [ ] The 85 selectors that already had `@drawable/` references remain unchanged (no regression).
- [ ] The total selector count in the output remains 119.

## Validation
- **Test**: tests/icons/test_selectors.mjs::test_selector_count_unchanged
- **Test**: tests/icons/test_selectors.mjs::test_all_states_have_drawable_or_inline
- **Test**: tests/icons/test_selectors.mjs::test_inline_drawable_schema_valid
- **Test**: tests/icons/test_selectors.mjs::test_previously_resolved_selectors_unchanged
- **Test**: tests/icons/test_selectors.mjs::test_inline_selector_count
- **Method**: Unit Test
