# REQ-TOK-003: Component Token References

## Description
Component tokens must correctly reference semantic and core tokens. All references must resolve.

## Acceptance Criteria
- [ ] Button tokens (primary, secondary, danger) defined
- [ ] Toolbar tokens (height, background, icon sizing) defined
- [ ] Sidebar tokens (width, collapsed width, item height) defined
- [ ] Marker/CoT icon sizing tokens defined
- [ ] Overlay, coordinate display, alert banner tokens defined
- [ ] All token references resolve

## Validation
- **Test**: tests/tokens/test_component.mjs::test_component_refs_resolve
- **Method**: Unit Test
