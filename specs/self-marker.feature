Feature: Self Marker and Situational Awareness Broadcast
  As a TAK operator
  I need my own position on the map and a broadcast SA marker
  So that teammates can see where I am without me placing a point by hand

  Background:
    Given the TAK application is running
    And GPS is reporting a valid fix
    And the operator callsign is "SELF-01"

  Scenario: Place the self marker at the GPS position
    Given the GPS module reports "38.8977 N, 77.0365 W" with accuracy 5 meters
    When the map view is displayed
    Then a self marker should appear at the reported coordinates
    And the marker should use the SkittleMarker component
    And the GPSStatus indicator should display a 3D fix

  Scenario: Broadcast SA to the TAK Server
    Given the operator is connected to a TAK Server
    And the self marker is on team "Cyan"
    When the SA broadcast interval elapses
    Then a CoT SA message of type "a-f-G-U-C" should be transmitted
    And the message should include callsign "SELF-01"
    And the message should include team color "Cyan"

  Scenario: Self marker holds last known position when GPS is lost
    Given the self marker is at "38.8977 N, 77.0365 W"
    When GPS reports no fix for longer than the stale threshold
    Then the self marker should remain at the last known position
    And GPSStatus should change to "no fix"
    And the self marker should display a stale indicator

  Scenario: Reject SA broadcast with no valid certificate
    Given the operator has no client certificate
    When the SA broadcast interval elapses
    Then no CoT SA message should be transmitted
    And ConnectionStatus should display "Disconnected"
    And the operator should see a prompt to install a certificate
