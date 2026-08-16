Feature: Range and Bearing Tool
  Source: ATAK Civilian Software User Manual · Range Tools · Range & Bearing Line

  As a TAK operator
  I need R&B Line, dynamic pin, and units as the Software User Manual describes
  So that azimuth, distance, and slant range match ATAK

  Background:
    Given the TAK application is running
    And the operator selects the [Range & Bearing] icon so the tools sit on ToolBar

  Scenario: Toggle R&B Line and tap two points
    # SUM: "Select the [R&B Line] icon on the toolbar to toggle on (green) and off (white). When green, tap a point to measure from or long press to measure from the Self-marker to that point."
    Given the [R&B Line] icon is toggled green
    When the operator taps point A then point B
    Then RangeBearing should display azimuth and distance
    And a CoT type "u-rb-a" line should connect the endpoints
    And intent "com.atakmap.android.maps.SHOW_RAB_LINE_DROPDOWN" should be available from the line

  Scenario: Long-press measures from the Self-Marker
    # SUM: "When green, tap a point to measure from or long press to measure from the Self-marker to that point."
    Given the [R&B Line] icon is green
    When the operator long-presses a map point
    Then RangeBearing should use the Self-Marker as the from-point
    And SkittleMarker should remain the self icon
    And intent "com.atakmap.android.toolbars.RangeAndBearing.TOGGLE_SLANT_RANGE" should control slant versus ground range

  Scenario: Pin a Dynamic R&B Line
    # SUM: "When the desired location is established select at the center of the line and use the [Pin] button on the radial menu to lock the bearing line. This pinned R&B Line will remain after the Dynamic R&B Line is toggled off."
    Given a Dynamic R&B Line is unlocked
    When the operator selects [Pin] on RadialMenu
    Then intent "com.atakmap.android.toolbars.RangeAndBearing.PIN_DYNAMIC" should lock the line
    And the CoT type "u-rb-a" item should persist after the toolbar toggle goes white

  Scenario: Bearing and distance units follow Unit Display Format Preferences
    # SUM: "Select the Angle Bearing Units radial to display additional bearing unit options, including Degrees Grid, Mils Grid, Degrees Magnetic, Mils Magnetic, Degrees True or Mils True."
    Given an R&B Line is displayed
    When the operator chooses Degrees Magnetic
    Then intent "com.atakmap.android.toolbars.RangeAndBearing.BEARING_UNITS" should apply magnetic
    And preference "unitPreferences" should persist the selection
    And RangeBearing should redraw the label
