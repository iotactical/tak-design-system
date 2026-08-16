Feature: Cursor on Target Marker Lifecycle
  Source: ATAK Civilian Software User Manual · Placement · Point Dropper · Radial Menus

  As a TAK operator
  I need to drop, detail, send, and age markers as the Software User Manual describes
  So that CoT on the wire matches Point Dropper and Details

  Background:
    Given the TAK application is running
    And the operator is connected to a TAK Server
    And preference "locationCallsign" is "SELF-01"

  Scenario: Drop a Hostile from Point Dropper
    # SUM: "The basic Markers symbology affiliations are: Unknown, Neutral, Red and Friendly. Select a marker from the pallet, then tap a location on the map to drop the marker."
    Given the operator selects the [Point Dropper] icon
    When the operator chooses Red and taps "38.8977 N, 77.0365 W"
    Then intent "com.atakmap.android.maps.PLACE" should create the marker
    And TakIcon should render the hostile icon
    And a CoT type "a-h-G-U-C" event should include that point
    And MarkerDetail should show the generated name

  Scenario: Send from Details
    # SUM: "Once all the desired modifications have been made, the Marker can be sent to other network members using [Send]. The information can be broadcast to all members or sent to specific recipients."
    Given a CoT type "a-f-G-U-C" marker exists
    When the operator selects [Send] on MarkerDetail
    Then a CoT type "a-f-G-U-C" XML event should be transmitted
    And ConnectionStatus should remain Connected

  Scenario: Auto Send about once every 60 seconds
    # SUM: "Select the [Auto Send] option to broadcast the marker to other TAK users on the network, with updates automatically sent about once every 60 seconds."
    Given Auto Send is enabled on a marker
    When preference "hostileUpdateDelay" elapses
    Then another CoT type "a-h-G-U-C" update should be transmitted
    And intent "com.atakmap.android.maps.COT_PLACED" should have already recorded the uid

  Scenario: Receive a remote marker
    # SUM: "Other TAK users appear on the display as a colored circle. The color of the circle represents the user's Team affiliation, with additional lettering inside the circle to identify the role of the user on the team."
    Given a remote CoT type "a-f-G-U-C" event arrives
    When the application processes it
    Then SkittleMarker should render that contact
    And UserList should list the callsign
    And intent "com.atakmap.android.cot.ITEM_REFRESHED" should refresh the item

  Scenario: GPS not available shows a diagonal on the team marker
    # SUM: "Team Member markers that include a diagonal line indicate that the GPS location is not available. A solid marker indicates that the user has GPS reception."
    Given a remote team member reports without GPS
    When the map renders that uid
    Then SkittleMarker should show the no-GPS diagonal
    And intent "com.atakmap.android.cot.ITEM_STALE" should apply when updates stop
    And preference "locationTeam" of the remote should still tint the icon

  Scenario: Expired remote is removed after staleness
    # SUM: "If a contact is no longer online, it will be indicated by changing the contact listing to a yellow color and the marker changes to gray both in the list and on the map."
    Given a remote CoT type "a-f-G-U-C" marker has been gray and yellow past expiration
    When the expiration sweep runs
    Then the marker should be removed from the map
    And UserList should no longer treat it as live without a warning
