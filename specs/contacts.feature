Feature: Contacts
  Source: ATAK Civilian Software User Manual · Contacts

  As a TAK operator
  I need the Contacts list, filters, profile cards, and default connectors as the Software User Manual describes
  So that GeoChat, Data Packages, Email, Phone, SMS, VoIP, and XMPP match ATAK

  Background:
    Given the TAK application is running
    And the operator is connected to a TAK Server
    And two friendlies "BLUE-01" and "BLUE-02" are visible

  Scenario: Open Contacts and list callsigns
    # SUM: "The Contacts list includes a variety of ways in which a user may communicate with other users, such as GeoChat (ATAK Civilian's built in Chat capability), Data Packages, Email, Phone, SMS, VoIP and XMPP."
    Given SA from "BLUE-01" and "BLUE-02" has been received
    When the operator selects the [Contacts] icon
    Then intent "com.atakmap.android.contact.CONTACT_LIST" should populate UserList
    And each row should show callsign, team color from preference "locationTeam" of that remote, and default connector
    And each remote should retain CoT type "a-f-G-U-C"

  Scenario: Unread Only and Show All filters
    # SUM: "The Unread Only box, when checked, will display only contacts with whom there are unread message waiting. ... The [Show All] box, when checked (default), will display all contacts regardless of their location. When unchecked, only contacts that are visible on current map screen will be displayed."
    Given UserList is open
    When the operator unchecks Show All
    Then intent "com.atakmap.android.contact.REFRESH_LIST" should hide off-screen contacts
    And preference "audibleNotify" should still govern GeoChat sound

  Scenario: Open GeoChat from a contact
    # SUM: "To view messages from or send messages to an individual, select the desired contact's [Communication] icon"
    Given UserList is open
    When the operator chooses the Communication icon on "BLUE-01"
    Then intent "com.atakmap.android.contact.GEO_CHAT" should open ChatPanel
    And intent "com.atakmap.android.OPEN_GEOCHAT" should target that callsign
    And a CoT type "b-t-f" message should be used when the operator sends

  Scenario: Stale contact listing turns yellow
    # SUM: "If a contact is no longer online, it will be indicated by changing the contact listing to a yellow color and the marker changes to gray both in the list and on the map."
    Given "BLUE-02" has not updated beyond the stale timeout
    When the contacts list refreshes
    Then intent "com.atakmap.android.cot.ITEM_STALE" should mark "BLUE-02"
    And UserList should show the yellow stale listing
    And SkittleMarker for that uid should use reduced opacity
