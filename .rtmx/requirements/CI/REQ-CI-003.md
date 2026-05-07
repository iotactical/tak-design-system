# REQ-CI-003: GitHub Release Creation

## Description
GitHub Release must be created with version tag and tarball on main push.

## Acceptance Criteria
- [ ] Release created with semantic version tag
- [ ] Tarball attached to release
- [ ] Auto-generated release notes included

## Validation
- **Test**: tests/ci/test_release.mjs::test_release_created
- **Method**: Integration Test
