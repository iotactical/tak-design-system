# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `scripts/publish-npm.sh`, publishing every public workspace package and skipping versions already on the registry
- Shared `useInView` hook, replacing the local copy in MultipointGallery
- `publishConfig.access: public` and a bundled LICENSE on both published packages
- `@iotactical/tak-tokens/wintak` export for the WinTAK token set
- E2E coverage for icon virtualization and 360px responsiveness
- Releasing section in the README covering required secrets and manual publish steps
- MIL-STD-2525 doctrinal definitions data (67 entities with safety constraints, embedding text)
- JSON Schema for doctrine data validation (`schemas/mil-std-2525-doctrine.schema.json`)
- Doctrine CI validation script (`scripts/validate-doctrine.mjs`)
- Mobile-optimized tactical graphics page (single map with search/filter list)
- Subpath exports for data and schemas in `@iotactical/tak-react`
- Comprehensive API documentation (README with prop tables for all 26 components)
- Platform stub directories (Flutter, Swift, WinTAK)
- Sources page on design system site
- Spinner component

### Changed
- Consolidated `@iotactical/tak-data` into `@iotactical/tak-react` (single npm package)
- Typography and Spacing pages moved from inline styles to CSS modules so they can carry breakpoints
- Intent catalog table styling moved into the CSS module; its sticky header is released on mobile, where it would otherwise pin to the scroll wrapper
- Kill Box (Blue) renamed to Kill Box (BKB) per MIL-STD-2525 doctrine
- Disabled pinch-zoom on mobile site

### Fixed
- Sources page linked ATAK-CIV and TAK Server to a personal account that returns 404; both now point at the TAK Product Center repositories
- Both Figma entries on the Sources page shared one community file ID that 404s on mobile browsers; they now point at the separate ATAK and WinTAK files and say they are unofficial
- Test job piped `npm test` through `tee`, so the step took its exit code from `tee` and a failing suite reported green; one test had been failing unnoticed
- `REQ-CI-002` asserted that the newest build artifact had not expired yet, which failed whenever main went untouched longer than the retention window; it now measures the 30-day window the artifact was given
- `REQ-CI-001` shelled out to the `gh` CLI without a skip guard, so it failed anywhere unauthenticated instead of skipping
- Tests badge showed failures that did not exist: the job that generates it lacked `GH_TOKEN` and the `actions: read` scope the CI tests need to reach the workflow API
- npm publishing, which had never produced a package: `@iotactical/tak-tokens` relied on a `prepublish` hook that npm has not run on publish since npm 5, so it would have shipped without any token files
- VS Code extension publish step gated on `platforms/vscode/package.json`, a path that is never generated, so it silently skipped every release
- Release pipeline masked publish failures with `continue-on-error` and `|| echo`, reporting success when a missing `NPM_TOKEN` meant nothing was published
- Icons page mounted all 1,317 drawable previews at once; previews now mount and unmount around the viewport (REQ-SITE-029)
- Typography and Spacing token tables forced horizontal scrolling below 480px (REQ-SITE-030)
- Interfaces intent table squeezed three columns of identifiers into a phone viewport (REQ-SITE-031)
- Icon inspector padding, Skittles label width, and the Platforms copy button on narrow screens (REQ-SITE-032, REQ-SITE-033, REQ-SITE-034)

### Removed
- `packages/data/` directory and its leftover manifest, whose `files` and `exports` pointed at directories that no longer existed (merged into `packages/react`)
- Badge artifact plumbing in the release workflow, which uploaded nothing because `upload-artifact@v4` skips dot-directories; the badges are generated and published by the Pages workflow

## [0.2.0] - 2026-05-15

### Added
- MIL-STD-2525 Explorer with unified Build view and cross-updating SIDCs
- Fuse.js fuzzy search across 4,000+ taxonomy items
- Search UX: deep linking, clickable breadcrumbs, Cmd+K hotkey
- Interactive 3D vehicle model viewer (GLB/GLTF)
- Skittles circles tab with consistent column alignment
- Multipoint tactical graphics renderer (67 control measures)
- Graphics editing: translate, rotate, resize with bounding box
- Persistent graphics log panel
- Geo-transform unit tests with vitest
- Pre-commit checks (lint, type-check)
- 820 ATAK PNG icons
- 9 asset pack inventories

### Fixed
- Rotated scaling distortion
- Auto-commit dropping graphics when switching entities
- Stale vertices on entity switch
- First graphic not appearing in log
- Resize on rotated graphics
- Container and panel overflow issues
- Palette rendering with ZIP iconsets
- Icon previews with static imports and path fallbacks
- Skittle column alignment

## [0.1.0] - 2026-02-17

### Added

- Design token pipeline with Style Dictionary v4 (W3C DTCG format)
- Platform outputs: ATAK (XML + Compose), WinTAK (XAML), Web (CSS), Flutter (Dart), Swift, VS Code theme
- 28 React components with ATAK/WinTAK density variants
- MIL-STD-2525 Explorer with Browse, Decode, Build, and Compare tabs
- Pre-rendered SVG symbols for 2525B/C/D/E across 4 affiliations
- Live mil-sym-ts rendering via Web Worker
- B-to-D crosswalk mappings for version comparison
- Palettes page with ATAK icon palette browser
- Interfaces page with external/internal TAK interface catalog
- Intent catalog with code snippet generation
- GitHub Pages site with dark ATAK theme
- CI/CD pipeline with 962 tests across 158 suites
- Requirements Traceability Matrix (200 requirements, 176 complete)

### Security

- Content Security Policy meta tag (REQ-XW-212)
- Exact version pinning on mil-sym-ts (REQ-XW-211)
- DOMPurify sanitization of mil-sym-ts SVG output (REQ-XW-210)
- Gitignore patterns for secrets and credentials (REQ-XW-214)

### Accessibility

- WCAG AA contrast ratios on all text (REQ-XW-220)
- prefers-reduced-motion support (REQ-XW-221)
- Visible focus indicators on interactive elements (REQ-XW-222)
- ARIA tab roles on all tab bar components (REQ-XW-223)
- aria-live regions for dynamic search counts (REQ-XW-224)
- Meaningful alt text on military symbol images (REQ-XW-225)
- Skip-to-main-content link (REQ-XW-226)

[Unreleased]: https://github.com/iotactical/tak-design-system/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/iotactical/tak-design-system/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/iotactical/tak-design-system/releases/tag/v0.1.0
