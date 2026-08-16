Feature: CASEVAC, Fires Toolbar, and Bullseye
  Source: ATAK Civilian Software User Manual · CASEVAC · Range Tools · Bullseye Tool · Digital Pointer Tools

  As a TAK operator
  I need CASEVAC nine-lines, Bullseye, and Digital Pointers as the Software User Manual describes
  So that MEDEVAC, 9-Line, and CFF planning use the same map geometry

  Background:
    Given the TAK application is running
    And the operator is connected to a TAK Server

  Scenario: Drop a CASEVAC and fill nine lines
    # SUM: "The user can drop a CASEVAC by selecting the [CASEVAC] icon in the menu and placing its marker on the map. When the CASEVAC Details window is opened, the user may fill out the nine lines of information."
    Given the operator selects the [CASEVAC] icon
    When the operator places the marker and opens Details
    Then NineLineForm should show the nine lines
    And a CoT type "b-r-f-h-c" CASEVAC event should be created
    And MarkerDetail should allow ZMIST and HLZ brief
    And intent "com.atakmap.android.MED_LINE" should be available for the med line
    And preference "legacyFiresToolbarMode" should control whether the legacy fires toolbar is shown

  Scenario: Send a completed CASEVAC
    # SUM: "Once the user has entered all the applicable information, the CASEVAC may be sent to available users by selecting [Send]."
    Given NineLineForm has required lines filled
    When the operator selects [Send]
    Then a CoT type "b-r-f-h-c" message should be transmitted
    And ConnectionStatus should show Connected
    And RadialMenu options Delete, Bloodhound, Fine Adjust, R&B Line, and Details should remain

  Scenario: Bullseye for 9-Line and CFF planning
    # SUM: "The Bullseye Tool is an additional Range & Bearing option that gives more information than the standard R&B Line or R&B Circle. This feature aids in 9-Line and CFF planning."
    Given the operator selects Bullseye from the Range & Bearing tools
    When the operator places the center
    Then intent "com.atakmap.android.toolbars.BullseyeDropDown" should open
    And RangeBearing rings should honor intent "com.atakmap.maps.bullseye.TOGGLE_RINGS"
    And assignment CoT type "u-rb-a" should be sendable from Details

  Scenario: Block send when required CASEVAC lines are empty
    # SUM: "The CASEVAC tool follows Appendix G of the JFIRE 2016 publication and can be used for either CASEVAC or the more restrictive MEDEVAC."
    Given NineLineForm is open
    And line 6 location is empty
    When the operator attempts [Send]
    Then the CoT type "b-r-f-h-c" message should not be sent
    And DialogPanel should highlight missing lines
