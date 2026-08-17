Feature: Toolbar Manager
  Source: ATAK Civilian Software User Manual · 29 Toolbar Manager

  As a TAK operator
  I need customizable toolbars as the Software User Manual describes
  So that smartphone and tablet layouts can switch without editing the default toolbar in place

  Background:
    Given the TAK application is running

  Scenario: Default toolbar holds five tools on a phone
    # SUM: "The default toolbar contains five tools, a sixth tool can be added on a smartphone device with up to ten tools supported on a tablet device."
    Given the device is a smartphone
    When the operator views ToolBar
    Then five tools should be visible
    And intent "com.atakmap.android.maps.toolbar.OPEN_TOOLBAR" should reveal Additional Tools in a grid
    And preference "largeActionBar" should still size the action bar

  Scenario: Edit Mode copies the default toolbar
    # SUM: "When entering Edit Mode through the icon on the toolbar, the current toolbar will be presented to modify. If this is the default toolbar, a copy of it will be used as the starting point for the new toolbar since the default toolbar cannot be modified."
    Given the current toolbar is the default
    When the operator selects Edit Toolbar
    Then intent "com.atakmap.android.maps.toolbar.SET_TOOLBAR" should edit a copy
    And DialogPanel should not allow saving over the default toolbar identity
    And TakIcon tools can be long-pressed and dragged into place

  Scenario: Export a custom toolbar
    # SUM: "To save a toolbar outside of ATAK, select Export Toolbar. The exported file will be saved to /sdcard/atak/export/. After exporting, the toolbar can be sent to another TAK user."
    Given a user-created toolbar is selected
    When the operator selects Export Toolbar
    Then the file should be written under atak/export
    And intent "com.atakmap.android.importfiles.IMPORT_FILE" should import that toolbar later
    And a CoT type "a-f-G-U-C" SA event should be unaffected

  Scenario: Switch to the legacy right-side action bar
    # SUM: "The option to switch to the legacy toolbar can be accessed after device setup by navigating to Additional Tools and Plugins > Settings > Support > TAK Initial Device Configurations."
    Given Device Setup completed with the default action bar
    When the operator enables Right Side (Legacy) under TAK Initial Device Configurations
    Then preference "my_actionbar_settings" should apply the legacy layout
    And intent "com.atakmap.android.tools.TOGGLE_ACTIONBAR" should move ToolBar
    And ListView of additional tools should still toggle List View and Grid View
