Feature: Contour Lines
  Source: ATAK Civilian Software User Manual · 23 Elevation Tools · Contour Lines

  As a TAK operator
  I need generated contour lines in the current window as the Software User Manual describes
  So that elevation intervals can be shown without regenerating for color or major/minor toggles

  Background:
    Given the TAK application is running
    And the operator selects Elevation Tools then the Contour tab

  Scenario: Generate contours when the map scale is valid
    # SUM: "The Generate button becomes active when the map is zoomed to the correct scale (Scale varies based on screen resolution). Modify fields as desired and then select the Generate button."
    Given the map is zoomed to a supported scale
    When the operator selects Generate
    Then ProgressBar should show percent complete
    And MapOverlay should render contour lines in the current window
    And preference "prefs_dted_visible" should still control elevation data

  Scenario: Toggle major and minor lines without regenerating
    # SUM: "Major Lines and Minor Lines can be toggled on or off without having to regenerate the contour lines."
    Given contours have been generated
    When the operator toggles Major Lines off
    Then MapOverlay should hide major lines only
    And intent "com.atakmap.android.maps.REFRESH_HIERARCHY" should not delete the contour set
    And a CoT type "a-f-G-U-C" self SA event should be unchanged

  Scenario: Changing interval requires Generate
    # SUM: "If the Interval is modified, select the Generate button to regenerate the contour lines with the new value."
    Given contours exist at a 20 meter interval
    When the operator changes Interval and selects Generate
    Then ProgressBar should run again
    And MapOverlay should draw the new interval
    And preference "unitPreferences" should keep meters or feet matching the Units field

  Scenario: Generate stays inactive when zoomed out too far
    # SUM: "Note: Viewsheds and contour lines do not persist upon ATAK quit/restart."
    Given the map scale is too coarse
    When the operator opens the Contour tab
    Then Generate should stay inactive
    And intent "com.atakmap.android.elev.ViewShedReceiver.SHOW_VIEWSHED" should not be used to invent contours
    And CoordinateDisplay should still show the map center

  Scenario: Contours are discarded on restart
    # SUM: "Viewsheds and contour lines do not persist upon ATAK quit/restart."
    Given contours are displayed
    When ATAK is quit and restarted
    Then MapOverlay should show no generated contours
    And DockPane should require Generate again
    And preference "map_scale_visible" should still display the scale
