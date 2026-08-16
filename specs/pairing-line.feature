Feature: Pairing Line Between Map Items
  As a TAK operator
  I need pairing lines between two map items
  So that a relationship is visible without creating a route

  Background:
    Given the TAK application is running
    And markers "BLUE-01" and "BLUE-02" exist on the map

  Scenario: Create a pairing line
    Given the operator selects "BLUE-01"
    When the operator chooses Pairing Line
    And the operator selects "BLUE-02" as the other end
    Then a pairing line should connect "BLUE-01" and "BLUE-02"
    And the line should appear in the overlay hierarchy

  Scenario: Pairing line follows moving endpoints
    Given a pairing line exists between "BLUE-01" and "BLUE-02"
    When "BLUE-02" updates its CoT position
    Then the pairing line endpoint should move to the new position
    And the line should remain associated with both UIDs

  Scenario: Remove a pairing line
    Given a pairing line exists between "BLUE-01" and "BLUE-02"
    When the operator deletes the pairing line
    Then the line should be removed from the map
    And both markers should remain

  Scenario: Refuse a pairing line to the same item
    Given the operator selects "BLUE-01"
    When the operator chooses Pairing Line
    And the operator selects "BLUE-01" as the other end
    Then no pairing line should be created
    And the operator should see that two distinct items are required
