Feature: Bloodhound Tool
  Source: ATAK Civilian Software User Manual · Bloodhound Tool

  As a TAK operator
  I need From/To bloodhound tracking as the Software User Manual describes
  So that range, bearing, and ETA flash at the configured thresholds

  Background:
    Given the TAK application is running
    And GPS is reporting a valid fix

  Scenario: Start Bloodhound from the toolbar
    # SUM: "Select the [Bloodhound] icon to open the Bloodhound Tool. A window will open, prompting the user to choose where to start by tapping the [From Reticle] (default = user's self marker) and where to bloodhound (track) to by tapping the [To Reticle]."
    Given the operator selects the [Bloodhound] icon
    When the operator leaves From as the Self-Marker and picks a To marker
    And the operator selects [OK]
    Then intent "com.atakmap.android.toolbars.BLOOD_HOUND" should activate tracking
    And RangeBearing should show range and ETA in the lower-left widget
    And a CoT type "u-rb-a" pairing line should draw from tracker to target

  Scenario: ETA flash colors follow Bloodhound Preferences
    # SUM: "The green line showing the direct path from the tracker to the target will flash when the user-defined ETA outer threshold is reached (default = 6 minutes from target)."
    Given bloodhound is active
    When ETA crosses preference "bloodhound_outer_eta"
    Then preference "rab_bloodhound_flash_colors" should flash the line
    And preference "bloodhound_inner_eta" and preference "bloodhound_flash_eta" should apply later thresholds
    And RangeBearing should keep updating as either endpoint moves

  Scenario: Multiple bloodhounds from an R&B Line radial
    # SUM: "To create multiple bloodhounds, selecting the Range and Bearing Tool and select the [R&B Line] icon. Select two markers on the map and once the R&B line is created, select the line to bring up the radial. Select the [Bloodhound] radial, and the bloodhound information will be displayed on the R&B Line itself."
    Given a CoT type "u-rb-a" line exists between two markers
    When the operator selects [Bloodhound] on that RadialMenu
    Then intent "com.atakmap.android.toolbars.BLOOD_HOUND" should attach ETA to that line
    And preference "rab_bloodhound_display_textwidget" should control the text widget

  Scenario: Bloodhound without a GPS fix
    # SUM: "Disengage the Bloodhound Tool by selecting the [Bloodhound] icon on the toolbar."
    Given GPS reports no fix
    When the operator selects the [Bloodhound] icon
    Then intent "com.atakmap.android.toolbars.BLOOD_HOUND" should not start a from-self track
    And GPSStatus should display no fix
    And preference "rab_bloodhound_zoom" should not auto-zoom
