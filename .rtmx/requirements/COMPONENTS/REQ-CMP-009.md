# REQ-CMP-009: StatusIndicators Component Set

## Description
StatusIndicators are a family of small, always-visible widgets that display device and network state in ATAK. This includes ConnectionStatus (TAK Server link state), GPSStatus (fix quality, satellite count, accuracy), and BatteryStatus. These indicators typically appear in the NavBar or a status bar area. Cross-platform consistency ensures operators can instantly read system health on any TAK client without learning different iconography or color conventions.

## Acceptance Criteria

### ConnectionStatus
- [ ] Displays one of: connected, disconnected, reconnecting, error states
- [ ] Uses distinct icon and color for each state (green/yellow/red/gray mapped to status tokens)
- [ ] Shows server name or address as a tooltip/label on hover or long-press
- [ ] Reconnecting state shows a pulse or spin animation
- [ ] Emits onStatusChange event when connection state transitions

### GPSStatus
- [ ] Displays fix type: no fix, 2D fix, 3D fix, DGPS
- [ ] Shows satellite count as a numeric badge or bar indicator
- [ ] Displays horizontal accuracy (CEP) in meters
- [ ] Icon color reflects fix quality: red (no fix), yellow (2D/poor), green (3D/good)
- [ ] Tapping the indicator opens a detail popover with full GPS diagnostics

### BatteryStatus
- [ ] Displays battery percentage with a filled-bar icon
- [ ] Color transitions: green above 50%, yellow 20-50%, red below 20%
- [ ] Shows charging indicator when plugged in

### Shared
- [ ] All indicators fit within a 24dp x 24dp bounding box at default density
- [ ] Applies design tokens: icon.status.connected, icon.status.disconnected, icon.status.warning, icon.status.error
- [ ] Updates reactively when underlying data source changes
- [ ] Accessible: each indicator has an aria-label describing its current state

## Validation
- **Test**: tests/components/test_status_indicators.mjs::connection_status_states
- **Test**: tests/components/test_status_indicators.mjs::gps_fix_quality_colors
- **Test**: tests/components/test_status_indicators.mjs::gps_satellite_count_display
- **Test**: tests/components/test_status_indicators.mjs::battery_percentage_thresholds
- **Test**: tests/components/test_status_indicators.mjs::accessibility_labels
- **Method**: Unit Test, State Machine Test
