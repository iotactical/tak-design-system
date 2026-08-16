Feature: Geofencing
  Source: ATAK Civilian Software User Manual · Drawing Tools · Geofencing

  As a TAK operator
  I need Geo Fence entry and exit alerts as the Software User Manual describes
  So that a shape boundary can monitor TAK Users, Friendly, Hostile, Custom, or All

  Background:
    Given the TAK application is running
    And a drawing shape exists on the map

  Scenario: Add a Geo Fence from the shape radial
    # SUM: "After a shape has been added, the Geo Fence Tool can be accessed either by selecting the [Geo Fence] icon from the menu items or selecting it from the radial."
    Given the operator selects the shape
    When the operator chooses [Geo Fence] on RadialMenu
    Then intent "com.atakmap.android.geofence.ADD" should open the Create Geo Fence window
    And DialogPanel should default Tracking to on
    And the shape CoT type "u-d-c-c" should remain the fence geometry

  Scenario: Configure trigger and monitor set
    # SUM: "Use the Trigger field to define which types of Geo Fence breach to monitor. Choose between Entry, Exit or Both. Use the Monitor field to define which entities the Geo Fence will track. Choose between TAK Users, Friendly, Hostile, Custom or All."
    Given the Create Geo Fence window is open
    When the operator sets Trigger to Entry and Monitor to TAK Users
    And the operator selects [OK]
    Then intent "com.atakmap.android.geofence.EDIT" should persist those parameters
    And preference "alert_audible" should control whether the breach is audible

  Scenario: Alert notification widget lists the breach
    # SUM: "Alerts appear in the lower left on the map interface. Selecting the [Alert Notification] widget will open the alerts menu, detailing the activity monitored in the user defined region."
    Given the fence is Tracking TAK Users
    And the Self-Marker crosses the boundary
    When the breach is detected
    Then intent "com.atakmap.android.geofence.DISPLAY_ALERTING" should show the widget
    And a CoT type "b-a-o-tbl" Geo Fence Breached emergency should not fire unless the operator selected that emergency type

  Scenario: Tracking off keeps the fence but stops alerts
    # SUM: "If the user wishes to keep the Geo Fence, but disable tracking, the user can set the tracking [Enabled] to off in the Edit Window."
    Given an armed fence exists
    When the operator sets Tracking to Off
    Then intent "com.atakmap.android.geofence.EDIT" should disable monitoring
    And no new CoT type "b-a-o-tbl" alerts should appear
    And MapOverlay should still draw the shape
