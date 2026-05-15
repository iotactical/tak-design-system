# REQ-ICN-013: Pre-Rendered Selector Default-State PNGs

## Description
Generate pre-rendered PNG preview images for all 119 selector drawables so that the site Icons page and the TakIcon React component can display selector icons without runtime state resolution or inline CSS rendering. For selectors with `@drawable/` references, the default-state drawable is resolved and its existing PNG or SVG is composited at 48x48px. For selectors with inline definitions (from REQ-ICN-012), the inline shape/color/gradient is rendered to a 48x48 PNG. The generation script uses `canvas` (already a project dependency) for programmatic image generation. Output PNGs are placed in `site/public/icons/selectors/` so they are served as static assets.

## Acceptance Criteria
- [ ] A directory `site/public/icons/selectors/` contains exactly 119 PNG files, one per selector in `data/atak-selectors.json`.
- [ ] Each PNG is named `{selector_name}.png` matching the selector's `name` field.
- [ ] Each PNG is 48x48 pixels with a transparent background.
- [ ] PNGs for selectors with `@drawable/` default references visually match the referenced drawable's existing preview.
- [ ] PNGs for selectors with inline shape definitions render the shape with correct fill, stroke, corners, and gradient.
- [ ] File sizes are under 10 KB each.
- [ ] A generation script exists at `scripts/generate-selector-previews.mjs` and is idempotent.
- [ ] A manifest file `site/public/icons/selectors/manifest.json` maps each selector name to its PNG path and records the source resolution method (`drawable_ref` or `inline`).

## Validation
- **Test**: tests/icons/test_selector_previews.mjs::test_selector_preview_count
- **Test**: tests/icons/test_selector_previews.mjs::test_selector_preview_dimensions
- **Test**: tests/icons/test_selector_previews.mjs::test_selector_preview_file_size
- **Test**: tests/icons/test_selector_previews.mjs::test_selector_preview_manifest_complete
- **Method**: Unit Test
