# REQ-SITE-018: Consolidate mil-sym worker to single renderer package

## Description
The site bundles two separate mil-sym packages: `mil-sym-ts` (6.9 MB, used by
milsym-worker for single-point SVG) and `mil-sym-ts-web` (6.9 MB, used by
multipoint-worker for GeoJSON). Both are loaded in web workers. `mil-sym-ts-web`
is a superset that includes single-point rendering via `MilStdIconRenderer`.
Consolidate both workers to use `mil-sym-ts-web` only, eliminating one 6.9 MB
download entirely.

## Acceptance Criteria
- [ ] milsym-worker.ts imports from `@armyc2.c5isr.renderer/mil-sym-ts-web`
- [ ] Build output contains zero chunks for `mil-sym-ts` (only `mil-sym-ts-web`)
- [ ] Single-point SVG rendering still works on Explorer and Icons pages
- [ ] Total site JS payload decreases by at least 5 MB

## Validation
- **Test**: Build output audit -- only one C5Ren chunk exists
- **Method**: Build Validation + Unit Test
