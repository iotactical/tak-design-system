Feature: Digital Pointer Tools
  Source: ATAK Civilian Software User Manual · 22 Digital Pointer Tools

  As a TAK operator
  I need shared SPI pointers and GoTo MGRS as the Software User Manual describes
  So that teammates see a pointer connected to the placing user

  Background:
    Given the TAK application is running
    And the operator selects the Digital Pointer icon

  Scenario: Place a pointer that is sent to the team
    # SUM: "The Pointer button allows the user to place an indicator on the map. If other team members are on the same network, the pointer icon will automatically be sent to them. It will appear on their map and as a notification message. A line can also be seen connecting the pointer to the user that placed it."
    Given Digital Pointer toolbar is open
    When the operator places a pointer on the map
    Then a CoT type "b-m-p-s-p-i" SPI should be sent
    And intent "com.atakmap.android.maps.SPI_PAIRING_LINE_SELF" should draw the pairing line
    And RangeBearing should be available from the pointer RadialMenu

  Scenario: Own pointer radial includes pair and rings
    # SUM: "Selecting the user’s own pointer opens a radial menu. This menu includes Fine adjust, Polar Coordinates, Pair to Self, Range and Bearing, Custom Threat Rings and Place a Marker."
    Given the operator's SPI is on the map
    When the operator selects that pointer
    Then RadialMenu should include Polar Coordinates and Pair to Self
    And intent "com.atakmap.android.maps.POLAR_COORD_ENTRY" should be available
    And MarkerDetail should open Place a Marker when chosen

  Scenario: GoTo MGRS places a local pointer
    # SUM: "Select the GoTo MGRS icon from the Digital Pointer toolbar to manually enter desired MGRS coordinates to place a local Pointer. This allows for fast entry of the 10-digit Easting and Northing and includes the corresponding grid zone for that map view."
    Given Digital Pointer toolbar is open
    When the operator enters a 10-digit MGRS on GoTo MGRS
    Then CoordinateDisplay should place a local pointer at that grid
    And intent "com.atakmap.android.maps.FOCUS" should pan to the pointer
    And preference "firesNumberOfSpis" should cap how many DPs the toolbar keeps

  Scenario: Legacy toolbar mode adds Dynamic R&B
    # SUM: "The legacy toolbar mode can be enabled in preferences. Legacy mode will add the Dynamic R&B Line option and provide the option to configure between 1-3 DPs on the Digital Pointer toolbar."
    Given preference "legacyFiresToolbarMode" is enabled
    When the operator opens Digital Pointer Tools
    Then ToolBar should include Dynamic R&B Line
    And preference "spiUpdateDelay" should control SPI refresh
    And a CoT type "u-rb-a" line should be creatable from that option
