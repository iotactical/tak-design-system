Feature: Video Stream Playback
  As a TAK operator
  I need to play video streams associated with map items
  So that ISR and recon feeds are reachable from the COP

  Background:
    Given the TAK application is running
    And a marker "UAV-01" exists with a video alias

  Scenario: Open a video stream from a marker
    Given "UAV-01" publishes a playable video URL
    When the operator chooses Video from the radial menu
    Then a video player should open
    And playback should start if the stream is reachable

  Scenario: List known video aliases
    Given the video catalog contains 2 aliases
    When the operator opens Video
    Then both aliases should be listed
    And selecting an alias should open that stream

  Scenario: Associate a new video alias with a marker
    Given the operator has a RTSP URL for a feed
    When the operator adds the URL as a video alias on "UAV-01"
    Then MarkerDetail should list the alias
    And subsequent Video actions on "UAV-01" should offer that alias

  Scenario: Report an unreachable stream
    Given the selected alias host is unreachable
    When the operator attempts playback
    Then the player should not spin indefinitely without feedback
    And the operator should see that the stream could not be opened
    And the map marker should remain
