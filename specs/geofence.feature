Feature: Geofence Creation and Alerting
  As a TAK operator
  I need to draw geofences and receive breach alerts
  So that entry and exit of an area are visible without watching the map constantly

  Background:
    Given the TAK application is running
    And the operator is connected to a TAK Server
    And GPS is reporting a valid fix

  Scenario: Create a circular geofence
    Given the geofence tool is selected
    When the operator taps a center at "38.8977 N, 77.0365 W"
    And the operator sets radius 500 meters
    And the operator names the fence "AO BRAVO"
    Then a circular geofence "AO BRAVO" should appear on the map
    And the fence should be listed under Geofences in the overlay hierarchy

  Scenario: Alert when self marker enters the fence
    Given geofence "AO BRAVO" is armed for entry
    And the self marker is outside "AO BRAVO"
    When the self marker position updates inside "AO BRAVO"
    Then an entry alert should display
    And a geofence CoT event should be transmitted
    And the fence should highlight on the map

  Scenario: Edit an existing geofence
    Given geofence "AO BRAVO" exists with radius 500 meters
    When the operator opens geofence edit
    And the operator changes the radius to 800 meters
    Then the map graphic should update to 800 meters
    And subsequent alerts should use the new radius

  Scenario: Ignore a breach from an untracked marker
    Given geofence "AO BRAVO" is armed only for the self marker
    When a remote marker crosses the fence boundary
    Then no entry alert should display for the self operator
    And the remote marker should still render on the map
