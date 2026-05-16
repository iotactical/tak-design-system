# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
- Kill Box (Blue) renamed to Kill Box (BKB) per MIL-STD-2525 doctrine
- Disabled pinch-zoom on mobile site

### Removed
- `packages/data/` directory (merged into `packages/react`)

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
