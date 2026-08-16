Feature: Radial Menu on Map Items
  As a TAK operator
  I need a radial menu on markers and the self icon
  So that common actions are one gesture away

  Background:
    Given the TAK application is running
    And the map view is displayed
    And a marker "RP BRAVO" exists on the map

  Scenario: Open radial menu on a marker
    Given the operator long-presses marker "RP BRAVO"
    When the radial menu opens
    Then RadialMenu should display actions for that item
    And the actions should include at least Details Delete and Bloodhound

  Scenario: Navigate a submenu
    Given RadialMenu is open on "RP BRAVO"
    When the operator selects the Extra submenu
    Then nested actions should replace or extend the current ring
    And the operator should be able to return to the parent ring

  Scenario: Invoke Delete from the radial menu
    Given RadialMenu is open on "RP BRAVO"
    When the operator chooses Delete
    And the operator confirms
    Then marker "RP BRAVO" should be removed from the map
    And RadialMenu should close

  Scenario: Dismiss the menu without an action
    Given RadialMenu is open
    When the operator taps outside the menu
    Then RadialMenu should close
    And the map item should remain unchanged
