Feature: GPS Location Status and Coordinate Formats
  As a TAK operator
  I need GPS status and coordinates in formats used on the ATAK HUD
  So that I can report position without converting by hand

  Background:
    Given the TAK application is running
    And GPS is reporting a valid 3D fix

  Scenario: Display GPS status on the HUD
    Given GPS reports 8 satellites and accuracy 5 meters
    When the map view is displayed
    Then GPSStatus should show a 3D fix
    And the accuracy should be available to the operator

  Scenario: Cycle coordinate display formats
    Given the current position is "38.8977 N, 77.0365 W"
    When the operator cycles CoordinateDisplay to MGRS
    Then CoordinateDisplay should show an MGRS string for that point
    When the operator cycles to UTM
    Then CoordinateDisplay should show a UTM string for that point
    When the operator cycles to Decimal Degrees
    Then CoordinateDisplay should show decimal latitude and longitude

  Scenario: Copy current coordinates
    Given CoordinateDisplay is showing MGRS
    When the operator copies the displayed coordinates
    Then the clipboard should contain the same MGRS string
    And the format should match what is on screen

  Scenario: Show no-fix without fabricating coordinates
    Given GPS reports no fix
    When the map HUD updates
    Then GPSStatus should display "no fix"
    And CoordinateDisplay should not present the last fix as current
