Feature: Radio Controls
  Source: ATAK Civilian Software User Manual · 10 Radio Controls

  As a TAK operator
  I need PRC-152 and ISRV Rover controls as the Software User Manual describes
  So that point-to-point radio SA and video downlink can be started from the Radio icon

  Background:
    Given the TAK application is running
    And the operator selects the Radio icon on ToolBar

  Scenario: Open Radio Controls for supported radios
    # SUM: "Select the Radio icon to access controls for the currently supported ATAK radios."
    Given Radio Controls is closed
    When the operator selects the Radio icon
    Then intent "com.atakmap.radiocontrol.RADIO_CONTROL" should open DockPane
    And DialogPanel should state whether the PRC-152-A device is supported
    And a CoT type "a-f-G-U-C" self SA event should continue

  Scenario: Connect a PRC-152 after cable configuration
    # SUM: "Slide the OFF button to ON in the PRC-152 section to begin connecting. Once a connection is established, point-to-point protocol communication is available and is indicated on the Radio Controls menu."
    Given a cable configuration was accepted with OK
    When the operator slides PRC-152 from OFF to ON
    Then intent "com.atakmap.pppd" should start point-to-point protocol
    And ConnectionStatus should show the radio connected
    And other radios on the network should appear as CoT type "a-f-G-U-C" after squelch

  Scenario: Connect ISRV Rover over Ethernet
    # SUM: "Slide the OFF button to ON in the ISRV (Rover) section to begin connecting through an Ethernet connection. ATAK scans through frequencies to establish an active feed. When the connection is established, the antenna icon will turn from gray to green and will indicate that it is connected."
    Given Ethernet is available to the Rover
    When the operator slides ISRV Rover from OFF to ON
    Then intent "com.atakmap.radiocontrol.RADIO_CONTROL" should scan frequencies
    And ConnectionStatus should show a green antenna when connected
    And preference "video_dropdown_hidden_disconnect" should hide the video dropdown if the feed drops

  Scenario: Watch Rover video after connect
    # SUM: "Select the Watch icon to view a video stream."
    Given Rover reports connected
    When the operator selects Watch
    Then DockPane should play the Rover stream
    And preference "spiUpdateDelay" should not be required to watch video
    And a CoT type "b-m-p-s-p-i" SPI should not be created for the stream itself
