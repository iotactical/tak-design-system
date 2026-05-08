# REQ-CMP-005: RangeBearing Widget

## Description
The RangeBearing widget displays distance and bearing information between two or more points on the map. In ATAK this appears as arc lines, range rings, and bearing indicators rendered as map overlays. It is used for fire support coordination, navigation, and situational awareness. Cross-platform consistency ensures that range/bearing graphics, label placement, and unit formatting are identical regardless of the TAK client in use.

## Acceptance Criteria
- [ ] Renders a line between two map points with distance and bearing labels
- [ ] Supports range rings (concentric circles) at configurable intervals
- [ ] Bearing is displayed in degrees true and/or degrees magnetic (user preference)
- [ ] Distance labels support units: meters, kilometers, feet, miles, nautical miles
- [ ] Labels auto-rotate to follow the bearing line orientation
- [ ] Line style is configurable: solid, dashed, dotted with color and width tokens
- [ ] Renders an arrowhead or tick at the destination end to indicate direction
- [ ] Updates dynamically when either endpoint moves (e.g., tracking a moving marker)
- [ ] Multiple range/bearing lines can coexist without visual collision (label offset logic)
- [ ] Applies design tokens: color.rangeline, color.rangelabel.bg, font.family.mono for values
- [ ] Bearing accuracy displays to one decimal place (e.g., 045.3 degrees)
- [ ] Distance accuracy adjusts by magnitude: meters below 1km, km above, with one decimal

## Validation
- **Test**: tests/components/test_range_bearing.mjs::renders_line_with_labels
- **Test**: tests/components/test_range_bearing.mjs::range_rings_at_intervals
- **Test**: tests/components/test_range_bearing.mjs::unit_conversion_accuracy
- **Test**: tests/components/test_range_bearing.mjs::dynamic_update_on_endpoint_move
- **Test**: tests/components/test_range_bearing.mjs::multiple_lines_no_label_collision
- **Method**: Unit Test, Numerical Accuracy Test
