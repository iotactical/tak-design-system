Feature: Team Affiliation and Roles
  Source: ATAK Civilian Software User Manual · Placement · Self-Marker

  As a TAK operator
  I need team color and role as the Software User Manual describes
  So that self and contacts use the 15 team colors and TL, HQ, S, Medic, FO, RTO, K9 badges

  Background:
    Given the TAK application is running
    And the operator is connected to a TAK Server
    And preference "locationCallsign" is "LEAD-01"

  Scenario: Set My Team
    # SUM: "The color of the circle represents the user's Team affiliation, with additional lettering inside the circle to identify the role of the user on the team."
    Given preference "locationTeam" is "Unassigned"
    When the operator sets preference "locationTeam" to "Cyan"
    Then a CoT type "a-f-G-U-C" SA event should include team Cyan
    And SkittleMarker for self should tint Cyan
    And UserList should show LEAD-01 on Cyan

  Scenario: Set My Role
    # SUM: "Available roles include: Team Member, Team Lead (designated by a TL in the center of the marker), Headquarters (HQ in center), Sniper (S), Medic (+), Forward Observer (FO), RTO (R) or K9 (K9)."
    Given the Self-Marker is visible
    When the operator sets preference "atakRoleType" to "Team Lead"
    Then SkittleMarker should show the TL badge
    And the CoT type "a-f-G-U-C" SA event should include role Team Lead

  Scenario: Contacts grouped by team
    # SUM: "The Contacts list includes a variety of ways in which a user may communicate with other users"
    Given remote SA from Cyan and Yellow callsigns
    When the operator opens Overlay Manager Teams and Contacts
    Then intent "com.atakmap.android.contact.CONTACT_LIST" should list them
    And UserList should group by team color
    And MapOverlay Teams by color should match

  Scenario: Stale team member
    # SUM: "If a contact is no longer online, it will be indicated by changing the contact listing to a yellow color and the marker changes to gray both in the list and on the map."
    Given "BRAVO-02" has stopped sending
    When intent "com.atakmap.android.cot.ITEM_STALE" fires
    Then UserList should show yellow for "BRAVO-02"
    And SkittleMarker should gray that uid
    And the last CoT type "a-f-G-U-C" point should remain until expiration

  Scenario: Display type
    # SUM: "Next, the user will be prompted to change their callsign and/or import preferences or data from a Mission Package."
    Given TAK Device Setup is available
    When the operator sets preference "locationCallsign" to "LEAD-01"
    And preference "locationUnitType" to a ground unit
    Then subsequent CoT type "a-f-G-U-C" events should use that callsign
    And ConnectionStatus should stay Connected
