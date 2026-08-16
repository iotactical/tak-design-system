Feature: Bloodhound Navigation Line
  As a TAK operator
  I need a bloodhound line from my position to a target
  So that I can walk or drive toward a point without plotting a full route

  Background:
    Given the TAK application is running
    And GPS is reporting a valid fix
    And a marker "LZ NORTH" exists on the map

  Scenario: Start bloodhound to a marker
    Given the operator selects marker "LZ NORTH"
    When the operator chooses Bloodhound
    Then a navigation line should draw from the self marker to "LZ NORTH"
    And RangeBearing should display range and bearing to "LZ NORTH"
    And the line should update as the self position changes

  Scenario: Bloodhound follows a moving friendly
    Given bloodhound is locked to friendly callsign "BLUE-02"
    When "BLUE-02" updates its CoT position
    Then the bloodhound endpoint should move to the new position
    And the range readout should recompute

  Scenario: Stop bloodhound
    Given bloodhound is active to "LZ NORTH"
    When the operator chooses Stop Bloodhound
    Then the navigation line should be removed
    And RangeBearing should clear the bloodhound measurement

  Scenario: Refuse bloodhound with no GPS fix
    Given GPS reports no fix
    When the operator chooses Bloodhound to "LZ NORTH"
    Then bloodhound should not start
    And GPSStatus should display "no fix"
    And the operator should see that a GPS fix is required
