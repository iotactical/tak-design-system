# REQ-PKG-007: CHANGELOG and Versioning

## Description
Maintain a CHANGELOG.md in the repository root following Keep a Changelog
format. Each release version documents added, changed, deprecated, removed,
fixed, and security changes. The CHANGELOG is included in the published npm
package so consumers can review changes before upgrading.

## Approach
- Create CHANGELOG.md at repository root following keepachangelog.com format
- Backfill entries for v0.1.0 and v0.2.0 from git history
- Add CHANGELOG.md to packages/react files array for npm inclusion
- Document versioning policy: semver, with pre-1.0 minor bumps for breaking
- CI check: tagged releases must have a CHANGELOG entry for that version

## Acceptance Criteria
- [ ] CHANGELOG.md exists at repository root
- [ ] Entries for v0.1.0 and v0.2.0 backfilled from commit history
- [ ] Follows Keep a Changelog format (Added/Changed/Fixed sections)
- [ ] Included in npm package tarball
- [ ] New releases require corresponding CHANGELOG entry

## Validation
- **Test**: grep for version string in CHANGELOG.md during release job
- **Method**: CI Validation
