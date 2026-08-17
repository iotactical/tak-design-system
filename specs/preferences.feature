Feature: Preferences
  Source: ATAK Civilian Software User Manual · Settings · Callsign and Device Preferences · Specific Tool Preferences

  As a TAK operator
  I need Settings screens, hideable keys, encryption passphrase, and load/save as the Software User Manual describes
  So that every res/xml preference key can be cited from Gherkin without inventing names

  Background:
    Given the TAK application is running

  Scenario: Change encryption passphrase from Settings
    # SUM: "The user can supply their own passphrase by using Settings > Callsign and Device Preferences > Encryption Password > Change Encryption Passphrase."
    Given encryption is already active
    When the operator changes preference "encryptionPassphrase"
    Then DialogPanel should accept the new passphrase
    And ConnectionStatus should keep mesh encryption enabled
    And a CoT type "a-f-G-U-C" SA event should stay on the encrypted mesh

  Scenario: Hide My Callsign from the Settings list
    # SUM: "A prompt will appear with a TAK Device Setup screen to allow further configuration of ATAK. Changes and imports made here can always be updated later."
    Given Device Setup listed callsign settings
    When preference hide key hidePreferenceItem_locationCallsign is applied
    Then preference "locationCallsign" should still store the callsign
    And ListView of Settings should omit My Callsign
    And SkittleMarker should still display the stored callsign on the map

  Scenario: Action bar experience follows toolbar preferences
    # SUM: "A legacy toolbar option is available as well. The legacy tool bar can be selected during TAK device setup by selecting Action Bar Experience and then the Right Side (Legacy) option."
    Given TAK Initial Device Configurations is open
    When the operator selects Right Side (Legacy)
    Then preference "my_actionbar_settings" should store that experience
    And preference "largeActionBar" should still apply icon sizing
    And ToolBar should move to the legacy side

  Scenario: Show All Preferences exposes the catalogued keys
    # SUM: "Settings for Elevation Tools can be changed by navigating to Settings > Tool Preferences > Specific Tool Preferences > Elevation Overlay Preferences."
    Given the operator opened Show All Preferences
    When ListView enumerates hideable preferences
    Then preference "prefs_dted_visible" should appear under Elevation Overlay Preferences
    And preference "about" should remain reachable from Support
    And intent "com.atakmap.app.COMPONENTS_CREATED" should have already registered those screens

  Scenario: Settings root lists Device Display Network Tools Control and Support
    # SUM: "A prompt will appear with a TAK Device Setup screen to allow further configuration of ATAK. Changes and imports made here can always be updated later."
    Given the operator opened Settings
    When ListView shows the root preference screens
    Then preference "generalDisplayPref" should open Display Preferences
    And preference "toolsPref" should open Tool Preferences
    And DialogPanel should still reach Support via preference "documentation"

  Scenario: Callsign and Device Preferences remain after Device Setup
    # SUM: "The user can supply their own passphrase by using Settings > Callsign and Device Preferences > Encryption Password > Change Encryption Passphrase."
    Given Device Setup completed
    When the operator opens Callsign and Device Preferences
    Then preference "callSignAndDevicePrefs" should list encryption and callsign
    And preference "encryptionPassphrase" should still be changeable
    And SkittleMarker should show preference "locationCallsign"

  Scenario: Unit Display Format governs coordinates
    # SUM: "Range & Bearing Tool settings can be customized in Settings > Display Preferences > Basic Display Settings > Unit Display Format Preferences."
    Given Basic Display Settings is open
    When the operator changes preference "coord_display_pref"
    Then CoordinateDisplay should use that format
    And preference "basic_display_settings" should remain in Display Preferences
    And RangeBearing should follow the same units screen

  Scenario: Save and load a preference file
    # SUM: "Changes and imports made here can always be updated later."
    Given Preference Management is open
    When the operator saves prefs then loads them
    Then preference "savePrefs" should write a .pref file
    And preference "loadPrefs" should restore those values
    And intent "com.atakmap.app.COMPONENTS_CREATED" should not require a reinstall
