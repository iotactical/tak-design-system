Feature: Fires and Nine-Line CAS
  As a TAK operator
  I need to compose transmit and review fire-support and 9-line CAS messages
  So that a call for fire can be built from map geometry without a separate form product

  Background:
    Given the TAK application is running
    And the operator is connected to a TAK Server
    And a target marker "TGT-01" exists on the map

  Scenario: Start a 9-line from a target marker
    Given the operator selects "TGT-01"
    When the operator chooses Nine Line
    Then NineLineForm should open
    And line 6 (target location) should populate from "TGT-01"

  Scenario: Transmit a completed 9-line
    Given NineLineForm has required lines filled
    When the operator transmits the 9-line
    Then a CoT or chat payload carrying the 9-line should be sent
    And a log entry should record the transmission
    And NineLineForm should show that the message was sent

  Scenario: Populate range and bearing into fire support
    Given the self marker has a valid GPS fix
    And "TGT-01" is selected
    When the operator opens a call-for-fire using RangeBearing to "TGT-01"
    Then the target location should match "TGT-01"
    And observer location should match the self marker

  Scenario: Block transmit when required lines are empty
    Given NineLineForm is open
    And line 6 is empty
    When the operator attempts to transmit
    Then the message should not be sent
    And the operator should see that required lines are missing
