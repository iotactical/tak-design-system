Feature: GeoChat
  Source: ATAK Civilian Software User Manual · Contacts · GeoChat Messaging

  As a TAK operator
  I need All Chat Rooms, role rooms, Teams, predefined pads, and unread badges as the Software User Manual describes
  So that chat CoT matches ATAK GeoChat

  Background:
    Given the TAK application is running
    And preference "locationCallsign" is "SENDER-01"
    And the operator is connected to a TAK Server

  Scenario: Send in All Chat Rooms
    # SUM: "Select [All Chat Rooms] to view all messages from or send messages to those present on the network or TAK Server."
    Given ChatPanel is on All Chat Rooms
    When the operator types "Moving to rally point BRAVO" and sends
    Then a CoT type "b-t-f" GeoChat event should be transmitted
    And intent "com.atakmap.android.chat.NEW_CHAT_MESSAGE" should append the line
    And preference "audibleNotify" should not be required for the sender's own echo

  Scenario: Predefined message pads
    # SUM: "At the bottom of the Chat area are pre-defined messages that may be used to quickly create a message to send. Select the current menu button to scroll through the eight different menus of pre-defined messages, including: DFLT1, DFLT2, ASLT1, ASLT2, JM1, JM2, RECON1 and RECON2."
    Given ChatPanel is open
    When the operator taps a DFLT1 pad
    Then ChatPanel should send that CoT type "b-t-f" text
    And intent "com.atakmap.chatmessage.persistmessage" should persist it

  Scenario: Unread badge on Contacts
    # SUM: "A numbered red dot will appear on the [Contacts] icon when a message has been received successfully. The number denotes the number of unread messages that have been received."
    Given 3 unread CoT type "b-t-f" messages arrive
    When the operator views the toolbar
    Then ToolBar should show a numbered red dot on Contacts
    And intent "com.atakmap.android.chat.HISTORY_UPDATE" should keep the count until opened
    And preference "audibleNotify" should play if enabled

  Scenario: Pan To in an individual chat
    # SUM: "Selecting the [Pan To] icon, located at the top right of the call sign in an individual chat, will pan the map interface to that user's location."
    Given ChatPanel is in a conversation with "REMOTE-02"
    When the operator selects [Pan To]
    Then the map should center on that contact's CoT type "a-f-G-U-C" point
    And SkittleMarker for that uid should be in view

  Scenario: Role rooms
    # SUM: "Other groups available for viewing or sending messages are: Forward Observer, Groups, HQ, K9, Medic, RTO, Sniper, Team Lead, and Teams. If the user's current role is Forward Observer, HQ, K9, Medic, RTO, Sniper or Team Lead, that user can view or send messages to all other contacts with the same role."
    Given preference "atakRoleType" is "Medic"
    When the operator opens the Medic room
    Then ChatPanel should target that role group
    And CoT type "b-t-f" messages should not go to All Chat Rooms unless that room is selected

  Scenario: Mark message read
    # SUM: "The user name who sent the message will appear with a numbered red dot next to their name."
    Given an unread message from "REMOTE-02" exists
    When the operator opens that conversation
    Then intent "com.atakmap.chat.markmessageread" should clear the badge
    And UserList should remove the red dot for that contact
