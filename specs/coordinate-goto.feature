Feature: Go To
  Source: ATAK Civilian Software User Manual · Go To

  As a TAK operator
  I need MGRS, DD, DM, DMS, UTM, and ADDR tabs as the Software User Manual describes
  So that the map pans to a typed location and optionally drops a point

  Background:
    Given the TAK application is running
    And the operator selects the [Go To] icon

  Scenario: Pan to decimal degrees without placing a point
    # SUM: "If [No Point] is selected, the map will pan to the location but will not add a point."
    Given the operator selects the [DD] tab
    When the operator enters "38.8977, -77.0365" and selects No Point
    Then intent "com.atakmap.android.user.GO_TO" should center the map
    And CoordinateDisplay should show the destination
    And no new CoT type "a-f-G-U-C" marker should be created

  Scenario: Place a spot, unknown, neutral, hostile, or friendly at the entry
    # SUM: "The user can select a desired marker type (spot, unknown, neutral, hostile, or friendly) to be placed at the entered coordinates."
    Given the operator selects the [MGRS] tab
    When the operator enters a valid MGRS and chooses Friendly
    Then intent "com.atakmap.android.maps.PLACE" should drop the marker
    And TakIcon should render it
    And a CoT type "a-f-G-U-C" event should be created
    And MarkerDetail should open

  Scenario: Address lookup
    # SUM: "The address lookup provider used for the ADDR tab can be configured in the Settings > Tool Preferences > Address Lookup Preferences."
    Given preference "enableGeocoder" is true
    When the operator uses the [ADDR] tab
    Then preference "geocodeSupplier" should select the provider
    And intent "com.atakmap.android.user.GO_TO" should pan to the resolved coordinate

  Scenario: Reject an unparseable coordinate
    # SUM: "The user can enter the Latitude, Longitude and Elevation in the space provided for MGRS, DD, DM or DMS searches."
    Given the operator is on the [DD] tab
    When the operator enters "not-a-coordinate" and confirms
    Then intent "com.atakmap.android.user.GO_TO" should not pan
    And DialogPanel should show an invalid coordinate
    And the existing CoT type "a-f-G-U-C" self marker should stay put
