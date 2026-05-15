# REQ-SITE-014: Step-by-Step Plotting Instructions Widget

## Description
When a control measure is selected in the Control Measures panel, a floating instruction widget appears at the top of the map area guiding the user through point placement. The widget shows the current step ("Click to place point 1", "Click to place point 2", etc.), the total required and maximum points, and updates after each click. For fixed-point-count graphics (e.g., `minPoints: 3, maxPoints: 3`), the widget shows "Point 1 of 3". For open-ended graphics (`maxPoints: 0`), it shows "Point 1 (2+ required)". When the minimum point count is reached, the widget transitions to "Click to add more points, or press Enter to finish" for open-ended graphics, or "Complete" with a brief fade for fixed-count graphics. The widget is dismissible and does not obscure the map interaction.

## Acceptance Criteria
- [ ] A floating widget appears at the top-center of the map area when a control measure is selected and the user has not yet met the minimum point count.
- [ ] The widget displays: the selected graphic name, current point index, and total required.
- [ ] For fixed-count graphics (`maxPoints > 0`), the widget shows "Click to place point N of M".
- [ ] For open-ended graphics (`maxPoints === 0`), the widget shows "Click to place point N (M+ required)".
- [ ] After each click, the point index increments and the widget text updates.
- [ ] When `minPoints` is satisfied, the widget changes to a "success" style indicating the graphic is rendering.
- [ ] For open-ended graphics at or above `minPoints`, the widget shows "Click to add more points" with the current count.
- [ ] The widget does not capture pointer events over the map (uses `pointer-events: none` or is positioned to not overlap the click target).
- [ ] The widget disappears when no control measure is selected.

## Validation
- **Test**: tests/site/test_control_measures.mjs::test_plotting_widget_shows_step
- **Test**: tests/site/test_control_measures.mjs::test_plotting_widget_updates_on_click
- **Test**: tests/site/test_control_measures.mjs::test_plotting_widget_success_state
- **Method**: Integration Test
