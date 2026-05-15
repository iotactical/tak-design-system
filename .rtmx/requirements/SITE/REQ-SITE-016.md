# REQ-SITE-016: Control Measures Desktop-Only Gate

## Description
The Control Measures interactive plotting tool requires a desktop browser for usable point plotting and multi-panel layout. On viewports narrower than 768px, the Control Measures tab content is replaced with a message directing users to a desktop browser. The message explains that interactive tactical graphic plotting requires a larger screen and mouse input. The tab itself remains visible and clickable so users are aware the feature exists.

## Acceptance Criteria
- [ ] On viewports < 768px wide, the Control Measures tab panel shows a centered message instead of the interactive panel.
- [ ] The message text explains the desktop requirement and suggests using a desktop browser.
- [ ] The message includes a representative icon or illustration (e.g., a monitor icon via CSS).
- [ ] The tab button in the tab bar remains visible and selectable on mobile.
- [ ] On viewports >= 768px, the full interactive panel renders normally.
- [ ] The gate is implemented via CSS media query or a width check, not user-agent sniffing.

## Validation
- **Test**: tests/site/test_control_measures.mjs::test_mobile_gate_message
- **Test**: tests/site/test_control_measures.mjs::test_desktop_panel_renders
- **Method**: Integration Test
