Feature: Radial Menus
  Source: ATAK Civilian Software User Manual · Placement · Radial Menus

  As a TAK operator
  I need marker radials as the Software User Manual describes for Unknown, Neutral, Red, Friendly, and Spot Map
  So that Details, Send, R&B Line, and communication options match ATAK

  Background:
    Given the TAK application is running
    And a Friendly marker "RP BRAVO" exists on the map

  Scenario: Open the Friendly object radial
    # SUM: "The options available for Friendly Object Markers are: Delete, Polar Coordinate Entry, Fine Adjust/Enter Coordinate/MGRS Location, R&B Line, Lock On, Video, Contact Card, Custom Threat Rings, Tracking Breadcrumbs and Details."
    Given the operator selects "RP BRAVO"
    When RadialMenu opens
    Then intent "com.atakmap.android.maps.SHOW_MENU" should display Delete, Polar, Fine Adjust, R&B, Lock On, Video, Contact Card, Breadcrumbs, and Details
    And MarkerDetail should open from Details
    And a CoT type "a-f-G-U-C" event should remain associated with that uid

  Scenario: Details Send and Auto Send
    # SUM: "Once all the desired modifications have been made, the Marker can be sent to other network members using [Send]. ... Select the [Auto Send] option to broadcast the marker to other TAK users on the network, with updates automatically sent about once every 60 seconds."
    Given MarkerDetail is open for "RP BRAVO"
    When the operator selects Auto Send
    Then preference "hostileUpdateDelay" should govern the repeat interval for automatic broadcast
    And a CoT type "a-f-G-U-C" update should be transmitted on that interval
    And ConnectionStatus should remain Connected

  Scenario: Delete from the radial
    # SUM: "The options available for Unknown Object Markers are: Delete, Polar Coordinate Entry, Fine Adjust/Enter Coordinate/MGRS Location, R&B Line, Lock On, Tasking, Custom Threat Rings, Tracking Breadcrumbs and Details."
    Given RadialMenu is open on "RP BRAVO"
    When the operator chooses Delete and confirms
    Then intent "com.atakmap.android.maps.REMOVE" should remove the marker
    And RadialMenu should close
    And intent "com.atakmap.android.maps.HIDE_MENU" should fire

  Scenario: Dismiss the radial without an action
    # SUM: "Select [Details] on the marker radial to make desired modifications, including: Coordinate, Elevation, Name, Type and Remarks."
    Given RadialMenu is open
    When the operator taps outside the menu
    Then intent "com.atakmap.android.maps.HIDE_MENU" should close RadialMenu
    And the CoT type "a-f-G-U-C" marker should remain
