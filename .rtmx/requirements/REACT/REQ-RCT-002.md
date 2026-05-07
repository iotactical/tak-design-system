# REQ-RCT-002: ToolBar Component

## Description
ToolBar component must render with leading, title, and trailing slot support.

## Acceptance Criteria
- [ ] Leading slot renders on left
- [ ] Title renders in center
- [ ] Trailing slot renders on right
- [ ] Content slot renders children
- [ ] Has role="toolbar" for accessibility

## Validation
- **Test**: tests/react/test_toolbar.mjs::test_toolbar_slots
- **Method**: Unit Test
