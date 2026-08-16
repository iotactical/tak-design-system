Feature: GPS, Callsign, and Self Coordinate Overlay
  Source: ATAK Civilian Software User Manual · ATAK Civilian Overview

  As a TAK operator
  I need GPS status and the self coordinate overlay as the Software User Manual describes
  So that MGRS, DD, and related formats match Unit Display Format Preferences

  Background:
    Given the TAK application is running

  Scenario: Display the self coordinate overlay
    # SUM: "The Map Scale displays a 1 inch to X mi/km reference on the map. The scale adjusts with the map when zoomed in and out."
    Given GPS reports a 3D fix
    And preference "show_self_coordinate_overlay" is true
    When the map view is displayed
    Then CoordinateDisplay should show the self coordinate
    And GPSStatus should show a 3D fix
    And preference "map_scale_visible" should show the scale bar
    And a CoT type "a-f-G-U-C" SA event should include that point

  Scenario: Go To tabs cover MGRS, DD, DM, DMS, UTM, and ADDR
    # SUM: "Select from the [MGRS] (military grid reference system), [DD] (decimal degrees), [DM] (degrees - minutes), [DMS] (degrees-minutes-seconds), [UTM] (Universal Transverse Mercator) or [ADDR] tabs on the Go To interface and enter the location data of interest."
    Given the operator opens [Go To]
    When the operator cycles CoordinateDisplay among MGRS and DD
    Then preference "unitPreferences" should select the displayed format
    And intent "com.atakmap.android.user.GO_TO" should parse that tab's entry

  Scenario: GPS Option preference
    # SUM: "The first time ATAK is opened... Finally, the user can manually place the Self-Marker if GPS location is not enabled by following the instructions located in the lower right corner."
    Given preference "mockingOption" is internal GPS
    When a fix arrives
    Then intent "com.atakmap.android.location.LOCATION_INIT" should be reflected in GPSStatus
    And preference "useGPSTime" should control whether event time uses GPS time

  Scenario: No-fix does not treat last coordinates as current
    # SUM: "Alerts and notifications are displayed in the lower left of the map interface."
    Given GPS reports no fix
    When the HUD updates
    Then GPSStatus should display no fix
    And CoordinateDisplay should not present the last fix as current
    And no new CoT type "a-f-G-U-C" position should be reported while preference "dispatchLocationCotExternal" is bound to a valid fix
