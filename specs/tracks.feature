Feature: Track History
  Source: ATAK Civilian Software User Manual · Track History

  As a TAK operator
  I need breadcrumbs, Track Search, and export as the Software User Manual describes
  So that tracks can go to a TAK Server, a route, or KML, KMZ, GPX, or CSV

  Background:
    Given the TAK application is running
    And GPS is reporting a valid fix

  Scenario: Start a new track from Track History
    # SUM: "Initiate a new track by selecting the [Add Track] icon. Accept or edit the default track name and select the [OK] button to begin the new track. User location data is recorded as breadcrumbs in a new track file."
    Given the operator selects the [Track History] icon
    When the operator selects [Add Track] and accepts the name from preference "track_prefix"
    Then intent "com.atakmap.android.bread.TOGGLE_BREAD" should start recording
    And MapOverlay should draw breadcrumbs using preference "track_crumb_size"
    And a CoT type "a-f-G-U-C" self position should seed vertices

  Scenario: Search tracks locally or on a TAK Server
    # SUM: "Select the [Track Search] icon to access the function. Specify callsign and time frame, check the box for Server Search (if desired), then select [Search]."
    Given tracks are stored locally
    When the operator searches by callsign
    Then intent "com.atakmap.android.track.TRACK_SEARCH" should list matches
    And ListView should allow sort by Track Name or Start Time

  Scenario: Clear tracks from the toolbar
    # SUM: "When viewing the track list, the Track History Toolbar will appear at the top of the screen. The options include [Add a Track], [Multi-select], [Track Search], [Clear Tracks] and [Exit]."
    Given a self track with vertices exists
    When the operator chooses [Clear Tracks]
    Then intent "com.atakmap.android.track.CLEAR_TRACKS" should remove polylines
    And SkittleMarker should remain
    And preference "toggle_log_tracks" should still allow logging to be re-enabled

  Scenario: No new crumbs without a GPS position
    # SUM: "A GPS position must be established before tracking can begin."
    Given preference "toggle_log_tracks" is true
    When GPS reports no fix beyond the stale threshold
    Then intent "com.atakmap.android.bread.CREATE_TRACK_SEGMENT" should not append invalid vertices
    And GPSStatus should display no fix
    And preference "bread_dist_threshold" should not be applied to a null position
