Feature: Nine-Line Briefing Forms
  As a TAK operator
  I need to fill out standardized nine-line forms for CAS and MEDEVAC requests
  So that I can transmit structured tactical data to supporting units

  Background:
    Given the TAK application is running
    And the operator is authenticated with callsign "JTAC-01"
    And the operator is connected to the TAK Server

  Scenario: Select a CAS nine-line template
    Given the operator opens the nine-line form menu
    When the operator selects template "CAS 9-Line"
    Then the form should display 9 numbered fields for Close Air Support
    And field 1 should be labeled "IP/BP"
    And field 2 should be labeled "Heading"
    And field 3 should be labeled "Distance"
    And field 6 should be labeled "Target Location"
    And all fields should initially be empty

  Scenario: Fill required fields on the CAS nine-line
    Given the operator has selected template "CAS 9-Line"
    When the operator enters "IP NORTH" in field 1 "IP/BP"
    And the operator enters "180" in field 2 "Heading"
    And the operator enters "5 NM" in field 3 "Distance"
    And the operator enters "2000 MSL" in field 4 "Target Elevation"
    And the operator enters "1x T-72" in field 5 "Target Description"
    And the operator enters "38.8977 N, 77.0365 W" in field 6 "Target Location"
    Then each completed field should show a filled indicator
    And the form completion count should display "6 of 9"

  Scenario: Validate a nine-line form before submission
    Given the operator has filled 6 of 9 fields on the CAS nine-line
    And field 7 "Mark Type" is empty
    And field 8 "Friendly Location" is empty
    And field 9 "Egress" is empty
    When the operator taps "Validate"
    Then a validation summary should highlight 3 empty fields
    And required field "Target Location" should show as valid
    And the form should not allow submission until minimum required fields are filled

  Scenario: Submit a completed nine-line form as CoT
    Given the operator has completed all 9 fields on the CAS nine-line
    When the operator taps "Send"
    And the operator selects recipient "All Chat Rooms"
    Then a CoT message should be transmitted containing the nine-line data
    And the CoT detail element should include all 9 line items
    And a confirmation toast should display "9-Line sent successfully"
    And the sent form should appear in the GeoChat log

  Scenario: Select a MEDEVAC nine-line template
    Given the operator opens the nine-line form menu
    When the operator selects template "MEDEVAC 9-Line"
    Then the form should display 9 numbered fields for medical evacuation
    And field 1 should be labeled "Location"
    And field 2 should be labeled "Radio Frequency"
    And field 3 should be labeled "Number of Patients by Precedence"
    And field 5 should be labeled "Number of Patients by Type"
    And field 9 should be labeled "CBRN Contamination"

  Scenario: Clear a nine-line form
    Given the operator has partially filled the CAS nine-line form
    And 5 of 9 fields contain data
    When the operator taps "Clear Form"
    And the operator confirms the clear action
    Then all 9 fields should be empty
    And the form completion count should display "0 of 9"
    And no validation errors should be displayed
