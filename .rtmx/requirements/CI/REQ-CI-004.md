# REQ-CI-004: Repository Dispatch to DBSDK

## Description
On release, a repository_dispatch event must be sent to iotactical/defense-builders-sdk.

## Acceptance Criteria
- [ ] design-system-update event type dispatched
- [ ] Version included in event payload
- [ ] Target repository is iotactical/defense-builders-sdk

## Validation
- **Test**: tests/ci/test_dispatch.mjs::test_dispatch_sent
- **Method**: Integration Test
