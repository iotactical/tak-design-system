# REQ-CI-002: Build Artifact Upload

## Description
Build artifacts must be uploaded to GitHub Actions with 30-day retention.

## Acceptance Criteria
- [ ] Tarball artifact uploaded after successful build
- [ ] Retention period is 30 days

## Validation
- **Test**: tests/ci/test_artifacts.mjs::test_artifacts_uploaded
- **Method**: Integration Test
