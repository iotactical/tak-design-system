# REQ-RCT-003: Modal Component

## Description
Modal component must support open/close with ESC key and click-outside dismissal.

## Acceptance Criteria
- [ ] Opens when open prop is true
- [ ] Closes on ESC key press
- [ ] Closes on backdrop click
- [ ] Optional title with close button
- [ ] Has role="dialog" and aria-modal="true"

## Validation
- **Test**: tests/react/test_modal.mjs::test_modal_behavior
- **Method**: Unit Test
