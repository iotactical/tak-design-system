Feature: Go To Coordinate
  As a TAK operator
  I need to pan the map to a typed coordinate
  So that I can jump to a known point without dropping a marker first

  Background:
    Given the TAK application is running
    And the map view is displayed

  Scenario: Go to decimal degrees
    Given the operator opens Go To
    When the operator enters "38.8977, -77.0365"
    And the operator confirms
    Then the map viewport should center on that point
    And CoordinateDisplay should show the destination

  Scenario: Go to MGRS
    Given the operator opens Go To
    When the operator enters a valid MGRS string for the current datum
    And the operator confirms
    Then the map viewport should center on the MGRS point
    And an optional temporary point may appear at the destination

  Scenario: Place a marker at the go-to point
    Given the operator has gone to "38.8977, -77.0365"
    When the operator chooses Place Marker at this location
    Then a marker should be created at those coordinates
    And MarkerDetail should open for the new marker

  Scenario: Reject an unparseable coordinate
    Given the operator opens Go To
    When the operator enters "not-a-coordinate"
    And the operator confirms
    Then the map viewport should not pan
    And the operator should see "Invalid coordinate"
