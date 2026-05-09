# REQ-XW-082: Rename Self Marker Palette Tab

## Description
The current "Skittles" tab in the Palettes page actually shows the Self Marker
(directional arrow with team color tinting) -- not the team member circles.
Rename it to "Self Marker" and update the SkittleMarker component to clearly
distinguish between the two marker types.

## Changes
- Rename Palettes tab from "Skittles" to "Self Marker"
- Update tab id from 'skittles' to 'self-marker'
- Update SkittlesPanel to SelfMarkerPanel
- Keep all existing arrow/heading/state/role content
- Update default active tab to 'skittles' (the new circle-based tab)

## Acceptance Criteria
- [ ] Tab labeled "Self Marker" (not "Skittles")
- [ ] Existing arrow/heading/state content preserved
- [ ] "Skittles" tab is a separate entry for the circle markers (REQ-XW-081)

## Validation
- **Test**: tests/site/test_self_marker_palette.mjs::test_self_marker_tab
- **Method**: Integration Test
