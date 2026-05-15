# REQ-SITE-015: Multi-Graphic Session with Graphics Log

## Description
The Control Measures panel supports plotting multiple graphics in a single session. When the user finishes placing points for one control measure (meets minPoints and selects a new graphic or presses Enter), the rendered graphic persists on the map and is added to a graphics log panel on the right side. The user can then select another control measure and plot additional graphics on the same map. The graphics log lists all plotted graphics with their name, affiliation, point count, and a delete button. Deleting a graphic removes it from both the log and the map. All graphics are composited into a single GeoJSON FeatureCollection for the map source. The log panel is scrollable and shows graphics in chronological order (newest at top).

## Acceptance Criteria
- [ ] After a graphic meets its minimum point count and the user selects a new entity (or presses Enter), the current graphic is "committed" to the session.
- [ ] Committed graphics persist on the map when a new entity is selected.
- [ ] A graphics log panel appears on the right side of the map area showing all committed graphics.
- [ ] Each log entry shows: graphic name, affiliation icon/label, point count, and a delete button.
- [ ] Clicking delete removes the graphic from both the log and the map.
- [ ] The map renders all committed graphics plus the in-progress graphic as a merged GeoJSON FeatureCollection.
- [ ] The log is scrollable with newest entries at the top.
- [ ] A "Clear All" button at the top of the log removes all committed graphics.
- [ ] Undo/redo (Ctrl+Z / Ctrl+Shift+Z) applies only to the in-progress graphic, not committed ones.
- [ ] At least 10 graphics can be plotted in a single session without performance degradation.

## Validation
- **Test**: tests/site/test_control_measures.mjs::test_multi_graphic_commit
- **Test**: tests/site/test_control_measures.mjs::test_multi_graphic_delete
- **Test**: tests/site/test_control_measures.mjs::test_multi_graphic_merged_geojson
- **Test**: tests/site/test_control_measures.mjs::test_multi_graphic_clear_all
- **Method**: Integration Test
