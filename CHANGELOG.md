# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-12

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
