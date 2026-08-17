Feature: Overview, Device Setup, 3D, and First Person
  Source: ATAK Civilian Software User Manual · 1 Overview · Compass Interactions

  As a TAK operator
  I need first-run encryption, 3D terrain, imported models, and First-Person as the Software User Manual describes
  So that the map can be used after Clear Content and viewed at ground level

  Background:
    Given the TAK application is running

  Scenario: Supply an encryption passphrase after first launch
    # SUM: "The first time ATAK is opened, or after a Clear Content, a passphrase is auto generated to activate data encryption. The user can supply their own passphrase by using Settings > Callsign and Device Preferences > Encryption Password > Change Encryption Passphrase."
    Given ATAK has just been opened after a Clear Content
    When the operator sets preference "encryptionPassphrase" from Callsign and Device Preferences
    Then DialogPanel should confirm the new passphrase
    And a CoT type "a-f-G-U-C" self SA event should remain encrypted on the mesh
    And intent "com.atakmap.app.preferences.CERTIFICATE_UPDATED" should not be required to change the passphrase

  Scenario: Enable 3D view from the North Arrow
    # SUM: "To enable 3D view, long press on the North Arrow to call out the additional controls menu and select 3D."
    Given Elevation Data such as DTED is installed
    When the operator long-presses the North Arrow and selects 3D
    Then intent "com.atakmap.android.maps.TOGGLE_3D" should tilt MapOverlay
    And intent "com.atakmap.android.maps.LOCK_TILT" should retain the angle when 3D Lock is selected
    And preference "prefs_dted_visible" should keep the elevation overlay available

  Scenario: Import a 3D model and see it after zoom
    # SUM: "Once imported, a 3D Model icon will appear on the map. Zoom into the area of the icon until a loading ring appears. After the loading process has finished, the 3D model will be projected onto the map."
    Given the operator imported an OBJ via Import Manager
    When the operator zooms until the loading ring finishes
    Then intent "com.atakmap.android.model.SHOW_DETAILS" should expose model metadata
    And MapOverlay should project the model
    And a CoT type "b-m-p-s-p-loc" waypoint should not be created for the model file itself

  Scenario: First-Person view from a map tap
    # SUM: "To enable the First-Person View perspective, select the First-Person View button and then tap the desired location on the map."
    Given the operator opened First-Person from Additional Tools
    When the operator selects First-Person View and taps a location
    Then intent "com.atakmap.android.map.action.LOCK_CAM" should hold that camera
    And ToolBar should show the First-Person controls
    And intent "com.atakmap.android.maps.TOGGLE_3D" should not be required to look toward the horizon

  Scenario: Accept EULA and complete Device Setup
    # SUM: "Following this step, the End User License Agreement (EULA) must be accepted. Next, a prompt will appear to allow ATAK to have access to several areas of the device such as its location, pictures, videos, SMS, etc. A prompt will appear with a TAK Device Setup screen to allow further configuration of ATAK."
    Given ATAK is on first launch after encryption is set
    When the operator accepts the EULA and finishes Device Setup
    Then DialogPanel should not block the map
    And intent "com.atakmap.app.COMPONENTS_CREATED" should have registered Settings
    And preference "locationCallsign" should be editable later

  Scenario: Magnifier, pinch zoom, and Map Scale
    # SUM: "Select the Magnifier icons to zoom in or out on the map. The map can also be zoomed by using two fingers on the screen to pinch and spread the map. The Map Scale displays a 1 inch to X mi/km reference on the map."
    Given the map view is displayed
    When the operator pinches the map and checks the scale
    Then MapOverlay should change zoom
    And preference "map_scale_visible" should keep the Map Scale widget on screen
    And CoordinateDisplay should still show the Self-Marker coordinate

  Scenario: Overlay Manager shows WinTAK 3D model metadata
    # SUM: "When ATAK receives a 3D model that has been edited by WinTAK, Overlay Manager displays the metadata associated with the model. Metadata includes information such as the Callsign of the user who performed the editing, terrain model employed, etc."
    Given a 3D model edited in WinTAK is on the map
    When the operator opens that model in Overlay Manager
    Then MarkerDetail should show editor callsign and terrain model
    And intent "com.atakmap.android.model.SHOW_DETAILS" should supply the metadata
    And preference "locationCallsign" of the editor should be visible in ListView
