# REQ-CMP-011: MarkerDetail

## Description
The MarkerDetail component displays detailed information about a CoT (Cursor on Target) marker selected on the map. In ATAK this appears as a DockPane or bottom sheet showing the marker's callsign, type, coordinates, speed, course, altitude, remarks, and action buttons (navigate-to, send, delete, edit). This is one of the most frequently used panels in ATAK. Cross-platform consistency ensures that operators can inspect any shared marker with the same information layout and available actions on every TAK client.

## Acceptance Criteria
- [ ] Displays marker callsign/title prominently at the top
- [ ] Shows CoT type with corresponding 2525C/D military symbol icon
- [ ] Coordinate field displays in the user's selected format (MGRS, DD, DMS, UTM)
- [ ] Speed, course, and altitude displayed when available (with unit labels)
- [ ] Timestamp shows both report time and staleness (e.g., "2m ago")
- [ ] Remarks/freetext section with scrollable overflow
- [ ] Action bar with buttons: Navigate To, Send, Edit, Delete
- [ ] Navigate To emits an event with the marker's coordinates for map centering
- [ ] Send opens a share/forward dialog targeting contacts or groups
- [ ] Delete requires a confirmation dialog before removing the marker
- [ ] Supports custom detail fields from CoT detail extensions (key-value pairs)
- [ ] Applies design tokens: surface.panel, text.heading, text.body, text.secondary, icon.action
- [ ] Stale markers (past CoT stale time) show a visual degradation indicator (dimmed or strikethrough)
- [ ] Renders in both DockPane (landscape) and bottom-sheet (portrait) layouts

## Validation
- **Test**: tests/components/test_marker_detail.mjs::renders_callsign_and_type
- **Test**: tests/components/test_marker_detail.mjs::coordinate_format_matches_preference
- **Test**: tests/components/test_marker_detail.mjs::staleness_indicator
- **Test**: tests/components/test_marker_detail.mjs::action_buttons_emit_events
- **Test**: tests/components/test_marker_detail.mjs::delete_requires_confirmation
- **Test**: tests/components/test_marker_detail.mjs::cot_extension_fields
- **Method**: Unit Test, Integration Test
