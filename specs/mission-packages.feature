Feature: Data Package Tool
  Source: ATAK Civilian Software User Manual · Data Package Tool

  As a TAK operator
  I need to build, send, download, and log mission packages as the Software User Manual describes
  So that a team shares the same markers, routes, and files

  Background:
    Given the TAK application is running
    And the operator selects the [Data Package Tool] icon

  Scenario: Create a package from Map Select, File Select, or Overlays
    # SUM: "Choose the selection method; Map Select, File Select or Overlays to add items to the Data Package."
    Given the operator selects the [+] icon
    When the operator Map Selects 2 markers and 1 route
    And the operator confirms a new package named "exfil-plan"
    Then intent "com.atakmap.android.missionpackage.MISSIONPACKAGE_MAPSELECT" should collect those items
    And intent "com.atakmap.android.missionpackage.MISSIONPACKAGE_SAVE" should write the zip
    And CoT type "a-f-G-U-C" events in the package should round-trip
    And ListView should show "exfil-plan"

  Scenario: Send is blocked when the package exceeds the size threshold
    # SUM: "If the package size is larger the value set in preferences, the size shown in the package list will be changed to red and will not be allowed to be sent."
    Given package "exfil-plan" is larger than preference "filesharingSizeThresholdNoGo"
    When the operator selects [Send]
    Then intent "com.atakmap.android.missionpackage.MISSIONPACKAGE_SEND" should not transmit
    And DialogPanel should show the size in red
    And MapOverlay visibility of package contents should be unchanged

  Scenario: Download a package from TAK Server
    # SUM: "Select the [Download] icon to access an existing Data Package from a TAK Server."
    Given TAK Server hosts package UID "mp-001"
    When the operator selects [Download]
    Then intent "com.atakmap.android.missionpackage.MISSIONPACKAGE_DOWNLOAD" should fetch UID "mp-001"
    And intent "com.atakmap.android.missionpackage.MISSIONPACKAGE_QUERY" should list server packages
    And CoT type "a-f-G-U-C" events in the zip should appear on the map

  Scenario: Transfer log of imported and exported packages
    # SUM: "Select the [Transfer Log] icon on the Data Package Tool menu to view the file transfer log of imported and exported data packages."
    Given a download has completed
    When the operator opens the Transfer Log
    Then intent "com.atakmap.android.missionpackage.MISSIONPACKAGE_LOG" should show the transfer
    And preference "missionpackagePreference" should apply Data Package Control Preferences
    And DockPane should list the log entries
