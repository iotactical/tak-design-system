Feature: GeoChat Tactical Messaging
  As a TAK operator
  I need to send and receive text messages with embedded geospatial data
  So that I can communicate tactical information to my team

  Background:
    Given the TAK application is running
    And the operator is authenticated with callsign "SENDER-01"
    And the operator is connected to the TAK Server
    And the GeoChat panel is open

  Scenario: Send a message to a chat channel
    Given the operator is viewing the "All Chat Rooms" channel
    When the operator types "Moving to rally point BRAVO"
    And the operator taps the send button
    Then the message "Moving to rally point BRAVO" should appear in the chat log
    And the message should display the sender callsign "SENDER-01"
    And the message should include a timestamp
    And a GeoChat CoT message should be transmitted to the TAK Server

  Scenario: Receive a message from another operator
    Given operator "REMOTE-02" sends a GeoChat message "Contact at grid 123456"
    When the TAK application receives the GeoChat CoT event
    Then the message "Contact at grid 123456" should appear in the chat log
    And the sender should display as "REMOTE-02"
    And an audible notification should trigger if notifications are enabled

  Scenario: Switch between chat channels
    Given the following chat channels exist:
      | channel       |
      | All Chat Rooms|
      | Team Cyan     |
      | Direct: ALPHA |
    When the operator selects channel "Team Cyan"
    Then the chat log should display only messages from the "Team Cyan" channel
    And the channel header should display "Team Cyan"
    And the message input should target the "Team Cyan" channel

  Scenario: Unread badge count on channels
    Given the operator is viewing channel "Team Cyan"
    And 3 new messages arrive in channel "All Chat Rooms"
    When the operator views the channel list
    Then channel "All Chat Rooms" should display an unread badge with count 3
    And channel "Team Cyan" should not display an unread badge
    When the operator opens channel "All Chat Rooms"
    Then the unread badge for "All Chat Rooms" should be cleared

  Scenario: Embed a coordinate in a chat message
    Given the operator is viewing channel "Team Cyan"
    When the operator taps the attach location button
    And the operator selects a point at "34.0522 N, 118.2437 W"
    And the operator types "Rally here"
    And the operator taps the send button
    Then the message should contain an embedded coordinate "34.0522 N, 118.2437 W"
    And the message should display a clickable coordinate link
    And the GeoChat CoT message should include a point element

  Scenario: View an embedded coordinate on the map
    Given a chat message contains an embedded coordinate "34.0522 N, 118.2437 W"
    When the operator taps the coordinate link in the message
    Then the map should pan to coordinates "34.0522 N, 118.2437 W"
    And a temporary marker should appear at the linked position
    And the map zoom level should adjust to show the coordinate in context
