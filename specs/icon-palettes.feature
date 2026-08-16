Feature: Icon Palette Selection and Marker Customization
  As a TAK operator
  I need to choose icons from ATAK palettes when placing markers
  So that map points match the iconography teammates already know

  Background:
    Given the TAK application is running
    And the map view is displayed
    And the default ATAK icon palettes are loaded

  Scenario: Place a marker from the default palette
    Given the operator opens the marker palette
    When the operator selects the "Spot Map" palette
    And the operator taps icon "lp"
    And the operator taps the map at "38.8977 N, 77.0365 W"
    Then a marker should appear at those coordinates
    And the marker should render using TakIcon name "lp"
    And the CoT type should match the palette mapping for "lp"

  Scenario: Switch iconsets without losing placed markers
    Given a marker exists that was placed from the "Default" palette
    When the operator installs iconset "incident"
    And the operator sets "incident" as the active iconset
    Then previously placed markers should keep their original icons
    And new placements should use icons from "incident"

  Scenario: Customize marker color and label
    Given the operator has selected a generic point icon
    When the operator sets label "RP BRAVO"
    And the operator sets team color "Yellow"
    And the operator confirms placement
    Then the marker label should display "RP BRAVO"
    And the marker should use team color "Yellow"
    And the CoT detail should include that label and color

  Scenario: Reject an unknown icon name
    Given the operator attempts to place a marker with icon name "not-a-real-icon"
    When the palette lookup runs
    Then placement should fail
    And the operator should see "Unknown icon"
    And no CoT marker should be created
