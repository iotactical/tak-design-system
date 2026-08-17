Feature: Red X Tool
  Source: ATAK Civilian Software User Manual · 5 Red X Tool

  As a TAK operator
  I need a movable Red X that reports coordinate and elevation as the Software User Manual describes
  So that a point can be measured without remaining after ATAK closes

  Background:
    Given the TAK application is running
    And the operator can see the White X on ToolBar

  Scenario: Toggle the Red X into a movable state
    # SUM: "Select the White X on the toolbar to toggle the Red X tool into a movable state."
    Given the Red X is not active
    When the operator selects the White X
    Then intent "com.atakmap.android.user.REDX_CLICK" should mark the tool movable
    And CoordinateDisplay should show location information for the Red X
    And a CoT type "b-m-p-s-p-loc" event should not be persisted as a self marker

  Scenario: Lock the Red X on a map tap
    # SUM: "When first selected, the icon will turn yellow denoting that each time the map is tapped, the Red X will move to that location. When the icon on the toolbar is tapped again, the Red X will lock to its current location, the icon will remain yellow and a lock icon will appear."
    Given the Red X is yellow and movable
    When the operator taps the map then taps the toolbar icon again
    Then intent "com.atakmap.android.user.REDX_CLICK" should lock the Red X
    And RadialMenu should open when the operator selects the Red X on the map
    And CoordinateDisplay should keep the locked coordinate

  Scenario: Long press disables the Red X
    # SUM: "Long press the Red X icon on the toolbar to disable the tool."
    Given the Red X is locked
    When the operator long-presses the Red X icon
    Then intent "com.atakmap.android.user.REDX_LONG_CLICK" should fire
    And intent "com.atakmap.android.user.REDX_OFF" should remove the Red X
    And preference "map_scale_visible" should still show the map scale widget

  Scenario: Red X is not persistent across restart
    # SUM: "Red X is not persistent. When ATAK is closed and then reopened, the Red X will no longer be present."
    Given a locked Red X is on the map
    When ATAK is closed and reopened
    Then intent "com.atakmap.android.user.REDX_OFF" should have left no Red X
    And a CoT type "a-f-G-U-C" self SA marker should still be placed
    And SkittleMarker should render the Self-Marker only
