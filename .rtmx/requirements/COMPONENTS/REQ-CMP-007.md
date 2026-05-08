# REQ-CMP-007: RoutePlanner

## Description
The RoutePlanner component provides waypoint management, route visualization, and navigation assistance within TAK. In ATAK it renders as a DockPane containing a sortable waypoint list with distance/ETA calculations, turn-by-turn guidance, and route drawing on the map. Cross-platform consistency is essential because route plans are shared between TAK clients via CoT, and every operator must see and interact with the same route data using the same UI patterns.

## Acceptance Criteria
- [ ] Displays an ordered list of waypoints with name, coordinate, and leg distance
- [ ] Total route distance and estimated time of arrival (ETA) shown in the header
- [ ] Waypoints are reorderable via drag-and-drop
- [ ] Add waypoint button appends a new point; tap-on-map mode sets its coordinate
- [ ] Delete waypoint via swipe or context action with confirmation
- [ ] Each waypoint row shows a sequential index number and optional icon/type
- [ ] Leg distance between consecutive waypoints is calculated and displayed
- [ ] Supports speed input for ETA calculation (default: walking, driving, flight profiles)
- [ ] Route line renders on the map connecting waypoints in order
- [ ] Reverse route action flips the waypoint order
- [ ] Export route as CoT route message for sharing
- [ ] Applies design tokens: surface.panel, text.primary, text.secondary, color.route.line
- [ ] Waypoint coordinate display follows the user's selected coordinate format (MGRS, DD, etc.)

## Validation
- **Test**: tests/components/test_route_planner.mjs::renders_waypoint_list
- **Test**: tests/components/test_route_planner.mjs::drag_reorder_waypoints
- **Test**: tests/components/test_route_planner.mjs::total_distance_calculation
- **Test**: tests/components/test_route_planner.mjs::eta_with_speed_profiles
- **Test**: tests/components/test_route_planner.mjs::reverse_route
- **Method**: Unit Test, Numerical Accuracy Test
