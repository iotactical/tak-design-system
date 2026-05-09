Feature: Cursor on Target Marker Lifecycle
  As a TAK operator
  I need to create, send, receive, and manage CoT markers
  So that I can maintain situational awareness on the tactical map

  Background:
    Given the TAK application is running
    And the operator is authenticated with a valid client certificate
    And a connection to a TAK Server is established

  Scenario: Create a marker with a MIL-STD-2525 SIDC
    Given the map view is displayed
    When the operator long-presses on coordinates "38.8977 N, 77.0365 W"
    And the operator selects marker type "Hostile" from the marker palette
    And the operator assigns SIDC "SHG-UCFM-------"
    And the operator enters callsign "HOSTILE-01"
    Then a CoT marker should appear on the map at "38.8977 N, 77.0365 W"
    And the marker icon should match SIDC "SHG-UCFM-------"
    And the marker callsign should display "HOSTILE-01"

  Scenario: Send a CoT message to the TAK Server
    Given the operator has created a marker with callsign "ALPHA-01"
    And the marker has CoT type "a-f-G-U-C"
    When the operator taps "Send" on the marker detail view
    Then a CoT XML message should be transmitted to the TAK Server
    And the CoT message should contain element type "a-f-G-U-C"
    And the CoT message should include a valid "point" element with lat, lon, and hae
    And the CoT message should include a "detail" element with the callsign

  Scenario: Receive a marker update from the TAK Server
    Given a remote operator has sent a CoT marker with UID "remote-marker-001"
    When the TAK application receives the CoT event for UID "remote-marker-001"
    Then the marker should appear on the local map
    And the marker position should match the received coordinates
    And the marker detail view should show the remote operator's callsign

  Scenario: Marker goes stale after timeout
    Given a CoT marker with UID "stale-test-001" exists on the map
    And the marker stale time is set to 300 seconds from its start time
    When 300 seconds elapse without a position update for UID "stale-test-001"
    Then the marker status should change to "stale"
    And the marker should be flagged in the marker list as stale

  Scenario: Stale marker visual change
    Given a CoT marker with UID "stale-visual-001" has gone stale
    When the map renders the marker
    Then the marker icon should display a stale indicator
    And the marker opacity should be reduced compared to active markers
    And the marker tooltip should include the label "Stale"

  Scenario: Expired marker removal
    Given a CoT marker with UID "expire-test-001" has been stale for longer than the configured expiration period
    When the expiration sweep runs
    Then the marker with UID "expire-test-001" should be removed from the map
    And the marker should be removed from the marker list
    And an entry should be recorded in the event log with reason "expired"
