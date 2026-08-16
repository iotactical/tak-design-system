Feature: Tracks and Breadcrumb Trails
  As a TAK operator
  I need breadcrumb tracks for self and other units
  So that recent movement is visible on the map

  Background:
    Given the TAK application is running
    And GPS is reporting a valid fix

  Scenario: Record a self track
    Given track recording is enabled for the self marker
    When the self position updates along a 200 meter path
    Then a breadcrumb polyline should follow the path
    And the track should be listed under Tracks in the overlay hierarchy

  Scenario: Display a remote unit track
    Given friendly "BLUE-02" is broadcasting CoT with track history
    When the track overlay for "BLUE-02" is shown
    Then a polyline should connect recent positions of "BLUE-02"
    And the newest vertex should match the current marker position

  Scenario: Clear a track without deleting the marker
    Given a self track with 50 vertices exists
    When the operator chooses Clear Track
    Then the breadcrumb polyline should be removed
    And the self marker should remain on the map

  Scenario: Stop recording when GPS is stale
    Given track recording is enabled
    When GPS reports no fix beyond the stale threshold
    Then new vertices should not be appended from invalid positions
    And GPSStatus should display "no fix"
