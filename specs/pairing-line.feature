Feature: Pairing Line
  Source: ATAK Civilian Software User Manual · Range Tools · Range & Bearing Line

  As a TAK operator
  I need pairing lines between two map items as ATAK uses them from radials and Bloodhound
  So that a relationship stays visible without creating a route

  Background:
    Given the TAK application is running
    And markers "BLUE-01" and "BLUE-02" exist on the map

  Scenario: Create a pairing line between two friendlies
    # SUM: "The [R&B Line] icon allows the user to calculate the distance between two locations on a map, calculate the distance between an object on the map and another point on the map, or calculate the distance between a point on the map and the [Self-marker]."
    Given the operator selects "BLUE-01"
    When the operator chooses pairing from RadialMenu
    And the operator selects "BLUE-02"
    Then intent "com.atakmap.android.maps.PAIRING_LINE" should connect the two uids
    And RangeBearing should show the span
    And each endpoint should keep CoT type "a-f-G-U-C"

  Scenario: Pairing line follows moving endpoints
    # SUM: "If either point moves, the green widget in the lower left will show the updated information."
    Given a pairing line exists between "BLUE-01" and "BLUE-02"
    When "BLUE-02" updates its CoT type "a-f-G-U-C" position
    Then the pairing line should follow that uid
    And intent "com.atakmap.android.maps.PAIRING_LINE" should remain associated with both endpoints

  Scenario: Pairing line from self
    # SUM: "Select either end of the R&B Line to display the R&B Line end point Radial."
    Given the operator selects the Self-Marker
    When the operator pairs to "BLUE-01"
    Then intent "com.atakmap.android.maps.PAIRING_LINE_SELF" should start at self
    And SkittleMarker should remain the from-icon
    And preference "dispatchLocationCotExternal" should still publish self SA

  Scenario: Refuse a pairing line to the same item
    # SUM: "Once endpoints are set, the line is stationary."
    Given the operator selects "BLUE-01"
    When the operator chooses the same marker as the other end
    Then intent "com.atakmap.android.maps.PAIRING_LINE" should not create a zero-length line
    And DialogPanel should require two distinct items
    And no CoT type "u-rb-a" event should be added
