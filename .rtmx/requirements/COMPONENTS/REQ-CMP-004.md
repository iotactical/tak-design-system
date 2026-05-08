# REQ-CMP-004: CoordinateDisplay

## Description
The CoordinateDisplay is a persistent map overlay showing the current cursor or center-of-screen coordinates. ATAK displays coordinates in MGRS, latitude/longitude (DD, DM, DMS), and UTM formats using a monospace font for alignment. This component is critical for tactical operations where precise position reporting is required. Cross-platform consistency ensures that coordinate strings are formatted identically and positioned consistently across all TAK clients.

## Acceptance Criteria
- [ ] Displays coordinates in a fixed overlay position (default: bottom-center of map)
- [ ] Supports coordinate formats: MGRS, DD (decimal degrees), DM (degrees minutes), DMS (degrees minutes seconds), UTM
- [ ] Format is selectable at runtime via a tap-to-cycle or dropdown
- [ ] Uses a monospace font token (font.family.mono) for digit alignment
- [ ] Updates in real time as the map pans or cursor moves (throttled to 10Hz max)
- [ ] Displays altitude/elevation when available, with unit toggle (meters/feet)
- [ ] Background uses a semi-transparent dark surface to maintain readability over any map tile
- [ ] Text color uses text.coordinate token (high-contrast against surface)
- [ ] Font size scales with the global text size preference but has a minimum of 12sp
- [ ] Copy-to-clipboard on long-press or right-click, with brief visual confirmation
- [ ] Truncates gracefully if the viewport is narrower than the coordinate string
- [ ] MGRS formatting matches MIL-STD-2401 (grid zone, 100km square, easting, northing)

## Validation
- **Test**: tests/components/test_coordinate_display.mjs::renders_mgrs_format
- **Test**: tests/components/test_coordinate_display.mjs::cycles_through_formats
- **Test**: tests/components/test_coordinate_display.mjs::copy_to_clipboard_on_long_press
- **Test**: tests/components/test_coordinate_display.mjs::altitude_unit_toggle
- **Test**: tests/components/test_coordinate_display.mjs::mgrs_mil_std_2401_compliance
- **Method**: Unit Test, Format Validation Test
