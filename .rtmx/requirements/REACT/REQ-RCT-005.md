# REQ-RCT-005: TabLayout Component

## Description
TabLayout component must support controlled and uncontrolled tab switching modes.

## Acceptance Criteria
- [ ] Controlled mode works with external state
- [ ] Uncontrolled mode works with defaultActive prop
- [ ] Tab bar has role="tablist"
- [ ] Tab panels have role="tabpanel"
- [ ] onChange callback fires on tab selection

## Validation
- **Test**: tests/react/test_tablayout.mjs::test_tablayout_modes
- **Method**: Unit Test
