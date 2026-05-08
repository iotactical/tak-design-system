# REQ-CMP-003: DockPane

## Description
The DockPane is a slide-out panel used in ATAK for tool windows, plugin UIs, and detail views. It slides from the right or bottom edge, includes a header with title, close/minimize/maximize controls, and a resize handle. ATAK uses these extensively for route planning, marker details, chat, and plugin content. Cross-platform fidelity requires consistent panel sizing, drag-to-resize behavior, and stacking order so that operators get the same spatial layout on every device.

## Acceptance Criteria
- [ ] Slides in from a configurable edge (right, bottom, left)
- [ ] Header bar displays title text, minimize, maximize/restore, and close buttons
- [ ] Minimize collapses the pane to a tab on the edge; tapping the tab restores it
- [ ] Maximize expands the pane to fill the available non-map area
- [ ] Resize handle allows drag-to-resize with a minimum width/height of 240dp
- [ ] Supports stacking: multiple DockPanes can coexist, with z-order managed by last-focused
- [ ] Content area scrolls independently of the map
- [ ] Emits lifecycle events: onOpen, onClose, onMinimize, onMaximize, onResize
- [ ] Applies design tokens: surface.panel background, border.panel divider, text.heading title
- [ ] Renders a shadow/scrim on the map side to indicate layering
- [ ] Keyboard shortcut Escape closes the topmost pane
- [ ] Transition animation is a horizontal or vertical slide not exceeding 250ms
- [ ] Accepts children as content (render prop or slot pattern)

## Validation
- **Test**: tests/components/test_dock_pane.mjs::slides_in_from_right
- **Test**: tests/components/test_dock_pane.mjs::minimize_and_restore
- **Test**: tests/components/test_dock_pane.mjs::drag_resize_respects_minimum
- **Test**: tests/components/test_dock_pane.mjs::multiple_panes_stack_correctly
- **Test**: tests/components/test_dock_pane.mjs::escape_closes_topmost
- **Method**: Unit Test, Integration Test
