# REQ-CMP-010: MapOverlay Widgets

## Description
MapOverlay widgets are persistent graphical elements rendered on top of the map canvas in ATAK. This component set includes the MapScaleBar (dynamic distance scale), CompassHeading (bearing/heading indicator), and ElevationProfile (terrain cross-section graph). These overlays provide essential spatial awareness and must render consistently across all TAK platforms so operators trust the displayed measurements regardless of client.

## Acceptance Criteria

### MapScaleBar
- [ ] Renders a horizontal bar with distance label that updates as map zoom changes
- [ ] Scale bar length adjusts to represent a round distance value (1, 2, 5, 10, 20, 50, etc.)
- [ ] Supports unit systems: metric (m/km), imperial (ft/mi), nautical (nm)
- [ ] Positioned at a configurable map corner (default: bottom-left)
- [ ] Bar has tick marks at each end and a centered distance label
- [ ] Minimum bar width of 60dp; maximum of 200dp

### CompassHeading
- [ ] Displays current device heading or map rotation as a compass rose or arrow
- [ ] Numeric heading value displayed in degrees (0-360)
- [ ] Supports true north and magnetic north with declination offset
- [ ] Tapping toggles between north-up and track-up map orientation
- [ ] Smooth rotation animation follows heading changes (no jumps)
- [ ] Positioned at a configurable map corner (default: top-right)

### ElevationProfile
- [ ] Renders a terrain cross-section graph along a selected path or route
- [ ] X-axis shows cumulative distance; Y-axis shows elevation
- [ ] Displays min, max, and current-cursor elevation values
- [ ] Highlights the current position on the profile with a vertical marker
- [ ] Supports drag-to-inspect: dragging along the profile moves a marker on the map
- [ ] Graph area uses a semi-transparent background to remain visible over the map
- [ ] Collapsible to a single-line summary (total climb, total descent)

### Shared
- [ ] All overlays use design tokens: surface.overlay.bg, text.overlay, border.overlay
- [ ] Overlays do not intercept map pan/zoom gestures in areas outside their bounds
- [ ] Render at the correct resolution on standard and high-DPI displays

## Validation
- **Test**: tests/components/test_map_overlays.mjs::scale_bar_updates_on_zoom
- **Test**: tests/components/test_map_overlays.mjs::scale_bar_round_values
- **Test**: tests/components/test_map_overlays.mjs::compass_heading_rotation
- **Test**: tests/components/test_map_overlays.mjs::compass_north_up_toggle
- **Test**: tests/components/test_map_overlays.mjs::elevation_profile_renders_path
- **Test**: tests/components/test_map_overlays.mjs::elevation_drag_to_inspect
- **Method**: Unit Test, Visual Regression Test, Numerical Accuracy Test
