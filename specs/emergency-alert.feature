Feature: Emergency Beacon
  Source: ATAK Civilian Software User Manual · Emergency Beacon

  As a TAK operator
  I need Alert, Ring the Bell, Geo Fence Breached, and In Contact as the Software User Manual describes
  So that a beacon continues even if the device is turned off until the switches are toggled off

  Background:
    Given the TAK application is running
    And the operator is connected to a TAK Server
    And preference "locationCallsign" is "SELF-01"

  Scenario: Activate an Alert from the Emergency Beacon Tool
    # SUM: "The type of emergency can be selected from the drop-down menu, before activation, and includes options for an Alert, Ring the Bell, Geo Fence Breached or In Contact."
    Given the operator selects the [Emergency Beacon] icon
    When the operator chooses Alert and enables both switches
    Then intent "com.atakmap.android.emergency.ALERT_EVENT" should fire
    And a CoT type "b-a-o-tbl" event should be broadcast
    And SkittleMarker should show the emergency state
    And preference "alert_audible" should control local sound

  Scenario: Cancel the beacon by toggling the switches off
    # SUM: "The beacon will be canceled and removed when the user returns to the Emergency Beacon tool and toggles the switches off."
    Given an Alert is active
    When the operator toggles both switches off
    Then intent "com.atakmap.android.emergency.CANCEL_EVENT" should fire
    And a CoT type "b-a-o-can" cancel should be transmitted
    And connection widget ConnectionStatus should remain Connected

  Scenario: SMS numbers when configured
    # SUM: "If the SMS for Emergency option has been configured, the alert will be sent via text message to the configured numbers."
    Given preference "sms_numbers" lists a destination
    When the operator activates Alert
    Then intent "com.atakmap.android.emergency.ALERT_EVENT" should still send CoT type "b-a-o-tbl"
    And preference "alert_vibration" should vibrate if enabled

  Scenario: Remote emergency appears as an Alert in Overlay Manager
    # SUM: "Once the Emergency type has been selected and both switches have been enabled, the TAK Server broadcasts the announcements to all network contacts."
    Given a CoT type "b-a-o-tbl" event arrives from "BLUE-02"
    When the event is processed
    Then intent "com.atakmap.android.emergency.ALERT_EVENT" should display for that contact
    And UserList should flag "BLUE-02"
    And Overlay Manager should list the alert under Alerts
