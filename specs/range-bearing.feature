Feature: Range and Bearing Measurement
  As a TAK operator
  I need to measure range and bearing between two points
  So that I can report distance and azimuth without leaving the map

  Background:
    Given the TAK application is running
    And the map view is displayed

  Scenario: Measure between two map points
    Given the operator selects the Range and Bearing tool
    When the operator taps point A at "38.8977 N, 77.0365 W"
    And the operator taps point B at "38.9077 N, 77.0365 W"
    Then a range-bearing line should connect A and B
    And the RangeBearing component should display slant range and magnetic bearing
    And the measurement should remain until the operator dismisses it

  Scenario: Measure from self to a selected marker
    Given a marker "RP BRAVO" exists on the map
    And the self marker has a valid GPS fix
    When the operator chooses Range and Bearing from the radial menu of "RP BRAVO"
    Then the RangeBearing component should use the self marker as point A
    And "RP BRAVO" as point B
    And the displayed range should update as the self position updates

  Scenario: Switch between true and magnetic bearing
    Given a range-bearing line is displayed
    When the operator toggles Magnetic
    Then the bearing readout should use magnetic declination
    When the operator toggles True
    Then the bearing readout should use true north

  Scenario: Cancel measurement with only one point placed
    Given the operator has placed only point A
    When the operator cancels the Range and Bearing tool
    Then no range-bearing line should remain on the map
    And RangeBearing should not display a stale measurement
