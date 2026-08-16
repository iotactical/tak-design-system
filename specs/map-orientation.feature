Feature: Map Orientation and Compass
  As a TAK operator
  I need to switch among north-up track-up and 3D views
  So that the map matches how I am holding the device

  Background:
    Given the TAK application is running
    And the map view is displayed
    And the device heading is 127 degrees true

  Scenario: Lock north-up
    Given the map is in track-up
    When the operator selects North Up
    Then the map rotation should be 0 degrees
    And CompassHeading should display the device heading independently of map rotation

  Scenario: Follow track-up
    Given the operator selects Track Up
    When the device heading changes to 45 degrees
    Then the map should rotate so track is up
    And the self marker should remain upright relative to the device

  Scenario: Toggle 3D tilt
    Given the map is 2D north-up
    When the operator toggles 3D
    Then the map should allow tilt
    When the operator toggles 3D off
    Then tilt should return to 0
    And north-up should be restored if it was selected

  Scenario: Magnetic-up with no compass calibration
    Given the magnetometer reports uncalibrated
    When the operator selects Magnetic Up
    Then the map should not rotate to an untrusted heading
    And the operator should see a compass calibration prompt
