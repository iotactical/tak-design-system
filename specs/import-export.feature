Feature: Import Manager
  Source: ATAK Civilian Software User Manual · Import Manager

  As a TAK operator
  I need Local SD, KML Link, and HTTP URL import as the Software User Manual describes
  So that imagery, overlays, and packages land in Maps, Overlay Manager, or Data Package Tool

  Background:
    Given the TAK application is running
    And the operator selects the [Import Manager] icon

  Scenario: Import from Local SD
    # SUM: "Select [LOCAL SD] to import from a folder residing on the internal or external SD card. Various types of files can be imported via Import Manager including: ATAK configuration, ATAK Data package zip files, DTED, imagery and overlay files."
    Given the operator chooses Local SD
    When the operator selects a KML overlay
    Then intent "com.atakmap.android.importexport.IMPORT_DATA" should ingest the file
    And intent "com.atakmap.android.importfiles.IMPORT_FILE" should classify it as overlay
    And MapOverlay should list it under Overlay Manager
    And CoT type "a-f-G-U-C" markers from KML placemarks should appear

  Scenario: Import a KML network link
    # SUM: "Select [KML Link] to import a KML file via the network using HTTP or tap [HTTP URL] to import other file types via the network using HTTP."
    Given the operator chooses KML Link
    When the operator enters a URL and refresh interval
    Then intent "com.atakmap.android.importfiles.KML_NETWORK_LINK" should save the remote resource
    And Overlay Manager should list it under Remote Resources
    And preference "overlayStylePreference" should apply default overlay style
    And a CoT type "u-d-f" overlay geometry should render when downloaded

  Scenario: Export selected items as CoT
    # SUM: "The user can export an existing overlay to a file or directly to additional users... by pressing the [Multi-Select Action] icon, choosing a file format, and then selecting each category of overlays that should be included in the export file."
    Given the operator has selected 3 markers
    When the operator exports a file
    Then intent "com.atakmap.android.importfiles.IMPORT_COT" should accept a round-trip of those events
    And each event should keep CoT type "a-n-G-U-C" when Neutral was chosen
    And MarkerDetail should still list each exported uid

  Scenario: Reject malformed KML
    # SUM: "Some file extensions, like ZIP or GPX files for example, may result in a prompt for the user to select which import method to use."
    Given file "broken.kml" is not well-formed
    When the operator imports it from Local SD
    Then intent "com.atakmap.android.importexport.IMPORT_DATA" should fail
    And DialogPanel should report the failure
    And the map CoT type "a-f-G-U-C" self marker should be unchanged
