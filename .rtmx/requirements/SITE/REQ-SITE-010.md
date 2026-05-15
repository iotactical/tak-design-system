# REQ-SITE-010: 100% Icon Preview Coverage on Icons Page

## Description
The site Icons page (`site/src/pages/Icons.tsx`) must render a visual preview for all 1,317 drawables in the catalog with zero placeholder fallbacks. Currently 70 drawables (34 inline-definition selectors and 36 layer-lists) display generic placeholder glyphs instead of visual previews. With the data from REQ-ICN-011 (layer-list composition) and REQ-ICN-012 (inline selector drawables), plus the pre-rendered PNGs from REQ-ICN-013, the Icons page renders every entry. Selectors use pre-rendered PNGs from `site/public/icons/selectors/`. Layer-lists use either pre-rendered composites or inline CSS composition. The placeholder `noPreview` code path is reduced to an error-only fallback that fires zero times under normal operation.

## Acceptance Criteria
- [ ] All 1,317 drawables on the Icons page render a visual preview.
- [ ] Zero drawables display the `noPreview` placeholder glyph under normal operation.
- [ ] Selector drawables display the pre-rendered PNG from `site/public/icons/selectors/{name}.png`.
- [ ] Layer-list drawables display either a pre-rendered composite or inline CSS composition.
- [ ] Filtering by type `selector` shows 119 entries, all with visual previews.
- [ ] Filtering by type `layer-list` shows 36 entries, all with visual previews.
- [ ] Page load performance remains under 3 seconds for the full unfiltered grid (lazy loading for off-screen images).
- [ ] The `CardPreview` fallback code path logs a console warning rather than silently showing a placeholder.

## Validation
- **Test**: tests/site/test_icon_browser.mjs::test_all_icons_have_preview
- **Test**: tests/site/test_icon_browser.mjs::test_no_placeholder_glyphs
- **Test**: tests/site/test_icon_browser.mjs::test_selector_previews_loaded
- **Test**: tests/site/test_icon_browser.mjs::test_layer_list_previews_loaded
- **Method**: Integration Test
