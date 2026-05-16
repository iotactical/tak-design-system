# REQ-SYM-011: Doctrine Data Package Export

## Description
Doctrine data files are accessible via subpath exports from the consolidated
@iotactical/tak-react npm package (per REQ-PKG-005). Consumers can import
doctrine definitions and schema directly without manual file copying.

## Approach
- Add subpath exports to packages/react/package.json for doctrine paths
- Copy doctrine files in prepublishOnly script to dist/data/doctrine/
- Add schema export at @iotactical/tak-react/schemas/doctrine
- Add control measures export at @iotactical/tak-react/data/doctrine
- Verify files included via npm pack --dry-run

## Acceptance Criteria
- [ ] `@iotactical/tak-react/data/doctrine` resolves to ss25-control-measures.json
- [ ] `@iotactical/tak-react/schemas/doctrine` resolves to doctrine schema
- [ ] npm pack includes all doctrine files in tarball
- [ ] Importing data subpaths does not require React peer dependency
- [ ] No breaking changes to existing component exports

## Validation
- **Test**: npm pack --dry-run
- **Method**: Package Validation
