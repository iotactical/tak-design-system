# REQ-STY-007: ATAK Navigation Widget Tokens

## Description
All ATAK navigation widget styles must be captured as W3C component tokens. ATAK's map-centric UI relies on a family of navigation controls overlaid on the map view: `NavButton` (the primary nav button), `NavButtonDragHighlight` (visual feedback during drag reordering), `NavZoomButton` (zoom in/out controls), and `CompassButton` (bearing/heading indicator). These widgets are critical to the tactical user experience -- they must be large enough for gloved-hand operation, high-contrast against map backgrounds, and visually consistent across platforms.

Navigation widget styles and their key properties:
- **NavButton**: square button with icon, dark semi-transparent background, thin border, specific size for touch targets, pressed/focused states
- **NavButtonDragHighlight**: visual overlay shown when a nav button is being dragged to reorder; highlighted border or background tint
- **NavZoomButton**: paired +/- buttons, vertically stacked, same base style as NavButton but with distinct grouping (top corners rounded on +, bottom on -)
- **CompassButton**: circular button showing bearing, distinct border color, rotation-aware styling, potentially different size than NavButton

Each widget defines at minimum: `width`, `height`, `background-color`, `border-color`, `border-width`, `corner-radius`, `icon-size`, `icon-tint`, `opacity`, `pressed-background-color`, `pressed-border-color`.

## Acceptance Criteria
- [ ] A `component/navigation` group exists in `tokens/w3c/component.json` with sub-groups: `nav-button`, `nav-button-drag`, `nav-zoom-button`, `compass-button`.
- [ ] `nav-button` defines: `width`, `height`, `background-color`, `border-color`, `border-width`, `corner-radius`, `icon-size`, `icon-tint`, `opacity`.
- [ ] `nav-button` includes state tokens: `pressed-background-color`, `pressed-border-color`, `focused-border-color`.
- [ ] `nav-button-drag` defines: `highlight-border-color`, `highlight-border-width`, `highlight-background-color`.
- [ ] `nav-zoom-button` defines `corner-radius-top` and `corner-radius-bottom` for the paired +/- grouping.
- [ ] `compass-button` defines a circular shape (`corner-radius: 50%`) and `border-color` distinct from NavButton.
- [ ] All widget sizes meet the minimum touch target dimension defined in REQ-STY-002 (`min-touch-target`).
- [ ] All color values reference core tokens (REQ-STY-001); all dimensions reference core tokens (REQ-STY-002).
- [ ] Total navigation token count is >= 35.
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_navigation.mjs::test_all_nav_widget_variants_present
- **Method**: Unit Test
- **Test**: tests/styles/test_navigation.mjs::test_compass_button_circular
- **Method**: Unit Test
- **Test**: tests/styles/test_navigation.mjs::test_touch_target_minimum
- **Method**: Unit Test
- **Test**: tests/styles/test_navigation.mjs::test_nav_references_core_tokens
- **Method**: Unit Test
