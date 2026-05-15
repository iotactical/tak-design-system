# REQ-SITE-012: Layer-List Layer Inspector

## Description
Add an interactive detail panel to the site Icons page that appears when a user clicks on a layer-list-type drawable card. The panel displays each layer in the layer-list as an individually visible element with its offset, dimensions, and drawable reference. A stacking visualization shows all layers composited with semi-transparent overlays and numbered badges so that the contribution of each layer is visible. Individual layers can be toggled on/off via checkboxes to see how each layer contributes to the composite. This panel uses data from `data/atak-layer-lists.json` (produced by REQ-ICN-011).

## Acceptance Criteria
- [ ] Clicking a layer-list-type card on the Icons page opens a detail panel.
- [ ] The panel title shows the layer-list name.
- [ ] Each layer is displayed with: its index number, drawable reference, offset values, and a visual preview.
- [ ] A composite preview area shows all layers stacked in order with semi-transparent overlays.
- [ ] Each layer has a checkbox that toggles its visibility in the composite preview.
- [ ] Layers are displayed in stacking order (index 0 = bottom, highest index = top).
- [ ] Inline shape layers render their shape definition as a CSS preview.
- [ ] `@drawable/` reference layers resolve and display the referenced drawable's preview.
- [ ] Offset values are displayed in dp units.
- [ ] The panel is accessible: focus is trapped while open, Escape key closes it.
- [ ] Clicking a non-layer-list card does not open the panel.

## Validation
- **Test**: tests/site/test_icon_browser.mjs::test_layer_list_inspector_opens
- **Test**: tests/site/test_icon_browser.mjs::test_layer_list_inspector_shows_layers
- **Test**: tests/site/test_icon_browser.mjs::test_layer_list_inspector_toggle_layer
- **Test**: tests/site/test_icon_browser.mjs::test_layer_list_inspector_stacking_order
- **Test**: tests/site/test_icon_browser.mjs::test_layer_list_inspector_accessibility
- **Method**: Integration Test
