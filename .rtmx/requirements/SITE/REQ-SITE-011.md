# REQ-SITE-011: Selector State Inspector

## Description
Add an interactive detail panel to the site Icons page that appears when a user clicks on a selector-type drawable card. The panel displays all states defined for that selector with their conditions labeled (e.g., "pressed + enabled", "focused", "default") and a visual preview of each state's drawable. This allows designers and developers to understand the complete state map of any selector without reading XML source. The panel uses data from `data/atak-selectors.json` (enhanced by REQ-ICN-012) and resolves each state's drawable to a visual preview. The panel appears as a slide-out or modal overlay and is dismissible via close button or Escape key.

## Acceptance Criteria
- [ ] Clicking a selector-type card on the Icons page opens a detail panel.
- [ ] The panel title shows the selector name.
- [ ] Each state is displayed as a row with: a visual preview of that state's drawable, a label listing all conditions, and the drawable reference string.
- [ ] The default state (the last entry with no conditions) is labeled "Default (fallback)".
- [ ] States are displayed in Android evaluation order (top-to-bottom, first-match-wins), with a visual indicator of priority.
- [ ] Inline drawable states (from REQ-ICN-012) render their shape/color/gradient inline.
- [ ] States referencing unresolvable drawables show a warning indicator and the raw reference string.
- [ ] The panel is accessible: focus is trapped while open, Escape key closes it, close button has proper aria-label.
- [ ] Clicking a non-selector card does not open the panel.

## Validation
- **Test**: tests/site/test_icon_browser.mjs::test_selector_inspector_opens
- **Test**: tests/site/test_icon_browser.mjs::test_selector_inspector_shows_all_states
- **Test**: tests/site/test_icon_browser.mjs::test_selector_inspector_default_label
- **Test**: tests/site/test_icon_browser.mjs::test_selector_inspector_escape_close
- **Test**: tests/site/test_icon_browser.mjs::test_selector_inspector_accessibility
- **Method**: Integration Test
