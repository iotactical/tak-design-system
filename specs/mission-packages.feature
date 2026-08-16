Feature: Mission Package Import and Export
  As a TAK operator
  I need to import and export ATAK mission packages
  So that a set of markers layers and files can move as one unit

  Background:
    Given the TAK application is running
    And the operator has read access to the local file store

  Scenario: Import a mission package
    Given a mission package "op-bravo.zip" contains 3 CoT events and 1 overlay
    When the operator selects Import Data
    And the operator chooses "op-bravo.zip"
    Then the 3 CoT events should appear on the map
    And the overlay should appear in the overlay hierarchy
    And the package should be listed under Mission Packages

  Scenario: Export selected map items as a mission package
    Given the operator has selected 2 markers and 1 route on the map
    When the operator chooses Mission Package Save
    And the operator names the package "exfil-plan"
    Then a zip should be written containing those 3 items
    And the zip should include a manifest
    And the package should appear in the Mission Packages list

  Scenario: Download a package posted to TAK Server
    Given TAK Server hosts mission package UID "mp-001" named "op-bravo"
    When the operator queries Mission Packages
    And the operator downloads UID "mp-001"
    Then the package contents should import onto the map
    And a log entry should record the download

  Scenario: Reject a corrupt mission package
    Given the file "broken.zip" is not a valid mission package
    When the operator attempts to import "broken.zip"
    Then import should fail
    And the map should be unchanged
    And the operator should see "Invalid mission package"
