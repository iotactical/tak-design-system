Feature: Connection Widget, Mesh Encryption, and TAK Package Management
  Source: ATAK Civilian Software User Manual · ATAK Civilian Overview · Encrypted Mesh Communications · TAK Package Management

  As a TAK operator
  I need the connection widget, AES-256 mesh keys, and TAK Package Mgmt as the Software User Manual describes
  So that server, mesh, and plug-in lifecycle match ATAK Settings paths

  Background:
    Given the TAK application is running
    And the operator has a client certificate

  Scenario: Display Connection Widget
    # SUM: "The optional connection widget indicates whether or not the user is connected to a TAK Server. ... Toggle this display on at Settings > Network Connections > Network Connections > Display Connection Widget."
    Given preference "displayServerConnectionWidget" is true
    When the operator connects to a TAK Server
    Then ConnectionStatus should show Connected
    And a CoT type "a-f-G-U-C" SA event should begin broadcasting
    And preference "monitorServerConnections" should control monitoring

  Scenario: Mesh AES-256 from Network Connection Preferences
    # SUM: "To configure encryption, navigate to Settings > Network Preferences > Network Connection Preferences > Configure AES-256 Mesh Encryption."
    Given preference "enableNonStreamingConnections" is true
    When the operator Generates a Key
    Then preference "configureNonStreamingEncryption" should store that key
    And CoT type "b-t-f" chat on the mesh should use that key once loaded
    And DialogPanel should offer Generate Key, Load Key, and Forget Key

  Scenario: Encrypted mesh cannot talk to unencrypted peers
    # SUM: "Encrypted devices cannot communicate on the mesh network with non-encrypted devices and vice versa."
    Given mesh encryption is enabled
    When an unencrypted peer is discovered
    Then SA CoT type "a-f-G-U-C" from that peer should not be accepted
    And ConnectionStatus should not imply a TAK Server session for that peer
    And intent "com.atakmap.android.contact.REFRESH_LIST" should omit them as plaintext mesh contacts

  Scenario: TAK Package Management for plug-ins
    # SUM: "To install tools or plug-ins into Android OS and load them, select Settings > Tool Preferences > TAK Package Mgmt."
    Given the operator opens TAK Package Mgmt
    When a plug-in is installed and Sync completes
    Then preference "appsPref" should list the product
    And ToolBar should show the plug-in when the toolbar manager includes it
    And ConnectionStatus should not drop the TAK Server link

  Scenario: Reconnect after interrupt
    # SUM: "The optional connection widget indicates whether or not the user is connected to a TAK Server."
    Given the operator is Connected
    When the network is interrupted
    Then ConnectionStatus should show Disconnected
    And queued CoT type "a-f-G-U-C" events should send after restore
    And preference "displayServerConnectionWidget" should stay visible in red until Connected

  Scenario: Inactive plug-in status
    # SUM: "Note: The status of installed but inactive plug-ins will appear as STATUS: Not Loaded."
    Given an installed plug-in is incompatible
    When TAK Package Mgmt refreshes
    Then ListView should show STATUS: Not Loaded
    And intent "com.atakmap.app.COMPONENTS_CREATED" should not register that plug-in
