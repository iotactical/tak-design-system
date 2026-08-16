Feature: Quick Pic and Gallery
  Source: ATAK Civilian Software User Manual · Quick Pic

  As a TAK operator
  I need Quick Pic camera capture and Gallery attachments as the Software User Manual describes
  So that a still image is attached to a camera marker at my location

  Background:
    Given the TAK application is running
    And GPS is reporting a valid fix

  Scenario: Save a Quick Pic to a camera marker
    # SUM: "Select the [Quick Pic] icon to access the Android device's camera or another camera application. After taking a picture, the user may discard a picture or save it. Saving the picture opens a map view with a camera icon present at the user's location and attaches the image to the camera marker."
    Given the operator selects the [Quick Pic] icon
    When the camera captures an image and the operator saves it
    Then intent "com.atakmap.android.image.quickpic.QUICK_PIC_CAPTURED" should attach the JPEG
    And TakIcon should show a camera marker at the Self-Marker location
    And a CoT type "b-f-t-p" event should include the attachment link
    And MarkerDetail should show the paperclip thumbnail

  Scenario: Quick Pic radial image view
    # SUM: "Select the Quick Pic marker to activate its radial. Options include Delete, R&B Line, image view and Details. Selecting image view allows the user to view the image along with the marker and the approximate field of view of the still image."
    Given a Quick Pic marker exists
    When the operator chooses image view on RadialMenu
    Then intent "com.atakmap.android.image.quickpic.QUICK_PIC_VIEW" should show the still and FOV
    And RangeBearing should be available from the R&B Line radial option

  Scenario: Gallery lists marker attachments
    # SUM: "The integrated Gallery Tool allows the user to view media attachments. The marker attachments are shown on the right side of the screen."
    Given a marker has an attached image
    When the operator opens Gallery
    Then intent "com.atakmap.android.attachment.GALLERY" should list the thumbnail
    And DockPane should show the attachment on the right
    And preference "relativeOverlaysScalingRadioList" should scale overlay billboards

  Scenario: Reject an unsupported attachment type
    # SUM: "File attachments, including images, can be associated with the object by selecting the [Paperclip] icon."
    Given the operator selects an executable file
    When the operator attempts to attach it from MarkerDetail
    Then intent "com.atakmap.android.attachment.SEND_ATTACHMENT" should not send
    And DialogPanel should report an unsupported type
    And no CoT type "b-f-t-p" attachment should be added
