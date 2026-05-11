Feature: Structured Report Forms
  As a TAK operator
  I need to fill out standardized report forms for MEDEVAC and situation reports
  So that critical information can be transmitted accurately and quickly

  Background:
    Given the operator is authenticated on the TAK network
    And the operator has a valid GPS position

  Scenario: Select a MEDEVAC nine-line template
    Given the operator opens the report form menu
    When the operator selects "MEDEVAC 9-Line"
    Then a form with 9 numbered line items should be displayed
    And line 1 should be labeled "Location"
    And line 2 should be labeled "Frequency/Callsign"
    And line 3 should be labeled "Number of Patients by Precedence"

  Scenario: Fill required fields on the MEDEVAC form
    Given the operator has selected the MEDEVAC 9-Line template
    When the operator fills in line 1 with their current MGRS grid
    And the operator fills in line 3 with "1 Urgent"
    And the operator fills in line 5 with "1 Litter"
    Then the form should show 3 of 9 fields completed
    And the progress indicator should display "33%"

  Scenario: Validate a report form before submission
    Given the operator has filled 6 of 9 fields on the MEDEVAC form
    When the operator attempts to submit the form
    Then a validation warning should indicate 3 missing fields
    And the missing fields should be highlighted

  Scenario: Submit a completed report form as CoT
    Given the operator has completed all 9 fields on the MEDEVAC form
    When the operator taps "Send"
    Then a CoT message should be transmitted containing the report data
    And the CoT detail element should include all 9 line items

  Scenario: Select a SALUTE report template
    Given the operator opens the report form menu
    When the operator selects "SALUTE Report"
    Then a form with 6 labeled fields should be displayed
    And the fields should include Size, Activity, Location, Unit, Time, Equipment

  Scenario: Clear and reset a form
    Given the operator has partially filled a MEDEVAC form
    When the operator taps "Clear"
    Then all form fields should be reset to empty
    And the progress indicator should display "0%"
