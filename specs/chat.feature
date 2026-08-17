Feature: Chat inbox
  Source: ATAK Civilian Software User Manual · 13 Chat

  As a TAK operator
  I need the last message per chatroom as the Software User Manual describes
  So that unread GeoChat can be opened without browsing the full Contacts list first

  Background:
    Given the TAK application is running
    And GeoChat rooms exist for the local device

  Scenario: Chat lists the most recent message per room
    # SUM: "The Chat tool logs, organizes and displays the most recent chat message that was sent from each chatroom associated with the local device."
    Given two chatrooms each have messages
    When the operator opens Chat from ToolBar
    Then ListView should order entries by timestamp with the most recent at the top
    And ChatPanel should show who the exchange is with, the last text, and when it was sent
    And preference "chatAddress" should still address GeoChat traffic

  Scenario: Selecting an entry opens GeoChat
    # SUM: "Selecting a group or conversation will immediately open the GeoChat feature in Contacts for additional interaction. Select a chat message entry to open the chatroom associated with the message."
    Given Chat lists conversation "Alpha"
    When the operator selects that entry
    Then intent "com.atakmap.android.OPEN_GEOCHAT" should open ChatPanel
    And intent "com.atakmap.android.contact.GEO_CHAT" should target that room
    And a CoT type "b-t-f" GeoChat event should be the message type on the wire

  Scenario: Search filters messages or senders
    # SUM: "Select Search to input text to search for a specific message or sender."
    Given Chat lists several rooms
    When the operator searches for a sender callsign
    Then ListView should keep matching entries
    And intent "com.atakmap.android.chat.HISTORY_UPDATE" should refresh results
    And preference "chatPort" should be unchanged

  Scenario: Unread rooms show a red indicator
    # SUM: "Messages that haven’t been read yet will display a red indicator, like the Contacts tool."
    Given a room has an unread CoT type "b-t-f" message
    When intent "com.atakmap.android.chat.NEW_CHAT_MESSAGE" is received
    Then ChatPanel should show the red unread indicator
    And intent "com.atakmap.chat.markmessageread" should clear it after the operator opens the room
    And UserList should remain reachable from +
