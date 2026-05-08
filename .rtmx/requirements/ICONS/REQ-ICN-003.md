# REQ-ICN-003: ATAK Menu Icon Library

## Description
Extract, convert, and package the 83 `ic_menu_*` icons used in ATAK radial menus and overflow action menus. These icons are the most user-visible icons in the ATAK interface -- they appear in the radial quick-action ring, long-press context menus, and toolbar overflow lists. Providing them as optimized SVGs with consistent sizing, color tokens, and naming allows every platform in the TAK ecosystem to render identical menu experiences. Each icon must be cataloged with its semantic purpose (e.g., `ic_menu_compass` = "Open compass tool") so that downstream UI frameworks can attach accessible labels.

## Acceptance Criteria
- [ ] A directory `icons/svg/menu/` contains exactly 83 SVG files corresponding to every `ic_menu_*` drawable in ATAK.
- [ ] Each SVG uses a uniform 24x24 viewport with a 2dp visual padding zone (20x20 live area centered in 24x24 canvas).
- [ ] All SVGs use `currentColor` as the default fill so that host applications can theme them via CSS or platform color properties.
- [ ] A metadata file `icons/svg/menu/manifest.json` lists every icon with fields: `name`, `file`, `semanticLabel`, `atakSourceFile`, `tags` (array of search keywords).
- [ ] Icons that originated as raster PNGs are traced to vector with a maximum path complexity threshold of 2,048 path commands per icon.
- [ ] Icons that originated as Android vector drawables are converted losslessly per REQ-ICN-002 criteria.
- [ ] SVGO optimization is applied; each file is under 4 KB.
- [ ] No icon contains embedded raster images (`<image>` elements).
- [ ] Every icon renders without clipping at 16px, 24px, 32px, and 48px display sizes.
- [ ] The manifest covers all 83 icons with no missing or extra entries.

## Validation
- **Test**: tests/icons/test_menu_icons.mjs::test_menu_icon_count
- **Test**: tests/icons/test_menu_icons.mjs::test_menu_icon_viewport
- **Test**: tests/icons/test_menu_icons.mjs::test_menu_icon_current_color
- **Test**: tests/icons/test_menu_icons.mjs::test_menu_manifest_complete
- **Test**: tests/icons/test_menu_icons.mjs::test_menu_icon_file_size
- **Test**: tests/icons/test_menu_icons.mjs::test_menu_icon_no_embedded_raster
- **Method**: Unit Test
