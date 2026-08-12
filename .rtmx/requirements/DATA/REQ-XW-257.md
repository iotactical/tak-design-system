# REQ-XW-257: Icon registry data distributed as an npm package

## Description
The icon registry, radial menu definitions, and their JSON Schemas must be
consumable from npm without cloning the repository. Originally scoped as a
standalone `@iotactical/tak-data` workspace; superseded by REQ-PKG-005, which
consolidated the data assets into `@iotactical/tak-react` subpath exports so the
project ships a single npm package.

## Approach
- Data assets live at repository root in `data/` and `schemas/`
- `packages/react/package.json` exposes them under `./data/*` and `./schemas/*`
- The `copy-data` script stages them into `dist/` from `prepublishOnly`
- `packages/data/` is removed so an empty package can never be published

## Acceptance Criteria
- [x] `packages/data/` contains no publishable package.json
- [x] Icon registry and index reachable via `@iotactical/tak-react/data/icons`
- [x] Radial menus and index reachable via `@iotactical/tak-react/data/radial`
- [x] Every exported data path has a matching source file in `data/`
- [x] `copy-data` stages all four registry/index files into `dist/data/`

## Validation
- **Test**: tests/icons/test_npm_data.mjs
- **Method**: Unit Test
