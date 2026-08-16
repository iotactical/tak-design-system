Feature: Emergency Alert Broadcast
  As a TAK operator
  I need to send and receive emergency alerts
  So that a distress signal is visible immediately across the network

  Background:
    Given the TAK application is running
    And the operator is connected to a TAK Server
    And the operator callsign is "SELF-01"

  Scenario: Trigger an emergency from the toolbar
    Given GPS is reporting a valid fix
    When the operator activates Emergency
    And the operator confirms the alert type "911 Alert"
    Then an emergency CoT event should be transmitted
    And the self marker should display an emergency indicator
    And connected teammates should receive the alert

  Scenario: Cancel an active emergency
    Given an emergency alert is active for "SELF-01"
    When the operator cancels Emergency
    Then a cancel CoT event should be transmitted
    And the emergency indicator should be removed from the self marker

  Scenario: Display a remote emergency
    Given a remote CoT emergency arrives from callsign "BLUE-02"
    When the event is processed
    Then "BLUE-02" should display an emergency indicator on the map
    And an alert notification should appear
    And UserList should flag "BLUE-02" as in emergency

  Scenario: Refuse emergency with no network and no GPS
    Given the operator is disconnected
    And GPS reports no fix
    When the operator activates Emergency
    Then the operator should see that both GPS and a connection are required
    And no emergency CoT event should be queued as if it had been delivered
