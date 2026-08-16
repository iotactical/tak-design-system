Feature: CASEVAC Nine-Line
  Source: ATAK Civilian Software User Manual · CASEVAC

  As a TAK operator
  I need CASEVAC / MEDEVAC nine-lines, ZMIST, and HLZ as the Software User Manual describes
  So that Appendix G of JFIRE 2016 is the form, not an invented SALUTE template

  Background:
    Given the TAK application is running
    And GPS is reporting a valid fix
    And the operator is connected to a TAK Server

  Scenario: Place a CASEVAC marker
    # SUM: "The user can drop a CASEVAC by selecting the [CASEVAC] icon in the menu and placing its marker on the map."
    Given the operator selects the [CASEVAC] icon
    When the operator taps the map
    Then a CASEVAC marker should appear
    And RadialMenu should offer Delete, Bloodhound, Fine Adjust, R&B Line, and Details
    And a CoT type "b-r-f-h-c" event should be associated with that uid
    And preference "locationCallsign" should identify the reporting operator

  Scenario: Fill the nine lines in Details
    # SUM: "When the CASEVAC Details window is opened, the user may fill out the nine lines of information."
    Given the CASEVAC marker is selected
    When the operator opens Details
    Then NineLineForm should show nine lines
    And CoordinateDisplay should populate line 6 from the marker when GPS is valid
    And intent "com.atakmap.android.maps.SHOW_DETAILS" should have opened the pane

  Scenario: Add and delete ZMIST
    # SUM: "Multiple ZMIST reports can be associated to one CASEVAC. This can be performed by selecting [ADD] next to the initial ZMIST heading and section. A ZMIST report can also be deleted by selecting the [Delete] icon."
    Given NineLineForm is open
    When the operator selects [ADD] next to ZMIST
    Then MarkerDetail should list a second ZMIST
    And the CoT type "b-r-f-h-c" detail should include both reports after send

  Scenario: Send the CASEVAC
    # SUM: "Once the user has entered all the applicable information, the CASEVAC may be sent to available users by selecting [Send]."
    Given required nine lines and at least one ZMIST are complete
    When the operator selects [Send]
    Then a CoT type "b-r-f-h-c" message should be transmitted
    And ConnectionStatus should remain Connected

  Scenario: HLZ brief
    # SUM: "The user can also add a ZMIST (ZAP number, Mechanism of Injury, Injury Sustained, Symptoms and Signs, Treatment Given) report and/or a Helo Landing Zone (HLZ) brief."
    Given Details is open
    When the operator adds an HLZ brief
    Then NineLineForm should include the HLZ fields
    And intent "com.atakmap.baokit.NINE_LINE" should remain the fires nine-line path if opened separately

  Scenario: Cannot send with an empty location line
    # SUM: "The CASEVAC tool follows Appendix G of the JFIRE 2016 publication and can be used for either CASEVAC or the more restrictive MEDEVAC."
    Given line 6 is empty
    When the operator selects [Send]
    Then DialogPanel should block the send
    And no CoT type "b-r-f-h-c" event should leave the device
