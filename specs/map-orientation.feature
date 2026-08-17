Feature: Compass Interactions
  Source: ATAK Civilian Software User Manual · Compass Interactions

  As a TAK operator
  I need North Up, Track Up, Manual Orientation, and 3D as the Software User Manual describes
  So that the [North Arrow] matches ATAK map orientation

  Background:
    Given the TAK application is running
    And the map view is displayed
    And the [North Arrow] is visible

  Scenario: Tap the compass to cycle North Up and Track Up
    # SUM: "Tapping on the compass icon cycles between North Up and Track Up for Map viewing. Selecting North Up keeps the map locked with North always being at the top of the screen."
    Given the map is in Track Up
    When the operator taps the [North Arrow]
    Then intent "com.atakmap.android.maps.NORTH_UP" should set rotation to 0
    And ToolBar should keep the compass in the upper left
    And CoordinateDisplay should still show the current self coordinate

  Scenario: Track Up rotates with device bearing
    # SUM: "Track Up allows the map to rotate based on the bearing of the device itself, keeping the Self-Marker facing north."
    Given the operator taps until Track Up is selected
    When the device heading changes
    Then intent "com.atakmap.android.maps.TRACK_UP" should rotate the map
    And SkittleMarker should remain the self icon
    And preference "route_track_up_locked_on" should not invert toolbar north-up unless Traditional Navigation Mode is on

  Scenario: Long-press opens Manual Orientation and 3D
    # SUM: "To enable 3D view, long press on the [North Arrow] to call out the additional controls menu and select [3D]."
    Given the operator long-presses the [North Arrow]
    When the operator selects [3D]
    Then intent "com.atakmap.android.maps.TOGGLE_3D" should enable tilt
    And intent "com.atakmap.android.maps.LOCK_TILT" should be available as [3D Lock]
    And a CoT type "a-f-G-U-C" self SA event should be unchanged

  Scenario: Manual Orientation with two-finger rotate
    # SUM: "To place the map into manual orientation, long-press on the Compass and select the Manual Orientation control option. Once in the manual orientation mode, touch the screen with two fingers and simultaneously rotate both fingers and the map will rotate accordingly."
    Given the operator long-pressed the Compass
    When the operator selects Manual Orientation and pivots two fingers
    Then intent "com.atakmap.android.maps.USER_DEFINED_UP" should hold that rotation
    And preference "unitPreferences" should still label the heading
    And a CoT type "a-f-G-U-C" self SA event should be unchanged

  Scenario: Magnetic Up is not trusted without a heading
    # SUM: "Long press the [North Arrow] to call out the additional controls menu where the Manual Rotation/Lock and 3D features are available."
    Given no magnetometer heading is available
    When the operator selects Magnetic Up
    Then intent "com.atakmap.android.maps.MAGNETIC_UP" should not rotate to an untrusted heading
    And preference "unitPreferences" should still govern displayed bearing units
