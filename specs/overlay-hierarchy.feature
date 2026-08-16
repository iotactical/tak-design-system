Feature: Overlay Manager
  Source: ATAK Civilian Software User Manual · Overlay Manager

  As a TAK operator
  I need Overlay Manager categories, visibility circles, and search as the Software User Manual describes
  So that Teams, Alerts, Markers, Data Packages, Navigation, and Shapes can be shown or hidden

  Background:
    Given the TAK application is running
    And the operator selects the [Overlay Manager] icon

  Scenario: Visibility radio buttons fill green, half, or hollow
    # SUM: "Users may turn visibility of any category on and off through the circular radio buttons. When the circle appears green, the corresponding layer objects are visible. A half-filled circle indicates that the subcategory has some, but not all, objects visible. A hollow circle corresponds to layer that is not visible."
    Given category Markers contains 4 visible items
    When the operator hides category Markers
    Then MapOverlay should stop rendering those markers
    And intent "com.atakmap.android.maps.REFRESH_HIERARCHY" should update the list
    And CoT type "a-f-G-U-C" items in that category should remain in the database

  Scenario: Selecting an item pans the map and opens its radial
    # SUM: "When a displayed item in a specific category is selected, the map view will pan to that item and its radial will display."
    Given Markers lists "RP BRAVO"
    When the operator selects "RP BRAVO"
    Then intent "com.atakmap.android.maps.FOCUS" should pan to that item
    And RadialMenu should open
    And MarkerDetail should be reachable from Details

  Scenario: Show All filters by current map view
    # SUM: "If the [Show All] checkbox is left unchecked, Overlay Manager will filter map items listed based on the current map view."
    Given Show All is unchecked
    When the operator pans so that a marker leaves the viewport
    Then ListView should omit that marker from Overlay Manager
    And preference "overlay_manager_width_height" should still size the dropdown

  Scenario: Multi-select delete does not remove the Self-Marker
    # SUM: "To delete an existing overlay item, select the [Multi-Select] icon. Items may be selected as a category (Markers, Shapes, File Overlays, etc.) or individually (specific neutral marker, for instance)."
    Given the operator multi-selects Markers
    When the operator selects [Delete]
    Then intent "com.atakmap.android.maps.CLEAR_HIERARCHY" should not remove the Self-Marker
    And a CoT type "a-f-G-U-C" self SA event should continue
    And intent "com.atakmap.android.maps.CLOSE_HIERARCHY" should close the manager if the operator dismisses it
