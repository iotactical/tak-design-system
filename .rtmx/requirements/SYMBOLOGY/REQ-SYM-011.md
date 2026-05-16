# REQ-SYM-011: @iotactical/tak-data Doctrine Export

## Description
Add doctrine data files to the @iotactical/tak-data npm package exports.
Consumers can import doctrine definitions and schema directly from the
published package without manual file copying.

## Approach
- Add conditional exports to packages/data/package.json for doctrine paths
- Copy doctrine files in prepublish script to dist/doctrine/
- Add schema export at @iotactical/tak-data/schemas/doctrine
- Add control measures export at @iotactical/tak-data/doctrine/control-measures
- Verify files included via npm pack --dry-run

## Acceptance Criteria
- [ ] `@iotactical/tak-data/doctrine/control-measures` resolves to ss25-control-measures.json
- [ ] `@iotactical/tak-data/schemas/doctrine` resolves to mil-std-2525-doctrine.schema.json
- [ ] npm pack includes all doctrine files in tarball
- [ ] Package exports work in both ESM and CJS consumers
- [ ] No breaking changes to existing package exports

## Validation
- **Test**: npm pack --dry-run
- **Method**: Package Validation
