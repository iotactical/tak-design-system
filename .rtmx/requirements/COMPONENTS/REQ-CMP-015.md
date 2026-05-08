# REQ-CMP-015: DialogPanel Component Set

## Description
The DialogPanel component set covers modal and full-screen dialog patterns used in ATAK, including alert dialogs, confirmation dialogs, and full-screen panels. ATAK uses dark-themed dialogs with consistent button placement, title styling, and scrim behavior. Cross-platform consistency ensures that disruptive UI interactions (confirmations, warnings, blocking inputs) present identically so operators can respond quickly without confusion regardless of TAK client.

## Acceptance Criteria

### Alert Dialog
- [ ] Renders a centered modal with title, message body, and a single dismiss button
- [ ] Scrim overlay dims the background and blocks interaction with content beneath
- [ ] Dismiss button label is configurable (default: "OK")
- [ ] Pressing Escape or tapping the scrim dismisses the dialog
- [ ] Supports an optional icon in the header (warning, error, info)

### Confirm Dialog
- [ ] Renders a centered modal with title, message body, and two buttons (confirm/cancel)
- [ ] Confirm button uses accent color; cancel button uses neutral color
- [ ] Button order matches ATAK convention: cancel on the left, confirm on the right
- [ ] Emits onConfirm or onCancel events based on user selection
- [ ] Supports a destructive variant where confirm button uses error/red color

### Full-Screen Dialog
- [ ] Renders a dialog that fills the entire viewport with a top app bar
- [ ] Top bar includes a close/back button and a title
- [ ] Supports a save/submit action button in the top bar trailing position
- [ ] Content area is scrollable
- [ ] Used for complex forms and editors that need maximum screen space

### Shared
- [ ] All dialogs animate in with a fade+scale transition (duration under 200ms)
- [ ] All dialogs trap focus within the dialog while open (focus does not escape to background)
- [ ] All dialogs return focus to the triggering element on close
- [ ] Applies design tokens: surface.dialog, surface.scrim, text.heading, text.body, color.accent.primary, color.error
- [ ] Stacking: if multiple dialogs open, they stack with incrementing z-index
- [ ] All dialogs have aria-role="dialog" and aria-modal="true"

## Validation
- **Test**: tests/components/test_dialog_panel.mjs::alert_renders_with_message
- **Test**: tests/components/test_dialog_panel.mjs::alert_dismiss_on_escape
- **Test**: tests/components/test_dialog_panel.mjs::confirm_emits_events
- **Test**: tests/components/test_dialog_panel.mjs::confirm_destructive_variant
- **Test**: tests/components/test_dialog_panel.mjs::fullscreen_scrollable_content
- **Test**: tests/components/test_dialog_panel.mjs::focus_trap
- **Test**: tests/components/test_dialog_panel.mjs::dialog_stacking
- **Method**: Unit Test, Accessibility Test
