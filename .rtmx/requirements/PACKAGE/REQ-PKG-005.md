# REQ-PKG-005: Consolidate @iotactical/tak-data into @iotactical/tak-react

## Description
Merge the unpublished @iotactical/tak-data package into @iotactical/tak-react
as subpath exports. The project distributes a single npm package:
`@iotactical/tak-react`. Data assets (icon registry, doctrine definitions,
schemas) are accessible via subpath imports without pulling React into scope.

## Approach
- Add subpath exports to packages/react/package.json for all data assets:
  - `@iotactical/tak-react/data/icons` -> icon registry JSON
  - `@iotactical/tak-react/data/radial` -> radial action icons JSON
  - `@iotactical/tak-react/data/doctrine` -> doctrine definitions JSON
  - `@iotactical/tak-react/schemas/icons` -> icon registry schema
  - `@iotactical/tak-react/schemas/doctrine` -> doctrine schema
- Update prepublishOnly script to copy data + schemas into dist/
- Remove packages/data/ directory entirely
- Update REQ-SYM-011 and any references from tak-data to tak-react subpath
- Ensure JSON subpath imports do not create a dependency on React
- Update build-and-release workflow to remove tak-data publish step
- Single version, single CHANGELOG, single publish pipeline

## Acceptance Criteria
- [ ] `npm install @iotactical/tak-react` is the only install needed
- [ ] `import icons from '@iotactical/tak-react/data/icons'` resolves correctly
- [ ] `import doctrine from '@iotactical/tak-react/data/doctrine'` resolves correctly
- [ ] Importing data subpaths does not require React as a peer dependency
- [ ] packages/data/ directory is removed from the monorepo
- [ ] CI publishes only @iotactical/tak-react to npm
- [ ] npm pack --dry-run shows data files included in tarball

## Validation
- **Test**: npm pack --dry-run, subpath import test
- **Method**: Package Validation
