Feature: Point Dropper and Iconsets
  Source: ATAK Civilian Software User Manual · Placement · Point Dropper

  As a TAK operator
  I need Point Dropper iconsets and Iconset Manager as the Software User Manual describes
  So that markers match ATAK affiliations and custom iconsets

  Background:
    Given the TAK application is running
    And the map view is displayed

  Scenario: Drop a marker from the basic affiliation palette
    # SUM: "The basic Markers symbology affiliations are: Unknown, Neutral, Red and Friendly. Select a marker from the pallet, then tap a location on the map to drop the marker."
    Given the operator selects the [Point Dropper] icon
    When the operator chooses affiliation Friendly
    And the operator taps the map at "38.8977 N, 77.0365 W"
    Then TakIcon should render the friendly marker at that point
    And intent "com.atakmap.android.maps.PLACE" should drop the point
    And a CoT type "a-f-G-U-C" event should be created
    And MarkerDetail should show the generated name

  Scenario: Enter coordinates instead of tapping the map
    # SUM: "To add a marker by manually entering coordinates, choose the marker and long-press a location on the map. A window will open allowing the user to enter the desired coordinates (MGRS, Lat./Long, etc.)."
    Given a Point Dropper affiliation is selected
    When the operator long-presses the map
    And CoordinateDisplay accepts an MGRS or lat/long value
    Then intent "com.atakmap.android.maps.MANUAL_POINT_ENTRY" should open
    And the marker should appear at the entered coordinate
    And a CoT type "a-u-G" event should use that point when Unknown was selected

  Scenario: Switch iconsets from the Iconset Name field
    # SUM: "Swipe in the iconset area or select the [Iconset Name] field, bringing up the Iconset drop-down, to move between iconset pallets."
    Given Point Dropper is open
    When the operator selects a mission-specific iconset
    Then intent "com.atakmap.android.icons.DISPLAY_DROPDOWN" should show that palette
    And TakIcon should list Waypoint, Sensor, and Observation Point icons
    And previously dropped CoT type "a-f-G-U-C" markers should keep their icons

  Scenario: Iconset Manager add and default mapping
    # SUM: "Select the [Iconset Manager] (gear) button to add or delete icontsets or to set the default Marker Mapping."
    Given the operator opens Iconset Manager
    When the operator adds iconset "incident"
    Then intent "com.atakmap.android.icons.ADD_ICONSET" should run
    And intent "com.atakmap.android.icons.DEFAULT_MAPPING_CHANGED" should fire if it is set as default
    And preference "relativeOverlaysScalingRadioList" should still scale overlay icons
