Feature: Overlay Hierarchy and Visibility Control
  As a TAK operator
  I need a tree of overlays with per-item visibility
  So that I can hide clutter without deleting map items

  Background:
    Given the TAK application is running
    And the overlay hierarchy contains groups "Markers", "Routes", and "Geofences"

  Scenario: Toggle a parent overlay hides children
    Given group "Markers" contains 4 visible markers
    When the operator hides group "Markers"
    Then all 4 child markers should stop rendering
    And the group row should show hidden

  Scenario: Reveal a single child without revealing siblings
    Given group "Markers" is hidden
    When the operator shows one child marker "RP BRAVO"
    Then "RP BRAVO" should render on the map
    And the other 3 sibling markers should remain hidden
    And group "Markers" should show a mixed visibility state

  Scenario: Zoom to an overlay item
    Given overlay item "Route ALPHA" has a geographic extent
    When the operator chooses Zoom To for "Route ALPHA"
    Then the map viewport should fit that extent

  Scenario: Delete does not remove locked system overlays
    Given overlay "Self Marker" is a system overlay
    When the operator attempts to delete "Self Marker"
    Then the overlay should remain
    And the operator should see that system overlays cannot be deleted
