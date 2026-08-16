Feature: Import and Export of KML and CoT
  As a TAK operator
  I need to import and export KML KMZ and CoT files
  So that map data can move between TAK and other geospatial tools

  Background:
    Given the TAK application is running
    And the operator has read access to the local file store

  Scenario: Import KML placemarks
    Given file "sector.kml" contains 5 placemarks
    When the operator imports "sector.kml"
    Then 5 markers should appear on the map
    And each marker should keep the KML name as its label

  Scenario: Import a KMZ with overlay imagery
    Given file "airfield.kmz" contains a ground overlay
    When the operator imports "airfield.kmz"
    Then the ground overlay should appear as a map layer
    And the overlay should appear in the overlay hierarchy

  Scenario: Export selected items as CoT XML
    Given the operator has selected 3 markers
    When the operator exports as CoT
    Then a CoT XML file should be written
    And the file should contain 3 events
    And each event should round-trip with uid type and point

  Scenario: Reject malformed KML
    Given file "broken.kml" is not well-formed XML
    When the operator attempts to import "broken.kml"
    Then import should fail
    And the map should be unchanged
    And the operator should see "Invalid KML"
