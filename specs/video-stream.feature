Feature: Video Player
  Source: ATAK Civilian Software User Manual · Video Player

  As a TAK operator
  I need video aliases, TAK Server download, snapshots, and KLV SPI as the Software User Manual describes
  So that UDP, RTSP, RTMP, and related streams play from the COP

  Background:
    Given the TAK application is running
    And the operator selects the [Video Player] icon

  Scenario: Play a listed video alias
    # SUM: "Select the desired listed video alias or file name to begin playing the stored or streaming video. The video will display half the width of the screen."
    Given an alias "UAV-01" is listed
    When the operator selects "UAV-01"
    Then intent "com.atakmap.android.video.VIDEO_TOOL" should open the player
    And DockPane should occupy half the screen width
    And a CoT type "b-m-p-s-p-loc" SPI should appear only if KLV metadata is present

  Scenario: Add a video alias
    # SUM: "To add a video alias, select the [+] button at the top of the Video Player screen. Enter the necessary information for the selected stream type: Stream Type (UDP, RTSP, RTMP, RTMPS, TCP, RTP, HTTP, HTTPS, RAW) along with the necessary streaming information including, IP address..."
    Given the operator selects [+]
    When the operator enters stream type RTSP, address, port, and alias name
    Then intent "com.atakmap.maps.video.ADD_ALIAS" should save the alias
    And ListView should include the new name
    And preference "video_dropdown_hidden_disconnect" should disconnect on hide only if enabled

  Scenario: Download an alias from TAK Server
    # SUM: "To download a video alias from a TAK Server, select the [Download] icon at the top of the Video Player screen, select the TAK Server."
    Given TAK Server hosts aliases
    When the operator downloads one
    Then intent "com.atakmap.maps.video.DISPLAY" should be able to play it
    And ConnectionStatus should remain Connected

  Scenario: Unreachable stream
    # SUM: "To close the video player, select the [X] located at the bottom right corner of the video player or select the [Back] button."
    Given the selected alias host is unreachable
    When playback is attempted
    Then DialogPanel should report that the stream could not be opened
    And intent "com.atakmap.android.video.VIDEO_TOOL" should not spin without feedback
    And the associated CoT type "a-f-G-U-C" map marker should remain
