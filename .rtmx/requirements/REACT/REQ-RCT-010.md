# REQ-RCT-010: TakIcon Selector State Renderer

## Description
An internal sub-component of TakIcon that renders selector (state-list) drawables with interactive state preview. When displayed in a static context, the selector renderer shows the pre-rendered default-state PNG from REQ-ICN-013. When the `interactive` prop is true, the renderer maps CSS pseudo-states to Android states: `:hover` triggers the `state_pressed` visual, `:focus-visible` triggers `state_focused`, `[aria-disabled]` triggers `state_enabled=false`, and `[aria-selected]` triggers `state_selected`. Each state is resolved by walking the selector's state list (first-match-wins, matching Android evaluation order) and rendering the matched drawable using the appropriate sub-renderer.

## Acceptance Criteria
- [ ] An internal module `packages/react/src/components/TakIcon/SelectorRenderer.tsx` exists.
- [ ] Default rendering shows the pre-rendered PNG from `selectors/{name}.png`.
- [ ] When `interactive={true}`, applies CSS class mappings for hover/focus/active/disabled states.
- [ ] Hover state resolves to the `state_pressed=true` entry from the selector definition.
- [ ] Focus state resolves to the `state_focused=true` entry.
- [ ] Disabled state resolves to the `state_enabled=false` entry.
- [ ] State resolution follows Android first-match-wins evaluation order.
- [ ] Selectors with inline drawable definitions (REQ-ICN-012) render their shape/color/gradient correctly for each state.
- [ ] Falls back to default-state rendering when no matching state entry is found.
- [ ] Does not crash when a selector references an unresolvable drawable; renders fallback instead.

## Validation
- **Test**: tests/react/test_tak_icon.mjs::test_selector_default_state
- **Test**: tests/react/test_tak_icon.mjs::test_selector_hover_pressed
- **Test**: tests/react/test_tak_icon.mjs::test_selector_disabled_state
- **Test**: tests/react/test_tak_icon.mjs::test_selector_inline_drawable
- **Test**: tests/react/test_tak_icon.mjs::test_selector_unresolvable_fallback
- **Method**: Unit Test
