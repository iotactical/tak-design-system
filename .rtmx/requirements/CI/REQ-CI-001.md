# REQ-CI-001: CI Pipeline Green

## Description
GitHub Actions pipeline must validate, build, and release on push to main.

## Acceptance Criteria
- [ ] Validate job runs token validation
- [ ] Build job runs all platform builds
- [ ] Build job verifies output files exist
- [ ] Release job creates GitHub Release on main push
- [ ] Pipeline triggers on push to main and pull requests

## Validation
- **Test**: tests/ci/test_pipeline.mjs::test_ci_green
- **Method**: Integration Test
