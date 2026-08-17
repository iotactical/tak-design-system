Feature: Laser Range Finder and Bluetooth
  Source: ATAK Civilian Software User Manual · Settings · Bluetooth Preferences · Device Setup

  As a TAK operator
  I need Bluetooth radios and a laser range finder as Settings and Device Setup describe
  So that external sensors can update range without inventing a GPS fix

  Background:
    Given the TAK application is running

  Scenario: Enable Bluetooth from Settings
    # SUM: "A prompt will appear with a TAK Device Setup screen to allow further configuration of ATAK. Changes and imports made here can always be updated later."
    Given Settings > Bluetooth Preferences is open
    When the operator enables preference "atakControlBluetooth"
    Then intent "android.bluetooth.adapter.action.STATE_CHANGED" should be observed
    And DockPane should show Bluetooth device status
    And a CoT type "a-f-G-U-C" self SA event should continue

  Scenario: Rescan for Bluetooth accessories
    # SUM: "The three bars to the left of the toolbar (or to the right when using the legacy toolbar option) provide access to all ATAK tools and plug-ins."
    Given preference "atakControlBluetooth" is enabled
    When the operator starts a Bluetooth rescan
    Then intent "com.atakmap.android.bluetooth.RESCAN" should run
    And preference "atakBluetoothReconnectSeconds" should still govern reconnect delay
    And ListView should list discovered devices

  Scenario: Use a non-Bluetooth laser range finder
    # SUM: "The three bars to the left of the toolbar (or to the right when using the legacy toolbar option) provide access to all ATAK tools and plug-ins."
    Given preference "nonBluetoothLaserRangeFinder" is true
    When the operator fires a laser range reading
    Then intent "com.atakmap.android.lrf.TOGGLE_SLIDE" should present the LRF slide
    And RangeBearing should show the measured range
    And a CoT type "b-m-p-s-p-i" SPI should not be required for the ranging widget

  Scenario: Hide the PLRF overlay
    # SUM: "Long-press Fine Adjust to open the sub-radial which allows the ability to enter coordinates or MGRS location."
    Given an LRF overlay is visible
    When the operator dismisses PLRF
    Then intent "com.atakmap.android.maps.HIDE_PLRF" should clear it
    And MapOverlay should stop drawing the laser graphic
    And GPSStatus should be unchanged
