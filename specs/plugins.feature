Feature: TAK Package Management and Other Features
  Source: ATAK Civilian Software User Manual · 28 TAK Package Management · 31 Other Features

  As a TAK operator
  I need to install, load, and sync plug-ins as the Software User Manual describes
  So that an Update Server or Link EUD can provision tools and feedback can be sent

  Background:
    Given the TAK application is running

  Scenario: Open Package Management from Plugins
    # SUM: "To install tools or plug-ins into Android OS and load them, select the Plugins icon from the additional tools and plug-ins menu."
    Given Additional Tools is open
    When the operator selects Plugins
    Then intent "com.atakmap.android.update.VIEW_APP_MGMT" should open ListView of products
    And preference "appsPref" should still group application preferences
    And a CoT type "a-f-G-U-C" self SA event should continue

  Scenario: Load a manually installed plug-in that is Not Loaded
    # SUM: "The status of installed but inactive plug-ins will appear with a status of Not Loaded. Select the checkbox and then Load for the new plug-in to be loaded."
    Given a plug-in APK was installed on the device
    When the operator selects Sync then checks Load
    Then intent "com.atakmap.android.update.SYNC" should refresh the list
    And intent "com.atakmap.app.APP_ADDED" should reflect the loaded plug-in
    And DialogPanel should show STATUS Loaded

  Scenario: Enable Update Server and sync
    # SUM: "To enable Over-the-Air Server product repository, open TAK Package Management > select the Overflow Menu > select Edit, then check the box for Update Server. Update Server URL becomes available (empty by default)."
    Given Update Server is disabled
    When the operator checks Update Server, enters a URL, and selects Sync
    Then intent "com.atakmap.app.DOWNLOAD_APK" should be able to fetch a product
    And intent "com.atakmap.android.update.PRODUCT_REPOS_REFRESHED" should update availability
    And ProgressBar should appear for a manual sync

  Scenario: Link EUD refreshes plug-ins by role
    # SUM: "Using the Link EUD option when ATAK is initially configured, links the user device to an organization's server. The list of available plug-ins will be updated in TAK Package Management, based on the user’s role in the organization."
    Given Device Setup offered Link EUD
    When the operator completes Link EUD
    Then ListView should show organization plug-ins after Sync
    And intent "com.atakmap.android.update.SYNC" should refresh the list
    And preference "locationCallsign" should still identify the local user

  Scenario: Send User Feedback with attachments
    # SUM: "To access the User Feedback Tool, navigate to Additional Tools and Settings > Settings > Support > User Feedback. From the User Feedback dialog, select + and complete the text fields using text entry or the Android speech to text feature accessed by selecting the Microphone on the top row of the QWERTY keyboard."
    Given Support is open
    When the operator completes User Feedback and selects Send
    Then DialogPanel should queue the bug report until a connection is available
    And intent "com.atakmap.android.importexport.EXPORT_LOGS" should attach logs
    And preference "about" should still identify the ATAK version on the Support screen
