Feature: Self-Marker
  Source: ATAK Civilian Software User Manual · Placement · Self-Marker

  As a TAK operator
  I need the Self-Marker and radial the Software User Manual describes
  So that my position, team, and self tools match ATAK

  Background:
    Given the TAK application is running
    And preference "locationCallsign" is "SELF-01"
    And preference "locationTeam" is "Cyan"
    And preference "atakRoleType" is "Team Member"

  Scenario: Self-Marker appears as an arrowhead at the current location
    # SUM: "By default the Self-Marker is displayed as a blue arrowhead with a white outline at the user's current location."
    Given GPS reports a valid 3D fix
    When the map view is displayed
    Then SkittleMarker should render the self arrowhead at the GPS point
    And intent "com.atakmap.android.map.SELF_LOCATION_SPECIFIED" should apply the self position
    And a CoT type "a-f-G-U-C" SA event should use preference "locationCallsign"
    And GPSStatus should show a 3D fix

  Scenario: Customize Self-Marker color and size from Display Preferences
    # SUM: "The appearance of the Self-Marker can be customized by navigating to Additional Tool and Plugins > Settings > Display Preferences > Color Tinting > My Location Color/Size."
    Given the self marker is visible
    When the operator sets preference "my_location_icon_color" to a custom main and outline color
    Then SkittleMarker should tint the self icon from that preference
    And intent "com.atakmap.android.maps.SNAP_TO_SELF" should still center on the same icon
    And the CoT type "a-f-G-U-C" SA event should keep preference "locationTeam"

  Scenario: Open the Self-Marker radial
    # SUM: "The radial options available when the user selects the Self-Marker are (clockwise from bottom): User Details, Compass Overlay, Polar Coordinate Entry, Fine Adjust, GPS Error Overlay, R&B Line, MSD, Lock to Self, Tracking Breadcrumbs, and Place a Marker at the user's current location."
    Given the Self-Marker is on the map
    When the operator selects the Self-Marker
    Then RadialMenu should show Details, Compass Overlay, Polar Coordinate Entry, Fine Adjust, GPS Error, R&B Line, Lock to Self, Tracking Breadcrumbs, and Place Marker
    And intent "com.atakmap.android.maps.SHOW_MENU" should open that radial
    And GPSStatus should still reflect the current fix

  Scenario: Hide my current position
    # SUM: "Finally, the user can manually place the Self-Marker if GPS location is not enabled by following the instructions located in the lower right corner."
    Given preference "dispatchLocationHidden" is true
    When the SA reporting interval elapses
    Then no CoT type "a-f-G-U-C" event should be transmitted
    And preference "dispatchLocationCotExternal" should remain false
    And intent "com.atakmap.android.maps.SNAP_TO_SELF" should not invent a GPS fix
    And GPSStatus should display no fix when mocking is off
