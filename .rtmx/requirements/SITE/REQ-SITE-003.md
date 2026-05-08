# REQ-SITE-003: Icon and Drawable Browser

## Description
Searchable browser for all ATAK icons and drawables. Shows every icon from the
drawable catalog, organized by category, with metadata and download options.

## Acceptance Criteria
- [ ] All 1,317 cataloged drawables browsable by category
- [ ] Search/filter by name, type, category
- [ ] SVG preview for vector drawables
- [ ] PNG preview for raster drawables
- [ ] Metadata display: type, category, available densities
- [ ] Download individual icons as SVG/PNG

## Validation
- **Test**: tests/site/test_icon_browser.mjs::test_icon_browser
- **Method**: Integration Test
