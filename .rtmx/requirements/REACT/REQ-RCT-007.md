# REQ-RCT-007: React Library Build

## Description
React library must build ESM and CJS bundles with TypeScript declarations.

## Acceptance Criteria
- [ ] dist/tak-react.js (ESM) exists after build
- [ ] dist/tak-react.cjs (CJS) exists after build
- [ ] dist/index.d.ts (types) exists after build
- [ ] dist/style.css (styles) exists after build
- [ ] npm run build:react exits with code 0

## Validation
- **Test**: tests/react/test_react_build.mjs::test_react_dist
- **Method**: Integration Test
