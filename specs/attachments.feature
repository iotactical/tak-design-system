Feature: Attachments and Quick Pic
  As a TAK operator
  I need to attach images and files to map items
  So that teammates can see photos and documents with a marker

  Background:
    Given the TAK application is running
    And a marker "RP BRAVO" exists on the map
    And the operator has camera and storage permission

  Scenario: Attach a photo from Quick Pic
    Given the operator selects marker "RP BRAVO"
    When the operator chooses Quick Pic
    And the camera captures an image
    Then the image should be attached to "RP BRAVO"
    And MarkerDetail should show an attachment thumbnail
    And a CoT detail link to the attachment should be created

  Scenario: Attach an existing file
    Given a local file "sector-brief.pdf" exists
    When the operator attaches "sector-brief.pdf" to "RP BRAVO"
    Then MarkerDetail should list "sector-brief.pdf"
    And the file should be available for mission-package export

  Scenario: Transfer an attachment over TAK Server
    Given marker "RP BRAVO" has an attached image
    And the operator is connected to a TAK Server
    When the operator shares the marker with attachments
    Then the attachment should be offered to the server
    And receiving clients should be able to download it

  Scenario: Reject an unsupported attachment type
    Given the operator selects an executable file "payload.bin"
    When the operator attempts to attach it to "RP BRAVO"
    Then the attachment should be rejected
    And the operator should see "Unsupported file type"
    And MarkerDetail should list no new attachment
