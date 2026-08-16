Feature: Contacts Roster and Callsign Lookup
  As a TAK operator
  I need a contacts list of currently visible callsigns
  So that I can open chat or locate a unit without searching the map

  Background:
    Given the TAK application is running
    And the operator is connected to a TAK Server
    And two friendlies "BLUE-01" and "BLUE-02" are visible on the COP

  Scenario: List connected contacts
    Given SA from "BLUE-01" and "BLUE-02" has been received
    When the operator opens Contacts
    Then UserList should show "BLUE-01" and "BLUE-02"
    And each row should include team color and callsign

  Scenario: Pan to a contact
    Given UserList is open
    When the operator chooses Locate on "BLUE-02"
    Then the map viewport should center on "BLUE-02"
    And the marker should be highlighted

  Scenario: Start GeoChat from a contact
    Given UserList is open
    When the operator chooses Chat on "BLUE-01"
    Then ChatPanel should open a conversation with "BLUE-01"
    And the recipient should be "BLUE-01"

  Scenario: Remove a stale contact
    Given "BLUE-02" has not updated beyond the stale timeout
    When the contacts list refreshes
    Then "BLUE-02" should show as stale or drop from the active roster
    And the operator should not be able to send as if the unit were still live without a warning
